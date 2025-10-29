// Referral Controller - Handle referral code generation and tracking
const { query, transaction } = require('../db/connection');

// Generate a unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
  const codeLength = 6;
  let code = 'TGE'; // The Great Escape prefix

  for (let i = 0; i < codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

// Generate and assign a referral code to a user
async function assignReferralCode(userId) {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateReferralCode();

    try {
      // Try to update the user with this code
      const result = await query(
        'UPDATE users SET referral_code = $1 WHERE id = $2 RETURNING referral_code',
        [code, userId]
      );

      if (result.rows.length > 0) {
        console.log(`✅ Assigned referral code ${code} to user ${userId}`);
        return code;
      }
    } catch (error) {
      // If it's a unique constraint error, try again with a new code
      if (error.code === '23505') { // PostgreSQL unique violation error
        attempts++;
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to generate unique referral code after multiple attempts');
}

// Get referral stats for a user
async function getReferralStats(req, res) {
  try {
    const userId = req.user.id;

    // Get user's referral code (assign if they don't have one)
    let codeResult = await query(
      'SELECT referral_code FROM users WHERE id = $1',
      [userId]
    );

    let referralCode = codeResult.rows[0]?.referral_code;

    // If user doesn't have a referral code yet, assign one
    if (!referralCode) {
      referralCode = await assignReferralCode(userId);
    }

    // Get referral stats
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN credit_awarded = true THEN 1 END) as credited_referrals,
        COUNT(CASE WHEN credit_awarded = false THEN 1 END) as pending_referrals
      FROM referrals
      WHERE referrer_id = $1
    `, [userId]);

    const stats = statsResult.rows[0] || {
      total_referrals: 0,
      credited_referrals: 0,
      pending_referrals: 0
    };

    // Get credited amount (each referral = $10 credit = 1000 cents)
    const creditsEarned = parseInt(stats.credited_referrals) * 1000;
    const pendingCredits = parseInt(stats.pending_referrals) * 1000;

    // Get list of referred users
    const referredResult = await query(`
      SELECT
        u.id,
        u.first_name,
        u.email,
        r.credit_awarded,
        r.created_at
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [userId]);

    res.json({
      success: true,
      referralCode: referralCode,
      stats: {
        totalReferrals: parseInt(stats.total_referrals),
        creditsEarned: creditsEarned,
        pendingCredits: pendingCredits
      },
      referredUsers: referredResult.rows.map(user => ({
        id: user.id,
        name: user.first_name,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Partially hide email
        credited: user.credit_awarded,
        joinedAt: user.created_at
      }))
    });

  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch referral stats'
    });
  }
}

// Process a referral (award credits to both parties)
async function processReferral(referrerId, referredId) {
  try {
    await transaction(async (client) => {
      // Check if referral already exists and is credited
      const existingResult = await client.query(
        'SELECT credit_awarded FROM referrals WHERE referrer_id = $1 AND referred_id = $2',
        [referrerId, referredId]
      );

      if (existingResult.rows.length > 0 && existingResult.rows[0].credit_awarded) {
        console.log(`Referral credit already awarded for ${referrerId} -> ${referredId}`);
        return;
      }

      // Award $10 credit to both users (1000 cents)
      const creditAmount = 1000;

      // Award to referrer
      await client.query(
        'UPDATE users SET credit_cents = credit_cents + $1 WHERE id = $2',
        [creditAmount, referrerId]
      );

      // Award to referred user
      await client.query(
        'UPDATE users SET credit_cents = credit_cents + $1, referral_credited = true WHERE id = $2',
        [creditAmount, referredId]
      );

      // Mark referral as credited
      if (existingResult.rows.length > 0) {
        await client.query(
          'UPDATE referrals SET credit_awarded = true, credit_awarded_at = CURRENT_TIMESTAMP WHERE referrer_id = $1 AND referred_id = $2',
          [referrerId, referredId]
        );
      } else {
        await client.query(
          'INSERT INTO referrals (referrer_id, referred_id, credit_awarded, credit_awarded_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP)',
          [referrerId, referredId]
        );
      }

      // Log to audit
      await client.query(
        `INSERT INTO audit_log (user_id, action, details)
         VALUES ($1, 'referral_credit_awarded', $2)`,
        [referrerId, JSON.stringify({ referredUserId: referredId, amount: creditAmount })]
      );

      await client.query(
        `INSERT INTO audit_log (user_id, action, details)
         VALUES ($1, 'referral_credit_received', $2)`,
        [referredId, JSON.stringify({ referrerId: referrerId, amount: creditAmount })]
      );

      console.log(`✅ Referral credits awarded: ${referrerId} -> ${referredId}`);
    });
  } catch (error) {
    console.error('Process referral error:', error);
    throw error;
  }
}

// Validate and track a referral code during registration
async function trackReferral(referralCode, newUserId) {
  try {
    if (!referralCode) return;

    // Find the referrer by code
    const referrerResult = await query(
      'SELECT id FROM users WHERE referral_code = $1',
      [referralCode.toUpperCase()]
    );

    if (referrerResult.rows.length === 0) {
      console.log(`⚠️ Invalid referral code: ${referralCode}`);
      return;
    }

    const referrerId = referrerResult.rows[0].id;

    // Can't refer yourself
    if (referrerId === newUserId) {
      console.log(`⚠️ User tried to refer themselves: ${newUserId}`);
      return;
    }

    // Update the new user's referred_by field
    await query(
      'UPDATE users SET referred_by = $1 WHERE id = $2',
      [referrerId, newUserId]
    );

    // Create referral record (credit not awarded yet)
    await query(
      'INSERT INTO referrals (referrer_id, referred_id, credit_awarded) VALUES ($1, $2, false) ON CONFLICT (referrer_id, referred_id) DO NOTHING',
      [referrerId, newUserId]
    );

    console.log(`✅ Referral tracked: ${referrerId} referred ${newUserId}`);

  } catch (error) {
    console.error('Track referral error:', error);
    // Don't fail registration if referral tracking fails
  }
}

module.exports = {
  getReferralStats,
  assignReferralCode,
  processReferral,
  trackReferral,
  generateReferralCode
};
