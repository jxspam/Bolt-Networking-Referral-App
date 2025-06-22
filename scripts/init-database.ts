// This script sets up the database for the Networking-Earnings-App
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service key in environment variables')
  process.exit(1)
}

// Create a Supabase client with the service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up database...')

  try {    // 1. Skip manual RLS policy setup for now
    // RLS policies will need to be set up manually in the Supabase dashboard
    console.log('⚠️ Please set up RLS policies manually in the Supabase dashboard:')
    console.log('1. Enable RLS on the users table')
    console.log('2. Create policies for users to manage their own records') 
    console.log('3. Create policies for admin access')
    console.log('✅ Skipping automatic RLS setup')

    // 2. Create an admin user
    console.log('Checking for admin user...')
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .maybeSingle()

    if (checkError) {
      console.error('Error checking for admin user:', checkError)
    }

    // If admin doesn't exist, create one using normal signup
    if (!existingAdmin) {
      console.log('Creating admin user...')
      try {
        // Try regular signup
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@example.com',
          password: 'Admin123!',
        })

        if (signUpError) {
          throw signUpError
        }

        if (data && data.user) {
          // Insert into users table
          const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            email: 'admin@example.com',
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            tier: 'premium'
          })

          if (insertError) {
            throw insertError
          }

          console.log('✅ Admin user created successfully')
        }
      } catch (err) {
        console.error('Error creating admin user:', err)
        console.log('⚠️ Continuing with setup despite admin user creation error')
      }
    } else {
      console.log('✅ Admin user already exists')
    }

    console.log('Database setup completed!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()
  .then(() => {
    console.log('Setup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
