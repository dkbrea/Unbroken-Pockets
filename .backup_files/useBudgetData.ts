import { useState, useEffect, useCallback } from 'react';
import { Home, ShoppingCart, Car, Utensils, Coffee, Briefcase, Film, Heart, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import {
  getBudgetCategories,
  getMonthlyBudgetSummary,
  createBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  saveBudgetEntry,
  addBudgetTransaction,
  initializeDefaultBudgetCategories,
  copyBudgetEntriesFromPreviousMonth,
  getBudgetEntriesForMonth
} from '@/lib/services/budgetService';
import { format, startOfMonth, parseISO, addMonths, subMonths } from 'date-fns';
import { useRecurringData } from './useRecurringData';
import { useDebtData } from './useDebtData';
import { useGoalsData } from './useGoalsData';

export type BudgetCategory = {
  id: number;
  name: string;
  allocated: number;
  spent: number;
  icon: LucideIcon;
  color: string;
};

export type BudgetState = {
  activePeriod: string;
  budgetCategories: BudgetCategory[];
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  monthlyIncome: number;
  fixedExpenses: number;
  leftToAllocate: number;
  totalDebtPayments: number;
  totalGoalContributions: number;
  isLoading: boolean;
  error: Error | null;
  setActivePeriod: (period: string) => void;
  addCategory: (category: Omit<BudgetCategory, 'id'>) => Promise<void>;
  updateCategory: (id: number, category: Partial<BudgetCategory>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  setAllocation: (categoryId: number, amount: number) => Promise<void>;
  addTransaction: (categoryId: number, amount: number, description?: string) => Promise<void>;
  nextMonth: () => void;
  prevMonth: () => void;
  refreshData: () => Promise<void>;
};

// Helper function to get icon component from string name
const getIconComponent = (iconName: string): LucideIcon => {
  switch (iconName) {
    case 'Home': return Home;
    case 'ShoppingCart': return ShoppingCart;
    case 'Car': return Car;
    case 'Utensils': return Utensils;
    case 'Coffee': return Coffee;
    case 'Briefcase': return Briefcase;
    case 'Film': return Film;
    case 'Heart': return Heart;
    case 'ShoppingBag': return ShoppingBag;
    case 'MoreHorizontal': return MoreHorizontal;
    default: return ShoppingCart;
  }
};

export function useBudgetData(): BudgetState {
  const [activeMonth, setActiveMonth] = useState<Date>(startOfMonth(new Date()));
  const [activePeriod, setActivePeriod] = useState(format(activeMonth, 'MMMM yyyy'));
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState(0);
  const [leftToAllocate, setLeftToAllocate] = useState(0);
  const [totalDebtPayments, setTotalDebtPayments] = useState(0);
  const [totalGoalContributions, setTotalGoalContributions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [previousMonth, setPreviousMonth] = useState<Date | null>(null);
  
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
  const { totalMinPayment } = useDebtData();
  
  // Get goals data to access total monthly contributions
  const { totalMonthlyContribution } = useGoalsData();
  
  // Update fixed expenses (from recurring transactions)
  useEffect(() => {
    // If we have transactions data, calculate fixed expenses for the specific month
    if (displayTransactions && displayTransactions.length > 0) {
      // Calculate expenses for the active month - this matches the recurring calendar view
      try {
        const expensesForActiveMonth = calculateMonthExpenses(activeMonth, displayTransactions);
        setFixedExpenses(expensesForActiveMonth);
      } catch (error) {
        console.error("Error calculating fixed expenses for month:", error);
        // Fallback to the general calculation
        const nonDebtExpenses = recurringExpenses - recurringDebt;
        setFixedExpenses(Math.abs(nonDebtExpenses || 0));
      }
    } else {
      // Fallback to the general calculation if no display transactions are available
      // Fixed expenses are all recurring expenses excluding debt payments that are already tracked by the debt tracker
      const nonDebtExpenses = recurringExpenses - recurringDebt;
      // Ensure fixed expenses is a positive value
      setFixedExpenses(Math.abs(nonDebtExpenses || 0));
    }
  }, [recurringExpenses, recurringDebt, activeMonth, displayTransactions, calculateMonthExpenses]);
  
  // Update total debt payments and goal contributions
  useEffect(() => {
    // Use debt payments from debt tracker if available, otherwise fallback to recurring debt payments
    const debtPayments = totalMinPayment > 0 ? totalMinPayment : recurringDebt;
    setTotalDebtPayments(debtPayments || 0);
    setTotalGoalContributions(totalMonthlyContribution || 0);
  }, [totalMinPayment, recurringDebt, totalMonthlyContribution]);
  
  // Update monthly income for the active month and calculate left to allocate
  useEffect(() => {
    // Calculate income for the specific active month
    if (displayTransactions && displayTransactions.length > 0) {
      try {
        const incomeForActiveMonth = calculateMonthIncome(activeMonth, displayTransactions);
        setMonthlyIncome(incomeForActiveMonth);
        
        // Calculate left to allocate with the period-specific income
        const totalCommittedFunds = totalAllocated + fixedExpenses + totalDebtPayments + totalGoalContributions;
        setLeftToAllocate(incomeForActiveMonth - totalCommittedFunds);
      } catch (error) {
        console.error("Error calculating monthly income for month:", error);
        // Fallback to general recurring income
        setMonthlyIncome(recurringIncome);
        
        // Calculate left to allocate with recurring income
        const totalCommittedFunds = totalAllocated + fixedExpenses + totalDebtPayments + totalGoalContributions;
        setLeftToAllocate(recurringIncome - totalCommittedFunds);
      }
    } else {
      // Fallback to general recurring income if no transactions data available
      setMonthlyIncome(recurringIncome);
      
      // Calculate left to allocate with recurring income
      const totalCommittedFunds = totalAllocated + fixedExpenses + totalDebtPayments + totalGoalContributions;
      setLeftToAllocate(recurringIncome - totalCommittedFunds);
    }
  }, [activeMonth, recurringIncome, totalAllocated, fixedExpenses, totalDebtPayments, totalGoalContributions, displayTransactions, calculateMonthIncome]);
  
  // Function to check and copy budget entries if needed
  const checkAndCopyBudgetEntries = useCallback(async (targetMonth: Date, sourceMonth: Date) => {
    try {
      const entries = await getBudgetEntriesForMonth(targetMonth);
      if (entries.length === 0) {
        // No entries for this month, copy from source month
        console.log(`No budget entries found for ${format(targetMonth, 'MMMM yyyy')}, copying from ${format(sourceMonth, 'MMMM yyyy')}`);
        await copyBudgetEntriesFromPreviousMonth(targetMonth, sourceMonth);
      }
    } catch (err) {
      console.error("Error checking/copying budget entries:", err);
    }
  }, []);

  // Function to load budget data for the active month
  const loadBudgetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get categories from database
      const categories = await getBudgetCategories();
      
      // If no categories found, initialize default ones
      if (categories.length === 0) {
        await initializeDefaultBudgetCategories();
        const newCategories = await getBudgetCategories();
        
        if (newCategories.length === 0) {
          throw new Error('Failed to initialize budget categories');
        }
      }
      
      // If we have a previous month and have changed months, check if we need to copy entries
      if (previousMonth && previousMonth.getTime() !== activeMonth.getTime()) {
        await checkAndCopyBudgetEntries(activeMonth, previousMonth);
      }
      
      // Get budget summary for current month
      const summary = await getMonthlyBudgetSummary(activeMonth);
      
      // Map summary data to component state
      const formattedCategories = summary.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        allocated: cat.allocated,
        spent: cat.spent,
        icon: getIconComponent(cat.icon),
        color: cat.color
      }));
      
      setBudgetCategories(formattedCategories);
      setTotalAllocated(summary.totalAllocated);
      setTotalSpent(summary.totalSpent);
      setRemainingBudget(summary.remainingBudget);
      setActivePeriod(summary.month);
      
      // Update previous month to current month for next comparison
      setPreviousMonth(activeMonth);
    } catch (err) {
      console.error('Error loading budget data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading budget data'));
      
      // Use fallback data
      const fallbackCategories = [
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
  }, [activeMonth, previousMonth, checkAndCopyBudgetEntries]);
  
  // Load data on mount and when active month changes
  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);
  
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
  const addCategory = useCallback(async (category: Omit<BudgetCategory, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Convert LucideIcon to string name
      const iconName = Object.entries({
        Home, ShoppingCart, Car, Utensils, Coffee, Briefcase, Film, Heart, ShoppingBag, MoreHorizontal
      }).find(([_, icon]) => icon === category.icon)?.[0] || 'ShoppingCart';
      
      // Create category in database
      await createBudgetCategory({
        name: category.name,
        allocated: category.allocated,
        spent: 0,
        icon: iconName || '',
        color: category.color
      });
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err instanceof Error ? err : new Error('Failed to add category'));
    } finally {
      setIsLoading(false);
    }
  }, [loadBudgetData]);
  
  // Update an existing budget category
  const updateCategory = useCallback(async (id: number, category: Partial<BudgetCategory>) => {
    try {
      setIsLoading(true);
      
      // Convert icon if provided
      let iconName;
      if (category.icon) {
        iconName = Object.entries({
          Home, ShoppingCart, Car, Utensils, Coffee, Briefcase, Film, Heart, ShoppingBag, MoreHorizontal
        }).find(([_, icon]) => icon === category.icon)?.[0] || '';
      }
      
      // Update category in database
      await updateBudgetCategory(id, {
        ...(category.name ? { name: category.name } : {}),
        ...(category.allocated !== undefined ? { allocated: category.allocated } : {}),
        ...(category.spent !== undefined ? { spent: category.spent } : {}),
        ...(iconName ? { icon: iconName } : {}),
        ...(category.color ? { color: category.color } : {})
      });
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err : new Error('Failed to update category'));
    } finally {
      setIsLoading(false);
    }
  }, [loadBudgetData]);
  
  // Delete a budget category
  const deleteCategory = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      
      // Delete category from database
      await deleteBudgetCategory(id);
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete category'));
    } finally {
      setIsLoading(false);
    }
  }, [loadBudgetData]);
  
  // Set allocation for a category for the current month
  const setAllocation = useCallback(async (categoryId: number, amount: number) => {
    try {
      setIsLoading(true);
      
      // Find current entry for this category
      const category = budgetCategories.find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Save budget entry
      await saveBudgetEntry({
        category_id: categoryId,
        month: activeMonth.toISOString(),
        allocated: amount,
        spent: category.spent // Keep existing spent amount
      });
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error setting allocation:', err);
      setError(err instanceof Error ? err : new Error('Failed to set allocation'));
    } finally {
      setIsLoading(false);
    }
  }, [activeMonth, budgetCategories, loadBudgetData]);
  
  // Add a transaction to a category
  const addTransaction = useCallback(async (categoryId: number, amount: number, description?: string) => {
    try {
      setIsLoading(true);
      
      // Add transaction
      await addBudgetTransaction({
        category_id: categoryId,
        amount: Math.abs(amount), // Ensure positive value for amount (spending is positive in this context)
        date: new Date().toISOString(),
        description: description || ''
      });
      
      // Refresh data
      await loadBudgetData();
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err : new Error('Failed to add transaction'));
    } finally {
      setIsLoading(false);
    }
  }, [loadBudgetData]);
  
  // Manual refresh function
  const refreshData = useCallback(async () => {
    await loadBudgetData();
  }, [loadBudgetData]);

  return {
    activePeriod,
    budgetCategories,
    totalAllocated,
    totalSpent,
    remainingBudget,
    monthlyIncome,
    fixedExpenses,
    leftToAllocate,
    totalDebtPayments,
    totalGoalContributions,
    isLoading,
    error,
    setActivePeriod: (period: string) => {
      try {
        // Parse the period string (e.g., "May 2023") to a Date
        const date = parseISO(`${period}-01`); // Add day for parsing
        setActiveMonth(startOfMonth(date));
      } catch (err) {
        console.error('Error parsing period:', err);
      }
    },
    addCategory,
    updateCategory,
    deleteCategory,
    setAllocation,
    addTransaction,
    nextMonth,
    prevMonth,
    refreshData
  };
} 