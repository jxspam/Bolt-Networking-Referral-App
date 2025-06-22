#!/usr/bin/env node
/**
 * Fix Supabase Auth Setup
 * 
 * This script helps diagnose and fix the "Database error saving new user" issue
 * by applying SQL fixes and optimizing the environment setup.
 * It requires the SUPABASE_SERVICE_KEY to be set in your .env file.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

// Load environment variables
config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Check environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file')
  console.log('\nWould you like to set these values now? (y/n)')
  
  rl.question('> ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      setupEnvironment()
    } else {
      console.log('Exiting without making changes.')
      process.exit(1)
    }
  })
} else {
  checkAndFixAuthIssues()
}

function setupEnvironment() {
  console.log('\n=== Supabase Environment Setup ===')
  
  rl.question('Enter your Supabase URL (e.g., https://your-project.supabase.co): ', (url) => {
    if (!url) {
      console.error('Supabase URL is required.')
      process.exit(1)
    }
    
    rl.question('Enter your Supabase anon key: ', (anonKey) => {
      if (!anonKey) {
        console.error('Supabase anon key is required.')
        process.exit(1)
      }
      
      rl.question('Enter your Supabase service role key: ', (serviceKey) => {
        if (!serviceKey) {
          console.error('Supabase service role key is required.')
          process.exit(1)
        }
        
        try {
          // Update .env file
          const envPath = path.join(rootDir, '.env')
          let envContent = ''
          
          try {
            envContent = fs.readFileSync(envPath, 'utf8')
          } catch (error) {
            // Create new .env file if it doesn't exist
            envContent = '# Supabase Configuration\n'
          }
          
          // Replace or add environment variables
          const envLines = envContent.split('\n')
          const newEnvLines: string[] = []
          
          let urlAdded = false
          let anonKeyAdded = false
          let serviceKeyAdded = false
          
          for (const line of envLines) {
            if (line.startsWith('VITE_SUPABASE_URL=')) {
              newEnvLines.push(`VITE_SUPABASE_URL=${url}`)
              urlAdded = true
            } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
              newEnvLines.push(`VITE_SUPABASE_ANON_KEY=${anonKey}`)
              anonKeyAdded = true
            } else if (line.startsWith('SUPABASE_SERVICE_KEY=')) {
              newEnvLines.push(`SUPABASE_SERVICE_KEY=${serviceKey}`)
              serviceKeyAdded = true
            } else {
              newEnvLines.push(line)
            }
          }
          
          // Add any missing environment variables
          if (!urlAdded) newEnvLines.push(`VITE_SUPABASE_URL=${url}`)
          if (!anonKeyAdded) newEnvLines.push(`VITE_SUPABASE_ANON_KEY=${anonKey}`)
          if (!serviceKeyAdded) newEnvLines.push(`SUPABASE_SERVICE_KEY=${serviceKey}`)
          
          // Write updated .env file
          fs.writeFileSync(envPath, newEnvLines.join('\n'))
          
          console.log('✅ Environment variables updated successfully!')
          
          // Update global variables for checking auth issues
          process.env.VITE_SUPABASE_URL = url
          process.env.VITE_SUPABASE_ANON_KEY = anonKey
          process.env.SUPABASE_SERVICE_KEY = serviceKey
          
          // Continue with auth fixes
          checkAndFixAuthIssues()
        } catch (error) {
          console.error('Error updating environment variables:', error)
          process.exit(1)
        }
      })
    })
  })
}

async function checkAndFixAuthIssues() {
  console.log('\n=== Fixing Supabase Auth Issues ===')
  
  // Create Supabase client with service role key
  const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    console.log('🔍 Checking for "uuid-ossp" extension...')
    
    // First, try to create a function to check/enable the extension
    try {
      // Create function to enable uuid-ossp
      await supabase.from('_dummy_query').select().limit(1).then(async () => {
        console.log('Creating a helper function for extensions...')
        
        // Use a simple RPC call to check if we can create functions
        const { error } = await supabase.rpc('check_extension', { ext_name: 'uuid-ossp' })
        
        if (error) {
          console.log('Unable to use RPC. Will provide SQL commands for manual execution.')
          console.log('\nPlease run the following SQL in your Supabase SQL Editor:')
          console.log('```sql')
          console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
          console.log('```')
        } else {
          console.log('✅ Successfully checked extensions!')
        }
      })
    } catch (err) {
      console.log('Cannot execute SQL directly. Providing commands to run manually.')
      console.log('\nPlease run the following SQL in your Supabase SQL Editor:')
      console.log('```sql')
      console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
      console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;')
      console.log('DROP TRIGGER IF EXISTS sync_users ON auth.users;')
      console.log('```')
    }
    
    // Try to use the Supabase client to create/modify a test user
    console.log('\n🔍 Testing user creation with Supabase Auth...')
    
    try {
      // Check if we can create users
      const testEmail = `test-${Date.now()}@example.com`
      const { data, error } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'Password123!',
        email_confirm: true
      })
      
      if (error) {
        console.error('❌ Error creating test user:', error.message)
        console.log('\nThis indicates there may be issues with your Supabase Auth configuration.')
        console.log('Please verify your service role key has proper permissions.')
      } else {
        console.log('✅ Successfully created test user!')
        console.log('Cleaning up test user...')
        
        // Delete the test user
        await supabase.auth.admin.deleteUser(data.user.id)
        console.log('✅ Test user deleted.')
        console.log('\n🎉 Your Supabase Auth setup appears to be working correctly!')
        
        console.log('\nFor persistent "Database error saving new user" issues:')
        console.log('1. Make sure you have run the SQL fixes in Supabase SQL Editor')
        console.log('2. Check that Login.tsx is properly handling the fallback authentication method')
        console.log('3. Consider using the npm run fix:signup script for additional testing')
      }
    } catch (authErr) {
      console.error('❌ Error testing Supabase Auth:', authErr)
      console.log('\nPlease verify your Supabase credentials and permissions.')
    }
    
    console.log('\nTroubleshooting completed. If issues persist, please check the docs/auth-troubleshooting.md file.')
    rl.close()
  } catch (error) {
    console.error('An unexpected error occurred:', error)
    rl.close()
    process.exit(1)
  }
}

// Properly handle process termination
process.on('SIGINT', () => {
  rl.close()
  process.exit(0)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  rl.close()
  process.exit(1)
})
