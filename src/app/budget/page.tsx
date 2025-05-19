'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Filter, 
  Plus, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Calculator,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Home,
  ShoppingCart,
  Car,
  Utensils,
  Coffee,
  Briefcase,
  Film,
  Heart,
  ShoppingBag,
  MoreHorizontal,
  CreditCard as CreditCardIcon,
  Target,
  Calendar as CalendarIcon
} from 'lucide-react'
import { useBudgetData } from '@/hooks/useBudgetData'
import { format, parseISO, startOfMonth } from 'date-fns'
import { BudgetCategory } from '@/hooks/useBudgetData'
import { getMonthlyBudgetSummary } from '@/lib/services/budgetService'
import { useRecurringData } from '@/hooks/useRecurringData'
import { useFixedExpensesData } from '@/hooks/useFixedExpensesData'
import { useIncomeSourcesData } from '@/hooks/useIncomeSourcesData'
import { useDebtData } from '@/hooks/useDebtData'
import { useGoalsData } from '@/hooks/useGoalsData'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { AllocationForm } from '@/components/forms/AllocationForm'
import { supabase } from '@/lib/supabase'
import { MonthlyFlowHeader } from '@/components/MonthlyFlowHeader'
import { getAuthenticatedUserId } from '@/lib/auth/authUtils'

// Add FinancialGoal type definition
type FinancialGoal = {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  contribution_amount: number; 
  targetDate: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Budget() {
  const {
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
    setActivePeriod,
    addCategory,
    updateCategory,
    deleteCategory,
    setAllocation,
    addTransaction,
    nextMonth,
    prevMonth,
    refreshData
  } = useBudgetData();
  
  // Get recurring data for income and fixed expenses
  const { 
    recurringTransactions,
    calculateMonthIncome,
    calculateMonthExpenses,
    calculateMonthDebt
  } = useRecurringData();

  // Get fixed expenses data
  const { fixedExpenses: fixedExpensesList } = useFixedExpensesData();

  // Get income sources data
  const { incomeSources } = useIncomeSourcesData();

  // Get debt data
  const { 
    debts,
    updateDebtPayment,
  } = useDebtData();

  // Get goals data
  const { 
    financialGoals,
    updateGoalContribution,
  } = useGoalsData();
  
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'forecast'>('current');
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  
  // Calculate total expenses including subscriptions
  const totalExpenses = totalAllocated + fixedExpenses + totalSubscriptions + totalDebtPayments + totalGoalContributions;
  
  // Load forecast data when switching to forecast view
  useEffect(() => {
    if (viewMode === 'forecast' && !isLoadingForecast && financialGoals.length > 0) {
      loadForecastData();
    }
  }, [viewMode, financialGoals]);

  const loadForecastData = async () => {
    setIsLoadingForecast(true);
    try {
      // Get authenticated user ID
      const userId = await getAuthenticatedUserId();
      if (!userId) {
        console.error('User not authenticated. Cannot load forecast data.');
        throw new Error('User not authenticated');
      }
      
      console.log('Loading forecast data for user:', userId);
      
      const currentYear = new Date().getFullYear();
      // Create dates for the first day of each month
      const months = Array.from({ length: 12 }, (_, i) => startOfMonth(new Date(currentYear, i, 1)));
      
      // First get the current month's budget entries to use as defaults
      const currentMonth = startOfMonth(new Date());
      console.log('Loading current month summary for:', format(currentMonth, 'MMMM yyyy'));
      const currentMonthSummary = await getMonthlyBudgetSummary(currentMonth, userId);
      
      // Get all monthly summaries
      const forecastPromises = months.map(async month => {
        console.log('Loading forecast data for month:', format(month, 'MMMM yyyy'));
        const summary = await getMonthlyBudgetSummary(month, userId);
        
        // For each category in the summary, if there's no allocation, use the current month's allocation
        summary.categories = summary.categories.map(cat => {
          const currentMonthCat = currentMonthSummary.categories.find(c => c.id === cat.id);
          return {
            ...cat,
            allocated: cat.allocated || (currentMonthCat?.allocated || 0)
          };
        });
        
        return summary;
      });
      
      const monthlySummaries = await Promise.all(forecastPromises);

      // Calculate income sources for each month
      const incomeSourcesByMonth = months.map(month => {
        return incomeSources.map(source => ({
          ...source,
          amount: calculateMonthIncome(month, [{
            id: source.id,
            name: source.name,
            amount: Math.abs(source.amount),
            category: source.category,
            frequency: source.frequency || 'Monthly',
            nextDate: source.next_date,
            type: 'income',
            description: source.description || '',
            status: 'active',
            paymentMethod: '',
            createdAt: '',
            updatedAt: '',
            startDate: '',
            user_id: ''
          }])
        }));
      });

      // Calculate fixed expenses for each month
      const fixedExpensesByMonth = months.map(month => {
        return fixedExpensesList.map(expense => ({
          ...expense,
          amount: calculateMonthExpenses(month, [{
            id: expense.id,
            name: expense.name,
            amount: -Math.abs(expense.amount),
            category: expense.category,
            frequency: expense.frequency || 'Monthly',
            nextDate: expense.next_date,
            type: 'expense',
            description: expense.description || '',
            status: 'active',
            paymentMethod: '',
            createdAt: '',
            updatedAt: '',
            startDate: '',
            user_id: ''
          }])
        }));
      });

      // Fetch all monthly debt payments for the year
      const { data: monthlyDebtPayments, error: debtPaymentsError } = await supabase
        .from('debt_payments_forecast')
        .select('*')
        .eq('user_id', userId)
        .gte('month', `${currentYear}-01`)
        .lte('month', `${currentYear}-12`);

      if (debtPaymentsError) {
        console.error('Error fetching monthly debt payments:', debtPaymentsError);
        // Continue with default values if there's an error
      }

      // Calculate debt payments for each month
      const debtPaymentsByMonth = months.map((month, monthIndex) => {
        const monthStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
        
        return debts.map(debt => {
          // Find month-specific payment if it exists
          const monthlyPayment = monthlyDebtPayments?.find(
            mp => mp.debt_id === debt.id && mp.month === monthStr
          );

          return {
            ...debt,
            // Use month-specific payment if it exists, otherwise use default minimum payment
            // Store as negative to represent payment
            amount: monthlyPayment ? Math.abs(monthlyPayment.amount) : Math.abs(debt.minimumPayment),
            status: 'active' as 'active',
          };
        });
      });

      // Fetch all monthly goal contributions for the year
      const { data: monthlyContributions, error: contributionsError } = await supabase
        .from('goal_monthly_contributions')
        .select('*')
        .gte('month', `${currentYear}-01`)
        .lte('month', `${currentYear}-12`);

      if (contributionsError) throw contributionsError;

      // Calculate savings goals for each month
      const savingsByMonth = months.map((month, monthIndex) => {
        const monthStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
        
        return financialGoals.map(goal => {
          // Find month-specific contribution if it exists
          const monthlyContribution = monthlyContributions?.find(
            mc => mc.goal_id === goal.id && mc.month === monthStr
          );

          return {
            id: goal.id,
            ...goal,
            // Use month-specific contribution if it exists, otherwise use default
            amount: monthlyContribution?.amount ?? goal.monthlyContribution
          };
        });
      });

      setForecastData({
        monthlySummaries,
        incomeSourcesByMonth,
        fixedExpensesByMonth,
        debtPaymentsByMonth,
        savingsByMonth,
        months
      });
    } catch (err) {
      console.error('Error loading forecast data:', err);
    } finally {
      setIsLoadingForecast(false);
    }
  };
  
  // Handle adding a new category
  const handleAddCategory = async (categoryData: any) => {
    try {
      setIsSubmitting(true);
      await addCategory(categoryData);
      setShowNewCategoryModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle editing a category
  const handleEditCategory = async (categoryData: any) => {
    if (!selectedCategory) return;
    
    try {
      setIsSubmitting(true);
      
      // When updating, we need to convert the icon string back to a Lucide icon component
      // for the hook's updateCategory function which expects a LucideIcon
      const iconComponentMap = {
        'Home': Home,
        'ShoppingCart': ShoppingCart,
        'Car': Car,
        'Utensils': Utensils,
        'Coffee': Coffee,
        'Briefcase': Briefcase,
        'Film': Film,
        'Heart': Heart,
        'ShoppingBag': ShoppingBag,
        'MoreHorizontal': MoreHorizontal
      };
      
      // Get the icon component from the map using the string name
      const iconComponent = iconComponentMap[categoryData.icon as keyof typeof iconComponentMap] || ShoppingCart;
      
      await updateCategory(selectedCategory.id, {
        name: categoryData.name,
        allocated: categoryData.allocated,
        icon: iconComponent,
        color: categoryData.color
      });
      
      setShowEditCategoryModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting a category
  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Are you sure you want to delete the "${category.name}" category?`)) return;
    
    try {
      setIsSubmitting(true);
      await deleteCategory(category.id);
    } catch (err) {
      console.error('Error deleting category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle updating allocation
  const handleUpdateAllocation = async (categoryId: number, amount: number) => {
    try {
      setIsSubmitting(true);
      await setAllocation(categoryId, amount);
      setShowAllocationModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error updating allocation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle adding a transaction
  const handleAddTransaction = async (transactionData: any) => {
    try {
      setIsSubmitting(true);
      await addTransaction(
        transactionData.categoryId,
        transactionData.amount,
        transactionData.description
      );
      setShowTransactionModal(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  type ForecastData = {
    monthlySummaries: any[];
    incomeSourcesByMonth: any[][];
    fixedExpensesByMonth: any[][];
    debtPaymentsByMonth: any[][];
    savingsByMonth: any[][];
    months: Date[];
  };
  const [forecastData, setForecastData] = useState<ForecastData>({
    monthlySummaries: [],
    incomeSourcesByMonth: [],
    fixedExpensesByMonth: [],
    debtPaymentsByMonth: [],
    savingsByMonth: [],
    months: []
  });

  // Add new handler functions for debt and goal updates
  const handleUpdateDebtPayment = async (debtId: number, amount: number, monthIndex?: number) => {
    try {
      setIsSubmitting(true);
      // Call your API or service to update the debt payment
      if (monthIndex !== undefined && viewMode === 'forecast') {
        // For forecast view, use month-specific updates
        const currentYear = new Date().getFullYear();
        const monthStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
        await updateDebtPayment(debtId, amount, monthStr);
      } else {
        // For current view, use the regular update
        await updateDebtPayment(debtId, amount);
      }
      refreshData();
    } catch (err) {
      console.error('Error updating debt payment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGoalContribution = async (goalId: number, amount: number, monthIndex: number) => {
    try {
      setIsSubmitting(true);
      const currentYear = new Date().getFullYear();
      const monthStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
      
      const success = await updateGoalContribution(goalId, amount, monthStr);
      
      if (!success) {
        throw new Error('Failed to update goal contribution');
      }

      // Update local state with new goal amount and recalculate totals
      setForecastData(prev => {
        const newState = { ...prev };
        
        // Update the specific goal's amount
        newState.savingsByMonth = prev.savingsByMonth.map((monthData, idx) => 
          idx === monthIndex
            ? monthData.map(goal => 
                goal.id === goalId ? { ...goal, amount } : goal
              )
            : monthData
        );

        // Update monthly summaries to reflect new goal amount
        newState.monthlySummaries = prev.monthlySummaries.map((summary, idx) => {
          if (idx === monthIndex) {
            const newGoalTotal = newState.savingsByMonth[idx].reduce((sum, goal) => sum + (goal.amount || 0), 0);
            return {
              ...summary,
              totalGoalContributions: newGoalTotal
            };
          }
          return summary;
        });

        return newState;
      });
    } catch (err) {
      console.error('Error updating goal contribution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the editingCell state type
  const [editingCell, setEditingCell] = useState<{
    id: number;
    month: number;
    type: 'expense'|'debt'|'goal';
    entityType: 'category'|'debt'|'goal';
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Helper function to handle cell edit completion
  const handleCellEditComplete = async (id: number, type: 'expense'|'debt'|'goal', entityType: 'category'|'debt'|'goal', amount: number) => {
    try {
      // First update the backend
      if (type === 'expense' && entityType === 'category') {
        await handleUpdateAllocation(id, amount);
      } else if (type === 'debt' && entityType === 'debt') {
        await handleUpdateDebtPayment(id, amount, editingCell?.month);
      } else if (type === 'goal' && entityType === 'goal') {
        await handleUpdateGoalContribution(id, amount, editingCell?.month || 0);
      }

      // Then update the local state
      setForecastData(prev => {
        const newState = { ...prev };
        
        if (type === 'expense' && entityType === 'category') {
          newState.monthlySummaries = prev.monthlySummaries.map((month, idx) => 
            idx === editingCell?.month
              ? {
                  ...month,
                  categories: month.categories.map(cat => 
                    cat.id === id ? { ...cat, allocated: amount } : cat
                  )
                }
              : month
          );
        } else if (type === 'debt' && entityType === 'debt') {
          newState.debtPaymentsByMonth = prev.debtPaymentsByMonth.map((month, idx) => 
            idx === editingCell?.month
              ? month.map(debt => 
                  debt.id === id ? { ...debt, amount: -Math.abs(amount) } : debt
                )
              : month
          );
        } else if (type === 'goal' && entityType === 'goal') {
          newState.savingsByMonth = prev.savingsByMonth.map((month, idx) => 
            idx === editingCell?.month
              ? month.map(goal => 
                  goal.id === id ? { ...goal, amount } : goal
                )
              : month
          );
        }
        
        return newState;
      });
    } catch (err) {
      console.error('Error updating amount:', err);
    } finally {
      // Always clear the editing state
      setEditingCell(null);
      setEditValue('');
    }
  };

  return (
    <div className="w-full">
      <style jsx global>{`
        .forecast-scroll-wrapper {
          overflow-x: auto;
          width: 100%;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
          position: relative;
        }
        .forecast-table {
          table-layout: fixed;
          width: 1400px;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        /* Column sizing */
        .forecast-label-col {
          width: 180px;
          min-width: 180px;
          max-width: 180px;
          position: sticky;
          left: 0;
          z-index: 20;
          background: inherit;
        }
        .forecast-month-col {
          width: 200px;
          min-width: 200px;
          max-width: 200px;
        }
        
        /* Main header styles */
        .forecast-table thead {
          position: sticky !important;
          top: 0;
          z-index: 50;
          background: white;
        }
        .forecast-table thead th {
          background: white;
          position: sticky !important;
          top: 0;
          height: 120px;
        }
        .forecast-table thead th.forecast-label-col {
          z-index: 51;
          left: 0;
          background: white;
        }
        
        /* Section header styles */
        tr.section-header {
          position: sticky !important;
          top: 120px !important;
          background: inherit;
          z-index: 40;
        }
        
        tr.section-header td {
          position: sticky !important;
          top: 120px !important;
          background: inherit !important;
          z-index: 40;
        }
        
        tr.section-header td:first-child {
          position: sticky !important;
          left: 0;
          z-index: 41;
        }

        /* Section background colors */
        .income-section.section-header td {
          background-color: rgb(239 246 255) !important;
        }
        .fixed-section.section-header td {
          background-color: rgb(254 242 242) !important;
        }
        .subscriptions-section.section-header td {
          background-color: rgb(239 246 255) !important;
        }
        .variable-section.section-header td {
          background-color: rgb(240 253 244) !important;
        }
        .debt-section.section-header td {
          background-color: rgb(250 245 255) !important;
        }
        .goals-section.section-header td {
          background-color: rgb(254 252 232) !important;
        }

        /* Row background colors */
        .income-section-row td { background-color: rgb(239 246 255); }
        .fixed-section-row td { background-color: rgb(254 242 242); }
        .subscriptions-section-row td { background-color: rgb(239 246 255); }
        .variable-section-row td { background-color: rgb(240 253 244); }
        .debt-section-row td { background-color: rgb(250 245 255); }
        .goals-section-row td { background-color: rgb(254 252 232); }

        /* First column in regular rows */
        .forecast-label-col {
          position: sticky !important;
          left: 0;
          z-index: 20;
        }
      `}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Variable Expense Budget</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'current' 
                  ? 'bg-[#1F3A93] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('current')}
            >
              Current Month
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'forecast' 
                  ? 'bg-[#1F3A93] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('forecast')}
            >
              Year Forecast
            </button>
          </div>

          {viewMode === 'current' && (
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              onClick={prevMonth}
              disabled={isLoading}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="px-3 py-2 flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-[#4A4A4A]" />
              <span className="text-sm font-medium text-[#4A4A4A]">{activePeriod}</span>
            </div>
            
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              onClick={nextMonth}
              disabled={isLoading}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          )}
          
          <button
            className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5] disabled:opacity-50"
            onClick={() => setShowTransactionModal(true)}
            disabled={isLoading || budgetCategories.length === 0}
          >
            <Calculator className="mr-2 h-4 w-4 text-[#4A4A4A]" />
            Add Expense
          </button>
          
          <button
            className="flex items-center bg-[#1F3A93] text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-[#152C70] disabled:opacity-50"
            onClick={() => setShowNewCategoryModal(true)}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </button>
        </div>
      </div>
      
      {viewMode === 'current' ? (
        isLoading ? (
        <div className="w-full py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3A93]"></div>
        </div>
      ) : error ? (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={refreshData}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Budget Status Bar */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Budget Status</h3>
              {monthlyIncome > 0 && (
                <div className="text-sm text-gray-500">
                  {leftToAllocate === 0 
                    ? "Zero-based budget achieved" 
                    : leftToAllocate > 0 
                      ? `$${leftToAllocate.toLocaleString('en-US', { maximumFractionDigits: 2 })} left to allocate`
                      : "Over-allocated budget"}
                </div>
              )}
            </div>
            
            {monthlyIncome > 0 ? (
              <>
                {/* Monthly Income Breakdown */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Monthly Income:</span>
                    <span className="font-medium">${monthlyIncome.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="space-y-2 pl-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-3 w-3 mr-2 text-blue-500" />
                        <span>Variable Expenses:</span>
                      </div>
                      <span>${totalAllocated.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <div className="flex items-center">
                        <Calculator className="h-3 w-3 mr-2 text-orange-500" />
                        <span>Fixed Expenses:</span>
                      </div>
                      <span>${fixedExpenses.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-2 text-blue-500" />
                        <span>Subscriptions:</span>
                      </div>
                      <span>${totalSubscriptions.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <div className="flex items-center">
                        <CreditCard className="h-3 w-3 mr-2 text-purple-500" />
                        <span>Debt Payments:</span>
                      </div>
                      <span>${totalDebtPayments.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-2 text-green-500" />
                        <span>Goal Contributions:</span>
                      </div>
                      <span>${totalGoalContributions.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-200">
                      <div className="flex items-center">
                        <span className={leftToAllocate > 0 ? 'text-yellow-600' : leftToAllocate === 0 ? 'text-green-600' : 'text-red-600'}>
                          Left to Allocate:
                        </span>
                      </div>
                      <span className={leftToAllocate > 0 ? 'text-yellow-600' : leftToAllocate === 0 ? 'text-green-600' : 'text-red-600'}>
                        ${leftToAllocate.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                  <div 
                    className={`h-4 rounded-full ${
                      totalExpenses > monthlyIncome ? 'bg-red-500' : 
                      totalExpenses === monthlyIncome ? 'bg-green-500' :
                      totalExpenses >= monthlyIncome * 0.9 ? 'bg-yellow-500' : 
                      'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((totalExpenses / monthlyIncome) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <div>$0</div>
                  <div className="font-medium">${monthlyIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                </div>
                
                <div className="mt-2 text-sm">
                  {totalExpenses > monthlyIncome ? (
                    <span className="text-red-600 font-medium">Warning: You've allocated more than your income</span>
                  ) : totalExpenses === monthlyIncome ? (
                    <span className="text-green-600 font-medium">Perfect! You have a zero-based budget</span>
                  ) : totalExpenses >= monthlyIncome * 0.9 ? (
                    <span className="text-yellow-600 font-medium">Almost there! Allocate the remaining ${leftToAllocate.toLocaleString('en-US', { maximumFractionDigits: 2 })} to achieve a zero-based budget</span>
                  ) : (
                    <span className="text-blue-600 font-medium">Keep going! Allocate your income to expense categories to create a zero-based budget</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600 py-2">
                No monthly income recorded. Please add income in the <a href="/recurring" className="text-blue-600 hover:underline">Recurring Income section</a> to see budget allocation status.
              </div>
            )}
          </div>
          
          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Left to Allocate (new card) */}
            <div className={`bg-white border ${leftToAllocate > 0 ? 'border-yellow-300' : 'border-green-300'} rounded-lg shadow-sm p-6 ${leftToAllocate > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-500">Left to Allocate</h3>
                <div className={`p-2 rounded-full ${leftToAllocate > 0 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <ArrowDown className={`h-4 w-4 ${leftToAllocate > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">${leftToAllocate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-1">
                {leftToAllocate > 0 
                  ? "Allocate this amount to achieve a zero-based budget" 
                  : leftToAllocate === 0 
                    ? "Great job! You have a zero-based budget" 
                    : "Warning: You've allocated more than your income"}
              </p>
              {leftToAllocate > 0 && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  *After accounting for fixed expenses, debt payments, and goal contributions
                </p>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-500">Variable Expenses</h3>
                <div className="p-2 rounded-full bg-blue-100">
                  <CreditCardIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-1">
                {monthlyIncome > 0 ? `${((totalAllocated / monthlyIncome) * 100).toFixed(1)}%` : '0%'} of monthly income
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
                <div className="p-2 rounded-full bg-red-100">
                  <ArrowUp className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">${Math.abs(totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalAllocated > 0 ? `${((Math.abs(totalSpent) / totalAllocated) * 100).toFixed(1)}%` : '0%'} of variable budget
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
                <div className="p-2 rounded-full bg-green-100">
                  <ArrowDown className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">${remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalAllocated > 0 ? `${((remainingBudget / totalAllocated) * 100).toFixed(1)}%` : '0%'} of variable budget left
              </p>
            </div>
          </div>
          
          {/* Call-to-action for zero-based budgeting */}
          {leftToAllocate > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
              <div className="p-2 mr-3 rounded-full bg-yellow-100">
                <ArrowDown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">
                  You have ${leftToAllocate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} left to allocate
                </h3>
                <p className="text-sm text-yellow-700">
                  Zero-based budgeting means giving every dollar a job. Allocate your remaining funds to variable expense categories by clicking the "+" button next to any category or create a new category.
                </p>
              </div>
              <button 
                className="ml-auto bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-4 rounded-md text-sm flex items-center"
                onClick={() => setShowNewCategoryModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </button>
            </div>
          )}
          
          {/* Budget Categories */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Variable Expense Categories</h2>
              <div className="text-sm text-gray-500">
                {budgetCategories.length} {budgetCategories.length === 1 ? 'category' : 'categories'}
              </div>
            </div>
            
            {budgetCategories.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
                  <Plus className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No budget categories yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start by creating budget categories for your variable expenses like groceries, dining out, entertainment, etc.
                </p>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowNewCategoryModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Category
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {budgetCategories.map(category => {
                      const categoryRemaining = category.allocated - Math.abs(category.spent);
                      const categoryPercentUsed = category.allocated > 0 ? (Math.abs(category.spent) / category.allocated) * 100 : 0;
                      
                      return (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${category.color} mr-3`}>
                                <category.icon className="h-4 w-4" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button 
                              className="hover:underline flex items-center"
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowAllocationModal(true);
                              }}
                            >
                              ${category.allocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              <Edit3 className="ml-2 h-3 w-3 text-gray-400 group-hover:text-gray-500" />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${Math.abs(category.spent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${categoryRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${Math.abs(categoryRemaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {categoryRemaining < 0 && ' over'}
                            </div>
                            {category.allocated > 0 && (
                              <div className="text-xs text-gray-500">
                                {categoryRemaining >= 0 ? (100 - categoryPercentUsed).toFixed(1) : 0}% left
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  categoryPercentUsed > 100 ? 'bg-red-500' : 
                                  categoryPercentUsed > 90 ? 'bg-orange-500' : 
                                  categoryPercentUsed > 70 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(categoryPercentUsed, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => {
                                  // Map the icon component to a string name for the form
                                  const iconNameMap: Record<string, string> = {
                                    [Home.name]: 'Home',
                                    [ShoppingCart.name]: 'ShoppingCart',
                                    [Car.name]: 'Car',
                                    [Utensils.name]: 'Utensils',
                                    [Coffee.name]: 'Coffee',
                                    [Briefcase.name]: 'Briefcase',
                                    [Film.name]: 'Film',
                                    [Heart.name]: 'Heart',
                                    [ShoppingBag.name]: 'ShoppingBag',
                                    [MoreHorizontal.name]: 'MoreHorizontal'
                                  };
                                  
                                  // Add the string icon name to the category object
                                  const categoryWithIconName = {
                                    ...category,
                                    iconName: iconNameMap[category.icon.name as string] || 'ShoppingCart'
                                  };
                                  
                                  setSelectedCategory(categoryWithIconName);
                                  setShowEditCategoryModal(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteCategory(category)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1F3A93] mb-4">Year Forecast</h2>
            {isLoadingForecast ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Unified Table */}
                <div className="forecast-scroll-wrapper">
                  <table className="forecast-table">
                    <thead>
                      <tr>
                        <th className="forecast-label-col">Category</th>
                        {(forecastData.months ?? []).map((month, index) => {
                          const monthlyIncome = forecastData.incomeSourcesByMonth[index]?.reduce((sum, source) => sum + (source.amount || 0), 0) || 0;
                          const monthlyFixed = forecastData.fixedExpensesByMonth[index]?.reduce((sum, expense) => {
                            // Skip if this is a subscription
                            if (expense.category?.toLowerCase() === 'subscriptions') return sum;
                            return sum + Math.abs(expense.amount || 0);
                          }, 0) || 0;
                          const monthlySubscriptions = recurringTransactions
                            .filter(tx => tx.category?.toLowerCase() === 'subscriptions')
                            .reduce((sum, subscription) => {
                              const monthlyAmount = calculateMonthExpenses(month, [{ ...subscription }]);
                              return sum + Math.abs(monthlyAmount);
                            }, 0);
                          const monthlyVariable = forecastData.monthlySummaries[index]?.categories.reduce((sum, cat) => sum + (cat.allocated || 0), 0) || 0;
                          const monthlyDebt = forecastData.debtPaymentsByMonth[index]?.reduce((sum, debt) => sum + Math.abs(debt.amount || 0), 0) || 0;
                          const monthlyGoals = forecastData.savingsByMonth[index]?.reduce((sum, goal) => sum + (goal.amount || 0), 0) || 0;

                          return (
                            <th key={`month-${index}`} className="forecast-month-col p-0">
                              <div className="month-header-wrapper">
                                <MonthlyFlowHeader
                                  month={month}
                                  income={monthlyIncome}
                                  fixedExpenses={monthlyFixed}
                                  subscriptions={monthlySubscriptions}
                                  variableExpenses={monthlyVariable}
                                  debtPayments={monthlyDebt}
                                  goalContributions={monthlyGoals}
                                />
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Income Section */}
                      <tr className="section-header income-section">
                        <td className="py-2 px-4 font-semibold text-blue-800">Income Sources</td>
                        {Array(12).fill(0).map((_, i) => (
                          <td key={`income-header-${i}`} />
                        ))}
                      </tr>
                      {incomeSources.map((source) => (
                        <tr key={`income-${source.id || source.name}`} className="income-section-row">
                          <td className="forecast-label-col py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">{source.name}</div>
                          </td>
                          {forecastData.months.map((_, index) => {
                            const sourceData = forecastData.incomeSourcesByMonth[index]?.find(s => s.id === source.id);
                            return (
                              <td key={`income-${source.id || source.name}-${index}`} className="forecast-month-col py-2 px-4 text-sm text-gray-900 text-center">
                                ${(sourceData?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Fixed Expenses Section */}
                      <tr className="section-header fixed-section">
                        <td className="py-2 px-4 font-semibold text-red-800">Fixed Expenses</td>
                        {Array(12).fill(0).map((_, i) => (
                          <td key={`fixed-header-${i}`} />
                        ))}
                      </tr>
                      {fixedExpensesList
                        .filter(expense => expense.category?.toLowerCase() !== 'subscriptions')
                        .map((expense) => (
                        <tr key={`fixed-${expense.id || expense.name}`} className="fixed-section-row">
                          <td className="forecast-label-col py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">{expense.name}</div>
                          </td>
                          {forecastData.months.map((_, index) => {
                            const expenseData = forecastData.fixedExpensesByMonth[index]?.find(e => e.id === expense.id);
                            return (
                              <td key={`fixed-${expense.id || expense.name}-${index}`} className="forecast-month-col py-2 px-4 text-sm text-gray-900 text-center">
                                ${Math.abs(expenseData?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Subscriptions Section */}
                      <tr className="section-header subscriptions-section">
                        <td className="py-2 px-4 font-semibold text-blue-800">Subscriptions</td>
                        {Array(12).fill(0).map((_, i) => (
                          <td key={`subs-header-${i}`} />
                        ))}
                      </tr>
                      {recurringTransactions.filter(tx => tx.category?.toLowerCase() === 'subscriptions').map((subscription) => (
                        <tr key={`sub-${subscription.id || subscription.name}`} className="subscriptions-section-row">
                          <td className="forecast-label-col py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">{subscription.name}</div>
                          </td>
                          {forecastData.months.map((month, index) => (
                            <td key={`sub-${subscription.id || subscription.name}-${index}`} className="forecast-month-col py-2 px-4 text-sm text-gray-900 text-center">
                              ${Math.abs(calculateMonthExpenses(month, [{ ...subscription }])).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Variable Expenses Section */}
                      <tr className="section-header variable-section">
                        <td className="py-2 px-4 font-semibold text-green-800">Variable Expenses</td>
                        {Array(12).fill(0).map((_, i) => (
                          <td key={`var-header-${i}`} />
                        ))}
                      </tr>
                      {budgetCategories.map((category) => (
                        <tr key={`var-${category.id}`} className="variable-section-row">
                          <td className="forecast-label-col py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          {(forecastData.months ?? []).map((_, monthIndex) => {
                            // First try to get any month-specific override from monthlySummaries
                            const monthSummary = forecastData.monthlySummaries[monthIndex];
                            const monthSpecificData = monthSummary?.categories?.find(c => c.id === category.id);
                            
                            // If no month-specific override, use the category's current allocation
                            const allocated = monthSpecificData?.allocated ?? category.allocated;
                            
                            return (
                              <td key={`var-${category.id}-${monthIndex}`} className="forecast-month-col py-2 px-4 text-sm text-gray-900 text-center">
                                {editingCell?.id === category.id && 
                                 editingCell?.month === monthIndex && 
                                 editingCell?.type === 'expense' ? (
                                  <input
                                    type="number"
                                    className="w-24 text-center border rounded"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleCellEditComplete(category.id, 'expense', 'category', parseFloat(editValue))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCellEditComplete(category.id, 'expense', 'category', parseFloat(editValue));
                                      }
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    className="hover:underline"
                                    onClick={() => {
                                      setEditingCell({ id: category.id, month: monthIndex, type: 'expense', entityType: 'category' });
                                      setEditValue(allocated?.toString() || '0');
                                    }}
                                  >
                                    ${(allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Debt Section */}
                      <tr className="section-header debt-section">
                        <td className="py-2 px-4 font-semibold text-purple-800">Debt Payments</td>
                        {Array(12).fill(0).map((_, i) => (
                          <td key={`debt-header-${i}`} />
                        ))}
                      </tr>
                      {debts.map((debt) => (
                        <tr key={`debt-${debt.id || debt.name}`} className="debt-section-row">
                          <td className="forecast-label-col py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">{debt.name}</div>
                          </td>
                          {forecastData.debtPaymentsByMonth.map((month, monthIndex) => {
                            const debtData = month.find(d => d.id === debt.id);
                            return (
                              <td key={`debt-${debt.id}-${monthIndex}`} className="forecast-month-col py-2 px-4 text-sm text-gray-900 text-center">
                                {editingCell?.id === debt.id && 
                                 editingCell?.month === monthIndex && 
                                 editingCell?.type === 'debt' ? (
                                  <input
                                    type="number"
                                    className="w-24 text-center border rounded"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleCellEditComplete(debt.id, 'debt', 'debt', parseFloat(editValue))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCellEditComplete(debt.id, 'debt', 'debt', parseFloat(editValue));
                                      }
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    className="hover:underline"
                                    onClick={() => {
                                      setEditingCell({ id: debt.id, month: monthIndex, type: 'debt', entityType: 'debt' });
                                      setEditValue(Math.abs(debtData?.amount || 0).toString());
                                    }}
                                  >
                                    ${Math.abs(debtData?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Goals Section */}
                      <tr className="section-header goals-section">
                        <td className="py-2 px-4 font-semibold text-yellow-800">Savings Goals</td>
                        {Array(12).fill(0).map((_, i) => (
                          <td key={`goal-header-${i}`} />
                        ))}
                      </tr>
                      {financialGoals.map((goal) => (
                        <tr key={`goal-${goal.id || goal.name}`} className="goals-section-row">
                          <td className="forecast-label-col py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">{goal.name}</div>
                          </td>
                          {forecastData.savingsByMonth.map((month, monthIndex) => {
                            const goalData = month.find(g => g.id === goal.id);
                            return (
                              <td key={`goal-${goal.id}-${monthIndex}`} className="forecast-month-col py-2 px-4 text-sm text-gray-900 text-center">
                                {editingCell?.id === goal.id && 
                                 editingCell?.month === monthIndex && 
                                 editingCell?.type === 'goal' ? (
                                  <input
                                    type="number"
                                    className="w-24 text-center border rounded"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleCellEditComplete(goal.id, 'goal', 'goal', parseFloat(editValue))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCellEditComplete(goal.id, 'goal', 'goal', parseFloat(editValue));
                                      }
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    className="hover:underline"
                                    onClick={() => {
                                      setEditingCell({ id: goal.id, month: monthIndex, type: 'goal', entityType: 'goal' });
                                      setEditValue((goalData?.amount || 0).toString());
                                    }}
                                  >
                                    ${(goalData?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showNewCategoryModal && (
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setShowNewCategoryModal(false)}
          title="Add Budget Category"
        />
      )}
      
      {showEditCategoryModal && selectedCategory && (
        <CategoryForm
          onSubmit={handleEditCategory}
          onCancel={() => {
            setShowEditCategoryModal(false);
            setSelectedCategory(null);
          }}
          initialData={selectedCategory}
          title="Edit Budget Category"
        />
      )}
      
      {showTransactionModal && (
        <TransactionForm
          categories={budgetCategories}
          onSubmit={handleAddTransaction}
          onCancel={() => setShowTransactionModal(false)}
        />
      )}
      
      {showAllocationModal && selectedCategory && selectedCategory.entityType !== 'goal' && (
        <AllocationForm
          category={selectedCategory}
          onSubmit={(amount) => {
            if (selectedCategory.entityType === 'debt') {
              handleUpdateDebtPayment(selectedCategory.id, amount);
            } else {
              handleUpdateAllocation(selectedCategory.id, amount);
            }
            setShowAllocationModal(false);
            setSelectedCategory(null);
          }}
          onCancel={() => {
            setShowAllocationModal(false);
            setSelectedCategory(null);
          }}
          leftToAllocate={leftToAllocate}
          totalDebtPayments={totalDebtPayments}
          totalGoalContributions={totalGoalContributions}
          fixedExpenses={fixedExpenses}
          totalSubscriptions={totalSubscriptions}
        />
      )}
    </div>
  );
}