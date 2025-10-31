// Backfill team crests for existing picks
require('dotenv').config();
const { query } = require('./connection');

const FOOTBALL_API_TOKEN = process.env.FOOTBALL_API_TOKEN || '5a09c0f3cece4cab8d1dda6c1b07582b';
const FOOTBALL_API_BASE = 'https://api.football-data.org/v4';

async function backfillTeamCrests() {
  try {
    console.log('🔄 Starting team crest backfill...');

    // Fetch all teams from the API
    console.log('📥 Fetching Premier League teams from API...');
    const response = await fetch(`${FOOTBALL_API_BASE}/competitions/PL/teams`, {
      headers: {
        'X-Auth-Token': FOOTBALL_API_TOKEN
      }
    });

    const data = await response.json();
    const teams = data.teams;

    console.log(`✅ Found ${teams.length} teams`);

    // Create a map of team ID to crest URL
    const teamCrestMap = {};
    teams.forEach(team => {
      teamCrestMap[team.id] = team.crest;
    });

    // Get all picks that don't have a team_crest
    console.log('📊 Fetching picks without crests...');
    const picksResult = await query(
      `SELECT id, team_id, team_name
       FROM picks
       WHERE team_crest IS NULL OR team_crest = ''`
    );

    const picks = picksResult.rows;
    console.log(`📝 Found ${picks.length} picks to update`);

    if (picks.length === 0) {
      console.log('✨ All picks already have team crests!');
      process.exit(0);
    }

    // Update each pick with its team crest
    let updated = 0;
    let notFound = 0;

    for (const pick of picks) {
      const crest = teamCrestMap[pick.team_id];

      if (crest) {
        await query(
          `UPDATE picks SET team_crest = $1 WHERE id = $2`,
          [crest, pick.id]
        );
        updated++;
        console.log(`✓ Updated pick #${pick.id}: ${pick.team_name} -> ${crest}`);
      } else {
        notFound++;
        console.log(`⚠️  No crest found for pick #${pick.id}: ${pick.team_name} (team_id: ${pick.team_id})`);
      }
    }

    console.log('\n🎉 Backfill complete!');
    console.log(`✅ Updated: ${updated} picks`);
    if (notFound > 0) {
      console.log(`⚠️  Not found: ${notFound} picks`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  }
}

backfillTeamCrests();
