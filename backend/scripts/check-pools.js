// Check existing pools
require('dotenv').config();
const { query } = require('../db/connection');

async function checkPools() {
  try {
    console.log('Checking existing pools...\n');

    const result = await query(
      `SELECT id, gameweek, season, status, entry_deadline, total_entries, prize_pool_cents
       FROM pools
       ORDER BY gameweek ASC`
    );

    console.log(`Found ${result.rows.length} pools:\n`);
    result.rows.forEach(pool => {
      console.log(`Pool ID: ${pool.id}`);
      console.log(`  Gameweek: ${pool.gameweek}`);
      console.log(`  Season: ${pool.season}`);
      console.log(`  Status: ${pool.status}`);
      console.log(`  Entry Deadline: ${pool.entry_deadline}`);
      console.log(`  Total Entries: ${pool.total_entries}`);
      console.log(`  Prize Pool: $${(pool.prize_pool_cents / 100).toFixed(2)}`);
      console.log('');
    });

    // Check current matchweek query
    console.log('Checking current matchweek query...\n');
    const current = await query(
      `SELECT id as pool_id, gameweek as matchweek, entry_deadline as deadline, status
       FROM pools
       WHERE status = 'active' AND entry_deadline > NOW()
       ORDER BY gameweek ASC
       LIMIT 1`
    );

    if (current.rows.length > 0) {
      console.log('✅ Current active pool found:');
      console.log(current.rows[0]);
    } else {
      console.log('❌ No active pool with future deadline found');
      console.log(`   Current time: ${new Date().toISOString()}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPools();
