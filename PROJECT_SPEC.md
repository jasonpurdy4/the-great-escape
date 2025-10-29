# The Great Escape - Project Specification

**Last Updated:** October 28, 2025
**Version:** 1.0 (Phase 1)

---

## 🎯 Concept Overview

**The Great Escape** is a Premier League survival pool where players compete to be the last one standing. Each gameweek starts a new pool, and entries continue across multiple gameweeks until eliminated. Players must pick a winning team each week, and once a team is picked, it can't be used again. The last survivor(s) split the pot.

**Tagline Ideas:**
- "Can you pull off the great escape?"
- "Avoid the drop. Win the pot."
- "Every gameweek is a battle for survival."

---

## 🏆 Core Mechanics

### Pool Structure
- **38 separate pools** (one starts each Premier League gameweek)
- Each pool entry continues across gameweeks until eliminated
- Players compete only against others who entered the same gameweek pool

### Entry & Payment
- **$10 per entry**
- Players can buy multiple entries ($20 = 2 entries, $40 = 4 entries, etc.)
- Each entry is independent and tracks its own team usage
- Payment = immediate eligibility to make picks for that pool

### How It Works (Example)

**Scenario: I buy 2 entries ($20) for Gameweek 5 Pool**

**Entry #1:**
- Gameweek 5: Pick Arsenal (win) ✅ → Still alive
- Gameweek 6: Pick Newcastle (win) ✅ → Still alive
- Gameweek 7: Pick Man City (draw) ❌ → ELIMINATED

**Entry #2:**
- Gameweek 5: Pick Arsenal (win) ✅ → Still alive
- Gameweek 6: Pick Liverpool (win) ✅ → Still alive
- Gameweek 7: Pick Tottenham (win) ✅ → Still alive
- Continues...

**Key Points:**
- Both entries can pick the same team in the same gameweek
- Once a team is used by an entry, that specific entry can't use that team again
- Each entry can survive ~20 gameweeks max (20 teams in Premier League)
- Both entries compete in the "Gameweek 5 Pool" against all other Gameweek 5 entries

---

## 📋 Rules & Regulations

### Picking Rules
1. **Must pick a winner** - Draw or loss = elimination
2. **One team per gameweek per entry**
3. **No team reuse** - Once an entry picks a team, that entry can't pick them again
4. **Pick deadline:** 1 hour before the first match of the gameweek kicks off
5. **No pick submitted** = Random team assigned from unused teams for that entry
6. **Cancelled/postponed matches** = Automatic win for anyone who picked that team

### Elimination Rules
- Eliminations processed **1 hour after full-time whistle**
- Draw = Eliminated
- Loss = Eliminated
- Win = Survive to next gameweek

### Payout Rules
- **Last survivor(s) win** - Split pot equally if multiple survivors
- **Platform takes 10%** of total pot
- **If everyone loses in same gameweek** - Refund 90% to all participants (platform keeps 10%)
- **Season end (Gameweek 37)** - All remaining survivors split their pool's pot

### Visibility & Leaderboards
- **Fully public** leaderboards showing all entries and their status
- **Picks become visible** 1 hour before first match (same as deadline)
- **Real-time updates** during matches showing live standings
- Players can see:
  - Who's still alive in their pool
  - What teams everyone picked (after deadline)
  - Live match scores and elimination status
  - Total pot size

---

## 🎮 User Experience Flow

### 1. Landing Page
- Explanation of The Great Escape concept
- Current active gameweek pools
- Prize pot amounts
- "Enter Now" CTA

### 2. Sign Up / Login
- Email + password
- Age verification (18+)
- Terms & conditions (important for legal)

### 3. Enter Pool
- Select gameweek pool to enter
- Choose number of entries ($10 each)
- Payment via Stripe (or alternative)
- Confirmation + entry IDs

### 4. Make Picks
- View your active entries
- See teams you've already used (per entry)
- Select winning team for current gameweek
- Submit before deadline
- Confirmation screen

### 5. Watch Results
- Live leaderboard during matches
- See your entries' status (alive/eliminated)
- Match scores updating in real-time
- Notifications when eliminated or advance

### 6. Win!
- Winners announced 1 hour after last match
- Automatic payout to account
- Option to withdraw or roll into next gameweek

---

## 🔧 Technical Requirements

### Must-Have (Phase 1)
- User authentication (email/password)
- Payment processing (Stripe or alternative)
- Premier League fixtures API integration
- Live score updates
- Pool management system
- Pick submission system
- Elimination logic
- Public leaderboards
- Real-time updates (WebSocket or polling)
- Automated refunds (everyone loses scenario)
- Payout system

### Data Models Needed

**User:**
- id, email, password_hash, created_at, age_verified, stripe_customer_id

**Pool:**
- id, gameweek_number, season, entry_fee, total_pot, status (active/completed)

**Entry:**
- id, pool_id, user_id, status (alive/eliminated), eliminated_gameweek

**Pick:**
- id, entry_id, gameweek_number, team_id, result (pending/win/draw/loss)

**Team:**
- id, name, short_name, logo_url

**Fixture:**
- id, gameweek_number, home_team_id, away_team_id, kickoff_time, status, home_score, away_score

---

## 🌐 API Requirements

### Premier League Data API

**Need:**
- Season fixtures (all 380 matches)
- Gameweek assignments
- Live scores
- Match status (scheduled, live, finished, postponed)
- Team data (names, logos)

**Candidate APIs:**
1. **football-data.org** - Free tier available, reliable
2. **API-Football (RapidAPI)** - Comprehensive, paid
3. **TheSportsDB** - Free, community-driven
4. **Official Premier League API** - If accessible

**Requirements:**
- Real-time or near-real-time score updates
- Historical data for past gameweeks
- Reliable uptime during match days
- Reasonable rate limits

---

## 💳 Payment & Legal Considerations

### Stripe Concerns
- This is technically a **sweepstakes/pool betting**
- Stripe Terms prohibit gambling in many jurisdictions
- **Possible workarounds:**
  - Frame as "skill-based fantasy game" (picking winners = skill)
  - Restrict to legal jurisdictions only
  - Alternative: Use crypto payments, Plaid, or specialized gambling processors

### Legal Requirements
- **Age verification** (18+ minimum, 21+ in some US states)
- **Terms of Service** clearly stating rules, odds, no guarantees
- **Responsible gambling messaging**
- **Geo-restrictions** based on local laws
- **Tax reporting** (winnings over certain thresholds)
- Consider consulting with lawyer familiar with online gaming/sweepstakes

### Alternative Payment Options
- **Cryptocurrency** (no payment processor restrictions)
- **Play money** version first (test concept, build audience)
- **Sweepstakes model** (free entry + optional paid entries)

---

## 📱 Platform & Deployment

### Tech Stack (Suggested)
- **Frontend:** React.js (responsive web app)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (structured data, transactions important)
- **Hosting:** Railway (easy deployment, you mentioned this)
- **Real-time:** Socket.io or Server-Sent Events for live updates
- **Payment:** Stripe (if possible) or alternative

### MVP Features (Phase 1)
1. User registration/login
2. Enter a pool (payment)
3. Make picks
4. View fixtures and scores
5. See leaderboard
6. Elimination logic (automated)
7. Payout system (manual for now, automated later)

### Future Enhancements (Phase 2+)
- Mobile app (iOS/Android)
- Private pools (friends only)
- Different entry tiers ($5, $10, $25, $100)
- Season-long statistics
- Player profiles with history
- Referral system
- Push notifications
- Gameweek 38 special format (everyone picks all 10 matches)
- Other leagues (NFL survivor, La Liga, etc.)

---

## 🚀 Launch Strategy

### Phase 1: MVP Launch
- Target: Launch before next Premier League season (August 2026)
- Start with Gameweek 1 only
- Small marketing push (Reddit, Twitter/X, football forums)
- Goal: 100-500 entries to prove concept

### Phase 2: Scale
- Add multiple gameweek pools
- Improve UX based on feedback
- Marketing campaign
- Goal: 1,000+ active users

### Phase 3: Expand
- New leagues/sports
- Mobile apps
- Private pools
- Partnerships with football content creators

---

## 📊 Revenue Model

### Primary Revenue
- **10% of all prize pools**
- Example: $1,000 pot = $100 revenue, $900 to winners

### Potential Future Revenue
- Premium features (analytics, pick suggestions)
- Advertising (if free-to-play version)
- Private pool hosting fees
- Affiliate partnerships with sportsbooks (if legal)

---

## ✅ Next Steps

1. **Research EPL APIs** - Test free tiers, check reliability
2. **Resolve payment/legal** - Stripe alternatives, legal consultation
3. **Build signup page** - Simple MVP on Railway
4. **Create database schema** - Plan out all data models
5. **Build pick submission flow** - Core functionality
6. **Integrate API** - Fixtures and scores
7. **Build leaderboard** - Public-facing results
8. **Test with friends** - Private beta
9. **Launch!** 🚀

---

## 🎨 Branding Notes

### Visual Identity
- **Colors:** Green (survival) + Red (elimination)? Or classic football colors
- **Logo:** Life preserver? Parachute? Rope ladder? (escape imagery)
- **Tone:** Dramatic, urgent, fun - "every week is a battle"

### Marketing Angles
- "The most intense way to watch the Premier League"
- "Can you escape relegation for 38 weeks?"
- "Pick wrong once, you're out. Pick right, win the pot."

---

**End of Specification - Ready to Build! 🏗️**
