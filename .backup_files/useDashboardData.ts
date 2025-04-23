'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccountsData } from './useAccountsData';
import { useTransactionsData } from './useTransactionsData';
import { useBudgetData } from './useBudgetData';
import { useGoalsData } from './useGoalsData';
import { useUserProfile } from './useUserProfile';

export type DashboardTimeframe = 'day' | 'week' | 'month' | 'year';

export type SpendingCategory = {
  name: string;
  amount: number;
  percentage: number;
  color: string;
};

export type BudgetSummary = {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  categories: {
    name: string;
    budgeted: number;
    spent: number;
    percentage: number;
    status: 'normal' | 'warning' | 'danger';
  }[];
};

export type OnboardingStep = {
  id: number;
  text: string;
  completed: boolean;
};

export type DashboardState = {
  dateFilter: string;
  spendingByCategory: SpendingCategory[];
  totalSpending: number;
  budgetSummary: BudgetSummary;
  recentTransactions: any[];
  onboardingSteps: OnboardingStep[];
  onboardingProgress: number;
  isLoading: boolean;
  setDateFilter: (filter: string) => void;
};

export function useDashboardData(): DashboardState {
  const [dateFilter, setDateFilter] = useState('This month');
  const [isLoading, setIsLoading] = useState(true);

  // Import data from other hooks
  const { accounts } = useAccountsData();
  const { recentTransactions } = useTransactionsData();
  const budget = useBudgetData();
  const { inProgressGoals } = useGoalsData();
  const { profile } = useUserProfile();

  // Calculate spending by category
  const spendingByCategory: SpendingCategory[] = useMemo(() => [
    { name: 'Housing', amount: 1200, percentage: 32, color: '#FFC857' },
    { name: 'Food & Dining', amount: 650, percentage: 17, color: '#FFB74D' },
    { name: 'Transportation', amount: 350, percentage: 9, color: '#4FC3F7' },
    { name: 'Entertainment', amount: 280, percentage: 7, color: '#9575CD' },
    { name: 'Shopping', amount: 420, percentage: 11, color: '#4DB6AC' },
    { name: 'Health & Fitness', amount: 180, percentage: 5, color: '#F06292' },
    { name: 'Other', amount: 740, percentage: 19, color: '#A1A1AA' },
  ], []);

  // Calculate total spending
  const totalSpending = useMemo(() => 
    spendingByCategory.reduce((sum, category) => sum + category.amount, 0),
  [spendingByCategory]);

  // Budget summary
  const budgetSummary: BudgetSummary = useMemo(() => ({
    income: 5200,
    expenses: 3870,
    savings: 1330,
    savingsRate: 25.6,
    categories: [
      { 
        name: 'Housing',
        budgeted: 1500,
        spent: 1200,
        percentage: 80,
        status: 'normal'
      },
      { 
        name: 'Food & Dining',
        budgeted: 600, 
        spent: 650, 
        percentage: 108,
        status: 'warning'
      },
      { 
        name: 'Transportation',
        budgeted: 400, 
        spent: 350, 
        percentage: 88,
        status: 'normal'
      },
      { 
        name: 'Entertainment',
        budgeted: 200, 
        spent: 280, 
        percentage: 140,
        status: 'danger'
      },
    ]
  }), []);

  // Onboarding steps
  const onboardingSteps: OnboardingStep[] = useMemo(() => [
    { id: 1, text: 'Connect your first account', completed: accounts.length > 0 },
    { id: 2, text: 'Set up your first budget', completed: budget.budgetCategories?.length > 0 },
    { id: 3, text: 'Create a savings goal', completed: inProgressGoals?.length > 0 },
    { id: 4, text: 'Set up your first recurring expense', completed: false },
    { id: 5, text: 'Link your investment accounts', completed: false },
  ], [accounts.length, budget.budgetCategories?.length, inProgressGoals?.length]);

  // Calculate onboarding progress
  const onboardingProgress = useMemo(() => {
    const completedCount = onboardingSteps.filter(step => step.completed).length;
    return (completedCount / onboardingSteps.length) * 100;
  }, [onboardingSteps]);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [dateFilter]);

  return {
    dateFilter,
    spendingByCategory,
    totalSpending,
    budgetSummary,
    recentTransactions,
    onboardingSteps,
    onboardingProgress,
    isLoading,
    setDateFilter,
  };
} 