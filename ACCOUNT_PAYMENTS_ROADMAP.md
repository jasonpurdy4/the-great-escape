# Account Management & Payments Implementation Roadmap
## The Great Escape - Phase 1 (Accounts + PayPal Integration)

**Branch:** `feature/account-management-payments`
**Created:** October 29, 2025
**Estimated Timeline:** 4-6 weeks (development) + 1-2 months (PayPal approval)

---

## 📋 Overview

This roadmap covers implementing the complete account management and payment system for The Great Escape, using PayPal/Braintree as the payment provider.

### What We're Building:
1. User registration and authentication system
2. User profiles with KYC (Know Your Customer) data
3. PayPal/Braintree payment integration
4. Entry purchase flow ($10 per entry)
5. Account balance management
6. Payout system for winners
7. Transaction history
8. Age verification (18+/21+)

---

## 🗂️ Key Documents Created

1. **`PAYPAL_APPROVAL_GUIDE.md`** - Complete guide for obtaining PayPal merchant approval
2. **`backend/schema.sql`** - PostgreSQL database schema for all tables
3. **This roadmap** - Step-by-step implementation plan

---

## 🏗️ Architecture Overview

### Current Stack:
- **Frontend:** React 19 (already exists)
- **Backend:** Node.js + Express 5 (minimal implementation exists)
- **Database:** PostgreSQL (pg installed, not configured yet)
- **Payment:** PayPal/Braintree (to be integrated)

### New Dependencies Needed:

**Backend:**
```json
{
  "bcrypt": "^5.1.1",              // Password hashing
  "jsonwebtoken": "^9.0.2",        // JWT authentication
  "braintree": "^3.19.0",          // Braintree SDK
  "@paypal/payouts-sdk": "^1.1.0", // PayPal Payouts API
  "express-validator": "^7.0.1",   // Input validation
  "helmet": "^7.1.0",              // Security headers
  "express-rate-limit": "^7.1.5"   // Rate limiting
}
```

**Frontend:**
```json
{
  "braintree-web": "^3.95.0",      // Braintree Web SDK
  "react-router-dom": "^6.20.1",   // Routing (if not installed)
  "axios": "^1.6.2"                // HTTP client (if not installed)
}
```

---

## 📊 Database Schema Summary

See `backend/schema.sql` for full schema. Key tables:

1. **users** - User accounts, auth, KYC data, PayPal info
2. **email_waitlist** - Landing page email signups
3. **pools** - 38 separate pools (one per gameweek)
4. **entries** - User entries into pools
5. **picks** - Team selections per gameweek
6. **transactions** - All financial transactions
7. **payouts** - Winner payouts
8. **sessions** - JWT token management
9. **audit_log** - Security and compliance logging
10. **teams** - Premier League teams (cached from API)
11. **matches** - Match data (cached from API)

---

## 🛣️ Implementation Phases

---

### **Phase 1: Database Setup (Week 1)**

#### Tasks:
1. Set up PostgreSQL database (local + production)
2. Run schema.sql to create tables
3. Configure database connection in backend
4. Create database utility functions (query helpers)

#### Files to Create:
- `backend/db/connection.js` - PostgreSQL connection pool
- `backend/db/queries.js` - Reusable query functions
- `backend/db/migrations/` - Future migrations folder
- `.env` file updates for `DATABASE_URL`

#### Acceptance Criteria:
- ✅ Can connect to database from backend
- ✅ All tables created successfully
- ✅ Can run basic CRUD operations
- ✅ Database connection pooling configured

---

### **Phase 2: User Authentication (Week 1-2)**

#### 2A: User Registration

**Backend API Endpoints:**
```
POST /api/auth/register
Body: {
  email, password, firstName, lastName, dateOfBirth,
  addressLine1, city, state, zipCode, country
}
Response: { user: {...}, token: "JWT..." }
```

**Features:**
- Email validation and uniqueness check
- Password hashing with bcrypt (min 8 chars, complexity requirements)
- Age verification (18+ or 21+ depending on state)
- State-based eligibility check (block prohibited states)
- Create session with JWT token
- Send verification email (future: email service integration)

**Files:**
- `backend/routes/auth.js` - Auth routes
- `backend/controllers/authController.js` - Auth logic
- `backend/middleware/validators.js` - Input validation
- `backend/utils/jwt.js` - JWT token utilities
- `backend/utils/emailService.js` - Email sending (stub for now)

#### 2B: User Login

**Backend API Endpoints:**
```
POST /api/auth/login
Body: { email, password }
Response: { user: {...}, token: "JWT..." }
```

**Features:**
- Email/password validation
- bcrypt password comparison
- Create new session
- Return JWT token
- Update last_login_at timestamp
- Audit log entry

**Files:**
- Same as 2A, extend existing files

#### 2C: Authentication Middleware

**Features:**
- JWT verification middleware
- Attach user to request object
- Session validation
- Token expiration handling (7-day expiry)

**Files:**
- `backend/middleware/auth.js` - Auth middleware
- `backend/middleware/requireAuth.js` - Protected route wrapper

#### 2D: Frontend Authentication

**Components:**
- `frontend/src/components/Auth/Register.js` - Registration form
- `frontend/src/components/Auth/Login.js` - Login form
- `frontend/src/components/Auth/ProtectedRoute.js` - Route guard
- `frontend/src/context/AuthContext.js` - Auth state management
- `frontend/src/utils/api.js` - API client with auth headers

**Features:**
- Registration form with validation
- Login form
- JWT storage (localStorage or httpOnly cookies)
- Auto-logout on token expiry
- Protected routes (dashboard, team selection)

#### Acceptance Criteria:
- ✅ Users can register with full validation
- ✅ Age verification works (18+/21+)
- ✅ Prohibited states are blocked
- ✅ Users can login and receive JWT
- ✅ JWT stored securely in frontend
- ✅ Protected routes require authentication
- ✅ Logout functionality works
- ✅ Session management in database

---

### **Phase 3: User Profile & Dashboard (Week 2)**

#### Backend API Endpoints:
```
GET /api/users/me - Get current user profile
PUT /api/users/me - Update profile
GET /api/users/me/entries - Get user's entries
GET /api/users/me/transactions - Get transaction history
GET /api/users/me/balance - Get account balance
```

#### Frontend Components:
- `frontend/src/pages/Dashboard.js` - User dashboard
- `frontend/src/components/Profile/ProfileCard.js` - Profile display
- `frontend/src/components/Profile/EditProfile.js` - Edit profile
- `frontend/src/components/Transactions/TransactionHistory.js` - Transaction list
- `frontend/src/components/Balance/BalanceCard.js` - Account balance display

#### Features:
- View profile information
- Edit profile (address, phone, PayPal email)
- View entry history (active, eliminated, winners)
- View transaction history
- View account balance
- Withdrawal request (to PayPal)

#### Acceptance Criteria:
- ✅ User dashboard shows profile, entries, balance
- ✅ Can update profile information
- ✅ Transaction history displays correctly
- ✅ Balance updates after transactions

---

### **Phase 4: PayPal/Braintree Integration (Week 3)**

**PREREQUISITE:** PayPal merchant approval must be submitted during this phase. Integration can be built in sandbox mode while waiting for approval.

#### 4A: Braintree Setup

1. Create Braintree sandbox account
2. Get API credentials (Merchant ID, Public Key, Private Key)
3. Configure Braintree gateway in backend
4. Test sandbox transactions

**Files:**
- `backend/config/braintree.js` - Braintree configuration
- `backend/services/paymentService.js` - Payment processing logic

#### 4B: Entry Purchase Flow

**Backend API Endpoints:**
```
POST /api/payments/client-token
Response: { clientToken: "..." } // For Braintree Drop-in UI

POST /api/payments/purchase-entry
Body: {
  poolId: 1,
  numberOfEntries: 2, // $20 for 2 entries
  paymentMethodNonce: "..." // From Braintree frontend
}
Response: {
  success: true,
  entries: [{id: 1, entryNumber: 1}, {id: 2, entryNumber: 2}],
  transaction: {...}
}
```

**Payment Flow:**
1. User selects pool and number of entries
2. Frontend requests client token from backend
3. Braintree Drop-in UI loads (handles payment method collection)
4. User enters payment info (card, PayPal, Venmo)
5. Braintree tokenizes payment → returns nonce
6. Frontend sends nonce to backend
7. Backend creates Braintree transaction
8. If successful: Create entries, record transaction, update pool totals
9. Return success + entry details

**Files:**
- `backend/routes/payments.js` - Payment routes
- `backend/controllers/paymentController.js` - Payment logic
- `backend/services/braintreeService.js` - Braintree API wrapper
- `frontend/src/components/Payment/PurchaseEntryFlow.js` - Payment UI
- `frontend/src/components/Payment/BraintreeDropIn.js` - Braintree component

#### 4C: Store Payment Methods (Optional)

Allow users to save payment methods for faster checkout:
- Store Braintree customer ID in users table
- Create payment methods using Braintree Vault
- Display saved payment methods
- One-click purchase for returning users

#### Acceptance Criteria:
- ✅ Can generate Braintree client token
- ✅ Braintree Drop-in UI loads correctly
- ✅ Can purchase entries with credit card (sandbox)
- ✅ Can purchase entries with PayPal (sandbox)
- ✅ Entries created correctly in database
- ✅ Transactions recorded accurately
- ✅ Pool totals update correctly
- ✅ Error handling for failed payments
- ✅ Idempotency (prevent double-charging)

---

### **Phase 5: Payout System (Week 4)**

#### 5A: Determine Winners

**Backend Logic:**
After all gameweek matches complete:
1. Query all active entries for a pool
2. Check if any entries have zero losses/draws
3. If survivors exist → mark as winners
4. If no survivors (everyone eliminated same gameweek) → refund scenario
5. Calculate payout amounts (90% of pot split among winners)

**Files:**
- `backend/services/poolService.js` - Pool management logic
- `backend/jobs/processResults.js` - Automated result processing (cron job)

#### 5B: PayPal Payouts API Integration

**Backend API Endpoints:**
```
POST /api/admin/payouts/process-pool/:poolId
Response: { payouts: [...], totalPaid: 90000 }

GET /api/users/me/payouts
Response: { payouts: [{amount: 90000, status: "completed", ...}] }

POST /api/users/me/withdraw
Body: { amountCents: 50000, paypalEmail: "user@example.com" }
Response: { success: true, payoutId: "..." }
```

**PayPal Payouts Flow:**
1. Winner determined (entry status = 'winner')
2. Create payout record in database
3. Call PayPal Payouts API to send money
4. Update payout status (processing → completed/failed)
5. Create transaction record
6. Update user account balance (if using balance system)
7. Send email notification to winner

**Files:**
- `backend/services/payoutService.js` - Payout logic
- `backend/services/paypalService.js` - PayPal Payouts API wrapper
- `backend/routes/payouts.js` - Payout routes (admin + user)
- `backend/jobs/processPayouts.js` - Automated payout processing

#### 5C: Refund Scenario

If everyone in a pool is eliminated the same gameweek:
1. Calculate refund amount (90% of entry fee per entry)
2. Refund via original payment method (Braintree API)
3. Platform keeps 10%
4. Update entry status to 'refunded'
5. Send refund confirmation email

**Files:**
- `backend/services/refundService.js` - Refund logic

#### 5D: Tax Reporting (1099 Forms)

For winners receiving $600+ in a calendar year:
- Track total payouts per user per year
- Generate 1099-MISC forms (future integration with tax service)
- Collect SSN/TIN from users (when needed)
- Store tax documents securely

**Files:**
- `backend/services/taxService.js` - Tax reporting logic (stub for now)

#### Acceptance Criteria:
- ✅ Winners correctly identified after gameweek completes
- ✅ Payout amounts calculated correctly (90% split)
- ✅ Can send PayPal payout to winner (sandbox)
- ✅ Payout status tracked in database
- ✅ Refunds work when everyone eliminated
- ✅ Transaction history shows payouts
- ✅ Email notifications sent (stub OK for now)

---

### **Phase 6: Admin Dashboard (Week 4-5)**

#### Admin API Endpoints:
```
GET /api/admin/stats - Platform statistics
GET /api/admin/users - User list with filters
GET /api/admin/pools/:poolId - Pool details
GET /api/admin/transactions - All transactions
POST /api/admin/users/:userId/ban - Ban user
POST /api/admin/pools/:poolId/payouts/process - Process pool payouts manually
```

#### Admin Frontend:
- `frontend/src/pages/Admin/Dashboard.js` - Admin overview
- `frontend/src/pages/Admin/Users.js` - User management
- `frontend/src/pages/Admin/Pools.js` - Pool management
- `frontend/src/pages/Admin/Transactions.js` - Transaction monitoring
- `frontend/src/pages/Admin/Payouts.js` - Payout processing

#### Features:
- Platform statistics (total users, entries, revenue)
- User management (view, ban, verify)
- Pool management (view entries, manually trigger payouts)
- Transaction monitoring
- Fraud detection alerts
- Manual payout processing

#### Acceptance Criteria:
- ✅ Admin can view platform stats
- ✅ Admin can manage users
- ✅ Admin can view pool details
- ✅ Admin can manually process payouts if needed
- ✅ Admin role protected by middleware

---

### **Phase 7: Security & Compliance (Week 5-6)**

#### 7A: Security Hardening

**Measures:**
- Helmet.js for security headers
- Rate limiting on auth endpoints (prevent brute force)
- CSRF protection
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- HTTPS only in production
- Secure JWT storage (httpOnly cookies vs localStorage)

**Files:**
- `backend/middleware/security.js` - Security middleware
- `backend/middleware/rateLimiter.js` - Rate limiting
- Update all routes with security middleware

#### 7B: Audit Logging

Log critical events:
- User registration/login
- Entry purchases
- Pick submissions
- Payouts
- Admin actions
- Failed login attempts
- Suspicious activity

**Files:**
- `backend/services/auditService.js` - Audit logging
- Update controllers to call audit service

#### 7C: Age Verification

Enhanced age verification:
- Calculate age from date of birth
- Check state requirements (18+ vs 21+)
- Block underage users
- Verify date format and realistic dates

#### 7D: State Compliance

**Prohibited states:**
- Washington, Montana, Louisiana, Arizona, Iowa, Nevada (partial)

**Implementation:**
- IP geolocation lookup (optional)
- State selection during registration
- Block purchases from prohibited states
- Display compliance message

**Files:**
- `backend/utils/compliance.js` - State eligibility checks
- `backend/config/states.js` - State rules configuration

#### 7E: KYC (Know Your Customer)

For larger payouts ($600+), may need:
- SSN/TIN collection
- Identity verification (future: integration with Stripe Identity or Persona)
- Address verification
- Flag accounts requiring KYC before payout

#### Acceptance Criteria:
- ✅ All security middleware implemented
- ✅ Rate limiting active on auth routes
- ✅ Audit logs recording critical events
- ✅ Age verification working correctly
- ✅ Prohibited states blocked
- ✅ KYC framework in place (even if not fully automated)

---

### **Phase 8: Testing & Bug Fixes (Week 6)**

#### Testing Checklist:

**Authentication:**
- [ ] Registration with valid data succeeds
- [ ] Registration with invalid email fails
- [ ] Registration with weak password fails
- [ ] Registration under 18 is blocked
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password fails
- [ ] JWT token expires correctly
- [ ] Logout clears session

**Payments:**
- [ ] Can purchase 1 entry successfully
- [ ] Can purchase multiple entries (2, 3, 4)
- [ ] Payment failure handled gracefully
- [ ] Duplicate payment prevented (idempotency)
- [ ] Transaction recorded correctly
- [ ] Pool totals update correctly
- [ ] Card payment works (sandbox)
- [ ] PayPal payment works (sandbox)
- [ ] Venmo payment works (sandbox)

**Payouts:**
- [ ] Winners identified correctly
- [ ] Payout amounts calculated correctly
- [ ] PayPal payout succeeds (sandbox)
- [ ] Refunds work when everyone eliminated
- [ ] Account balance updates correctly

**Security:**
- [ ] Unauthorized users can't access protected routes
- [ ] Rate limiting prevents brute force
- [ ] SQL injection attempts fail
- [ ] XSS attempts sanitized
- [ ] Audit logs recording events

**Edge Cases:**
- [ ] User purchases entry after deadline (should fail)
- [ ] User picks same team twice for same entry (should fail)
- [ ] Match postponed (should count as automatic win)
- [ ] Multiple winners split pot correctly
- [ ] Zero survivors triggers refund

---

## 📝 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh JWT
- `POST /api/auth/forgot-password` - Password reset (future)

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/me/entries` - Get user's entries
- `GET /api/users/me/transactions` - Get transactions
- `GET /api/users/me/balance` - Get account balance
- `POST /api/users/me/withdraw` - Request withdrawal

### Pools
- `GET /api/pools` - List all pools
- `GET /api/pools/:id` - Get pool details
- `GET /api/pools/:id/entries` - Get pool entries (leaderboard)

### Payments
- `POST /api/payments/client-token` - Get Braintree token
- `POST /api/payments/purchase-entry` - Purchase entry

### Picks
- `POST /api/picks` - Submit pick for entry
- `GET /api/picks/:entryId` - Get picks for entry

### Admin
- `GET /api/admin/stats` - Platform stats
- `GET /api/admin/users` - User list
- `POST /api/admin/users/:id/ban` - Ban user
- `GET /api/admin/pools/:id` - Pool admin view
- `POST /api/admin/pools/:id/payouts/process` - Process payouts

---

## 🚀 Deployment Checklist

### Environment Variables Needed:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Braintree (Sandbox)
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key
BRAINTREE_ENVIRONMENT=sandbox

# Braintree (Production - after approval)
# BRAINTREE_ENVIRONMENT=production

# PayPal Payouts
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox

# Email Service (future)
SENDGRID_API_KEY=your_sendgrid_key

# Football Data API (already have)
FOOTBALL_API_TOKEN=5a09c0f3cece4cab8d1dda6c1b07582b

# App Settings
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://the-great-escape.com
```

### Database Setup:
1. Create PostgreSQL database on Railway/Heroku/AWS RDS
2. Run `backend/schema.sql` to create tables
3. Populate teams and matches from football-data.org API
4. Create initial pool records for season gameweeks

### Production Checklist:
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Error logging (Sentry or similar)
- [ ] Braintree in production mode (after approval)
- [ ] PayPal Payouts in production mode
- [ ] Automated backups configured
- [ ] Monitoring/alerts set up

---

## 📅 Parallel Workstreams

While building the system, **start the PayPal approval process immediately:**

### Week 1-2:
- **Dev:** Database setup + Authentication
- **Business:** Form LLC, get EIN, open business bank account

### Week 3-4:
- **Dev:** Payment integration (sandbox mode)
- **Business:** Submit PayPal merchant approval application

### Week 5-6:
- **Dev:** Payout system + testing
- **Business:** Respond to PayPal questions, provide additional docs

### Week 7-8:
- **Dev:** Polish, bug fixes, admin dashboard
- **Business:** Receive approval, switch to production mode

**Goal:** Have fully built system ready to go live immediately when PayPal approves.

---

## 🎯 Success Metrics

After Phase 1 completion, you'll have:

✅ Complete user registration and authentication
✅ User profiles with KYC data collection
✅ Entry purchase flow with PayPal/Braintree
✅ Account balance system
✅ Payout system for winners
✅ Transaction history and reporting
✅ Admin dashboard for management
✅ Security and compliance measures
✅ Age and state verification
✅ Audit logging

**Then:** Launch marketing campaign to fill Gameweek 1 pool and start accepting real money!

---

## 📞 Support & Resources

- **PayPal Business Support:** 1-888-221-1161
- **Braintree Developer Docs:** developers.braintreepayments.com
- **PayPal Payouts Docs:** developer.paypal.com/docs/payouts
- **PostgreSQL Docs:** postgresql.org/docs
- **Express.js Docs:** expressjs.com
- **React Docs:** react.dev

---

## ❓ Questions to Clarify Before Coding

**Hey Jason!** Before I start building, let me ask a few questions to make sure I build exactly what you want:

1. **Account Balance vs Direct Payout:**
   - Option A: Winnings go to user's account balance, they request withdrawal
   - Option B: Winnings paid directly to PayPal immediately
   - **Which do you prefer?**

2. **Payment Methods:**
   - Braintree supports: Credit cards, PayPal, Venmo, Apple Pay, Google Pay
   - **Do you want all of these, or start with just cards + PayPal?**

3. **Database Hosting:**
   - Railway (easy), AWS RDS (more control), Heroku (simple)
   - **Where do you want to host the PostgreSQL database?**

4. **Email Service:**
   - For sending registration confirmations, payout notifications, etc.
   - Options: SendGrid, AWS SES, Postmark
   - **Which email service? Or should I stub it for now?**

5. **Admin Access:**
   - Create a special admin user manually? Or build admin registration?
   - **How do you want admin accounts created?**

6. **Multiple Entries UX:**
   - When buying 3 entries, should user name them? ("Arsenal Strategy", "Safe Picks", etc.)
   - Or just "Entry #1", "Entry #2", "Entry #3"?
   - **What's better for users?**

Let me know your preferences and I'll start building! 🚀
