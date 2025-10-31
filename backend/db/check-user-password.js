// Check if user has password hash
require('dotenv').config();
const { query } = require('./connection');

async function checkUserPassword() {
  try {
    const email = 'notjason@gmail.com';
    console.log(`🔍 Checking password for ${email}...`);

    const result = await query(
      'SELECT id, email, first_name, password_hash IS NOT NULL as has_password, LENGTH(password_hash) as hash_length FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('\n✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Has password: ${user.has_password}`);
    console.log(`   Hash length: ${user.hash_length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserPassword();
