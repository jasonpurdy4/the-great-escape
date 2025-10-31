// Update pool dates to current/future dates
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not provided');
  process.exit(1);
}

async function updatePoolDates() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Get current date
    const now = new Date();
    console.log(`Current date: ${now.toISOString()}\n`);

    // Update Matchweek 10 to be active (deadline 7 days from now)
    const mw10Deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const mw10Kickoff = new Date(mw10Deadline.getTime() + 60 * 60 * 1000); // 1 hour after deadline

    await client.query(
      `UPDATE pools
       SET entry_deadline = $1,
           pick_deadline = $1,
           first_match_kickoff = $2,
           status = 'active'
       WHERE gameweek = 10`,
      [mw10Deadline, mw10Kickoff]
    );
    console.log(`✅ Updated Matchweek 10: Deadline ${mw10Deadline.toISOString()}`);

    // Update Matchweek 11 to be upcoming (deadline 14 days from now)
    const mw11Deadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const mw11Kickoff = new Date(mw11Deadline.getTime() + 60 * 60 * 1000);

    await client.query(
      `UPDATE pools
       SET entry_deadline = $1,
           pick_deadline = $1,
           first_match_kickoff = $2,
           status = 'upcoming'
       WHERE gameweek = 11`,
      [mw11Deadline, mw11Kickoff]
    );
    console.log(`✅ Updated Matchweek 11: Deadline ${mw11Deadline.toISOString()}`);

    // Update Matchweek 12 to be upcoming (deadline 21 days from now)
    const mw12Deadline = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    const mw12Kickoff = new Date(mw12Deadline.getTime() + 60 * 60 * 1000);

    await client.query(
      `UPDATE pools
       SET entry_deadline = $1,
           pick_deadline = $1,
           first_match_kickoff = $2,
           status = 'upcoming'
       WHERE gameweek = 12`,
      [mw12Deadline, mw12Kickoff]
    );
    console.log(`✅ Updated Matchweek 12: Deadline ${mw12Deadline.toISOString()}`);

    // Show current pools
    const result = await client.query(`
      SELECT gameweek, status, entry_deadline
      FROM pools
      ORDER BY gameweek
    `);

    console.log('\n📊 Current pools:');
    result.rows.forEach(pool => {
      console.log(`  Matchweek ${pool.gameweek}: ${pool.status} - Deadline: ${new Date(pool.entry_deadline).toLocaleString()}`);
    });

    console.log('\n🎉 Pool dates updated successfully!');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updatePoolDates();
