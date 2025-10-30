// Payment Routes
const express = require('express');
const router = express.Router();
const { createOrder, captureOrder, purchaseWithBalance, createGuestOrder, captureGuestOrder } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Guest payment routes (no auth required)
router.post('/guest/create-order', createGuestOrder);
router.post('/guest/capture-order', captureGuestOrder);

// Authenticated payment routes
router.post('/create-order', authenticate, createOrder);
router.post('/capture-order', authenticate, captureOrder);
router.post('/purchase-with-balance', authenticate, purchaseWithBalance);

module.exports = router;
