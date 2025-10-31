// Email Utility - Magic Link Sending
const crypto = require('crypto');
const { Resend } = require('resend');

// Initialize Resend (will be undefined if no API key)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send magic link email
 * Uses Resend in production, logs to console in development
 */
async function sendMagicLinkEmail(email, magicLink) {
  // Always log for debugging
  console.log('\n========================================');
  console.log('🔐 MAGIC LINK EMAIL');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Link: ${magicLink}`);
  console.log('========================================\n');

  // If Resend is configured, send actual email
  if (resend) {
    try {
      // Use Resend's onboarding domain for testing, or verified domain in production
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'The Great Escape <onboarding@resend.dev>';

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: '🔐 Login to The Great Escape',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #1a2332 0%, #3D195B 100%); color: white; border-radius: 12px 12px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: #C8102E; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .button:hover { background: #a00d25; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              .link { color: #C8102E; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔓 The Great Escape</h1>
              </div>
              <div class="content">
                <h2>Login to Your Account</h2>
                <p>Click the button below to securely login to The Great Escape:</p>
                <p style="text-align: center;">
                  <a href="${magicLink}" class="button">Login Now</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p class="link">${magicLink}</p>
                <hr style="border: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">
                  ⏱️ This link expires in <strong>15 minutes</strong> and can only be used once.<br>
                  🔒 If you didn't request this login, you can safely ignore this email.
                </p>
              </div>
              <div class="footer">
                <p>Premier League Survival Pool<br>Last One Standing Wins</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('✅ Email sent successfully via Resend:', data);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      // Don't throw - fall back to console logging
      console.log('⚠️  Email failed to send, but magic link is still valid');
      return false;
    }
  } else {
    console.log('⚠️  RESEND_API_KEY not configured - email not sent (development mode)');
    return true;
  }
}

/**
 * Generate a secure random token for magic links
 */
function generateMagicToken() {
  return crypto.randomBytes(32).toString('base64url'); // URL-safe base64
}

module.exports = {
  sendMagicLinkEmail,
  generateMagicToken
};
