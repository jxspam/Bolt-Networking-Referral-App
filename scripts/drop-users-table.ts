import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

async function dropUsersTable() {
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
      console.log('The users table does not exist, nothing to do.');
      return;
    }

    console.log('Begin dropping users table and adjusting foreign keys...');
    
    // Start a transaction
    await db.execute(sql`BEGIN;`);

    // Drop foreign key constraints first
    console.log('Dropping foreign key constraints...');
    await db.execute(sql`
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tc.constraint_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                AND ccu.table_name = 'users')
        LOOP
          EXECUTE 'ALTER TABLE public.' || r.constraint_name || ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
      END $$;
    `);

    // Drop the users table
    console.log('Dropping users table...');
    await db.execute(sql`DROP TABLE IF EXISTS public.users;`);
    
    // Commit the transaction
    await db.execute(sql`COMMIT;`);
    
    console.log('Users table successfully dropped and constraints removed');
  } catch (error) {
    // Rollback on error
    await db.execute(sql`ROLLBACK;`);
    console.error('Error dropping users table:', error);
    throw error;
  } finally {
    // Close the connection
    await client.end();
  }
}

dropUsersTable()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
