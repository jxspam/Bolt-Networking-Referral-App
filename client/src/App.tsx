import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DisputeResolution from "@/pages/DisputeResolution";
import Campaigns from "@/pages/Campaigns";
import CreateOffer from "@/pages/CreateOffer";
import AdminOverview from "@/pages/AdminOverview";
import Settings from "@/pages/Settings";
import MyNetwork from "@/pages/MyNetwork";
import ShareReferral from "@/pages/ShareReferral";
import ReferralHistory from "@/pages/ReferralHistory";
import Earnings from "@/pages/Earnings";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        
        // Redirect to login when signing out
        if (event === 'SIGNED_OUT') {
          window.location.href = '/login';
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />        <Switch>
          <Route path="/login">
            {session ? <Redirect to="/dashboard" /> : <Login />}
          </Route>          <Route path="/">
            {session ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
          </Route>
          <Route path="/:rest*">
            {session ? (
              <Layout>
                <Switch>
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/network" component={MyNetwork} />
                  <Route path="/share-referral" component={ShareReferral} />
                  <Route path="/referral-history" component={ReferralHistory} />
                  <Route
                    path="/dispute-resolution"
                    component={DisputeResolution}
                  />
                  <Route path="/earnings" component={Earnings} />
                  <Route path="/analytics" component={AdminOverview} />
                  <Route path="/campaigns" component={Campaigns} />
                  <Route path="/create-offer" component={CreateOffer} />
                  <Route path="/settings" component={Settings} />
                  <Route component={NotFound} />
                </Switch>
              </Layout>
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
