# The Great Escape - Project Memory

**Last Updated:** October 28, 2025
**Project:** The Great Escape - Premier League Survival Pool

---

## 👤 Who You Are (Your Personas)

You are two different personas working together:

1. **World-Class Engineer (Google → Startups)**
   - Decade at Google, last 5 years at startups
   - Get things done the right way, but keep it easy and efficient
   - Lean more on **fast than perfect**
   - Ship quickly, iterate based on real usage

2. **Stanford CS Professor**
   - Teaching incoming 18-year-old CS students
   - Explain big decisions with patience and clarity
   - Help Jason understand the "why" behind technical choices
   - Make complex concepts accessible

**In Practice:** Build quickly (persona 1), but explain every decision so we learn together (persona 2). This creates better collaboration and helps Jason level up while shipping fast.

---

## 💡 CRITICAL WORKFLOW PRINCIPLE: Ask Before You Code

**Jason LOVES when you ask clarifying questions before jumping into code!**

**Why this matters:**
- Prevents wasted time on wrong assumptions
- Ensures we're solving the RIGHT problem
- Makes collaboration more efficient
- Builds better solutions faster

**How to do it:**
1. **Read the request carefully** - Understand what Jason is asking for
2. **Identify ambiguities** - What's unclear? What could go multiple ways?
3. **Ask specific questions** - Multiple choice format works great (e.g., "Is it A, B, or C?")
4. **Wait for confirmation** - Don't guess, get the real answer
5. **Then code** - Now you can build the right thing the first time

**Examples:**
- "Should the leaderboard update live during matches, or only after full-time?"
- "When someone doesn't pick, do we assign: A) Any random team, B) Random from unused teams, or C) Best odds team?"
- "Do you want payments processed immediately, or should there be a cart/checkout flow?"

**Remember:** 30 seconds of questions can save 30 minutes of coding the wrong thing!

---

## 🎯 Project Overview

**The Great Escape** is a Premier League survival pool where players compete to be the last one standing.

### Core Concept
- Pay $10 per entry
- Pick a winning team each gameweek
- Can't reuse teams
- Draw or loss = eliminated
- Last survivor(s) win the pot (90% payout, 10% platform fee)

### Key Decision: Pool Structure
After extensive Q&A, we determined:
- **38 separate pools** (one starts each gameweek)
- Each entry continues across gameweeks until eliminated
- Players compete only against others who entered the same gameweek pool
- Example: Gameweek 5 pool entries pick teams from GW5 onward until eliminated

---

## 📸 Latest Session Snapshot

**⚠️ IMPORTANT: This section gets OVERWRITTEN each session - it's NOT a running log!**

Each time you start a new session, replace this entire section with a fresh 1-2 paragraph summary of what we just worked on. Keep it concise - just the highlights of what was accomplished and what's next.

---

### Session: October 28, 2025 - MVP SHIPPED! 🚀

**What We Accomplished:**
MASSIVE SESSION! Created entire project from concept to working MVP in one go! ✨ **Planning:** Nailed down all mechanics through extensive Q&A (38 separate pools, $10 entries, team reuse rules, public leaderboards). Brainstormed names, chose "The Great Escape" (relegation battle theme). **API:** Tested multiple providers (RapidAPI was terrible!), landed on football-data.org with working integration pulling real Premier League data. **Branding:** Created complete brand guidelines - navy blue (#1a2332) + burgundy red (#8b1e3f), Inter font, professional/trustworthy vibe, handcuffs logo concept. **Built MVP:** Full React frontend + Node/Express backend. Landing page with hero section, features, email signup. KILLER team selection page showing real PL Matchday 9 fixtures with team crests, match times, pick tracking. Everything committed to GitHub.

**What's Next:**
Test locally (backend on :5000, frontend on :3000). Deploy to Railway for live demo. Add database (PostgreSQL) for real data persistence. Payment integration (need Stripe alternative). User authentication. Then we're LIVE! 🎉

---

## 🔗 Important Links

**GitHub Repository:**
- https://github.com/jasonpurdy4/the-great-escape

**Key Documentation:**
- PROJECT_SPEC.md - Full product specification

---

## 🎨 Design & Branding

**Name:** The Great Escape (referencing the famous football term for avoiding relegation)

**Tagline Ideas:**
- "Can you pull off the great escape?"
- "Avoid the drop. Win the pot."
- "Every gameweek is a battle for survival."

**Visual Identity (TBD):**
- Colors: Green (survival) + Red (elimination)?
- Logo: Life preserver? Parachute? Escape imagery
- Tone: Dramatic, urgent, fun

---

## 🚀 Technology Stack (Planned)

- **Frontend:** React.js (responsive web)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (structured data, important for transactions)
- **Hosting:** Railway
- **Real-time:** Socket.io or Server-Sent Events
- **Payment:** TBD (Stripe concerns, need alternatives)
- **EPL Data:** TBD (researching APIs)

---

## ⚠️ Open Questions & Decisions Needed

### 1. EPL API Selection
- Need reliable fixture/score data
- Must have gameweek assignments
- Real-time or near-real-time updates
- **Options:** football-data.org, API-Football, TheSportsDB

### 2. Payment Processing
- Stripe likely violates terms (gambling/sweepstakes)
- **Alternatives needed:**
  - Cryptocurrency?
  - Specialized gambling processors?
  - Frame as "skill-based fantasy"?
  - Start with play money?

### 3. Legal/Compliance
- Age verification (18+, 21+ in some states)
- Geo-restrictions based on gambling laws
- Terms of service
- Tax reporting for winnings
- **Need:** Legal consultation before launch

---

## 📋 Phase 1 MVP Scope

**Must-Have:**
1. User signup/login
2. Payment processing (once resolved)
3. Pool entry system
4. Pick submission (before deadline)
5. Fixture/score integration
6. Elimination logic (automated)
7. Public leaderboard
8. Basic admin panel

**Explicitly Out of Scope (Phase 2+):**
- Mobile apps
- Gameweek 38 special format (parlay picks)
- Private pools
- Multiple entry tiers
- Push notifications
- Advanced analytics

---

## 💭 Design Philosophy

**Fast over Perfect:**
- Ship MVP quickly
- Validate concept with real users
- Iterate based on feedback
- Don't over-engineer early

**User Experience:**
- Make it dead simple to enter and pick
- Public leaderboards create excitement
- Real-time updates during matches
- Mobile-responsive (web first, apps later)

**Revenue Model:**
- 10% of all pools
- Simple, transparent
- Scale through volume, not complexity

---

## 🎓 Learning Goals

As we build this, Jason wants to understand:
- How pool/entry logic works at scale
- Real-time data synchronization patterns
- Payment processing considerations
- API integration best practices
- Database design for transactional systems

**Remember:** Explain the "why" behind technical decisions!

---

**End of Project Memory**
