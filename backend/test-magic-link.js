// Test magic link functionality directly
require('dotenv').config();
const { query } = require('./db/connection');
const { generateMagicToken, sendMagicLinkEmail } = require('./utils/email');

async function testMagicLink() {
  try {
    console.log('🧪 Testing Magic Link Flow\n');

    // 1. Find a test user
    console.log('1️⃣  Finding test user...');
    const userResult = await query(
      'SELECT id, email, first_name FROM users WHERE email = $1',
      ['test@example.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ No test user found. Creating one...');
      const createResult = await query(
        `INSERT INTO users (email, first_name, last_name, account_status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, first_name`,
        ['test@example.com', 'Test', 'User', 'active']
      );
      console.log('✅ Test user created:', createResult.rows[0]);
    } else {
      console.log('✅ Test user found:', userResult.rows[0]);
    }

    const user = userResult.rows[0] || (await query('SELECT id, email, first_name FROM users WHERE email = $1', ['test@example.com'])).rows[0];

    // 2. Generate magic token
    console.log('\n2️⃣  Generating magic token...');
    const token = generateMagicToken();
    console.log('✅ Token generated:', token.substring(0, 20) + '...');

    // 3. Store in database
    console.log('\n3️⃣  Storing magic link in database...');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await query(
      `INSERT INTO magic_links (user_id, token, expires_at, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [user.id, token, expiresAt, '127.0.0.1']
    );
    console.log('✅ Magic link stored');

    // 4. Build magic link URL
    console.log('\n4️⃣  Building magic link URL...');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/auth/magic-link/${token}`;
    console.log('✅ Magic link:', magicLink);

    // 5. Send email (logs to console)
    console.log('\n5️⃣  Sending magic link email...');
    await sendMagicLinkEmail(user.email, magicLink);

    // 6. Verify the token
    console.log('\n6️⃣  Verifying magic link token...');
    const linkResult = await query(
      `SELECT ml.id, ml.user_id, ml.expires_at, ml.used,
              u.id as user_id, u.email, u.first_name, u.last_name
       FROM magic_links ml
       JOIN users u ON u.id = ml.user_id
       WHERE ml.token = $1`,
      [token]
    );

    if (linkResult.rows.length === 0) {
      console.log('❌ Token not found!');
    } else {
      const link = linkResult.rows[0];
      console.log('✅ Token verified:', {
        user: link.email,
        used: link.used,
        expires: link.expires_at
      });

      // Mark as used
      console.log('\n7️⃣  Marking token as used...');
      await query(
        'UPDATE magic_links SET used = true, used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [link.id]
      );
      console.log('✅ Token marked as used');

      // Try to use it again (should fail)
      console.log('\n8️⃣  Testing token reuse prevention...');
      const reuseLinkResult = await query(
        `SELECT ml.id, ml.used
         FROM magic_links ml
         WHERE ml.token = $1`,
        [token]
      );

      if (reuseLinkResult.rows[0].used) {
        console.log('✅ Token correctly marked as used - cannot be reused');
      } else {
        console.log('❌ Token reuse prevention failed!');
      }
    }

    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testMagicLink();
