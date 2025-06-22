/**
 * DATABASE SCHEMA DEFINITIONS
 * 
 * This file contains TypeScript definitions that match the Supabase database schema.
 * 
 * IMPORTANT NOTES:
 * 
 * 1. The tables "users", "leads", "campaigns", "earnings", "payouts", "payout_methods",
 *    "disputes", and "activities" reflect the real schema in the Supabase database.
 * 
 * 2. There are two user-related tables:
 *    - "user" table: The legacy user table in the database
 *    - "users" table: The Supabase Auth users table
 *    
 *    Applications should migrate to use the Supabase Auth API for user management.
 */

import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table matches the Supabase schema
export const users = pgTable("user", {
  id: uuid("id").primaryKey(),
  email: text("email").unique(),
  firstname: text("firstname"),
  lastname: text("lastname"),
  password: text("password"),
  personalizationanswers: jsonb("personalizationanswers"),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
  settings: jsonb("settings"),
  disabled: boolean("disabled").default(false).notNull(),
  mfaenabled: boolean("mfaenabled").default(false).notNull(), 
  mfasecret: text("mfasecret"),
  mfarecoverycodes: text("mfarecoverycodes"),
  role: text("role").notNull(),
  avatar: text("avatar"),
  tier: text("tier"),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  referrerId: uuid("referrer_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  service: text("service").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  businessName: text("business_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  businessId: uuid("business_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  rewardPerConversion: decimal("reward_per_conversion", { precision: 10, scale: 2 }).notNull(),
  maxBudget: decimal("max_budget", { precision: 10, scale: 2 }).notNull(),
  budgetUsed: decimal("budget_used", { precision: 10, scale: 2 }).default("0"),
  leads: integer("leads").default(0),
  conversions: integer("conversions").default(0),
  status: text("status").default("active"), // active, paused, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  serviceArea: text("service_area"),
  postcodeStart: text("postcode_start"),
  postcodeEnd: text("postcode_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  referrerId: uuid("referrer_id").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  status: text("status").notNull(),
  reference: text("reference"),
});

export const payoutMethods = pgTable("payout_methods", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(),
  details: jsonb("details"),
  isDefault: boolean("is_default").default(false),
});

// Defining the Supabase auth users table
export const supabaseUsers = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  role: text("role").default("referrer").notNull(),
  tier: text("tier").default("standard"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
// DEPRECATED: Use Supabase Auth API for user management instead
export const insertUserSchema = createInsertSchema(supabaseUsers).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  budgetUsed: true,
  leads: true,
  conversions: true,
  createdAt: true,
});

export const insertEarningSchema = createInsertSchema(earnings).omit({
  id: true,
  paidAt: true,
  createdAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
});

export const insertPayoutMethodSchema = createInsertSchema(payoutMethods).omit({
  id: true,
});

// ======================================================
// TEMPORARY DEFINITIONS FOR COMPATIBILITY WITH EXISTING CODE
// These tables don't exist in the actual Supabase database,
// but are needed for backward compatibility with existing code
// ======================================================

// Disputes table schema matching the Supabase database
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  caseId: text("case_id").notNull(),
  referrerId: uuid("referrer_id").references(() => users.id),
  businessId: uuid("business_id").references(() => users.id),
  adminId: uuid("admin_id").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
  businessClaim: text("business_claim").notNull(),
  referrerResponse: text("referrer_response"),
  status: text("status").default("pending").notNull(),
  decision: text("decision"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  evidence: jsonb("evidence"),
});

// Activities table schema matching the Supabase database
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Updated insert schemas for disputes and activities
export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
  evidence: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  metadata: true,
});

// Types based on our Supabase schema
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// User types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof supabaseUsers.$inferSelect;

export type InsertPayoutMethod = z.infer<typeof insertPayoutMethodSchema>;
export type PayoutMethod = typeof payoutMethods.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earnings.$inferSelect;

export type InsertPayout = z.infer<typeof insertPayoutSchema>;
export type Payout = typeof payouts.$inferSelect;
