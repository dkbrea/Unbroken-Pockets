import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/auth/authUtils';

// Define the FinancialGoal type based on common fields and dashboard GoalFormModal
export interface FinancialGoal {
  id: string; // Or number, depending on your DB schema
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string; // ISO date string
  icon?: string;
  color?: string;
  status?: 'active' | 'achieved' | 'paused' | 'cancelled';
  notes?: string;
  contribution_amount?: number;
  contribution_frequency?: 'onetime' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

/**
 * Fetches all financial goals for the authenticated user.
 */
export const getFinancialGoals = async (): Promise<FinancialGoal[]> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching financial goals:', error);
    throw error;
  }
  return data || [];
};

/**
 * Creates a new financial goal.
 */
export const createFinancialGoal = async (goalData: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FinancialGoal> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('financial_goals')
    .insert([{ ...goalData, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating financial goal:', error);
    throw error;
  }
  return data;
};

/**
 * Updates an existing financial goal.
 */
export const updateFinancialGoal = async (id: string, updates: Partial<Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<FinancialGoal> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('financial_goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId) // Ensure user can only update their own goals
    .select()
    .single();

  if (error) {
    console.error('Error updating financial goal:', error);
    throw error;
  }
  if (!data) {
    throw new Error('Financial goal not found or user unauthorized to update.');
  }
  return data;
};

/**
 * Deletes a financial goal.
 */
export const deleteFinancialGoal = async (id: string): Promise<void> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('financial_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Ensure user can only delete their own goals

  if (error) {
    console.error('Error deleting financial goal:', error);
    throw error;
  }
}; 