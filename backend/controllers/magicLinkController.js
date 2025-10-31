// Magic Link Authentication Controller
const { query } = require('../db/connection');
const { generateToken } = require('../utils/jwt');
const { sendMagicLinkEmail, generateMagicToken } = require('../utils/email');

/**
 * Request a magic link
 * POST /api/auth/magic-link/request
 * Body: { email }
 */
async function requestMagicLink(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user by email
    const userResult = await query(
      'SELECT id, email, first_name, account_status FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Always return success (don't reveal if email exists)
    if (userResult.rows.length === 0) {
      console.log(`Magic link requested for non-existent email: ${email}`);
      return res.json({
        success: true,
        message: 'If an account exists with that email, a magic link has been sent.'
      });
    }

    const user = userResult.rows[0];

    // Check account status
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended or banned'
      });
    }

    // Generate magic token
    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    await query(
      `INSERT INTO magic_links (user_id, token, expires_at, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [user.id, token, expiresAt, req.ip || req.connection.remoteAddress]
    );

    // Build magic link URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/auth/magic-link/${token}`;

    // Send email (for now, just logs to console)
    await sendMagicLinkEmail(user.email, magicLink);

    // Log to audit
    await query(
      `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        user.id,
        'magic_link_requested',
        JSON.stringify({ email: user.email }),
        req.ip || req.connection.remoteAddress
      ]
    );

    res.json({
      success: true,
      message: 'If an account exists with that email, a magic link has been sent.',
      // In development, return the link so you can test without email
      ...(process.env.NODE_ENV === 'development' && { magicLink })
    });

  } catch (error) {
    console.error('Request magic link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send magic link'
    });
  }
}

/**
 * Verify magic link and login user
 * POST /api/auth/magic-link/verify
 * Body: { token }
 */
async function verifyMagicLink(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Find magic link token
    const linkResult = await query(
      `SELECT ml.id, ml.user_id, ml.expires_at, ml.used,
              u.id as user_id, u.email, u.first_name, u.last_name, u.account_status
       FROM magic_links ml
       JOIN users u ON u.id = ml.user_id
       WHERE ml.token = $1`,
      [token]
    );

    if (linkResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid magic link'
      });
    }

    const link = linkResult.rows[0];

    // Check if already used
    if (link.used) {
      return res.status(400).json({
        success: false,
        error: 'This magic link has already been used'
      });
    }

    // Check if expired
    if (new Date() > new Date(link.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'This magic link has expired. Please request a new one.'
      });
    }

    // Check account status
    if (link.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended or banned'
      });
    }

    // Mark token as used
    await query(
      'UPDATE magic_links SET used = true, used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [link.id]
    );

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [link.user_id]
    );

    // Log to audit
    await query(
      `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        link.user_id,
        'magic_link_login',
        JSON.stringify({ email: link.email }),
        req.ip || req.connection.remoteAddress
      ]
    );

    // Generate JWT token
    const jwtToken = generateToken({
      id: link.user_id,
      email: link.email,
      firstName: link.first_name,
      lastName: link.last_name
    });

    res.json({
      success: true,
      user: {
        id: link.user_id,
        email: link.email,
        firstName: link.first_name,
        lastName: link.last_name
      },
      token: jwtToken
    });

  } catch (error) {
    console.error('Verify magic link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify magic link'
    });
  }
}

module.exports = {
  requestMagicLink,
  verifyMagicLink
};
