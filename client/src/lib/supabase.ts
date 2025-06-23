import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file in the project root directory and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // We'll handle this manually
  }
})

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