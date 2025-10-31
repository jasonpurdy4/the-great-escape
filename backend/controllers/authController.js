// Authentication Controller
const bcrypt = require('bcrypt');
const { query } = require('../db/connection');
const { generateToken } = require('../utils/jwt');
const { assignReferralCode, trackReferral } = require('./referralController');

const SALT_ROUNDS = 10;

// User Registration
async function register(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country = 'US',
      referralCode
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !dateOfBirth || !state) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (age < 18 || (age === 18 && monthDiff < 0)) {
      return res.status(400).json({
        success: false,
        error: 'You must be at least 18 years old to register'
      });
    }

    // Check for prohibited states
    const prohibitedStates = ['WA', 'MT', 'LA', 'AZ', 'IA', 'NV'];
    if (prohibitedStates.includes(state.toUpperCase())) {
      return res.status(403).json({
        success: false,
        error: `Sorry, paid fantasy sports are not available in ${state}`
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, date_of_birth,
        address_line1, address_line2, city, state, zip_code, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, first_name, last_name, created_at`,
      [
        email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        dateOfBirth,
        addressLine1,
        addressLine2,
        city,
        state.toUpperCase(),
        zipCode,
        country.toUpperCase()
      ]
    );

    const user = result.rows[0];

    // Assign a referral code to the new user
    try {
      const newReferralCode = await assignReferralCode(user.id);
      user.referral_code = newReferralCode;
    } catch (error) {
      console.error('Failed to assign referral code:', error);
      // Don't fail registration if referral code assignment fails
    }

    // Track referral if a referral code was provided
    if (referralCode) {
      try {
        await trackReferral(referralCode, user.id);
      } catch (error) {
        console.error('Failed to track referral:', error);
        // Don't fail registration if referral tracking fails
      }
    }

    // Generate JWT token
    const token = generateToken(user);

    // Log registration in audit log
    await query(
      `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        user.id,
        'user_registered',
        JSON.stringify({ email: user.email }),
        req.ip || req.connection.remoteAddress
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
}

// User Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // DEBUG: Log the exact email being received
    console.log('🔐 Login attempt:');
    console.log(`   Email received: "${email}"`);
    console.log(`   Email length: ${email?.length}`);
    console.log(`   Email after toLowerCase: "${email?.toLowerCase()}"`);
    console.log(`   Password provided: ${password ? 'YES' : 'NO'}`);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Get user from database
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, account_status
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    console.log(`   Database lookup result: ${result.rows.length} rows found`);
    if (result.rows.length === 0) {
      console.log('   ❌ No user found with that email');
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check account status
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account is suspended or banned'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user);

    // Log login in audit log
    await query(
      `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        user.id,
        'user_login',
        JSON.stringify({ email: user.email }),
        req.ip || req.connection.remoteAddress
      ]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        balance: 0,
        credits: 0
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
}

// Get current user profile
async function getProfile(req, res) {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, date_of_birth,
              address_line1, address_line2, city, state, zip_code, country,
              paypal_email, balance_cents, credit_cents, referral_code, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        dateOfBirth: user.date_of_birth,
        address: {
          line1: user.address_line1,
          line2: user.address_line2,
          city: user.city,
          state: user.state,
          zipCode: user.zip_code,
          country: user.country
        },
        paypalEmail: user.paypal_email,
        balance: user.balance_cents / 100, // Withdrawable balance (winnings + deposits)
        credits: user.credit_cents / 100, // Non-withdrawable credits (referral bonuses)
        totalFunds: (user.balance_cents + user.credit_cents) / 100, // Total available for entries
        referralCode: user.referral_code,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
}

// PayPal Login - Create verification order
async function createPayPalLoginOrder(req, res) {
  try {
    const { client: paypalClient } = require('../config/paypal');
    const { OrdersController } = require('@paypal/paypal-server-sdk');
    const ordersController = new OrdersController(paypalClient);

    // Create a minimal order just to verify PayPal identity
    const request = {
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: '0.01' // Minimal amount for verification
            },
            description: 'The Great Escape - Login Verification'
          }
        ],
        applicationContext: {
          brandName: 'The Great Escape',
          landingPage: 'LOGIN',
          userAction: 'PAY_NOW',
          returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`,
          cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`
        }
      }
    };

    const response = await ordersController.ordersCreate(request);
    const orderId = response.result.id;

    res.json({
      success: true,
      orderId: orderId
    });
  } catch (error) {
    console.error('Create PayPal login order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create PayPal login order'
    });
  }
}

// PayPal Login - Verify and login user
async function verifyPayPalLogin(req, res) {
  try {
    const { orderId } = req.body;
    const { client: paypalClient } = require('../config/paypal');
    const { OrdersController } = require('@paypal/paypal-server-sdk');
    const ordersController = new OrdersController(paypalClient);

    // Capture the order to get PayPal user info
    const captureRequest = {
      id: orderId,
      prefer: 'return=representation'
    };

    const captureResponse = await ordersController.ordersCapture(captureRequest);
    const capturedOrder = captureResponse.result;

    if (capturedOrder.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'PayPal verification was not completed'
      });
    }

    // Extract PayPal payer ID
    const paypalPayerId = capturedOrder.payer?.payerId || capturedOrder.payer?.payer_id;
    const payerEmail = capturedOrder.payer?.emailAddress || capturedOrder.payer?.email_address;

    if (!paypalPayerId) {
      return res.status(400).json({
        success: false,
        error: 'Could not verify PayPal account'
      });
    }

    // Find user by PayPal ID
    const userResult = await query(
      `SELECT id, email, first_name, last_name, date_of_birth, balance_cents, credit_cents, referral_code
       FROM users WHERE paypal_payer_id = $1`,
      [paypalPayerId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this PayPal account. Please sign up first by making a pick!'
      });
    }

    const user = userResult.rows[0];

    // Refund the verification payment
    // (In production, you might want to add this to their balance instead)
    await query(
      'UPDATE users SET balance_cents = balance_cents + 1 WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return user data and token
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        dateOfBirth: user.date_of_birth,
        balance: user.balance_cents,
        credits: user.credit_cents,
        referralCode: user.referral_code
      }
    });
  } catch (error) {
    console.error('Verify PayPal login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify PayPal login'
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  createPayPalLoginOrder,
  verifyPayPalLogin
};
