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

  try {
    // 1. Enable RLS on tables by running raw SQL
    const { error: rlsError } = await supabase.rpc('apply_rls_policies')
    
    if (rlsError) {
      console.error('Error applying RLS policies:', rlsError)
      // Create the function if it doesn't exist      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION apply_rls_policies()
        RETURNS void AS $$
        BEGIN
          -- Enable Row Level Security for the users table
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
          
          -- Create a policy that allows users to select their own record
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'select_own_user_record'
          ) THEN
              CREATE POLICY select_own_user_record ON public.users
                FOR SELECT USING (auth.uid()::text = id);
          END IF;
          
          -- Create a policy that allows authenticated users to insert their own record during registration
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'insert_own_user_record'
          ) THEN
              CREATE POLICY insert_own_user_record ON public.users
                FOR INSERT WITH CHECK (auth.uid()::text = id);
          END IF;
          
          -- Create a policy that allows users to update their own record
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'update_own_user_record'
          ) THEN
              CREATE POLICY update_own_user_record ON public.users
                FOR UPDATE USING (auth.uid()::text = id);
          END IF;
          
          -- Allow admin users to see all records in the users table
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'admin_access_all_users'
          ) THEN
              CREATE POLICY admin_access_all_users ON public.users
                FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()::text) = 'admin');
          END IF;
          
          -- Grant privileges to authenticated users
          GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
          
          -- Grant additional permissions to anon and service_role
          GRANT SELECT, INSERT ON public.users TO anon;
          GRANT ALL ON public.users TO service_role;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // Create the function
      const { error: createFnError } = await supabase.from('_supabase').select().sql(createFunctionSql);
      if (createFnError) console.error('Error creating function:', createFnError);
      
      // Run the function
      await supabase.rpc('apply_rls_policies');
    }
    
    console.log('✅ Row Level Security enabled for users table')// 2. Try to create an admin user using the signup method first
    try {
      console.log('Checking for existing admin user...')
      const { data: existingAdmin, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@example.com')
        .maybeSingle()

      if (checkError) {
        console.error('Error checking for admin user:', checkError)
      }

      if (!existingAdmin) {
        console.log('Creating admin user via signup...')
        // Use the regular signup flow instead of admin.createUser
        const { data: authUser, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@example.com',
          password: 'Admin123!',
          options: {
            data: {
              first_name: 'Admin',
              last_name: 'User',
              role: 'admin'
            }
          }
        })

        if (signUpError) {
          console.error('Error signing up admin user:', signUpError)
        } else if (authUser && authUser.user) {
          console.log('Admin auth user created, adding to users table...')
          
          // Insert into users table
          const { error: insertError } = await supabase.from('users').insert({
            id: authUser.user.id,
            email: 'admin@example.com',
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            tier: 'premium'
          })

          if (insertError) {
            console.error('Error inserting admin user data:', insertError)
          } else {
            console.log('✅ Admin user created')
            
            // Update auth user to confirm email (since we're the admin)
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              authUser.user.id,
              { email_confirm: true }
            )
            
            if (updateError) {
              console.error('Error confirming admin email:', updateError)
            } else {
              console.log('✅ Admin email confirmed')
            }
          }
        }
      } else {
        console.log('✅ Admin user already exists')
      }
    } catch (err) {
      console.error('Error in admin user creation process:', err)
    }

    console.log('Database setup complete!')
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
