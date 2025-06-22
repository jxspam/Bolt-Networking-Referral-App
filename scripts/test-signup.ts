#!/usr/bin/env node
/**
 * Test Supabase Auth Signup
 * 
 * This script tests the process of signing up a new user through the Supabase Auth API
 * to help diagnose the "Database error saving new user" issue
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Supabase credentials not found in environment variables')
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file')
  process.exit(1)
}

// Create Supabase client with anon key (simulating frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  console.log('=== TESTING USER SIGNUP PROCESS ===')
  
  // Generate unique test user
  const timestamp = new Date().getTime()
  const testEmail = `test-user-${timestamp}@example.com`
  const testPassword = 'StrongP@ssword123'
  
  // 1. First attempt - complete signup with full metadata
  console.log('\n1. Testing complete signup with full metadata...')
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          username: `testuser${timestamp}`,
          role: 'referrer',
          tier: 'standard',
          avatar: null,
          created_at: new Date().toISOString()
        }
      }
    })

    if (error) {
      console.error('❌ Error with complete signup:', error.message)
      
      if (error.message.includes('Database error saving new user')) {
        console.log('\n🔍 Detected the specific "Database error saving new user" issue.')
        console.log('This confirms the issue mentioned in the error logs.')
      }
    } else {
      console.log('✅ Complete signup successful!', data)
      console.log(`User created with ID: ${data.user?.id}`)
      return
    }
  } catch (err) {
    console.error('❌ Exception during complete signup:', err)
  }

  // 2. Try fallback approach - minimal signup then update
  console.log('\n2. Testing fallback approach (minimal signup then update)...')
  try {
    // First create minimal user
    const { data, error } = await supabase.auth.signUp({
      email: `fallback-${testEmail}`,
      password: testPassword
    })

    if (error) {
      console.error('❌ Error with minimal signup:', error.message)
      console.log('\n⚠️ Both signup approaches failed. This suggests potential issues with:')
      console.log('- Supabase project configuration')
      console.log('- Database extensions')
      console.log('- Auth triggers or hooks')
      console.log('- Network connectivity')
      return
    }

    console.log('✅ Minimal signup successful!')
    
    if (data.user) {
      // Then update metadata
      console.log('Updating user metadata...')
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: 'Test',
          last_name: 'User',
          username: `testuser${timestamp}`,
          role: 'referrer',
          tier: 'standard',
          avatar: null,
          created_at: new Date().toISOString()
        }
      })

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError.message)
      } else {
        console.log('✅ User metadata updated successfully!')
        console.log('\n🎉 Fallback approach works! This confirms that:')
        console.log('1. The issue is specifically with creating users with metadata')
        console.log('2. The Login.tsx fallback implementation should work for users')
      }
    }
  } catch (err) {
    console.error('❌ Exception during fallback approach:', err)
  }
}

testSignup()
  .then(() => {
    console.log('\n=== TEST COMPLETED ===')
    console.log('To fix Supabase Auth issues, run: npm run fix:supabase')
  })
  .catch(err => {
    console.error('Test failed with error:', err)
    process.exit(1)
  })
