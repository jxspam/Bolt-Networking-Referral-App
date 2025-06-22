# Troubleshooting Supabase Auth Issues

This guide addresses common issues with Supabase Auth, particularly the "Database error saving new user" error.

## Quick Fix Steps

1. **Run the Auth Diagnostic Tool**

```bash
npm run check:auth
```

This tool will:

- Test user creation with Supabase Auth
- Check if user metadata can be properly stored
- Identify specific issues with your Supabase setup

2. **Apply SQL Fixes**

Go to your Supabase dashboard > SQL Editor and run the following script:

```sql
-- Located in scripts/fix-auth-issues.sql
-- Copy and paste the contents here
```

3. **Check Supabase Configuration**

In your Supabase dashboard:

- Verify that Authentication settings are properly configured
- Check that the required database extensions are enabled (especially uuid-ossp)
- Ensure RLS policies are correctly set up

## Understanding the Error

The "Database error saving new user" error usually occurs when:

1. **There are conflicts between the users table and Supabase Auth**

   - This often happens when migrating from a custom users table to Supabase Auth
   - Run `npm run migrate:auth-only` to resolve this

2. **Required extensions are missing**

   - Enable the uuid-ossp extension in your Supabase project

3. **There are permission issues**
   - Check that the service role has the necessary permissions
   - Make sure your .env contains the correct SUPABASE_SERVICE_KEY

## Application Design

This application uses Supabase Auth for user management:

- User profiles are stored directly in Supabase Auth metadata
- No separate users table is required
- All user references in other tables point to the Supabase Auth user IDs

## Fallback Implementation

The Login component includes a fallback implementation that:

1. First tries to create a user with all metadata
2. If that fails, creates a basic user and then updates the metadata separately

This approach often works around common Supabase Auth issues.
