import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash (everything after the # symbol)
        const hashParams = window.location.hash;
        
        if (!hashParams) {
          setError("No authentication data found in URL");
          return;
        }

        console.log("Processing auth callback...");
        
        // Exchange the auth code for a session
        const { data, error } = await supabase.auth.getSessionFromUrl();
        
        if (error) {
          console.error("Error getting session from URL:", error);
          setError(error.message);
          return;
        }
        
        if (data?.session) {
          console.log("Authentication successful, redirecting to dashboard");
          
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Redirect to dashboard
          setLocation("/dashboard");
        } else {
          setError("No session data returned");
        }
      } catch (err: any) {
        console.error("Error in auth callback:", err);
        setError(err.message || "An unexpected error occurred");
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {error ? (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => setLocation("/login")}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Completing authentication...</h2>
          <p className="text-gray-600 mt-2">Please wait while we sign you in</p>
        </div>
      )}
    </div>
  );
}