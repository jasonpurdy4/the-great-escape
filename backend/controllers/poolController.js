const { query } = require('../db/connection');
const fetch = require('node-fetch');

const FOOTBALL_API_BASE = 'https://api.football-data.org/v4';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || 'e28392e0e4cf43f3af47cc3a7e2e9a2e';

// Get current active matchweek/pool
exports.getCurrentMatchweek = async (req, res) => {
  try {
    const result = await query(
      `SELECT id as pool_id, gameweek as matchweek, entry_deadline as deadline, status
       FROM pools
       WHERE status = 'active' AND entry_deadline > NOW()
       ORDER BY gameweek ASC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active matchweek found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching current matchweek:', error);
    res.status(500).json({ error: 'Failed to fetch current matchweek' });
  }
};

// Get next available gameweek with matches
exports.getNextGameweek = async (req, res) => {
  try {
    // First, try to find the next pool that's either:
    // 1. Active with entry deadline in the future (can still join)
    // 2. Or the next upcoming pool
    const poolResult = await query(
      `SELECT id as pool_id, gameweek, entry_deadline, pick_deadline, first_match_kickoff, status
       FROM pools
       WHERE (status = 'active' AND entry_deadline > NOW())
          OR (status = 'upcoming')
       ORDER BY gameweek ASC
       LIMIT 1`
    );

    let gameweek;
    let poolData = null;

    if (poolResult.rows.length > 0) {
      poolData = poolResult.rows[0];
      gameweek = poolData.gameweek;
    } else {
      // No upcoming pools found - get the highest gameweek from completed pools and add 1
      const lastPoolResult = await query(
        `SELECT MAX(gameweek) as last_gameweek FROM pools`
      );

      if (lastPoolResult.rows.length > 0 && lastPoolResult.rows[0].last_gameweek) {
        gameweek = lastPoolResult.rows[0].last_gameweek + 1;
      } else {
        // No pools at all - default to gameweek 1
        gameweek = 1;
      }
    }

    // Fetch matches for this gameweek from football-data.org
    const matchesResponse = await fetch(
      `${FOOTBALL_API_BASE}/competitions/PL/matches?matchday=${gameweek}`,
      {
        headers: {
          'X-Auth-Token': FOOTBALL_API_KEY
        }
      }
    );

    if (!matchesResponse.ok) {
      console.error('Football API error:', await matchesResponse.text());
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch matches from Football API'
      });
    }

    const matchesData = await matchesResponse.json();

    // Transform matches to our format
    const matches = matchesData.matches.map(match => ({
      id: match.id,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName,
        tla: match.homeTeam.tla,
        crest: match.homeTeam.crest
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName,
        tla: match.awayTeam.tla,
        crest: match.awayTeam.crest
      },
      utcDate: match.utcDate,
      status: match.status,
      matchday: match.matchday
    }));

    // Return response
    res.json({
      success: true,
      data: {
        gameweek: gameweek,
        deadline: poolData?.entry_deadline || null,
        pickDeadline: poolData?.pick_deadline || null,
        firstMatchKickoff: poolData?.first_match_kickoff || matches[0]?.utcDate || null,
        status: poolData?.status || 'upcoming',
        matches: matches
      }
    });

  } catch (error) {
    console.error('Error fetching next gameweek:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch next gameweek'
    });
  }
};

// Get pool statistics
exports.getPoolStats = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        id,
        gameweek as matchweek,
        status,
        entry_deadline as deadline,
        pick_deadline,
        first_match_kickoff,
        total_entries,
        prize_pool_cents,
        platform_fee_cents,
        winner_payout_cents
       FROM pools
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    const poolData = result.rows[0];

    // Convert cents to dollars for display
    poolData.prize_pool = poolData.prize_pool_cents / 100;
    poolData.entry_fee = 10; // Hardcoded for now

    res.json(poolData);
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    res.status(500).json({ error: 'Failed to fetch pool statistics' });
  }
};

// Get pick distribution for a pool
exports.getPickDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    // First verify pool exists
    const poolCheck = await query('SELECT id FROM pools WHERE id = $1', [id]);
    if (poolCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    // Get distribution of team picks
    const result = await query(
      `SELECT
        team_name,
        COUNT(*) as pick_count
       FROM picks
       WHERE pool_id = $1 AND result != 'postponed'
       GROUP BY team_name
       ORDER BY pick_count DESC`,
      [id]
    );

    // Convert to object format: { "Liverpool": 12, "Arsenal": 8, ... }
    const distribution = {};
    result.rows.forEach(row => {
      distribution[row.team_name] = parseInt(row.pick_count);
    });

    res.json(distribution);
  } catch (error) {
    console.error('Error fetching pick distribution:', error);
    res.status(500).json({ error: 'Failed to fetch pick distribution' });
  }
};

// Get all pools (with optional status filter)
exports.getAllPools = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT
        id,
        gameweek as matchweek,
        season,
        status,
        entry_deadline as deadline,
        pick_deadline,
        first_match_kickoff,
        total_entries,
        prize_pool_cents,
        created_at
      FROM pools
    `;

    const params = [];

    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }

    sql += ' ORDER BY gameweek ASC';

    const result = await query(sql, params);

    // Convert cents to dollars
    const pools = result.rows.map(p => ({
      ...p,
      prize_pool: p.prize_pool_cents / 100,
      entry_fee: 10
    }));

    res.json(pools);
  } catch (error) {
    console.error('Error fetching pools:', error);
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
};
