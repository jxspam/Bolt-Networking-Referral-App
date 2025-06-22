# Supabase Setup Guide

This guide will help you configure your Supabase project to work with the Network Earnings application.

## Initial Setup

1. **Create a Supabase Project**

   - Go to [Supabase](https://supabase.com/) and sign in
   - Click "New Project" and follow the setup wizard
   - Choose a name, password, and region for your project

2. **Get API Keys**

   - From your project dashboard, go to "Settings" > "API"
   - Copy the "URL", "anon" key, and "service_role" key
   - Add these to your `.env` file:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_KEY=your_service_role_key
     ```

3. **Enable Required Extensions**

   - Go to "Database" > "Extensions"
   - Enable the following extensions:
     - `uuid-ossp`
     - `pg_stat_statements`

## Authentication Setup

1. **Configure Auth Settings**

   - Go to "Authentication" > "Settings"
   - Under "Email Auth":
     - Decide whether to enable email confirmation (recommended for production)
     - Configure site URL and redirect URLs
   - Under "External OAuth Providers":
     - Set up Google OAuth if you want to use "Sign in with Google"

2. **Configure Email Templates** (Optional)

   - Go to "Authentication" > "Email Templates"
   - Customize the confirmation and recovery email templates

## Database and RLS Configuration

1. **Run Database Initialization**

   ```bash
   npm run init:database
   ```

   This will create the necessary tables and relationships.

2. **Set Up Row Level Security**

   - Go to "Authentication" > "Policies"
   - For each table (leads, campaigns, earnings, disputes, activities, payouts):
     - Enable RLS
     - Create appropriate policies. Examples:
       - For leads: `auth.uid()::text = referrer_id`
       - For campaigns: `auth.uid()::text = business_id`
       - For admins to access all: `(auth.jwt() ->> 'role') = 'admin'`

## Testing the Setup

1. **Run the Auth Diagnostic Tool**

   ```bash
   npm run check:auth
   ```

   This will verify that your Supabase Auth configuration is working correctly.

2. **Fix Common Issues**

   If you encounter issues, run the SQL fix script in the Supabase SQL Editor:

   ```sql
   -- Content from scripts/fix-auth-issues.sql
   ```

## User Management

This application uses Supabase Auth for all user management:

- User profiles are stored in Supabase Auth metadata
- The application no longer uses a separate users table
- When creating users, include all profile information in the `user_metadata`

Example user metadata structure:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "role": "referrer",
  "tier": "standard",
  "avatar": null,
  "created_at": "2023-06-22T12:34:56.789Z"
}
```
