-- Create a test pool for Matchday 10
-- Run this in Railway's PostgreSQL database

INSERT INTO pools (
  gameweek,
  season,
  status,
  entry_deadline,
  pick_deadline,
  first_match_kickoff,
  total_entries,
  prize_pool_cents,
  platform_fee_cents,
  winner_payout_cents
) VALUES (
  10,                                    -- Matchday 10
  '2024-25',                            -- Season
  'active',                             -- Status
  '2025-11-01 14:00:00+00',            -- Entry deadline (before first match)
  '2025-11-01 14:00:00+00',            -- Pick deadline
  '2025-11-01 15:00:00+00',            -- First match kickoff
  0,                                    -- Total entries (starts at 0)
  0,                                    -- Prize pool in cents
  0,                                    -- Platform fee in cents
  0                                     -- Winner payout in cents
)
RETURNING id, gameweek, entry_deadline;
