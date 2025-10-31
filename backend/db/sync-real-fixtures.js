// Sync pools with real Premier League fixture dates
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];
const FOOTBALL_API_TOKEN = process.env.FOOTBALL_API_TOKEN || '5a09c0f3cece4cab8d1dda6c1b07582b';

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not provided');
  process.exit(1);
}

async function syncRealFixtures() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Fetch Matchweek 10 fixtures from API
    console.log('📡 Fetching Matchweek 10 fixtures from football-data.org...');
    const response = await fetch('https://api.football-data.org/v4/competitions/PL/matches?matchday=10', {
      headers: {
        'X-Auth-Token': FOOTBALL_API_TOKEN
      }
    });
    const data = await response.json();
    const matches = data.matches;

    if (!matches || matches.length === 0) {
      console.error('❌ No matches found for Matchweek 10');
      process.exit(1);
    }

    // Find the earliest match
    const firstMatch = matches.reduce((earliest, match) => {
      return new Date(match.utcDate) < new Date(earliest.utcDate) ? match : earliest;
    });

    const firstKickoff = new Date(firstMatch.utcDate);
    const deadline = new Date(firstKickoff.getTime() - 60 * 60 * 1000); // 1 hour before

    console.log(`⚽ First match: ${firstMatch.homeTeam.shortName} vs ${firstMatch.awayTeam.shortName}`);
    console.log(`🕐 Kickoff: ${firstKickoff.toISOString()} (${firstKickoff.toLocaleString()})`);
    console.log(`⏰ Deadline: ${deadline.toISOString()} (${deadline.toLocaleString()})\n`);

    // Update the pool
    await client.query(
      `UPDATE pools
       SET entry_deadline = $1,
           pick_deadline = $1,
           first_match_kickoff = $2,
           status = 'active'
       WHERE gameweek = 10`,
      [deadline, firstKickoff]
    );

    console.log('✅ Updated Matchweek 10 pool with real fixture dates!\n');

    // Show the updated pool
    const result = await client.query(`
      SELECT gameweek, status, entry_deadline, first_match_kickoff
      FROM pools
      WHERE gameweek = 10
    `);

    const pool = result.rows[0];
    const now = new Date();
    const timeUntilDeadline = new Date(pool.entry_deadline) - now;
    const hoursUntil = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));

    console.log('📊 Matchweek 10 Pool:');
    console.log(`   Status: ${pool.status}`);
    console.log(`   Deadline: ${new Date(pool.entry_deadline).toLocaleString()}`);
    console.log(`   First Match: ${new Date(pool.first_match_kickoff).toLocaleString()}`);
    console.log(`   Time Remaining: ${hoursUntil}h ${minutesUntil}m\n`);

    console.log('🎉 Sync complete!');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

syncRealFixtures();
