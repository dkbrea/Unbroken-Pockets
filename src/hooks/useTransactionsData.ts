'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseISO, startOfMonth, format } from 'date-fns';

export type Transaction = {
  id: number;
  date: string;
  name: string;
  category: string;
  amount: number;
  account: string;
  logo?: string;
  isReconciled?: boolean;
  notes?: string;
  tags?: string[];
  debt_id?: number;
  user_id?: string;
  is_debt_transaction?: boolean;
  budget_category_id?: number;
  is_budget_expense?: boolean;
};

export type TransactionFilter = {
  dateRange: string;
  accounts: string[];
  categories: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
  searchQuery: string;
  transactionType: 'all' | 'income' | 'expense';
};

export type TransactionsState = {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  recentTransactions: Transaction[];
  filter: TransactionFilter;
  isLoading: boolean;
  setFilter: (filter: Partial<TransactionFilter>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: number, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: number) => void;
  reconcileTransaction: (id: number, isReconciled: boolean) => void;
  refetchTransactions: () => Promise<boolean>;
  updateAllBudgetEntriesFromTransactions: () => Promise<void>;
};

export function useTransactionsData(): TransactionsState {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const [filter, setFilterState] = useState<TransactionFilter>({
    dateRange: 'This month',
    accounts: [],
    categories: [],
    amountRange: {
      min: null,
      max: null,
    },
    searchQuery: '',
    transactionType: 'all',
  });

    // Function to trigger a refresh
    const handleRefresh = async () => {
      console.log('Transaction data refresh triggered');
      // Immediate re-fetch from database
      await loadTransactionsFromDB();
      // Also update the refresh counter
      setRefreshCount(prev => prev + 1);
    };


  // Separate the database fetch function so it can be called directly
  const loadTransactionsFromDB = async () => {
    // If already refreshing, don't start another refresh
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      console.log('Loading transactions from Supabase...');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error loading transactions:', error);
        return false;
      }
      
      if (!data || data.length === 0) {
        console.log('No transactions found in Supabase');
        setTransactions([]);
        return true;
      }
      
      // Transform data to match our Transaction type
      const formattedTransactions: Transaction[] = data.map(transaction => ({
        id: transaction.id,
        date: transaction.date,
        name: transaction.name,
        category: transaction.category,
        amount: transaction.amount,
        account: transaction.account,
        logo: transaction.logo || '/logos/default.png',
        isReconciled: transaction.is_reconciled,
        notes: transaction.notes,
        tags: transaction.tags || [],
        debt_id: transaction.debt_id,
        user_id: transaction.user_id,
        is_debt_transaction: transaction.is_debt_transaction,
        budget_category_id: transaction.budget_category_id,
        is_budget_expense: transaction.is_budget_expense
      }));
      
      console.log('Loaded transactions:', formattedTransactions.length);
      setTransactions(formattedTransactions);
      return true;
    } catch (err) {
      console.error('Unexpected error loading transactions:', err);
      return false;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load transactions from Supabase whenever refreshCount changes
  useEffect(() => {
    loadTransactionsFromDB();
  }, [refreshCount]);

  // Update filter with partial changes
  const setFilter = useCallback((updates: Partial<TransactionFilter>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  // Filter transactions based on current filter settings
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by search query
      if (filter.searchQuery && !transaction.name.toLowerCase().includes(filter.searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by transaction type
      if (filter.transactionType === 'income' && transaction.amount <= 0) {
        return false;
      }
      if (filter.transactionType === 'expense' && transaction.amount > 0) {
        return false;
      }

      // Filter by account
      if (filter.accounts.length > 0 && !filter.accounts.includes(transaction.account)) {
        return false;
      }

      // Filter by category
      if (filter.categories.length > 0 && !filter.categories.includes(transaction.category)) {
        return false;
      }

      // Filter by amount range
      if (filter.amountRange.min !== null && Math.abs(transaction.amount) < filter.amountRange.min) {
        return false;
      }
      if (filter.amountRange.max !== null && Math.abs(transaction.amount) > filter.amountRange.max) {
        return false;
      }

      // Include transaction if it passes all filters
      return true;
    });
  }, [transactions, filter]);

  // Get the 5 most recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Helper function to synchronize budget_transactions with the main transactions table
  const syncBudgetTransactions = async (categoryId: number, userId: string, date: string) => {
    try {
      // Get the month from the transaction date
      const transactionDate = parseISO(date);
      const monthStart = startOfMonth(transactionDate);
      const monthFormatted = format(monthStart, 'yyyy-MM-dd');
      
      // Get all transactions for this category and month
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, amount, date')
        .eq('budget_category_id', categoryId)
        .eq('user_id', userId)
        .gte('date', monthFormatted)
        .lt('date', format(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1), 'yyyy-MM-dd'));
      
      if (transactionsError) {
        throw transactionsError;
      }
      
      if (!transactions || transactions.length === 0) {
        console.log(`No transactions found for category ${categoryId} in month ${monthFormatted}`);
        return;
      }
      
      console.log(`Syncing ${transactions.length} transactions for category ${categoryId} in month ${monthFormatted}`);
      
      // For each transaction, ensure it has a corresponding budget_transaction entry
      for (const transaction of transactions) {
        const { data: existingBudgetTransaction } = await supabase
          .from('budget_transactions')
          .select('id')
          .eq('transaction_id', transaction.id)
          .eq('user_id', userId)
          .single();
          
        if (!existingBudgetTransaction) {
          // Create a new budget_transaction entry
          await supabase
            .from('budget_transactions')
            .insert({
              transaction_id: transaction.id,
              category_id: categoryId,
              amount: transaction.amount,
              date: transaction.date,
              user_id: userId
            });
            
            console.log(`Created new budget_transaction for transaction ${transaction.id}`);
        }
      }
      
      // Update the budget entries for this month and category
      await updateBudgetEntryForMonth(categoryId, userId, monthFormatted);
      
    } catch (error) {
      console.error('Error in syncBudgetTransactions:', error);
    }
  };
  
  // Helper function to update budget entries based on budget_transactions
  const updateBudgetEntryForMonth = async (categoryId: number, userId: string, monthFormatted: string) => {
    try {
      // Calculate total amount from budget_transactions for this month and category
      // For budget purposes, we need to extract all transactions for the given month
      const monthDate = new Date(monthFormatted);
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthFormatted = format(nextMonth, 'yyyy-MM-dd');
      
      // Query budget_transactions for the specific category, user, and month range
      const { data: budgetTransactions, error: transactionsError } = await supabase
        .from('budget_transactions')
        .select('amount')
        .eq('category_id', categoryId)
        .eq('user_id', userId)
        .gte('date', monthFormatted)
        .lt('date', nextMonthFormatted);
      
      if (transactionsError) {
        console.error('Error fetching budget transactions:', transactionsError);
        throw transactionsError;
      }
      
      // Sum up all transaction amounts
      const totalAmount = budgetTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      console.log(`Total amount for category ${categoryId} in month ${monthFormatted}: ${totalAmount} (from ${budgetTransactions?.length || 0} transactions)`);
      
      // Check if a budget entry exists for this month and category
      const { data: existingEntries, error: entriesError } = await supabase
        .from('budget_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('user_id', userId)
        .eq('month', monthFormatted);
      
      if (entriesError) {
        console.error('Error fetching budget entries:', entriesError);
        throw entriesError;
      }
      
      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry - only update the spent amount
        // Don't modify the allocated amount which is set by the user
        await supabase
          .from('budget_entries')
          .update({
            spent: totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntries[0].id);
          
        console.log(`Updated budget entry (ID: ${existingEntries[0].id}) with spent amount: ${totalAmount} from budget_transactions`);
      } else {
        // Create new entry with default allocation and the calculated spent amount
        await supabase
          .from('budget_entries')
          .insert({
            category_id: categoryId,
            month: monthFormatted,
            allocated: 0, // Default allocation
            spent: totalAmount,
            user_id: userId
          });
          
        console.log(`Created new budget entry for category ${categoryId} with spent amount: ${totalAmount} from budget_transactions`);
      }
    } catch (error) {
      console.error('Error in updateBudgetEntryForMonth:', error);
    }
  };
  
  // Directly update a budget entry with the total from budget_transactions
  const updateAllBudgetEntriesFromTransactions = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      
      // Get all existing budget entries to update
      const { data: budgetEntries, error: entriesError } = await supabase
        .from('budget_entries')
        .select('id, category_id, month')
        .eq('user_id', user.id);
        
      if (entriesError) {
        throw entriesError;
      }
      
      if (!budgetEntries || budgetEntries.length === 0) {
        console.log('No budget entries to update');
        return;
      }
      
      console.log(`Updating ${budgetEntries.length} budget entries...`);
      
      // Update each budget entry with the correct amount from budget_transactions
      for (const entry of budgetEntries) {
        await updateBudgetEntryForMonth(entry.category_id, user.id, entry.month);
      }
      
      console.log('Budget entries update completed');
    } catch (error) {
      console.error('Error updating budget entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD operations
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    try {
      // If the transaction has a budget_category_id, set is_budget_expense to true
      if (transaction.budget_category_id) {
        transaction.is_budget_expense = true;
      }
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return null;
      }
      
      // Set the user_id for the transaction
      const transactionWithUser = {
        ...transaction,
        user_id: user.id
      };
      
      console.log('Adding transaction:', transactionWithUser);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionWithUser])
        .select();
      
      if (error) {
        console.error('Error adding transaction:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        // Create a properly typed transaction object
        const newTransaction: Transaction = {
          id: data[0].id,
          date: data[0].date,
          name: data[0].name,
          category: data[0].category,
          amount: data[0].amount,
          account: data[0].account,
          logo: data[0].logo || '/logos/default.png',
          isReconciled: data[0].is_reconciled,
          notes: data[0].notes,
          tags: data[0].tags || [],
          debt_id: data[0].debt_id,
          user_id: data[0].user_id,
          is_debt_transaction: data[0].is_debt_transaction,
          budget_category_id: data[0].budget_category_id,
          is_budget_expense: data[0].is_budget_expense
        };
        
        // Update budget_transactions table if it's a variable expense with budget_category_id
        if (data[0].budget_category_id) {
          try {
            // Get the month from the transaction date
            const transactionDate = parseISO(data[0].date);
            const monthStart = startOfMonth(transactionDate).toISOString().split('T')[0];
            
            // Insert into budget_transactions
            await supabase
              .from('budget_transactions')
              .insert({
                transaction_id: data[0].id,
                category_id: data[0].budget_category_id,
                amount: data[0].amount,
                date: data[0].date,
                description: data[0].name,
                user_id: user.id
              });
            
            console.log('Budget transaction entry created for transaction:', data[0].id);
            
            // Sync other transactions in the same month and category
            await syncBudgetTransactions(data[0].budget_category_id, user.id, data[0].date);
          } catch (budgetError) {
            console.error('Error updating budget_transactions:', budgetError);
            // Continue with the transaction creation even if budget update fails
          }
        }
        
        // IMMEDIATE STATE UPDATE: Add to local state right away to show immediate feedback
        console.log('Immediately updating local state with new transaction');
        setTransactions(prev => {
          // Add the new transaction and sort by date (newest first)
          const updatedTransactions = [...prev, newTransaction];
          return updatedTransactions.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
        
        return newTransaction; // Return the newly created transaction
      }

      return null; // Return null if data is empty
    } catch (error) {
      console.error('Error in addTransaction logic:', error);
      return null; // Return null on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: number, updates: Partial<Transaction>) => {
    setIsLoading(true);
    try {
      // If budget_category_id is being set, also set is_budget_expense to true
      if ('budget_category_id' in updates && updates.budget_category_id) {
        updates.is_budget_expense = true;
      }
      
      // If budget_category_id is being explicitly set to null, also set is_budget_expense to false
      if ('budget_category_id' in updates && updates.budget_category_id === null) {
        updates.is_budget_expense = false;
      }
      
      // First, fetch the existing transaction to check if it has a budget_category_id
      const { data: existingTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching transaction for update:', fetchError);
        return;
      }
      
      // Convert isReconciled to is_reconciled for Supabase
      const supabaseUpdates: any = { ...updates };
      if ('isReconciled' in updates) {
        supabaseUpdates.is_reconciled = updates.isReconciled;
        delete supabaseUpdates.isReconciled;
      }
      
      // Update the transaction
      const { error } = await supabase
        .from('transactions')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating transaction:', error);
        return;
      }
      
      // Handle budget_transactions updates for transactions with budget_category_id
      const budgetCategoryId = 
        'budget_category_id' in updates 
          ? updates.budget_category_id 
          : existingTransaction?.budget_category_id;
      
      if (budgetCategoryId) {
        try {
          // If date or amount is being updated, we need to update budget_transactions
          if ('date' in updates || 'amount' in updates) {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            
            if (!userId) {
              throw new Error('User not authenticated');
            }
            
            // Check if a budget_transaction entry already exists
            const { data: existingBudgetTransaction } = await supabase
              .from('budget_transactions')
              .select('id')
              .eq('transaction_id', id)
              .eq('user_id', userId)
              .single();
              
            const date = 'date' in updates ? updates.date : existingTransaction.date;
            const amount = 'amount' in updates ? updates.amount : existingTransaction.amount;
            const description = 'name' in updates ? updates.name : existingTransaction.name;
            
            if (existingBudgetTransaction) {
              // Update existing budget_transaction
              await supabase
                .from('budget_transactions')
                .update({
                  amount: amount,
                  date: date,
                  description: description,
                  category_id: budgetCategoryId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingBudgetTransaction.id)
                .eq('user_id', userId);
            } else {
              // Create new budget_transaction if it doesn't exist
              await supabase
                .from('budget_transactions')
                .insert({
                  transaction_id: id,
                  category_id: budgetCategoryId,
                  amount: amount,
                  date: date,
                  description: description || existingTransaction.name,
                  user_id: userId
                });
            }
            
            console.log('Budget transaction updated for transaction:', id);
            
            // Sync other transactions in the same month and category
            await syncBudgetTransactions(budgetCategoryId, userId, date);
          }
        } catch (budgetError) {
          console.error('Error updating budget_transactions:', budgetError);
          // Continue with the transaction update even if budget update fails
        }
      }
      
      // Update our local state
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      ));
    } catch (err) {
      console.error('Unexpected error updating transaction:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      // First, fetch the transaction to see if it has a budget_category_id
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching transaction for deletion:', fetchError);
      }
      
      // If it has a budget_category_id, we need to handle budget syncing
      if (transaction?.budget_category_id && transaction?.is_budget_expense) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id;
          
          if (userId) {
            // Store the category and month information before deleting
            const categoryId = transaction.budget_category_id;
            const transactionDate = parseISO(transaction.date);
            const monthStart = startOfMonth(transactionDate).toISOString().split('T')[0];
            
            // First, delete the transaction (this should trigger the database trigger)
            const { error } = await supabase
              .from('transactions')
              .delete()
              .eq('id', id);
            
            if (error) {
              console.error('Error deleting transaction:', error);
              return;
            }
            
            // Update our local state
            setTransactions(prev => prev.filter(transaction => transaction.id !== id));
            return; // Early return since we've already deleted the transaction
          }
        } catch (budgetError) {
          console.error('Error handling budget sync on delete:', budgetError);
          // Continue with the transaction deletion even if budget sync fails
        }
      }
      
      // Standard delete if not a budget transaction
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting transaction:', error);
        return;
      }
      
      // Update our local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (err) {
      console.error('Unexpected error deleting transaction:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reconcileTransaction = useCallback((id: number, isReconciled: boolean) => {
    updateTransaction(id, { isReconciled });
  }, [updateTransaction]);

  return {
    transactions,
    filteredTransactions,
    recentTransactions,
    filter,
    isLoading,
    setFilter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    reconcileTransaction,
    refetchTransactions: loadTransactionsFromDB,
    updateAllBudgetEntriesFromTransactions
  };
} 