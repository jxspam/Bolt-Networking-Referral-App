import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

/**
 * User profile data from auth metadata
 */
export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'referrer' | 'business' | 'admin';
  tier: 'standard' | 'premium' | null;
  avatar: string | null;
  created_at: string | null;
}

/**
 * Get the user profile from Supabase Auth metadata
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error("Error getting user:", error);
    return null;
  }

  return formatUserProfile(user);
};

/**
 * Format the user data from Supabase Auth into a UserProfile object
 */
export const formatUserProfile = (user: User): UserProfile => {
  const metadata = user.user_metadata;
  
  return {
    id: user.id,
    email: user.email || '',
    username: metadata?.username || null,
    first_name: metadata?.first_name || null,
    last_name: metadata?.last_name || null,
    role: metadata?.role || 'referrer',
    tier: metadata?.tier || 'standard',
    avatar: metadata?.avatar || null,
    created_at: metadata?.created_at || user.created_at,
  };
};

/**
 * Update user profile metadata
 */
export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error || !data.user) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return formatUserProfile(data.user);
};
