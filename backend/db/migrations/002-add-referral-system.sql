-- Migration: Add referral system columns
-- Date: 2025-10-29
-- Purpose: Enable referral tracking and credit rewards

-- Add referral tracking columns to users table
ALTER TABLE users
ADD COLUMN referral_code VARCHAR(20) UNIQUE,
ADD COLUMN referred_by INTEGER REFERENCES users(id),
ADD COLUMN referral_credited BOOLEAN DEFAULT FALSE;

-- Create index for faster referral code lookups
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- Create referrals table to track referral history and stats
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  referred_id INTEGER NOT NULL REFERENCES users(id),
  credit_awarded BOOLEAN DEFAULT FALSE,
  credit_awarded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(referrer_id, referred_id)  -- Prevent duplicate referral relationships
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);

-- Add comments
COMMENT ON COLUMN users.referral_code IS 'Unique referral code for this user (e.g., TGE123ABC)';
COMMENT ON COLUMN users.referred_by IS 'User ID of who referred this user';
COMMENT ON COLUMN users.referral_credited IS 'Whether referral credit has been awarded to both parties';
COMMENT ON TABLE referrals IS 'Tracks all referral relationships and credit awards';
