// TEMPORARY ADMIN ROUTES - FOR DEBUGGING ONLY
// DELETE THIS FILE AFTER FIXING THE USER ISSUE

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query } = require('../db/connection');

// List all users (for debugging)
router.get('/users', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, account_status, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reset user password (for debugging)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and newPassword are required'
      });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the password
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, first_name',
      [passwordHash, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check database state (for debugging)
router.get('/db-state', async (req, res) => {
  try {
    const results = {};

    // Check pools
    const pools = await query('SELECT COUNT(*) as count FROM pools');
    results.pools = parseInt(pools.rows[0].count);

    // Check teams
    const teams = await query('SELECT COUNT(*) as count FROM teams');
    results.teams = parseInt(teams.rows[0].count);

    // Check matches
    const matches = await query('SELECT COUNT(*) as count FROM matches');
    results.matches = parseInt(matches.rows[0].count);

    // Check entries
    const entries = await query('SELECT COUNT(*) as count FROM entries');
    results.entries = parseInt(entries.rows[0].count);

    // Check picks
    const picks = await query('SELECT COUNT(*) as count FROM picks');
    results.picks = parseInt(picks.rows[0].count);

    // Get sample pool data
    const poolData = await query('SELECT id, gameweek, status, entry_deadline FROM pools ORDER BY gameweek ASC LIMIT 5');
    results.samplePools = poolData.rows;

    // Get sample team data
    const teamData = await query('SELECT id, name, short_name FROM teams LIMIT 5');
    results.sampleTeams = teamData.rows;

    // Get existing entries and picks data
    const entriesData = await query('SELECT * FROM entries');
    results.sampleEntries = entriesData.rows;

    const picksData = await query('SELECT * FROM picks');
    results.samplePicks = picksData.rows;

    res.json({
      success: true,
      counts: {
        pools: results.pools,
        teams: results.teams,
        matches: results.matches,
        entries: results.entries,
        picks: results.picks
      },
      samples: {
        pools: results.samplePools,
        teams: results.sampleTeams,
        entries: results.sampleEntries,
        picks: results.samplePicks
      }
    });
  } catch (error) {
    console.error('Error checking database state:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Populate teams from API (for debugging)
router.post('/populate-teams', async (req, res) => {
  try {
    const FOOTBALL_API_TOKEN = process.env.FOOTBALL_API_TOKEN || '5a09c0f3cece4cab8d1dda6c1b07582b';

    console.log('📡 Fetching Premier League teams from API...');
    const response = await fetch('https://api.football-data.org/v4/competitions/PL/teams', {
      headers: { 'X-Auth-Token': FOOTBALL_API_TOKEN }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const teams = data.teams || [];

    console.log(`✅ Found ${teams.length} teams`);

    let inserted = 0;
    let updated = 0;

    for (const team of teams) {
      const result = await query(
        `INSERT INTO teams (id, name, short_name, tla, crest)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           tla = EXCLUDED.tla,
           crest = EXCLUDED.crest
         RETURNING (xmax = 0) AS inserted`,
        [team.id, team.name, team.shortName, team.tla, team.crest]
      );

      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    console.log(`✅ Inserted ${inserted} teams, updated ${updated} teams`);

    res.json({
      success: true,
      message: 'Teams populated successfully',
      inserted,
      updated,
      total: teams.length
    });
  } catch (error) {
    console.error('Error populating teams:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
