const { query } = require('../db/connection');

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
