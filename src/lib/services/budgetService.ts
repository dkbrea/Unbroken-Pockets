import { supabase } from '../supabase';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getAuthenticatedUserId } from '../auth/authUtils';

export interface BudgetCategory {
  id: number;
  user_id: string;
  name: string;
  allocated: number;
  spent: number;
  icon: string;
  color: string;
}

export interface BudgetEntry {
  category_id: number;
  user_id: string;
  month: string;
  allocated: number;
  spent: number;
}

export interface BudgetTransaction {
  category_id: number;
  user_id: string;
  amount: number;
  date: string;
  description: string;
}

export interface BudgetSummary {
  month: string;
  categories: BudgetCategory[];
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
}

export async function getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createBudgetCategory(category: Omit<BudgetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<BudgetCategory> {
  const { data, error } = await supabase
    .from('budget_categories')
    .insert([{ ...category, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetCategory(id: number, category: Partial<Omit<BudgetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>>, userId: string): Promise<BudgetCategory> {
  const { data, error } = await supabase
    .from('budget_categories')
    .update(category)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetCategory(id: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('budget_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getMonthlyBudgetSummary(month: Date, userId: string): Promise<BudgetSummary> {
  const startDate = startOfMonth(month);
  const endDate = endOfMonth(month);
  
  const [categories, entries, transactions] = await Promise.all([
    getBudgetCategories(userId),
    getBudgetEntriesForMonth(month, userId),
    getBudgetTransactionsForMonth(month, userId)
  ]);

  const categorySummary = categories.map(category => {
    const entry = entries.find(e => e.category_id === category.id);
    const categoryTransactions = transactions.filter(t => t.category_id === category.id);
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      ...category,
      allocated: entry?.allocated || 0,
      spent
    };
  });

  const totalAllocated = categorySummary.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = categorySummary.reduce((sum, cat) => sum + cat.spent, 0);

  return {
    month: startDate.toISOString(),
    categories: categorySummary,
    totalAllocated,
    totalSpent,
    remainingBudget: totalAllocated - totalSpent
  };
}

export async function getBudgetEntriesForMonth(month: Date, userId: string): Promise<BudgetEntry[]> {
  const startDate = startOfMonth(month);
  const endDate = endOfMonth(month);

  const { data, error } = await supabase
    .from('budget_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('month', startDate.toISOString())
    .lte('month', endDate.toISOString());

  if (error) throw error;
  return data || [];
}

export async function getBudgetTransactionsForMonth(month: Date, userId: string): Promise<BudgetTransaction[]> {
  const startDate = startOfMonth(month);
  const endDate = endOfMonth(month);

  const { data, error } = await supabase
    .from('budget_transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  if (error) throw error;
  return data || [];
}

export async function saveBudgetEntry(entry: Omit<BudgetEntry, 'user_id'>, userId: string): Promise<void> {
  console.log(`Saving budget entry for category ${entry.category_id}, month ${entry.month}, user ${userId}`);
  
  try {
    // Ensure month is in YYYY-MM-DD format for the first day of the month
    let monthStr = entry.month;
    if (monthStr.includes('T')) {
      // If it's an ISO string, extract just the date part
      monthStr = monthStr.split('T')[0];
    }
    
    const { error } = await supabase
      .from('budget_entries')
      .upsert([{ 
        ...entry, 
        month: monthStr, 
        user_id: userId 
      }]);

    if (error) {
      console.error('Error saving budget entry:', error);
      throw error;
    }
    
    console.log(`Successfully saved budget entry for category ${entry.category_id}`);
  } catch (error) {
    console.error('Error in saveBudgetEntry:', error);
    throw error;
  }
}

export async function addBudgetTransaction(transaction: Omit<BudgetTransaction, 'user_id'>, userId: string): Promise<void> {
  const { error } = await supabase
    .from('budget_transactions')
    .insert([{ ...transaction, user_id: userId }]);

  if (error) throw error;
}

export async function initializeDefaultBudgetCategories(userId: string): Promise<void> {
  const defaultCategories = [
    { name: 'Groceries', allocated: 500, spent: 0, icon: 'ShoppingCart', color: 'text-green-600 bg-green-100', user_id: userId },
    { name: 'Dining Out', allocated: 300, spent: 0, icon: 'Utensils', color: 'text-red-600 bg-red-100', user_id: userId },
    { name: 'Transportation', allocated: 200, spent: 0, icon: 'Car', color: 'text-purple-600 bg-purple-100', user_id: userId },
    { name: 'Entertainment', allocated: 150, spent: 0, icon: 'Coffee', color: 'text-yellow-600 bg-yellow-100', user_id: userId },
    { name: 'Shopping', allocated: 200, spent: 0, icon: 'ShoppingBag', color: 'text-blue-600 bg-blue-100', user_id: userId }
  ];

  const categoriesToInsert = defaultCategories.map(({ spent, ...rest }) => rest);

  const { error } = await supabase
    .from('budget_categories')
    .insert(categoriesToInsert);

  if (error) throw error;
}

export async function copyBudgetEntriesFromPreviousMonth(targetMonth: Date, sourceMonth: Date, userId: string): Promise<void> {
  const sourceEntries = await getBudgetEntriesForMonth(sourceMonth, userId);
  
  if (sourceEntries.length === 0) return;

  const targetEntries = sourceEntries.map(entry => ({
    ...entry,
    month: targetMonth.toISOString(),
    spent: 0,
    user_id: userId
  }));

  const { error } = await supabase
    .from('budget_entries')
    .upsert(targetEntries);

  if (error) throw error;
} 