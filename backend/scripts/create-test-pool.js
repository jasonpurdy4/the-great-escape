// Create a test pool for Matchday 10
require('dotenv').config();
const { query } = require('../db/connection');

async function createTestPool() {
  try {
    console.log('Creating test pool for Matchday 10...');

    const result = await query(
      `INSERT INTO pools (
        gameweek,
        season,
        status,
        entry_deadline,
        pick_deadline,
        first_match_kickoff,
        total_entries,
        prize_pool_cents,
        platform_fee_cents,
        winner_payout_cents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, gameweek, entry_deadline, status`,
      [
        10,                                    // gameweek
        '2024-25',                            // season
        'active',                             // status
        '2025-11-01 14:00:00+00',            // entry_deadline
        '2025-11-01 14:00:00+00',            // pick_deadline
        '2025-11-01 15:00:00+00',            // first_match_kickoff
        0,                                    // total_entries
        0,                                    // prize_pool_cents
        0,                                    // platform_fee_cents
        0                                     // winner_payout_cents
      ]
    );

    console.log('✅ Pool created successfully:');
    console.log(result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating pool:', error);
    process.exit(1);
  }
}

createTestPool();
