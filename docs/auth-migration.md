# Supabase Auth Migration Guide

This guide explains how to migrate from using a PostgreSQL `users` table to using only Supabase Auth for user management in the Network Earnings application.

## Benefits of Using Only Supabase Auth

1. **Simplified Authentication**: Leveraging Supabase's built-in authentication system eliminates the need for custom authentication logic
2. **Better Security**: Supabase Auth handles password hashing, token management, and other security concerns
3. **Reduced Complexity**: No need to maintain separate user tables and synchronize with authentication state
4. **Built-in Features**: Access to features like password reset, email verification, and OAuth providers

## Migration Process

### Step 1: Migrate Existing Users

If you have existing users in your PostgreSQL `users` table, you can migrate them to Supabase Auth:

```bash
npm run migrate-users
```

This script:

- Fetches all users from the PostgreSQL `users` table
- Creates matching users in Supabase Auth (or updates existing ones)
- Copies user profile data into Supabase Auth user metadata

### Step 2: Apply Row Level Security (RLS) Policies

Apply the RLS policies to secure all tables based on user authentication:

```bash
npm run apply-rls
```

This script:
- Enables RLS on all tables
- Creates helper functions for authentication checks
- Sets up policies for each table based on user roles and relationships

### Step 3: Drop the Users Table

Once all users have been migrated and RLS is in place, you can safely remove the `users` table:

```bash
npm run drop-users-table
```

This script:
- Removes foreign key constraints that reference the `users` table
- Drops the `users` table from the PostgreSQL database

### Step 4: One-command Migration

You can run all the steps in one command:

```bash
npm run migrate:auth-only
```

### Step 5: Use User Profiles

The application now uses user profiles stored in Supabase Auth metadata:

```typescript
import { getUserProfile, updateUserProfile } from "@/lib/user-profile";

// Get the current user's profile
const userProfile = await getUserProfile();

// Update the user's profile
await updateUserProfile({
  first_name: "New Name",
  avatar: "https://example.com/avatar.jpg",
});
```

## Code Changes

The migration required the following code changes:

1. Updated `shared/schema.ts` to remove users table and update foreign key references
2. Modified `server/storage.ts` to use Supabase Auth API for user management
3. Updated `server/db.ts` to initialize Supabase client for Auth operations
4. Created RLS policy script in `scripts/setup-rls-policies.sql`

## User Metadata Structure

User metadata is stored in the `user_metadata` field of the Supabase Auth user record. The Network Earnings application uses the following structure:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "role": "referrer", // or "business" or "admin"
  "tier": "standard", // or "premium"
  "avatar": "https://example.com/avatar.png",
  "created_at": "2025-06-22T12:34:56.789Z"
}
```

## Security Improvements

1. Row Level Security (RLS) is now applied to all tables
2. Users can only access their own data or data they should have permission to see
3. User role-based access control is enforced at the database level
4. Authentication is handled entirely by Supabase Auth

## Troubleshooting

### Missing User Data

If user data seems to be missing after migration:

1. Check that the user was successfully migrated using the Supabase dashboard
2. Verify that the `getUserProfile()` function is being called correctly
3. Check the browser console for any authentication errors

### Authentication Issues

If users can't log in after migration:

1. Users migrated from PostgreSQL will need to reset their passwords
2. Use the Supabase dashboard to send password reset emails
3. Verify the authentication flow in the application

For additional support, please open an issue in the project repository.
