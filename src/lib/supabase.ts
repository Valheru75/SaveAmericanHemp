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
