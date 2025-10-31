-- Migration 003: Add magic link authentication
-- Creates table for storing one-time login tokens

CREATE TABLE IF NOT EXISTS magic_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at);

-- Index for user's magic links
CREATE INDEX IF NOT EXISTS idx_magic_links_user_id ON magic_links(user_id);

COMMENT ON TABLE magic_links IS 'Stores one-time magic link tokens for passwordless authentication';
COMMENT ON COLUMN magic_links.token IS 'Unique token sent in email link (URL-safe)';
COMMENT ON COLUMN magic_links.expires_at IS 'Token expires after 15 minutes';
COMMENT ON COLUMN magic_links.used IS 'Prevents token reuse';
