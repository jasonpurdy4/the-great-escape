-- Migration: Add PayPal account locking and separate credits from balance
-- Created: October 29, 2025

-- Add PayPal payer ID to lock accounts to PayPal accounts
ALTER TABLE users
ADD COLUMN paypal_payer_id VARCHAR(255) UNIQUE;

-- Add index for faster lookups
CREATE INDEX idx_users_paypal_payer ON users(paypal_payer_id);

-- Add credits column (non-withdrawable, entry-only)
ALTER TABLE users
ADD COLUMN credit_cents INTEGER DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN users.balance_cents IS 'Withdrawable balance (winnings + deposits)';
COMMENT ON COLUMN users.credit_cents IS 'Non-withdrawable credits (referral bonuses, entry-only)';
COMMENT ON COLUMN users.paypal_payer_id IS 'PayPal payer ID - prevents duplicate accounts';
