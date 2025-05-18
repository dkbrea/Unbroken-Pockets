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
} from './supabaseUtils';
import { createClient } from '@supabase/supabase-js';
import {
  BudgetState,
  CashFlowState,
  GoalsState,
  InvestmentsState,
  ReportsState,
  TransactionsState,
  AccountsState,
  UserProfileState,
  NotificationsState,
  RecurringState,
  RecurringTransaction
} from '@/lib/types/states';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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

        // Load all data in parallel
        const [
          budgetData, 
          cashFlowData, 
          goalsData, 
          investmentsData, 
          reportsData,
          transactionsData,
          accountsData,
          userProfileData,
          notificationsData,
          recurringData
        ] = await Promise.all([
          loadBudgetData(),
          loadCashFlowData(),
          loadGoalsData(),
          loadInvestmentsData(),
          loadReportsData(),
          loadTransactionsData(),
          loadAccountsData(),
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError(new Error('No authenticated user'));
          setIsLoading(false);
          return;
        }

        const { data: recurringData, error: recurringError } = await supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (recurringError) throw recurringError;
        
        setData(recurringData || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading recurring transactions:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, isLoading, error };
} 