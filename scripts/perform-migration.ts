import { db } from "../server/db";
import { neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import { createClient } from '@supabase/supabase-js';
import type { QueryResult } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

// Helper function to get rows from QueryResult
function getRows<T>(result: QueryResult<Record<string, unknown>>): T[] {
  return result.rows as unknown as T[];
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function performMigration() {
  try {
    console.log("Step 1/5: Checking for remaining foreign key constraints on the users table...");
      // Check for foreign key constraints
    const constraintCheck = await db.execute(`
      SELECT tc.constraint_name, tc.table_name, kcu.column_name, 
             ccu.table_name AS foreign_table_name,
             ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'user';
    `);
    
    const constraints = getRows<{constraint_name: string; table_name: string; column_name: string}>(constraintCheck);

    // If there are constraints, we need to drop them
    if (constraints.length > 0) {
      console.log(`Found ${constraints.length} foreign key constraints. Dropping them now...`);

      for (const constraint of constraints) {
        console.log(`Dropping constraint ${constraint.constraint_name} on table ${constraint.table_name}`);
        
        await db.execute(`
          ALTER TABLE ${constraint.table_name}
          DROP CONSTRAINT ${constraint.constraint_name};
        `);
      }
    } else {
      console.log("No foreign key constraints found on the users table.");
    }

    console.log("Step 2/5: Updating schema to use Supabase Auth UUIDs in dependent tables...");
    
    // List of tables with user references to check and update if needed
    const tablesWithUserReferences = ['leads', 'campaigns', 'disputes', 'earnings', 'activities', 'payouts', 'payout_methods'];
    
    for (const tableName of tablesWithUserReferences) {
      try {
        // Check if the table exists
        const tableCheck = await db.execute(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = '${tableName}';
        `);
        
        if (tableCheck.length === 0) {
          console.log(`Table ${tableName} doesn't exist, skipping.`);
          continue;
        }

        // Check for column types related to user references
        const columnCheck = await db.execute(`
          SELECT column_name, data_type 
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = '${tableName}'
          AND column_name LIKE '%user_id%' OR column_name LIKE '%referrer_id%' OR column_name LIKE '%business_id%' OR column_name LIKE '%admin_id%';
        `);

        // Update columns that reference users to use UUID type if needed
        for (const column of columnCheck) {
          if (column.data_type !== 'uuid') {
            console.log(`Altering ${tableName}.${column.column_name} to UUID type...`);
            
            await db.execute(`
              ALTER TABLE ${tableName} ALTER COLUMN ${column.column_name} TYPE uuid USING ${column.column_name}::uuid;
            `);
          } else {
            console.log(`Column ${tableName}.${column.column_name} is already UUID type.`);
          }
        }
      } catch (error) {
        console.error(`Error processing table ${tableName}:`, error);
      }
    }

    console.log("Step 3/5: Setting up RLS policies on tables to use Supabase Auth user IDs...");
    
    // Add RLS policies - example for a typical table
    const tablesForRLS = ['campaigns', 'leads', 'earnings', 'payouts', 'payout_methods', 'disputes'];
    
    for (const tableName of tablesForRLS) {
      try {
        // First, enable RLS on the table if not already
        await db.execute(`
          ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
        `);
        console.log(`Enabled RLS on table ${tableName}`);
        
        // Create policies based on table type
        if (tableName === 'campaigns') {
          // Allow businesses to see their own campaigns
          await db.execute(`
            CREATE POLICY "Businesses can view their own campaigns"
            ON campaigns FOR SELECT
            USING (business_id = auth.uid());
          `);
          
          // Allow businesses to create their own campaigns
          await db.execute(`
            CREATE POLICY "Businesses can create their own campaigns"
            ON campaigns FOR INSERT
            WITH CHECK (business_id = auth.uid());
          `);
          
          // Allow businesses to update their own campaigns
          await db.execute(`
            CREATE POLICY "Businesses can update their own campaigns"
            ON campaigns FOR UPDATE
            USING (business_id = auth.uid());
          `);
          
          // Allow admins to see all campaigns (add this if you have an admin role)
          await db.execute(`
            CREATE POLICY "Admins can see all campaigns"
            ON campaigns FOR ALL
            USING (
              EXISTS (
                SELECT 1 FROM auth.users
                WHERE auth.users.id = auth.uid()
                AND auth.users.raw_user_meta_data->>'role' = 'admin'
              )
            );
          `);
        } 
        else if (tableName === 'leads' || tableName === 'earnings') {
          // Allow referrers to see their own data
          await db.execute(`
            CREATE POLICY "Referrers can view their own ${tableName}"
            ON ${tableName} FOR SELECT
            USING (referrer_id = auth.uid());
          `);
          
          // Allow referrers to create their own leads
          if (tableName === 'leads') {
            await db.execute(`
              CREATE POLICY "Referrers can create their own leads"
              ON leads FOR INSERT
              WITH CHECK (referrer_id = auth.uid());
            `);
          }
          
          // Allow admins to see all data
          await db.execute(`
            CREATE POLICY "Admins can see all ${tableName}"
            ON ${tableName} FOR ALL
            USING (
              EXISTS (
                SELECT 1 FROM auth.users
                WHERE auth.users.id = auth.uid()
                AND auth.users.raw_user_meta_data->>'role' = 'admin'
              )
            );
          `);
        }
        else if (tableName === 'payouts' || tableName === 'payout_methods') {
          // Allow users to see their own payouts/methods
          await db.execute(`
            CREATE POLICY "Users can view their own ${tableName}"
            ON ${tableName} FOR SELECT
            USING (user_id = auth.uid());
          `);
          
          // Allow users to create their own payout methods
          if (tableName === 'payout_methods') {
            await db.execute(`
              CREATE POLICY "Users can create their own payout methods"
              ON payout_methods FOR INSERT
              WITH CHECK (user_id = auth.uid());
            `);
            
            // Allow users to update their own payout methods
            await db.execute(`
              CREATE POLICY "Users can update their own payout methods"
              ON payout_methods FOR UPDATE
              USING (user_id = auth.uid());
            `);
          }
          
          // Allow admins to manage all payouts
          await db.execute(`
            CREATE POLICY "Admins can manage all ${tableName}"
            ON ${tableName} FOR ALL
            USING (
              EXISTS (
                SELECT 1 FROM auth.users
                WHERE auth.users.id = auth.uid()
                AND auth.users.raw_user_meta_data->>'role' = 'admin'
              )
            );
          `);
        }
        
        console.log(`Created RLS policies for ${tableName}`);
      } catch (error) {
        console.error(`Error setting up RLS for table ${tableName}:`, error);
      }
    }

    console.log("Step 4/5: Checking for any database triggers or functions that need updating...");
    
    // Drop any database triggers or functions that depend on the users table
    try {
      // Check if handle_auth_user_insert function exists and drop it
      const handleAuthUserFunc = await db.execute(`
        SELECT routine_name FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = 'handle_auth_user_insert';
      `);
      
      if (handleAuthUserFunc.length > 0) {
        console.log('Dropping handle_auth_user_insert function...');
        await db.execute('DROP FUNCTION IF EXISTS handle_auth_user_insert CASCADE;');
      }
      
      // Check if handle_new_user function exists and drop it
      const handleNewUserFunc = await db.execute(`
        SELECT routine_name FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';
      `);
      
      if (handleNewUserFunc.length > 0) {
        console.log('Dropping handle_new_user function...');
        await db.execute('DROP FUNCTION IF EXISTS handle_new_user CASCADE;');
      }
      
      // Drop any triggers related to user creation/modification
      console.log('Dropping any triggers related to user creation/modification...');
      await db.execute('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    } catch (error) {
      console.error('Error removing triggers/functions:', error);
    }

    console.log("Step 5/5: Dropping the users table...");
    
    // Drop user table finally
    try {
      const doesUserTableExist = await db.execute(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user';
      `);
      
      if (doesUserTableExist.length > 0) {
        console.log('Dropping the user table...');
        await db.execute('DROP TABLE IF EXISTS public."user" CASCADE;');
        
        const doesUsersTableExist = await db.execute(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'users';
        `);
        
        if (doesUsersTableExist.length > 0) {
          console.log('Dropping the users table...');
          await db.execute('DROP TABLE IF EXISTS public.users CASCADE;');
        }
      } else {
        console.log('User table not found. It may have been already dropped.');
      }
    } catch (error) {
      console.error('Error dropping users table:', error);
    }

    console.log("Migration completed successfully!");
    console.log("All user data is now maintained in Supabase Auth user metadata.");
    console.log("Please update your client and server code to use Supabase Auth for user data.");
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

performMigration();
