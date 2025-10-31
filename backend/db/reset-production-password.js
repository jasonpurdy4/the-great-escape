// Reset production user password
require('dotenv').config();
const bcrypt = require('bcrypt');
const { query } = require('./connection');

async function resetPassword() {
  try {
    const email = 'notjason@gmail.com';
    const newPassword = 'password123';

    console.log(`🔄 Resetting password for ${email}...`);

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the password
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, first_name',
      [passwordHash, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = result.rows[0];

    console.log('\n✅ Password reset successful!\n');
    console.log('🔑 Login credentials:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Name: ${user.first_name}`);
    console.log('\n💡 You can now login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
