import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  user_type: 'referrer' | 'business' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  user_id: string
  business_name: string
  industry?: string
  website?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  business_id: string
  name: string
  description?: string
  service_area?: string
  postcode_start?: string
  postcode_end?: string
  reward_per_conversion: number
  max_budget: number
  spent_budget: number
  start_date?: string
  end_date?: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  campaign_id: string
  referrer_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  service_requested?: string
  estimated_value: number
  status: 'pending' | 'approved' | 'rejected' | 'converted'
  referral_code?: string
  source: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Conversion {
  id: string
  lead_id: string
  conversion_value: number
  commission_amount: number
  conversion_date: string
  verified_by?: string
  created_at: string
}

export interface Payout {
  id: string
  referrer_id: string
  amount: number
  period_start: string
  period_end: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  payment_method?: string
  transaction_id?: string
  created_at: string
  updated_at: string
}

export interface Dispute {
  id: string
  lead_id: string
  referrer_id: string
  business_id: string
  dispute_type: 'fraud_alert' | 'multiple_referrers' | 'timing_dispute' | 'other'
  business_claim?: string
  referrer_response?: string
  evidence_urls?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  resolved_by?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}