import { createClient } from '@/lib/supabase/client';
import { format, startOfMonth, parseISO, subMonths } from 'date-fns';

// Types for budget service
export type BudgetCategory = {
  id: number;
  name: string;
  allocated: number;
  spent: number;
  icon: string;
  color: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type BudgetEntry = {
  id?: number;
  category_id: number;
  month: string; // ISO date string for first day of month
  allocated: number;
  spent: number;
  user_id?: string;
};

export type BudgetTransaction = {
  id?: number;
  transaction_id?: number;
  category_id: number;
  amount: number;
  date: string; // ISO date string
  description?: string;
  user_id?: string;
};

export type MonthlyBudgetSummary = {
  month: string;
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  categories: {
    id: number;
    name: string;
    allocated: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    icon: string;
    color: string;
  }[];
};

// Get the current user ID
export const getCurrentUserId = async (): Promise<string> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error('Error getting current user: ' + error.message);
  }
  
  if (!data.user) {
    throw new Error('No authenticated user found');
  }
  
  return data.user.id;
};

// Get all budget categories for the current user
export const getBudgetCategories = async (): Promise<BudgetCategory[]> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching budget categories:', error);
    throw new Error(error.message || 'Failed to fetch budget categories');
  }
};

// Create a new budget category
export const createBudgetCategory = async (category: Omit<BudgetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<BudgetCategory> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('budget_categories')
      .insert({
        ...category,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating budget category:', error);
    throw new Error(error.message || 'Failed to create budget category');
  }
};

// Update a budget category
export const updateBudgetCategory = async (id: number, category: Partial<BudgetCategory>): Promise<BudgetCategory> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Remove properties that shouldn't be updated directly
    const { id: _, user_id: __, created_at: ___, updated_at: ____, ...updateData } = category;
    
    const { data, error } = await supabase
      .from('budget_categories')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating budget category:', error);
    throw new Error(error.message || 'Failed to update budget category');
  }
};

// Delete a budget category
export const deleteBudgetCategory = async (id: number): Promise<boolean> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error deleting budget category:', error);
    throw new Error(error.message || 'Failed to delete budget category');
  }
};

// Get budget entries for a specific month
export const getBudgetEntriesForMonth = async (month: Date): Promise<BudgetEntry[]> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Format to first day of month
    const monthStart = startOfMonth(month).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('budget_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('month', monthStart);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching budget entries:', error);
    throw new Error(error.message || 'Failed to fetch budget entries');
  }
};

// Create or update a budget entry for a category and month
export const saveBudgetEntry = async (entry: Omit<BudgetEntry, 'id' | 'user_id'>): Promise<BudgetEntry> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Format month to ensure it's the first day of month
    const monthDate = typeof entry.month === 'string' 
      ? startOfMonth(parseISO(entry.month))
      : startOfMonth(new Date(entry.month));
    
    const formattedMonth = monthDate.toISOString().split('T')[0];
    
    // Check if entry already exists
    const { data: existingEntries, error: fetchError } = await supabase
      .from('budget_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', entry.category_id)
      .eq('month', formattedMonth);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (existingEntries && existingEntries.length > 0) {
      // Update existing entry
      const { data, error } = await supabase
        .from('budget_entries')
        .update({
          allocated: entry.allocated,
          spent: entry.spent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingEntries[0].id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('budget_entries')
        .insert({
          category_id: entry.category_id,
          month: formattedMonth,
          allocated: entry.allocated,
          spent: entry.spent,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    }
  } catch (error: any) {
    console.error('Error saving budget entry:', error);
    throw new Error(error.message || 'Failed to save budget entry');
  }
};

// Add a transaction and update the corresponding budget entry
export const addBudgetTransaction = async (transaction: Omit<BudgetTransaction, 'id' | 'user_id'>): Promise<BudgetTransaction> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Start a transaction
    const { data, error } = await supabase
      .from('budget_transactions')
      .insert({
        ...transaction,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Update the budget entry for the month of this transaction
    const transactionDate = parseISO(transaction.date);
    const monthStart = startOfMonth(transactionDate).toISOString().split('T')[0];
    
    // Check if entry exists for this month and category
    const { data: existingEntries, error: fetchError } = await supabase
      .from('budget_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', transaction.category_id)
      .eq('month', monthStart);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (existingEntries && existingEntries.length > 0) {
      // Update existing entry
      const entry = existingEntries[0];
      const newSpent = entry.spent + transaction.amount;
      
      await supabase
        .from('budget_entries')
        .update({
          spent: newSpent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id)
        .eq('user_id', userId);
    } else {
      // Create new entry with default allocation
      await supabase
        .from('budget_entries')
        .insert({
          category_id: transaction.category_id,
          month: monthStart,
          allocated: 0, // Default allocation
          spent: transaction.amount,
          user_id: userId,
        });
    }
    
    return data;
  } catch (error: any) {
    console.error('Error adding budget transaction:', error);
    throw new Error(error.message || 'Failed to add budget transaction');
  }
};

// Get monthly budget summary (categories with allocation and spending)
export const getMonthlyBudgetSummary = async (month: Date): Promise<MonthlyBudgetSummary> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Get first day of month
    const monthStart = startOfMonth(month);
    const formattedMonth = monthStart.toISOString().split('T')[0];
    
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', userId);
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    // Get budget entries for the month
    const { data: entries, error: entriesError } = await supabase
      .from('budget_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('month', formattedMonth);
    
    if (entriesError) {
      throw entriesError;
    }
    
    // Map entries to categories
    const categoriesWithBudgets = categories.map(category => {
      const entry = entries?.find(e => e.category_id === category.id);
      
      const allocated = entry ? entry.allocated : 0;
      const spent = entry ? entry.spent : 0;
      const remaining = allocated - spent;
      const percentUsed = allocated > 0 ? (spent / allocated) * 100 : 0;
      
      return {
        id: category.id,
        name: category.name,
        allocated,
        spent,
        remaining,
        percentUsed,
        icon: category.icon,
        color: category.color,
      };
    });
    
    // Calculate totals
    const totalAllocated = categoriesWithBudgets.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = categoriesWithBudgets.reduce((sum, cat) => sum + cat.spent, 0);
    const remainingBudget = totalAllocated - totalSpent;
    
    return {
      month: format(monthStart, 'MMMM yyyy'),
      totalAllocated,
      totalSpent,
      remainingBudget,
      categories: categoriesWithBudgets,
    };
  } catch (error: any) {
    console.error('Error fetching monthly budget summary:', error);
    throw new Error(error.message || 'Failed to fetch budget summary');
  }
};

// Initialize default budget categories for a new user
export const initializeDefaultBudgetCategories = async (): Promise<void> => {
  try {
    const defaultCategories = [
      { 
        name: 'Groceries', 
        allocated: 500, 
        spent: 0, 
        icon: 'ShoppingCart',
        color: 'text-green-600 bg-green-100' 
      },
      { 
        name: 'Dining Out', 
        allocated: 300, 
        spent: 0, 
        icon: 'Utensils',
        color: 'text-red-600 bg-red-100' 
      },
      { 
        name: 'Transportation', 
        allocated: 200, 
        spent: 0, 
        icon: 'Car',
        color: 'text-purple-600 bg-purple-100' 
      },
      { 
        name: 'Entertainment', 
        allocated: 150, 
        spent: 0, 
        icon: 'Film',
        color: 'text-yellow-600 bg-yellow-100' 
      },
      { 
        name: 'Shopping', 
        allocated: 200, 
        spent: 0, 
        icon: 'ShoppingBag',
        color: 'text-blue-600 bg-blue-100' 
      },
      { 
        name: 'Personal Care', 
        allocated: 100, 
        spent: 0, 
        icon: 'Heart',
        color: 'text-pink-600 bg-pink-100' 
      },
      { 
        name: 'Miscellaneous', 
        allocated: 150, 
        spent: 0, 
        icon: 'MoreHorizontal',
        color: 'text-gray-600 bg-gray-100' 
      }
    ];
    
    // Create each category
    for (const category of defaultCategories) {
      await createBudgetCategory(category);
    }
    
  } catch (error: any) {
    console.error('Error initializing default budget categories:', error);
    throw new Error(error.message || 'Failed to initialize default categories');
  }
};

// Copy budget entries from previous month to target month
export const copyBudgetEntriesFromPreviousMonth = async (targetMonth: Date, sourceMonth?: Date): Promise<boolean> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();
    
    // Determine source month (default to previous month if not specified)
    const actualSourceMonth = sourceMonth || subMonths(targetMonth, 1);
    
    // Format to first day of months
    const sourceMonthStart = startOfMonth(actualSourceMonth).toISOString().split('T')[0];
    const targetMonthStart = startOfMonth(targetMonth).toISOString().split('T')[0];
    
    // Get entries from source month
    const { data: sourceEntries, error: sourceError } = await supabase
      .from('budget_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('month', sourceMonthStart);
    
    if (sourceError) {
      console.error('Error fetching source month entries:', sourceError);
      return false;
    }
    
    // If no entries in source month, nothing to copy
    if (!sourceEntries || sourceEntries.length === 0) {
      console.log('No entries to copy from source month');
      return false;
    }
    
    // Check if target month already has entries
    const { data: existingEntries, error: checkError } = await supabase
      .from('budget_entries')
      .select('category_id')
      .eq('user_id', userId)
      .eq('month', targetMonthStart);
    
    if (checkError) {
      console.error('Error checking target month entries:', checkError);
      return false;
    }
    
    // If target month already has entries, we'll only copy entries for categories that don't exist
    const existingCategoryIds = new Set((existingEntries || []).map(entry => entry.category_id));
    
    // Filter source entries to only include those for categories not already in target month
    const entriesToCopy = sourceEntries.filter(entry => !existingCategoryIds.has(entry.category_id));
    
    if (entriesToCopy.length === 0) {
      console.log('All categories already exist in target month');
      return false;
    }
    
    // Prepare entries for insertion - keep allocations but reset spent to 0
    const newEntries = entriesToCopy.map(entry => ({
      category_id: entry.category_id,
      month: targetMonthStart,
      allocated: entry.allocated,
      spent: 0, // Reset spent amount for the new month
      user_id: userId
    }));
    
    // Insert new entries
    const { error: insertError } = await supabase
      .from('budget_entries')
      .insert(newEntries);
    
    if (insertError) {
      console.error('Error copying budget entries:', insertError);
      return false;
    }
    
    console.log(`Successfully copied ${newEntries.length} budget entries from ${sourceMonthStart} to ${targetMonthStart}`);
    return true;
  } catch (error: any) {
    console.error('Error in copyBudgetEntriesFromPreviousMonth:', error);
    return false;
  }
}; 