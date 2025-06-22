# Simplified Login Component

If you're experiencing issues with the Supabase Auth integration, you can use this simplified version of the Login component as a fallback solution.

## Instructions

1. Replace the content of `client/src/pages/Login.tsx` with the code below
2. This simplified version bypasses some of the more complex Auth functionality

```tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("referrer"); // 'referrer' or 'business'

  // Simplified sign-up flow that works around common auth issues
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;

    try {
      // First check if user exists
      const {
        data: { users },
        error: userCheckError,
      } = await supabase.auth.admin.listUsers({
        filter: {
          email: email,
        },
      });

      if (userCheckError) {
        console.error("Error checking user:", userCheckError);
        throw userCheckError;
      }

      // If user exists, show error
      if (users && users.length > 0) {
        toast({
          title: "User already exists",
          description:
            "This email is already registered. Please login instead.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create user with simple options first
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        toast({
          title: "Error signing up",
          description: signUpError.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Update user metadata separately
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
            role: role,
            tier: "standard",
            avatar: null,
            created_at: new Date().toISOString(),
          },
        });

        if (updateError) {
          console.warn(
            "Failed to set user metadata, but account was created:",
            updateError
          );
        }
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email for a verification link.",
      });
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error signing up",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains the same
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("login-email") as string;
    const password = formData.get("login-password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/dashboard");
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // UI rendering remains the same...
  // Return your JSX here
}
```

## What's Different

This simplified version:

1. Separates user creation and metadata update into two steps
2. Handles user existence check before attempting creation
3. Uses a simpler signup flow that is less likely to trigger database errors
4. Still provides the same user experience and functionality

## When to Use This

Only use this fallback if:

1. You've tried all troubleshooting steps in the README
2. The `check:auth` script still shows errors
3. You need a quick solution to get the app working
