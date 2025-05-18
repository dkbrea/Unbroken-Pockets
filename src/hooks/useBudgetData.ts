import { useState, useEffect, useCallback } from 'react';
import { Home, ShoppingCart, Car, Utensils, Coffee, Briefcase, Film, Heart, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useForecastData } from '@/hooks/useForecastData';
import {
  getBudgetCategories as getServiceBudgetCategories,
  getMonthlyBudgetSummary,
  createBudgetCategory as createServiceBudgetCategory,
  updateBudgetCategory as updateServiceBudgetCategory,
  deleteBudgetCategory as deleteServiceBudgetCategory,
  saveBudgetEntry,
  addBudgetTransaction,
  initializeDefaultBudgetCategories,
  copyBudgetEntriesFromPreviousMonth,
  getBudgetEntriesForMonth,
  type BudgetCategory as BudgetServiceCategoryType
} from '../lib/services/budgetService';
import { format, startOfMonth, parseISO, addMonths, subMonths } from 'date-fns';
import { useRecurringData } from './useRecurringData';
import { useDebtData } from './useDebtData';
import { useGoalsData } from './useGoalsData';
import { supabase } from '../lib/supabase';
import { Database } from '@/lib/database.types';
import type { Budget, BudgetState } from '@/lib/types/states';
import { getAuthenticatedUserId } from '@/lib/auth/authUtils';

// Local hook-specific category type with LucideIcon
export interface BudgetCategoryUi {
  id: number;
  name: string;
  allocated: number;
  spent: number;
  icon: LucideIcon;
  color: string;
}

export interface ExtendedBudgetState extends BudgetState {
  activePeriod: string;
  budgetCategories: BudgetCategoryUi[];
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  monthlyIncome: number;
  fixedExpenses: number;
  totalSubscriptions: number;
  leftToAllocate: number;
  totalDebtPayments: number;
  totalGoalContributions: number;
  isLoading: boolean;
  error: Error | null;
  isAuthError: boolean;
  addCategory: (category: Omit<BudgetCategoryUi, 'id' | 'icon' | 'spent'> & { iconName: string }) => Promise<void>;
  updateCategory: (id: number, category: Partial<Omit<BudgetCategoryUi, 'icon'>> & { iconName?: string }) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  setAllocation: (categoryId: number, amount: number) => Promise<void>;
  addTransaction: (categoryId: number, amount: number, description?: string) => Promise<void>;
  nextMonth: () => void;
  prevMonth: () => void;
  refreshData: () => Promise<void>;
}

const iconMap: { [key: string]: LucideIcon } = {
  Home, ShoppingCart, Car, Utensils, Coffee, Briefcase, Film, Heart, ShoppingBag, MoreHorizontal
};

const getIconName = (iconComponent: LucideIcon): string => {
  return Object.keys(iconMap).find(key => iconMap[key] === iconComponent) || 'ShoppingCart';
};

const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || ShoppingCart;
};

export function useBudgetData(): ExtendedBudgetState {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState<Date>(startOfMonth(new Date()));
  const [activePeriod, setActivePeriod] = useState(format(activeMonth, 'MMMM yyyy'));
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryUi[]>([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState(0);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [leftToAllocate, setLeftToAllocate] = useState(0);
  const [totalDebtPayments, setTotalDebtPayments] = useState(0);
  const [totalGoalContributions, setTotalGoalContributions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [previousMonth, setPreviousMonth] = useState<Date | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // Get recurring data to access monthly income and fixed expenses
  const { 
    monthlyIncome: recurringIncome, 
    monthlyExpenses: recurringExpenses, 
    monthlyDebt: recurringDebt, 
    calculateMonthIncome,
    calculateMonthExpenses,
    displayTransactions
  } = useRecurringData();
  
  // Get debt data to access total minimum payments (using debt tracker data, not recurring)
  const { totalMinPayment, debts } = useDebtData();
  
  // Get goals data to access total monthly contributions
  const { totalMonthlyContribution, financialGoals } = useGoalsData();

  // Get forecast data
  const { forecastData } = useForecastData();
  
  // Fetch authenticated user ID on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = await getAuthenticatedUserId();
        if (id) {
          setUserId(id);
          setIsAuthError(false);
        } else {
          setIsAuthError(true);
          setError(new Error('User not authenticated.'));
        }
      } catch (err) {
        setIsAuthError(true);
        setError(err instanceof Error ? err : new Error('Authentication failed'));
      }
    };
    fetchUser();
  }, []);
  
  // Update fixed expenses and subscriptions (from recurring transactions)
  useEffect(() => {
    // If we have transactions data, calculate fixed expenses and subscriptions for the specific month
    if (displayTransactions && displayTransactions.length > 0) {
      try {
        // Calculate fixed expenses (excluding subscriptions)
        const expensesForActiveMonth = calculateMonthExpenses(activeMonth, displayTransactions.filter(tx => 
          tx.amount < 0 && 
          tx.category?.toLowerCase() !== 'subscriptions'
        ));
        setFixedExpenses(Math.abs(expensesForActiveMonth));

        // Calculate subscriptions separately
        const subscriptionsForActiveMonth = calculateMonthExpenses(activeMonth, displayTransactions.filter(tx => 
          tx.amount < 0 &&
          tx.category?.toLowerCase() === 'subscriptions'
        ));
        setTotalSubscriptions(Math.abs(subscriptionsForActiveMonth));
      } catch (error) {
        console.error("Error calculating expenses for month:", error);
        // Fallback to the general calculation
        const nonDebtExpenses = recurringExpenses - recurringDebt;
        setFixedExpenses(Math.abs(nonDebtExpenses || 0));
        setTotalSubscriptions(0);
      }
    } else {
      // Fallback to the general calculation if no display transactions are available
      const nonDebtExpenses = recurringExpenses - recurringDebt;
      setFixedExpenses(Math.abs(nonDebtExpenses || 0));
      setTotalSubscriptions(0);
    }
  }, [recurringExpenses, recurringDebt, activeMonth, displayTransactions, calculateMonthExpenses]);
  
  // Update total debt payments and goal contributions
  useEffect(() => {
    // Get the current month index (0-based)
    const currentMonthIndex = activeMonth.getMonth();
    
    // Load forecast data if not already loaded or if current month data is missing
    if (!forecastData?.debtPaymentsByMonth?.[currentMonthIndex] || !forecastData?.savingsByMonth?.[currentMonthIndex]) {
      // Create forecast data for the current month
      const currentYear = activeMonth.getFullYear();
      const monthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
      
      // Fetch monthly contributions for the current month
      supabase
        .from('goal_monthly_contributions')
        .select('*')
        .eq('month', monthStr)
        .then(({ data: monthlyContributions, error }) => {
          if (error) {
            console.error('Error fetching monthly contributions:', error);
            return;
          }

          // Calculate savings goals for the month using monthly contributions if available
          const savingsForMonth = financialGoals.map(goal => {
            const monthlyContribution = monthlyContributions?.find(mc => mc.goal_id === goal.id);
            return {
              id: goal.id,
              amount: monthlyContribution?.amount ?? goal.monthlyContribution
            };
          });

          // Calculate debt payments for the month
          const debtPaymentsForMonth = debts.map(debt => ({
            id: debt.id,
            amount: -Math.abs(debt.minimumPayment)
          }));

          // Calculate totals
          const forecastGoalsTotal = savingsForMonth
            .reduce((sum, goal) => sum + (goal.amount || 0), 0);
          const forecastDebtTotal = debtPaymentsForMonth
            .reduce((sum, debt) => sum + Math.abs(debt.amount || 0), 0);

          setTotalDebtPayments(forecastDebtTotal);
          setTotalGoalContributions(forecastGoalsTotal);
        });
    } else {
      // Use existing forecast data with null checks
      const monthDebtPayments = forecastData.debtPaymentsByMonth[currentMonthIndex] || [];
      const monthSavings = forecastData.savingsByMonth[currentMonthIndex] || [];

      const forecastDebtTotal = monthDebtPayments
        .reduce((sum, debt) => sum + Math.abs(debt?.amount || 0), 0);
      const forecastGoalsTotal = monthSavings
        .reduce((sum, goal) => sum + (goal?.amount || 0), 0);

      setTotalDebtPayments(forecastDebtTotal);
      setTotalGoalContributions(forecastGoalsTotal);
    }
  }, [activeMonth, forecastData, financialGoals, debts]);
  
  // Update monthly income for the active month and calculate left to allocate
  useEffect(() => {
    // Calculate income for the specific active month
    if (displayTransactions && displayTransactions.length > 0) {
      try {
        const incomeForActiveMonth = calculateMonthIncome(activeMonth, displayTransactions);
        setMonthlyIncome(incomeForActiveMonth);
        
        // Calculate left to allocate with the period-specific income
        const totalCommittedFunds = totalAllocated + fixedExpenses + totalSubscriptions + totalDebtPayments + totalGoalContributions;
        setLeftToAllocate(incomeForActiveMonth - totalCommittedFunds);
      } catch (error) {
        console.error("Error calculating monthly income for month:", error);
        // Fallback to general recurring income
        setMonthlyIncome(recurringIncome);
        
        // Calculate left to allocate with recurring income
        const totalCommittedFunds = totalAllocated + fixedExpenses + totalSubscriptions + totalDebtPayments + totalGoalContributions;
        setLeftToAllocate(recurringIncome - totalCommittedFunds);
      }
    } else {
      // Fallback to general recurring income if no transactions data available
      setMonthlyIncome(recurringIncome);
      
      // Calculate left to allocate with recurring income
      const totalCommittedFunds = totalAllocated + fixedExpenses + totalSubscriptions + totalDebtPayments + totalGoalContributions;
      setLeftToAllocate(recurringIncome - totalCommittedFunds);
    }
  }, [activeMonth, recurringIncome, totalAllocated, fixedExpenses, totalSubscriptions, totalDebtPayments, totalGoalContributions, displayTransactions, calculateMonthIncome]);
  
  // Function to check and copy budget entries if needed
  const checkAndCopyBudgetEntries = useCallback(async (targetMonth: Date, sourceMonth: Date) => {
    if (!userId) return;
    try {
      const entries = await getBudgetEntriesForMonth(targetMonth, userId);
      if (entries.length === 0) {
        console.log(`No budget entries for ${format(targetMonth, 'MMMM yyyy')}, copying from ${format(sourceMonth, 'MMMM yyyy')}`);
        await copyBudgetEntriesFromPreviousMonth(targetMonth, sourceMonth, userId);
      }
    } catch (err) {
      console.error("Error checking/copying budget entries:", err);
    }
  }, [userId]);

  // Function to load budget data for the active month
  const loadBudgetData = useCallback(async () => {
    if (!userId) {
      if (!isAuthError) setIsLoading(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const summary = await getMonthlyBudgetSummary(activeMonth, userId);
      setBudgetCategories(summary.categories.map(mapBudgetCategoryFromService));
      setTotalAllocated(summary.totalAllocated);
      setTotalSpent(summary.totalSpent);
      setRemainingBudget(summary.remainingBudget);
      setActivePeriod(format(activeMonth, 'MMMM yyyy'));
      
      // Update previous month to current month for next comparison
      setPreviousMonth(activeMonth);
    } catch (err) {
      console.error('Error loading budget data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading budget data'));
      
      // Use fallback data
      const fallbackCategories: BudgetCategoryUi[] = [
        { 
          id: 1, 
          name: 'Groceries', 
          allocated: 500, 
          spent: 0, 
          icon: ShoppingCart,
          color: 'text-green-600 bg-green-100' 
        },
        { 
          id: 2, 
          name: 'Dining Out', 
          allocated: 300, 
          spent: 0, 
          icon: Utensils,
          color: 'text-red-600 bg-red-100' 
        },
        { 
          id: 3, 
          name: 'Transportation', 
          allocated: 200, 
          spent: 0, 
          icon: Car,
          color: 'text-purple-600 bg-purple-100' 
        },
        { 
          id: 4, 
          name: 'Entertainment', 
          allocated: 150, 
          spent: 0, 
          icon: Coffee,
          color: 'text-yellow-600 bg-yellow-100' 
        },
        { 
          id: 5, 
          name: 'Shopping', 
          allocated: 200, 
          spent: 0, 
          icon: ShoppingBag,
          color: 'text-blue-600 bg-blue-100' 
        }
      ];
      
      setBudgetCategories(fallbackCategories);
      const totalAlloc = fallbackCategories.reduce((sum, cat) => sum + cat.allocated, 0);
      setTotalAllocated(totalAlloc);
      setTotalSpent(0);
      setRemainingBudget(totalAlloc);
    } finally {
      setIsLoading(false);
    }
  }, [activeMonth, userId, isAuthError]);
  
  // Load data on mount and when active month changes
  useEffect(() => {
    if (userId) {
      loadBudgetData();
    }
  }, [userId, loadBudgetData]);
  
  // Function to navigate to next month
  const nextMonth = useCallback(() => {
    setActiveMonth(prevActiveMonth => {
      const newMonth = addMonths(prevActiveMonth, 1);
      return startOfMonth(newMonth);
    });
  }, []);
  
  // Function to navigate to previous month
  const prevMonth = useCallback(() => {
    setActiveMonth(prevActiveMonth => {
      const newMonth = subMonths(prevActiveMonth, 1);
      return startOfMonth(newMonth);
    });
  }, []);
  
  // Add a new budget category
  const addCategory = useCallback(async (category: Omit<BudgetCategoryUi, 'id' | 'icon' | 'spent'> & { iconName: string }) => {
    if (!userId) {
      setError(new Error('User not authenticated. Cannot add category.'));
      return;
    }
    try {
      setIsLoading(true);
      
      const serviceCategoryData = mapBudgetCategoryToService(category);
      await createServiceBudgetCategory(serviceCategoryData, userId);
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err instanceof Error ? err : new Error('Failed to add category'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadBudgetData]);
  
  // Update an existing budget category
  const updateCategory = useCallback(async (id: number, category: Partial<Omit<BudgetCategoryUi, 'icon'>> & { iconName?: string }) => {
    if (!userId) {
      setError(new Error('User not authenticated. Cannot update category.'));
      return;
    }
    try {
      setIsLoading(true);
      
      const { iconName, ...restOfUpdate } = category;
      const serviceUpdate: Partial<Omit<BudgetServiceCategoryType, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {
        ...restOfUpdate,
        ...(iconName && { icon: iconName }),
      };
      await updateServiceBudgetCategory(id, serviceUpdate, userId);
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err : new Error('Failed to update category'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadBudgetData]);
  
  // Delete a budget category
  const deleteCategory = useCallback(async (id: number) => {
    if (!userId) {
      setError(new Error('User not authenticated. Cannot delete category.'));
      return;
    }
    try {
      setIsLoading(true);
      
      await deleteServiceBudgetCategory(id, userId);
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete category'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadBudgetData]);
  
  // Set allocation for a category for the current month
  const setAllocation = useCallback(async (categoryId: number, amount: number) => {
    if (!userId) {
      setError(new Error('User not authenticated. Cannot set allocation.'));
      return;
    }
    try {
      setIsLoading(true);
      
      // Find current entry for this category
      const category = budgetCategories.find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Save budget entry
      const monthStr = format(activeMonth, 'yyyy-MM-dd');
      await saveBudgetEntry({ category_id: categoryId, month: monthStr, allocated: amount, spent: category.spent }, userId);
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error setting allocation:', err);
      setError(err instanceof Error ? err : new Error('Failed to set allocation'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, activeMonth, budgetCategories, loadBudgetData]);
  
  // Add a transaction to a category
  const addTransaction = useCallback(async (categoryId: number, amount: number, description: string = 'Budget transaction') => {
    if (!userId) {
      setError(new Error('User not authenticated. Cannot add transaction.'));
      return;
    }
    try {
      setIsLoading(true);
      
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      await addBudgetTransaction({ category_id: categoryId, amount, date: dateStr, description }, userId);
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err : new Error('Failed to add transaction'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadBudgetData]);
  
  // Manual refresh function
  const refreshData = useCallback(async () => {
    if (!userId) {
      setError(new Error("Cannot refresh data: User not authenticated."));
      return;
    }
    await loadBudgetData();
  }, [userId, loadBudgetData]);

  const mapBudgetCategoryFromService = (serviceCategory: BudgetServiceCategoryType): BudgetCategoryUi => ({
    ...serviceCategory,
    icon: getIconComponent(serviceCategory.icon || 'ShoppingCart'),
  });

  const mapBudgetCategoryToService = (uiCategory: Omit<BudgetCategoryUi, 'id' | 'icon' | 'spent'> & { iconName: string }): Omit<BudgetServiceCategoryType, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
    name: uiCategory.name,
    allocated: uiCategory.allocated,
    spent: 0,
    icon: uiCategory.iconName,
    color: uiCategory.color,
  });

  return {
    activePeriod,
    budgetCategories,
    totalAllocated,
    totalSpent,
    remainingBudget,
    monthlyIncome,
    fixedExpenses,
    totalSubscriptions,
    leftToAllocate,
    totalDebtPayments,
    totalGoalContributions,
    isLoading,
    error,
    isAuthError,
    addCategory,
    updateCategory,
    deleteCategory,
    setAllocation,
    addTransaction,
    nextMonth,
    prevMonth,
    refreshData,
    budgets,
    setBudgets,
    setActivePeriod: (period: string) => {
      try {
        const date = parseISO(`${period}-01`);
        setActiveMonth(startOfMonth(date));
      } catch (err) {
        console.error('Error parsing period:', err);
      }
    },
  } as ExtendedBudgetState;
} 