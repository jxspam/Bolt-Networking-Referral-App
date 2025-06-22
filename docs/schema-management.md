# Database Schema Management Guide

This document provides detailed information about managing the database schema alignment between the local TypeScript definitions and the actual Supabase database.

## Schema Overview

The application uses Drizzle ORM to define the database schema in TypeScript. The schema definitions are located in `shared/schema.ts`.

### Actual Database Tables in Supabase

The following tables exist in the Supabase database:

1. `user` - Main user table with basic user information
   - Has UUID primary keys and stores user profile data

2. `leads` - Lead management table
   - References `user` table for referrer relationships

3. `campaigns` - Campaign management table
   - References `user` table for business relationships

4. `earnings` - Earnings tracking table
   - References `user`, `leads`, and `campaigns` tables

5. `payouts` - Payout records table
   - References `user` table

6. `payout_methods` - User payout methods table
   - References `user` table

7. `users` - Supabase Auth users table (separate from `user` table)
   - Standard Supabase Auth table for authentication

### Non-Existent Tables in Code

The following tables are referenced in the code but **do not actually exist** in the Supabase database:

1. `disputes` - For dispute management (not implemented in the database)
2. `activities` - For activity tracking (not implemented in the database)

The application includes placeholder implementations for these tables to maintain backward compatibility with existing code.

## Keeping Schema in Sync

### Checking for Schema Differences

To check if your local schema (`shared/schema.ts`) matches the Supabase database:

```bash
npm run db:check
```

This command uses Drizzle Kit to compare your local schema with the actual database schema and report any differences.

### Syncing Local Schema with Database

To update your local schema based on the actual database:

```bash
npm run db:sync
```

This will attempt to synchronize your local schema with the database structure.

### Handling Placeholder Tables

For the non-existent tables (`disputes` and `activities`), the application provides:

1. **Placeholder schema definitions** - TypeScript definitions that allow the code to compile
2. **Mock data providers** - Functions that return empty arrays or placeholder objects
3. **Deprecation warnings** - Console warnings when code attempts to use these tables

## Managing Table Dependencies

The tables form relationships with foreign keys. When working with the schema, be aware of these dependencies:

```
user <-- lead
  ^      /
  |     /
  |    /
  v   v
campaign <-- earnings
  ^
  |
  v
user <-- payout_methods
  ^
  |
  v
payouts
```

## Troubleshooting

### Schema Type Errors

If you encounter TypeScript errors related to the schema:

1. Make sure your local schema matches the actual database
2. Run `npm run db:check` to identify differences
3. Update your local schema accordingly using `npm run migrate:schema`

### Database Connection Issues

If you're having trouble connecting to the Supabase database:

1. Check your environment variables (SUPABASE_DB_URL, etc.)
2. Verify that your Supabase project is active
3. Ensure your IP address is allowed in the Supabase project settings

### Missing Tables

If code attempts to access tables that don't exist:

1. The application will log warnings to the console
2. API endpoints for these tables will return empty arrays or placeholder data
3. Update your client code to handle this gracefully if needed

## Future Schema Improvements

To fully align the codebase with the actual database structure:

1. **Remove placeholder tables** - After ensuring no client code depends on them
2. **Update API documentation** - To reflect only the actual database tables
3. **Add the missing tables** - If the functionality is needed, create the tables in Supabase
