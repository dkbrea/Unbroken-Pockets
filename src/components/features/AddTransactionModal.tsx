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
  PiggyBank
} from 'lucide-react'
import { useTransactionsData } from '@/hooks/useTransactionsData'
import { useAccountsData } from '@/hooks/useAccountsData'
import { useDebtData } from '@/hooks/useDebtData'
import { useBudgetData } from '@/hooks/useBudgetData'
import { useFinancialGoalsData } from '@/hooks/useFinancialGoalsData'
import { useFixedExpensesData } from '@/hooks/useFixedExpensesData'
import { useIncomeSourcesData } from '@/hooks/useIncomeSourcesData'
import { Transaction as TransactionData, TransactionType } from '../../types/transaction'

// Define constants for transaction types to ensure type safety
const TRANSACTION_TYPES = {
  VARIABLE_EXPENSE: 'Variable Expense' as const,
  FIXED_EXPENSE: 'Fixed Expense' as const,
  INCOME: 'Income' as const,
  DEBT_PAYMENT: 'Debt Payment' as const,
  GOAL_CONTRIBUTION: 'Goal Contribution' as const
};

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

// Transaction source types
type TransactionSource = 'new' | 'recurring' | 'debt_payment' | 'budget_expense';

type AddTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded?: (transaction: any) => void;
  preselectedAccountId?: string | null;
}

const AddTransactionModal = ({ 
  isOpen, 
  onClose, 
  onTransactionAdded,
  preselectedAccountId
}: AddTransactionModalProps) => {
  // Early exit if the modal is not open
  if (!isOpen) return null;
  
  // Basic transaction fields
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [sourceAccount, setSourceAccount] = useState('')
  const [destinationAccount, setDestinationAccount] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  
  // Transaction configuration
  const [transactionType, setTransactionType] = useState<TransactionType>(TRANSACTION_TYPES.VARIABLE_EXPENSE)
  const [isExpense, setIsExpense] = useState(true)
  const [selectedRecurringId, setSelectedRecurringId] = useState<number | undefined>(undefined)
  const [selectedFixedExpensesId, setSelectedFixedExpensesId] = useState<number | undefined>(undefined)
  const [selectedIncomeSourcesId, setSelectedIncomeSourcesId] = useState<number | undefined>(undefined)
  const [selectedDebtId, setSelectedDebtId] = useState<number | undefined>(undefined)
  const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number | undefined>(undefined)
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>(undefined) 
  
  // Force a refresh when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset all selections
      setSelectedRecurringId(undefined);
      setSelectedFixedExpensesId(undefined);
      setSelectedIncomeSourcesId(undefined);
      setSelectedDebtId(undefined);
      setSelectedBudgetCategoryId(undefined);
      setSelectedGoalId(undefined);
      
      // Reset form fields
      setName('');
      setAmount('');
      setCategory('');
      setDestinationAccount('');
      
      // Set date to today
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setDate(formattedDate);
      
      // If a preselected account ID is provided, set it as the source account
      if (preselectedAccountId) {
        setSourceAccount(preselectedAccountId);
      }
    }
  }, [isOpen, preselectedAccountId]);
  
  // Get accounts from custom hook - only those that are defined in the Accounts page
  const { accounts = [] } = useAccountsData();
  
  // Get debts from custom hook
  const { debts = [] } = useDebtData();

  // Get budget categories from custom hook
  const { budgetCategories = [] } = useBudgetData();
  
  // Get fixed expenses from custom hook
  const fixedExpensesResponse = useFixedExpensesData();
  console.log('DIRECT HOOK OUTPUT - Fixed Expenses Response:', fixedExpensesResponse);
  const { fixedExpenses = [], isLoading: isLoadingFixedExpenses } = fixedExpensesResponse;

  // Get income sources from custom hook
  const incomeSourcesResponse = useIncomeSourcesData();
  console.log('DIRECT HOOK OUTPUT - Income Sources Response:', incomeSourcesResponse);
  const { incomeSources = [], isLoading: isLoadingIncomeSources } = incomeSourcesResponse;

  // Get financial goals from custom hook
  const { financialGoals = [], isLoading } = useFinancialGoalsData();

  // Get transaction functions from custom hook
  const { addTransaction } = useTransactionsData();
  

  // For demonstration purposes, let's define hardcoded recurring transactions
  // In a real implementation, you would fetch these from your API
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

  // Set appropriate transaction type when changing between expense/income
  useEffect(() => {
    if (!isExpense && transactionType !== TRANSACTION_TYPES.INCOME) {
      setTransactionType(TRANSACTION_TYPES.INCOME);
    } else if (isExpense && transactionType === TRANSACTION_TYPES.INCOME) {
      setTransactionType(TRANSACTION_TYPES.VARIABLE_EXPENSE);
    }
  }, [isExpense, transactionType]);
  
  // Reset fields when transaction type changes
  useEffect(() => {
    // Reset selection IDs
    setSelectedRecurringId(undefined);
    setSelectedFixedExpensesId(undefined);
    setSelectedIncomeSourcesId(undefined);
    setSelectedDebtId(undefined);
    setSelectedBudgetCategoryId(undefined);
    setSelectedGoalId(undefined);
    
    // Reset form fields
    setName('');
    setAmount('');
    setCategory('');
    setDestinationAccount('');
    setNotes('');
    setTags('');
    
    // Keep date and account as they likely remain the same across transaction types
  }, [transactionType]);
  
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
  
  // Create safe references to the fixed expenses and income sources arrays
  const safeFixedExpenses = useMemo(() => {
    console.log('Creating safeFixedExpenses with data:', fixedExpenses);
    return Array.isArray(fixedExpenses) ? fixedExpenses : [];
  }, [fixedExpenses]);

  const safeIncomeSources = useMemo(() => {
    console.log('Creating safeIncomeSources with data:', incomeSources);
    return Array.isArray(incomeSources) ? incomeSources : [];
  }, [incomeSources]);
  
  // Create safe reference to financial goals array
  const safeFinancialGoals = useMemo(() => {
    console.log('Creating safeFinancialGoals with data:', financialGoals);
    return Array.isArray(financialGoals) ? financialGoals : [];
  }, [financialGoals]);

  // Handle name and description fields based on transaction type
  useEffect(() => {
    if (transactionType === TRANSACTION_TYPES.INCOME) {
      setName('Income');
    } else if (transactionType === TRANSACTION_TYPES.DEBT_PAYMENT) {
      setName('Debt Payment');
    } else if (transactionType === TRANSACTION_TYPES.FIXED_EXPENSE) {
      setName('Fixed Expense');
    } else if (transactionType === TRANSACTION_TYPES.GOAL_CONTRIBUTION) {
      setName('Goal Contribution');
    }
  }, [transactionType]);

  // Handle selecting a fixed expense
  const handleFixedExpenseSelect = (id: string) => {
    // Add debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Attempting to select fixed expense with ID: ${id} (type: ${typeof id})`);
      console.log('Available fixed expenses:', safeFixedExpenses);
    }
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`Invalid fixed expense ID: ${id}`);
      return;
    }
    
    const selected = safeFixedExpenses.find(fe => {
      // Convert both to strings for comparison to avoid type mismatches
      return fe.id.toString() === numericId.toString();
    });
    
    if (selected) {
      setSelectedFixedExpensesId(numericId);
      setSelectedRecurringId(selected.recurring_transaction_id);// Keep for compatibility
      setName(selected.name);
      setCategory(selected.category);
      setAmount(Math.abs(selected.amount).toString());
      
      if (selected.next_date) {
        setDate(selected.next_date);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Selected fixed expense: ${selected.name} with amount ${selected.amount}`);
      }
    } else {
      console.warn(`Could not find fixed expense with ID: ${id}`);
    }
  };

  // Handle selecting an income source
  const handleIncomeSourceSelect = (id: string) => {
    // Add debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Attempting to select income source with ID: ${id} (type: ${typeof id})`);
      console.log('Available income sources:', safeIncomeSources);
    }
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`Invalid income source ID: ${id}`);
      return;
    }
    
    const selected = safeIncomeSources.find(is => {
      // Convert both to strings for comparison to avoid type mismatches
      return is.id.toString() === numericId.toString();
    });
    
    if (selected) {
      setSelectedIncomeSourcesId(numericId);
      setSelectedRecurringId(selected.recurring_transaction_id); // Keep for compatibility
      setName(selected.name);
      setCategory(selected.category);
      setAmount(Math.abs(selected.amount).toString());
      
      if (selected.next_date) {
        setDate(selected.next_date);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Selected income source: ${selected.name} with amount ${selected.amount}`);
      }
    } else {
      console.warn(`Could not find income source with ID: ${id}`);
    }
  };
  
  // Handle selecting a debt for debt payment
  const handleDebtSelect = (id: number | string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Selecting debt with ID: ${id} (type: ${typeof id})`);
    }
    
    // Convert the ID to string for comparison to avoid type mismatches
    const idStr = id.toString();
    const selected = debts.find(debt => debt.id.toString() === idStr);
    
    if (selected) {
      // Process the ID as a number for database compatibility
      const numericId = typeof selected.id === 'string' ? parseInt(selected.id, 10) : selected.id;
      
      setSelectedDebtId(numericId);
      setName(`Payment to ${selected.name}`);
      setCategory('Debt Payment');
      setAmount(selected.minimumPayment.toString());
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Selected debt: ${selected.name} (ID: ${numericId}, type: ${typeof numericId})`);
      }
    } else {
      console.warn(`Could not find debt with ID: ${id}`);
    }
  };

  // Handle selecting a financial goal for goal contribution
  const handleGoalSelect = (id: number | string) => {
    // Add debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Attempting to select financial goal with ID: ${id} (type: ${typeof id})`);
      console.log('Available financial goals:', safeFinancialGoals);
    }
    
    // Convert to numeric ID if string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      console.error(`Invalid financial goal ID: ${id}`);
      return;
    }
    
    const selected = safeFinancialGoals.find(goal => {
      // Convert both to strings for comparison to avoid type mismatches
      return goal.id.toString() === numericId.toString();
    });
    
    if (selected) {
      setSelectedGoalId(numericId);
      setName(`Contribution to ${selected.name}`);
      setCategory('Goal Contribution');
      // Don't set amount - user will input the contribution amount
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Selected financial goal: ${selected.name} with target amount ${selected.target_amount}`);
      }
    } else {
      console.warn(`Could not find financial goal with ID: ${id}`);
    }
  }

  // Handle selecting a budget category for variable expense
  const handleBudgetCategorySelect = (id: number) => {
    const selected = budgetCategories.find(cat => cat.id === id);
    if (selected) {
      setSelectedBudgetCategoryId(id);
      setCategory(selected.name);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Selected budget category: ${selected.name} (ID: ${id})`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !date || !category || !sourceAccount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Get the account from the selected account ID without forcing number conversion
      const selectedAccount = accounts.find(acc => acc.id.toString() === sourceAccount.toString());
      
      if (!selectedAccount) {
        alert('Please select a valid account');
        return;
      }
      
      // Format amount with correct sign based on transaction type
      const numericAmount = parseFloat(amount);
      const finalAmount = transactionType === TRANSACTION_TYPES.INCOME 
        ? Math.abs(numericAmount) 
        : -Math.abs(numericAmount);
      
      // Create transaction object with both account name (for display) and account_id (for database relations)
      let transaction: TransactionData = {
        date,
        name,
        category,
        amount: finalAmount,
        account: selectedAccount.name, // The account name is used for display purposes
        account_id: String(selectedAccount.id), // Convert ID to string for database compatibility
        notes,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        transaction_type: transactionType
      };
      
      // Add specific fields based on transaction type
      if (transactionType === TRANSACTION_TYPES.FIXED_EXPENSE) {
        transaction = {
          ...transaction,
          recurring_id: selectedRecurringId,
          is_debt_payment: false,
          is_budget_expense: false
        };
      } else if (transactionType === TRANSACTION_TYPES.DEBT_PAYMENT) {
        if (!selectedDebtId) {
          alert('Please select a debt to make a payment');
          return;
        }
        
        transaction = {
          ...transaction,
          debt_id: selectedDebtId,
          is_debt_payment: true,
          is_budget_expense: false
        };
      } else if (transactionType === TRANSACTION_TYPES.VARIABLE_EXPENSE) {
        transaction = {
          ...transaction,
          budget_category_id: selectedBudgetCategoryId,
          is_budget_expense: true,
          is_debt_payment: false
        };
      } else if (transactionType === TRANSACTION_TYPES.GOAL_CONTRIBUTION) {
        if (!destinationAccount) {
          alert('Please select a destination account for the goal contribution');
          return;
        }
        
        transaction = {
          ...transaction,
          goal_id: selectedGoalId,
          destination_account_id: destinationAccount,
          is_transfer: true,
          is_debt_payment: false,
          is_budget_expense: false
        };
      } else {
        // Income case
        transaction = {
          ...transaction,
          recurring_id: selectedRecurringId,
          is_debt_payment: false,
          is_budget_expense: false
        };
      }
      
      console.log('Adding transaction:', transaction);
      
      // Wait for the transaction to be added
      const newTransaction = await addTransaction(transaction);
      console.log('Transaction added successfully:', newTransaction);
      
      // CRITICAL: Call onTransactionAdded BEFORE closing the modal
      if (onTransactionAdded && newTransaction) {
        await onTransactionAdded(newTransaction);
      }
      
      // Only close the modal after everything is done
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Record Transaction</h2>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Date First */}
          <div className="mb-4">
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
          
          {/* Transaction Type Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === TRANSACTION_TYPES.VARIABLE_EXPENSE 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType(TRANSACTION_TYPES.VARIABLE_EXPENSE);
                  setIsExpense(true);
                }}
              >
                <CircleDollarSign className="mr-1 h-4 w-4" />
                Variable Expense
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === TRANSACTION_TYPES.FIXED_EXPENSE 
                    ? 'bg-teal-100 text-teal-700 border border-teal-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType(TRANSACTION_TYPES.FIXED_EXPENSE);
                  setIsExpense(true);
                }}
              >
                <Clock className="mr-1 h-4 w-4" />
                Fixed Expense
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === TRANSACTION_TYPES.INCOME 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType(TRANSACTION_TYPES.INCOME);
                  setIsExpense(false);
                }}
              >
                <Wallet className="mr-1 h-4 w-4" />
                Income
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === TRANSACTION_TYPES.DEBT_PAYMENT 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType(TRANSACTION_TYPES.DEBT_PAYMENT);
                  setIsExpense(true);
                }}
              >
                <CreditCardIcon className="mr-1 h-4 w-4" />
                Debt Payment
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center py-2 px-2 rounded-md text-sm ${
                  transactionType === TRANSACTION_TYPES.GOAL_CONTRIBUTION 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setTransactionType(TRANSACTION_TYPES.GOAL_CONTRIBUTION);
                  setIsExpense(true);
                }}
              >
                <PiggyBank className="mr-1 h-4 w-4" />
                Goal Contribution
              </button>
            </div>
          </div>
          
          {/* Dynamic Dropdown based on Transaction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {transactionType === TRANSACTION_TYPES.VARIABLE_EXPENSE ? 'Budget Category' :
               transactionType === TRANSACTION_TYPES.FIXED_EXPENSE ? 'Recurring Expense' :
               transactionType === TRANSACTION_TYPES.INCOME ? 'Income Source' :
               transactionType === TRANSACTION_TYPES.DEBT_PAYMENT ? 'Debt Account' :
               'Financial Goal'}
            </label>
            <div className="relative">
              {transactionType === TRANSACTION_TYPES.VARIABLE_EXPENSE && (
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedBudgetCategoryId || ""}
                  onChange={(e) => handleBudgetCategorySelect(parseInt(e.target.value))}
                  required
                >
                  <option value="">Select a budget category</option>
                  {budgetCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              
              {transactionType === TRANSACTION_TYPES.FIXED_EXPENSE && (
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedFixedExpensesId || ""}
                  onChange={(e) => handleFixedExpenseSelect(e.target.value)}
                  required
                >
                  <option value="">Select a fixed expense</option>
                  {safeFixedExpenses.length > 0 ? (
                    safeFixedExpenses.map(fe => (
                      <option key={fe.id} value={fe.id}>
                        {fe.name} (${Math.abs(fe.amount).toFixed(2)})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No fixed expenses available</option>
                  )}
                </select>
              )}
              
              {transactionType === TRANSACTION_TYPES.INCOME && (
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedIncomeSourcesId || ""}
                  onChange={(e) => handleIncomeSourceSelect(e.target.value)}
                  required
                >
                  <option value="">Select an income source</option>
                  {safeIncomeSources.length > 0 ? (
                    safeIncomeSources.map(is => (
                      <option key={is.id} value={is.id}>
                        {is.name} (${is.amount.toFixed(2)})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No income sources available</option>
                  )}
                </select>
              )}
              
              {transactionType === TRANSACTION_TYPES.DEBT_PAYMENT && (
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedDebtId || ""}
                  onChange={(e) => handleDebtSelect(e.target.value)}
                  required
                >
                  <option value="">Select a debt</option>
                  {debts.map(debt => (
                    <option key={debt.id} value={debt.id}>
                      {debt.name} (${debt.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              )}
              
              {transactionType === TRANSACTION_TYPES.GOAL_CONTRIBUTION && (
                <div className="relative">
                  <select
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedGoalId?.toString() || ""}
                    onChange={(e) => handleGoalSelect(e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="">
                      {isLoading ? 'Loading financial goals...' : 'Select a financial goal'}
                    </option>
                    {safeFinancialGoals.length > 0 ? (
                      safeFinancialGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name} (${goal.current_amount.toFixed(2)} / ${goal.target_amount.toFixed(2)})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {isLoading ? 'Loading...' : 'No financial goals available'}
                      </option>
                    )}
                  </select>
                  <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
          
          {/* Amount */}
          <div className="mb-4">
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
          </div>
          
          {/* Name */}
          {transactionType === TRANSACTION_TYPES.VARIABLE_EXPENSE && (
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
          )}
          
          {/* Account - always the source account */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {transactionType === TRANSACTION_TYPES.INCOME ? 'To Account' : 'From Account'}
            </label>
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sourceAccount}
                onChange={(e) => setSourceAccount(e.target.value)}
                required
              >
                <option value="">Select account</option>
                
                {/* Display accounts based on type */}
                {accounts.length > 0 ? (
                  <>
                    {/* Checking accounts */}
                    {accounts.filter(a => !a.isHidden && a.type === 'checking').length > 0 && (
                      <optgroup label="Checking">
                        {accounts
                          .filter(a => !a.isHidden && a.type === 'checking')
                          .map(acc => (
                            <option key={acc.id} value={acc.id.toString()}>
                              💳 {acc.name} - ${acc.balance.toFixed(2)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    
                    {/* Savings accounts */}
                    {accounts.filter(a => !a.isHidden && a.type === 'savings').length > 0 && (
                      <optgroup label="Savings">
                        {accounts
                          .filter(a => !a.isHidden && a.type === 'savings')
                          .map(acc => (
                            <option key={acc.id} value={acc.id.toString()}>
                              🏦 {acc.name} - ${acc.balance.toFixed(2)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    
                    {/* Cash accounts */}
                    {accounts.filter(a => !a.isHidden && a.type === 'cash').length > 0 && (
                      <optgroup label="Cash">
                        {accounts
                          .filter(a => !a.isHidden && a.type === 'cash')
                          .map(acc => (
                            <option key={acc.id} value={acc.id.toString()}>
                              💵 {acc.name} - ${acc.balance.toFixed(2)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    
                    {/* Credit accounts */}
                    {accounts.filter(a => !a.isHidden && a.type === 'credit').length > 0 && (
                      <optgroup label="Credit Cards">
                        {accounts
                          .filter(a => !a.isHidden && a.type === 'credit')
                          .map(acc => (
                            <option key={acc.id} value={acc.id.toString()}>
                              💳 {acc.name} - ${acc.balance.toFixed(2)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    
                    {/* Investment accounts */}
                    {accounts.filter(a => !a.isHidden && a.type === 'investment').length > 0 && (
                      <optgroup label="Investments">
                        {accounts
                          .filter(a => !a.isHidden && a.type === 'investment')
                          .map(acc => (
                            <option key={acc.id} value={acc.id.toString()}>
                              📈 {acc.name} - ${acc.balance.toFixed(2)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    
                    {/* Other account types */}
                    {accounts.filter(a => !a.isHidden && a.type === 'other').length > 0 && (
                      <optgroup label="Other">
                        {accounts
                          .filter(a => !a.isHidden && a.type === 'other')
                          .map(acc => (
                            <option key={acc.id} value={acc.id.toString()}>
                              📝 {acc.name} - ${acc.balance.toFixed(2)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  <option value="" disabled>No accounts available</option>
                )}
              </select>
              <Building className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* To Account - only for Goal Contribution */}
          {transactionType === TRANSACTION_TYPES.GOAL_CONTRIBUTION && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Account
              </label>
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  required
                >
                  <option value="">Select destination account</option>
                  
                  {/* Display accounts based on type */}
                  {accounts.length > 0 ? (
                    <>
                      {/* Checking accounts */}
                      {accounts.filter(a => !a.isHidden && a.type === 'checking').length > 0 && (
                        <optgroup label="Checking">
                          {accounts
                            .filter(a => !a.isHidden && a.type === 'checking')
                            .map(acc => (
                              <option 
                                key={acc.id} 
                                value={acc.id.toString()}
                                disabled={acc.id.toString() === sourceAccount}
                              >
                                💳 {acc.name} - ${acc.balance.toFixed(2)}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      
                      {/* Savings accounts */}
                      {accounts.filter(a => !a.isHidden && a.type === 'savings').length > 0 && (
                        <optgroup label="Savings">
                          {accounts
                            .filter(a => !a.isHidden && a.type === 'savings')
                            .map(acc => (
                              <option 
                                key={acc.id} 
                                value={acc.id.toString()}
                                disabled={acc.id.toString() === sourceAccount}
                              >
                                🏦 {acc.name} - ${acc.balance.toFixed(2)}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      
                      {/* Investment accounts */}
                      {accounts.filter(a => !a.isHidden && a.type === 'investment').length > 0 && (
                        <optgroup label="Investments">
                          {accounts
                            .filter(a => !a.isHidden && a.type === 'investment')
                            .map(acc => (
                              <option 
                                key={acc.id} 
                                value={acc.id.toString()}
                                disabled={acc.id.toString() === sourceAccount}
                              >
                                📈 {acc.name} - ${acc.balance.toFixed(2)}
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </>
                  ) : (
                    <option value="" disabled>No accounts available</option>
                  )}
                </select>
                <Building className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select the account where this goal contribution will be stored
              </p>
            </div>
          )}
          
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
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal; 