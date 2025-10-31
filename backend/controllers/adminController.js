// Admin Controller - Match Results & Pool Management
const { query, transaction } = require('../db/connection');

/**
 * Get all pending picks that need results
 * GET /api/admin/pending-picks
 */
async function getPendingPicks(req, res) {
  try {
    const result = await query(`
      SELECT
        p.id as pick_id,
        p.gameweek,
        p.team_id,
        p.team_name,
        p.team_crest,
        p.match_id,
        p.picked_at,
        p.result,
        e.id as entry_id,
        e.entry_number,
        e.status as entry_status,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        po.gameweek as pool_gameweek
      FROM picks p
      JOIN entries e ON e.id = p.entry_id
      JOIN users u ON u.id = e.user_id
      JOIN pools po ON po.id = e.pool_id
      WHERE p.result = 'pending'
      ORDER BY p.gameweek ASC, p.picked_at ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pending picks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending picks'
    });
  }
}

/**
 * Update pick result (win/loss/draw)
 * POST /api/admin/update-pick-result
 * Body: { pickId, result, gameweek }
 */
async function updatePickResult(req, res) {
  try {
    const { pickId, result, gameweek } = req.body;

    if (!pickId || !result) {
      return res.status(400).json({
        success: false,
        error: 'Pick ID and result are required'
      });
    }

    if (!['win', 'loss', 'draw'].includes(result)) {
      return res.status(400).json({
        success: false,
        error: 'Result must be win, loss, or draw'
      });
    }

    await transaction(async (client) => {
      // Update the pick result
      await client.query(
        'UPDATE picks SET result = $1 WHERE id = $2',
        [result, pickId]
      );

      // If loss or draw, eliminate the entry
      if (result === 'loss' || result === 'draw') {
        const pickResult = await client.query(
          'SELECT entry_id FROM picks WHERE id = $1',
          [pickId]
        );

        if (pickResult.rows.length > 0) {
          const entryId = pickResult.rows[0].entry_id;

          await client.query(
            `UPDATE entries
             SET status = 'eliminated',
                 eliminated_gameweek = $1
             WHERE id = $2`,
            [gameweek || null, entryId]
          );

          console.log(`❌ Entry ${entryId} eliminated (${result})`);
        }
      }
    });

    res.json({
      success: true,
      message: `Pick result updated to ${result}`
    });
  } catch (error) {
    console.error('Update pick result error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pick result'
    });
  }
}

/**
 * Batch update multiple pick results
 * POST /api/admin/batch-update-results
 * Body: { updates: [{ pickId, result, gameweek }] }
 */
async function batchUpdateResults(req, res) {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required'
      });
    }

    let successCount = 0;
    let errorCount = 0;

    await transaction(async (client) => {
      for (const update of updates) {
        try {
          const { pickId, result, gameweek } = update;

          if (!['win', 'loss', 'draw'].includes(result)) {
            console.error(`Invalid result for pick ${pickId}: ${result}`);
            errorCount++;
            continue;
          }

          // Update the pick
          await client.query(
            'UPDATE picks SET result = $1 WHERE id = $2',
            [result, pickId]
          );

          // Eliminate if loss or draw
          if (result === 'loss' || result === 'draw') {
            const pickResult = await client.query(
              'SELECT entry_id FROM picks WHERE id = $1',
              [pickId]
            );

            if (pickResult.rows.length > 0) {
              const entryId = pickResult.rows[0].entry_id;

              await client.query(
                `UPDATE entries
                 SET status = 'eliminated',
                     eliminated_gameweek = $1
                 WHERE id = $2`,
                [gameweek, entryId]
              );
            }
          }

          successCount++;
        } catch (err) {
          console.error(`Error updating pick ${update.pickId}:`, err);
          errorCount++;
        }
      }
    });

    res.json({
      success: true,
      message: `Updated ${successCount} picks (${errorCount} errors)`,
      successCount,
      errorCount
    });
  } catch (error) {
    console.error('Batch update results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch update results'
    });
  }
}

/**
 * Get pool statistics and standings
 * GET /api/admin/pool-stats/:poolId
 */
async function getPoolStats(req, res) {
  try {
    const { poolId } = req.params;

    const stats = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active_entries,
        COUNT(*) FILTER (WHERE status = 'eliminated') as eliminated_entries,
        COUNT(*) as total_entries,
        pool_id
      FROM entries
      WHERE pool_id = $1
      GROUP BY pool_id
    `, [poolId]);

    const topPicks = await query(`
      SELECT
        team_name,
        COUNT(*) as pick_count,
        COUNT(*) FILTER (WHERE result = 'win') as wins,
        COUNT(*) FILTER (WHERE result = 'loss') as losses,
        COUNT(*) FILTER (WHERE result = 'draw') as draws
      FROM picks
      WHERE entry_id IN (SELECT id FROM entries WHERE pool_id = $1)
      GROUP BY team_name
      ORDER BY pick_count DESC
      LIMIT 10
    `, [poolId]);

    res.json({
      success: true,
      data: {
        stats: stats.rows[0] || { active_entries: 0, eliminated_entries: 0, total_entries: 0 },
        topPicks: topPicks.rows
      }
    });
  } catch (error) {
    console.error('Get pool stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pool stats'
    });
  }
}

module.exports = {
  getPendingPicks,
  updatePickResult,
  batchUpdateResults,
  getPoolStats
};
