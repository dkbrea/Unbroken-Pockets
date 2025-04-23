'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  CreditCard, 
  X, 
  Calendar, 
  ChevronsUpDown, 
  Check,
  Banknote,
  Building,
  CircleDollarSign,
  Repeat,
  CreditCard as CreditCardIcon,
  PieChart,
  Clock,
  Wallet,
  Landmark,
  PiggyBank
} from 'lucide-react'
import { useTransactionsData } from '@/hooks/useTransactionsData'
import { useAccountsData } from '@/hooks/useAccountsData'
import { useDebtData } from '@/hooks/useDebtData'

// Define interfaces for budget and recurring transactions
interface BudgetCategory {
  id: number;
  name: string;
  allocated: number;
  spent: number;
}

interface RecurringTransaction {
  id: number;
  name: string;
  amount: number;
  category: string;
  next_date: string;
  frequency: string;
}

// Define transaction interface
interface Transaction {
  id: number;
  date: string;
  name: string;
  category: string;
  amount: number;
  account: string;
  notes: string;
  tags: string[];
  transaction_type: 'Fixed Expense' | 'Variable Expense' | 'Income' | 'Debt' | 'Savings';
  // Optional fields for different transaction types
  recurring_id?: number;
  debt_id?: number;
  debt_account_id?: number;
  is_debt_payment?: boolean;
  budget_category_id?: number;
  is_budget_expense?: boolean;
}

type EditTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const EditTransactionModal = ({ isOpen, onClose, transaction }: EditTransactionModalProps) => {
  // Basic transaction fields
  const [id, setId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [sourceAccount, setSourceAccount] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [transactionType, setTransactionType] = useState<'Fixed Expense' | 'Variable Expense' | 'Income' | 'Debt' | 'Savings'>('Variable Expense')
  
  // Transaction configuration
  const [isExpense, setIsExpense] = useState(true)
  const [selectedRecurringId, setSelectedRecurringId] = useState<number | undefined>(undefined)
  const [selectedDebtId, setSelectedDebtId] = useState<number | undefined>(undefined)
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number | undefined>(undefined)
  
  // Get accounts from custom hook - only those that are defined in the Accounts page
  const { accounts = [] } = useAccountsData();
  
  // Get debts from custom hook
  const { debts = [] } = useDebtData();
  
  // Get transaction functions from custom hook
  const { updateTransaction } = useTransactionsData();
  
  // For demonstration purposes, let's define hardcoded categories and recurring transactions
  // In a real implementation, you would fetch these from your API
  const budgetCategories: BudgetCategory[] = [
    { id: 1, name: 'Food & Dining', allocated: 500, spent: 200 },
    { id: 2, name: 'Housing', allocated: 1200, spent: 1200 },
    { id: 3, name: 'Transportation', allocated: 300, spent: 150 },
    { id: 4, name: 'Entertainment', allocated: 200, spent: 50 },
    { id: 5, name: 'Utilities', allocated: 250, spent: 180 }
  ];
  
  const recurringTransactions: RecurringTransaction[] = [
    { id: 1, name: 'Rent', amount: 1200, category: 'Housing', next_date: '2025-04-01', frequency: 'Monthly' },
    { id: 2, name: 'Internet', amount: 60, category: 'Utilities', next_date: '2025-04-15', frequency: 'Monthly' },
    { id: 3, name: 'Phone', amount: 40, category: 'Utilities', next_date: '2025-04-20', frequency: 'Monthly' },
    { id: 4, name: 'Salary', amount: 2100, category: 'Income', next_date: '2025-04-30', frequency: 'Monthly' }
  ];

  // Calculate remaining budget for each category
  const budgetCategoriesWithRemaining = useMemo(() => {
    return budgetCategories.map(cat => ({
      ...cat,
      remaining: cat.allocated - cat.spent
    }));
  }, [budgetCategories]);
  
  // Filter to only payment accounts (non-credit accounts)
  const paymentAccounts = useMemo(() => {
    return accounts.filter(acc => 
      !acc.isHidden && 
      acc.type !== 'credit' && 
      acc.type !== 'loan'
    );
  }, [accounts]);
  
  // Filter for debt accounts only (credit cards, lines of credit)
  const debtAccounts = useMemo(() => {
    return accounts.filter(acc => 
      !acc.isHidden && 
      (acc.type === 'credit' || acc.type === 'loan')
    );
  }, [accounts]);

  // Initialize the form with the transaction data when it changes
  useEffect(() => {
    if (transaction) {
      setId(transaction.id);
      setName(transaction.name);
      setAmount(Math.abs(transaction.amount).toString());
      setDate(transaction.date);
      setCategory(transaction.category);
      setSourceAccount(transaction.account);
      setNotes(transaction.notes || '');
      setTags(transaction.tags ? transaction.tags.join(', ') : '');
      setTransactionType(transaction.transaction_type || 'Variable Expense');
      
      // Set expense/income based on amount
      setIsExpense(transaction.amount < 0);
      
      // Set related fields if they exist
      setSelectedRecurringId(transaction.recurring_id);
      setSelectedDebtId(transaction.debt_id);
      setSelectedBudgetCategoryId(transaction.budget_category_id);
    }
  }, [transaction?.id]); // Only re-run when transaction ID changes, not on every transaction change
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Only reset state when modal is closed
      // We don't need to reset when the modal is open as that would interfere with editing
    }
  }, [isOpen]);

  // Handle selecting a recurring transaction
  const handleRecurringSelect = (id: number) => {
    const selected = recurringTransactions.find(rt => rt.id === parseInt(id.toString()));
    if (selected) {
      setSelectedRecurringId(id);
      setName(selected.name);
      setCategory(selected.category);
      setAmount(Math.abs(selected.amount).toString());
      setIsExpense(selected.amount < 0);
      
      if (selected.next_date) {
        setDate(selected.next_date);
      }
    }
  };
  
  // Handle selecting a debt account for payment
  const handleDebtSelect = (id: number) => {
    const selected = accounts.find(acc => acc.id === id);
    if (selected) {
      setSelectedDebtId(id);
      setName(`Payment to ${selected.name}`);
      setCategory('Debt Payment');
      setTransactionType('Debt');
      
      // Default amount to minimum payment if debt record exists
      const matchingDebt = debts.find(debt => selected && debt.name.toLowerCase().includes(selected.name.toLowerCase()));
      if (matchingDebt) {
        setAmount(matchingDebt.minimumPayment.toString());
      } else {
        setAmount('');
      }
    }
  };
  
  // Handle selecting a budget category
  const handleBudgetCategorySelect = (id: number) => {
    const selected = budgetCategories.find(cat => cat.id === parseInt(id.toString()));
    if (selected) {
      setSelectedBudgetCategoryId(id);
      setCategory(selected.name);
      // Don't set amount - user will input the actual expense amount
      // Don't set name - user will input the specific expense name
    }
  };

  // Set appropriate transaction type when changing between expense/income
  useEffect(() => {
    if (!isExpense && transactionType !== 'Income') {
      setTransactionType('Income');
    } else if (isExpense && transactionType === 'Income') {
      setTransactionType('Variable Expense');
    }
  }, [isExpense, transactionType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !name || !amount || !date || !category || !sourceAccount) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Format amount with correct sign based on transaction type
    const numericAmount = parseFloat(amount);
    const finalAmount = isExpense ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    let updatedTransaction: Partial<Transaction> = {
      date,
      name,
      category,
      amount: finalAmount,
      account: sourceAccount,
      notes,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      transaction_type: transactionType
    };
    
    // Add specific fields based on transaction type
    if (transactionType === 'Fixed Expense') {
      updatedTransaction = {
        ...updatedTransaction,
        recurring_id: selectedRecurringId,
        is_debt_payment: false,
        is_budget_expense: false
      };
    } else if (transactionType === 'Debt') {
      const debtAccount = accounts.find(acc => acc.id === selectedDebtId);
      const matchingDebt = debts.find(debt => 
        debtAccount && debt.name.toLowerCase().includes(debtAccount.name.toLowerCase())
      );
      
      updatedTransaction = {
        ...updatedTransaction,
        debt_id: matchingDebt ? matchingDebt.id : undefined,
        debt_account_id: selectedDebtId,
        is_debt_payment: true,
        is_budget_expense: false
      };
    } else if (transactionType === 'Variable Expense') {
      updatedTransaction = {
        ...updatedTransaction,
        budget_category_id: selectedBudgetCategoryId,
        is_budget_expense: true,
        is_debt_payment: false
      };
    } else {
      // Income and Savings cases
      updatedTransaction = {
        ...updatedTransaction,
        is_debt_payment: false,
        is_budget_expense: false
      };
    }
    
    await updateTransaction(id, updatedTransaction);
    
    // Close modal
    onClose();
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Edit Transaction</h2>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Transaction Type Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === 'Variable Expense' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => setTransactionType('Variable Expense')}
              >
                <CircleDollarSign className="mr-1 h-4 w-4" />
                Variable Expense
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === 'Fixed Expense' 
                    ? 'bg-teal-100 text-teal-700 border border-teal-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType('Fixed Expense');
                  setIsExpense(true);
                }}
              >
                <Clock className="mr-1 h-4 w-4" />
                Fixed Expense
              </button>

              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === 'Income' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType('Income');
                  setIsExpense(false);
                }}
              >
                <Wallet className="mr-1 h-4 w-4" />
                Income
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-3 rounded-md text-sm ${
                  transactionType === 'Debt' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType('Debt');
                  setIsExpense(true);
                }}
              >
                <CreditCardIcon className="mr-1 h-4 w-4" />
                Debt Payment
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-3 rounded-md text-sm ${
                  transactionType === 'Savings' 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType('Savings');
                  setIsExpense(true);
                }}
              >
                <PiggyBank className="mr-1 h-4 w-4" />
                Savings
              </button>
            </div>
          </div>
          
          {/* Recurring Transaction Selector - only show when type is Fixed Expense */}
          {transactionType === 'Fixed Expense' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Recurring Transaction</label>
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedRecurringId || ""}
                  onChange={(e) => handleRecurringSelect(parseInt(e.target.value))}
                >
                  <option value="">Select recurring transaction</option>
                  {recurringTransactions.map(rt => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} - ${Math.abs(rt.amount)} 
                      ({new Date(rt.next_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
          
          {/* Budget Category Selector - only show when type is Variable Expense */}
          {transactionType === 'Variable Expense' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Budget Category</label>
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedBudgetCategoryId || ""}
                  onChange={(e) => handleBudgetCategorySelect(parseInt(e.target.value))}
                >
                  <option value="">Select budget category</option>
                  {budgetCategoriesWithRemaining.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} - ${cat.remaining.toFixed(2)} remaining
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
          
          {/* Debt Account Selector - only show when type is Debt */}
          {transactionType === 'Debt' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Debt Account</label>
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedDebtId || ""}
                  onChange={(e) => handleDebtSelect(parseInt(e.target.value))}
                >
                  <option value="">Select debt account</option>
                  {debtAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} - ${Math.abs(acc.balance).toFixed(2)}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
          
          {/* Date & Amount Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              
              {/* Budget warning if over budget */}
              {transactionType === 'Variable Expense' && 
               selectedBudgetCategoryId && 
               parseFloat(amount || '0') > 0 && 
               (() => {
                 const category = budgetCategoriesWithRemaining.find(c => c.id === selectedBudgetCategoryId);
                 const remaining = category ? category.remaining : 0;
                 return remaining < parseFloat(amount);
               })() && (
                <p className="mt-1 text-xs text-red-600">
                  This expense exceeds your remaining budget for this category.
                </p>
              )}
            </div>
          </div>
          
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g., Grocery shopping, Salary payment"
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {/* Category - don't show for budget expenses as it's set from the budget category */}
          {transactionType !== 'Variable Expense' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g., Food & Dining, Income"
                className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          )}
          
          {/* Account - always the source account */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {transactionType === 'Debt' 
                ? 'Pay From Account' 
                : (transactionType === 'Income' ? 'To Account' : 'From Account')}
            </label>
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sourceAccount}
                onChange={(e) => setSourceAccount(e.target.value)}
                required
              >
                <option value="">Select account</option>
                {/* Only show payment accounts for debt payments */}
                {transactionType === 'Debt' ? (
                  paymentAccounts.map(acc => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name} (${acc.balance.toFixed(2)})
                    </option>
                  ))
                ) : (
                  accounts.filter(a => !a.isHidden).map(acc => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name} (${acc.balance.toFixed(2)})
                      {acc.type === 'credit' || acc.type === 'loan' ? ' - Credit/Debt' : ''}
                    </option>
                  ))
                )}
              </select>
              <Building className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              placeholder="Add any additional details"
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
            <input
              type="text"
              placeholder="e.g., vacation, business, family (comma separated)"
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal; 