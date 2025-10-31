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

module.exports = router;
