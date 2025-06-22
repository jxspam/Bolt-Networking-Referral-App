/**
 * Populate Fake Data Script
 * 
 * This script populates the Supabase database with fake data for testing and demo purposes.
 * It creates users, campaigns, leads, earnings, payouts, and payout methods.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateFakeData() {
  console.log('Starting fake data population...');
  try {
    // Clean existing data
    console.log('Cleaning existing data...');
    await supabase.from('payouts').delete().neq('id', 0);
    await supabase.from('payout_methods').delete().neq('id', 0);
    await supabase.from('earnings').delete().neq('id', 0);
    await supabase.from('disputes').delete().neq('id', 0);
    await supabase.from('activities').delete().neq('id', 0);
    await supabase.from('leads').delete().neq('id', 0);
    await supabase.from('campaigns').delete().neq('id', 0);

    // Create users if they don't exist
    console.log('Creating users...');
    const userIds = {
      referrer1: '9441dd43-051a-4866-b42d-22d5cc2ab42c',
      referrer2: '8395627e-6e0c-4065-81ae-d4caa0e76e7f',
      business: '8a840097-a538-453b-a36c-a0f9050d3eb2',
      admin: uuidv4()
    };    // Upsert users in the auth users table
    await supabase.from('users').upsert([
      {
        id: userIds.referrer1,
        email: 'referrer1@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
        role: 'referrer',
        tier: 'standard',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe'
      },
      {
        id: userIds.referrer2,
        email: 'referrer2@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        password: 'password123',
        role: 'referrer',
        tier: 'premium',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith'
      },
      {
        id: userIds.business,
        email: 'business@example.com',
        first_name: 'Business',
        last_name: 'Owner',
        password: 'password123',
        role: 'business',
        tier: 'premium',
        avatar: 'https://ui-avatars.com/api/?name=Business+Owner'
      },
      {
        id: userIds.admin,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        password: 'password123',
        role: 'admin',
        tier: 'premium',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User'
      }
    ], { onConflict: 'id' });
    
    // Also upsert in the legacy user table for backward compatibility
    await supabase.from('user').upsert([
      {
        id: userIds.referrer1,
        email: 'referrer1@example.com',
        firstname: 'John',
        lastname: 'Doe',
        password: 'password123',
        role: 'referrer',
        tier: 'standard',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe'
      },
      {
        id: userIds.referrer2,
        email: 'referrer2@example.com',
        firstname: 'Jane',
        lastname: 'Smith',
        password: 'password123',
        role: 'referrer',
        tier: 'premium',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith'
      },
      {
        id: userIds.business,
        email: 'business@example.com',
        firstname: 'Business',
        lastname: 'Owner',
        password: 'password123',
        role: 'business',
        tier: 'premium',
        avatar: 'https://ui-avatars.com/api/?name=Business+Owner'
      },
      {
        id: userIds.admin,
        email: 'admin@example.com',
        firstname: 'Admin',
        lastname: 'User',
        password: 'password123',
        role: 'admin',
        tier: 'premium',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User'
      }
    ], { onConflict: 'id' });

    // Create campaigns
    console.log('Creating campaigns...');
    const { data: campaignsData } = await supabase.from('campaigns').insert([
      {
        name: 'Summer Referral Program',
        description: 'Earn rewards for referring new customers to our summer services',
        reward_per_conversion: 50.00,
        max_budget: 5000.00,
        budget_used: 1250.00,
        leads: 35,
        conversions: 25,
        status: 'active',
        start_date: '2025-05-01',
        end_date: '2025-08-31',
        service_area: 'Melbourne Metro',
        postcode_start: '3000',
        postcode_end: '3207',
        business_id: userIds.business
      },
      {
        name: 'Tech Product Launch',
        description: 'Help us promote our new tech product and earn per qualified lead',
        reward_per_conversion: 75.00,
        max_budget: 10000.00,
        budget_used: 2250.00,
        leads: 42,
        conversions: 30,
        status: 'active',
        start_date: '2025-04-15',
        end_date: '2025-07-15',
        service_area: 'Sydney Metro',
        postcode_start: '2000',
        postcode_end: '2250',
        business_id: userIds.business
      },
      {
        name: 'Education Services',
        description: 'Refer students to our education services and earn rewards',
        reward_per_conversion: 45.00,
        max_budget: 3000.00,
        budget_used: 900.00,
        leads: 28,
        conversions: 20,
        status: 'active',
        start_date: '2025-06-01',
        end_date: '2025-12-31',
        service_area: 'Brisbane',
        postcode_start: '4000',
        postcode_end: '4179',
        business_id: userIds.business
      },
      {
        name: 'Wellness Program',
        description: 'Promote health & wellness services for your contacts',
        reward_per_conversion: 60.00,
        max_budget: 4000.00,
        budget_used: 1620.00,
        leads: 38,
        conversions: 27,
        status: 'active',
        start_date: '2025-05-15',
        end_date: '2025-09-30',
        service_area: 'Perth',
        postcode_start: '6000',
        postcode_end: '6175',
        business_id: userIds.business
      }
    ]).select();

    const campaigns = campaignsData || [];
    console.log(`Created ${campaigns.length} campaigns`);

    // Create leads
    console.log('Creating leads...');
    const { data: leadsData } = await supabase.from('leads').insert([
      {
        customer_name: 'Sarah Johnson',
        service: 'Summer Landscaping',
        value: 500.00,
        status: 'approved',
        business_name: 'GreenScapes Ltd',
        referrer_id: userIds.referrer1,
        created_at: '2025-05-15'
      },
      {
        customer_name: 'Michael Chen',
        service: 'Tech Support Package',
        value: 750.00,
        status: 'pending',
        business_name: 'TechSolutions Inc',
        referrer_id: userIds.referrer1,
        created_at: '2025-05-20'
      },
      {
        customer_name: 'Lisa Taylor',
        service: 'Education Tutoring',
        value: 350.00,
        status: 'completed',
        business_name: 'BrightMinds Education',
        referrer_id: userIds.referrer1,
        created_at: '2025-06-01'
      },
      {
        customer_name: 'Robert Garcia',
        service: 'Wellness Consultation',
        value: 600.00,
        status: 'approved',
        business_name: 'WellnessWave',
        referrer_id: userIds.referrer2,
        created_at: '2025-06-05'
      },
      {
        customer_name: 'Emily Wright',
        service: 'Tech Product Demo',
        value: 1200.00,
        status: 'pending',
        business_name: 'TechSolutions Inc',
        referrer_id: userIds.referrer2,
        created_at: '2025-06-10'
      },
      {
        customer_name: 'James Wilson',
        service: 'Summer Pool Service',
        value: 800.00,
        status: 'completed',
        business_name: 'GreenScapes Ltd',
        referrer_id: userIds.referrer2,
        created_at: '2025-06-15'
      }
    ]).select();

    const leads = leadsData || [];
    console.log(`Created ${leads.length} leads`);    // Create earnings based on leads and campaigns
    console.log('Creating earnings...');
    
    // Helper function to find a campaign ID based on service name
    function findCampaignId(service: string) {
      for (const campaign of campaigns) {
        if (
          (service.includes('Summer') && campaign.name.includes('Summer')) ||
          (service.includes('Tech') && campaign.name.includes('Tech')) ||
          (service.includes('Education') && campaign.name.includes('Education')) ||
          (service.includes('Wellness') && campaign.name.includes('Wellness'))
        ) {
          return campaign.id;
        }
      }
      // Default to first campaign if no match
      return campaigns[0]?.id;
    }

    const earningsItems = [];

    for (const lead of leads) {
      // Skip if lead is pending
      if (lead.status === 'pending') continue;

      // Find matching campaign
      const campaignId = findCampaignId(lead.service);
      
      // Calculate amount based on campaign reward
      const campaign = campaigns.find(c => c.id === campaignId);
      const amount = campaign ? parseFloat(campaign.reward_per_conversion) : 50.00;
      
      earningsItems.push({
        lead_id: lead.id,
        campaign_id: campaignId,
        amount: amount,
        status: lead.status === 'completed' ? 'paid' : 'pending',
        referrer_id: lead.referrer_id,
        created_at: lead.created_at,
        paid_at: lead.status === 'completed' ? new Date().toISOString() : null
      });
    }

    const { data: earnings } = await supabase.from('earnings').insert(earningsItems).select();
    console.log(`Created ${earnings?.length || 0} earnings records`);

    // Create payout records
    console.log('Creating payouts...');
    await supabase.from('payouts').insert([
      {
        user_id: userIds.referrer1,
        date: '2025-05-31',
        amount: 350.00,
        method: 'bank_transfer',
        status: 'completed',
        reference: 'PAY-2025-05-001'
      },
      {
        user_id: userIds.referrer1,
        date: '2025-06-15',
        amount: 275.00,
        method: 'bank_transfer',
        status: 'pending',
        reference: 'PAY-2025-06-001'
      },
      {
        user_id: userIds.referrer2,
        date: '2025-05-31',
        amount: 450.00,
        method: 'paypal',
        status: 'completed',
        reference: 'PAY-2025-05-002'
      },
      {
        user_id: userIds.referrer2,
        date: '2025-06-15',
        amount: 325.00,
        method: 'paypal',
        status: 'pending',
        reference: 'PAY-2025-06-002'
      }
    ]);    // Create payout methods
    console.log('Creating payout methods...');
    await supabase.from('payout_methods').insert([
      {
        user_id: userIds.referrer1,
        type: 'bank_transfer',
        details: { bank_name: 'Commonwealth Bank', account_number: '************1234', bsb: '123456' },
        is_default: true
      },
      {
        user_id: userIds.referrer1,
        type: 'paypal',
        details: { email: 'john.doe@example.com' },
        is_default: false
      },
      {
        user_id: userIds.referrer2,
        type: 'paypal',
        details: { email: 'jane.smith@example.com' },
        is_default: true
      },
      {
        user_id: userIds.referrer2,
        type: 'bank_transfer',
        details: { bank_name: 'NAB', account_number: '************5678', bsb: '654321' },
        is_default: false
      }
    ]);

    // Create disputes
    console.log('Creating disputes...');
    await supabase.from('disputes').insert([
      {
        case_id: 'DSP-2025-001',
        referrer_id: userIds.referrer1,
        business_id: userIds.business,
        admin_id: userIds.admin,
        lead_id: leads[0].id,
        business_claim: 'The lead was already in our system before referral',
        referrer_response: 'I contacted them first and made the introduction',
        status: 'pending',
        created_at: new Date('2025-06-10').toISOString()
      },
      {
        case_id: 'DSP-2025-002',
        referrer_id: userIds.referrer2,
        business_id: userIds.business,
        lead_id: leads[4].id,
        business_claim: 'Poor quality lead, customer not interested',
        status: 'pending',
        created_at: new Date('2025-06-15').toISOString()
      },
      {
        case_id: 'DSP-2025-003',
        referrer_id: userIds.referrer1,
        business_id: userIds.business,
        admin_id: userIds.admin,
        lead_id: leads[2].id,
        business_claim: 'Service not in customer budget',
        referrer_response: 'Customer confirmed budget before referral',
        status: 'resolved',
        decision: 'approved',
        created_at: new Date('2025-05-20').toISOString(),
        resolved_at: new Date('2025-05-25').toISOString()
      }
    ]);

    // Create activities
    console.log('Creating activities...');
    await supabase.from('activities').insert([
      {
        user_id: userIds.referrer1,
        type: 'lead_created',
        title: 'New Lead Created',
        description: 'You created a new lead: Sarah Johnson',
        entity_type: 'lead',
        entity_id: leads[0].id.toString(),
        created_at: new Date('2025-05-15').toISOString()
      },
      {
        user_id: userIds.referrer1,
        type: 'payout_processed',
        title: 'Payout Processed',
        description: 'Your payout of $350.00 has been processed',
        entity_type: 'payout',
        entity_id: '1',
        created_at: new Date('2025-05-31').toISOString()
      },
      {
        user_id: userIds.referrer2,
        type: 'dispute',
        title: 'Dispute Filed',
        description: 'A business has filed a dispute for one of your leads',
        entity_type: 'dispute',
        entity_id: 'DSP-2025-002',
        created_at: new Date('2025-06-15').toISOString()
      },
      {
        user_id: userIds.business,
        type: 'campaign',
        title: 'Campaign Created',
        description: 'You created a new campaign: Summer Referral Program',
        entity_type: 'campaign',
        entity_id: '1',
        created_at: new Date('2025-05-01').toISOString()
      }
    ]);

    console.log('Fake data population completed successfully!');

  } catch (error) {
    console.error('Error populating fake data:', error);
    process.exit(1);
  }
}

// Run the population function
populateFakeData();
