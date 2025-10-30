// Payment Controller
const { client: paypalClient } = require('../config/paypal');
const { OrdersController } = require('@paypal/paypal-server-sdk');
const { query, transaction } = require('../db/connection');
const { processReferral } = require('./referralController');

const ordersController = new OrdersController(paypalClient);

// Create PayPal order for entry purchase
async function createOrder(req, res) {
  try {
    const { poolId, teamId, teamName, matchId } = req.body;
    const userId = req.user.id;

    // Validate pool exists and is active
    const poolResult = await query(
      'SELECT id, gameweek, status, entry_deadline FROM pools WHERE id = $1',
      [poolId]
    );

    if (poolResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      });
    }

    const pool = poolResult.rows[0];

    // Check if pool is accepting entries
    if (pool.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'This pool has already ended'
      });
    }

    // Check deadline
    if (new Date() > new Date(pool.entry_deadline)) {
      return res.status(400).json({
        success: false,
        error: 'Entry deadline has passed'
      });
    }

    // Create PayPal order
    const request = {
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: '10.00'
            },
            description: `The Great Escape - Matchday ${pool.gameweek} Entry`,
            customId: JSON.stringify({
              userId,
              poolId,
              teamId,
              teamName,
              matchId
            })
          }
        ],
        applicationContext: {
          returnUrl: `${process.env.FRONTEND_URL || 'https://the-great-escape-frontend-production.up.railway.app'}/payment/success`,
          cancelUrl: `${process.env.FRONTEND_URL || 'https://the-great-escape-frontend-production.up.railway.app'}/payment/cancel`,
          brandName: 'The Great Escape',
          landingPage: 'BILLING',
          userAction: 'PAY_NOW'
        }
      }
    };

    const response = await ordersController.createOrder(request);
    const order = response.result;

    res.json({
      success: true,
      data: {
        orderId: order.id,
        approvalUrl: order.links.find(link => link.rel === 'approve').href
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
}

// Capture PayPal payment and create entry
async function captureOrder(req, res) {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Capture the payment
    const request = { id: orderId };
    const response = await ordersController.captureOrder(request);
    const capturedOrder = response.result;

    if (capturedOrder.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Extract custom data
    const customData = JSON.parse(capturedOrder.purchaseUnits[0].customId);
    const { poolId, teamId, teamName, matchId } = customData;

    // Verify user matches
    if (customData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'User mismatch'
      });
    }

    // Extract PayPal payer ID
    const paypalPayerId = capturedOrder.payer?.payer_id;

    if (!paypalPayerId) {
      return res.status(400).json({
        success: false,
        error: 'PayPal payer ID not found'
      });
    }

    // Check if this PayPal account is already linked to another user
    const existingUserResult = await query(
      'SELECT id, email FROM users WHERE paypal_payer_id = $1 AND id != $2',
      [paypalPayerId, userId]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'This PayPal account is already linked to another user account. Each PayPal account can only be used once.',
        code: 'PAYPAL_ACCOUNT_ALREADY_USED'
      });
    }

    // Use transaction to ensure atomicity
    const result = await transaction(async (client) => {
      // 1. Store PayPal payer ID if not already set
      await client.query(
        'UPDATE users SET paypal_payer_id = $1 WHERE id = $2 AND paypal_payer_id IS NULL',
        [paypalPayerId, userId]
      );

      // 2. Add $10 to user balance
      await client.query(
        'UPDATE users SET balance_cents = balance_cents + 1000 WHERE id = $1',
        [userId]
      );

      // 2. Record deposit transaction
      const depositResult = await client.query(
        `INSERT INTO transactions (
          user_id, type, status, amount_cents, fee_cents, net_amount_cents,
          payment_provider, provider_transaction_id, payment_method, pool_id, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          userId,
          'deposit',
          'completed',
          1000,
          0,
          1000,
          'paypal',
          orderId,
          'paypal',
          poolId,
          'Entry fee payment via PayPal'
        ]
      );

      const depositTransactionId = depositResult.rows[0].id;

      // 3. Get next entry number for this user/pool
      const entryCountResult = await client.query(
        'SELECT COALESCE(MAX(entry_number), 0) as max_entry FROM entries WHERE user_id = $1 AND pool_id = $2',
        [userId, poolId]
      );
      const nextEntryNumber = entryCountResult.rows[0].max_entry + 1;

      // 4. Create entry
      const entryResult = await client.query(
        `INSERT INTO entries (user_id, pool_id, entry_number, status, entry_fee_cents, transaction_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [userId, poolId, nextEntryNumber, 'active', 1000, depositTransactionId]
      );

      const entryId = entryResult.rows[0].id;

      // 5. Deduct $10 from balance
      await client.query(
        'UPDATE users SET balance_cents = balance_cents - 1000 WHERE id = $1',
        [userId]
      );

      // 6. Record entry purchase transaction
      await client.query(
        `INSERT INTO transactions (
          user_id, type, status, amount_cents, fee_cents, net_amount_cents,
          payment_provider, pool_id, entry_id, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          userId,
          'entry_purchase',
          'completed',
          1000,
          0,
          1000,
          'balance',
          poolId,
          entryId,
          `Entry purchase for Matchday ${poolId}`
        ]
      );

      // 7. Create pick if team was selected
      if (teamId && teamName) {
        const poolResult = await client.query('SELECT gameweek FROM pools WHERE id = $1', [poolId]);
        const gameweek = poolResult.rows[0].gameweek;

        await client.query(
          `INSERT INTO picks (entry_id, gameweek, pool_id, team_id, team_name, match_id, result)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [entryId, gameweek, poolId, teamId, teamName, matchId, 'pending']
        );
      }

      // 8. Update pool totals
      await client.query(
        `UPDATE pools SET
          total_entries = total_entries + 1,
          prize_pool_cents = prize_pool_cents + 1000,
          platform_fee_cents = prize_pool_cents * 0.1,
          winner_payout_cents = prize_pool_cents * 0.9
         WHERE id = $1`,
        [poolId]
      );

      return { entryId, entryNumber: nextEntryNumber };
    });

    // Log in audit log
    await query(
      `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        userId,
        'entry_purchased',
        JSON.stringify({ poolId, entryId: result.entryId, orderId }),
        req.ip || req.connection.remoteAddress
      ]
    );

    // Check if user was referred and award referral credits
    try {
      const referralCheckResult = await query(
        'SELECT referred_by, referral_credited FROM users WHERE id = $1',
        [userId]
      );

      const { referred_by, referral_credited } = referralCheckResult.rows[0];

      // If user was referred and hasn't been credited yet, process the referral
      if (referred_by && !referral_credited) {
        await processReferral(referred_by, userId);
        console.log(`✅ Referral credits awarded for user ${userId}`);
      }
    } catch (error) {
      console.error('Referral credit error:', error);
      // Don't fail the payment if referral credits fail
    }

    res.json({
      success: true,
      data: {
        entryId: result.entryId,
        entryNumber: result.entryNumber,
        message: 'Entry purchased successfully!'
      }
    });
  } catch (error) {
    console.error('Capture order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
}

// Purchase entry using account balance
async function purchaseWithBalance(req, res) {
  try {
    const { poolId, teamId, teamName, matchId } = req.body;
    const userId = req.user.id;

    // Get user balance AND credits
    const userResult = await query(
      'SELECT balance_cents, credit_cents FROM users WHERE id = $1',
      [userId]
    );

    const balance = userResult.rows[0].balance_cents;
    const credits = userResult.rows[0].credit_cents;
    const totalFunds = balance + credits;

    if (totalFunds < 1000) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        balance: balance / 100,
        credits: credits / 100,
        total: totalFunds / 100
      });
    }

    // Calculate how much to deduct from credits vs balance
    // Use credits first, then balance
    const creditsToUse = Math.min(credits, 1000);
    const balanceToUse = 1000 - creditsToUse;

    // Validate pool
    const poolResult = await query(
      'SELECT id, gameweek, status, entry_deadline FROM pools WHERE id = $1',
      [poolId]
    );

    if (poolResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      });
    }

    const pool = poolResult.rows[0];

    if (pool.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'This pool has already ended'
      });
    }

    if (new Date() > new Date(pool.entry_deadline)) {
      return res.status(400).json({
        success: false,
        error: 'Entry deadline has passed'
      });
    }

    // Use transaction for atomicity
    const result = await transaction(async (client) => {
      // 1. Get next entry number
      const entryCountResult = await client.query(
        'SELECT COALESCE(MAX(entry_number), 0) as max_entry FROM entries WHERE user_id = $1 AND pool_id = $2',
        [userId, poolId]
      );
      const nextEntryNumber = entryCountResult.rows[0].max_entry + 1;

      // 2. Create entry
      const entryResult = await client.query(
        `INSERT INTO entries (user_id, pool_id, entry_number, status, entry_fee_cents)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, poolId, nextEntryNumber, 'active', 1000]
      );

      const entryId = entryResult.rows[0].id;

      // 3. Deduct from credits and/or balance
      if (creditsToUse > 0) {
        await client.query(
          'UPDATE users SET credit_cents = credit_cents - $1 WHERE id = $2',
          [creditsToUse, userId]
        );
      }
      if (balanceToUse > 0) {
        await client.query(
          'UPDATE users SET balance_cents = balance_cents - $1 WHERE id = $2',
          [balanceToUse, userId]
        );
      }

      // 4. Record transaction
      const paymentSource = creditsToUse > 0 && balanceToUse > 0
        ? `credits ($${(creditsToUse/100).toFixed(2)}) + balance ($${(balanceToUse/100).toFixed(2)})`
        : creditsToUse > 0
        ? 'credits'
        : 'balance';

      await client.query(
        `INSERT INTO transactions (
          user_id, type, status, amount_cents, fee_cents, net_amount_cents,
          payment_provider, pool_id, entry_id, description, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId,
          'entry_purchase',
          'completed',
          1000,
          0,
          1000,
          'balance',
          poolId,
          entryId,
          `Entry purchase for Matchday ${pool.gameweek} using ${paymentSource}`,
          JSON.stringify({ creditsUsed: creditsToUse, balanceUsed: balanceToUse })
        ]
      );

      // 5. Create pick if team selected
      if (teamId && teamName) {
        await client.query(
          `INSERT INTO picks (entry_id, gameweek, pool_id, team_id, team_name, match_id, result)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [entryId, pool.gameweek, poolId, teamId, teamName, matchId, 'pending']
        );
      }

      // 6. Update pool totals
      await client.query(
        `UPDATE pools SET
          total_entries = total_entries + 1,
          prize_pool_cents = prize_pool_cents + 1000,
          platform_fee_cents = prize_pool_cents * 0.1,
          winner_payout_cents = prize_pool_cents * 0.9
         WHERE id = $1`,
        [poolId]
      );

      return { entryId, entryNumber: nextEntryNumber };
    });

    // Log in audit log
    await query(
      `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        userId,
        'entry_purchased_balance',
        JSON.stringify({ poolId, entryId: result.entryId }),
        req.ip || req.connection.remoteAddress
      ]
    );

    res.json({
      success: true,
      data: {
        entryId: result.entryId,
        entryNumber: result.entryNumber,
        message: 'Entry purchased with balance!'
      }
    });
  } catch (error) {
    console.error('Purchase with balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase entry'
    });
  }
}

// Guest create order (no auth required)
async function createGuestOrder(req, res) {
  try {
    const { poolId, teamId, teamName, matchId } = req.body;

    // Validate pool exists and is active
    const poolResult = await query(
      'SELECT id, gameweek, status, entry_deadline FROM pools WHERE id = $1',
      [poolId]
    );

    if (poolResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      });
    }

    const pool = poolResult.rows[0];

    // Check if pool is accepting entries
    if (pool.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'This pool has already ended'
      });
    }

    // Check deadline
    if (new Date() > new Date(pool.entry_deadline)) {
      return res.status(400).json({
        success: false,
        error: 'Entry deadline has passed'
      });
    }

    // Create PayPal order
    const request = {
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: '10.00'
            },
            description: `The Great Escape - Matchday ${pool.gameweek} Entry`,
            customId: JSON.stringify({
              poolId,
              teamId,
              teamName,
              matchId,
              guest: true
            })
          }
        ],
        applicationContext: {
          returnUrl: `${process.env.FRONTEND_URL || 'https://the-great-escape-frontend-production.up.railway.app'}/payment/success`,
          cancelUrl: `${process.env.FRONTEND_URL || 'https://the-great-escape-frontend-production.up.railway.app'}/payment/cancel`,
          brandName: 'The Great Escape',
          landingPage: 'BILLING',
          userAction: 'PAY_NOW'
        }
      }
    };

    console.log('Creating PayPal order with request:', JSON.stringify(request, null, 2));
    const response = await ordersController.createOrder(request);
    const order = response.result;
    console.log('PayPal order created successfully:', order.id);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        approvalUrl: order.links.find(link => link.rel === 'approve').href
      }
    });
  } catch (error) {
    console.error('Create guest order error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.response) {
      console.error('PayPal API Response:', error.response);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
}

// Guest capture order - Auto-creates account from PayPal data
async function captureGuestOrder(req, res) {
  try {
    const { orderId } = req.body;

    // Capture the payment
    const request = { id: orderId };
    const response = await ordersController.captureOrder(request);
    const capturedOrder = response.result;

    console.log('Captured order:', JSON.stringify(capturedOrder, null, 2));

    if (capturedOrder.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Extract custom data - it's nested in payments.captures[0].customId
    const customIdString =
      capturedOrder.purchaseUnits?.[0]?.payments?.captures?.[0]?.customId ||
      capturedOrder.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ||
      capturedOrder.purchaseUnits?.[0]?.customId ||
      capturedOrder.purchase_units?.[0]?.custom_id;

    console.log('Custom ID string:', customIdString);

    if (!customIdString) {
      console.error('No custom_id found in captured order');
      return res.status(400).json({
        success: false,
        error: 'Order metadata not found'
      });
    }

    const customData = JSON.parse(customIdString);
    const { poolId, teamId, teamName, matchId } = customData;

    // Extract PayPal payer data
    const paypalPayerId = capturedOrder.payer?.payer_id;
    const payerEmail = capturedOrder.payer?.email_address;
    const payerName = capturedOrder.payer?.name;

    if (!paypalPayerId || !payerEmail) {
      return res.status(400).json({
        success: false,
        error: 'PayPal payer information not found'
      });
    }

    // Check if user already exists with this PayPal account
    let userId;
    const existingUserResult = await query(
      'SELECT id FROM users WHERE paypal_payer_id = $1',
      [paypalPayerId]
    );

    if (existingUserResult.rows.length > 0) {
      // User exists, use their ID
      userId = existingUserResult.rows[0].id;
    } else {
      // Create new user from PayPal data
      const firstName = payerName?.given_name || 'Guest';
      const lastName = payerName?.surname || 'User';

      // Generate a random password (they'll use PayPal to login)
      const tempPassword = Math.random().toString(36).slice(-12);
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const newUserResult = await query(
        `INSERT INTO users (
          email, password_hash, first_name, last_name,
          paypal_payer_id, paypal_email, account_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          payerEmail,
          passwordHash,
          firstName,
          lastName,
          paypalPayerId,
          payerEmail,
          'active'
        ]
      );

      userId = newUserResult.rows[0].id;

      // Log registration in audit log
      await query(
        `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          'user_registered_via_paypal',
          JSON.stringify({ email: payerEmail, orderId }),
          req.ip || req.connection.remoteAddress
        ]
      );
    }

    // Now process the entry (same as authenticated flow)
    const result = await transaction(async (client) => {
      // 1. Add $10 to user balance
      await client.query(
        'UPDATE users SET balance_cents = balance_cents + 1000 WHERE id = $1',
        [userId]
      );

      // 2. Record deposit transaction
      const depositResult = await client.query(
        `INSERT INTO transactions (
          user_id, type, status, amount_cents, fee_cents, net_amount_cents,
          payment_provider, provider_transaction_id, payment_method, pool_id, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          userId,
          'deposit',
          'completed',
          1000,
          0,
          1000,
          'paypal',
          orderId,
          'paypal',
          poolId,
          'Entry fee payment via PayPal'
        ]
      );

      const depositTransactionId = depositResult.rows[0].id;

      // 3. Get next entry number for this user/pool
      const entryCountResult = await client.query(
        'SELECT COALESCE(MAX(entry_number), 0) as max_entry FROM entries WHERE user_id = $1 AND pool_id = $2',
        [userId, poolId]
      );
      const nextEntryNumber = entryCountResult.rows[0].max_entry + 1;

      // 4. Create entry
      const entryResult = await client.query(
        `INSERT INTO entries (user_id, pool_id, entry_number, status, entry_fee_cents, transaction_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [userId, poolId, nextEntryNumber, 'active', 1000, depositTransactionId]
      );

      const entryId = entryResult.rows[0].id;

      // 5. Deduct $10 from balance
      await client.query(
        'UPDATE users SET balance_cents = balance_cents - 1000 WHERE id = $1',
        [userId]
      );

      // 6. Record entry purchase transaction
      await client.query(
        `INSERT INTO transactions (
          user_id, type, status, amount_cents, fee_cents, net_amount_cents,
          payment_provider, pool_id, entry_id, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          userId,
          'entry_purchase',
          'completed',
          1000,
          0,
          1000,
          'balance',
          poolId,
          entryId,
          `Entry purchase for Matchday ${poolId}`
        ]
      );

      // 7. Create pick if team was selected
      if (teamId && teamName) {
        const poolResult = await client.query('SELECT gameweek FROM pools WHERE id = $1', [poolId]);
        const gameweek = poolResult.rows[0].gameweek;

        await client.query(
          `INSERT INTO picks (entry_id, gameweek, pool_id, team_id, team_name, match_id, result)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [entryId, gameweek, poolId, teamId, teamName, matchId, 'pending']
        );
      }

      // 8. Update pool totals
      await client.query(
        `UPDATE pools SET
          total_entries = total_entries + 1,
          prize_pool_cents = prize_pool_cents + 1000,
          platform_fee_cents = prize_pool_cents * 0.1,
          winner_payout_cents = prize_pool_cents * 0.9
         WHERE id = $1`,
        [poolId]
      );

      return { entryId, entryNumber: nextEntryNumber };
    });

    // Log in audit log
    await query(
      `INSERT INTO audit_log (user_id, event_type, event_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        userId,
        'entry_purchased_guest',
        JSON.stringify({ poolId, entryId: result.entryId, orderId }),
        req.ip || req.connection.remoteAddress
      ]
    );

    res.json({
      success: true,
      data: {
        entryId: result.entryId,
        entryNumber: result.entryNumber,
        userId: userId,
        email: payerEmail,
        message: 'Entry purchased successfully! Account created.'
      }
    });
  } catch (error) {
    console.error('Capture guest order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
}

module.exports = {
  createOrder,
  captureOrder,
  purchaseWithBalance,
  createGuestOrder,
  captureGuestOrder
};
