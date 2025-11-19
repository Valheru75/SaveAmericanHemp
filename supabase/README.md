# Supabase Database Setup

This directory contains the database schema migration for the StopTheHempBan project.

## Manual Steps Required

Since this project doesn't use the Supabase CLI local development workflow, you need to apply the migration manually:

### Step 1: Apply the Migration

1. Go to your Supabase Dashboard at https://supabase.com/dashboard
2. Select your "stop-hemp-ban" project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Copy the entire contents of `migrations/20251119000001_initial_schema.sql`
6. Paste into the SQL Editor
7. Click **"Run"** or press `Ctrl+Enter`

Expected result: You should see a success message indicating all tables, indexes, views, and policies were created.

### Step 2: Verify the Schema

1. Go to **Table Editor** in the left sidebar
2. Verify these tables exist:
   - `users`
   - `lawmakers`
   - `email_actions`
   - `call_actions`
   - `user_profiles`

3. Go to **Database** → **Views**
4. Verify the `campaign_stats` view exists

### Step 3: Check Row Level Security

1. Go to **Authentication** → **Policies**
2. Verify RLS policies are enabled for:
   - `users` (3 policies)
   - `email_actions` (1 policy)
   - `lawmakers` (1 policy)
   - `user_profiles` (3 policies)

## Schema Overview

### Tables

- **users**: Stores user information (email, zip code, role, progressive disclosure fields)
- **lawmakers**: Stores federal lawmakers (senators and representatives) with campaign data
- **email_actions**: Logs emails sent to lawmakers
- **call_actions**: Logs calls made to lawmakers
- **user_profiles**: Extended user profile data (business info, stories)

### Views

- **campaign_stats**: Aggregates total users and emails sent for display on the homepage

### Security

All tables have Row Level Security (RLS) enabled with policies that:
- Allow public read access to lawmakers data
- Allow users to manage their own data
- Allow tracking actions without exposing other users' data

## Next Steps

After applying the migration:
1. Test the schema by inserting a test user
2. Verify the campaign_stats view returns data
3. Continue with Task 4: Get Google Civic Information API Key
