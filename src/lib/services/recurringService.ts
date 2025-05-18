import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/auth/authUtils';

// Define the FixedExpense interface based on database schema
export interface FixedExpense {
  id: number;
  user_id: string | null;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  next_date: string;
  notes: string | null;
  payment_method: string | null;
  recurring_transaction_id: number | null;
  status: string | null;
  type: string | null;
}

/**
 * Fetches all fixed/recurring expenses for the authenticated user.
 */
export const getFixedExpenses = async (): Promise<FixedExpense[]> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    console.error('User not authenticated');
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('fixed_expenses') // Assuming your table is named 'fixed_expenses'
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching fixed expenses:', error);
    throw error;
  }

  return data || [];
};

// Add other CRUD operations for fixed expenses as needed:
// export const createFixedExpense = async (expenseData: Omit<FixedExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FixedExpense | null> => { ... }
// export const updateFixedExpense = async (id: string, updates: Partial<FixedExpense>): Promise<FixedExpense | null> => { ... }
// export const deleteFixedExpense = async (id: string): Promise<void> => { ... }

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  next_date: string;
  recurring_transaction_id?: number; // Optional field for linking to recurring transactions
  user_id: string; // Add user_id field as it's required for database operations
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