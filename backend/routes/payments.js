// Payment Routes
const express = require('express');
const router = express.Router();
const { createOrder, captureOrder, purchaseWithBalance } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticate);

// Create PayPal order
router.post('/create-order', createOrder);

// Capture PayPal payment
router.post('/capture-order', captureOrder);

// Purchase with account balance
router.post('/purchase-with-balance', purchaseWithBalance);

module.exports = router;
