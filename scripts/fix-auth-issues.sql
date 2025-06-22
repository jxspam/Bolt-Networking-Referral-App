-- SQL script to fix common Supabase Auth issues
-- Run this in your Supabase SQL Editor if you encounter "Database error saving new user" errors

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Check for conflicting triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- 3. Fix common auth trigger conflicts (uncomment if needed)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS sync_users ON auth.users;

-- 4. Check for RLS policies on auth table
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'auth' AND tablename = 'users';

-- 5. Add missing RLS on the auth.users table if needed
-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- 6. Check for sample users and make sure they have correct auth data
SELECT id, email, role, last_sign_in_at 
FROM auth.users 
LIMIT 10;

-- 7. Check for relations that need updating
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'f' AND conrelid::regclass::text LIKE '%.users';

-- Add additional fixes specific to your schema if necessary
