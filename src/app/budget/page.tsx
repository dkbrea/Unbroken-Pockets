'use client'

import React, { useState } from 'react'
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
  Target
} from 'lucide-react'
import { useBudgetData } from '@/hooks/useBudgetData'
import { format, parseISO } from 'date-fns'
import { BudgetCategory } from '@/hooks/useBudgetData'

// Budget Category Form
type CategoryFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  title: string;
}

const CategoryForm = ({ onSubmit, onCancel, initialData, title }: CategoryFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    allocated: initialData?.allocated || 0,
    icon: initialData?.iconName || 'ShoppingCart',
    color: initialData?.color || 'text-green-600 bg-green-100'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'allocated' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Map of available icons with their display names
  const availableIcons = [
    { name: 'ShoppingCart', label: 'Shopping Cart' },
    { name: 'Utensils', label: 'Dining' },
    { name: 'Car', label: 'Transportation' },
    { name: 'Coffee', label: 'Entertainment' },
    { name: 'ShoppingBag', label: 'Shopping' },
    { name: 'Heart', label: 'Personal Care' },
    { name: 'Home', label: 'Housing' },
    { name: 'Film', label: 'Movies' }, 
    { name: 'Briefcase', label: 'Work' },
    { name: 'MoreHorizontal', label: 'Miscellaneous' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="allocated" className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="allocated"
                name="allocated"
                value={formData.allocated}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-8 border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <select
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            >
              {availableIcons.map(icon => (
                <option key={icon.name} value={icon.name}>{icon.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text-blue-600 bg-blue-100">Blue</option>
              <option value="text-green-600 bg-green-100">Green</option>
              <option value="text-red-600 bg-red-100">Red</option>
              <option value="text-yellow-600 bg-yellow-100">Yellow</option>
              <option value="text-purple-600 bg-purple-100">Purple</option>
              <option value="text-pink-600 bg-pink-100">Pink</option>
              <option value="text-indigo-600 bg-indigo-100">Indigo</option>
              <option value="text-gray-600 bg-gray-100">Gray</option>
            </select>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Add'} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transaction Form Component
type TransactionFormProps = {
  categories: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const TransactionForm = ({ categories, onSubmit, onCancel }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || 0,
    amount: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Transaction</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className="w-full pl-8 border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Allocation Form Component
type AllocationFormProps = {
  category: any;
  onSubmit: (categoryId: number, amount: number) => void;
  onCancel: () => void;
  leftToAllocate: number;
  totalDebtPayments: number;
  totalGoalContributions: number;
  fixedExpenses: number;
}

const AllocationForm = ({ 
  category, 
  onSubmit, 
  onCancel, 
  leftToAllocate,
  totalDebtPayments,
  totalGoalContributions,
  fixedExpenses
}: AllocationFormProps) => {
  const [amount, setAmount] = useState(category.allocated);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(category.id, amount);
  };
  
  const handleAllocateRemaining = () => {
    // Allocate the remaining amount + any amount already allocated to this category
    setAmount(category.allocated + leftToAllocate);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Set Budget for {category.name}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Monthly Allocation</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-8 border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Left to allocate info */}
          {leftToAllocate > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Left to allocate:</span>
                <span className="font-medium text-yellow-800">${leftToAllocate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="mb-2 text-xs text-yellow-700">
                This amount is already accounting for:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {fixedExpenses > 0 && (
                    <li>Fixed expenses: ${fixedExpenses.toLocaleString('en-US', { maximumFractionDigits: 2 })}</li>
                  )}
                  {totalDebtPayments > 0 && (
                    <li>Debt payments: ${totalDebtPayments.toLocaleString('en-US', { maximumFractionDigits: 2 })}</li>
                  )}
                  {totalGoalContributions > 0 && (
                    <li>Goal contributions: ${totalGoalContributions.toLocaleString('en-US', { maximumFractionDigits: 2 })}</li>
                  )}
                </ul>
              </div>
              
              <button
                type="button"
                onClick={handleAllocateRemaining}
                className="w-full py-2 px-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium rounded"
              >
                Allocate Remaining Funds to This Category
              </button>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Budget() {
  const {
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
  
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate total expenses
  const totalExpenses = totalAllocated + fixedExpenses + totalDebtPayments + totalGoalContributions;
  
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

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Variable Expense Budget</h1>
        
        <div className="flex flex-wrap items-center gap-3">
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
      
      {isLoading ? (
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
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalAllocated > 0 ? `${((totalSpent / totalAllocated) * 100).toFixed(1)}%` : '0%'} of variable budget
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
                      const remaining = category.allocated - category.spent;
                      const percentUsed = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
                      
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
                            ${category.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {remaining < 0 && ' over'}
                            </div>
                            {category.allocated > 0 && (
                              <div className="text-xs text-gray-500">
                                {remaining >= 0 ? (100 - percentUsed).toFixed(1) : 0}% left
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  percentUsed > 100 ? 'bg-red-500' : 
                                  percentUsed > 90 ? 'bg-orange-500' : 
                                  percentUsed > 70 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
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
      
      {showAllocationModal && selectedCategory && (
        <AllocationForm
          category={selectedCategory}
          onSubmit={handleUpdateAllocation}
          onCancel={() => {
            setShowAllocationModal(false);
            setSelectedCategory(null);
          }}
          leftToAllocate={leftToAllocate}
          totalDebtPayments={totalDebtPayments}
          totalGoalContributions={totalGoalContributions}
          fixedExpenses={fixedExpenses}
        />
      )}
    </div>
  );
}