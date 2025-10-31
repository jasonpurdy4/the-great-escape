-- Migration 003: Add team_crest column to picks table
-- This stores the team logo URL from football-data.org API

ALTER TABLE picks ADD COLUMN IF NOT EXISTS team_crest VARCHAR(255);

-- Add comment
COMMENT ON COLUMN picks.team_crest IS 'Team logo/crest URL from football-data.org API';
