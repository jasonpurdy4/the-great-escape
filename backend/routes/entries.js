// Entries Routes - User entry management
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyToken } = require('../utils/jwt');

// Middleware to verify JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

// GET /api/entries/my - Get all entries for authenticated user
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT
        e.id,
        e.pool_id,
        e.entry_number,
        e.status,
        e.eliminated_gameweek,
        e.entry_fee_cents,
        e.created_at,
        p.gameweek as pool_gameweek,
        p.status as pool_status,
        (SELECT COUNT(*) FROM picks WHERE entry_id = e.id) as total_picks,
        (SELECT COUNT(*) FROM picks WHERE entry_id = e.id AND result = 'win') as winning_picks,
        (SELECT COUNT(*) FROM picks WHERE entry_id = e.id AND result = 'loss') as losing_picks
       FROM entries e
       JOIN pools p ON e.pool_id = p.id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get my entries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries'
    });
  }
});

// GET /api/entries/:entryId/picks - Get all picks for an entry
router.get('/:entryId/picks', authenticate, async (req, res) => {
  try {
    const { entryId } = req.params;

    // Verify entry belongs to user
    const entryCheck = await query(
      'SELECT user_id FROM entries WHERE id = $1',
      [entryId]
    );

    if (entryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    if (entryCheck.rows[0].user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this entry'
      });
    }

    // Fetch picks
    const result = await query(
      `SELECT
        p.id,
        p.gameweek,
        p.team_id,
        p.team_name,
        p.match_id,
        p.result,
        p.points_earned,
        p.picked_at,
        p.result_time
       FROM picks p
       WHERE p.entry_id = $1
       ORDER BY p.gameweek ASC`,
      [entryId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get entry picks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch picks'
    });
  }
});

// GET /api/entries/stats - Get aggregate stats for user's entries
router.get('/stats', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT
        COUNT(*) as total_entries,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_entries,
        COUNT(CASE WHEN status = 'eliminated' THEN 1 END) as eliminated_entries,
        COUNT(CASE WHEN status = 'winner' THEN 1 END) as winning_entries,
        SUM(entry_fee_cents) as total_spent_cents,
        COALESCE(SUM(CASE WHEN status = 'winner' THEN payout_cents ELSE 0 END), 0) as total_winnings_cents
       FROM entries
       WHERE user_id = $1`,
      [req.userId]
    );

    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        totalEntries: parseInt(stats.total_entries) || 0,
        activeEntries: parseInt(stats.active_entries) || 0,
        eliminatedEntries: parseInt(stats.eliminated_entries) || 0,
        winningEntries: parseInt(stats.winning_entries) || 0,
        totalSpent: (parseInt(stats.total_spent_cents) || 0) / 100,
        totalWinnings: (parseInt(stats.total_winnings_cents) || 0) / 100
      }
    });
  } catch (error) {
    console.error('Get entries stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

module.exports = router;
