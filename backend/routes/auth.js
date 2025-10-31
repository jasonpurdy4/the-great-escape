// Authentication Routes
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  createPayPalLoginOrder,
  verifyPayPalLogin,
  initiatePayPalOAuth,
  handlePayPalOAuthCallback
} = require('../controllers/authController');
const {
  requestMagicLink,
  verifyMagicLink
} = require('../controllers/magicLinkController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// PayPal login routes (legacy $0.01 verification method)
router.post('/paypal-login/create-order', createPayPalLoginOrder);
router.post('/paypal-login/verify', verifyPayPalLogin);

// PayPal OAuth 2.0 Identity API (proper implementation)
router.post('/paypal/initiate', initiatePayPalOAuth);
router.post('/paypal/callback', handlePayPalOAuthCallback);

// Magic Link Authentication (passwordless)
router.post('/magic-link/request', requestMagicLink);
router.post('/magic-link/verify', verifyMagicLink);

// Protected routes
router.get('/me', authenticate, getProfile);

module.exports = router;
