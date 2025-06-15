/*
  # Sample Data for Referral Management Platform

  1. Sample Data
    - Create sample profiles (referrers, businesses, admin)
    - Create sample businesses
    - Create sample campaigns
    - Create sample leads
    - Create sample conversions
    - Create sample disputes
    - Create sample notifications

  Note: This is for development/demo purposes only
*/

-- Insert sample profiles
INSERT INTO profiles (id, email, full_name, user_type, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@referralapp.com', 'Alex Morgan', 'admin', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'sarah.johnson@email.com', 'Sarah Johnson', 'referrer', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'david.chen@email.com', 'David Chen', 'referrer', 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'emily.rodriguez@email.com', 'Emily Rodriguez', 'referrer', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'marcus.williams@email.com', 'Marcus Williams', 'referrer', 'active'),
  ('550e8400-e29b-41d4-a716-446655440006', 'olivia.kim@email.com', 'Olivia Kim', 'referrer', 'active'),
  ('550e8400-e29b-41d4-a716-446655440007', 'techsolutions@business.com', 'Tech Solutions Inc', 'business', 'active'),
  ('550e8400-e29b-41d4-a716-446655440008', 'homeservices@business.com', 'Home Services Pro', 'business', 'active'),
  ('550e8400-e29b-41d4-a716-446655440009', 'wellness@business.com', 'Wellness Center', 'business', 'active'),
  ('550e8400-e29b-41d4-a716-446655440010', 'education@business.com', 'Education Plus', 'business', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample businesses
INSERT INTO businesses (id, user_id, business_name, industry, website, phone, address) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'TechSolutions Inc.', 'Technology', 'https://techsolutions.com', '+1-555-0101', '123 Tech Street, San Francisco, CA'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', 'Home Services Pro', 'Home Services', 'https://homeservicespro.com', '+1-555-0102', '456 Service Ave, Los Angeles, CA'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 'Wellness Center', 'Healthcare', 'https://wellnesscenter.com', '+1-555-0103', '789 Health Blvd, New York, NY'),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 'Education Plus', 'Education', 'https://educationplus.com', '+1-555-0104', '321 Learning Lane, Chicago, IL')
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaigns
INSERT INTO campaigns (id, business_id, name, description, service_area, reward_per_conversion, max_budget, spent_budget, start_date, end_date, status) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Summer Sale Referrals', 'Refer new clients for our summer technology solutions', 'San Francisco Bay Area', 25.00, 5000.00, 3750.00, '2024-06-01', '2024-08-31', 'active'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Tech Product Launch', 'New product launch referral campaign', 'California', 40.00, 10000.00, 6200.00, '2024-07-01', '2024-09-30', 'active'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'Home Renovation Leads', 'Quality home renovation referrals', 'Los Angeles County', 35.00, 7500.00, 2450.00, '2024-05-01', '2024-12-31', 'active'),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Wellness Program', 'Health and wellness service referrals', 'New York Metro', 30.00, 15000.00, 8100.00, '2024-01-01', '2024-12-31', 'active'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004', 'Education Program', 'Educational service referrals', 'Chicago Area', 45.00, 8000.00, 4500.00, '2024-03-01', '2024-11-30', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (id, campaign_id, referrer_id, customer_name, customer_email, customer_phone, service_requested, estimated_value, status, referral_code, source) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Michael Thompson', 'michael.thompson@email.com', '+1-555-1001', 'Software Development', 2450.00, 'approved', 'REF-001', 'direct'),
  ('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Rebecca Wilson', 'rebecca.wilson@email.com', '+1-555-1002', 'Cloud Migration', 5800.00, 'converted', 'REF-002', 'social_media'),
  ('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'James Parker', 'james.parker@email.com', '+1-555-1003', 'Kitchen Remodeling', 3200.00, 'approved', 'REF-003', 'website'),
  ('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Sophia Garcia', 'sophia.garcia@email.com', '+1-555-1004', 'Personal Training', 1850.00, 'pending', 'REF-004', 'direct'),
  ('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 'Daniel Martinez', 'daniel.martinez@email.com', '+1-555-1005', 'Online Tutoring', 2100.00, 'pending', 'REF-005', 'referral'),
  ('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Lisa Chen', 'lisa.chen@email.com', '+1-555-1006', 'Web Development', 4200.00, 'converted', 'REF-006', 'social_media'),
  ('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Robert Johnson', 'robert.johnson@email.com', '+1-555-1007', 'Bathroom Renovation', 2800.00, 'approved', 'REF-007', 'direct')
ON CONFLICT (id) DO NOTHING;

-- Insert sample conversions
INSERT INTO conversions (id, lead_id, conversion_value, commission_amount, conversion_date, verified_by) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 5800.00, 40.00, '2024-01-15 10:30:00', '550e8400-e29b-41d4-a716-446655440007'),
  ('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440006', 4200.00, 25.00, '2024-01-20 14:15:00', '550e8400-e29b-41d4-a716-446655440007')
ON CONFLICT (id) DO NOTHING;

-- Insert sample disputes
INSERT INTO disputes (id, lead_id, referrer_id, business_id, dispute_type, business_claim, referrer_response, status) VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'timing_dispute', 'Client was already in our database before referral', 'Initial contact was made through my referral link', 'pending'),
  ('a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'fraud_alert', 'Multiple referrers claiming the same lead', 'My referral link was used first and can be verified in system logs', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
  ('b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'New Lead Approved', 'Your referral for Michael Thompson has been approved!', 'success', false),
  ('b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Conversion Confirmed', 'Rebecca Wilson conversion confirmed - $40 commission earned!', 'success', false),
  ('b50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Dispute Filed', 'A dispute has been filed for your referral REF-001', 'warning', false)
ON CONFLICT (id) DO NOTHING;