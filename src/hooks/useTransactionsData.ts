'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
};

export function useTransactionsData(): TransactionsState {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load transactions from Supabase
  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      try {
        console.log('Loading transactions from Supabase...');
        
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        
        console.log('Supabase response:', data);
        console.log('Supabase error:', error);
        
        if (error) {
          console.error('Error loading transactions:', error);
          return;
        }
        
        if (!data || data.length === 0) {
          console.log('No transactions found in Supabase');
          return;
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
          is_debt_transaction: transaction.is_debt_transaction
        }));
        
        console.log('Loaded transactions:', formattedTransactions.length);
        setTransactions(formattedTransactions);
      } catch (err) {
        console.error('Unexpected error loading transactions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTransactions();
  }, []);

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

  // CRUD operations
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return;
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
        return;
      }
      
      if (data && data.length > 0) {
        // Add the new transaction to our state
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
          is_debt_transaction: data[0].is_debt_transaction
        };
        
        setTransactions(prev => [...prev, newTransaction]);
      }
    } catch (err) {
      console.error('Unexpected error adding transaction:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: number, updates: Partial<Transaction>) => {
    setIsLoading(true);
    try {
      // Convert isReconciled to is_reconciled for Supabase
      const supabaseUpdates: any = { ...updates };
      if ('isReconciled' in updates) {
        supabaseUpdates.is_reconciled = updates.isReconciled;
        delete supabaseUpdates.isReconciled;
      }
      
      const { error } = await supabase
        .from('transactions')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating transaction:', error);
        return;
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
  };
} 