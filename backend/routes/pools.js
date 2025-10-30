const express = require('express');
const router = express.Router();
const poolController = require('../controllers/poolController');

// Get current active matchweek
router.get('/current', poolController.getCurrentMatchweek);

// Get all pools (with optional status filter)
router.get('/', poolController.getAllPools);

// Get pool statistics
router.get('/:id/stats', poolController.getPoolStats);

// Get pick distribution for a pool
router.get('/:id/pick-distribution', poolController.getPickDistribution);

module.exports = router;
