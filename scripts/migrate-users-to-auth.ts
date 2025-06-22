import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials (VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY) are not set.');
  process.exit(1);
}

// Initialize Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUsers() {
  console.log('Connecting to the database...');
  
  // Initialize Postgres client
  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  try {
    // First check if the users table exists
    console.log('Checking if users table exists...');
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      );
    `);
    
    const tableExists = tableCheck[0].exists;
    
    if (!tableExists) {
      console.log('The users table does not exist, nothing to migrate.');
      return;
    }

    // Get all users from the database
    console.log('Fetching users from PostgreSQL...');
    const users = await db.execute(sql`SELECT * FROM public.users;`);
    console.log(`Found ${users.length} users to migrate.`);

    // Migrate each user to Supabase Auth
    for (const user of users) {
      console.log(`Migrating user ${user.email}...`);
      
      try {
        // Check if the user already exists in Supabase Auth
        const { data: existingUsers } = await supabase.auth.admin.listUsers({
          filters: {
            email: user.email
          }
        });

        if (existingUsers && existingUsers.users.length > 0) {
          console.log(`User ${user.email} already exists in Supabase Auth, updating metadata...`);
          
          // Update user metadata
          const { data, error } = await supabase.auth.admin.updateUserById(
            existingUsers.users[0].id,
            {
              user_metadata: {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                role: user.role || 'referrer',
                tier: user.tier || 'standard',
                avatar: user.avatar,
                created_at: user.created_at || new Date().toISOString()
              }
            }
          );
          
          if (error) {
            console.error(`Error updating user ${user.email}:`, error);
          } else {
            console.log(`User ${user.email} metadata updated successfully.`);
          }
        } else {
          console.log(`User ${user.email} does not exist in Supabase Auth, creating...`);
          
          // Create a new user with a random password (user will need to reset password)
          const randomPassword = Math.random().toString(36).slice(-8);
          
          const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: randomPassword,
            email_confirm: true,
            user_metadata: {
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              role: user.role || 'referrer',
              tier: user.tier || 'standard',
              avatar: user.avatar,
              created_at: user.created_at || new Date().toISOString()
            }
          });
          
          if (error) {
            console.error(`Error creating user ${user.email}:`, error);
          } else {
            console.log(`User ${user.email} created successfully. Random password set.`);
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
      }
    }
    
    console.log('User migration completed.');
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  } finally {
    // Close the connection
    await client.end();
  }
}

migrateUsers()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
