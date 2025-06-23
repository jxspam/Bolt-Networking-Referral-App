import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "../shared/schema";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.SUPABASE_DB_URL) {
  throw new Error(
    "SUPABASE_DB_URL must be set.\n" +
    "Use SUPABASE_DB_URL for your Supabase project's Postgres connection string."
  );
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for Auth API access."
  );
}

// Create postgres client using the Supabase database URL
const client = postgres(process.env.SUPABASE_DB_URL);

// Initialize Drizzle with postgres-js client
export const db = drizzle(client, { schema });

// Initialize Supabase client with service role key for server-side operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);