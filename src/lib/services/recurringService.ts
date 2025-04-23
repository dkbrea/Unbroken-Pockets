import { createClient } from '@/lib/supabase/client';
import { getUserData } from './userDataService';

export interface RecurringTransaction {
  id: number;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  next_date: string;
  type: 'expense' | 'income' | 'debt';
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FixedExpense {
  id: number;
  name: string;
  amount: number;
  category: string;
  next_date: string;
  frequency: string;
  recurring_transaction_id: number;
  description?: string;
}

export interface IncomeSource {
  id: number;
  name: string;
  amount: number;
  category: string;
  next_date: string;
  frequency: string;
  recurring_transaction_id: number;
  description?: string;
}

// Define the shape of joined data from Supabase
interface FixedExpenseJoinRow {
  id: number;
  recurring_transaction_id: number;
  r: {
    name: string;
    amount: number;
    category: string;
    next_date: string;
    frequency: string;
    description?: string;
    type?: string;
  } | null;
}

interface IncomeSourceJoinRow {
  id: number;
  recurring_transaction_id: number;
  r: {
    name: string;
    amount: number;
    category: string;
    next_date: string;
    frequency: string;
    description?: string;
    type?: string;
  } | null;
}

const RECURRING_TABLE = 'recurring_transactions';
const FIXED_EXPENSES_TABLE = 'fixed_expenses';
const INCOME_TABLE = 'income_sources';

/**
 * Get all recurring transactions for the current user
 * @param type Optional filter by type (expense, income, debt)
 * @returns Array of recurring transactions
 */
export async function getRecurringTransactions(type?: 'expense' | 'income' | 'debt'): Promise<RecurringTransaction[]> {
  try {
    console.log(`Fetching recurring transactions ${type ? `of type: ${type}` : 'all types'}`);
    
    const filters: Record<string, any> = {};
    if (type) {
      filters.type = type;
    }
    
    const data = await getUserData(RECURRING_TABLE, {
      order: { column: 'next_date', ascending: true },
      filters
    });
    
    console.log(`Retrieved ${data.length} recurring transactions`);
    return data as unknown as RecurringTransaction[];
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    return [];
  }
}

/**
 * Get all fixed expenses with their recurring transaction data
 * @returns Array of fixed expenses
 */
export async function getFixedExpenses(): Promise<FixedExpense[]> {
    try {
      const supabase = createClient();
  
      const { data, error } = await supabase
        .from(FIXED_EXPENSES_TABLE)
        .select(`
          id,
          recurring_transaction_id,
          r:recurring_transactions (
            name,
            amount,
            category,
            next_date,
            frequency,
            description,
            type
          )
        `);
  
      if (error) throw error;
      if (!data || !Array.isArray(data)) return [];
  
      // 🧠 Filter manually in JS
      const filtered = (data as unknown as FixedExpenseJoinRow[]).filter(item => item.r && item.r.type === 'expense');
  
      const formattedData: FixedExpense[] = filtered.map(item => ({
        id: item.id,
        recurring_transaction_id: item.recurring_transaction_id,
        name: item.r?.name || 'Unknown',
        amount: item.r?.amount || 0,
        category: item.r?.category || 'Uncategorized',
        next_date: item.r?.next_date || new Date().toISOString().split('T')[0],
        frequency: item.r?.frequency || 'Monthly',
        description: item.r?.description
      }));
  
      console.log(`Retrieved ${formattedData.length} fixed expenses`);
      return formattedData;
    } catch (error) {
      console.error('Error fetching fixed expenses:', error);
      return [];
    }
  }
  

/**
 * Get all income sources with their recurring transaction data
 * @returns Array of income sources
 */
export async function getIncomeSources(): Promise<IncomeSource[]> {
    try {
      console.log('Fetching income sources');
      
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from(INCOME_TABLE)
        .select(`
          id,
          recurring_transaction_id,
          r:recurring_transactions (
            name,
            amount,
            category,
            next_date,
            frequency,
            description,
            type
          )
        `);
  
      if (error) throw error;
      if (!data || !Array.isArray(data)) return [];
  
      // ✅ Manually filter on `type`
      const filtered = (data as unknown as IncomeSourceJoinRow[]).filter(item => item.r && item.r.type === 'income');
  
      const formattedData: IncomeSource[] = filtered.map(item => ({
        id: item.id,
        recurring_transaction_id: item.recurring_transaction_id,
        name: item.r?.name || 'Unknown',
        amount: item.r?.amount || 0,
        category: item.r?.category || 'Uncategorized',
        next_date: item.r?.next_date || new Date().toISOString().split('T')[0],
        frequency: item.r?.frequency || 'Monthly',
        description: item.r?.description
      }));
  
      console.log(`Retrieved ${formattedData.length} income sources`);
      return formattedData;
    } catch (error) {
      console.error('Error fetching income sources:', error);
      return [];
    }
  }
  