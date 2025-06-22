# Login Component Troubleshooting

This guide addresses common syntax issues in the `Login.tsx` component that can cause build errors.

## Common Syntax Errors

### Missing Semicolons

Error message like:

```
[plugin:vite:react-babel] Missing semicolon. (33:17)
  36 |               first_name: firstName,
```

This typically happens when object literals are mistakenly used as statements:

```typescript
// INCORRECT
options: {
  emailRedirectTo: `${window.location.origin}/login`,
}
```

### Solution

Usually this is because an object is being defined directly, outside of a proper expression context.
The fix is to make sure the object is part of a variable assignment, function argument, or return statement:

```typescript
// CORRECT
const options = {
  emailRedirectTo: `${window.location.origin}/login`,
};

// OR in function call
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/login`,
  },
});
```

## TypeScript Errors

### Type Errors with Supabase Auth

Error message like:

```
Object literal may only specify known properties, and 'data' does not exist in type
```

This happens when using newer Supabase Auth features that TypeScript doesn't recognize.

### Solution

1. Use the `UserMetadata` type from our lib:

```typescript
import { UserMetadata } from "@/lib/supabase";

// Then use it like this
options: {
  data: {
    first_name: firstName,
    // ...other fields
  } as UserMetadata
}
```

## Quick Fix Script

If you continue to encounter syntax errors, run the automatic fix script:

```bash
npm run fix:login
```

This will:

1. Backup your current Login.tsx file
2. Replace it with a correctly formatted version
3. Preserve your original file as a backup

## Manual Fixes

If the automatic script doesn't work, try these manual fixes:

1. Check for merged lines - make sure each statement is on its own line
2. Verify all object properties are properly separated with commas
3. Ensure all objects are part of proper expressions (assignments, arguments, etc.)
4. Add proper type annotations for Supabase Auth metadata

## Testing Your Changes

After fixing the syntax issues, test with:

```bash
# Run with enhanced error reporting
npm run dev:client:debug
```

This will provide clearer error messages if there are still issues.
