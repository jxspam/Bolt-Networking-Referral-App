import {
  leads,
  campaigns,
  // disputes, // Table doesn't exist in the database
  earnings,
  // activities, // Table doesn't exist in the database
  payouts, 
  payoutMethods,
  users,
  type User,
  type InsertUser,
  type Lead,
  type InsertLead,
  type Campaign,
  type InsertCampaign,
  // type Dispute, // Table doesn't exist in the database
  // type InsertDispute, // Table doesn't exist in the database
  type Earning,
  type InsertEarning,
  // type Activity, // Table doesn't exist in the database
  // type InsertActivity, // Table doesn't exist in the database
  type Payout,
  type InsertPayout
} from "@shared/schema";
import { createClient } from "@supabase/supabase-js";
import { db, supabase } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users - Now use Supabase Auth API
  getUser(id: string): Promise<User | undefined>; // Updated to use UUID
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  // createUser and updateUser are now handled by Supabase Auth API
  getUsers(): Promise<User[]>;
  
  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  getLeadsByReferrer(referrerId: number): Promise<Lead[]>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  getCampaignsByBusiness(businessId: number): Promise<Campaign[]>;
  
  // Disputes
  getDisputes(): Promise<Dispute[]>;
  getDispute(id: number): Promise<Dispute | undefined>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: number, updates: Partial<InsertDispute>): Promise<Dispute | undefined>;
  getDisputesByStatus(status: string): Promise<Dispute[]>;
  
  // Earnings
  getEarnings(): Promise<Earning[]>;
  getEarning(id: number): Promise<Earning | undefined>;
  createEarning(earning: InsertEarning): Promise<Earning>;
  updateEarning(id: number, updates: Partial<InsertEarning>): Promise<Earning | undefined>;
  getEarningsByReferrer(referrerId: number): Promise<Earning[]>;
  
  // Activities
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private campaigns: Map<number, Campaign>;
  private disputes: Map<number, Dispute>;
  private earnings: Map<number, Earning>;
  private activities: Map<number, Activity>;
  
  private currentUserId: number;
  private currentLeadId: number;
  private currentCampaignId: number;
  private currentDisputeId: number;
  private currentEarningId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.campaigns = new Map();
    this.disputes = new Map();
    this.earnings = new Map();
    this.activities = new Map();
    
    this.currentUserId = 1;
    this.currentLeadId = 1;
    this.currentCampaignId = 1;
    this.currentDisputeId = 1;
    this.currentEarningId = 1;
    this.currentActivityId = 1;

    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create admin user
    this.createUser({
      username: "alex.morgan",
      email: "alex@networkearnings.com",
      password: "password123",
      firstName: "Alex",
      lastName: "Morgan",
      role: "admin",
      tier: "premium",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32"
    });

    // Create referrer users
    this.createUser({
      username: "sarah.johnson",
      email: "sarah@email.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "referrer",
      tier: "premium",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32"
    });

    this.createUser({
      username: "david.chen",
      email: "david@email.com",
      password: "password123",
      firstName: "David",
      lastName: "Chen",
      role: "referrer",
      tier: "standard",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32"
    });

    this.createUser({
      username: "emily.rodriguez",
      email: "emily@email.com",
      password: "password123",
      firstName: "Emily",
      lastName: "Rodriguez",
      role: "referrer",
      tier: "standard",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32"
    });

    this.createUser({
      username: "marcus.williams",
      email: "marcus@email.com",
      password: "password123",
      firstName: "Marcus",
      lastName: "Williams",
      role: "referrer",
      tier: "standard",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32"
    });

    this.createUser({
      username: "olivia.kim",
      email: "olivia@email.com",
      password: "password123",
      firstName: "Olivia",
      lastName: "Kim",
      role: "referrer",
      tier: "premium",
      avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32"
    });

    // Create business users
    this.createUser({
      username: "techsolutions.inc",
      email: "contact@techsolutions.com",
      password: "password123",
      firstName: "Tech",
      lastName: "Solutions",
      role: "business",
      tier: "premium"
    });

    // Create sample leads
    this.createLead({
      referrerId: 2,
      customerName: "Michael Thompson",
      customerEmail: "michael.thompson@email.com",
      service: "Home Renovation",
      value: "2450.00",
      status: "pending",
      businessName: "Home Pro Services"
    });

    this.createLead({
      referrerId: 3,
      customerName: "Rebecca Wilson",
      customerEmail: "rebecca.wilson@email.com", 
      service: "Kitchen Remodeling",
      value: "5800.00",
      status: "approved",
      businessName: "Kitchen Masters"
    });

    this.createLead({
      referrerId: 4,
      customerName: "James Parker",
      customerEmail: "james.parker@email.com",
      service: "Bathroom Remodel",
      value: "3200.00",
      status: "approved",
      businessName: "Bath Renovations Co"
    });

    this.createLead({
      referrerId: 5,
      customerName: "Sophia Garcia",
      customerEmail: "sophia.garcia@email.com",
      service: "Landscaping",
      value: "1850.00",
      status: "rejected",
      businessName: "Green Thumb Landscaping"
    });

    this.createLead({
      referrerId: 6,
      customerName: "Daniel Martinez",
      customerEmail: "daniel.martinez@email.com",
      service: "Roof Repair",
      value: "2100.00",
      status: "pending",
      businessName: "Roof Masters"
    });

    // Create sample campaigns
    this.createCampaign({
      businessId: 7,
      name: "Summer Sale Referrals",
      description: "Promote our summer home improvement services",
      serviceArea: "home-services",
      rewardPerConversion: "25.00",
      maxBudget: "5000.00",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-07-31"),
      postcode: { start: "10001", end: "10099" },
      status: "active"
    });

    this.createCampaign({
      businessId: 7,
      name: "Tech Product Launch",
      description: "New technology services campaign",
      serviceArea: "technology",
      rewardPerConversion: "40.00",
      maxBudget: "10000.00",
      startDate: new Date("2023-08-01"),
      endDate: new Date("2023-09-15"),
      postcode: { start: "20001", end: "20099" },
      status: "active"
    });

    // Create sample disputes
    this.createDispute({
      caseId: "DR-7829",
      leadId: 1,
      businessId: 7,
      referrerId: 2,
      businessClaim: "Client was already in our database before referral",
      referrerResponse: "Initial contact was made through my referral link",
      status: "pending"
    });

    this.createDispute({
      caseId: "DR-7831",
      leadId: 2,
      businessId: 7,
      referrerId: 3,
      businessClaim: "Referral code used after direct contact was established",
      referrerResponse: "Client confirmed they found us through my social media campaign",
      status: "pending"
    });

    // Create sample earnings
    this.createEarning({
      referrerId: 2,
      leadId: 1,
      campaignId: 1,
      amount: "245.00",
      status: "pending"
    });

    this.createEarning({
      referrerId: 3,
      leadId: 2,
      campaignId: 1,
      amount: "580.00",
      status: "paid"
    });

    this.createEarning({
      referrerId: 4,
      leadId: 3,
      campaignId: 2,
      amount: "320.00",
      status: "paid"
    });

    // Create sample activities
    this.createActivity({
      userId: 1,
      type: "new_referrer",
      title: "New referrer joined the network",
      description: "David Smith registered through the affiliate program"
    });

    this.createActivity({
      userId: 1,
      type: "payout_processed",
      title: "Payout processed for October earnings",
      description: "$45,230 distributed to 124 referrers"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Lead methods
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const now = new Date();
    const lead: Lead = {
      ...insertLead,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updates, updatedAt: new Date() };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async getLeadsByReferrer(referrerId: number): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => lead.referrerId === referrerId);
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => lead.status === status);
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      budgetUsed: "0",
      leads: 0,
      conversions: 0,
      createdAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async getCampaignsByBusiness(businessId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.businessId === businessId);
  }

  // Dispute methods
  async getDisputes(): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    return this.disputes.get(id);
  }

  async createDispute(insertDispute: InsertDispute): Promise<Dispute> {
    const id = this.currentDisputeId++;
    const dispute: Dispute = {
      ...insertDispute,
      id,
      createdAt: new Date(),
      resolvedAt: null,
    };
    this.disputes.set(id, dispute);
    return dispute;
  }

  async updateDispute(id: number, updates: Partial<InsertDispute>): Promise<Dispute | undefined> {
    const dispute = this.disputes.get(id);
    if (!dispute) return undefined;
    
    const updatedDispute = { ...dispute, ...updates };
    if (updates.status && updates.status !== "pending") {
      updatedDispute.resolvedAt = new Date();
    }
    this.disputes.set(id, updatedDispute);
    return updatedDispute;
  }

  async getDisputesByStatus(status: string): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(dispute => dispute.status === status);
  }

  // Earning methods
  async getEarnings(): Promise<Earning[]> {
    return Array.from(this.earnings.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getEarning(id: number): Promise<Earning | undefined> {
    return this.earnings.get(id);
  }

  async createEarning(insertEarning: InsertEarning): Promise<Earning> {
    const id = this.currentEarningId++;
    const earning: Earning = {
      ...insertEarning,
      id,
      paidAt: null,
      createdAt: new Date(),
    };
    this.earnings.set(id, earning);
    return earning;
  }

  async updateEarning(id: number, updates: Partial<InsertEarning>): Promise<Earning | undefined> {
    const earning = this.earnings.get(id);
    if (!earning) return undefined;
    
    const updatedEarning = { ...earning, ...updates };
    if (updates.status === "paid") {
      updatedEarning.paidAt = new Date();
    }
    this.earnings.set(id, updatedEarning);
    return updatedEarning;
  }

  async getEarningsByReferrer(referrerId: number): Promise<Earning[]> {
    return Array.from(this.earnings.values()).filter(earning => earning.referrerId === referrerId);
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const activities = await this.getActivities();
    return activities.slice(0, limit);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error || !data.user) return undefined;
    
    const { user } = data;
    const metadata = user.user_metadata || {};
    
    return {
      id: user.id,
      username: metadata.username || "",
      email: user.email || "",
      firstName: metadata.first_name || "",
      lastName: metadata.last_name || "",
      avatar: metadata.avatar || null,
      role: metadata.role || "referrer",
      tier: metadata.tier || "standard",
      createdAt: new Date(user.created_at || Date.now())
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Search all users by metadata.username
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error || !data.users) return undefined;
    
    const user = data.users.find(
      u => u.user_metadata?.username?.toLowerCase() === username.toLowerCase()
    );
    
    if (!user) return undefined;
    
    const metadata = user.user_metadata || {};
    
    return {
      id: user.id,
      username: metadata.username || "",
      email: user.email || "",
      firstName: metadata.first_name || "",
      lastName: metadata.last_name || "",
      avatar: metadata.avatar || null,
      role: metadata.role || "referrer",
      tier: metadata.tier || "standard",
      createdAt: new Date(user.created_at || Date.now())
    };
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });
    
    if (error || !data.users.length) return undefined;
    
    const user = data.users[0];
    const metadata = user.user_metadata || {};
    
    return {
      id: user.id,
      username: metadata.username || "",
      email: user.email || "",
      firstName: metadata.first_name || "",
      lastName: metadata.last_name || "", 
      avatar: metadata.avatar || null,
      role: metadata.role || "referrer",
      tier: metadata.tier || "standard",
      createdAt: new Date(user.created_at || Date.now())
    };
  }

  // createUser and updateUser methods are removed as we use Supabase Auth API directly

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error || !data.users) return [];
    
    return data.users.map(user => {
      const metadata = user.user_metadata || {};
      
      return {
        id: user.id,
        username: metadata.username || "",
        email: user.email || "",
        firstName: metadata.first_name || "",
        lastName: metadata.last_name || "",
        avatar: metadata.avatar || null,
        role: metadata.role || "referrer",
        tier: metadata.tier || "standard",
        createdAt: new Date(user.created_at || Date.now())
      };
    });
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(leads.createdAt);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values({
        ...insertLead,
        referrerId: insertLead.referrerId ?? null,
        customerEmail: insertLead.customerEmail ?? null,
        customerPhone: insertLead.customerPhone ?? null,
        status: insertLead.status ?? "pending",
        businessName: insertLead.businessName ?? null,
        notes: insertLead.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async getLeadsByReferrer(referrerId: number): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.referrerId, referrerId));
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.status, status));
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(campaigns.createdAt);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values({
        ...insertCampaign,
        businessId: insertCampaign.businessId || null,
        description: insertCampaign.description || null,
        status: insertCampaign.status || "active",
        budgetUsed: "0",
        leads: 0,
        conversions: 0,
        createdAt: new Date()
      })
      .returning();
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [campaign] = await db
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();
    return campaign || undefined;
  }

  async getCampaignsByBusiness(businessId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.businessId, businessId));
  }
  // Disputes functionality is deprecated as the table doesn't exist in the Supabase database
  // Returning empty arrays or undefined as placeholders to maintain compatibility
  async getDisputes(): Promise<Dispute[]> {
    console.warn('Disputes table does not exist in Supabase database. Returning empty array.');
    return [];
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    console.warn('Disputes table does not exist in Supabase database. Returning undefined.');
    return undefined;
  }

  async createDispute(insertDispute: InsertDispute): Promise<Dispute> {
    console.warn('Disputes table does not exist in Supabase database. Returning placeholder object.');
    // Return a placeholder object to maintain compatibility
    return {
      id: 0,
      userId: "",
      leadId: 0,
      reason: insertDispute.reason,
      description: insertDispute.description || "",
      status: "pending",
      createdAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
      resolution: null
    };
  }

  async updateDispute(id: number, updates: Partial<InsertDispute>): Promise<Dispute | undefined> {
    console.warn('Disputes table does not exist in Supabase database. Returning undefined.');
    return undefined;
  }

  async getDisputesByStatus(status: string): Promise<Dispute[]> {
    console.warn('Disputes table does not exist in Supabase database. Returning empty array.');
    return [];
  }

  async getEarnings(): Promise<Earning[]> {
    return await db.select().from(earnings).orderBy(earnings.createdAt);
  }

  async getEarning(id: number): Promise<Earning | undefined> {
    const [earning] = await db.select().from(earnings).where(eq(earnings.id, id));
    return earning || undefined;
  }

  async createEarning(insertEarning: InsertEarning): Promise<Earning> {
    const [earning] = await db
      .insert(earnings)
      .values({
        ...insertEarning,
        referrerId: insertEarning.referrerId || null,
        leadId: insertEarning.leadId || null,
        campaignId: insertEarning.campaignId || null,
        status: insertEarning.status || "pending",
        createdAt: new Date(),
        paidAt: null
      })
      .returning();
    return earning;
  }

  async updateEarning(id: number, updates: Partial<InsertEarning>): Promise<Earning | undefined> {
    const updateData = { ...updates };
    if (updates.status === "paid") {
      updateData.paidAt = new Date();
    }
    
    const [earning] = await db
      .update(earnings)
      .set(updateData)
      .where(eq(earnings.id, id))
      .returning();
    return earning || undefined;
  }

  async getEarningsByReferrer(referrerId: number): Promise<Earning[]> {
    return await db.select().from(earnings).where(eq(earnings.referrerId, referrerId));
  }
  // Activities functionality is deprecated as the table doesn't exist in the Supabase database
  // Returning empty arrays or placeholder objects to maintain compatibility
  async getActivities(): Promise<Activity[]> {
    console.warn('Activities table does not exist in Supabase database. Returning empty array.');
    return [];
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    console.warn('Activities table does not exist in Supabase database. Returning placeholder object.');
    // Return a placeholder object to maintain compatibility
    return {
      id: 0,
      userId: insertActivity.userId || null,
      action: insertActivity.action,
      entityType: insertActivity.entityType,
      entityId: insertActivity.entityId,
      details: insertActivity.details || null,
      createdAt: new Date()
    };
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    console.warn('Activities table does not exist in Supabase database. Returning empty array.');
    return [];
  }
}

// Initialize database with sample data
async function initializeSampleData() {
  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already initialized with sample data");
      return;
    }

    console.log("Initializing database with sample data...");

    // Create admin user
    const adminUser = await db.insert(users).values({
      username: "alex.morgan",
      email: "alex@networkearnings.com", 
      password: "password123",
      firstName: "Alex",
      lastName: "Morgan",
      role: "admin",
      tier: "premium",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
      createdAt: new Date()
    }).returning();

    // Create referrer users
    const users_data = [
      {
        username: "sarah.johnson",
        email: "sarah@email.com",
        password: "password123", 
        firstName: "Sarah",
        lastName: "Johnson",
        role: "referrer",
        tier: "premium",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        createdAt: new Date()
      },
      {
        username: "david.chen",
        email: "david@email.com", 
        password: "password123",
        firstName: "David",
        lastName: "Chen",
        role: "referrer",
        tier: "standard",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        createdAt: new Date()
      },
      {
        username: "emily.rodriguez",
        email: "emily@email.com",
        password: "password123",
        firstName: "Emily", 
        lastName: "Rodriguez",
        role: "referrer",
        tier: "standard",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        createdAt: new Date()
      },
      {
        username: "marcus.williams",
        email: "marcus@email.com",
        password: "password123",
        firstName: "Marcus",
        lastName: "Williams", 
        role: "referrer",
        tier: "standard",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        createdAt: new Date()
      },
      {
        username: "olivia.kim",
        email: "olivia@email.com",
        password: "password123", 
        firstName: "Olivia",
        lastName: "Kim",
        role: "referrer",
        tier: "premium",
        avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        createdAt: new Date()
      }
    ];

    const referrerUsers = await db.insert(users).values(users_data).returning();

    // Create business user
    const businessUser = await db.insert(users).values({
      username: "techsolutions.inc",
      email: "contact@techsolutions.com",
      password: "password123",
      firstName: "Tech",
      lastName: "Solutions",
      role: "business", 
      tier: "premium",
      avatar: null,
      createdAt: new Date()
    }).returning();

    // Create sample leads
    const leads_data = [
      {
        referrerId: referrerUsers[0].id,
        customerName: "Michael Thompson",
        customerEmail: "michael.thompson@email.com",
        service: "Home Renovation", 
        value: "2450.00",
        status: "pending",
        businessName: "Home Pro Services",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referrerId: referrerUsers[1].id,
        customerName: "Rebecca Wilson",
        customerEmail: "rebecca.wilson@email.com",
        service: "Kitchen Remodeling",
        value: "5800.00", 
        status: "approved",
        businessName: "Kitchen Masters",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referrerId: referrerUsers[2].id,
        customerName: "James Parker",
        customerEmail: "james.parker@email.com",
        service: "Bathroom Remodel",
        value: "3200.00",
        status: "approved", 
        businessName: "Bath Renovations Co",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referrerId: referrerUsers[3].id,
        customerName: "Sophia Garcia",
        customerEmail: "sophia.garcia@email.com",
        service: "Landscaping",
        value: "1850.00",
        status: "rejected",
        businessName: "Green Thumb Landscaping",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referrerId: referrerUsers[4].id,
        customerName: "Daniel Martinez", 
        customerEmail: "daniel.martinez@email.com",
        service: "Roof Repair",
        value: "2100.00",
        status: "pending",
        businessName: "Roof Masters",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const createdLeads = await db.insert(leads).values(leads_data).returning();

    // Create sample campaigns
    const campaigns_data = [
      {
        businessId: businessUser[0].id,
        name: "Summer Sale Referrals",
        description: "Promote our summer home improvement services",
        serviceArea: "home-services",
        rewardPerConversion: "25.00",
        maxBudget: "5000.00",
        startDate: new Date("2023-06-01"),
        endDate: new Date("2023-07-31"),
        postcode: { start: "10001", end: "10099" },
        status: "active",
        budgetUsed: "750.00",
        leads: 12,
        conversions: 8,
        createdAt: new Date()
      },
      {
        businessId: businessUser[0].id,
        name: "Tech Product Launch",
        description: "New technology services campaign", 
        serviceArea: "technology",
        rewardPerConversion: "40.00",
        maxBudget: "10000.00",
        startDate: new Date("2023-08-01"),
        endDate: new Date("2023-09-15"),
        postcode: { start: "20001", end: "20099" },
        status: "active",
        budgetUsed: "1200.00",
        leads: 18,
        conversions: 12,
        createdAt: new Date()
      }
    ];

    const createdCampaigns = await db.insert(campaigns).values(campaigns_data).returning();

    // Create sample disputes
    const disputes_data = [
      {
        caseId: "DR-7829",
        leadId: createdLeads[0].id,
        businessId: businessUser[0].id,
        referrerId: referrerUsers[0].id,
        businessClaim: "Client was already in our database before referral",
        referrerResponse: "Initial contact was made through my referral link",
        status: "pending",
        createdAt: new Date()
      },
      {
        caseId: "DR-7831", 
        leadId: createdLeads[1].id,
        businessId: businessUser[0].id,
        referrerId: referrerUsers[1].id,
        businessClaim: "Referral code used after direct contact was established",
        referrerResponse: "Client confirmed they found us through my social media campaign",
        status: "pending",
        createdAt: new Date()
      }
    ];

    await db.insert(disputes).values(disputes_data);

    // Create sample earnings
    const earnings_data = [
      {
        referrerId: referrerUsers[0].id,
        leadId: createdLeads[0].id,
        campaignId: createdCampaigns[0].id,
        amount: "245.00",
        status: "pending",
        createdAt: new Date()
      },
      {
        referrerId: referrerUsers[1].id,
        leadId: createdLeads[1].id,
        campaignId: createdCampaigns[0].id,
        amount: "580.00", 
        status: "paid",
        createdAt: new Date(),
        paidAt: new Date()
      },
      {
        referrerId: referrerUsers[2].id,
        leadId: createdLeads[2].id,
        campaignId: createdCampaigns[1].id,
        amount: "320.00",
        status: "paid",
        createdAt: new Date(),
        paidAt: new Date()
      }
    ];

    await db.insert(earnings).values(earnings_data);

    // Create sample activities
    const activities_data = [
      {
        userId: adminUser[0].id,
        type: "new_referrer",
        title: "New referrer joined the network",
        description: "David Smith registered through the affiliate program",
        metadata: {},
        createdAt: new Date()
      },
      {
        userId: adminUser[0].id,
        type: "payout_processed", 
        title: "Payout processed for October earnings",
        description: "$45,230 distributed to 124 referrers",
        metadata: {},
        createdAt: new Date()
      }
    ];

    await db.insert(activities).values(activities_data);

    console.log("Sample data initialization completed successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data when module loads
initializeSampleData();
