# Network Earnings - Referral Management Platform

A comprehensive referral management platform built with React, Node.js, and Supabase. This application provides businesses and referrers with tools to manage leads, track earnings, resolve disputes, and monitor campaign performance.

## Quick Start

### Option 1: One Command Demo Setup (Recommended)

```bash
# Clone the repository and navigate to the project directory, then run:
npm run setup:demo && npm run dev:full
```

This command sequence will:
- Install all dependencies (both server and client)
- Initialize the database tables
- Populate the database with demo data
- Start both the backend and frontend in development mode

### Option 2: Step-by-Step Setup

```bash
# 1. Install all dependencies (both server and client)
npm run install-deps

# 2. Create your environment file
cp .env.example .env
# Edit the .env file with your Supabase credentials

# 3. Setup the database
npm run init:database

# 4. Populate with demo data (optional)
npm run populate:fake-data

# 5. Start both the backend and frontend in development mode
npm run dev:full
```

## Running the Application

```bash
# Run both backend and frontend in development mode
npm run dev:full

# Run only the backend server
npm run dev

# Run only the frontend client
npm run dev:client

# Build for production
npm run build

# Start in production mode
npm run start:full
```

## Database and Demo Data

This application uses Supabase as its backend database service. The project comes with scripts to initialize and populate the database with demo data.

### Database Tables

The application uses the following main tables:
- `users`: User accounts and authentication data
- `campaigns`: Marketing campaigns managed by businesses
- `leads`: Customer referrals submitted by referrers
- `earnings`: Earnings generated from successful referrals
- `payouts`: Payment records for referrer earnings
- `payout_methods`: Saved payment methods for users
- `disputes`: Dispute records between businesses and referrers
- `activities`: User activity logs and notifications

### Populating Demo Data

To populate the database with demo data:

```bash
# Populate demo data with predefined user IDs
npm run populate:fake-data

# Or generate new UUIDs for demo users
npm run populate:uuid
```

This will create:
- Demo user accounts (referrers, businesses, admin)
- Sample campaigns
- Example leads and earnings
- Demo payouts and payment methods
- Sample disputes and activities

## Migration to Supabase Auth

This application has been migrated to exclusively use Supabase Auth for user authentication and management. The `public.users` table has been removed, and all user data is now stored in `auth.users` with user metadata.

### Authentication Changes

- User data is now stored in Supabase Auth user metadata
- All tables now reference `auth.users.id` instead of `public.users.id`
- Row Level Security (RLS) policies secure all data based on user authentication
- User profile data is read from and stored in user metadata

For detailed migration documentation, see [docs/auth-migration.md](docs/auth-migration.md).

```bash
# 1. Install all dependencies (both server and client)
npm run install-deps

# 2. Create your environment file
cp .env.example .env
# Edit the .env file with your Supabase credentials

# 3. Setup the database and verify Supabase Auth
npm run setup:full

# 4. Start both the backend and frontend in development mode
npm run dev:full

# 5. If you encounter syntax errors in Login.tsx or other files
npm run fix:login
```

## Quick Start Guide

Follow these steps to get the application running:

### 1. Clone the Repository

```bash
git clone [repository-url]
cd Networking-Earnings-App
```

### 2. Install Dependencies

```bash
# Install both server and client dependencies
npm run install-deps
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase Connection Details
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_DB_URL=your_supabase_postgres_connection_string
```

### 4. Initialize the Database

```bash
# Initialize database tables
npm run init:database

# Populate database with fake data for demo/testing
npm run populate:fake-data
```

### 5. Quick Setup for Demos

If you want to get started with a fully populated database for demoing or testing purposes:

```bash
# One-command setup with fake data population
npm run setup:demo
```

This command will install all dependencies, initialize the database, and populate it with fake data.

### 6. Start Development Servers

```bash
# Start both backend and frontend development servers
npm run dev:full

# Alternatively, you can start them separately:
npm run dev          # Start backend server
npm run dev:client   # Start frontend development server
```

### 7. Build for Production

```bash
# Build the application for production
npm run build

# Start the production server
npm start
```

## Data Structure

The application uses the following data structure in Supabase:

### Core Tables:
- **users**: User information (Supabase Auth)
- **user**: Legacy user table (kept for backward compatibility)
- **campaigns**: Marketing campaigns for referrals
- **leads**: Customer leads referred by users
- **earnings**: Earnings generated from leads
- **payouts**: Payment records for user earnings
- **payout_methods**: User's preferred payment methods
- **disputes**: Dispute cases for contested referrals
- **activities**: User activity record for the activity feed

### Database Entity Relationships:

- Users can have multiple leads, earnings, and payouts
- Campaigns can have multiple leads
- Leads can generate earnings
- Disputes are associated with leads and users

### Populating with Test Data

For testing purposes, you can populate the database with fake data:

```bash
# Install dependencies and populate with fake data
npm run populate:uuid

# Or if you already have uuid installed:
npm run populate:fake-data
```

### Troubleshooting

If you encounter issues:

```bash
# Run general diagnostic checks
npm run troubleshoot

# Check authentication setup
npm run troubleshoot:auth

# Check schema alignment
npm run troubleshoot:schema
```

For more detailed instructions, see the documentation in the [docs](./docs) directory.

### Common Issues

- **Supabase Auth Errors**: Run `npm run fix:signup` to diagnose and fix auth issues
- **"Database error saving new user"**: Run `npm run fix:supabase` for an interactive wizard to fix this specific error
- **UI/Component Errors**: Run `npm run fix:login` to repair syntax issues in Login.tsx
- **Database Connection Errors**: Verify your Supabase credentials in `.env`

### Quick Fix for "Database error saving new user"

If you're encountering the specific "Database error saving new user" error when signing up:

1. Run our interactive wizard:
   ```bash
   npm run fix:supabase
   ```
2. Follow the prompts to:
   - Update your Supabase credentials
   - Enable required database extensions
   - Fix conflicting database triggers
3. If the wizard doesn't resolve the issue, manually add the SQL fixes in the Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   DROP TRIGGER IF EXISTS sync_users ON auth.users;
   ```

## Features

### For Referrers

- **Enhanced Dashboard**: Real-time analytics with performance charts and recent referrals
- **Lead Management**: Track referral status and earnings
- **Earnings Tracking**: View pending and paid earnings with withdrawal functionality
- **Share Referrals**: Generate QR codes and AI-powered message templates
- **Dispute Resolution**: Submit and track dispute cases

### For Businesses

- **Campaign Creation**: Create and manage referral campaigns
- **Lead Tracking**: Monitor incoming referrals and conversions
- **Payment Management**: Process referrer payouts
- **Performance Analytics**: Track campaign ROI and conversion rates

### For Administrators

- **Admin Overview**: Comprehensive dashboard with system analytics
- **User Management**: Monitor referrer and business accounts
- **Dispute Management**: Review and resolve disputes
- **Financial Oversight**: Track all payouts and earnings

## Technology Stack

### Frontend

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for data fetching
- **Recharts** for analytics visualization
- **Wouter** for routing

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** for data persistence
- **Passport.js** for authentication

### Database

- **PostgreSQL** with comprehensive schema
- **Supabase Auth** for user authentication and profile management
- Real-time data synchronization
- Proper relationships and constraints
- Sample data initialization

## Database Schema

The application uses a well-structured PostgreSQL database with the following entities:

- **Users**: Referrers, businesses, and administrators
- **Leads**: Customer referrals with tracking
- **Campaigns**: Business marketing campaigns
- **Earnings**: Referrer compensation tracking
- **Disputes**: Conflict resolution system
- **Activities**: System audit trail

## Database Schema Management

The application uses Supabase as its database backend. The local schema definition in `shared/schema.ts` must be aligned with the actual Supabase database schema.

### Available Tables in Supabase

The following tables exist in the Supabase database:

1. `user` - Main user table with UUID primary keys
2. `leads` - Lead management table
3. `campaigns` - Campaign management table
4. `earnings` - Earnings tracking table
5. `payouts` - Payout records table
6. `payout_methods` - User payout methods
7. `users` - Supabase Auth users table

> **Note:** The `disputes` and `activities` tables referenced in the code **do not exist** in the actual database. The application includes placeholder implementations for backward compatibility.

### Keeping Schema in Sync

To check if your local schema matches the Supabase database:

```bash
# Check for schema differences
npm run db:check

# Sync local schema with Supabase database
npm run db:sync

# Run full schema migration and alignment
npm run migrate:schema
```

### Environment Setup

This project requires the following environment variables:

```
# Supabase Connection Details
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_DB_URL=your_supabase_postgres_connection_string

# Optional fallback for local development
DATABASE_URL=your_local_postgres_connection_string
```

Create a `.env` file in the project root with these variables to get started.

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project set up
- Environment variables configured

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Networking-Earnings-App.git
cd Networking-Earnings-App
```

2. Install dependencies (installs both server and client dependencies):

```bash
npm run install-deps
```

3. Copy the example environment variables file and update with your own values:

```bash
# Copy the example file
cp .env.example .env

# Edit with your editor of choice
# Replace the placeholder values with your actual credentials
```

### Supabase Configuration

To avoid auth errors like "Database error saving new user," make sure to properly configure your Supabase credentials:

1. **Get Your Supabase Credentials**:

   - Log in to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Project Settings → API
   - Find the following values:
     - Project URL (e.g., `https://your-project.supabase.co`)
     - `anon` public API key
     - `service_role` secret key (keep this secure!)

2. **Update Your `.env` File**:

   ```
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```

3. **Restart your development server** after updating these values.

4. Set up your Supabase project:

   - Follow the detailed [Supabase Setup Guide](docs/supabase-setup.md) to:
     - Create and configure your Supabase project
     - Set up authentication settings
     - Enable required extensions
     - Configure Row-Level Security (RLS) policies

5. Initialize the application:

```bash
# Complete setup with a single command (installs dependencies, initializes database and checks auth)
npm run setup:full
```

This will:

- Install all dependencies
- Create database tables
- Check your Supabase Auth configuration

### Running the Application

You can run both the server and client in development mode using:

```bash
npm run dev:full
```

Or run them separately:

- Server: `npm run dev`
- Client: `npm run dev:client`

### Building for Production

```bash
npm run build
npm run start
```

## Troubleshooting Common Issues

### "Database error saving new user" during signup

If you encounter the specific error you're seeing with Supabase Auth:

```
AuthApiError: Database error saving new user
```

This issue is specifically addressed in our application:

1. **Automatic Fallback Handling**:

   The application already implements a fallback method in `Login.tsx` that should handle this error automatically:

   - It first tries to create a user with all metadata at once
   - If that fails with "Database error saving new user", it automatically:
     - Creates a basic user account first
     - Then updates the metadata separately in a second API call
   - This two-step approach works around common Supabase Auth limitations

2. **Manual Fix: Update Supabase Configuration**:

   The "Database error saving new user" often occurs because of issues with your Supabase project configuration:

   1. **Verify Supabase URL and Keys**:

      - Make sure your `.env` file has the correct values:

      ```
      VITE_SUPABASE_URL=https://your-project.supabase.co
      VITE_SUPABASE_ANON_KEY=your-anon-key
      SUPABASE_SERVICE_KEY=your-service-key
      ```

      - Double-check these values match your Supabase project settings

   2. **Enable Extensions in Supabase**:

      - Log in to your Supabase dashboard
      - Go to SQL Editor
      - Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

   3. **Check for RLS Policies**:
      - Make sure Row Level Security isn't blocking user creation
      - Review auth.users table permissions in your Supabase dashboard

3. **Run Specific Signup Error Fix**:

   ```bash
   npm run fix:signup
   ```

   This specialized script directly addresses the "Database error saving new user" error by:

   - Testing both the primary and fallback signup approaches
   - Verifying if the two-step process in Login.tsx will work
   - Providing specific recommendations based on your environment

   For more general diagnostics, you can also run:

   ```bash
   npm run troubleshoot
   ```

4. **Apply SQL Fixes**:

   For persistent issues, apply the SQL fixes:

   ```bash
   # View the SQL fixes
   cat scripts/fix-auth-issues.sql

   # Then run them in your Supabase SQL Editor
   ```

   The key SQL commands to fix the issue are:

   ```sql
   -- Enable required extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Check for and fix auth triggers if needed
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   DROP TRIGGER IF EXISTS sync_users ON auth.users;
   ```

5. **Complete Documentation**:

   For detailed troubleshooting steps specific to this error, see:

   - [Auth Troubleshooting Guide](docs/auth-troubleshooting.md)
   - [Supabase Setup Guide](docs/supabase-setup.md)

### Database Design Changes

This application has been migrated to use **only Supabase Auth** for user management:

- User profiles are stored **directly in Supabase Auth metadata**
- No separate PostgreSQL `users` table is needed
- All references to users in other tables point to Supabase Auth user IDs
- The migration scripts handle converting from a previous architecture

### Database Schema and Auth Synchronization

This application has been migrated to use only Supabase Auth for user management. Key points:

- User profiles are stored directly in Supabase Auth metadata (no separate users table)
- User updates are handled through the Supabase Auth API
- All database references should use the Supabase Auth user ID (`auth.uid()`)

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── attached_assets/        # UI design references
```

## API Endpoints

### Authentication

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /api/logout` - User logout

### Users

- `GET /api/users` - Get all users
- `GET /api/user` - Get current user

### Leads

- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead

### Campaigns

- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign

### Earnings

- `GET /api/earnings` - Get all earnings
- `PUT /api/earnings/:id` - Update earning status

### Disputes

- `GET /api/disputes` - Get all disputes
- `POST /api/disputes` - Create dispute

### Analytics

- `GET /api/analytics/overview` - System analytics

## Features Implemented

### User Interface

- Professional blue gradient header design
- Responsive layout for all screen sizes
- Status badges with color-coded indicators
- Interactive charts and data visualizations
- Modern card-based layout

### Authentication System

- Login/registration with role selection
- Supabase Auth for user authentication and profile management
- User metadata stored directly in Auth system
- Session management
- Protected routes
- User role-based access control

### Data Management

- Real-time data fetching from PostgreSQL
- Comprehensive CRUD operations
- Data validation and error handling
- Automatic sample data initialization

### Business Logic

- Lead conversion tracking
- Earnings calculation
- Campaign performance metrics
- Dispute resolution workflow

## Development

### Database Operations

```bash
# Push schema changes
npm run db:push

# Generate migrations (if needed)
npx drizzle-kit generate

# View database studio
npx drizzle-kit studio

# Migrate from PostgreSQL users table to Supabase Auth only
npm run migrate:users-to-auth  # Migrate existing users to Supabase Auth
npm run migrate:drop-users     # Remove the users table after migration
```

### Code Quality

- TypeScript for type safety
- ESLint configuration
- Consistent code formatting
- Component-based architecture

## Deployment

The application is designed to work with:

- **Replit Deployments** (recommended)
- **Vercel** for frontend hosting
- **Railway** or **Supabase** for PostgreSQL
- **Docker** containerization support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software developed for referral management use cases.

## Support

For technical support or feature requests, please open an issue in the GitHub repository.

---

**Built with ❤️ using modern web technologies**

## Development Guide

### Running the Application for Development

For standard development:

```bash
# Install dependencies if not already done
npm run install-deps

# Start both client and server in development mode
npm run dev:full
```

For debugging with enhanced error reporting:

```bash
# Start the backend server
npm run dev

# In a separate terminal, start the client with debug mode
npm run dev:client:debug
```

### Troubleshooting Development Errors

#### 500 Error Loading Page Components

If you encounter a 500 error when loading page components like `Login.tsx`:

```
GET http://localhost:5173/src/pages/Login.tsx?t=1750521716412 net::ERR_ABORTED 500 (Internal Server Error)
```

This might be caused by:

1. **Syntax errors in component files**: Check the component file for syntax issues
2. **Type errors with dependencies**: The application uses TypeScript, ensure types are correct
3. **Environment variables missing**: Make sure all required environment variables are set

To fix:

1. Use the debug mode to get better error reporting:

   ```bash
   npm run dev:client:debug
   ```

2. Check the browser console and terminal for detailed error messages

3. If there are TypeScript errors, you can check them with:

   ```bash
   npm run check
   ```

4. Make sure the `.env` file is properly set up:
   ```bash
   cp .env.example .env
   # Then edit .env with your values
   ```

For detailed debugging instructions, see our comprehensive [Developer Debugging Guide](docs/developer-debugging.md).

5. **Fix known syntax issues in Login.tsx**:

   The project includes a script to fix known syntax issues in the Login.tsx file:

   ```bash
   npm run fix:login
   ```

   This will replace the problematic file with a fixed version while backing up the original.

#### TypeScript Errors with Supabase Auth

If you encounter TypeScript errors related to `user_metadata` or `data` properties in the Supabase Auth API:

1. The application includes type definitions in `client/src/lib/supabase.ts`
2. In some cases, you may need to use type assertions (`as any`) for complex metadata objects
3. Make sure you're using the correct Supabase API version (the project uses v2.x)

## Google Sign-Up and Phone Verification

This application supports Google OAuth sign-up and phone number verification using Supabase.

### Setup Google OAuth

To configure Google sign-in for your application:

```bash
# Run the interactive setup script
npm run setup:google-oauth
```

The script will guide you through:
1. Creating a Google OAuth Client in Google Cloud Console
2. Configuring the necessary redirect URIs
3. Setting up Supabase Authentication providers
4. Adding the required environment variables

### Phone Verification

Phone verification is implemented in the sign-up flow:
1. Users provide their phone number during sign-up
2. A verification code is sent to their phone (simulated in development)
3. Users must verify their phone number to complete registration

#### Integration with SMS Provider

To fully implement phone verification in production:
1. Sign up for an SMS provider (Twilio, Vonage, etc.)
2. Update the `sendPhoneVerification` function in `Login.tsx` to use the SMS API
3. Update the `verifyPhoneCode` function to verify codes against the SMS provider API

## Routing and Navigation

### Common Routing Issues

If you encounter any of the following issues:

- Root path (`/`) not redirecting to the dashboard when logged in
- Sign-out not redirecting to the login page
- Authentication state not properly updating across the app

You can run the routing fix script:

```bash
npm run fix:routing
```

This will check your App.tsx and Layout.tsx files for common routing issues and provide guidance on how to fix them.

### Manual Navigation Fixes

If the automatic fix doesn't resolve your issues, you can manually check:

1. **Root Route Redirection**:
   - Make sure App.tsx has a dedicated route for the root path (`/`) that redirects to `/dashboard` when authenticated
   - Ensure all protected routes redirect to `/login` when not authenticated

2. **Sign-Out Navigation**:
   - The sign-out handler should force a redirect to `/login` using `window.location.href`
   - The auth state listener should detect the 'SIGNED_OUT' event and redirect accordingly

3. **Clear Browser Cache**:
   - Sometimes browser caching can cause persistence of old routes or states
   - Try clearing your browser cache or opening in an incognito/private window

For detailed documentation about the routing and authentication flow in the application, see [docs/routing-auth-guide.md](docs/routing-auth-guide.md).
