# API Integration Plan - football-data.org

**Last Updated:** October 28, 2025
**Status:** ✅ Tested and Working

---

## ✅ Decision: football-data.org

**Why we chose it:**
- Clean, simple REST API
- Official Premier League data
- Has "matchday" (gameweek) data built-in
- Real-time score updates (updates every few minutes)
- Free tier: 10 requests/minute (enough for MVP)
- Excellent documentation
- No marketplace BS

**Rejected:**
- ❌ RapidAPI - Confusing, broken endpoints, terrible UX
- ❌ TheSportsDB - Community-driven, reliability concerns
- ❌ API-Football - Too expensive, overcomplicated for our needs

---

## 🔑 Credentials

**API Token:** `5a09c0f3cece4cab8d1dda6c1b07582b`

**Base URL:** `https://api.football-data.org/v4`

**Rate Limit:** 10 requests/minute (free tier)

**Upgrade:** $19/month if we need more calls

---

## 📊 Key Endpoints We'll Use

### 1. Get All Matches for a Matchday
```bash
GET https://api.football-data.org/v4/competitions/PL/matches?matchday=9
Headers: X-Auth-Token: 5a09c0f3cece4cab8d1dda6c1b07582b
```

**Response Data:**
- Match ID
- UTC Date/Time
- Status: "SCHEDULED", "LIVE", "PAUSED", "FINISHED", "POSTPONED"
- Matchday number (1-38)
- Home/Away team data (id, name, shortName, crest logo)
- Scores (fullTime, halfTime)
- Winner: "HOME_TEAM", "AWAY_TEAM", "DRAW"
- Last updated timestamp

### 2. Get Current Season Info
```bash
GET https://api.football-data.org/v4/competitions/PL/matches
Headers: X-Auth-Token: 5a09c0f3cece4cab8d1dda6c1b07582b
```

**Response includes:**
- Current matchday number
- Total matches (380)
- Season start/end dates
- All matches (can filter by matchday, status, date range)

### 3. Get Teams
```bash
GET https://api.football-data.org/v4/competitions/PL/teams
Headers: X-Auth-Token: 5a09c0f3cece4cab8d1dda6c1b07582b
```

**Response:**
- All 20 Premier League teams
- Team IDs, names, crests (logos)
- Venue info
- Squad info (if needed later)

---

## 🔄 How We'll Use It

### Initial Data Load (One-time)
1. **Fetch all teams** → Store in database
2. **Fetch season schedule** → Store all 380 matches with matchday assignments
3. **Identify current matchday** → From season.currentMatchday

### During Each Matchday

**1. Pre-Match (Before First Kickoff)**
- Users make picks
- Deadline: 1 hour before first match of matchday

**2. During Matches**
- **Poll every 2-5 minutes** (well within 10 req/min limit)
- Fetch matchday fixtures: `/competitions/PL/matches?matchday=X`
- Update match scores in database
- Track status changes (LIVE → FINISHED)

**3. Post-Match (1 hour after each match)**
- Process eliminations for that specific match
- Check if user's picked team:
  - Won → Still alive ✅
  - Drew → Eliminated ❌
  - Lost → Eliminated ❌

**4. End of Matchday**
- All matches finished
- All eliminations processed
- Update leaderboards
- Notify survivors

---

## 📈 API Call Estimates

### Per Matchday:
- **10 matches** × **90 minutes average**
- Poll every **5 minutes** = **18 calls per match**
- Total: **180 calls per matchday** (spread over ~8 hours on match days)
- **Average: ~22 calls/hour** = Well under 10 req/min limit ✅

### Non-Match Days:
- Minimal calls (just checking schedule updates)
- **1-2 calls/day**

### Total Monthly (Rough):
- **4 matchdays/month** × **180 calls** = **720 calls**
- Plus daily checks: **60 calls/month**
- **Total: ~800 calls/month**
- Free tier: **10 req/min** = **14,400 req/day** = **432,000 req/month**
- **We're using 0.2% of our limit** 🎉

---

## 🚨 Edge Cases to Handle

### 1. Postponed Matches
- API status: `"POSTPONED"`
- **Our rule:** Counts as a win for anyone who picked that team
- Check status when processing eliminations

### 2. API Downtime
- **Backup plan:** Cache last known state
- Show "Scores updating..." message
- Retry with exponential backoff
- If down > 1 hour, send alert to us

### 3. Late Score Updates
- API updates every few minutes (not instant)
- **Our buffer:** Process eliminations 1 hour after full-time
- Gives plenty of time for API to finalize scores

### 4. Rate Limit Hit
- Unlikely (we're well under limit)
- If hit: Queue requests, process slower
- Upgrade to paid tier if persistent

---

## 🔧 Database Schema Needs

### Teams Table
```sql
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,          -- API team ID
  name VARCHAR(100),               -- Full name
  short_name VARCHAR(50),          -- Short name
  code VARCHAR(3),                 -- 3-letter code (e.g., "LIV")
  crest_url VARCHAR(255),          -- Logo URL
  created_at TIMESTAMP
);
```

### Matches Table
```sql
CREATE TABLE matches (
  id INTEGER PRIMARY KEY,          -- API match ID
  matchday INTEGER,                -- 1-38
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  kickoff_time TIMESTAMP,          -- UTC
  status VARCHAR(20),              -- SCHEDULED, LIVE, FINISHED, etc.
  home_score INTEGER,
  away_score INTEGER,
  winner VARCHAR(20),              -- HOME_TEAM, AWAY_TEAM, DRAW
  last_updated TIMESTAMP,
  created_at TIMESTAMP
);
```

### Picks Table (references teams via API IDs)
```sql
CREATE TABLE picks (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES entries(id),
  matchday INTEGER,
  team_id INTEGER REFERENCES teams(id),  -- Picked team
  result VARCHAR(10),              -- WIN, DRAW, LOSS, PENDING
  created_at TIMESTAMP
);
```

---

## 📝 Implementation Steps

### Phase 1: Data Seeding
1. Create tables (teams, matches)
2. Fetch and store all 20 PL teams
3. Fetch and store all 380 matches for season
4. Identify current matchday

### Phase 2: Real-time Updates
1. Build polling service (runs every 5 min during match days)
2. Update match scores/status in database
3. Trigger elimination logic when matches finish

### Phase 3: Elimination Logic
1. When match status = "FINISHED"
2. Wait 1 hour (buffer time)
3. For each pick on that team:
   - Check if team won
   - If not, mark entry as eliminated
4. Update leaderboards

---

## 🎯 Next Steps

1. ✅ ~~Sign up for API~~
2. ✅ ~~Test endpoints~~
3. ✅ ~~Document integration plan~~
4. **TODO:** Set up backend project structure
5. **TODO:** Build teams/matches seed script
6. **TODO:** Build polling service
7. **TODO:** Build elimination processor

---

**API Status:** ✅ Ready to integrate!
