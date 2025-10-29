// Payment Controller
const { client: paypalClient } = require('../config/paypal');
const { OrdersController } = require('@paypal/paypal-server-sdk');
const { query, transaction } = require('../db/connection');

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
          returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
          cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
          brandName: 'The Great Escape',
          landingPage: 'BILLING',
          userAction: 'PAY_NOW'
        }
      }
    };

    const response = await ordersController.ordersCreate(request);
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
    const response = await ordersController.ordersCapture(request);
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

    // Use transaction to ensure atomicity
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
        'entry_purchased',
        JSON.stringify({ poolId, entryId: result.entryId, orderId }),
        req.ip || req.connection.remoteAddress
      ]
    );

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

    // Get user balance
    const userResult = await query(
      'SELECT balance_cents FROM users WHERE id = $1',
      [userId]
    );

    const balance = userResult.rows[0].balance_cents;

    if (balance < 1000) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        balance: balance / 100
      });
    }

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

      // 3. Deduct from balance
      await client.query(
        'UPDATE users SET balance_cents = balance_cents - 1000 WHERE id = $1',
        [userId]
      );

      // 4. Record transaction
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
          `Entry purchase for Matchday ${pool.gameweek} using balance`
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

module.exports = {
  createOrder,
  captureOrder,
  purchaseWithBalance
};
