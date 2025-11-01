const { query } = require('../db/connection');
// Note: Node 18+ has built-in fetch, no import needed

const FOOTBALL_API_BASE = 'https://api.football-data.org/v4';
const FOOTBALL_API_TOKEN = process.env.FOOTBALL_API_TOKEN || '5a09c0f3cece4cab8d1dda6c1b07582b';

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
    // Step 1: Query the Football API to get the ACTUAL current matchday in the real world
    const currentMatchdayResponse = await fetch(
      `${FOOTBALL_API_BASE}/competitions/PL/matches`,
      {
        headers: {
          'X-Auth-Token': FOOTBALL_API_TOKEN
        }
      }
    );

    if (!currentMatchdayResponse.ok) {
      console.error('Football API error fetching current matchday:', await currentMatchdayResponse.text());
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch current matchday from Football API'
      });
    }

    const currentMatchdayData = await currentMatchdayResponse.json();

    // Get the current matchday from the season object
    const realCurrentMatchday = currentMatchdayData.matches?.[0]?.season?.currentMatchday || 11;

    // Step 2: Determine which gameweek to show
    // Strategy: Show the earliest gameweek that has matches that haven't finished yet
    let gameweek = realCurrentMatchday;

    // Fetch matches for the current matchday to see if they're all finished
    const testMatchesResponse = await fetch(
      `${FOOTBALL_API_BASE}/competitions/PL/matches?matchday=${realCurrentMatchday}`,
      {
        headers: {
          'X-Auth-Token': FOOTBALL_API_TOKEN
        }
      }
    );

    if (testMatchesResponse.ok) {
      const testMatchesData = await testMatchesResponse.json();

      // Check if any match has started (IN_PLAY, PAUSED, FINISHED)
      const anyMatchStarted = testMatchesData.matches?.some(m =>
        m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED'
      );

      // If any match has started, show next matchday (can't pick for games in progress)
      if (anyMatchStarted && realCurrentMatchday < 38) {
        gameweek = realCurrentMatchday + 1;
      }
    }

    // Step 3: Check if we have a pool for this gameweek in our database
    const poolResult = await query(
      `SELECT id as pool_id, gameweek, entry_deadline, pick_deadline, first_match_kickoff, status
       FROM pools
       WHERE gameweek = $1
       LIMIT 1`,
      [gameweek]
    );

    let poolData = poolResult.rows.length > 0 ? poolResult.rows[0] : null;

    // Fetch matches for this gameweek from football-data.org
    const matchesResponse = await fetch(
      `${FOOTBALL_API_BASE}/competitions/PL/matches?matchday=${gameweek}`,
      {
        headers: {
          'X-Auth-Token': FOOTBALL_API_TOKEN
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
