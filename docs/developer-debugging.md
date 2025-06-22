# Developer Debugging Guide

This guide provides detailed information for debugging common issues in the Network Earnings application development environment.

## Environment Setup

### Checking Environment Variables

If you're experiencing unexpected behavior, first ensure your environment variables are correctly set:

```bash
# Check if .env file exists
ls -la .env

# If missing, create from the example
cp .env.example .env
```

Critical variables that must be set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (for admin operations)

### Verifying Node.js Version

This project requires Node.js 18+:

```bash
node --version
```

If using an older version, consider using nvm to install and use the correct version.

## Vite Development Server Issues

### 500 Errors Loading Components

When encountering 500 errors loading components like `Login.tsx`:

1. **Use Debug Mode**

   Debug mode provides more detailed error information:

   ```bash
   npm run dev:client:debug
   ```

2. **Check for Syntax Errors**

   Common syntax issues:

   - Missing or extra brackets/parentheses
   - Improperly merged lines of code
   - Missing imports
   - Invalid JSX syntax

3. **Check Browser Developer Console**

   Open your browser's developer tools (F12) and check:

   - Console for JavaScript errors
   - Network tab for failed requests
   - Sources tab to set breakpoints if needed

4. **Disable Browser Extensions**

   Sometimes browser extensions can interfere with development servers:

   - Try using incognito mode
   - Temporarily disable extensions

## TypeScript Errors

### Type Issues with Supabase Auth

The Supabase Auth API occasionally causes TypeScript errors related to user metadata:

1. **Understanding the Error**

   ```
   Object literal may only specify known properties, and 'data' does not exist in type...
   ```

   This occurs because TypeScript doesn't recognize some properties of Supabase auth options.

2. **Solutions**

   - Use type assertions when necessary:

     ```typescript
     options: {
       data: {
         // your user metadata
       } as any // Type assertion
     }
     ```

   - Import and use the UserMetadata type from `client/src/lib/supabase.ts`

   - For component-specific fixes, see comments in the Login.tsx file

## Database Connection Issues

If experiencing database-related errors:

1. **Check Connection**

   ```bash
   npm run check:db
   ```

2. **Verify Schema**

   ```bash
   npm run db:push -- --dry-run
   ```

3. **Inspect Database Logs**

   If using Supabase, check the logs in the Supabase dashboard.

## React Component Debugging

### Using React Developer Tools

Install the React Developer Tools browser extension for better component debugging:

1. Open your app in the browser
2. Open developer tools (F12)
3. Go to the Components tab
4. You can inspect component state, props, and hooks

### Adding Debugging Code

For temporary debugging, add console logs or debugger statements:

```jsx
const handleSignUp = async (e) => {
  console.log("Form data:", {
    email: e.target.email.value,
    // other fields
  });

  // Add a breakpoint
  debugger;

  // Rest of your function
};
```

## Getting More Help

If you've tried the steps above and still can't resolve the issue:

1. Check the project issues on GitHub
2. Search for similar errors in the Supabase or Vite documentation
3. Create a detailed bug report including:
   - Error message
   - Steps to reproduce
   - Environment information (Node version, OS, etc.)
   - Screenshots if relevant
