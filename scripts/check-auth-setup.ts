import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSupabaseAuthSetup() {
  console.log('🔍 Checking Supabase Auth setup...')
  
  try {
    // 1. Test creating a test user
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'Password123!'
    
    console.log(`\n📧 Creating test user: ${testEmail}`)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        role: 'referrer',
      }
    })

    if (userError) {
      console.error('❌ Error creating test user:', userError.message)
      console.error('This indicates a problem with your Supabase Auth setup.')
      
      if (userError.message.includes('duplicate key')) {
        console.log('💡 Suggestion: This appears to be a conflict with an existing user. Try with a different email address.')
      } else if (userError.message.includes('database') || userError.message.includes('schema')) {
        console.log('💡 Suggestion: This may be a database permission issue or missing schema. Check your Supabase SQL setup.')
        console.log('Run the SQL fix script in scripts/fix-auth-issues.sql in your Supabase SQL Editor.')
      }
    } else {
      console.log('✅ Test user created successfully!')
      
      // 2. Get user details
      console.log(`\n🔍 Checking user data retrieval...`)
      const { data: user, error: getUserError } = await supabase.auth.admin.getUserById(
        userData.user.id
      )
      
      if (getUserError) {
        console.error('❌ Error retrieving user:', getUserError.message)
      } else {
        console.log('✅ User data retrieved successfully:', user.user.email)
        
        // 3. Update user metadata
        console.log(`\n🔄 Testing user metadata updates...`)
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          userData.user.id,
          {
            user_metadata: {
              ...user.user.user_metadata,
              tier: 'premium',
              test_timestamp: new Date().toISOString()
            }
          }
        )
        
        if (updateError) {
          console.error('❌ Error updating user metadata:', updateError.message)
        } else {
          console.log('✅ User metadata updated successfully!')
        }
        
        // 4. Delete the test user
        console.log(`\n🧹 Cleaning up - deleting test user...`)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          userData.user.id
        )
        
        if (deleteError) {
          console.error('❌ Error deleting test user:', deleteError.message)
        } else {
          console.log('✅ Test user deleted successfully!')
        }
      }
    }
    
    console.log('\n📋 Summary:')
    if (!userError && !userData?.user) {
      console.log('❌ Auth setup check failed. Unable to create test user.')
    } else if (userError) {
      console.log('❌ Auth setup check failed. See errors above.')
    } else {
      console.log('✅ Auth setup appears to be working correctly!')
      console.log('If you\'re still experiencing "Database error saving new user" issues:')
      console.log('1. Check for database schema conflicts')
      console.log('2. Verify that RLS policies are properly set up')
      console.log('3. Look for any custom triggers that might interfere with auth.users table')
    }
    
  } catch (err) {
    console.error('❌ Unexpected error during auth check:', err)
    process.exit(1)
  }
}

checkSupabaseAuthSetup()
  .catch(err => {
    console.error('Script failed:', err)
    process.exit(1)
  })
