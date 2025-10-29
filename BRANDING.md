# The Great Escape - Brand Guidelines

**Last Updated:** October 28, 2025
**Status:** Approved ✅

---

## 🎨 Brand Identity

**Name:** The Great Escape

**Tagline:** "Survive the season. Win the pot."

**Positioning:** Professional, trustworthy Premier League survival pool. Clean, sophisticated, no gimmicks.

---

## 🎯 Brand Personality

- **Professional** - Users need to trust us with their money
- **Sophisticated** - Not flashy, not gimmicky, just quality
- **British** - English football culture, proper terminology
- **Confident** - We know what we're doing
- **Exciting** - High stakes, dramatic survival mechanic

**NOT:**
- ❌ Overly playful or cartoonish
- ❌ Aggressive or intimidating
- ❌ Cheap or amateur-looking
- ❌ American sports betting vibes

---

## 🎨 Color Palette

### Primary Colors

**Navy Blue** (Primary Brand Color)
- Hex: `#1a2332`
- RGB: `26, 35, 50`
- Use for: Headers, primary buttons, key text, navigation

**Burgundy Red** (Accent/Elimination)
- Hex: `#8b1e3f`
- RGB: `139, 30, 63`
- Use for: Elimination indicators, danger states, CTAs

### Secondary Colors

**White** (Background)
- Hex: `#ffffff`
- RGB: `255, 255, 255`
- Use for: Main backgrounds, cards, containers
- **Rule:** Lots of white space - clean, uncluttered

**Light Grey** (Subtle Backgrounds)
- Hex: `#f8f9fa`
- RGB: `248, 249, 250`
- Use for: Section backgrounds, subtle separators

**Medium Grey** (Body Text)
- Hex: `#6c757d`
- RGB: `108, 117, 125`
- Use for: Secondary text, descriptions

**Dark Grey** (Headings)
- Hex: `#2c3e50`
- RGB: `44, 62, 80`
- Use for: Headlines, important text (when navy is too strong)

### Status Colors

**Success Green** (Still Alive)
- Hex: `#2d6a4f`
- RGB: `45, 106, 79`
- Use for: Active entries, wins, positive states

**Warning Yellow** (Attention)
- Hex: `#f4a261`
- RGB: `244, 162, 97`
- Use for: Deadlines, warnings, important notices

**Elimination Red** (Out)
- Hex: `#8b1e3f` (Same as Burgundy)
- Use for: Eliminated entries, losses, negative states

---

## 🔤 Typography

### Primary Font: **Inter**

**Why Inter:**
- Modern, professional, highly readable
- Works beautifully at all sizes
- Designed for screens
- Clean, sophisticated aesthetic

**Font Weights to Use:**
- **Inter Bold (700)** - Headlines, major CTAs
- **Inter SemiBold (600)** - Subheadings, section titles
- **Inter Medium (500)** - Navigation, button text
- **Inter Regular (400)** - Body text, paragraphs
- **Inter Light (300)** - Small text, captions (use sparingly)

### Type Scale

**Hero Headline:** 56px / Bold / Navy (#1a2332)
**Page Headline:** 40px / Bold / Navy
**Section Heading:** 32px / SemiBold / Dark Grey (#2c3e50)
**Subheading:** 24px / SemiBold / Dark Grey
**Body Large:** 18px / Regular / Medium Grey (#6c757d)
**Body:** 16px / Regular / Medium Grey
**Small Text:** 14px / Regular / Medium Grey
**Tiny/Caption:** 12px / Regular / Medium Grey

**Line Height:** 1.5 (generous, readable)

---

## 🎭 Logo Concept

### Symbol: Handcuffs (Broken/Unlocked)

**Concept:**
- Handcuffs represent being "locked in" to the pool
- Breaking free/escaping = winning
- Simple, iconic, memorable
- Works in navy blue as primary version

**Logo Variations:**

1. **Primary Logo** - Handcuff icon + "The Great Escape" wordmark
   - Icon: Navy (#1a2332)
   - Text: Navy (#1a2332)
   - Use: Main logo everywhere

2. **Icon Only** - Just the handcuff symbol
   - Use: Favicon, app icon, social media avatar

3. **Reversed** - White logo on dark backgrounds
   - Icon + Text: White (#ffffff)
   - Use: Dark hero sections, footers

**Logo Spacing:**
- Generous padding around logo (minimum 20px clear space)
- Never stretch or distort
- Maintain aspect ratio always

---

## 🎨 UI Style Guidelines

### Overall Aesthetic
- **Lots of white space** - Don't cram everything together
- **Clean cards** - Subtle shadows, rounded corners (8px radius)
- **Clear hierarchy** - Use size, weight, and color to guide the eye
- **Minimal borders** - Use shadows and spacing instead
- **Professional buttons** - Solid colors, good padding, clear hover states

### Buttons

**Primary Button** (Main CTAs)
```
Background: Navy (#1a2332)
Text: White
Padding: 12px 32px
Border Radius: 8px
Font: Inter Medium (500), 16px
Hover: Slightly lighter navy (#2c3e50)
```

**Secondary Button** (Less important actions)
```
Background: White
Text: Navy (#1a2332)
Border: 2px solid Navy
Padding: 12px 32px
Border Radius: 8px
Font: Inter Medium (500), 16px
Hover: Light grey background (#f8f9fa)
```

**Danger Button** (Delete, eliminate actions)
```
Background: Burgundy Red (#8b1e3f)
Text: White
Padding: 12px 32px
Border Radius: 8px
Font: Inter Medium (500), 16px
Hover: Darker burgundy (#6b1730)
```

### Cards & Containers

```
Background: White (#ffffff)
Border: None (or 1px solid #e9ecef if needed)
Border Radius: 12px
Shadow: 0 2px 8px rgba(0,0,0,0.08)
Padding: 24px
```

### Input Fields

```
Background: White
Border: 2px solid #e9ecef
Border Radius: 8px
Padding: 12px 16px
Font: Inter Regular (400), 16px
Focus Border: Navy (#1a2332)
Placeholder: Medium Grey (#6c757d)
```

---

## 🏆 Key UI Components

### Team Selection Card (Most Important!)

```
[Team Logo/Crest - 60x60px]

Manchester City
vs Arsenal (A)  ← Away indicator
Saturday, 3:00 PM

[SELECT TEAM Button - Navy]
```

**States:**
- Default: White background, subtle shadow
- Hover: Light grey background (#f8f9fa), navy border
- Selected: Navy background, white text, checkmark
- Used (can't pick again): Greyed out, "Already Used" badge
- Eliminated team: Red badge showing "Lost"

### Leaderboard Entry

```
#3   [Avatar/Initial]   Jason P.   Arsenal (W)   🟢 ALIVE
```

**Colors:**
- Alive: Green dot (#2d6a4f)
- Eliminated: Red dot (#8b1e3f)
- Rank: Bold, Dark Grey
- Name: Navy

### Match Result Display

```
Liverpool  4  -  2  Bournemouth    ✅ WIN
```

**Result badges:**
- Win: Green checkmark + "WIN"
- Loss: Red X + "LOSS"
- Draw: Yellow dash + "DRAW"

---

## 📱 Responsive Design

**Breakpoints:**
- Mobile: 0-768px (single column, stack everything)
- Tablet: 769-1024px (2 columns where appropriate)
- Desktop: 1025px+ (3-4 columns, generous spacing)

**Mobile-First Approach:**
- Design for mobile first, scale up
- Large touch targets (minimum 44x44px)
- Readable text (minimum 16px body)
- Easy thumb navigation

---

## 🖼️ Page-Specific Guidelines

### Landing Page

**Hero Section:**
- Navy blue background (#1a2332)
- White text
- Large headline (56px)
- Clear CTA button (white button with navy text)
- Hero image/illustration optional (handcuff breaking free?)

**Features Section:**
- White background
- 3-column layout (desktop)
- Icons + short descriptions
- Generous spacing between sections

**How It Works:**
- Light grey background (#f8f9fa)
- Step-by-step with numbers
- Simple, visual

**CTA Section:**
- White or light grey background
- Big button, clear value prop
- "Join the next matchday" or similar

### Team Selection Page (THE BIG ONE!)

**Layout:**
- Current matchday number prominently displayed
- "Pick Your Team" headline
- Grid of 20 team cards (4-5 columns on desktop, 2 on tablet, 1 on mobile)
- Each card shows:
  - Team crest/logo
  - Team name
  - Next opponent
  - Kick-off time
  - SELECT button
- Filter/search at top (optional for MVP)
- Deadline countdown timer at top (red when < 1 hour)

**Visual Hierarchy:**
1. Deadline timer (if close)
2. Matchday number
3. Team cards (equal weight)
4. Submit/Confirm at bottom (sticky on mobile)

### Account/Dashboard Page

**My Entries Section:**
- List of all active entries
- Shows: Entry ID, Current status (Alive/Eliminated), Teams used, Matchday started
- Green badges for alive, red for eliminated
- Click to see detail

**Leaderboard:**
- Table format
- Rank, User, Current Pick, Status
- Auto-updates during matches

**Pool Info:**
- Total pot size (big, prominent)
- Number of entries
- Survivors remaining
- Next matchday countdown

---

## 🎯 Voice & Tone

**Writing Style:**
- **Clear and direct** - No fluff
- **British English** - "Matchday" not "gameweek", "fixture" not "game"
- **Confident** - "You're eliminated" not "Sorry, you've been eliminated"
- **Helpful** - Explain without being condescending

**Example Copy:**

✅ **Good:** "Pick a winning team each matchday. Last one standing wins."
❌ **Bad:** "Hey there! Ready to start your exciting journey? 🎉"

✅ **Good:** "Deadline: 1 hour before kickoff"
❌ **Bad:** "Don't forget to make your picks soon!"

✅ **Good:** "Eliminated - Arsenal drew 1-1"
❌ **Bad:** "Oh no! Better luck next time! 😢"

---

## 🚫 What to Avoid

- ❌ Purple (too similar to PL brand, not ours)
- ❌ Neon/bright colors (unprofessional)
- ❌ Gradients (keep it flat and clean)
- ❌ Too many colors (stick to the palette)
- ❌ Cluttered layouts (embrace white space)
- ❌ Cheesy stock photos (use illustrations or actual PL imagery if possible)
- ❌ Emojis everywhere (use sparingly, if at all)

---

## ✅ Design Checklist

Before shipping any page, verify:
- [ ] Uses Inter font throughout
- [ ] Colors match the palette (no random colors)
- [ ] Plenty of white space (not cramped)
- [ ] Clear visual hierarchy (eye knows where to go)
- [ ] Buttons have proper hover states
- [ ] Mobile responsive (test on phone!)
- [ ] Touch targets are big enough (44x44px minimum)
- [ ] Text is readable (good contrast)
- [ ] Matches the professional vibe (would I trust this with money?)

---

**Brand approved and ready to build!** 🚀
