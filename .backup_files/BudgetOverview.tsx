'use client'

import { ArrowUp, ArrowDown, ChevronRight } from 'lucide-react'
import { useActiveBudget } from '@/hooks/useSupabaseData'

const BudgetOverview = () => {
  const { budgetCategories, totalAllocated, totalSpent, isLoading, error } = useActiveBudget();
  
  // Calculate derived values from Supabase data or use fallbacks
  const income = 5200; // This would come from transactions data later
  const expenses = totalSpent || 3870;
  const savings = income - expenses;
  const savingsRate = Math.round((savings / income) * 100 * 10) / 10; // Round to one decimal
  
  // Create budget summary data object from real data or fallback to mock data
  const budgetData = {
    income,
    expenses,
    savings,
    savingsRate,
    categories: [
      { 
        name: 'Housing',
        budgeted: 1500,
        spent: 1200,
        percentage: 80,
        status: 'normal' // normal, warning, danger
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
  }

  // Function to determine the status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  // Display loading state
  if (isLoading) {
    return (
      <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 h-full w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1F3A93]">Budget Overview</h2>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-200 rounded-lg h-16"></div>
            <div className="p-4 bg-gray-200 rounded-lg h-16"></div>
          </div>
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-2 bg-gray-200 rounded-full w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 h-full w-full">
        <div className="text-red-500">
          Error loading budget data: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#1F3A93]">Budget Overview</h2>
      </div>

      {/* Income & Expenses Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-600 mb-1">
            <ArrowDown className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Income</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            ${budgetData.income.toLocaleString()}
          </div>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-600 mb-1">
            <ArrowUp className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Expenses</span>
          </div>
          <div className="text-xl font-bold text-red-700">
            ${budgetData.expenses.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Savings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#4A4A4A]">Monthly Savings</span>
          <span className="text-sm font-medium text-[#4A4A4A]">
            ${budgetData.savings.toLocaleString()} ({budgetData.savingsRate}%)
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full">
          <div 
            className="h-2 bg-[#1F3A93] rounded-full"
            style={{ width: `${budgetData.savingsRate}%` }}
          ></div>
        </div>
      </div>

      {/* Category Budgets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#4A4A4A]">Top Categories</h3>
          <button className="text-xs text-[#1F3A93] flex items-center hover:underline">
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        
        <div className="space-y-4">
          {budgetData.categories.map((category, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#4A4A4A]">{category.name}</span>
                <span className="text-xs font-medium text-[#4A4A4A]">
                  ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                <div 
                  className={`h-1.5 rounded-full ${getStatusColor(category.status)}`}
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BudgetOverview 