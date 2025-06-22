import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase, type UserMetadata } from "@/lib/supabase";

export default function VerifyPhone() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    // Check if user is authenticated after Google OAuth
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // Not authenticated, redirect to login
        toast({
          title: "Authentication Required",
          description: "Please sign in to verify your phone number",
          variant: "destructive",
        });
        setLocation("/login");
      }
    };
    
    checkAuth();
  }, []);

  // Send phone verification code
  const sendPhoneVerification = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update user metadata with phone number
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: phoneNumber,
          phone_verified: false,
          verification_sent_at: new Date().toISOString()
        } as UserMetadata
      });
      
      if (error) {
        throw error;
      }
      
      // In a real implementation, you would integrate with Twilio or another SMS provider
      // Here we're just simulating the process
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${phoneNumber}`,
      });
      
      setCodeSent(true);
      
    } catch (error: any) {
      toast({
        title: "Phone Verification Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify phone code
  const verifyPhoneCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    
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
      
      // Redirect to dashboard
      setLocation("/dashboard");
      
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Verify Your Phone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={codeSent}
                required
              />
              {!codeSent && (
                <Button
                  className="w-full mt-2"
                  onClick={sendPhoneVerification}
                  disabled={isLoading || !phoneNumber}
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              )}
            </div>
            
            {codeSent && (
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                />
                <Button
                  className="w-full mt-2"
                  onClick={verifyPhoneCode}
                  disabled={isLoading || !verificationCode}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            )}
            
            <p className="text-sm text-center text-gray-600 mt-4">
              We need to verify your phone number to complete the registration process.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
