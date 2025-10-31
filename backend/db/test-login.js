// Test login with bcrypt comparison
require('dotenv').config();
const bcrypt = require('bcrypt');
const { query } = require('./connection');

async function testLogin() {
  try {
    const email = 'notjason@gmail.com';
    const password = 'password123';

    console.log(`🔐 Testing login for ${email}...`);
    console.log(`   Password: ${password}`);

    // Fetch user
    const result = await query(
      'SELECT id, email, password_hash, first_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log(`\n✅ User found: ${user.first_name} (${user.email})`);
    console.log(`   Hash: ${user.password_hash.substring(0, 20)}...`);

    // Test password comparison
    console.log('\n🔍 Testing password comparison...');
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (isValid) {
      console.log('✅ Password is VALID! Login should work.');
    } else {
      console.log('❌ Password is INVALID! There is a problem.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
