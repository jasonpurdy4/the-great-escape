// Seed pools for testing
require('dotenv').config();
const { query } = require('./connection');

async function seedPools() {
  try {
    console.log('🌱 Seeding pools...');

    // Create Matchday 10 pool (current)
    const mw10Deadline = new Date('2025-11-02T11:30:00Z'); // Example: Nov 2, 2025, 11:30 AM UTC
    const mw10Kickoff = new Date('2025-11-02T12:30:00Z'); // Example: 12:30 PM UTC

    await query(
      `INSERT INTO pools (gameweek, season, status, entry_deadline, pick_deadline, first_match_kickoff)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (gameweek) DO NOTHING`,
      [10, '2024-25', 'active', mw10Deadline, mw10Deadline, mw10Kickoff]
    );

    // Create Matchday 11 pool (upcoming)
    const mw11Deadline = new Date('2025-11-09T11:30:00Z');
    const mw11Kickoff = new Date('2025-11-09T12:30:00Z');

    await query(
      `INSERT INTO pools (gameweek, season, status, entry_deadline, pick_deadline, first_match_kickoff)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (gameweek) DO NOTHING`,
      [11, '2024-25', 'upcoming', mw11Deadline, mw11Deadline, mw11Kickoff]
    );

    // Create Matchday 12 pool (upcoming)
    const mw12Deadline = new Date('2025-11-16T11:30:00Z');
    const mw12Kickoff = new Date('2025-11-16T12:30:00Z');

    await query(
      `INSERT INTO pools (gameweek, season, status, entry_deadline, pick_deadline, first_match_kickoff)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (gameweek) DO NOTHING`,
      [12, '2024-25', 'upcoming', mw12Deadline, mw12Deadline, mw12Kickoff]
    );

    console.log('✅ Pools seeded successfully!');

    // Display pools
    const result = await query('SELECT * FROM pools ORDER BY gameweek');
    console.log('\n📊 Pools in database:');
    result.rows.forEach(pool => {
      console.log(`  - Matchday ${pool.gameweek}: ${pool.status} (Deadline: ${pool.entry_deadline})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedPools();
