-- Set up Row Level Security (RLS) policies for each table
-- This assumes tables have been migrated to use auth.users UUIDs

-- First enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Create an auth helper function to check user role from metadata
CREATE OR REPLACE FUNCTION auth.check_user_role(required_role text) RETURNS boolean AS $$
BEGIN
  RETURN (SELECT (auth.jwt() ->> 'role')::text = required_role 
          OR (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')::text = required_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current authenticated user id
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
  RETURN (SELECT uuid(auth.uid()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LEADS table policies

-- Admin can read all leads
CREATE POLICY leads_admin_read ON leads
  FOR SELECT USING (auth.check_user_role('admin'));

-- Referrers can read their own leads
CREATE POLICY leads_referrer_read ON leads
  FOR SELECT USING (auth.uid()::text = referrer_id);

-- Businesses can read leads associated with their campaigns (would need a join to campaigns)
CREATE POLICY leads_business_read ON leads
  FOR SELECT USING (
    auth.check_user_role('business') AND 
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = leads.campaign_id 
      AND campaigns.business_id = auth.uid()::text
    )
  );

-- Referrers can create leads
CREATE POLICY leads_referrer_insert ON leads
  FOR INSERT WITH CHECK (
    auth.uid()::text = referrer_id AND 
    auth.check_user_role('referrer')
  );

-- CAMPAIGNS table policies

-- Admin can read all campaigns
CREATE POLICY campaigns_admin_read ON campaigns
  FOR SELECT USING (auth.check_user_role('admin'));

-- Referrers can read all active campaigns 
CREATE POLICY campaigns_referrer_read ON campaigns
  FOR SELECT USING (
    auth.check_user_role('referrer') AND 
    status = 'active'
  );

-- Business can read their own campaigns
CREATE POLICY campaigns_business_read ON campaigns
  FOR SELECT USING (
    auth.uid()::text = business_id
  );

-- Business can create campaigns
CREATE POLICY campaigns_business_insert ON campaigns
  FOR INSERT WITH CHECK (
    auth.uid()::text = business_id AND 
    auth.check_user_role('business')
  );

-- Business can update their own campaigns
CREATE POLICY campaigns_business_update ON campaigns
  FOR UPDATE USING (
    auth.uid()::text = business_id AND 
    auth.check_user_role('business')
  );

-- DISPUTES table policies

-- Admin can read all disputes
CREATE POLICY disputes_admin_read ON disputes
  FOR SELECT USING (auth.check_user_role('admin'));

-- Referrers can read disputes that mention them
CREATE POLICY disputes_referrer_read ON disputes
  FOR SELECT USING (
    auth.uid()::text = referrer_id
  );

-- Businesses can read disputes they filed
CREATE POLICY disputes_business_read ON disputes
  FOR SELECT USING (
    auth.uid()::text = business_id
  );

-- Businesses can create disputes
CREATE POLICY disputes_business_insert ON disputes
  FOR INSERT WITH CHECK (
    auth.uid()::text = business_id AND
    auth.check_user_role('business')
  );

-- EARNINGS table policies

-- Admin can read all earnings
CREATE POLICY earnings_admin_read ON earnings
  FOR SELECT USING (auth.check_user_role('admin'));

-- Referrers can read their own earnings
CREATE POLICY earnings_referrer_read ON earnings
  FOR SELECT USING (
    auth.uid()::text = referrer_id
  );

-- ACTIVITIES table policies

-- Admin can read all activities
CREATE POLICY activities_admin_read ON activities
  FOR SELECT USING (auth.check_user_role('admin'));

-- Users can read their own activities
CREATE POLICY activities_user_read ON activities
  FOR SELECT USING (
    auth.uid()::text = user_id
  );

-- PAYOUTS table policies

-- Admin can read all payouts
CREATE POLICY payouts_admin_read ON payouts
  FOR SELECT USING (auth.check_user_role('admin'));

-- Users can read their own payouts
CREATE POLICY payouts_user_read ON payouts
  FOR SELECT USING (
    auth.uid()::text = user_id
  );
