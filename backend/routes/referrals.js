// Referral Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getReferralStats } = require('../controllers/referralController');

// Get user's referral stats and code
router.get('/stats', authenticate, getReferralStats);

module.exports = router;
