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
