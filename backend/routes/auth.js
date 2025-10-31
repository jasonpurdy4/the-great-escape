// Authentication Routes
const express = require('express');
const router = express.Router();
const { register, login, getProfile, createPayPalLoginOrder, verifyPayPalLogin } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// PayPal login routes
router.post('/paypal-login/create-order', createPayPalLoginOrder);
router.post('/paypal-login/verify', verifyPayPalLogin);

// Protected routes
router.get('/me', authenticate, getProfile);

module.exports = router;
