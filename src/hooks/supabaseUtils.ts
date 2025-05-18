import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
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
  RecurringState
} from './types/states';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function loadBudgetData(): Promise<Partial<BudgetState>> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { budgets: data || [] };
  } catch (error) {
    console.error('Error loading budget data:', error);
    return {};
  }
}

export async function loadCashFlowData(): Promise<Partial<CashFlowState>> {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // Calculate metrics
    const now = new Date();
    const thisMonth = transactions?.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }) || [];

    const lastMonth = transactions?.filter(t => {
      const date = new Date(t.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    }) || [];

    const totalIncome = thisMonth.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum, 0);
    const totalExpenses = thisMonth.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
    const netCashFlow = totalIncome - totalExpenses;

    const lastMonthExpenses = lastMonth.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
    const lastMonthNetCashFlow = lastMonth.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum, 0) - lastMonthExpenses;

    const expensesChangePercent = lastMonthExpenses ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
    const netCashFlowChangePercent = lastMonthNetCashFlow ? ((netCashFlow - lastMonthNetCashFlow) / lastMonthNetCashFlow) * 100 : 0;

    return {
      transactions: transactions || [],
      metrics: {
        totalIncome,
        totalExpenses,
        netCashFlow,
        expensesChangePercent,
        netCashFlowChangePercent
      }
    };
  } catch (error) {
    console.error('Error loading cash flow data:', error);
    return {};
  }
}

export async function loadGoalsData(): Promise<Partial<GoalsState>> {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { goals: data || [] };
  } catch (error) {
    console.error('Error loading goals data:', error);
    return {};
  }
}

export async function loadInvestmentsData(): Promise<Partial<InvestmentsState>> {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { investments: data || [] };
  } catch (error) {
    console.error('Error loading investments data:', error);
    return {};
  }
}

export async function loadReportsData(): Promise<Partial<ReportsState>> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { reports: data || [] };
  } catch (error) {
    console.error('Error loading reports data:', error);
    return {};
  }
}

export async function loadTransactionsData(): Promise<Partial<TransactionsState>> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return { transactions: data || [] };
  } catch (error) {
    console.error('Error loading transactions data:', error);
    return {};
  }
}

export async function loadAccountsData(): Promise<Partial<AccountsState>> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { accounts: data || [] };
  } catch (error) {
    console.error('Error loading accounts data:', error);
    return {};
  }
}

export async function loadUserProfileData(userId: string): Promise<Partial<UserProfileState>> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { profile: data || null };
  } catch (error) {
    console.error('Error loading user profile data:', error);
    return {};
  }
}

export async function loadNotificationsData(userId: string): Promise<Partial<NotificationsState>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { notifications: data || [] };
  } catch (error) {
    console.error('Error loading notifications data:', error);
    return {};
  }
}

export async function loadRecurringData(userId: string): Promise<Partial<RecurringState>> {
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { recurringTransactions: data || [] };
  } catch (error) {
    console.error('Error loading recurring data:', error);
    return {};
  }
} 