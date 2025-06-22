#!/usr/bin/env node
/**
 * Quick Troubleshooter for "Database error saving new user"
 * 
 * This script checks specifically for issues related to 
 * the "Database error saving new user" error in Supabase Auth
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkForAuthIssues() {
  console.log('🔍 Checking for common causes of "Database error saving new user"...\n')
  
  try {
    // 1. Test creating a user with full metadata
    const testEmail = `test-full-${Date.now()}@example.com`
    const testPassword = 'Password123!'
    
    console.log(`Step 1: Testing user creation with full metadata...`)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        username: `testuser${Date.now()}`,
        role: 'referrer',
        tier: 'standard',
        avatar: null,
        created_at: new Date().toISOString()
      }
    })

    if (userError) {
      console.error('❌ Error creating user with full metadata:', userError.message)
      console.log('\nTrying fallback approach (the one implemented in Login.tsx)...\n')
      
      // 2. Try the fallback approach (minimal user, then update)
      const fallbackEmail = `test-fallback-${Date.now()}@example.com`
      
      console.log(`Step 2: Creating minimal user without metadata...`)
      const { data: minimalUser, error: minimalError } = await supabase.auth.admin.createUser({
        email: fallbackEmail,
        password: testPassword,
        email_confirm: true
      })
      
      if (minimalError) {
        console.error('❌ Error creating minimal user:', minimalError.message)
        console.log('\n🔎 It seems there are fundamental issues with your Supabase Auth setup.')
        console.log('Please check:')
        console.log('- Supabase service role permissions')
        console.log('- Auth schema configuration')
        console.log('- Database extensions (uuid-ossp)')
        process.exit(1)
      }
      
      console.log('✅ Minimal user created successfully!')
      
      // 3. Try updating the user metadata
      console.log(`\nStep 3: Updating user metadata separately...`)
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        minimalUser.user.id,
        {
          user_metadata: {
            first_name: 'Test',
            last_name: 'User',
            username: `testuser${Date.now()}`,
            role: 'referrer',
            tier: 'standard',
            avatar: null,
            created_at: new Date().toISOString()
          }
        }
      )
      
      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError.message)
        console.log('\nThis indicates the Login.tsx fallback approach may not work.')
      } else {
        console.log('✅ User metadata updated successfully!')
        console.log('\n✅ GOOD NEWS: The fallback approach in Login.tsx should work for you.')
        console.log('The application already implements this two-step process if the primary approach fails.')
      }
      
      // Clean up the test user
      await supabase.auth.admin.deleteUser(minimalUser.user.id)
    } else {
      console.log('✅ Success! User created with full metadata successfully.')
      console.log('\nYour Supabase Auth configuration appears to be working correctly.')
      console.log('This indicates the "Database error saving new user" may be transient or already resolved.')
      
      // Clean up the test user
      await supabase.auth.admin.deleteUser(userData.user.id)
    }
    
    // 4. Check for SQL fixes script
    console.log('\nChecking for SQL fixes script...')
    const sqlScriptPath = path.join(process.cwd(), 'scripts', 'fix-auth-issues.sql')
    
    if (fs.existsSync(sqlScriptPath)) {
      console.log('✅ SQL fixes script found at:', sqlScriptPath)
      console.log('If you continue to experience issues, run this script in your Supabase SQL Editor.')
    } else {
      console.log('❌ SQL fixes script not found. Please check the project structure.')
    }
    
  } catch (error) {
    console.error('An unexpected error occurred:', error)
    process.exit(1)
  }
}

checkForAuthIssues()
  .then(() => {
    console.log('\n🏁 Troubleshooting complete.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Troubleshooting failed:', err)
    process.exit(1)
  })
