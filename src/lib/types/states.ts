import { Database } from '../database.types';

// Budget types
export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetState {
  budgets: Budget[];
  activePeriod?: string;
  setActivePeriod?: (period: string) => void;
}

// Cash Flow types
export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CashFlowState {
  transactions: Transaction[];
  metrics?: {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    expensesChangePercent: number;
    netCashFlowChangePercent: number;
  };
}

// Goals types
export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface GoalsState {
  goals: Goal[];
}

// Investments types
export interface Investment {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: string;
  returns: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentsState {
  investments: Investment[];
}

// Reports types
export interface Report {
  id: string;
  user_id: string;
  name: string;
  type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface ReportsState {
  reports: Report[];
}

// Transactions types
export interface TransactionsState {
  transactions: Transaction[];
}

// Accounts types
export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment' | 'loan' | 'other';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  created_at: string;
  updated_at: string;
  is_hidden?: boolean;
  account_number?: string;
  notes?: string;
}

export interface AccountsState {
  accounts: Account[];
}

// User Profile types
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences: {
    theme: string;
    currency: string;
    language: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UserProfileState {
  profile: UserProfile | null;
}

// Notifications types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsState {
  notifications: Notification[];
}

// Recurring types
export interface RecurringTransaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringState {
  recurringTransactions: RecurringTransaction[];
} 