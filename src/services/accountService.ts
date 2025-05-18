import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/auth/authUtils';

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  next_date: string;
}

export async function getIncomeSources(): Promise<IncomeSource[]> {
  try {
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading income sources:', error);
    throw error;
  }
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  user_id: string;
}

export async function getAccounts(): Promise<Account[]> {
  try {
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading accounts:', error);
    throw error;
  }
}

export async function updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();
    const { error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating account balance:', error);
    throw error;
  }
} 