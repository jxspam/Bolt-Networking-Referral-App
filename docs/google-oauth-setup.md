# Setting Up Supabase Authentication

This guide explains how to set up Google OAuth and phone verification with Supabase for the Network Earnings application.

## Google OAuth Setup

### Step 1: Create a Google OAuth Client

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App Name: Network Earnings App
   - Support Email: Your email
   - Add scopes for email and profile
   - Add test users (for development)

### Step 2: Configure the OAuth Client

1. Application Type: Web application
2. Name: Network Earnings App
3. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
4. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/login`
   - Your production URLs with the same paths
5. Click "Create" and note the Client ID and Client Secret

### Step 3: Configure Supabase Auth

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Authentication" > "Providers" > "Google"
4. Enable Google Auth
5. Enter your Client ID and Client Secret
6. Add the redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Save changes

## Phone Verification Setup

The application includes a phone verification flow which can be implemented with an SMS provider:

1. Sign up for an SMS provider (e.g., Twilio, Vonage)
2. Get API credentials for sending SMS messages
3. Add your SMS provider credentials to environment variables:
   ```
   VITE_SMS_PROVIDER_API_KEY=your_api_key
   VITE_SMS_PROVIDER_API_SECRET=your_api_secret
   ```
4. Update the `sendPhoneVerification` function in `Login.tsx` to use the SMS provider API
5. Update the `verifyPhoneCode` function to validate the code with your SMS provider

### Environment Variables

Add these environment variables to your `.env` file:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application URL
VITE_APP_URL=http://localhost:3000
```

## Testing the Authentication Flow

1. Start your application: `npm run dev`
2. Navigate to the sign-up page
3. Test the following flows:
   - Email/password registration with phone verification
   - Google OAuth sign-up with phone verification
   - Sign-in with email/password
   - Sign-in with Google

## Common Issues

### Callback URL Mismatch

If you see "Invalid redirect URI" errors, ensure your callback URLs exactly match between:
- Google OAuth Client settings
- Supabase Auth provider settings
- Your application's OAuth request

### CORS Issues

Add your frontend domain(s) to Supabase's CORS configuration:
1. Go to Project Settings > API Settings
2. Add your domain to the "Allowed Origins" list

### Phone Verification Failures

- Check that your SMS provider credentials are correct
- Ensure proper error handling for API failures
- Monitor your SMS provider logs for delivery issues
