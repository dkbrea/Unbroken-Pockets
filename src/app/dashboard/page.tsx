'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight, CreditCard, ArrowDownCircle, ArrowUpCircle, 
         CalendarClock, Wallet, Target, BellRing, CircleDollarSign, Car, Home, Plane, GraduationCap, Briefcase, Plus,
         TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, LineChart, BarChart, PieChart, ArrowRight } from 'lucide-react'
import AddAccountModal from '@/components/features/AddAccountModal'
import { createAccount, getAccounts, getTotalBalance, Account, AccountType, getCurrentUserId } from '@/lib/services/accountService'
import { getSetupProgress, updateSetupProgress, SetupProgress, DEFAULT_SETUP_PROGRESS, resetSetupProgress, ensureUserPreferencesExist } from '@/lib/services/setupProgressService'
import AddRecurringModal from '@/components/features/AddRecurringModal'
import AddDebtModal from '@/components/features/AddDebtModal'
import { useCashFlowData } from '@/hooks/useCashFlowData'

// Goal form modal component (simplified version of the one in the goals page)
function GoalFormModal({ 
  onClose, 
  onSubmit, 
  title
}: { 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  title: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    iconName: 'CircleDollarSign',
    color: 'bg-blue-100 text-blue-600',
    currentAmount: 0,
    targetAmount: 0,
    targetDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // Default to 1 year from now
    contributions: {
      frequency: 'Monthly',
      amount: 0
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'contributionAmount') {
      setFormData(prev => ({
        ...prev,
        contributions: {
          ...prev.contributions,
          amount: parseFloat(value) || 0
        }
      }));
    } else if (['currentAmount', 'targetAmount'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                required
              />
            </div>

            {/* Current Amount */}
            <div>
              <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Current Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="currentAmount"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="targetAmount"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                required
              />
            </div>

            {/* Monthly Contribution */}
            <div>
              <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Contribution
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="contributionAmount"
                  name="contributionAmount"
                  value={formData.contributions.amount}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  
  // Use persisted setup progress state
  const [setupProgress, setSetupProgress] = useState<SetupProgress>(DEFAULT_SETUP_PROGRESS)
  
  // Add state for preference error notification
  const [preferenceError, setPreferenceError] = useState<string | null>(null)
  
  // Calculate overall progress
  const totalSteps = Object.keys(setupProgress).length
  const completedSteps = Object.values(setupProgress).filter(Boolean).length
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)
  const isSetupComplete = progressPercentage === 100
  
  // Add state for error notification
  const [accountError, setAccountError] = useState<string | null>(null)
  
  // State for recurring transaction modal and tracking which button was clicked
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [lastClickedSetupItem, setLastClickedSetupItem] = useState<string | null>(null);
  
  // State for debt modal
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false)
  
  // State for goal modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  
  // Cash flow data
  const { 
    cashFlowMetrics, 
    monthlyData, 
    cashFlowScore, 
    upcomingTransactions, 
    isLoading: isCashFlowLoading 
  } = useCashFlowData({
    timeRange: '3months',
    selectedMonth: new Date().toISOString().substring(0, 7),
    includeCategories: true
  })
  
  // Financial wellness data
  const [financialWellnessScore, setFinancialWellnessScore] = useState(0)
  const [insights, setInsights] = useState<{ type: 'warning' | 'success' | 'info', message: string }[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [upcomingBills, setUpcomingBills] = useState<any[]>([])

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Helper function to calculate financial wellness score
  const calculateFinancialWellnessScore = () => {
    if (!cashFlowScore || cashFlowMetrics?.netCashFlow === undefined) return 0;
    
    // This is a simplified calculation - in a real app this would be more sophisticated
    const baseScore = cashFlowScore
    const savingsRate = cashFlowMetrics.netCashFlow > 0 ? (cashFlowMetrics.netCashFlow / cashFlowMetrics.totalIncome) : 0
    const savingsBonus = savingsRate > 0.2 ? 20 : Math.round(savingsRate * 100)
    
    return Math.min(100, Math.max(0, baseScore + savingsBonus))
  }
  
  // Helper function to generate insights
  const generateInsights = () => {
    const newInsights = []
    
    // Cash flow insights
    if (cashFlowMetrics?.netCashFlow < 0) {
      newInsights.push({
        type: 'warning' as const,
        message: 'Your spending exceeded your income this month. Review your expenses to get back on track.'
      })
    } else if (cashFlowMetrics?.netCashFlow > 0) {
      newInsights.push({
        type: 'success' as const,
        message: `You saved ${formatCurrency(cashFlowMetrics.netCashFlow)} this month. Great job managing your finances!`
      })
    }
    
    // Budget insights
    if (cashFlowMetrics?.expensesChangePercent > 10) {
      newInsights.push({
        type: 'warning' as const,
        message: `Your expenses increased by ${Math.round(cashFlowMetrics.expensesChangePercent)}% compared to last month.`
      })
    }
    
    // Upcoming bills insight
    if (upcomingTransactions && upcomingTransactions.length > 0) {
      newInsights.push({
        type: 'info' as const,
        message: `You have ${upcomingTransactions.length} upcoming bill${upcomingTransactions.length > 1 ? 's' : ''} in the next 7 days.`
      })
    }
    
    // Account insights
    if (accounts.length === 0) {
      newInsights.push({
        type: 'info' as const,
        message: 'Add your accounts to get a complete picture of your finances.'
      })
    }
    
    return newInsights.slice(0, 3) // Limit to 3 insights
  }
  
  // Get recent transactions and upcoming bills
  const fetchRecentTransactions = async () => {
    try {
      const supabase = createClient()
      
      // Fetch recent transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(5)
      
      if (txError) {
        console.error('Error fetching transactions:', txError)
      } else {
        setRecentTransactions(txData || [])
      }
      
      // Fetch upcoming bills from recurring transactions
      const today = new Date()
      const nextMonth = new Date()
      nextMonth.setDate(today.getDate() + 30) // Next 30 days
      
      const { data: billsData, error: billsError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .or(`type.eq.expense,type.eq.debt_payment,type.eq.debt`) // Include expense and debt types
        .gte('next_date', today.toISOString().split('T')[0])
        .lte('next_date', nextMonth.toISOString().split('T')[0])
        .order('next_date', { ascending: true })
        .limit(5)
      
      if (billsError) {
        console.error('Error fetching upcoming bills:', billsError)
      } else {
        setUpcomingBills(billsData || [])
      }
    } catch (error) {
      console.error('Error in fetch operations:', error)
    }
  }
  
  // Helper function to safely get setup progress, even if database fails
  const safeGetSetupProgress = async (): Promise<SetupProgress> => {
    try {
      console.log('Dashboard - Safely getting setup progress');
      // Try to get from database via the service
      const progress = await getSetupProgress();
      console.log('Dashboard - Successfully loaded setup progress');
      return progress;
    } catch (error) {
      console.error('Dashboard - Error getting setup progress:', error);
      
      // Try to get from localStorage
      if (typeof window !== 'undefined') {
        try {
          const localProgress = localStorage.getItem('setup_progress');
          if (localProgress) {
            return JSON.parse(localProgress);
          }
        } catch (e) {
          console.error('Error parsing localStorage progress:', e);
        }
      }
      
      // If all else fails, return default progress
      return DEFAULT_SETUP_PROGRESS;
    }
  };
  
  // Check user authentication status and load data
  const checkAuthAndLoadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const client = createClient();
      const { data, error: authError } = await client.auth.getUser();
      
      if (authError) {
        console.error('Authentication check error:', authError.message);
        setError('Authentication error: ' + authError.message);
        setLoading(false);
        return;
      }
      
      if (!data.user) {
        console.log('User not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }
      
      // User is authenticated, set user data
      setUser(data.user);
      console.log('User authenticated:', data.user);
      
      try {
        // Load setup progress
        const progress = await safeGetSetupProgress();
        setSetupProgress(progress);
        
        // Load accounts and check existing data for all setup items
        await checkAllSetupItems();
        
        // Load user preferences
        try {
          await ensureUserPreferencesExist();
        } catch (prefError) {
          console.error('Failed to ensure user preferences exist:', prefError);
          setPreferenceError('Your preferences could not be loaded. Some features may not work correctly.');
        }
        
      } catch (dataError) {
        console.error('Error loading dashboard data:', dataError);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Unexpected error in checkAuthAndLoadData:', err);
      setError('An unexpected error occurred. Please try refreshing the page.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkAuthAndLoadData()
  }, [router])

  // Calculate financial wellness score when cash flow data changes
  useEffect(() => {
    if (!isCashFlowLoading && cashFlowScore !== undefined) {
      const score = calculateFinancialWellnessScore()
      setFinancialWellnessScore(score)
    }
  }, [cashFlowScore, cashFlowMetrics, isCashFlowLoading])
  
  // Generate insights when relevant data changes
  useEffect(() => {
    if (!isCashFlowLoading && cashFlowMetrics) {
      const newInsights = generateInsights()
      setInsights(newInsights)
    }
  }, [cashFlowMetrics, upcomingTransactions, accounts, isCashFlowLoading])
  
  // Fetch recent transactions on initial load
  useEffect(() => {
    if (user) {
      fetchRecentTransactions()
    }
  }, [user])

  // Function to check all setup items for existing data
  const checkAllSetupItems = async () => {
    try {
      console.log('Dashboard - Checking all setup items for existing data');
      const supabase = createClient();
      const updatedSetupItems: Partial<SetupProgress> = {};
      
      // 1. Check accounts - this is already checked in loadUserAccounts, but we'll include it here for completeness
      await loadUserAccounts();
      
      // 2. Check recurring expenses
      try {
        const { data: recurringExpenses, error: expensesError } = await supabase
          .from('recurring_transactions')
          .select('id')
          .eq('type', 'expense')
          .limit(1);
          
        if (!expensesError && recurringExpenses && recurringExpenses.length > 0) {
          console.log('Dashboard - Found recurring expenses');
          updatedSetupItems.recurringExpensesSetup = true;
        }
      } catch (error) {
        console.error('Error checking recurring expenses:', error);
      }
      
      // 3. Check recurring income
      try {
        const { data: recurringIncome, error: incomeError } = await supabase
          .from('recurring_transactions')
          .select('id')
          .eq('type', 'income')
          .limit(1);
          
        if (!incomeError && recurringIncome && recurringIncome.length > 0) {
          console.log('Dashboard - Found recurring income');
          updatedSetupItems.recurringIncomeSetup = true;
        }
      } catch (error) {
        console.error('Error checking recurring income:', error);
      }
      
      // 4. Check subscriptions
      try {
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('recurring_transactions')
          .select('id')
          .eq('category', 'Subscriptions')
          .limit(1);
          
        if (!subscriptionsError && subscriptions && subscriptions.length > 0) {
          console.log('Dashboard - Found subscriptions');
          updatedSetupItems.subscriptionsSetup = true;
        }
      } catch (error) {
        console.error('Error checking subscriptions:', error);
      }
      
      // 5. Check debt
      try {
        const { data: debts, error: debtsError } = await supabase
          .from('debts')
          .select('id')
          .limit(1);
          
        if (!debtsError && debts && debts.length > 0) {
          console.log('Dashboard - Found debts');
          updatedSetupItems.debtSetup = true;
        }
      } catch (error) {
        console.error('Error checking debts:', error);
      }
      
      // 6. Check goals
      try {
        const { data: goals, error: goalsError } = await supabase
          .from('financial_goals')
          .select('id')
          .limit(1);
          
        if (!goalsError && goals && goals.length > 0) {
          console.log('Dashboard - Found goals');
          updatedSetupItems.goalsSetup = true;
        }
      } catch (error) {
        console.error('Error checking goals:', error);
      }
      
      // Update setup progress if there are any changes
      if (Object.keys(updatedSetupItems).length > 0) {
        console.log('Dashboard - Updating setup progress based on existing data:', updatedSetupItems);
        const updatedProgress = await updateSetupProgress(updatedSetupItems);
        setSetupProgress(updatedProgress);
      }
      
    } catch (error) {
      console.error('Error checking setup items:', error);
    }
  };

  // Function to load user accounts
  const loadUserAccounts = async () => {
    try {
      console.log('Dashboard - Loading user accounts')
      // Fetch accounts
      const userAccounts = await getAccounts();
      console.log('Dashboard - Accounts loaded:', userAccounts)
      setAccounts(userAccounts);
      
      // Update setup progress based on accounts
      if (userAccounts.length > 0) {
        const updatedProgress = await updateSetupProgress({ accountsSetup: true });
        setSetupProgress(updatedProgress);
      } else {
        console.log('Dashboard - No accounts found, setup progress not updated')
      }
      
      // Get total balance
      const balance = await getTotalBalance();
      console.log('Dashboard - Total balance calculated:', balance)
      setTotalBalance(balance);
    } catch (error) {
      console.error('Error loading user accounts:', error);
    }
  };
  
  const handleSetupItemClick = async (item: keyof typeof setupProgress) => {
    console.log(`Dashboard - handleSetupItemClick called for ${item}`);
    // Store which setup item was clicked
    setLastClickedSetupItem(item);
    
    if (item === 'accountsSetup') {
      setIsAccountModalOpen(true);
      console.log('Dashboard - Opening account modal');
    } else if (item === 'recurringExpensesSetup' || item === 'recurringIncomeSetup' || item === 'subscriptionsSetup') {
      setIsRecurringModalOpen(true);
      console.log(`Dashboard - Opening modal for ${item}`);
    } else if (item === 'debtSetup') {
      setIsDebtModalOpen(true);
      console.log('Dashboard - Opening debt modal');
    } else if (item === 'goalsSetup') {
      setIsGoalModalOpen(true);
      console.log('Dashboard - Opening goal modal');
    } else {
      // Toggle the progress state and persist it
      const newValue = !setupProgress[item];
      console.log(`Dashboard - Toggling ${item} from ${setupProgress[item]} to ${newValue}`);
      const updatedProgress = await updateSetupProgress({ [item]: newValue });
      console.log('Dashboard - Progress update returned:', updatedProgress);
      
      // Update local state with the persisted data
      setSetupProgress(updatedProgress);
      console.log('Dashboard - Updated local state with new progress');
    }
  }

  const handleAddAccount = async (accountData: { name: string; institution: string; type: AccountType; balance: number }) => {
    try {
      setIsSubmittingAccount(true);
      setAccountError(null);
      console.log('Dashboard - Adding new account:', accountData);
      
      // Save the account to the database
      const newAccount = await createAccount(accountData);
      
      console.log('Dashboard - Account created successfully:', newAccount);
      
      // Update setup progress
      const updatedProgress = await updateSetupProgress({ accountsSetup: true });
      setSetupProgress(updatedProgress);
      
      // Reload accounts
      await loadUserAccounts();
      
      // Close the modal
      setIsAccountModalOpen(false);
    } catch (error: any) {
      console.error('Error adding account:', error);
      setAccountError(error.message || 'An error occurred while creating the account.');
      
      // Don't close the modal so user can try again
    } finally {
      setIsSubmittingAccount(false);
    }
  }
  
  const handleAddRecurringTransaction = async (transaction: any) => {
    try {
      console.log('Dashboard - Adding new recurring transaction:', transaction);
      
      // Determine which setup progress item to update based on what was clicked
      let updatedItem: Partial<SetupProgress> = {};
      
      if (lastClickedSetupItem === 'recurringIncomeSetup') {
        updatedItem = { recurringIncomeSetup: true };
      } else if (lastClickedSetupItem === 'subscriptionsSetup') {
        updatedItem = { subscriptionsSetup: true };
      } else if (lastClickedSetupItem === 'recurringExpensesSetup') {
        updatedItem = { recurringExpensesSetup: true };
      } else {
        // If we don't know which item was clicked, determine from transaction data
        if (transaction.amount > 0) {
          updatedItem = { recurringIncomeSetup: true };
        } else if (transaction.category === 'Subscriptions') {
          updatedItem = { subscriptionsSetup: true };
        } else {
          updatedItem = { recurringExpensesSetup: true };
        }
      }
      
      // Update the setup progress
      const updatedProgress = await updateSetupProgress(updatedItem);
      setSetupProgress(updatedProgress);
      
      // Close the modal
      setIsRecurringModalOpen(false);
    } catch (error: any) {
      console.error('Error adding recurring transaction:', error);
      setAccountError(error.message || 'An error occurred while creating the recurring transaction.');
    }
  }
  
  const handleAddDebt = async (debt: any) => {
    try {
      console.log('Dashboard - Adding new debt:', debt);
      
      // Save the debt to the database
      const supabase = createClient();
      const userId = await getCurrentUserId();
      
      const { data: newDebt, error } = await supabase
        .from('debts')
        .insert({
          name: debt.name,
          balance: debt.balance,
          interest_rate: debt.interestRate,
          minimum_payment: debt.minimumPayment,
          category: debt.category,
          lender: debt.lender,
          notes: debt.notes,
          due_date: debt.dueDate,
          user_id: userId
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Dashboard - Debt created successfully:', newDebt);
      
      // Update setup progress
      const updatedProgress = await updateSetupProgress({ debtSetup: true });
      setSetupProgress(updatedProgress);
      
      // Close the modal
      setIsDebtModalOpen(false);
    } catch (error: any) {
      console.error('Error adding debt:', error);
      setAccountError(error.message || 'An error occurred while creating the debt.');
    }
  }
  
  const handleAddGoal = async (goal: any) => {
    try {
      console.log('Dashboard - Adding new goal:', goal);
      
      // Save the goal to the database
      const supabase = createClient();
      const userId = await getCurrentUserId();
      
      // Find the icon name from the icon object if it exists
      const iconName = goal.iconName || 'CircleDollarSign';
      
      const { data: newGoal, error } = await supabase
        .from('financial_goals')
        .insert({
          name: goal.name,
          icon: iconName,
          color: goal.color || '#1F3A93',
          current_amount: goal.currentAmount || 0,
          target_amount: goal.targetAmount,
          target_date: goal.targetDate,
          contribution_frequency: goal.contributions?.frequency || 'Monthly',
          contribution_amount: goal.contributions?.amount || 0,
          user_id: userId
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Dashboard - Goal created successfully:', newGoal);
      
      // Update setup progress
      const updatedProgress = await updateSetupProgress({ goalsSetup: true });
      setSetupProgress(updatedProgress);
      
      // Close the modal
      setIsGoalModalOpen(false);
    } catch (error: any) {
      console.error('Error adding goal:', error);
      setAccountError(error.message || 'An error occurred while creating the goal.');
    }
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="bg-[#1F3A93] text-white px-4 py-2 rounded-md hover:bg-[#152C70]"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1F3A93] mb-6">Welcome to Your Dashboard</h1>
        
        {/* Show Getting Started section if not complete, otherwise show Financial Dashboard */}
        {!isSetupComplete ? (
          /* Getting Started Section */
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Getting Started</h2>
              <span className="text-sm text-gray-500">{progressPercentage}% Complete</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div 
                className="h-full bg-[#1F3A93] rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Welcome to Unbroken Pockets! Let's set up your financial dashboard by completing these important steps.
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
              {/* Accounts setup */}
              <div 
                className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow ${
                  setupProgress.accountsSetup ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => handleSetupItemClick('accountsSetup')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${setupProgress.accountsSetup ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {setupProgress.accountsSetup ? 
                        <Check className="h-5 w-5 text-green-600" /> :
                        <CreditCard className="h-5 w-5 text-[#1F3A93]" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">Set Up Accounts</h3>
                      <p className="text-sm text-gray-500">Add your bank and credit accounts</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Recurring Expenses setup */}
              <div 
                className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow ${
                  setupProgress.recurringExpensesSetup ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => handleSetupItemClick('recurringExpensesSetup')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${setupProgress.recurringExpensesSetup ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {setupProgress.recurringExpensesSetup ? 
                        <Check className="h-5 w-5 text-green-600" /> :
                        <ArrowDownCircle className="h-5 w-5 text-[#1F3A93]" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">Fixed Expenses</h3>
                      <p className="text-sm text-gray-500">Add your recurring bills and expenses</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Recurring Income setup */}
              <div 
                className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow ${
                  setupProgress.recurringIncomeSetup ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => handleSetupItemClick('recurringIncomeSetup')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${setupProgress.recurringIncomeSetup ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {setupProgress.recurringIncomeSetup ? 
                        <Check className="h-5 w-5 text-green-600" /> :
                        <ArrowUpCircle className="h-5 w-5 text-[#1F3A93]" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">Income Sources</h3>
                      <p className="text-sm text-gray-500">Add your salary and other income</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Subscriptions setup */}
              <div 
                className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow ${
                  setupProgress.subscriptionsSetup ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => handleSetupItemClick('subscriptionsSetup')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${setupProgress.subscriptionsSetup ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {setupProgress.subscriptionsSetup ? 
                        <Check className="h-5 w-5 text-green-600" /> :
                        <BellRing className="h-5 w-5 text-[#1F3A93]" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">Subscriptions</h3>
                      <p className="text-sm text-gray-500">Track your recurring subscriptions</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Debt setup */}
              <div 
                className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow ${
                  setupProgress.debtSetup ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => handleSetupItemClick('debtSetup')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${setupProgress.debtSetup ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {setupProgress.debtSetup ? 
                        <Check className="h-5 w-5 text-green-600" /> :
                        <Wallet className="h-5 w-5 text-[#1F3A93]" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">Debt Tracking</h3>
                      <p className="text-sm text-gray-500">Add your loans and credit cards</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Savings Goals setup */}
              <div 
                className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow ${
                  setupProgress.goalsSetup ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => handleSetupItemClick('goalsSetup')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${setupProgress.goalsSetup ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {setupProgress.goalsSetup ? 
                        <Check className="h-5 w-5 text-green-600" /> :
                        <Target className="h-5 w-5 text-[#1F3A93]" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">Savings Goals</h3>
                      <p className="text-sm text-gray-500">Set up your financial goals</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              <button 
                onClick={() => setIsAccountModalOpen(true)}
                className="bg-[#1F3A93] text-white px-6 py-2 rounded-md hover:bg-[#152C70] inline-flex items-center"
                disabled={isSubmittingAccount}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Set Up Accounts
              </button>
              <button 
                className="ml-4 bg-white text-[#1F3A93] border border-[#1F3A93] px-6 py-2 rounded-md hover:bg-gray-50 inline-flex items-center"
                onClick={() => window.location.href = '/recurring'}
              >
                <CalendarClock className="h-5 w-5 mr-2" />
                Manage Recurring Items
              </button>
            </div>
          </div>
        ) : (
          /* Financial Dashboard Section - Shown when all setup is complete */
          <div className="space-y-6 mb-6">
            {/* Financial Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Financial Wellness Score */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Financial Wellness</h2>
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-gray-400 cursor-help" />
                    <span className="sr-only">Your overall financial health score</span>
                  </div>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative h-32 w-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl font-bold">{financialWellnessScore}</div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="#e5e7eb" 
                        strokeWidth="12" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke={financialWellnessScore >= 70 ? "#10B981" : financialWellnessScore >= 40 ? "#F59E0B" : "#EF4444"} 
                        strokeWidth="12" 
                        strokeDasharray="339.3"
                        strokeDashoffset={339.3 - (339.3 * financialWellnessScore / 100)} 
                        transform="rotate(-90 60 60)" 
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mb-4">
                  {financialWellnessScore >= 70 ? 'Excellent financial health' : 
                   financialWellnessScore >= 40 ? 'Good financial health' : 
                   'Your financial health needs attention'}
                </p>
                <Link 
                  href="/financial-health"
                  className="block text-center text-[#1F3A93] hover:underline text-sm"
                >
                  View detailed analysis
                </Link>
              </div>
              
              {/* Cash Flow Summary */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Cash Flow</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Income</span>
                    <span className="font-semibold text-green-600">{formatCurrency(cashFlowMetrics?.totalIncome || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Expenses</span>
                    <span className="font-semibold text-red-600">{formatCurrency(cashFlowMetrics?.totalExpenses || 0)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Cash Flow</span>
                      <span className={`font-bold ${(cashFlowMetrics?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cashFlowMetrics?.netCashFlow || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end mt-1">
                      <span className={`flex items-center text-xs ${(cashFlowMetrics?.netCashFlowChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(cashFlowMetrics?.netCashFlowChangePercent || 0) >= 0 ? 
                          <TrendingUp className="h-3 w-3 mr-1" /> : 
                          <TrendingDown className="h-3 w-3 mr-1" />
                        }
                        {Math.abs(cashFlowMetrics?.netCashFlowChangePercent || 0).toFixed(1)}% from last month
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="h-20 w-full">
                    {monthlyData && monthlyData.length > 0 && (
                      <div className="flex h-full items-end justify-between space-x-2">
                        {monthlyData.slice(-6).map((month, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="flex h-14 items-end space-x-1">
                              <div 
                                className="w-3 bg-green-500 rounded-t"
                                style={{ height: `${(month.income / (Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses))) || 1)) * 100}%` }}
                              ></div>
                              <div 
                                className="w-3 bg-red-500 rounded-t"
                                style={{ height: `${(month.expenses / (Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses))) || 1)) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs mt-1 text-gray-500">{month.month.substring(0, 3)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Link 
                  href="/cashflow"
                  className="block text-center text-[#1F3A93] hover:underline text-sm mt-4"
                >
                  View detailed cash flow
                </Link>
              </div>
              
              {/* Insights & Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Insights & Actions</h2>
                {insights.length > 0 ? (
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <div key={index} className="flex items-start p-3 bg-gray-50 rounded-md">
                        {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />}
                        {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />}
                        {insight.type === 'info' && <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />}
                        <p className="text-sm text-gray-700">{insight.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-gray-500 text-sm">No insights available yet. Add more financial data to get personalized insights.</p>
                  </div>
                )}
                
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Recommended Actions</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/transactions" className="flex items-center text-sm text-[#1F3A93] hover:underline">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Review recent transactions
                      </Link>
                    </li>
                    <li>
                      <Link href="/budget" className="flex items-center text-sm text-[#1F3A93] hover:underline">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Update your budget
                      </Link>
                    </li>
                    <li>
                      <Link href="/goals" className="flex items-center text-sm text-[#1F3A93] hover:underline">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Track your financial goals
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Additional Dashboard Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Bills */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Upcoming Bills</h2>
                  <Link href="/recurring" className="text-sm text-[#1F3A93] hover:underline">View all</Link>
                </div>
                {upcomingBills && upcomingBills.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBills.slice(0, 3).map((bill, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-2 rounded-full mr-3">
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{bill.name}</p>
                            <p className="text-xs text-gray-500">{new Date(bill.next_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-red-600">{formatCurrency(Math.abs(bill.amount))}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <BellRing className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm text-center">No upcoming bills found.<br />Add recurring expenses to see them here.</p>
                  </div>
                )}
              </div>
              
              {/* Recent Transactions */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                  <Link href="/transactions" className="text-sm text-[#1F3A93] hover:underline">View all</Link>
                </div>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.slice(0, 4).map((transaction, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            {transaction.amount > 0 ? 
                              <ArrowUpCircle className="h-4 w-4 text-green-500" /> : 
                              <ArrowDownCircle className="h-4 w-4 text-red-500" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.name || transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.category}</p>
                          </div>
                        </div>
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <CreditCard className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm text-center">No recent transactions found.<br />Add transactions to see them here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Error Notifications */}
        {(accountError || preferenceError) && (
          <div className="fixed bottom-4 right-4 flex flex-col gap-2">
            {accountError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md shadow-lg rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Account Error</p>
                    <p className="text-xs mt-1">{accountError}</p>
                    <div className="mt-2 flex flex-col space-y-1">
                      <Link 
                        href="/admin/fix-database"
                        className="text-xs text-red-800 font-medium bg-red-200 px-2 py-1 rounded hover:bg-red-300"
                      >
                        Run Database Fix
                      </Link>
                      <button 
                        onClick={() => setAccountError(null)}
                        className="text-xs underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {preferenceError && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 max-w-md shadow-lg rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Preference Warning</p>
                    <p className="text-xs mt-1">{preferenceError}</p>
                    <div className="mt-2">
                      <button 
                        onClick={() => setPreferenceError(null)}
                        className="text-xs underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Account Setup Modal */}
        <AddAccountModal 
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onSubmit={handleAddAccount}
          isSubmitting={isSubmittingAccount}
        />
        
        {/* Recurring Transaction Modal */}
        <AddRecurringModal
          isOpen={isRecurringModalOpen}
          onClose={() => setIsRecurringModalOpen(false)}
          onAdd={handleAddRecurringTransaction}
        />
        
        {/* Debt Modal */}
        <AddDebtModal
          isOpen={isDebtModalOpen}
          onClose={() => setIsDebtModalOpen(false)}
          onAdd={handleAddDebt}
        />
        
        {/* Goal Modal */}
        {isGoalModalOpen && (
          <GoalFormModal
            onClose={() => setIsGoalModalOpen(false)}
            onSubmit={handleAddGoal}
            title="Add New Goal"
          />
        )}
        
        {/* Account cards and dashboard widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Accounts Summary Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Accounts</h3>
            <p className="text-gray-500 mb-6">Manage your financial accounts</p>
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Total Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {accounts.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Your Accounts</h4>
                {accounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.institution}</p>
                    </div>
                    <p className={`font-semibold ${account.type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
                      ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
                {accounts.length > 3 && (
                  <p className="text-xs text-center text-blue-600">
                    +{accounts.length - 3} more accounts
                  </p>
                )}
              </div>
            )}
            
            <Link 
              href="/accounts"
              className="w-full mt-4 flex justify-center items-center py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              View All Accounts
            </Link>

            <button 
              onClick={() => setIsAccountModalOpen(true)}
              className="w-full mt-2 flex justify-center items-center py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              disabled={isSubmittingAccount}
            >
              {accounts.length > 0 ? 'Add Another Account' : 'Set Up Accounts'}
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-[#1F3A93] mb-2">Transactions</h3>
            <p className="text-gray-600 mb-4">Track your income and expenses</p>
            <a href="/transactions" className="text-[#1F3A93] font-medium hover:underline">
              View Transactions →
            </a>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-[#1F3A93] mb-2">Recurring</h3>
            <p className="text-gray-600 mb-4">Manage recurring transactions</p>
            <a href="/recurring" className="text-[#1F3A93] font-medium hover:underline">
              View Recurring Transactions →
            </a>
          </div>
        </div>
        
        {debugInfo && (
          <div className="mt-6 p-3 border border-gray-200 rounded-md">
            <details>
              <summary className="text-sm font-medium text-gray-600 cursor-pointer">Debug Information</summary>
              <div className="mt-2">
                <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                
                {/* Development Tools */}
                {process.env.NODE_ENV !== 'production' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-red-600">Development Tools</h3>
                    <div className="flex mt-2 flex-wrap gap-2">
                      <button
                        onClick={() => {
                          // Create a consistent mock user for testing
                          const mockUser = {
                            id: 'test-user-1234',  // Same ID as used in accounts page
                            email: 'test@example.com',
                            last_sign_in_at: new Date().toISOString()
                          };
                          localStorage.setItem('mock_user', JSON.stringify(mockUser));
                          console.log('Set consistent test user:', mockUser);
                          alert('Test user set! Reload the page with bypass mode to apply.');
                          window.location.href = window.location.pathname + '?bypassAuth=true';
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        Set Test User
                      </button>
                      <button
                        onClick={() => {
                          // Create a mock user for testing
                          const mockUser = {
                            id: 'development-user-id',  // Fixed ID for testing
                            email: 'dev@example.com',
                            last_sign_in_at: new Date().toISOString()
                          };
                          localStorage.setItem('mock_user', JSON.stringify(mockUser));
                          console.log('Set mock user:', mockUser);
                          alert('Development user set! Reload the page to apply.');
                        }}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Set Dev User
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('mock_user');
                          console.log('Cleared mock user');
                          alert('Mock user cleared! Reload the page to apply.');
                        }}
                        className="ml-2 px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                      >
                        Clear User Data
                      </button>
                      <button
                        onClick={() => window.location.href = window.location.pathname + '?bypassAuth=true'}
                        className="ml-2 px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        Bypass Auth Mode
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const supabase = createClient();
                            
                            // Test connection by getting session
                            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                            console.log('Session test:', { data: sessionData, error: sessionError });
                            
                            // Test the database connection directly with a simple query
                            const { data: testData, error: testError } = await supabase
                              .from('accounts')
                              .select('count(*)')
                              .limit(1);
                              
                            console.log('DB connection test:', { data: testData, error: testError });
                            
                            // Create a test record
                            const testRecord = {
                              name: 'Test Account ' + new Date().toISOString(),
                              balance: 100,
                              type: 'checking',
                              institution: 'Test Bank',
                              user_id: sessionData.session?.user.id || 'test-user-id',
                              last_updated: new Date().toISOString().split('T')[0]
                            };
                            
                            const { data: insertData, error: insertError } = await supabase
                              .from('accounts')
                              .insert(testRecord)
                              .select();
                              
                            console.log('Insert test:', { data: insertData, error: insertError });
                            
                            if (insertError) {
                              alert(`Database test failed: ${insertError.message}`);
                            } else if (insertData) {
                              alert(`Database test successful! Created test account ID: ${insertData[0]?.id}`);
                              // Reload accounts to show the new test account
                              await loadUserAccounts();
                            }
                          } catch (error: any) {
                            console.error('Connection test error:', error);
                            alert(`Connection test error: ${error.message}`);
                          }
                        }}
                        className="ml-2 px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        Test DB Connection
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            // Check local storage with the simplified key
                            const localProgress = localStorage.getItem('setup_progress');
                            
                            console.log('Setup progress in localStorage:', {
                              key: 'setup_progress',
                              exists: localProgress !== null,
                              value: localProgress ? JSON.parse(localProgress) : null
                            });
                            
                            alert('Setup progress check complete! Check console for details.');
                          } catch (error: any) {
                            console.error('Check error:', error);
                            alert(`Error checking progress: ${error.message}`);
                          }
                        }}
                        className="ml-2 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        Check Progress Data
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (confirm('Are you sure you want to reset your setup progress? This will mark all items as NOT DONE.')) {
                              // Reset the setup progress using our new function
                              const defaultProgress = await resetSetupProgress();
                              
                              // Update local state
                              setSetupProgress(defaultProgress);
                              alert('Setup progress has been reset! All items are now marked as not done.');
                              
                              // Force reload to ensure everything is updated
                              window.location.reload();
                            }
                          } catch (error: any) {
                            console.error('Reset progress error:', error);
                            alert(`Error resetting progress: ${error.message}`);
                          }
                        }}
                        className="ml-2 px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Reset Setup Progress
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
} 