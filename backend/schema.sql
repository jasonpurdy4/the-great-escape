-- The Great Escape Database Schema
-- PostgreSQL 14+
-- Created: October 29, 2025

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user account information including authentication and KYC data

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hashed password
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,          -- For age verification
  phone_number VARCHAR(20),

  -- Address for compliance/payouts
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',      -- ISO country code

  -- Account status
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  kyc_verified BOOLEAN DEFAULT FALSE,   -- Know Your Customer verification
  account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned

  -- PayPal integration
  paypal_email VARCHAR(255),            -- For payouts
  braintree_customer_id VARCHAR(255),   -- Braintree customer ID

  -- Account balance (holds winnings before withdrawal)
  balance_cents INTEGER DEFAULT 0,      -- Store in cents to avoid decimal issues

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Indexes for performance
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT age_verification CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_braintree ON users(braintree_customer_id);


-- ============================================================================
-- EMAIL WAITLIST TABLE
-- ============================================================================
-- Stores email signups from landing page before users create full accounts

CREATE TABLE email_waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(50),                   -- landing_page, referral, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  converted_to_user BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_waitlist_email ON email_waitlist(email);


-- ============================================================================
-- POOLS TABLE
-- ============================================================================
-- Represents the 38 separate pools (one per Premier League gameweek)

CREATE TABLE pools (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER NOT NULL UNIQUE,     -- 1-38
  season VARCHAR(10) NOT NULL,          -- e.g., "2024-25"

  -- Pool status
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, active, completed

  -- Entry deadline (1 hour before first match)
  entry_deadline TIMESTAMP NOT NULL,
  pick_deadline TIMESTAMP NOT NULL,     -- Same as entry_deadline
  first_match_kickoff TIMESTAMP NOT NULL,

  -- Financial tracking
  total_entries INTEGER DEFAULT 0,
  prize_pool_cents INTEGER DEFAULT 0,   -- Total entry fees (entries × $10)
  platform_fee_cents INTEGER DEFAULT 0, -- 10% of prize pool
  winner_payout_cents INTEGER DEFAULT 0, -- 90% of prize pool

  -- Payout status
  winners_paid BOOLEAN DEFAULT FALSE,
  payout_completed_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pools_gameweek ON pools(gameweek);
CREATE INDEX idx_pools_status ON pools(status);


-- ============================================================================
-- ENTRIES TABLE
-- ============================================================================
-- Represents individual entries into pools (users can have multiple entries)

CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,

  -- Entry tracking
  entry_number INTEGER NOT NULL,        -- User's nth entry (1, 2, 3, etc.)
  entry_name VARCHAR(100),              -- Optional name like "Entry #1"

  -- Status tracking
  status VARCHAR(20) DEFAULT 'active',  -- active, eliminated, winner, refunded
  eliminated_at TIMESTAMP,
  elimination_gameweek INTEGER,         -- Which gameweek they were eliminated

  -- Financial
  entry_fee_cents INTEGER NOT NULL DEFAULT 1000, -- $10 = 1000 cents
  transaction_id INTEGER, -- Will add foreign key constraint later

  -- Teams used by this entry (for reuse prevention)
  teams_used INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Array of team IDs

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, pool_id, entry_number)
);

CREATE INDEX idx_entries_user ON entries(user_id);
CREATE INDEX idx_entries_pool ON entries(pool_id);
CREATE INDEX idx_entries_status ON entries(status);


-- ============================================================================
-- PICKS TABLE
-- ============================================================================
-- Stores team selections for each entry per gameweek

CREATE TABLE picks (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  gameweek INTEGER NOT NULL,
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,

  -- Pick details
  team_id INTEGER NOT NULL,             -- From football-data.org API
  team_name VARCHAR(100) NOT NULL,      -- e.g., "Arsenal FC"
  match_id INTEGER,                     -- football-data.org match ID

  -- Pick timing
  picked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_auto_pick BOOLEAN DEFAULT FALSE,   -- True if system assigned due to no pick

  -- Result tracking
  result VARCHAR(20),                   -- pending, win, draw, loss, postponed
  match_score VARCHAR(20),              -- e.g., "2-1"
  processed_at TIMESTAMP,               -- When result was processed

  -- Constraints
  UNIQUE(entry_id, gameweek),
  CONSTRAINT valid_result CHECK (result IN ('pending', 'win', 'draw', 'loss', 'postponed'))
);

CREATE INDEX idx_picks_entry ON picks(entry_id);
CREATE INDEX idx_picks_gameweek ON picks(gameweek);
CREATE INDEX idx_picks_result ON picks(result);


-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
-- All financial transactions (entries, deposits, withdrawals, refunds)

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction type
  type VARCHAR(20) NOT NULL,            -- entry_purchase, payout, refund, withdrawal
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded

  -- Amounts (always in cents)
  amount_cents INTEGER NOT NULL,
  fee_cents INTEGER DEFAULT 0,          -- Processing fees
  net_amount_cents INTEGER NOT NULL,    -- Amount after fees

  -- Payment provider details
  payment_provider VARCHAR(50),         -- braintree, paypal, crypto
  provider_transaction_id VARCHAR(255), -- Braintree/PayPal transaction ID
  payment_method VARCHAR(50),           -- credit_card, paypal, venmo

  -- Related entities
  entry_id INTEGER REFERENCES entries(id),
  pool_id INTEGER REFERENCES pools(id),

  -- Metadata
  description TEXT,
  metadata JSONB,                       -- Flexible storage for provider-specific data

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  CONSTRAINT valid_type CHECK (type IN ('entry_purchase', 'payout', 'refund', 'withdrawal', 'deposit')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'))
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider_id ON transactions(provider_transaction_id);


-- ============================================================================
-- PAYOUTS TABLE
-- ============================================================================
-- Tracks payouts to winners

CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,

  -- Payout details
  amount_cents INTEGER NOT NULL,
  shares INTEGER DEFAULT 1,             -- If multiple winners, how many shares of pot
  total_shares INTEGER DEFAULT 1,       -- Total shares to split (if 3 winners = 3 shares)

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed

  -- Payment details
  transaction_id INTEGER REFERENCES transactions(id),
  payment_method VARCHAR(50),           -- paypal, bank_account, account_balance
  paypal_payout_id VARCHAR(255),        -- PayPal Payouts API ID

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,

  CONSTRAINT valid_payout_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_payouts_user ON payouts(user_id);
CREATE INDEX idx_payouts_pool ON payouts(pool_id);
CREATE INDEX idx_payouts_status ON payouts(status);


-- ============================================================================
-- SESSIONS TABLE (for JWT token management)
-- ============================================================================
-- Stores active user sessions for logout/revocation

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE, -- Hashed JWT token

  -- Session details
  ip_address VARCHAR(45),               -- IPv4 or IPv6
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);


-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
-- Track important user actions for fraud prevention and compliance

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Event details
  event_type VARCHAR(50) NOT NULL,      -- login, pick_submitted, entry_purchased, etc.
  event_data JSONB,                     -- Flexible JSON storage

  -- Request details
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_type ON audit_log(event_type);
CREATE INDEX idx_audit_created ON audit_log(created_at);


-- ============================================================================
-- PREMIER LEAGUE TEAMS TABLE (REFERENCE DATA)
-- ============================================================================
-- Cache of Premier League teams from football-data.org API

CREATE TABLE teams (
  id INTEGER PRIMARY KEY,               -- football-data.org team ID
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(50),
  tla VARCHAR(10),                      -- Three-letter abbreviation
  crest_url TEXT,                       -- Team logo URL

  -- Metadata
  season VARCHAR(10) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_name ON teams(name);


-- ============================================================================
-- MATCHES TABLE (REFERENCE DATA)
-- ============================================================================
-- Cache of Premier League matches from football-data.org API

CREATE TABLE matches (
  id INTEGER PRIMARY KEY,               -- football-data.org match ID
  season VARCHAR(10) NOT NULL,
  gameweek INTEGER NOT NULL,

  -- Match details
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  utc_date TIMESTAMP NOT NULL,
  status VARCHAR(20),                   -- SCHEDULED, LIVE, FINISHED, POSTPONED

  -- Score
  home_score INTEGER,
  away_score INTEGER,

  -- Metadata
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_gameweek ON matches(gameweek);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(utc_date);


-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pools_updated_at BEFORE UPDATE ON pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- INITIAL DATA - Create pools for 2024-25 season
-- ============================================================================
-- Note: entry_deadline and first_match_kickoff need to be updated with real dates

-- Example: Gameweek 1 (dates are placeholders - update with real fixture data)
INSERT INTO pools (gameweek, season, status, entry_deadline, pick_deadline, first_match_kickoff)
VALUES (1, '2024-25', 'upcoming', '2024-08-16 18:00:00', '2024-08-16 18:00:00', '2024-08-16 19:00:00');

-- TODO: Add remaining 37 gameweeks with actual Premier League fixture dates


-- ============================================================================
-- USEFUL QUERIES FOR ADMIN DASHBOARD
-- ============================================================================

-- View active entries per pool
-- SELECT p.gameweek, COUNT(e.id) as active_entries, SUM(e.entry_fee_cents) as total_pot_cents
-- FROM pools p
-- LEFT JOIN entries e ON p.id = e.pool_id AND e.status = 'active'
-- GROUP BY p.gameweek
-- ORDER BY p.gameweek;

-- View user's entries and picks
-- SELECT e.id, e.entry_number, e.status, p.gameweek, p.team_name, p.result
-- FROM entries e
-- LEFT JOIN picks p ON e.id = p.entry_id
-- WHERE e.user_id = ?
-- ORDER BY e.entry_number, p.gameweek;

-- Find winners for a specific pool
-- SELECT u.email, e.id as entry_id, e.entry_number
-- FROM entries e
-- JOIN users u ON e.user_id = u.id
-- WHERE e.pool_id = ? AND e.status = 'active'
-- AND NOT EXISTS (
--   SELECT 1 FROM picks pk
--   WHERE pk.entry_id = e.id
--   AND pk.result IN ('draw', 'loss')
-- );
