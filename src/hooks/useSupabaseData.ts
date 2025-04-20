'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  loadBudgetData, 
  loadCashFlowData, 
  loadGoalsData, 
  loadInvestmentsData, 
  loadReportsData,
  loadTransactionsData,
  loadAccountsData,
  loadUserProfileData,
  loadNotificationsData,
  loadRecurringData
} from '../lib/supabaseUtils';
import { BudgetState } from './useBudgetData';
import { CashFlowState } from './useCashFlowData';
import { GoalsState } from './useGoalsData';
import { InvestmentsState } from './useInvestmentsData';
import { ReportsState } from './useReportsData';
import { TransactionsState } from './useTransactionsData';
import { AccountsState } from './useAccountsData';
import { UserProfileState } from './useUserProfile';
import { NotificationsState } from './useNotifications';
import { RecurringState, RecurringTransaction } from './useRecurringData';
import { supabase } from '../lib/supabase';

export type FinancialDashboardData = {
  budget: Partial<BudgetState>;
  cashFlow: Partial<CashFlowState>;
  goals: Partial<GoalsState>;
  investments: Partial<InvestmentsState>;
  reports: Partial<ReportsState>;
  transactions: Partial<TransactionsState>;
  accounts: Partial<AccountsState>;
  userProfile: Partial<UserProfileState>;
  notifications: Partial<NotificationsState>;
  recurring: Partial<RecurringState>;
  isLoading: boolean;
  error: Error | null;
};

export const useSupabaseData = (): FinancialDashboardData => {
  const [data, setData] = useState<FinancialDashboardData>({
    budget: {},
    cashFlow: {},
    goals: {},
    investments: {},
    reports: {},
    transactions: {},
    accounts: {},
    userProfile: {},
    notifications: {},
    recurring: {},
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load all data in parallel
        const [
          budgetData, 
          cashFlowData, 
          goalsData, 
          investmentsData, 
          reportsData,
          transactionsData,
          accountsData
        ] = await Promise.all([
          loadBudgetData(),
          loadCashFlowData(),
          loadGoalsData(),
          loadInvestmentsData(),
          loadReportsData(),
          loadTransactionsData(),
          loadAccountsData()
        ]);

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setData(prevData => ({
            ...prevData,
            isLoading: false,
            error: null
          }));
          return;
        }

        // Load user-specific data
        const [userProfileData, notificationsData, recurringData] = await Promise.all([
          loadUserProfileData(user.id),
          loadNotificationsData(user.id),
          loadRecurringData(user.id)
        ]);

        setData({
          budget: budgetData,
          cashFlow: cashFlowData,
          goals: goalsData,
          investments: investmentsData,
          reports: reportsData,
          transactions: transactionsData,
          accounts: accountsData,
          userProfile: userProfileData,
          notifications: notificationsData,
          recurring: recurringData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        setData(prevData => ({
          ...prevData,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error occurred')
        }));
      }
    };

    fetchData();
  }, []);

  return data;
};

// Example function to demonstrate using the data in components
export const useActiveBudget = (): Partial<BudgetState> & { isLoading: boolean; error: Error | null } => {
  const { budget, isLoading, error } = useSupabaseData();
  
  // Add setActivePeriod function
  const updatedBudget = {
    ...budget,
    setActivePeriod: (period: string) => {
      // This would update the active period in Supabase
      console.log(`Setting active period to ${period}`);
    }
  };
  
  return { ...updatedBudget, isLoading, error };
};

// Similar functions can be created for the other data types
export const useCashFlow = (): Partial<CashFlowState> & { isLoading: boolean; error: Error | null } => {
  const { cashFlow, isLoading, error } = useSupabaseData();
  
  return { ...cashFlow, isLoading, error };
};

export const useGoals = (): Partial<GoalsState> & { isLoading: boolean; error: Error | null } => {
  const { goals, isLoading, error } = useSupabaseData();
  
  return { ...goals, isLoading, error };
};

export const useInvestments = (): Partial<InvestmentsState> & { isLoading: boolean; error: Error | null } => {
  const { investments, isLoading, error } = useSupabaseData();
  
  return { ...investments, isLoading, error };
};

export const useReports = (): Partial<ReportsState> & { isLoading: boolean; error: Error | null } => {
  const { reports, isLoading, error } = useSupabaseData();
  
  return { ...reports, isLoading, error };
};

// New helper hooks
export const useTransactions = (): Partial<TransactionsState> & { isLoading: boolean; error: Error | null } => {
  const { transactions, isLoading, error } = useSupabaseData();
  
  return { ...transactions, isLoading, error };
};

export const useAccounts = (): Partial<AccountsState> & { isLoading: boolean; error: Error | null } => {
  const { accounts, isLoading, error } = useSupabaseData();
  
  return { ...accounts, isLoading, error };
};

export const useProfile = (): Partial<UserProfileState> & { isLoading: boolean; error: Error | null } => {
  const { userProfile, isLoading, error } = useSupabaseData();
  
  return { ...userProfile, isLoading, error };
};

export const useNotificationsData = (): Partial<NotificationsState> & { isLoading: boolean; error: Error | null } => {
  const { notifications, isLoading, error } = useSupabaseData();
  
  return { ...notifications, isLoading, error };
};

export function useRecurring() {
  const [data, setData] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated in useRecurring');
        setData([]);
        setError(new Error('User not authenticated'));
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching recurring transactions for user:', user.id);
      
      // Load fresh data directly from supabase
      const { data: recurringData, error: supabaseError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id);
      
      if (supabaseError) {
        console.error('Supabase error in useRecurring:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Recurring transactions loaded:', recurringData?.length || 0);
      
      // Log debt-related transactions
      const debtTransactions = recurringData?.filter(t => t.debt_id) || [];
      console.log('Debt-related transactions from database:', debtTransactions);
      
      if (!recurringData) {
        setData([]);
        return;
      }
      
      // Transform to match expected format
      const transactions = recurringData.map(transaction => {
        // Debug mapping for debt transactions
        if (transaction.debt_id) {
          console.log(`Mapping debt transaction: ${transaction.name} (debt_id: ${transaction.debt_id})`);
        }
        
        return {
          id: transaction.id,
          name: transaction.name,
          amount: transaction.amount,
          frequency: transaction.frequency,
          category: transaction.category || 'Uncategorized',
          nextDate: transaction.next_date,
          status: transaction.status as 'active' | 'paused',
          paymentMethod: transaction.payment_method || 'Other',
          debtId: transaction.debt_id,
          user_id: transaction.user_id,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at,
          type: transaction.type || 'expense',
          description: transaction.description || '',
          startDate: transaction.start_date || transaction.next_date
        };
      });
      
      // Log mapped debt transactions
      const mappedDebtTransactions = transactions.filter(t => t.debtId);
      console.log('Mapped debt transactions:', mappedDebtTransactions);
      
      setData(transactions);
      setError(null);
    } catch (err) {
      console.error('Error loading recurring transactions:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Function to mutate the data (used after adding, editing, or deleting)
  const mutate = useCallback(() => {
    loadData();
  }, [loadData]);
  
  return {
    recurringTransactions: data,
    isLoading,
    error,
    mutate
  };
} 