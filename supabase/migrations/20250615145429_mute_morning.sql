/*
  # Referral Management Platform Database Schema

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `user_type` (enum: referrer, business, admin)
      - `status` (enum: active, inactive, suspended)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `businesses` - Business information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `business_name` (text)
      - `industry` (text)
      - `website` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `campaigns` - Referral campaigns
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `name` (text)
      - `description` (text)
      - `service_area` (text)
      - `postcode_start` (text)
      - `postcode_end` (text)
      - `reward_per_conversion` (decimal)
      - `max_budget` (decimal)
      - `spent_budget` (decimal, default 0)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (enum: draft, active, paused, completed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `leads` - Lead information
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `referrer_id` (uuid, references profiles)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `service_requested` (text)
      - `estimated_value` (decimal)
      - `status` (enum: pending, approved, rejected, converted)
      - `referral_code` (text)
      - `source` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `conversions` - Successful conversions
      - `id` (uuid, primary key)
      - `lead_id` (uuid, references leads)
      - `conversion_value` (decimal)
      - `commission_amount` (decimal)
      - `conversion_date` (timestamp)
      - `verified_by` (uuid, references profiles)
      - `created_at` (timestamp)

    - `payouts` - Payout records
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, references profiles)
      - `amount` (decimal)
      - `period_start` (date)
      - `period_end` (date)
      - `status` (enum: pending, processing, completed, failed)
      - `payment_method` (text)
      - `transaction_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `disputes` - Dispute cases
      - `id` (uuid, primary key)
      - `lead_id` (uuid, references leads)
      - `referrer_id` (uuid, references profiles)
      - `business_id` (uuid, references businesses)
      - `dispute_type` (enum: fraud_alert, multiple_referrers, timing_dispute, other)
      - `business_claim` (text)
      - `referrer_response` (text)
      - `evidence_urls` (text[])
      - `status` (enum: pending, approved, rejected, escalated)
      - `resolved_by` (uuid, references profiles)
      - `resolution_notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications` - User notifications
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `type` (enum: info, success, warning, error)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add admin policies for administrative access
    - Add business policies for campaign and lead management
</sql>

-- Create custom types
CREATE TYPE user_type AS ENUM ('referrer', 'business', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE lead_status AS ENUM ('pending', 'approved', 'rejected', 'converted');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE dispute_type AS ENUM ('fraud_alert', 'multiple_referrers', 'timing_dispute', 'other');
CREATE TYPE dispute_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  user_type user_type DEFAULT 'referrer',
  status user_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  industry text,
  website text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  service_area text,
  postcode_start text,
  postcode_end text,
  reward_per_conversion decimal(10,2) NOT NULL DEFAULT 0,
  max_budget decimal(10,2) NOT NULL DEFAULT 0,
  spent_budget decimal(10,2) DEFAULT 0,
  start_date date,
  end_date date,
  status campaign_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  service_requested text,
  estimated_value decimal(10,2) DEFAULT 0,
  status lead_status DEFAULT 'pending',
  referral_code text,
  source text DEFAULT 'direct',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversions table
CREATE TABLE IF NOT EXISTS conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  conversion_value decimal(10,2) NOT NULL DEFAULT 0,
  commission_amount decimal(10,2) NOT NULL DEFAULT 0,
  conversion_date timestamptz DEFAULT now(),
  verified_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status payout_status DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  dispute_type dispute_type NOT NULL,
  business_claim text,
  referrer_response text,
  evidence_urls text[],
  status dispute_status DEFAULT 'pending',
  resolved_by uuid REFERENCES profiles(id),
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Businesses policies
CREATE POLICY "Business owners can manage their businesses"
  ON businesses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Campaigns policies
CREATE POLICY "Business owners can manage their campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Referrers can read active campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can read all campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Leads policies
CREATE POLICY "Referrers can manage their leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Business owners can read leads for their campaigns"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN businesses b ON c.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update leads for their campaigns"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN businesses b ON c.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Conversions policies
CREATE POLICY "Users can read conversions for their leads"
  ON conversions
  FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM leads WHERE referrer_id = auth.uid()
    ) OR
    lead_id IN (
      SELECT l.id FROM leads l
      JOIN campaigns c ON l.campaign_id = c.id
      JOIN businesses b ON c.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create conversions"
  ON conversions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    lead_id IN (
      SELECT l.id FROM leads l
      JOIN campaigns c ON l.campaign_id = c.id
      JOIN businesses b ON c.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all conversions"
  ON conversions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Payouts policies
CREATE POLICY "Referrers can read their payouts"
  ON payouts
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Admins can manage all payouts"
  ON payouts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Disputes policies
CREATE POLICY "Users can read disputes they're involved in"
  ON disputes
  FOR SELECT
  TO authenticated
  USING (
    referrer_id = auth.uid() OR
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create disputes for their leads"
  ON disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    referrer_id = auth.uid() OR
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their disputes"
  ON disputes
  FOR UPDATE
  TO authenticated
  USING (
    referrer_id = auth.uid() OR
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all disputes"
  ON disputes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can read their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_referrer_id ON leads(referrer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_conversions_lead_id ON conversions(lead_id);
CREATE INDEX IF NOT EXISTS idx_payouts_referrer_id ON payouts(referrer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_lead_id ON disputes(lead_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();