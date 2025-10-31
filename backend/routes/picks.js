// Picks Routes - Pick management
const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
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

// PUT /api/picks/:pickId - Update a pick (before deadline)
router.put('/:pickId', authenticate, async (req, res) => {
  try {
    const { pickId } = req.params;
    const { teamId, teamName, teamCrest, matchId } = req.body;

    // Verify pick exists and belongs to user
    const pickCheck = await query(
      `SELECT p.*, e.user_id, e.pool_id, po.deadline
       FROM picks p
       JOIN entries e ON p.entry_id = e.id
       JOIN pools po ON e.pool_id = po.id
       WHERE p.id = $1`,
      [pickId]
    );

    if (pickCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pick not found'
      });
    }

    const pick = pickCheck.rows[0];

    if (pick.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this pick'
      });
    }

    // Check if pick is still pending
    if (pick.result !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot edit a pick that has already been decided'
      });
    }

    // Check deadline (must be at least 1 hour before first match)
    const now = new Date();
    const deadline = new Date(pick.deadline);
    const timeUntilDeadline = deadline - now;
    const oneHour = 60 * 60 * 1000;

    if (timeUntilDeadline < oneHour) {
      return res.status(400).json({
        success: false,
        error: 'Deadline has passed. Picks must be edited at least 1 hour before the first match.'
      });
    }

    // Check if team was already used in previous picks for this entry
    const usedTeamCheck = await query(
      `SELECT id FROM picks
       WHERE entry_id = $1 AND team_id = $2 AND id != $3`,
      [pick.entry_id, teamId, pickId]
    );

    if (usedTeamCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You have already used this team in a previous week'
      });
    }

    // Update the pick
    const updateResult = await query(
      `UPDATE picks
       SET team_id = $1,
           team_name = $2,
           team_crest = $3,
           match_id = $4
       WHERE id = $5
       RETURNING *`,
      [teamId, teamName, teamCrest, matchId, pickId]
    );

    res.json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update pick error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pick'
    });
  }
});

module.exports = router;
