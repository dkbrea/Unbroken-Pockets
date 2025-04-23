import { createClient } from '@/lib/supabase/client';
import { getCurrentUserId } from './accountService';

export interface FinancialGoal {
  id: number;
  name: string;
  current_amount: number;
  target_amount: number;
  target_date?: string;
  category?: string;
  color?: string;
  icon?: string;
  contribution_frequency?: string;
  contribution_amount?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all financial goals for the current user
 * @returns Array of financial goals
 */
export async function getFinancialGoals(): Promise<FinancialGoal[]> {
  try {
    console.log('Fetching financial goals for current user');
    const supabase = createClient();
    
    // Get user ID consistently
    const userId = await getCurrentUserId();
    console.log('Current user ID for financial goals query:', userId);
    
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching financial goals:', error);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} financial goals`);
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching financial goals:', error);
    return [];
  }
}

/**
 * Create a new financial goal
 * @param goalData The goal data to be saved
 * @returns The newly created goal
 */
export async function createFinancialGoal(goalData: Omit<FinancialGoal, 'id' | 'user_id'>): Promise<FinancialGoal | null> {
  try {
    console.log('Creating financial goal with data:', goalData);
    const supabase = createClient();
    
    // Get current user ID
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        ...goalData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating financial goal:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error creating financial goal:', error);
    return null;
  }
}

/**
 * Update an existing financial goal
 * @param id The ID of the goal to update
 * @param goalData The updated goal data
 * @returns The updated goal
 */
export async function updateFinancialGoal(id: number, goalData: Partial<FinancialGoal>): Promise<FinancialGoal | null> {
  try {
    console.log(`Updating financial goal ${id} with data:`, goalData);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('financial_goals')
      .update({
        ...goalData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating financial goal:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating financial goal:', error);
    return null;
  }
}

/**
 * Delete a financial goal
 * @param id The ID of the goal to delete
 * @returns True if successful, false otherwise
 */
export async function deleteFinancialGoal(id: number): Promise<boolean> {
  try {
    console.log(`Deleting financial goal ${id}`);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting financial goal:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting financial goal:', error);
    return false;
  }
} 