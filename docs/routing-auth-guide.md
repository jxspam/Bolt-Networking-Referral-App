# Routing and Authentication Guide

This document explains how routing and authentication work together in the Network Earnings application.

## Application Routing Structure

The Network Earnings application uses [wouter](https://github.com/molefrog/wouter) for routing, which is a minimalist router for React applications.

### Main Routes

| Route | Component | Access Control |
|-------|-----------|----------------|
| `/` | Redirects to `/dashboard` or `/login` | Authentication check |
| `/login` | Login | Public, redirects to Dashboard if authenticated |
| `/dashboard` | Dashboard | Protected, requires authentication |
| `/network` | MyNetwork | Protected, requires authentication |
| `/share-referral` | ShareReferral | Protected, requires authentication |
| `/referral-history` | ReferralHistory | Protected, requires authentication |
| `/dispute-resolution` | DisputeResolution | Protected, requires authentication |
| `/earnings` | Earnings | Protected, requires authentication |
| `/analytics` | AdminOverview | Protected, requires authentication |
| `/campaigns` | Campaigns | Protected, requires authentication |
| `/create-offer` | CreateOffer | Protected, requires authentication |
| `/settings` | Settings | Protected, requires authentication |
| `/verify-phone` | VerifyPhone | Protected, requires authentication |

### Authentication-Aware Routing

The routing system in `App.tsx` is designed to:

1. Redirect authenticated users away from `/login` to `/dashboard`
2. Redirect unauthenticated users to `/login` from any protected route
3. Handle the root path by redirecting to the appropriate location based on authentication status

## Authentication Flow

### Sign-In Process

1. User navigates to `/login`
2. User enters credentials or signs in with Google
3. Supabase `auth.signInWithPassword()` or `auth.signInWithOAuth()` is called
4. On successful authentication, user is redirected to `/dashboard`

### Sign-Up Process

1. User navigates to `/login` and switches to the sign-up tab
2. User completes the registration form with email, password, and phone number
3. Supabase `auth.signUp()` is called with user metadata
4. User verifies email through the verification link
5. User verifies phone number through the verification code
6. On completion, user is redirected to `/dashboard`

### Google OAuth Flow

1. User clicks "Sign up with Google" or "Sign in with Google"
2. Supabase `auth.signInWithOAuth()` is called with the Google provider
3. User is redirected to Google's authentication page
4. After successful Google authentication, user is redirected back to the application
5. For new sign-ups, user is redirected to `/verify-phone` to complete phone verification
6. For sign-ins, user is redirected directly to `/dashboard`

### Sign-Out Process

1. User clicks "Sign Out" in the user dropdown menu
2. Supabase `auth.signOut()` is called
3. The application actively redirects to `/login` using `window.location.href`
4. The auth state listener also detects the 'SIGNED_OUT' event and ensures redirection

## Authentication State Management

Authentication state is managed at the top level in `App.tsx` using:

1. Local state with React's `useState` hook
2. Supabase authentication listeners with `onAuthStateChange`
3. Effect hooks to check session status on application load

```tsx
// Example from App.tsx
const [session, setSession] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Initial session check
  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setLoading(false);
  };
  getSession();

  // Auth state change listener
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    }
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
}, []);
```

## Troubleshooting Authentication Issues

If you encounter authentication or routing issues, consider:

1. **Session Persistence**: Check if Supabase is correctly storing and retrieving sessions
2. **Redirection Logic**: Ensure all redirect logic is using the correct paths
3. **Auth Event Handling**: Verify that auth events are being caught and handled properly
4. **Browser Storage**: Clear localStorage or cookies if testing produces inconsistent results

Run the routing fix script to automatically check for common issues:

```bash
npm run fix:routing
```

## Best Practices

1. **Direct Browser Navigation**: Always use `window.location.href` for sign-out redirects to ensure a clean state
2. **State Cleanup**: On sign-out, ensure all application state is cleared to prevent data leaks
3. **Auth Guards**: Keep authentication checks at the route level for consistent access control
4. **Fallbacks**: Add loading states and error handling for authentication operations
