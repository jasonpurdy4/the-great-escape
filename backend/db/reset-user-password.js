// Reset user password - Quick admin script
require('dotenv').config();
const bcrypt = require('bcrypt');
const { query } = require('./connection');

async function resetPassword() {
  try {
    // Get the most recent user (your account)
    const userResult = await query(
      'SELECT id, email, first_name, last_name FROM users ORDER BY created_at DESC LIMIT 1'
    );

    if (userResult.rows.length === 0) {
      console.log('❌ No users found');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('\n👤 Found user:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);

    // Set new password
    const newPassword = 'password123';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, user.id]
    );

    console.log('\n✅ Password reset successful!');
    console.log('\n🔑 Login credentials:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n💡 Use these to login via email/password!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
