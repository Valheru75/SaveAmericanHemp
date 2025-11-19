# Don't Ban Hemp MVP - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page grassroots mobilization website to fight the 2026 federal hemp ban with countdown timer, lawmaker lookup, and email sending.

**Architecture:** React + TypeScript + Vite frontend, Supabase PostgreSQL backend with Edge Functions, Resend for email delivery, Google Civic Information API for lawmaker lookup.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS 3, shadcn/ui, Supabase, Resend API, Google Civic Information API

**Estimated Time:** 2-3 weeks for MVP

---

## Phase 0: Project Setup & Infrastructure

### Task 1: Initialize Frontend Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.env.local.example`
- Create: `.gitignore`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

**Step 1: Initialize Vite + React + TypeScript project**

```bash
npm create vite@latest . -- --template react-ts
```

Expected: Vite project scaffolded with React + TypeScript

**Step 2: Install dependencies**

```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npm install @supabase/supabase-js
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-router-dom
npm install date-fns
```

Expected: All dependencies installed

**Step 3: Initialize Tailwind CSS**

```bash
npx tailwindcss init -p
```

Expected: `tailwind.config.js` and `postcss.config.js` created

**Step 4: Configure Tailwind**

Modify: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        hempGreen: '#4CAF50',
        urgentOrange: '#FF6B35',
        deepBlue: '#1E3A8A',
        successGreen: '#10B981',
        warningRed: '#EF4444',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

**Step 5: Update base CSS**

Modify: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white text-gray-900 font-sans;
  }
}
```

**Step 6: Create environment variables template**

Create: `.env.local.example`

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CIVIC_API_KEY=your-google-api-key
```

**Step 7: Update .gitignore**

Modify: `.gitignore`

```
# Dependencies
node_modules

# Production
dist
build

# Environment
.env
.env.local

# Misc
.DS_Store
*.log
```

**Step 8: Test dev server**

```bash
npm run dev
```

Expected: Dev server runs on http://localhost:5173

**Step 9: Commit**

```bash
git add .
git commit -m "feat: initialize React + TypeScript + Vite + Tailwind project

- Set up Vite with React 18 and TypeScript 5
- Configure Tailwind CSS with custom hemp campaign colors
- Add Supabase and necessary dependencies
- Create environment variable template

🤖 Generated with Claude Code"
```

---

### Task 2: Set Up Supabase Project

**Prerequisites:** You need a Supabase account at https://supabase.com

**Step 1: Create Supabase project**

Manual step:
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: "stop-hemp-ban"
4. Database password: Generate strong password (save it!)
5. Region: Choose closest to your users
6. Click "Create new project"

Expected: Project created, wait 2-3 minutes for provisioning

**Step 2: Copy project credentials**

Manual step:
1. Go to Project Settings → API
2. Copy "Project URL"
3. Copy "anon public" key

**Step 3: Create .env.local file**

Create: `.env.local`

```bash
VITE_SUPABASE_URL=<paste your Project URL>
VITE_SUPABASE_ANON_KEY=<paste your anon key>
VITE_GOOGLE_CIVIC_API_KEY=<leave blank for now>
```

Expected: Environment variables configured (not committed to git)

**Step 4: Create Supabase client**

Create: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type UserRole = 'business_owner' | 'employee' | 'consumer' | 'medical_user' | 'veteran'

export type HempStance = 'champion' | 'opposed' | 'ban_supporter' | 'unknown'

export interface User {
  id: string
  email: string
  zip_code: string
  role: UserRole
  created_at: string
  updated_at: string
  name?: string
  phone?: string
  business_name?: string
  state?: string
  story_opt_in: boolean
  weekly_digest_opt_in: boolean
}

export interface Lawmaker {
  id: string
  external_id?: string
  name: string
  chamber: 'senate' | 'house'
  state: string
  district?: string
  party?: string
  photo_url?: string
  email?: string
  phone?: string
  contact_form_url?: string
  office_addresses?: any
  hemp_stance: HempStance
  alcohol_funding_total?: number
  alcohol_funding_cycle?: string
  key_quote?: string
  quote_source_url?: string
  featured: boolean
  last_synced_at: string
}

export interface EmailAction {
  id: string
  user_id: string
  lawmaker_id: string
  email_subject: string
  email_body: string
  sent_at: string
  resend_message_id?: string
  status: 'sent' | 'failed' | 'bounced'
}

export interface CampaignStats {
  total_users: number
  total_emails: number
}
```

**Step 5: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client and TypeScript types

- Create Supabase client singleton
- Define TypeScript interfaces for User, Lawmaker, EmailAction
- Add type safety for database operations

🤖 Generated with Claude Code"
```

---

### Task 3: Create Database Schema

**Files:**
- Create: `supabase/migrations/20251119000001_initial_schema.sql`

**Step 1: Create migrations directory**

```bash
mkdir -p supabase/migrations
```

**Step 2: Create initial schema migration**

Create: `supabase/migrations/20251119000001_initial_schema.sql`

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  zip_code TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('business_owner', 'employee', 'consumer', 'medical_user', 'veteran')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Progressive disclosure fields
  name TEXT,
  phone TEXT,
  business_name TEXT,
  state TEXT,
  story_opt_in BOOLEAN DEFAULT false,
  weekly_digest_opt_in BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_zip_code ON users(zip_code);

-- Lawmakers table
CREATE TABLE lawmakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  chamber TEXT NOT NULL CHECK (chamber IN ('senate', 'house')),
  state TEXT NOT NULL,
  district TEXT,
  party TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  contact_form_url TEXT,
  office_addresses JSONB,

  -- Campaign data
  hemp_stance TEXT DEFAULT 'unknown' CHECK (hemp_stance IN ('champion', 'opposed', 'ban_supporter', 'unknown')),
  alcohol_funding_total NUMERIC,
  alcohol_funding_cycle TEXT,
  key_quote TEXT,
  quote_source_url TEXT,
  featured BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_lawmakers_state_chamber ON lawmakers(state, chamber);
CREATE INDEX idx_lawmakers_featured ON lawmakers(featured) WHERE featured = true;

-- Email actions table
CREATE TABLE email_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lawmaker_id UUID REFERENCES lawmakers(id) ON DELETE CASCADE,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now(),
  resend_message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced'))
);

CREATE INDEX idx_email_actions_user_id ON email_actions(user_id);
CREATE INDEX idx_email_actions_sent_at ON email_actions(sent_at);

-- Call actions table
CREATE TABLE call_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lawmaker_id UUID REFERENCES lawmakers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_call_actions_user_id ON call_actions(user_id);

-- User profiles table (progressive disclosure)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  business_type TEXT,
  employees_count TEXT,
  annual_revenue TEXT,
  story_text TEXT,
  story_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Campaign stats view
CREATE VIEW campaign_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM email_actions WHERE status = 'sent') as total_emails;

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawmakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own data (when we add auth)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

-- Email actions: users can view their own
CREATE POLICY "Users can view own emails" ON email_actions FOR SELECT USING (true);

-- Lawmakers are public
CREATE POLICY "Lawmakers are public" ON lawmakers FOR SELECT TO public USING (true);

-- User profiles: users can manage their own
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (true);
```

**Step 3: Apply migration to Supabase**

Manual step:
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy/paste the entire migration SQL
4. Click "Run"

Expected: All tables, indexes, views, and policies created successfully

**Step 4: Verify schema**

Manual step:
1. Go to Supabase Dashboard → Table Editor
2. Verify tables exist: users, lawmakers, email_actions, call_actions, user_profiles
3. Go to Database → Views
4. Verify campaign_stats view exists

**Step 5: Commit migration file**

```bash
git add supabase/migrations/
git commit -m "feat: create initial database schema

- Add users, lawmakers, email_actions, call_actions, user_profiles tables
- Create campaign_stats view for performance
- Set up Row Level Security policies
- Add indexes for common queries

🤖 Generated with Claude Code"
```

---

### Task 4: Get Google Civic Information API Key

**Step 1: Enable Google Civic Information API**

Manual step:
1. Go to https://console.cloud.google.com/
2. Create new project or select existing: "stop-hemp-ban"
3. Go to "APIs & Services" → "Library"
4. Search for "Google Civic Information API"
5. Click "Enable"

Expected: API enabled for your project

**Step 2: Create API credentials**

Manual step:
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Edit API key" (optional but recommended)
5. Under "API restrictions", select "Restrict key"
6. Check only "Google Civic Information API"
7. Click "Save"

Expected: API key created and restricted

**Step 3: Add to environment variables**

Modify: `.env.local`

```bash
VITE_SUPABASE_URL=<your supabase url>
VITE_SUPABASE_ANON_KEY=<your supabase anon key>
VITE_GOOGLE_CIVIC_API_KEY=<paste your Google API key here>
```

**Step 4: Update .env.local.example**

Modify: `.env.local.example`

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CIVIC_API_KEY=your-google-api-key-here
```

**Step 5: Commit example file**

```bash
git add .env.local.example
git commit -m "docs: update environment variables example with Google API key

🤖 Generated with Claude Code"
```

---

## Phase 1: Core Components & UI Foundation

### Task 5: Install and Configure shadcn/ui

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`

**Step 1: Initialize shadcn/ui**

```bash
npx shadcn-ui@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- TypeScript: Yes

Expected: `components.json` created, base configuration added

**Step 2: Install core shadcn/ui components**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add progress
```

Expected: Components installed in `src/components/ui/`

**Step 3: Verify installation**

```bash
ls src/components/ui/
```

Expected: button.tsx, input.tsx, label.tsx, card.tsx, tabs.tsx, badge.tsx, select.tsx, dialog.tsx, progress.tsx

**Step 4: Commit**

```bash
git add .
git commit -m "feat: install and configure shadcn/ui components

- Initialize shadcn/ui with default style
- Add core UI components: button, input, card, tabs, badge, select, dialog, progress
- Create utils for className merging

🤖 Generated with Claude Code"
```

---

### Task 6: Create Countdown Timer Component

**Files:**
- Create: `src/components/CountdownTimer.tsx`
- Create: `src/hooks/useCountdown.ts`

**Step 1: Create countdown hook**

Create: `src/hooks/useCountdown.ts`

```typescript
import { useState, useEffect } from 'react'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function useCountdown(targetDate: Date): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return timeRemaining
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const now = new Date()
  const total = targetDate.getTime() - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}
```

**Step 2: Create countdown component**

Create: `src/components/CountdownTimer.tsx`

```typescript
import { useCountdown } from '../hooks/useCountdown'

const BAN_EFFECTIVE_DATE = new Date('2026-11-12T00:00:00-05:00') // Nov 12, 2026, EST

export function CountdownTimer() {
  const { days, hours, minutes, seconds, total } = useCountdown(BAN_EFFECTIVE_DATE)

  // Color-coded urgency
  const getColorClass = () => {
    if (days > 300) return 'text-hempGreen'
    if (days > 100) return 'text-urgentOrange'
    return 'text-warningRed'
  }

  if (total <= 0) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-warningRed">The hemp ban is now in effect.</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
        THE HEMP BAN TAKES EFFECT IN:
      </h2>
      <div className={`flex justify-center gap-4 md:gap-8 font-mono text-4xl md:text-6xl font-bold ${getColorClass()}`}>
        <div className="flex flex-col items-center">
          <span>{String(days).padStart(3, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">DAYS</span>
        </div>
        <span className="self-start">:</span>
        <div className="flex flex-col items-center">
          <span>{String(hours).padStart(2, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">HRS</span>
        </div>
        <span className="self-start">:</span>
        <div className="flex flex-col items-center">
          <span>{String(minutes).padStart(2, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">MIN</span>
        </div>
        <span className="self-start">:</span>
        <div className="flex flex-col items-center">
          <span>{String(seconds).padStart(2, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">SEC</span>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Test countdown component**

Modify: `src/App.tsx`

```typescript
import { CountdownTimer } from './components/CountdownTimer'

function App() {
  return (
    <div className="min-h-screen bg-white p-8">
      <CountdownTimer />
    </div>
  )
}

export default App
```

**Step 4: Run dev server and verify**

```bash
npm run dev
```

Expected: Countdown timer displays and updates every second with color coding

**Step 5: Commit**

```bash
git add src/components/CountdownTimer.tsx src/hooks/useCountdown.ts src/App.tsx
git commit -m "feat: add countdown timer component

- Create useCountdown hook for real-time countdown logic
- Build CountdownTimer component with color-coded urgency
- Display days, hours, minutes, seconds to Nov 12, 2026
- Green >300 days, Orange 100-300 days, Red <100 days

🤖 Generated with Claude Code"
```

---

### Task 7: Create Campaign Stats Component

**Files:**
- Create: `src/components/CampaignStats.tsx`
- Create: `src/hooks/useCampaignStats.ts`

**Step 1: Create campaign stats hook**

Create: `src/hooks/useCampaignStats.ts`

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { CampaignStats } from '../lib/supabase'

export function useCampaignStats() {
  const [stats, setStats] = useState<CampaignStats>({ total_users: 0, total_emails: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchStats()

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      const { data, error } = await supabase
        .from('campaign_stats')
        .select('*')
        .single()

      if (error) throw error

      setStats(data as CampaignStats)
      setLoading(false)
    } catch (err) {
      setError(err as Error)
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch: fetchStats }
}
```

**Step 2: Create campaign stats component**

Create: `src/components/CampaignStats.tsx`

```typescript
import { useCampaignStats } from '../hooks/useCampaignStats'
import { Progress } from './ui/progress'

const GOAL = 50000 // First goal: 50,000 actions

export function CampaignStats() {
  const { stats, loading } = useCampaignStats()

  if (loading) {
    return (
      <div className="text-center text-gray-500">
        Loading campaign stats...
      </div>
    )
  }

  const progressPercentage = Math.min((stats.total_users / GOAL) * 100, 100)

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl md:text-4xl font-bold text-deepBlue">
          {stats.total_users.toLocaleString()}
        </span>
        <span className="text-lg text-gray-600">people have taken action</span>
      </div>

      <div className="max-w-md mx-auto">
        <Progress value={progressPercentage} className="h-3" />
        <p className="text-sm text-gray-500 mt-2">
          Goal: {GOAL.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-700">
        <span className="text-2xl">✉️</span>
        <span className="text-2xl md:text-3xl font-semibold">
          {stats.total_emails.toLocaleString()}
        </span>
        <span className="text-base">emails sent to lawmakers</span>
      </div>
    </div>
  )
}
```

**Step 3: Update App.tsx to test**

Modify: `src/App.tsx`

```typescript
import { CountdownTimer } from './components/CountdownTimer'
import { CampaignStats } from './components/CampaignStats'

function App() {
  return (
    <div className="min-h-screen bg-white p-8 space-y-12">
      <CountdownTimer />
      <CampaignStats />
    </div>
  )
}

export default App
```

**Step 4: Run dev server and verify**

```bash
npm run dev
```

Expected: Campaign stats display (will show 0 until we have data)

**Step 5: Commit**

```bash
git add src/components/CampaignStats.tsx src/hooks/useCampaignStats.ts src/App.tsx
git commit -m "feat: add campaign stats component

- Create useCampaignStats hook to fetch from Supabase view
- Display total users and emails sent with progress bar
- Auto-refresh every 30 seconds
- Show progress toward 50K goal

🤖 Generated with Claude Code"
```

---

### Task 8: Create Action Form Component

**Files:**
- Create: `src/components/ActionForm.tsx`
- Create: `src/components/ui/form.tsx` (if not already added by shadcn)

**Step 1: Install additional shadcn components**

```bash
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add toaster
```

Expected: Form, toast, and toaster components added

**Step 2: Create action form component**

Create: `src/components/ActionForm.tsx`

```typescript
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { UserRole } from '../lib/supabase'

interface ActionFormProps {
  onSubmit: (data: { email: string; zipCode: string; role: UserRole }) => void
  loading?: boolean
}

export function ActionForm({ onSubmit, loading = false }: ActionFormProps) {
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [role, setRole] = useState<UserRole>('consumer')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email || !zipCode || !role) {
      return
    }

    if (zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      alert('Please enter a valid 5-digit ZIP code')
      return
    }

    onSubmit({ email, zipCode, role })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-deepBlue mb-2">
          ✉️ Contact Your Lawmakers Now
        </h2>
        <p className="text-gray-600">
          Enter your information to find your representatives
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            type="text"
            placeholder="12345"
            maxLength={5}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">I am a: *</Label>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={loading}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business_owner">Business Owner</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="consumer">Consumer</SelectItem>
              <SelectItem value="medical_user">Medical User</SelectItem>
              <SelectItem value="veteran">Veteran</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-urgentOrange hover:bg-orange-600 text-white text-lg py-6"
        disabled={loading}
      >
        {loading ? 'Finding Representatives...' : 'Find My Representatives →'}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        By submitting, you'll join our email list for urgent action alerts.
      </p>
    </form>
  )
}
```

**Step 3: Update App.tsx to test form**

Modify: `src/App.tsx`

```typescript
import { CountdownTimer } from './components/CountdownTimer'
import { CampaignStats } from './components/CampaignStats'
import { ActionForm } from './components/ActionForm'

function App() {
  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data)
    // We'll implement lawmaker lookup next
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <CountdownTimer />
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Congress banned 95% of hemp products.
            </h1>
            <p className="text-xl text-gray-700">
              $28 billion industry. Thousands of jobs. One year to stop it.
            </p>
          </div>
          <CampaignStats />
        </div>
      </div>

      {/* Action Form Section */}
      <div className="py-12 px-4">
        <ActionForm onSubmit={handleFormSubmit} />
      </div>
    </div>
  )
}

export default App
```

**Step 4: Run and verify**

```bash
npm run dev
```

Expected: Form displays with email, zip, and role fields. Submitting logs data to console.

**Step 5: Commit**

```bash
git add src/components/ActionForm.tsx src/App.tsx
git commit -m "feat: add action form component

- Create form with email, ZIP code, and role selection
- Add validation for ZIP code format
- Style with urgentOrange CTA button
- Display disclaimer about email list

🤖 Generated with Claude Code"
```

---

## Phase 2: Lawmaker Lookup & Display

### Task 9: Create Supabase Edge Function for Lawmaker Lookup

**Files:**
- Create: `supabase/functions/lookup-lawmakers/index.ts`
- Create: `supabase/functions/_shared/cors.ts`

**Step 1: Install Supabase CLI**

```bash
npm install -g supabase
```

Expected: Supabase CLI installed globally

**Step 2: Link to your Supabase project**

```bash
supabase link --project-ref <your-project-ref>
```

Note: Find your project ref in Supabase Dashboard → Settings → General → Reference ID

Expected: Project linked successfully

**Step 3: Create shared CORS helper**

Create: `supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Step 4: Create lookup-lawmakers Edge Function**

Create: `supabase/functions/lookup-lawmakers/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { zipCode } = await req.json()

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ZIP code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Call Google Civic Information API
    const googleApiKey = Deno.env.get('GOOGLE_CIVIC_API_KEY')!
    const civicApiUrl = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&key=${googleApiKey}&levels=country&roles=legislatorUpperBody&roles=legislatorLowerBody`

    const civicResponse = await fetch(civicApiUrl)

    if (!civicResponse.ok) {
      throw new Error('Failed to fetch from Google Civic API')
    }

    const civicData = await civicResponse.json()

    // Parse officials
    const officials = civicData.officials || []
    const offices = civicData.offices || []

    const lawmakers = []

    for (const office of offices) {
      const isSenate = office.name.includes('Senate')
      const isHouse = office.name.includes('Representative')

      if (!isSenate && !isHouse) continue

      for (const officialIndex of office.officialIndices || []) {
        const official = officials[officialIndex]
        if (!official) continue

        // Check if lawmaker exists in our database (by name + state)
        const state = civicData.normalizedInput?.state || ''
        const { data: existingLawmaker } = await supabase
          .from('lawmakers')
          .select('*')
          .eq('name', official.name)
          .eq('state', state)
          .single()

        if (existingLawmaker) {
          lawmakers.push(existingLawmaker)
        } else {
          // Insert new lawmaker
          const { data: newLawmaker, error } = await supabase
            .from('lawmakers')
            .insert({
              name: official.name,
              chamber: isSenate ? 'senate' : 'house',
              state: state,
              party: official.party,
              photo_url: official.photoUrl,
              email: official.emails?.[0],
              phone: official.phones?.[0],
              office_addresses: official.address,
              hemp_stance: 'unknown',
              last_synced_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (!error && newLawmaker) {
            lawmakers.push(newLawmaker)
          }
        }
      }
    }

    // Separate senators and representative
    const senators = lawmakers.filter(l => l.chamber === 'senate')
    const representative = lawmakers.find(l => l.chamber === 'house')

    return new Response(
      JSON.stringify({ senators, representative }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in lookup-lawmakers:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Step 5: Deploy the Edge Function**

```bash
supabase functions deploy lookup-lawmakers
```

Expected: Function deployed successfully

**Step 6: Set environment secrets**

```bash
supabase secrets set GOOGLE_CIVIC_API_KEY=<your-google-api-key>
```

Expected: Secret set successfully

**Step 7: Test the function**

```bash
curl -X POST 'https://<your-project-ref>.supabase.co/functions/v1/lookup-lawmakers' \
  -H 'Authorization: Bearer <your-anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{"zipCode":"40502"}'
```

Expected: Returns JSON with senators and representative

**Step 8: Commit**

```bash
git add supabase/functions/
git commit -m "feat: create lookup-lawmakers Edge Function

- Fetch lawmakers from Google Civic Information API by ZIP code
- Cache results in Supabase lawmakers table
- Return 2 senators + 1 representative
- Handle CORS for frontend requests

🤖 Generated with Claude Code"
```

---

### Task 10: Create Lawmaker Lookup Hook and Service

**Files:**
- Create: `src/hooks/useLawmakerLookup.ts`
- Create: `src/services/lawmakers.ts`

**Step 1: Create lawmakers service**

Create: `src/services/lawmakers.ts`

```typescript
import { supabase } from '../lib/supabase'
import type { Lawmaker } from '../lib/supabase'

export interface LookupLawmakersResponse {
  senators: Lawmaker[]
  representative?: Lawmaker
}

export async function lookupLawmakers(zipCode: string): Promise<LookupLawmakersResponse> {
  const { data, error } = await supabase.functions.invoke('lookup-lawmakers', {
    body: { zipCode },
  })

  if (error) {
    throw new Error(error.message || 'Failed to lookup lawmakers')
  }

  return data as LookupLawmakersResponse
}
```

**Step 2: Create lawmaker lookup hook**

Create: `src/hooks/useLawmakerLookup.ts`

```typescript
import { useState } from 'react'
import { lookupLawmakers, type LookupLawmakersResponse } from '../services/lawmakers'

export function useLawmakerLookup() {
  const [lawmakers, setLawmakers] = useState<LookupLawmakersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function lookup(zipCode: string) {
    setLoading(true)
    setError(null)

    try {
      const result = await lookupLawmakers(zipCode)
      setLawmakers(result)
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setLawmakers(null)
    setError(null)
  }

  return { lawmakers, loading, error, lookup, reset }
}
```

**Step 3: Commit**

```bash
git add src/hooks/useLawmakerLookup.ts src/services/lawmakers.ts
git commit -m "feat: add lawmaker lookup service and hook

- Create lawmakers service to call Edge Function
- Create useLawmakerLookup hook for state management
- Handle loading and error states
- Return senators and representative

🤖 Generated with Claude Code"
```

---

### Task 11: Create Lawmaker Card Component

**Files:**
- Create: `src/components/LawmakerCard.tsx`

**Step 1: Create lawmaker card component**

Create: `src/components/LawmakerCard.tsx`

```typescript
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import type { Lawmaker } from '../lib/supabase'

interface LawmakerCardProps {
  lawmaker: Lawmaker
  onEmailClick: () => void
  onCallClick: () => void
}

export function LawmakerCard({ lawmaker, onEmailClick, onCallClick }: LawmakerCardProps) {
  const getStanceBadge = () => {
    switch (lawmaker.hemp_stance) {
      case 'champion':
        return <Badge className="bg-successGreen text-white">✅ Hemp Champion</Badge>
      case 'ban_supporter':
        return <Badge className="bg-warningRed text-white">⚠️ Ban Supporter</Badge>
      case 'opposed':
        return <Badge className="bg-hempGreen text-white">Opposed Ban</Badge>
      default:
        return <Badge variant="secondary">? Unknown Stance</Badge>
    }
  }

  const getTitle = () => {
    if (lawmaker.chamber === 'senate') {
      return `Sen. ${lawmaker.name}`
    }
    return `Rep. ${lawmaker.name}`
  }

  const getPartyLabel = () => {
    return lawmaker.party ? ` (${lawmaker.party}-${lawmaker.state})` : ` (${lawmaker.state})`
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {lawmaker.photo_url && (
          <img
            src={lawmaker.photo_url}
            alt={lawmaker.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">
            {getTitle()}
            <span className="text-base font-normal text-gray-600">{getPartyLabel()}</span>
          </h3>
          <div className="mt-2">{getStanceBadge()}</div>

          {lawmaker.featured && lawmaker.alcohol_funding_total && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-semibold">
                💰 Received ${lawmaker.alcohol_funding_total.toLocaleString()} from Big Alcohol
              </p>
              {lawmaker.alcohol_funding_cycle && (
                <p className="text-xs text-red-600 mt-1">
                  Cycle: {lawmaker.alcohol_funding_cycle}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={onEmailClick}
              className="flex items-center gap-2 px-4 py-2 bg-deepBlue text-white rounded-md hover:bg-blue-900 transition"
            >
              📧 Email
            </button>
            <button
              onClick={onCallClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition"
            >
              📞 Call
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/LawmakerCard.tsx
git commit -m "feat: create lawmaker card component

- Display lawmaker photo, name, party, state
- Show hemp stance badge (Champion/Ban Supporter/Unknown)
- Highlight featured lawmakers with alcohol funding
- Email and Call action buttons

🤖 Generated with Claude Code"
```

---

### Task 12: Create Lawmaker Results Component

**Files:**
- Create: `src/components/LawmakerResults.tsx`

**Step 1: Create lawmaker results component**

Create: `src/components/LawmakerResults.tsx`

```typescript
import { LawmakerCard } from './LawmakerCard'
import type { Lawmaker } from '../lib/supabase'

interface LawmakerResultsProps {
  senators: Lawmaker[]
  representative?: Lawmaker
  onEmailClick: (lawmaker: Lawmaker) => void
  onCallClick: (lawmaker: Lawmaker) => void
}

export function LawmakerResults({ senators, representative, onEmailClick, onCallClick }: LawmakerResultsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-deepBlue mb-2">
          📍 Your Representatives
        </h2>
        <p className="text-gray-600">
          Contact your lawmakers to stop the hemp ban
        </p>
      </div>

      <div className="space-y-4">
        {senators.map((senator) => (
          <LawmakerCard
            key={senator.id}
            lawmaker={senator}
            onEmailClick={() => onEmailClick(senator)}
            onCallClick={() => onCallClick(senator)}
          />
        ))}

        {representative && (
          <LawmakerCard
            lawmaker={representative}
            onEmailClick={() => onEmailClick(representative)}
            onCallClick={() => onCallClick(representative)}
          />
        )}
      </div>
    </div>
  )
}
```

**Step 2: Update App.tsx to integrate lookup**

Modify: `src/App.tsx`

```typescript
import { useState } from 'react'
import { CountdownTimer } from './components/CountdownTimer'
import { CampaignStats } from './components/CampaignStats'
import { ActionForm } from './components/ActionForm'
import { LawmakerResults } from './components/LawmakerResults'
import { useLawmakerLookup } from './hooks/useLawmakerLookup'
import type { Lawmaker, UserRole } from './lib/supabase'

function App() {
  const { lawmakers, loading, lookup } = useLawmakerLookup()
  const [userInfo, setUserInfo] = useState<{ email: string; zipCode: string; role: UserRole } | null>(null)

  const handleFormSubmit = async (data: { email: string; zipCode: string; role: UserRole }) => {
    try {
      await lookup(data.zipCode)
      setUserInfo(data)
    } catch (error) {
      console.error('Failed to lookup lawmakers:', error)
      alert('Failed to find your representatives. Please check your ZIP code and try again.')
    }
  }

  const handleEmailClick = (lawmaker: Lawmaker) => {
    console.log('Email clicked for:', lawmaker.name)
    // We'll implement email modal next
  }

  const handleCallClick = (lawmaker: Lawmaker) => {
    console.log('Call clicked for:', lawmaker.name)
    // We'll implement call modal next
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <CountdownTimer />
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Congress banned 95% of hemp products.
            </h1>
            <p className="text-xl text-gray-700">
              $28 billion industry. Thousands of jobs. One year to stop it.
            </p>
          </div>
          <CampaignStats />
        </div>
      </div>

      {/* Action Form or Results Section */}
      <div className="py-12 px-4">
        {!lawmakers ? (
          <ActionForm onSubmit={handleFormSubmit} loading={loading} />
        ) : (
          <LawmakerResults
            senators={lawmakers.senators}
            representative={lawmakers.representative}
            onEmailClick={handleEmailClick}
            onCallClick={handleCallClick}
          />
        )}
      </div>
    </div>
  )
}

export default App
```

**Step 3: Run and test full lookup flow**

```bash
npm run dev
```

Expected:
1. Enter email, ZIP code, role
2. Click "Find My Representatives"
3. See lawmaker cards appear with contact buttons

**Step 4: Commit**

```bash
git add src/components/LawmakerResults.tsx src/App.tsx
git commit -m "feat: integrate lawmaker lookup with results display

- Create LawmakerResults component to display senators + representative
- Update App.tsx to handle form submission and lookup
- Show lawmaker cards after successful lookup
- Add click handlers for email/call buttons

🤖 Generated with Claude Code"
```

---

*Due to length constraints, I'll continue the implementation plan in the next section. The plan will cover:*

- **Phase 3:** Email templates, email modal, and sending via Resend
- **Phase 4:** Call scripts modal
- **Phase 5:** User creation in Supabase
- **Phase 6:** Progressive disclosure
- **Phase 7:** Content pages (About, FAQ, etc.)
- **Phase 8:** Deployment to Vercel
- **Phase 9:** Seed key villains data

Would you like me to continue with the remaining phases?

---

## Phase 3: Email System

### Task 13: Create Email Templates

**Files:**
- Create: `src/lib/emailTemplates.ts`

**Step 1: Create email template system**

Create: `src/lib/emailTemplates.ts`

```typescript
import type { UserRole } from './supabase'

interface TemplateVariables {
  user_name?: string
  user_email: string
  user_city?: string
  user_state?: string
  user_role: string
  lawmaker_name: string
  lawmaker_title: string
  lawmaker_state: string
  business_name?: string
}

export interface EmailTemplate {
  subject: string
  body: string
}

function replaceVariables(template: string, variables: TemplateVariables): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    result = result.replaceAll(placeholder, value || '')
  })
  return result
}

const TEMPLATES: Record<UserRole, { subject: string; body: string }> = {
  business_owner: {
    subject: 'Urgent: Hemp Ban Will Destroy {business_name} and Jobs in {user_state}',
    body: `Dear {lawmaker_title} {lawmaker_name},

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
{user_email}`,
  },
  consumer: {
    subject: 'Protect My Access to Hemp Wellness Products',
    body: `Dear {lawmaker_title} {lawmaker_name},

My name is {user_name}, and I'm a constituent in {user_city}, {user_state}. I'm writing to urge you to fix the hemp ban provisions in the recent spending bill.

I rely on hemp-derived CBD products for wellness and relaxation. The new 0.4mg THC limit will ban nearly all the products I use, forcing me back to pharmaceutical options with more side effects or leaving me without relief.

This ban wasn't driven by safety concerns—it was pushed by the alcohol industry to eliminate competition. Meanwhile, far more intoxicating alcoholic beverages remain widely available.

I urge you to support legislation that:
• Sets a realistic THC limit for non-intoxicating hemp products
• Protects consumers' access to safe, legal wellness products
• Respects state regulatory frameworks

Millions of Americans use hemp products responsibly. Please don't let big alcohol lobbyists take away our choices.

Thank you.

Sincerely,
{user_name}
{user_city}, {user_state}
{user_email}`,
  },
  medical_user: {
    subject: 'Hemp Ban Will Eliminate My Pain Management Options',
    body: `Dear {lawmaker_title} {lawmaker_name},

My name is {user_name}, and I'm writing from {user_city}, {user_state}. I use hemp-derived CBD and low-THC products to manage chronic pain, and the recent hemp ban will eliminate my access to these products.

The 0.4mg THC limit is so restrictive it bans nearly every therapeutic hemp product. For patients like me, these products offer relief without the side effects of opioids or the high costs of pharmaceuticals.

This ban was pushed by alcohol industry lobbyists, not public health experts. It will hurt patients while protecting alcohol's market share.

I urge you to support fixes that:
• Allow therapeutic hemp products with reasonable THC limits
• Protect patient access to non-intoxicating relief options
• Distinguish between intoxicating recreational products and medical wellness use

Please don't let lobbying interests override patient needs.

Thank you for your consideration.

Sincerely,
{user_name}
{user_city}, {user_state}
{user_email}`,
  },
  veteran: {
    subject: 'Veteran Urges You to Protect Hemp Access for PTSD and Pain Relief',
    body: `Dear {lawmaker_title} {lawmaker_name},

My name is {user_name}, a veteran living in {user_city}, {user_state}. I'm writing to urge you to fix the hemp ban that will eliminate products many veterans rely on for PTSD and pain management.

Hemp-derived CBD products have given me relief where VA medications failed or caused severe side effects. The new 0.4mg THC limit will ban the products that help me sleep, manage anxiety, and cope with chronic pain from my service.

This ban was driven by alcohol industry lobbying, not veterans' needs or public health. It's wrong to take away safe, legal options that help veterans avoid opioid addiction.

I urge you to:
• Support legislation protecting veteran access to hemp wellness products
• Set realistic THC limits that allow therapeutic use
• Recognize hemp products as a harm-reduction alternative to pharmaceuticals

Veterans deserve access to every safe treatment option. Please fight for us.

Respectfully,
{user_name}
Veteran
{user_city}, {user_state}
{user_email}`,
  },
  employee: {
    subject: 'Hemp Ban Threatens My Job and Family's Livelihood',
    body: `Dear {lawmaker_title} {lawmaker_name},

My name is {user_name}, and I work in the hemp industry in {user_city}, {user_state}. I'm writing to urge you to fix the hemp ban provisions that will eliminate my job and thousands like it.

The new 0.4mg THC limit will force hemp businesses to close, putting me and my family at risk. This law wasn't about safety—it was pushed by the alcohol industry to eliminate competition.

I urge you to:
• Support legislation to fix the unworkable THC limits
• Protect American jobs in the hemp industry
• Stand up for workers against big alcohol lobbying

My family depends on this job. Please help us save the hemp industry and the livelihoods it supports.

Thank you.

Sincerely,
{user_name}
{user_city}, {user_state}
{user_email}`,
  },
}

export function generateEmailTemplate(
  role: UserRole,
  variables: TemplateVariables
): EmailTemplate {
  const template = TEMPLATES[role]
  
  // Use fallback name if not provided
  const finalVariables = {
    ...variables,
    user_name: variables.user_name || 'A concerned constituent',
    business_name: variables.business_name || 'my hemp business',
  }

  return {
    subject: replaceVariables(template.subject, finalVariables),
    body: replaceVariables(template.body, finalVariables),
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/emailTemplates.ts
git commit -m "feat: create email template system with role-based personalization

- Add 5 role-specific email templates (business owner, consumer, medical user, veteran, employee)
- Implement variable substitution for personalization
- Generate subject and body based on user role and lawmaker info

🤖 Generated with Claude Code"
```

---

### Task 14: Create Email Modal Component

**Files:**
- Create: `src/components/EmailModal.tsx`

**Step 1: Create email modal**

Create: `src/components/EmailModal.tsx`

```typescript
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import type { Lawmaker, UserRole } from '../lib/supabase'
import { generateEmailTemplate } from '../lib/emailTemplates'

interface EmailModalProps {
  open: boolean
  onClose: () => void
  lawmaker: Lawmaker
  userEmail: string
  userRole: UserRole
  onSend: (subject: string, body: string) => Promise<void>
}

export function EmailModal({ open, onClose, lawmaker, userEmail, userRole, onSend }: EmailModalProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) {
      // Generate template when modal opens
      const template = generateEmailTemplate(userRole, {
        user_email: userEmail,
        user_role: userRole,
        lawmaker_name: lawmaker.name,
        lawmaker_title: lawmaker.chamber === 'senate' ? 'Senator' : 'Representative',
        lawmaker_state: lawmaker.state,
      })
      setSubject(template.subject)
      setBody(template.body)
    }
  }, [open, lawmaker, userEmail, userRole])

  const handleSend = async () => {
    if (!subject || !body) {
      alert('Please fill in subject and body')
      return
    }

    setSending(true)
    try {
      await onSend(subject, body)
      onClose()
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email {lawmaker.name}</DialogTitle>
          <DialogDescription>
            Review and edit your message before sending. Your email will be sent from our campaign
            with your email in the Reply-To field.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="to">To:</Label>
            <p className="text-sm text-gray-600 mt-1">{lawmaker.email || 'Contact form submission'}</p>
          </div>

          <div>
            <Label htmlFor="from">From:</Label>
            <p className="text-sm text-gray-600 mt-1">{userEmail}</p>
          </div>

          <div>
            <Label htmlFor="subject">Subject:</Label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <Label htmlFor="body">Message:</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              className="w-full mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Feel free to personalize this message to make it more effective.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending} className="bg-urgentOrange hover:bg-orange-600">
              {sending ? 'Sending...' : 'Send Email →'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Install missing shadcn component**

```bash
npx shadcn-ui@latest add textarea
```

Expected: Textarea component added

**Step 3: Commit**

```bash
git add src/components/EmailModal.tsx
git commit -m "feat: create email modal component

- Display pre-filled email template based on user role
- Allow editing subject and body before sending
- Show lawmaker email and user email
- Send button with loading state

🤖 Generated with Claude Code"
```

---

## Phase 4: Resend Integration & Email Sending

### Task 15: Set Up Resend Account and Edge Function

**Step 1: Create Resend account**

Manual step:
1. Go to https://resend.com/
2. Sign up for free account
3. Verify email
4. Go to API Keys
5. Create new API key
6. Copy the key (starts with `re_`)

Expected: Resend API key obtained

**Step 2: Add domain (optional but recommended)**

Manual step:
1. In Resend dashboard, go to Domains
2. Add your domain (e.g., dontbanhemp.org)
3. Follow DNS setup instructions (add TXT records for SPF/DKIM)
4. Verify domain

Note: For MVP testing, you can skip this and use Resend's default domain

**Step 3: Set Resend API secret in Supabase**

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

Expected: Secret set successfully

**Step 4: Create send-email Edge Function**

Create: `supabase/functions/send-email-to-lawmaker/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, lawmakerId, emailSubject, emailBody } = await req.json()

    if (!userId || !lawmakerId || !emailSubject || !emailBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // Fetch lawmaker
    const { data: lawmaker, error: lawmakerError } = await supabase
      .from('lawmakers')
      .select('*')
      .eq('id', lawmakerId)
      .single()

    if (lawmakerError || !lawmaker) {
      throw new Error('Lawmaker not found')
    }

    if (!lawmaker.email) {
      throw new Error('Lawmaker does not have an email address on file')
    }

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hemp Action Campaign <action@dontbanhemp.org>',
        to: [lawmaker.email],
        reply_to: [user.email],
        subject: emailSubject,
        text: emailBody,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    // Log email action
    const { error: logError } = await supabase
      .from('email_actions')
      .insert({
        user_id: userId,
        lawmaker_id: lawmakerId,
        email_subject: emailSubject,
        email_body: emailBody,
        resend_message_id: resendData.id,
        status: 'sent',
      })

    if (logError) {
      console.error('Failed to log email action:', logError)
    }

    return new Response(
      JSON.stringify({ success: true, message_id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Step 5: Deploy Edge Function**

```bash
supabase functions deploy send-email-to-lawmaker
```

Expected: Function deployed successfully

**Step 6: Commit**

```bash
git add supabase/functions/send-email-to-lawmaker/
git commit -m "feat: create send-email-to-lawmaker Edge Function

- Send email via Resend API to lawmaker
- Set user email as Reply-To
- Log email action to database
- Handle errors and validation

🤖 Generated with Claude Code"
```

---

## Phase 5: Final Integration & Testing

### Task 16: Complete User Flow Integration

**Files:**
- Modify: `src/App.tsx`
- Create: `src/services/users.ts`
- Create: `src/services/emails.ts`

**Step 1: Create user service**

Create: `src/services/users.ts`

```typescript
import { supabase } from '../lib/supabase'
import type { UserRole } from '../lib/supabase'

export interface CreateUserData {
  email: string
  zipCode: string
  role: UserRole
}

export async function createUser(data: CreateUserData) {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      zip_code: data.zipCode,
      role: data.role,
    })
    .select()
    .single()

  if (error) {
    // Check if user already exists
    if (error.code === '23505') { // unique violation
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .single()
      
      if (existingUser) {
        return existingUser
      }
    }
    throw error
  }

  return user
}
```

**Step 2: Create email service**

Create: `src/services/emails.ts`

```typescript
import { supabase } from '../lib/supabase'

export interface SendEmailData {
  userId: string
  lawmakerId: string
  emailSubject: string
  emailBody: string
}

export async function sendEmailToLawmaker(data: SendEmailData) {
  const { data: result, error } = await supabase.functions.invoke('send-email-to-lawmaker', {
    body: data,
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }

  return result
}
```

**Step 3: Update App.tsx with complete flow**

Modify: `src/App.tsx`

```typescript
import { useState } from 'react'
import { CountdownTimer } from './components/CountdownTimer'
import { CampaignStats } from './components/CampaignStats'
import { ActionForm } from './components/ActionForm'
import { LawmakerResults } from './components/LawmakerResults'
import { EmailModal } from './components/EmailModal'
import { useLawmakerLookup } from './hooks/useLawmakerLookup'
import { createUser } from './services/users'
import { sendEmailToLawmaker } from './services/emails'
import type { Lawmaker, UserRole, User } from './lib/supabase'

function App() {
  const { lawmakers, loading, lookup } = useLawmakerLookup()
  const [user, setUser] = useState<User | null>(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedLawmaker, setSelectedLawmaker] = useState<Lawmaker | null>(null)

  const handleFormSubmit = async (data: { email: string; zipCode: string; role: UserRole }) => {
    try {
      // Create user
      const newUser = await createUser(data)
      setUser(newUser)

      // Lookup lawmakers
      await lookup(data.zipCode)
    } catch (error) {
      console.error('Failed to lookup lawmakers:', error)
      alert('Failed to find your representatives. Please check your ZIP code and try again.')
    }
  }

  const handleEmailClick = (lawmaker: Lawmaker) => {
    setSelectedLawmaker(lawmaker)
    setEmailModalOpen(true)
  }

  const handleCallClick = (lawmaker: Lawmaker) => {
    // We'll implement call modal later; for now just alert
    alert(`Call ${lawmaker.name} at ${lawmaker.phone || 'phone number not available'}`)
  }

  const handleSendEmail = async (subject: string, body: string) => {
    if (!user || !selectedLawmaker) return

    await sendEmailToLawmaker({
      userId: user.id,
      lawmakerId: selectedLawmaker.id,
      emailSubject: subject,
      emailBody: body,
    })

    alert(`Email sent to ${selectedLawmaker.name}!`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <CountdownTimer />
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Congress banned 95% of hemp products.
            </h1>
            <p className="text-xl text-gray-700">
              $28 billion industry. Thousands of jobs. One year to stop it.
            </p>
          </div>
          <CampaignStats />
        </div>
      </div>

      {/* Action Form or Results Section */}
      <div className="py-12 px-4">
        {!lawmakers ? (
          <ActionForm onSubmit={handleFormSubmit} loading={loading} />
        ) : (
          <LawmakerResults
            senators={lawmakers.senators}
            representative={lawmakers.representative}
            onEmailClick={handleEmailClick}
            onCallClick={handleCallClick}
          />
        )}
      </div>

      {/* Email Modal */}
      {user && selectedLawmaker && (
        <EmailModal
          open={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          lawmaker={selectedLawmaker}
          userEmail={user.email}
          userRole={user.role}
          onSend={handleSendEmail}
        />
      )}
    </div>
  )
}

export default App
```

**Step 4: Test complete flow end-to-end**

```bash
npm run dev
```

Manual testing:
1. Enter email, ZIP, role
2. See lawmakers appear
3. Click "Email" on a lawmaker
4. See pre-filled email template
5. Edit and send
6. Verify success message

**Step 5: Commit**

```bash
git add src/services/users.ts src/services/emails.ts src/App.tsx
git commit -m "feat: complete user flow integration

- Create user service to store user in database
- Create email service to send via Edge Function
- Integrate EmailModal with real sending
- Complete end-to-end flow: signup → lookup → email

🤖 Generated with Claude Code"
```

---

## Phase 6: Deployment

### Task 17: Deploy to Vercel

**Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/yourusername/stop-hemp-ban.git
git push -u origin main
```

Expected: Code pushed to GitHub

**Step 2: Deploy to Vercel**

Manual step:
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repo
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_CIVIC_API_KEY`
7. Click "Deploy"

Expected: Site deployed successfully at https://your-project.vercel.app

**Step 3: Test production deployment**

Visit your Vercel URL and test the full flow

**Step 4: Configure custom domain (optional)**

Manual step (if you have a domain):
1. In Vercel project settings → Domains
2. Add your domain
3. Follow DNS setup instructions
4. Wait for propagation

Expected: Site available at your custom domain

---

## Conclusion & Next Steps

**Plan complete! You now have a comprehensive implementation guide covering:**

✅ Project setup (Vite + React + TypeScript + Tailwind + shadcn/ui)
✅ Supabase database schema and RLS policies
✅ Countdown timer component
✅ Campaign stats with progress tracking
✅ Action form with validation
✅ Lawmaker lookup via Google Civic API
✅ Lawmaker results display
✅ Email templates with role-based personalization
✅ Email modal for sending to lawmakers
✅ Resend integration for email delivery
✅ Complete user flow: signup → lookup → email
✅ Deployment to Vercel

**Remaining work for full MVP (Phase 2):**
- Call scripts modal
- Progressive disclosure form
- Social sharing
- Content pages (About, FAQ, The Ban, Privacy, Contact)
- Seed key villains data (McConnell, Harris, etc.)
- SEO meta tags and OG images
- Analytics setup

**Estimated time:**
- Phase 1 (completed in plan): 4-5 days
- Phase 2 (remaining): 3-4 days
- **Total MVP: 7-9 days** (compressed from original 2-3 weeks estimate due to detailed planning)

---

