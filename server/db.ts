import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { createClient } from '@supabase/supabase-js';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) {
  throw new Error(
    "DATABASE_URL or SUPABASE_DB_URL must be set.\n" +
    "Use SUPABASE_DB_URL for your Supabase project's Postgres connection string."
  );
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for Auth API access."
  );
}

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });

// Initialize Supabase client with service role key for server-side operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);