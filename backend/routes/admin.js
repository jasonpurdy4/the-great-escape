// Admin Routes - Match Results & Pool Management
const express = require('express');
const router = express.Router();
const {
  getPendingPicks,
  updatePickResult,
  batchUpdateResults,
  getPoolStats
} = require('../controllers/adminController');

// TODO: Add admin authentication middleware
// const { authenticate, requireAdmin } = require('../middleware/auth');

// For now, these routes are unprotected (add auth later)
router.get('/pending-picks', getPendingPicks);
router.post('/update-pick-result', updatePickResult);
router.post('/batch-update-results', batchUpdateResults);
router.get('/pool-stats/:poolId', getPoolStats);

module.exports = router;
