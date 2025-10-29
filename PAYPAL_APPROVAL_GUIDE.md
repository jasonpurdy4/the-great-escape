# PayPal/Braintree Merchant Approval Guide
## The Great Escape - Skill-Based Gaming Application

**Created:** October 29, 2025
**Purpose:** Guide for obtaining PayPal/Braintree approval for fantasy sports payment processing

---

## Overview

PayPal/Braintree **prohibits** gambling and sweepstakes by default, BUT they **allow skill-based gaming with prior written approval**. The Great Escape qualifies as skill-based fantasy sports, similar to DraftKings and FanDuel.

---

## Step 1: Prepare Your Application

### Required Documentation

1. **Business Information**
   - Legal business name and structure (LLC, Corporation, etc.)
   - EIN (Employer Identification Number)
   - Business address
   - Business bank account information
   - Expected monthly processing volume

2. **Skill-Based Gaming Justification**
   Write a clear explanation showing this is skill-based, not gambling:

   ```
   The Great Escape is a skill-based Premier League survival pool game where
   players use their football knowledge to predict match winners each gameweek.

   WHY IT'S SKILL-BASED:
   - Requires knowledge of Premier League teams, form, tactics, and matchups
   - Players must strategically manage their team selections across 38 gameweeks
   - Success depends on football expertise, not random chance
   - Similar to daily fantasy sports (DraftKings, FanDuel) which PayPal supports
   - NOT casino games, slots, or pure chance-based gambling
   ```

3. **Compliance Documentation**
   - Age verification process (18+ minimum, 21+ in some states)
   - State-by-state availability plan
   - Terms of Service draft
   - Responsible gaming policies
   - Anti-fraud measures
   - Player dispute resolution process

4. **Business Model**
   - Entry fee: $10 per entry
   - Platform fee: 10% of prize pool
   - Payout structure: Last survivor(s) split 90% of pot
   - Volume projections: Start conservative (100-500 entries/week)

5. **Technical Implementation Plan**
   - Website: https://the-great-escape.com (your domain)
   - Integration method: Braintree SDK
   - Payment methods: Cards, PayPal, Venmo
   - Security measures: SSL, PCI compliance via Braintree
   - User authentication: JWT tokens with email verification

---

## Step 2: Legal Business Setup

**CRITICAL:** You must have a legal business entity before applying.

### Recommended Steps:

1. **Form an LLC or Corporation**
   - Protects personal liability
   - Required for merchant accounts
   - Cost: $100-500 depending on state
   - Timeline: 1-2 weeks
   - Services: LegalZoom, ZenBusiness, or local attorney

2. **Get an EIN**
   - Free from IRS website
   - Takes 5 minutes online
   - Link: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online

3. **Open Business Bank Account**
   - Separate from personal finances
   - Required for PayPal business account
   - Most banks offer online business checking

4. **Consider Gaming Attorney Consultation**
   - Budget: $2,000-5,000
   - They can help with:
     - State-by-state compliance
     - Terms of Service
     - PayPal application review
     - Ongoing legal support
   - Recommended: Gaming Law specialists (Google "fantasy sports attorney")

---

## Step 3: Submit PayPal Application

### Application Process:

1. **Create PayPal Business Account**
   - Go to paypal.com/business
   - Complete business verification
   - Link business bank account

2. **Contact PayPal Risk/Underwriting Team**
   - Call PayPal Business Support: 1-888-221-1161
   - Ask for "Merchant Underwriting for Skill-Based Gaming"
   - Reference: "Similar to DraftKings/FanDuel model"

3. **Submit Documentation Package**
   - All items from Step 1 above
   - Be prepared to answer questions about:
     - How you verify it's skill-based
     - Your age verification process
     - State compliance plan
     - Fraud prevention measures
     - Expected processing volume

4. **Alternative: Apply via Braintree Directly**
   - Visit: braintreepayments.com
   - Click "Get Started" or "Contact Sales"
   - Fill out inquiry form
   - Select industry: "Fantasy Sports" or "Skill Gaming"
   - Mention you need approval for skill-based gaming

---

## Step 4: What PayPal Will Evaluate

### Approval Criteria:

✅ **What Helps Your Case:**
- Clearly skill-based mechanics (picking winners = football knowledge)
- Established business entity with proper documentation
- Comprehensive age verification
- State compliance plan (avoiding prohibited states)
- Responsible gaming features (spending limits, self-exclusion)
- Professional website with clear terms
- Fraud prevention measures
- Similar to approved platforms (DraftKings, FanDuel)

❌ **What Hurts Your Case:**
- Calling it "gambling" anywhere
- Accepting entries from prohibited states
- No age verification
- Unclear business structure
- Poor fraud prevention
- Sketchy terms of service

---

## Step 5: Timeline & Expectations

### Realistic Timeline:

- **Business Setup:** 1-2 weeks
- **PayPal Application:** 1-4 weeks for review
- **Back-and-forth Questions:** 1-2 weeks
- **Final Approval:** 2-6 weeks total

**Total estimated timeline: 1-2 months**

### If Approved:

1. Complete Braintree SDK integration (1 week dev time)
2. Test in sandbox environment
3. Go live with payment processing
4. Monitor transactions closely (PayPal may review periodically)

### If Denied:

**Fallback options:**
1. Ask for detailed denial reason
2. Address concerns and reapply
3. Consider alternatives:
   - Aeropay (gaming-specific, easier approval)
   - Crypto/stablecoin payments (no approval needed)
   - Specialized gaming processors (QuadraPay, PayKings)

---

## Step 6: State-by-State Compliance

### States Where Paid Fantasy Sports Are Prohibited:

❌ **Fully Prohibited:**
- Washington
- Montana
- Louisiana (some exceptions)
- Arizona (some exceptions)
- Iowa (some exceptions)
- Nevada (requires gaming license)

⚠️ **Age 21+ Required:**
- Alabama
- Massachusetts
- Michigan

✅ **Generally Allowed (Age 18+):**
- Most other states

**IMPORTANT:** This is simplified. Consult a gaming attorney for full compliance.

### Implementation:
- Collect user location during signup
- Block prohibited states
- Verify age appropriately per state
- Display clear terms about eligibility

---

## Step 7: Alternative Payment Strategy

While waiting for PayPal approval, you could:

### Option A: Soft Launch with Waitlist
- Build everything except payments
- Collect email waitlist
- Show "Coming Soon - Payment Processing Approval In Progress"
- Build hype while approval processes

### Option B: Start with Crypto
- Accept USDC/USDT via Coinbase Commerce
- No approval needed
- Launch immediately to test product-market fit
- Add PayPal once approved for mainstream adoption

### Option C: Play Money Version
- Launch with virtual currency first
- Prove the concept works
- Show PayPal you have real traction
- Makes approval easier when you apply

---

## Key Contacts & Resources

**PayPal Business Support:**
- Phone: 1-888-221-1161
- Say: "I need approval for skill-based fantasy sports gaming"

**Braintree Sales:**
- Website: braintreepayments.com/contact
- Email: sales@braintreepayments.com

**Fantasy Sports & Gaming Attorneys:**
- Ifrah Law (Washington DC) - Gaming law specialists
- Eckert Seamans (Multi-state) - Fantasy sports experience
- (Google: "fantasy sports attorney" for more options)

**Industry Resources:**
- Fantasy Sports & Gaming Association (FSGA): thefsga.org
- American Gaming Association (AGA): americangaming.org

---

## Sample Email to PayPal/Braintree

```
Subject: Merchant Application - Skill-Based Fantasy Sports Platform

Dear PayPal/Braintree Underwriting Team,

I am applying for merchant approval for "The Great Escape," a skill-based
Premier League survival pool platform, similar in mechanics to DraftKings
and FanDuel daily fantasy sports.

BUSINESS OVERVIEW:
- Legal Entity: [Your LLC Name]
- EIN: [Your EIN]
- Platform: Web-based fantasy sports competition
- Entry Fee: $10 per entry
- Platform Fee: 10% of prize pools

WHY WE QUALIFY AS SKILL-BASED GAMING:
Our platform requires players to use their Premier League football knowledge
to predict match winners each gameweek. Success depends on understanding
team form, tactics, injuries, and matchups - not random chance. This is
similar to daily fantasy sports platforms you already support.

COMPLIANCE MEASURES:
- Age verification: 18+ (21+ where required)
- State restrictions: Blocking prohibited jurisdictions
- Terms of Service: Clear rules and responsible gaming policies
- Fraud prevention: Multi-factor authentication, withdrawal verification
- Tax reporting: 1099 forms for winners over $600

I have attached our business documentation, compliance plan, and technical
specifications. I am available to discuss our application and answer any
questions.

Thank you for your consideration.

Best regards,
[Your Name]
[Your Title]
[Your Business Name]
[Contact Information]
```

---

## Next Steps for The Great Escape

1. ✅ Research complete (you're here!)
2. ⏳ Form LLC/business entity (1-2 weeks)
3. ⏳ Get EIN and business bank account (1 week)
4. ⏳ Consider attorney consultation ($2-5k optional but recommended)
5. ⏳ Prepare documentation package (1 week)
6. ⏳ Submit PayPal/Braintree application (then wait 2-6 weeks)
7. ⏳ While waiting: Build full platform with mock payments
8. ⏳ Once approved: Integrate Braintree SDK and go live

---

## Final Thoughts

PayPal approval is achievable for The Great Escape because:
- ✅ It's genuinely skill-based (not pure chance)
- ✅ Similar platforms (DFS) are already approved
- ✅ You're willing to implement proper compliance
- ✅ You have a legitimate business model

The key is presenting it professionally with proper documentation and legal structure. This is not a quick process, but it's the most mainstream and trusted payment option for your target market.

**Budget for this process: $3,000-7,000**
- LLC formation: $100-500
- Attorney consultation: $2,000-5,000
- Business setup costs: $500-1,000

**Timeline: 1-2 months from start to approval**

Good luck! Let me know if you have questions about any step.
