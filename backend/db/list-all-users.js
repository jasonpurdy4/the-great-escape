// List all users in the connected database
// This script uses the DATABASE_URL from environment
require('dotenv').config();
const { query } = require('./connection');

async function listUsers() {
  try {
    console.log('🔍 Listing all users in database...');
    console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}`);
    console.log('');

    const result = await query(
      'SELECT id, email, first_name, last_name, paypal_payer_id, account_status, created_at FROM users ORDER BY created_at DESC'
    );

    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      process.exit(0);
    }

    console.log(`✅ Found ${result.rows.length} user(s):\n`);

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Status: ${user.account_status}`);
      console.log(`   PayPal ID: ${user.paypal_payer_id || 'None'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers();
