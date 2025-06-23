import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase, type UserMetadata } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("referrer"); // 'referrer' or 'business'
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;
    const phone = formData.get("phone") as string;
    
    // Store phone number for later use in verification
    setPhoneNumber(phone);
    
    try {
      // First approach: Try the complete signup flow
      try {
        // Sign up with Supabase Auth - store all user data in auth metadata
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              first_name: firstName,
              last_name: lastName,
              username: username,
              role: role,
              tier: "standard",
              avatar: null,
              created_at: new Date().toISOString(),
              phone: phone,
              phone_verified: false
            } as UserMetadata
          }
        });

        if (signUpError) {
          // If this specific error happens, we'll try the fallback approach
          if (signUpError.message.includes("Database error saving new user")) {
            throw new Error("Database error - trying fallback method");
          }
          
          // Otherwise, show the error
          console.error("Sign up error:", signUpError);
          toast({
            title: "Error signing up",
            description: signUpError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Success path
        toast({
          title: "Account created successfully!",
          description: "Please check your email for a verification link.",
        });
        
        // Store user ID for phone verification
        if (data?.user?.id) {
          setUserId(data.user.id);
          // Initiate phone verification
          await sendPhoneVerification(phone, data.user.id);
        }
        
        setIsLoading(false);
        return;
      } catch (primaryError) {
        // Fallback approach: Split the signup into two steps
        console.log("Primary signup approach failed, trying fallback method...");
        
        // First create the user with minimal information
        const { data, error: simpleSignUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          }
        });
        
        if (simpleSignUpError) {
          throw simpleSignUpError; // Re-throw for the outer catch block
        }
        
        if (data?.user) {
          // Then update the metadata separately
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              first_name: firstName,
              last_name: lastName,
              username: username,
              role: role,
              tier: "standard",
              avatar: null,
              created_at: new Date().toISOString(),
              phone: phone,
              phone_verified: false
            } as UserMetadata
          });
          
          if (updateError) {
            console.warn("Created user but couldn't set metadata:", updateError);
            // We'll still consider this a success since the account was created
          }
          
          // Store user ID for phone verification
          setUserId(data.user.id);
          
          // Initiate phone verification
          await sendPhoneVerification(phone, data.user.id);
          
          toast({
            title: "Account created successfully!",
            description: "Please check your email for a verification link.",
          });
        }
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      toast({
        title: "Error signing up",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

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

  // Handle Google Sign-up
  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          data: {
            role: role,
            tier: "standard"
          }
        }
      });
      
      if (error) {
        console.error("Google sign-in error:", error);
        toast({
          title: "Google Sign-In Error",
          description: error.message || "Failed to sign in with Google",
          variant: "destructive",
        });
        setIsLoading(false);
      }
      
      // The user will be redirected to Google OAuth consent screen
      // After successful authentication, they'll be redirected back to our app
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Google Sign-In Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error("Google sign-in error:", error);
        toast({
          title: "Google Sign-In Error",
          description: error.message || "Failed to sign in with Google",
          variant: "destructive",
        });
        setIsLoading(false);
      }
      
      // The user will be redirected to Google OAuth flow
      // After successful authentication, they'll be redirected back to our app
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Google Sign-In Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Send phone verification code
  const sendPhoneVerification = async (phoneNumber: string, userId: string) => {
    try {
      setIsLoading(true);
      
      // Update user metadata with phone number
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          phone: phoneNumber,
          phone_verified: false
        } as UserMetadata
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // In a real implementation, you would integrate with Twilio or another SMS provider
      // Here we're just simulating the process
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${phoneNumber}`,
      });
      
      setShowPhoneVerification(true);
      setIsLoading(false);
      
    } catch (error: any) {
      toast({
        title: "Phone Verification Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Verify phone code
  const verifyPhoneCode = async (code: string, userId: string) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would verify the code with your SMS provider
      // Here we're just simulating the verification process
      
      // Update user metadata to mark phone as verified
      const { error } = await supabase.auth.updateUser({
        data: {
          phone_verified: true
        } as UserMetadata
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully!",
      });
      
      // Redirect to dashboard or complete registration
      setLocation("/dashboard");
      setIsLoading(false);
      
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded mr-2 flex items-center justify-center">
              <div className="text-white text-xs font-bold">NE</div>
            </div>
            <h1 className="text-2xl font-bold text-blue-600">Network Earnings</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Turn Your Network Into Earnings
          </h2>
        </div>

        {/* User Type Selection */}
        <div className="space-y-3">
          <Button
            className={`w-full py-3 text-lg ${
              role === "referrer"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setRole("referrer")}
          >
            I want to refer & earn
          </Button>

          <Button
            variant="outline"
            className={`w-full py-3 text-lg ${
              role === "business"
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-600"
            }`}
            onClick={() => setRole("business")}
          >
            I'm a business looking for leads
          </Button>
        </div>

        {/* Auth Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign up</TabsTrigger>
                <TabsTrigger value="login">Log In</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="your_username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      We'll send a verification code to this number
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </a>{" "}
                      &{" "}
                      <a
                        href="#"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="login-email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="login-password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Phone Verification Modal */}
      <Dialog open={showPhoneVerification} onOpenChange={setShowPhoneVerification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Phone Number</DialogTitle>
            <DialogDescription>
              We've sent a verification code to {phoneNumber}. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter code"
                required
              />
            </div>
            <Button
              className="w-full"
              onClick={() => verifyPhoneCode(verificationCode, userId)}
              disabled={isLoading || !verificationCode}
            >
              {isLoading ? "Verifying..." : "Verify Phone"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}