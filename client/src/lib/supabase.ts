
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fix for TypeScript errors with user_metadata in the auth API
// This doesn't affect runtime behavior but helps with type checking
export type UserMetadata = {
  first_name?: string
  last_name?: string
  username?: string
  role?: string
  tier?: string
  avatar?: string | null
  created_at?: string
  phone?: string
  phone_verified?: boolean
  google_connected?: boolean
  verification_code?: string
  verification_sent_at?: string
  [key: string]: any
}
