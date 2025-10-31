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

// ============================================
// PayPal OAuth 2.0 Identity API (Proper Implementation)
// ============================================

/**
 * Initiate PayPal OAuth Login Flow
 * Returns the authorization URL to redirect user to PayPal
 */
async function initiatePayPalOAuth(req, res) {
  try {
    const { identityConfig } = require('../config/paypal');

    // Get redirect URI from request or use default
    const redirectUri = req.body.redirectUri || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/paypal/callback`;

    // Generate random state for CSRF protection
    const state = require('crypto').randomBytes(32).toString('hex');

    // Build authorization URL
    const authUrl = new URL(identityConfig.authorizationUrl);
    authUrl.searchParams.append('client_id', identityConfig.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', identityConfig.defaultScopes);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);

    res.json({
      success: true,
      authUrl: authUrl.toString(),
      state // Client should store this to verify callback
    });
  } catch (error) {
    console.error('Error initiating PayPal OAuth:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate PayPal login'
    });
  }
}

/**
 * Handle PayPal OAuth Callback
 * Exchange authorization code for access token and user info
 */
async function handlePayPalOAuthCallback(req, res) {
  try {
    const { code, state } = req.body;
    const { identityConfig } = require('../config/paypal');

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }

    // Exchange authorization code for access token
    const redirectUri = req.body.redirectUri || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/paypal/callback`;

    const tokenResponse = await fetch(identityConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${identityConfig.clientId}:${identityConfig.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.status(400).json({
        success: false,
        error: 'Failed to exchange authorization code'
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from PayPal
    const userInfoResponse = await fetch(identityConfig.userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.text();
      console.error('User info fetch failed:', errorData);
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch user information'
      });
    }

    const userInfo = await userInfoResponse.json();
    console.log('PayPal user info received:', userInfo);

    // Extract PayPal user data
    const paypalPayerId = userInfo.payer_id || userInfo.user_id;
    const paypalEmail = userInfo.email;
    const firstName = userInfo.given_name || userInfo.name?.split(' ')[0] || 'User';
    const lastName = userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '';

    if (!paypalPayerId) {
      return res.status(400).json({
        success: false,
        error: 'Could not retrieve PayPal account ID. Please ensure your PayPal app has Personal Information enabled.'
      });
    }

    // Check if user exists by PayPal payer ID
    const existingUser = await query(
      'SELECT id, email, first_name, last_name, account_status FROM users WHERE paypal_payer_id = $1',
      [paypalPayerId]
    );

    let user;

    if (existingUser.rows.length > 0) {
      // User exists - log them in
      user = existingUser.rows[0];

      // Check account status
      if (user.account_status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Your account has been suspended or banned'
        });
      }

      // Update last login
      await query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

    } else {
      // New user - create account
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

      const newUserResult = await query(
        `INSERT INTO users (
          email, password_hash, first_name, last_name,
          date_of_birth, paypal_payer_id, paypal_email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, first_name, last_name`,
        [
          paypalEmail,
          passwordHash,
          firstName,
          lastName,
          '1990-01-01', // Placeholder DOB - user should update later
          paypalPayerId,
          paypalEmail
        ]
      );

      user = newUserResult.rows[0];

      // Assign referral code to new user
      await assignReferralCode(user.id);
    }

    // Generate JWT token for our app
    const token = generateToken(user);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });

  } catch (error) {
    console.error('Error handling PayPal OAuth callback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete PayPal login'
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  createPayPalLoginOrder,
  verifyPayPalLogin,
  initiatePayPalOAuth,
  handlePayPalOAuthCallback
};
