# Don't Ban Hemp - Website Design Document

**Date:** November 19, 2025
**Project:** StopTheHempBan Campaign Website
**Status:** Design Approved
**Primary Goal:** Rapid mobilization to stop the 2026 hemp ban

---

## Executive Summary

This document outlines the complete design for a grassroots mobilization website to fight the federal hemp ban that takes effect November 12, 2026. The ban effectively eliminates 95% of hemp products through restrictive THC limits (0.4mg per container) and was heavily influenced by alcohol industry lobbying.

**Primary Objective:** Maximize rapid mobilization—get as many people as possible contacting their lawmakers before key legislative and regulatory deadlines.

**Target Users:** Hemp business owners, employees, consumers, medical users, and veterans—anyone impacted by the ban.

**Core User Flow:** Land on page → See countdown urgency → Enter email/zip/role → Look up lawmakers → Send personalized emails → Optional progressive disclosure → Share campaign.

**Timeline:** MVP launch in 2-3 weeks, iterative enhancements over 12 months.

---

## 1. System Architecture & Tech Stack

### Architecture
Modern JAMstack with serverless backend for speed, scalability, and cost-efficiency.

### Core Stack
- **Frontend:** React + TypeScript + Vite
- **UI Framework:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Email Service:** Resend API
- **Lawmaker Lookup:** Google Civic Information API + Supabase cache
- **Hosting:** Vercel (frontend) + Supabase (backend)

### Key Infrastructure Decisions

**1. Hybrid Lawmaker Data Model:**
- Use Google Civic Information API for real-time lookups (always accurate contact info)
- Cache results in Supabase `lawmakers` table
- Augment with custom campaign fields: `hemp_stance`, `alcohol_funding`, `quotes`, `vote_record`
- Run weekly refresh job to sync contact info

**2. Email Flow:**
- User submits form → Supabase Edge Function → Resend API
- Email sent from campaign domain with proper SPF/DKIM
- User's email in "Reply-To" header (lawmakers reply directly to constituent)
- Log all sent emails in `email_actions` table

**3. Progressive Web App:**
- Mobile-first responsive design (75%+ traffic expected on mobile)
- Fast loading (<2s First Contentful Paint)
- Works across all devices (no mailto: dependency)

---

## 2. Database Schema (Supabase)

### Core Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  zip_code TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('business_owner', 'employee', 'consumer', 'medical_user', 'veteran')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Progressive disclosure fields (optional, collected post-action)
  name TEXT,
  phone TEXT,
  business_name TEXT,
  state TEXT, -- derived from zip
  story_opt_in BOOLEAN DEFAULT false,
  weekly_digest_opt_in BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_zip_code ON users(zip_code);
```

#### `lawmakers`
```sql
CREATE TABLE lawmakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE, -- from Civic API
  name TEXT NOT NULL,
  chamber TEXT NOT NULL CHECK (chamber IN ('senate', 'house')),
  state TEXT NOT NULL,
  district TEXT, -- for House reps
  party TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  contact_form_url TEXT,
  office_addresses JSONB, -- DC + district offices

  -- Custom campaign data
  hemp_stance TEXT DEFAULT 'unknown' CHECK (hemp_stance IN ('champion', 'opposed', 'ban_supporter', 'unknown')),
  alcohol_funding_total NUMERIC,
  alcohol_funding_cycle TEXT, -- e.g., "2023-24"
  key_quote TEXT,
  quote_source_url TEXT,
  featured BOOLEAN DEFAULT false, -- for "key villains" spotlight
  last_synced_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_lawmakers_state_chamber ON lawmakers(state, chamber);
CREATE INDEX idx_lawmakers_featured ON lawmakers(featured) WHERE featured = true;
```

#### `email_actions`
```sql
CREATE TABLE email_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lawmaker_id UUID REFERENCES lawmakers(id) ON DELETE CASCADE,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now(),
  resend_message_id TEXT, -- for tracking
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced'))
);

CREATE INDEX idx_email_actions_user_id ON email_actions(user_id);
CREATE INDEX idx_email_actions_sent_at ON email_actions(sent_at);
```

#### `call_actions`
```sql
CREATE TABLE call_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lawmaker_id UUID REFERENCES lawmakers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_call_actions_user_id ON call_actions(user_id);
```

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  business_type TEXT,
  employees_count TEXT, -- ranges: "1-5", "6-20", etc.
  annual_revenue TEXT, -- ranges for privacy
  story_text TEXT,
  story_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

### Database Views

#### `campaign_stats` (for performance)
```sql
CREATE VIEW campaign_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM email_actions WHERE status = 'sent') as total_emails;
```

### Row Level Security Policies

```sql
-- Users can view/update their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can view their own sent emails
ALTER TABLE email_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own emails" ON email_actions FOR SELECT USING (auth.uid() = user_id);

-- Lawmakers are public
ALTER TABLE lawmakers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lawmakers are public" ON lawmakers FOR SELECT TO public USING (true);
```

---

## 3. Single-Page Action Flow (MVP Homepage)

### Layout Structure

**1. Hero Section (Above the Fold)**
- Logo + minimal navigation (About | FAQ)
- Large countdown timer: "THE HEMP BAN TAKES EFFECT IN: [XXX DAYS : XX HRS : XX MIN : XX SEC]"
- Compelling headline: "Congress banned 95% of hemp products. $28 billion industry. Thousands of jobs. One year to stop it."
- Real-time momentum metrics: "[12,847] people have taken action" with progress bar toward 50K goal
- Urgent but credible tone

**2. Quick Explainer (2-3 sentences)**
- Plain language summary of what the law does
- Who's behind it (Big Alcohol lobbying)
- Timeline (Nov 12, 2026 effective date)
- Link to detailed explainer page

**3. Action Form (Core Conversion)**
```
┌─────────────────────────────────────┐
│ ✉️ Contact Your Lawmakers Now      │
│                                     │
│ Email: [________________]           │
│ ZIP Code: [_____]                   │
│ I am a: [v Business Owner ▼]       │
│   • Business Owner                  │
│   • Employee                        │
│   • Consumer                        │
│   • Medical User                    │
│   • Veteran                         │
│                                     │
│ [Find My Representatives →]        │
│                                     │
│ By submitting, you'll join our     │
│ email list for urgent alerts.      │
└─────────────────────────────────────┘
```

**4. Results Section (Appears After Submit)**
- Display 2 Senators + 1 House Rep
- Each lawmaker card shows:
  - Name, photo, party, state/district
  - Contact info preview
  - Hemp stance badge (if known): ✅ Champion | ⚠️ Ban Supporter | ? Unknown
  - Tabs: [📧 Email] [📞 Call Script]

**5. Tabbed Action Interface**

**Email Tab:**
- Shows: lawmaker email, user's email (from field), subject, body
- Email body is pre-populated with role-specific template
- Fully editable before sending
- [Send Email →] button
- After send: Success message + prompt to contact remaining lawmakers

**Call Script Tab:**
- Shows: DC office phone + district office phones
- Pre-written role-specific call script
- [✓ Mark as Called] button for user tracking

**6. Post-Action Success Flow**
- Success message: "✅ Email Sent to Sen. [Name]!"
- Next action prompts: "Contact your other representatives"
- Optional progressive disclosure: "💪 Help us fight smarter (optional): [Tell us more about yourself →]"
- Social sharing: "[📱 Share on Twitter] [📘 Share on Facebook] [📋 Copy Link]"
- Confirm email list subscription

---

## 4. Email Template System

### Template Architecture
Templates stored as JSON config or in Supabase `email_templates` table with variable substitution.

### Available Variables
- `{user_name}` - from progressive disclosure, or "Constituent"
- `{user_email}`
- `{user_city}` - derived from zip
- `{user_state}`
- `{user_role}`
- `{lawmaker_name}`
- `{lawmaker_title}` - Senator / Representative
- `{lawmaker_state}`
- `{business_name}` - if provided

### Template Structure (5 Roles)

**Business Owner Template:**
```
Subject: Urgent: Hemp Ban Will Destroy {business_name} and Jobs in {user_state}

Dear {lawmaker_title} {lawmaker_name},

My name is {user_name}, and I own {business_name}, a hemp business in {user_city}, {user_state}. I'm writing to urge you to support fixing the hemp ban provisions in the recent spending bill.

The new law effectively bans 95% of hemp products by setting an unworkable 0.4mg THC limit per container. This will force my business to close and eliminate jobs in our community.

This ban wasn't about public safety—it was pushed by the alcohol industry to eliminate competition from hemp beverages and wellness products. Big alcohol lobbied heavily for this language while hemp businesses, farmers, and patients were shut out of the process.

I urge you to:
• Cosponsor legislation to raise the THC container limit to a workable level (5-10mg)
• Protect non-intoxicating CBD products used by veterans, seniors, and chronic pain patients
• Preserve state regulatory frameworks that already ensure consumer safety

The hemp industry supports 100,000+ jobs and generates billions in economic activity. We have one year before this law takes effect. Please help us save our businesses and livelihoods.

Thank you for your time and consideration.

Sincerely,
{user_name}
{business_name}
{user_city}, {user_state}
{user_email}
```

**Consumer, Medical User, Veteran, and Employee templates** follow similar structure but emphasize:
- Consumer: Access to wellness products, comparison to alcohol availability
- Medical User: Pain management, alternatives to opioids, patient needs
- Veteran: PTSD/pain relief, harm reduction, veteran-specific needs
- Employee: Job loss, family impact, economic consequences

### Phone Scripts
- Condensed to 30-60 seconds of speaking
- Same role-based personalization
- Clear ask + talking points
- Professional but personal tone

---

## 5. Lawmaker Data Integration

### Phase 1: Hybrid Lookup + Key Villains (MVP)

**Lookup Flow:**
1. User enters zip code
2. Frontend calls Supabase Edge Function `lookup-lawmakers`
3. Function checks cache (by state + district), fetches from Google Civic API if needed
4. Returns lawmakers with contact info + custom campaign data

**Google Civic Information API:**
```typescript
const response = await fetch(
  `https://www.googleapis.com/civicinfo/v2/representatives?` +
  `address=${zipCode}&key=${API_KEY}&` +
  `levels=country&roles=legislatorUpperBody&roles=legislatorLowerBody`
)
```

**Key Villains Database (Hand-Curated):**
- 10-15 featured lawmakers (Ban Architects)
- Examples: Mitch McConnell (R-KY), Andy Harris (R-MD)
- For each, populate:
  - `hemp_stance: 'ban_supporter'`
  - `alcohol_funding_total` from OpenSecrets
  - `alcohol_funding_cycle: "2023-24"`
  - `key_quote` with `quote_source_url`
  - `featured: true`

**UI Display:**
- When user's lawmaker is featured, show badge: "⚠️ Ban Architect - Received $112K from Big Alcohol"
- Link to `/follow-the-money` spotlight page

**Homepage Section:**
```
┌─────────────────────────────────────┐
│ 💰 Follow the Money                │
│                                     │
│ Who's behind the hemp ban?         │
│                                     │
│ [Card: Sen. McConnell]             │
│ [$112K Big Alcohol]                │
│ [Ban Architect]                    │
│                                     │
│ [See All →]                        │
└─────────────────────────────────────┘
```

### Phase 2: Full Database + Interactive Map (Future)
- Expand to all 535 members
- Bulk import alcohol funding data
- Add hemp stance from vote records
- Interactive US state map (click state → see delegation)
- Color-coded by stance (🟢 Champion | 🟡 Neutral | 🔴 Ban Supporter)

---

## 6. Countdown Timer & Momentum Metrics

### Countdown Timer
**Target Date:** November 12, 2026, 12:00 AM EST (one year from signing)

**Format:** `[XXX DAYS : XX HRS : XX MIN : XX SEC]`

**Visual Design:**
- Large monospace font (JetBrains Mono)
- Color-coded urgency:
  - Green: >300 days
  - Orange: 100-300 days
  - Red: <100 days
- Updates every second
- Prominent placement in hero section

### Momentum Metrics
**Displayed Below Countdown:**
```
📊 [12,847] people have taken action
    [Progress bar ████░░░░░░] Goal: 50k

✉️ [38,541] emails sent to lawmakers
```

**Data Sources:**
- Total users: `SELECT COUNT(*) FROM users`
- Total emails: `SELECT COUNT(*) FROM email_actions WHERE status = 'sent'`
- Cached via `campaign_stats` view, updated every 5 minutes

**Note:** Phone calls NOT tracked publicly (unreliable self-reporting).

**Progress Goals:**
- Tier 1: 50,000 actions
- Tier 2: 100,000 actions
- Tier 3: 250,000 actions

---

## 7. Progressive Disclosure & Post-Action Flow

### User Journey After First Email

**Step 1: Success + Next Action**
```
✅ Email Sent to Sen. [Name]!

Your voice matters. Keep the momentum:
→ [Email Sen. [Other Name] →]
→ [Email Rep. [Name] →]
```

**Step 2: Optional "Tell Us More"**
After contacting all lawmakers:
```
💪 Help Us Fight Smarter

You've contacted your lawmakers—thank you!
Share a bit more to help us build the case
for hemp businesses and communities.

[Skip for now]  [Tell us more →]
```

**Progressive Form (Role-Specific):**

**For Business Owners:**
- Name (optional)
- Business Name
- Business Type (dropdown)
- Number of Employees (dropdown ranges)
- Phone (for urgent alerts)
- ☐ I'm willing to share my story publicly

**For Others (Consumer/Medical/Veteran/Employee):**
- Name (optional)
- Phone (for urgent alerts)
- ☐ I'm willing to share my story publicly

**Step 3: Share & Amplify**
```
📢 Multiply Your Impact

Share this campaign to help us reach
50,000 actions before the ban takes effect.

[📱 Share on Twitter]
[📘 Share on Facebook]
[📋 Copy Link]

Pre-written: "I just contacted my lawmakers
to stop the hemp ban. Join me: [URL] #DontBanHemp"
```

**Step 4: Confirmation**
```
✅ You're All Set!

You've taken action and you're on our
email list for urgent updates.

We'll notify you about:
• Key votes and comment periods
• New ways to take action
• Campaign wins and milestones
```

---

## 8. Visual Design System

### Design Principles
- Balanced urgency + credibility (professional structure, urgent accents)
- Mobile-first responsive
- Fast loading (<2s FCP)
- WCAG AA accessible

### Color Palette

**Primary:**
- Hemp Green (brand): `#4CAF50`
- Urgent Orange (accent): `#FF6B35`
- Deep Blue (trust): `#1E3A8A`

**Neutral:**
- White: `#FFFFFF`
- Light Gray: `#F3F4F6`
- Medium Gray: `#6B7280`
- Dark Gray: `#111827`

**Semantic:**
- Success Green: `#10B981`
- Warning Red: `#EF4444`
- Info Blue: `#3B82F6`

### Typography

**Font Stack:**
```css
/* Headings & Body */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Countdown Timer */
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

**Type Scale:**
- Hero headline: `text-5xl` (48px) / `text-4xl` (36px) mobile
- Section headings: `text-3xl` (30px) / `text-2xl` (24px) mobile
- Body: `text-base` (16px)

### Component Library (shadcn/ui + Custom)

**Core Components:**
1. Button (Primary: Orange | Secondary: Green outline)
2. Input / Form Fields (Orange focus ring)
3. Card (Lawmaker profiles, villain spotlights)
4. Tabs (Email / Call Script toggle)
5. Progress Bar (Animated, orange fill)
6. Countdown Timer (Custom, monospace, color-shifting)
7. Modal / Dialog (Details, progressive forms)
8. Badge (Hemp stance indicators)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Accessibility
- Keyboard navigation
- ARIA labels
- Focus indicators (3px orange ring)
- 4.5:1 minimum contrast ratio
- Screen reader support for dynamic content

---

## 9. Technical Implementation

### Supabase Edge Functions

**1. `lookup-lawmakers`**
```typescript
// Input: { zipCode: string }
// Output: { senators: Lawmaker[], representative: Lawmaker }

1. Query lawmakers table for cached results
2. If cache miss or stale (>7 days):
   - Call Google Civic Information API
   - Upsert to lawmakers table
   - Update last_synced_at
3. Return merged data (API contact + custom campaign fields)

Error Handling:
- Invalid zip → 400
- API rate limit → return stale cache + log warning
- No results → 404
```

**2. `send-email-to-lawmaker`**
```typescript
// Input: { userId, lawmakerId, emailSubject, emailBody }

1. Validate user and lawmaker exist
2. Fetch user email and lawmaker email
3. Send via Resend API:
   - From: "Hemp Action Campaign <action@dontbanhemp.org>"
   - Reply-To: user's email
   - To: lawmaker's email
   - Subject/Body: user's input (sanitized)
4. Log to email_actions table (sent_at, resend_message_id, status)
5. Return success

Security:
- Rate limiting: max 10 emails/user/day
- Email sanitization (strip HTML, prevent injection)
- RLS policies (users only send from own account)

Error Handling:
- Resend failure → log status: 'failed'
- Invalid email → 400
- Rate limit → 429
```

**3. `get-campaign-stats` (Optional)**
```typescript
// Output: { totalUsers, totalEmails }

1. Query campaign_stats view
2. Cache for 5 minutes
3. Return JSON
```

### Authentication Strategy

**MVP: Anonymous users with email as identifier**
- No login/password (reduces friction)
- User record created on first form submit
- Email is unique identifier

**Phase 2: Optional user accounts**
- Supabase Auth (magic link)
- View action history
- Manage profile

---

## 10. Content Pages & SEO

### Additional Pages

**1. `/about` - About the Campaign**
- Who we are (grassroots, not industry-funded)
- Why we're fighting (jobs, freedom, patient access)
- Timeline of the ban
- Our goals

**2. `/faq` - Frequently Asked Questions**
- What does the hemp ban do?
- Is this marijuana legalization? (No)
- What about kids/safety?
- Who's behind this? (Alcohol lobby)
- What can I do?
- When does it take effect?

**3. `/the-ban` - Detailed Explainer**
- The law: Continuing Appropriations and Extensions Act of 2026
- Key provisions (0.4mg limit, synthetic restrictions)
- What products are banned
- Economic impact ($28B industry, 100K+ jobs)
- Who voted how

**4. `/follow-the-money` - Spotlight Page**
- Featured "key villains" with full profiles
- Alcohol funding data + sources (OpenSecrets)
- Key quotes + vote records
- Shareable social cards

**5. `/privacy` - Privacy Policy**
- Data collection (email, zip, role)
- Usage (campaign updates, no selling)
- User rights (unsubscribe, delete)

**6. `/contact` - Contact Form**
- Press inquiries
- Partnerships
- Technical issues

### SEO Strategy

**Target Keywords:**
- "hemp ban 2026"
- "stop the hemp ban"
- "CBD ban November 2026"
- "contact my representative hemp"
- "alcohol lobby hemp ban"

**On-Page SEO:**
- Semantic HTML
- Meta descriptions
- Open Graph tags
- Schema.org markup
- Fast load times (Lighthouse >90)

**Meta Tags Example:**
```html
<title>Don't Ban Hemp - Stop the 2026 Hemp Ban</title>
<meta name="description" content="Congress banned 95% of hemp products. We have one year to stop it. Contact your lawmakers now.">
<meta property="og:title" content="Don't Ban Hemp - Take Action Now">
<meta property="og:image" content="https://dontbanhemp.org/og-image.jpg">
```

---

## 11. Deployment & Operations

### Hosting & Infrastructure

**Frontend:**
- Vercel (recommended) or Netlify
- Auto-deploy from GitHub `main` branch
- Custom domain: `dontbanhemp.org`
- Free tier: 100GB bandwidth, unlimited requests
- Auto HTTPS, CDN, edge caching

**Backend:**
- Supabase Free → Pro as you scale
- 500MB DB free → 8GB Pro
- 500K Edge Function invocations/month free → 2M Pro
- Auto-backups on Pro tier

**Email:**
- Resend Free: 3,000 emails/month
- Resend Pro: $20/mo for 50K emails
- Excellent deliverability

### Environment Variables

**Frontend (.env.local):**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_GOOGLE_CIVIC_API_KEY=AIzaXxx...
```

**Supabase Edge Functions:**
```bash
RESEND_API_KEY=re_xxx...
GOOGLE_CIVIC_API_KEY=AIzaXxx...
```

### Deployment Checklist

**Phase 0: Setup**
- [ ] Register domain
- [ ] Create Supabase project
- [ ] Create Resend account
- [ ] Get Google Civic API key
- [ ] Create GitHub repo

**Phase 1: Database**
- [ ] Create tables (users, lawmakers, email_actions, etc.)
- [ ] Set up RLS policies
- [ ] Create views (campaign_stats)
- [ ] Seed key villains data (10-15 lawmakers)

**Phase 2: Backend**
- [ ] Deploy Edge Functions
- [ ] Test API endpoints
- [ ] Configure Resend domain (SPF/DKIM)
- [ ] Set up error logging

**Phase 3: Frontend**
- [ ] Build React app (Vite + shadcn/ui)
- [ ] Implement components
- [ ] Test on mobile
- [ ] Lighthouse audit
- [ ] Connect to Vercel

**Phase 4: Content**
- [ ] Write copy for all pages
- [ ] Create email templates (5 roles)
- [ ] Create phone scripts (5 roles)
- [ ] Add meta tags + OG images

**Phase 5: Go Live**
- [ ] End-to-end testing
- [ ] Soft launch (test group)
- [ ] Fix bugs
- [ ] Public launch

### Monitoring

**Metrics to Track:**
- Total users signed up
- Total emails sent
- Conversion rate (visitors → action)
- Bounce rate
- Mobile vs desktop
- Email deliverability (Resend dashboard)
- API errors (Supabase logs)

**Weekly Tasks:**
- Review campaign stats
- Check for lawmaker contact changes
- Respond to contact form
- Monitor social mentions

**Monthly Tasks:**
- Refresh lawmaker data
- Update featured villains
- Send email newsletter
- Review SEO (Google Search Console)

### Cost Estimates

**MVP (first 3 months):**
- Domain: $12/year
- Supabase: $0 (free tier)
- Vercel: $0 (free tier)
- Resend: $0 (free tier, up to 3K emails/month)
- **Total: ~$12**

**Scaling (10K+ users/month):**
- Supabase Pro: $25/month
- Resend: $20/month (50K emails)
- Vercel: $0 (still free)
- **Total: ~$45/month**

---

## 12. Phase Roadmap

### MVP (Launch in 2-3 weeks)

**Core Features:**
- Single-page action flow
- Countdown timer (Nov 12, 2026)
- Email/zip/role signup
- Lawmaker lookup (Google Civic API + cache)
- Role-based email templates (5 roles)
- Phone scripts (5 roles)
- Email sending via Resend
- Progressive disclosure (optional profile)
- Campaign metrics (users + emails)
- Key villains spotlight (10-15 lawmakers)
- Content pages (About, FAQ, The Ban, Privacy, Contact)

### Phase 2 (1-2 months post-launch)

**Enhanced Lawmaker Database:**
- Expand to all 535 members
- Full alcohol funding data
- Search/filter interface

**Story Collection & Showcase:**
- "Share Your Story" form
- Manual curation/approval
- Featured stories on homepage
- Business directory

**Email Campaign Management:**
- Weekly action alerts
- Segmentation by role/state/engagement
- A/B testing
- Drip campaigns

**Social Amplification:**
- Pre-made graphics
- Auto-tweet after action
- Viral mechanics (leaderboard, referrals)

### Phase 3 (3-6 months post-launch)

**Interactive State Map:**
- Clickable US map (D3.js or Mapbox)
- Color-coded by stance
- Drill down to lawmakers

**Advanced "Follow the Money":**
- Lobbying timeline
- Network graphs (PACs → lawmakers)
- Comparison tools
- Export/share

**Call Campaign Tools:**
- Twilio click-to-call
- Track duration + outcomes
- Daily targets + leaderboards

**Coalition Building:**
- Partner directory
- Event calendar
- Resource hub
- Media kit

### Phase 4 (6-12 months / as needed)

**AI-Powered Email:**
- Real-time generation (OpenAI API)
- Unique emails (avoid spam filters)
- Sentiment analysis

**Legal Support Hub:**
- Litigation tracker
- Legal fund donations
- Amicus brief tool

**Advanced Analytics:**
- Lawmaker responsiveness
- Sentiment analysis
- Predict flip-able votes
- Impact dashboard

**Electoral Accountability:**
- 2026 election targeting
- Voter guides
- Campaign donation bundling
- GOTV tools

---

## 13. Success Metrics

### Primary KPIs (MVP)
- **Total actions taken:** 50,000 (Goal 1), 100,000 (Goal 2), 250,000 (Goal 3)
- **Conversion rate:** % of visitors who submit form (target: 15-20%)
- **Email send rate:** % of form submissions that result in at least 1 email (target: 80%+)
- **Multi-contact rate:** % of users who contact 2+ lawmakers (target: 50%+)

### Secondary Metrics
- Bounce rate (target: <50%)
- Time on page (target: >2 minutes)
- Mobile vs desktop (expect 75% mobile)
- Email deliverability (target: >95% via Resend)
- Social shares per user (target: 5-10%)
- Progressive disclosure completion (target: 20-30%)

### Campaign Impact Metrics (Long-term)
- Lawmakers contacted per state
- States with highest engagement
- Legislation introduced (fix bills, amendments)
- Lawmaker responses/statements
- Media coverage (articles, mentions)
- Coalition partners recruited
- Election outcomes (2026)

---

## 14. Risk Mitigation

### Technical Risks

**Risk:** Google Civic API rate limits or downtime
**Mitigation:** Cache aggressively (7 days), return stale data on API failure, have manual fallback data for high-traffic states

**Risk:** Resend API email deliverability issues
**Mitigation:** Proper SPF/DKIM setup, monitor bounce rates, provide mailto: fallback if needed

**Risk:** Traffic spike overwhelms free tiers
**Mitigation:** Supabase/Vercel free tiers handle high traffic; upgrade to Pro if needed ($45/mo total)

### Campaign Risks

**Risk:** Spam filter flagging (similar emails)
**Mitigation:** Templates are fully editable, encourage personalization, Phase 4 adds AI variation

**Risk:** Lawmaker offices ignore flood of emails
**Mitigation:** Diversify tactics (calls, social media, local events), highlight constituent stories, track responsiveness publicly

**Risk:** Alcohol industry counter-campaign
**Mitigation:** Focus on jobs/freedom narrative (not anti-alcohol), build bipartisan coalition, emphasize state sovereignty

**Risk:** Ban takes effect despite mobilization
**Mitigation:** Prepare Phase 2 strategy (legal challenges, electoral accountability, state-level workarounds)

---

## 15. Open Questions & Decisions Needed

### Before Launch
- [ ] **Domain name:** Finalize (dontbanhemp.org or alternative)
- [ ] **Branding:** Logo design, favicon, OG images
- [ ] **Legal review:** Privacy policy, terms of service (if needed)
- [ ] **Partnership outreach:** Which hemp organizations to contact pre-launch?
- [ ] **Launch PR:** Press release, media contacts, influencer outreach plan

### During Development
- [ ] **Key villains data:** Compile list of 10-15 lawmakers with alcohol funding sources
- [ ] **Email template tone:** Review and refine for balance (urgent but not hostile)
- [ ] **Analytics setup:** Google Analytics, Plausible, or alternative?
- [ ] **Error monitoring:** Sentry or Supabase logs?

---

## Conclusion

This design provides a complete roadmap for a rapid-mobilization campaign website to fight the 2026 hemp ban. The architecture balances speed-to-launch (MVP in 2-3 weeks) with long-term scalability (Phases 2-4 over 12 months).

**Key Success Factors:**
1. **Urgency:** Countdown timer + real-time metrics create immediate action imperative
2. **Simplicity:** Single-page flow minimizes friction from landing to action
3. **Personalization:** Role-based messaging makes emails authentic and compelling
4. **Transparency:** "Follow the Money" builds narrative and credibility
5. **Momentum:** Progressive disclosure and social sharing multiply impact

**Next Steps:**
1. Set up infrastructure (Supabase, Vercel, Resend, Google API)
2. Build database schema and seed key villains data
3. Implement frontend components (countdown, form, email tool)
4. Deploy Edge Functions (lookup, send email)
5. Write content (templates, scripts, pages)
6. Test, launch, iterate

With one year until the ban takes effect, every week counts. This design prioritizes rapid deployment while building a foundation for sustained advocacy.
