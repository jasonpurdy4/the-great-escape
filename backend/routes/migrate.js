// Temporary route to run migrations via HTTP
const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const fs = require('fs');
const path = require('path');

router.post('/run', async (req, res) => {
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', '003_add_magic_links.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Running migration: 003_add_magic_links.sql');
    await query(sql);
    console.log('✅ Migration completed successfully!');

    res.json({
      success: true,
      message: 'Migration 003_add_magic_links.sql completed successfully'
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
