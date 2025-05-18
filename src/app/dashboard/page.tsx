'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight, CreditCard, ArrowDownCircle, ArrowUpCircle, 
         CalendarClock, Wallet, Target, BellRing, CircleDollarSign, Car, Home, Plane, GraduationCap, Briefcase, Plus,
         TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, LineChart, BarChart, PieChart, ArrowRight } from 'lucide-react'
import AddAccountModal from '@/components/features/AddAccountModal'
import { createAccount, getAccounts, getTotalBalance } from '@/lib/services/accountService'
import type { Account, AccountType } from '@/lib/types/states'
import { getSetupProgress, updateSetupProgress, SetupProgress, ExtendedSetupProgress, DEFAULT_SETUP_PROGRESS, DEFAULT_EXTENDED_SETUP_PROGRESS, resetSetupProgress, ensureUserPreferencesExist } from '@/lib/services/setupProgressService'
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

// Add a helper function to verify date formatting
const formatDateForSupabase = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const [setupProgress, setSetupProgress] = useState<ExtendedSetupProgress>(DEFAULT_EXTENDED_SETUP_PROGRESS)
  
  // Add state for preference error notification
  const [preferenceError, setPreferenceError] = useState<string | null>(null)
  
  // Calculate overall progress for "Getting Started"
  // These keys correspond to the flags that determine if a Getting Started step is complete.
  // Note: recurring_setup from DB maps to the three camelCase UI flags.
  // debtSetup and goalsSetup are currently UI-only until DB schema is updated.
  const gettingStartedSteps = {
    accounts: setupProgress.accounts_setup,
    fixedExpenses: setupProgress.recurringExpensesSetup, // Will be true if recurring_setup is true
    incomeSources: setupProgress.recurringIncomeSetup,   // Will be true if recurring_setup is true
    subscriptions: setupProgress.subscriptionsSetup,     // Will be true if recurring_setup is true
    debtTracking: setupProgress.debtSetup,             // UI-only for now
    savingsGoals: setupProgress.goalsSetup              // UI-only for now
  };

  const completedGettingStartedSteps = Object.values(gettingStartedSteps).filter(Boolean).length;
  const totalGettingStartedUiItems = Object.keys(gettingStartedSteps).length;
  
  const progressPercentage = totalGettingStartedUiItems > 0 
    ? Math.round((completedGettingStartedSteps / totalGettingStartedUiItems) * 100) 
    : 0;
  const isSetupComplete = progressPercentage === 100; // This specifically means Getting Started is 100%
  
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
  const [insights, setInsights] = useState<{ type: 'warning' | 'success' | 'info' | 'error', message: string }[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [upcomingBills, setUpcomingBills] = useState<any[]>([])
  const [budgetSnapshot, setBudgetSnapshot] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Add new imports for additional data
  const [debts, setDebts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any>(null);
  const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
  const [budgetPeriod, setBudgetPeriod] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>(null);

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
  
  // Update the fetchRecentTransactions function with improved date handling
  const fetchRecentTransactions = async (forceRefresh = false) => {
    if (!user || !user.id) {
      console.warn("fetchRecentTransactions: User not available or user.id missing.");
      return;
    }
    
    try {
      // Create a fresh Supabase client to avoid caching
      const supabase = createClient();
      
      if (forceRefresh) {
        console.log('FORCE REFRESH: Getting fresh data from Supabase');
      }
      
      // Fetch recent transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      
      if (txError) {
        console.error('Error fetching transactions:', txError);
      } else {
        setRecentTransactions(txData || []);
      }
      
      // Use the current date for upcoming bills
      const today = new Date();
      const nextTenDays = new Date();
      nextTenDays.setDate(today.getDate() + 10);
      
      // Format dates properly for Supabase query
      const todayFormatted = formatDateForSupabase(today);
      const nextTenDaysFormatted = formatDateForSupabase(nextTenDays);
      
      console.log('🔍 DEBUGGING DATES:');
      console.log('- Today (hardcoded for debug):', todayFormatted);
      console.log('- Next 10 days:', nextTenDaysFormatted);
      console.log('- User ID:', user.id);
      
      // IMPORTANT: Add cache-busting query parameter to avoid stale data
      const timestamp = new Date().getTime();
      
      // First, directly query the recurring_transactions table to see ALL user's bills (for debugging)
      const { data: allUserBills, error: allBillsError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_date', { ascending: true });
        
      console.log(`Found ${allUserBills?.length || 0} total recurring transactions for user`);
      
      if (allUserBills && allUserBills.length > 0) {
        console.log('Sample date from first bill:', allUserBills[0].next_date);
        console.log('Date types in data:', typeof allUserBills[0].next_date);
      } else {
        console.log('No bills found at all');
      }
      
      // Then get bills from today to 10 days from now - using explicit date strings
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('next_date', todayFormatted)
        .lte('next_date', nextTenDaysFormatted)
        .order('next_date', { ascending: true });
      
      console.log(`Upcoming bills query with date range: ${todayFormatted} to ${nextTenDaysFormatted}`);
      console.log(`Found ${upcomingData?.length || 0} bills in the 10-day window`);
      
      if (upcomingError) {
        console.error('Error fetching upcoming bills:', upcomingError);
        setUpcomingBills([]);
      } else if (upcomingData && upcomingData.length > 0) {
        console.log('✅ Found upcoming bills within next 10 days!');
        setUpcomingBills(upcomingData);
      } else {
        console.log('No bills found in date range. Checking DATE FORMATS...');
        
        // For debugging: Try to match individual bills by their date
        if (allUserBills && allUserBills.length > 0) {
          console.log('ALL RECURRING TRANSACTIONS DATES:');
          allUserBills.forEach((bill, i) => {
            const isInRange = bill.next_date >= todayFormatted && bill.next_date <= nextTenDaysFormatted;
            console.log(`Bill ${i+1}: ${bill.name}, Date: ${bill.next_date}, In Range: ${isInRange}`);
          });
        }
        
        // Fallback to showing any future bills
        console.log('Falling back to any future bills...');
        const { data: futureBills, error: futureError } = await supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('next_date', todayFormatted) // Only today or future
          .order('next_date', { ascending: true })
          .limit(5);
          
        console.log(`Found ${futureBills?.length || 0} future bills`);
        
        if (!futureError && futureBills && futureBills.length > 0) {
          console.log('✅ Found future bills to display');
          setUpcomingBills(futureBills);
        } else {
          console.log('No future bills found. Showing all bills...');
          
          if (allUserBills && allUserBills.length > 0) {
            console.log('✅ Using all bills as last resort');
            setUpcomingBills(allUserBills.slice(0, 5)); // Show first 5 bills
          } else {
            setUpcomingBills([]);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetch operations:', error);
    }
  };
  
  // Helper function to safely get setup progress, even if database fails
  const safeGetSetupProgress = async (userId: string): Promise<ExtendedSetupProgress> => {
    if (!userId) {
      console.error('safeGetSetupProgress: No user ID provided');
      return DEFAULT_EXTENDED_SETUP_PROGRESS;
    }
    try {
      console.log('Dashboard - Safely getting setup progress for user:', userId);
      // Try to get from database via the service
      const progress = await getSetupProgress(userId);
      console.log('Dashboard - Successfully loaded setup progress');
      return progress;
    } catch (error) {
      console.error('Dashboard - Error getting setup progress:', error);
      
      // Try to get from localStorage (ensure it's compatible with ExtendedSetupProgress or map it)
      if (typeof window !== 'undefined') {
        try {
          const localProgressString = localStorage.getItem('setup_progress');
          if (localProgressString) {
            const localProgress = JSON.parse(localProgressString);
            // Assuming localProgress might be SetupProgress, map it or ensure it's ExtendedSetupProgress
            if ('accounts_setup' in localProgress && !('recurringExpensesSetup' in localProgress)) {
               // This looks like a base SetupProgress, attempt to map
               // For simplicity, returning default extended if local is not already extended.
               // A proper mapping function from SetupProgress to ExtendedSetupProgress might be needed here
               // if localStorage can store the base type.
               // For now, if it's not clearly ExtendedSetupProgress, we default.
               // Or better: ensure what's saved to localStorage IS ExtendedSetupProgress.
               // Given the service getSetupProgress returns Extended, this path might be less common.
            }
            return localProgress as ExtendedSetupProgress; // Cast if confident, or map
          }
        } catch (e) {
          console.error('Error parsing localStorage progress:', e);
        }
      }
      
      // If all else fails, return default progress
      return { ...DEFAULT_EXTENDED_SETUP_PROGRESS, user_id: userId };
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
      const currentUser = data.user;
      setUser(currentUser);
      console.log('User authenticated:', currentUser);
      
      try {
        // Load setup progress
        const progress = await safeGetSetupProgress(currentUser.id);
        setSetupProgress(progress);
        
        // Load user accounts first, as checkAllSetupItems might depend on account status indirectly
        await loadUserAccounts(currentUser.id);
        // Then check all other setup items
        await checkAllSetupItems(currentUser.id);
        
        // Load user preferences
        try {
          await ensureUserPreferencesExist(currentUser.id);
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
  const checkAllSetupItems = async (userId: string) => {
    if (!userId) {
        console.error("checkAllSetupItems: No userId provided");
        return;
    }
    try {
      console.log('Dashboard - Checking all setup items for existing data for user:', userId);
      const supabase = createClient();
      const updatedSetupItems: Partial<ExtendedSetupProgress> = {};
      
      // 1. Check accounts - this is handled by loadUserAccounts. 
      // loadUserAccounts should be called before this or as part of initial data load.
      // We'll ensure loadUserAccounts is called with userId.
      // If accounts are present and setupProgress.accounts_setup is false, loadUserAccounts handles the update.
      // No need to call loadUserAccounts(userId) from here if it's already part of checkAuthAndLoadData sequence.
      // Let's assume it has run or will run, and this function primarily checks other items.

      // 2. Check recurring expenses
      try {
        const { data: recurringExpenses, error: expensesError } = await supabase
          .from('recurring_transactions')
          .select('id', { count: 'exact' }) // Use count for efficiency
          .eq('user_id', userId) // Add user_id filter
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
          .select('id', { count: 'exact' })
          .eq('user_id', userId) // Add user_id filter
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
          .select('id', { count: 'exact' })
          .eq('user_id', userId) // Add user_id filter
          .eq('category', 'Subscriptions') // Assuming 'category' field exists
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
          .select('id', { count: 'exact' })
          .eq('user_id', userId) // Add user_id filter
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
          .select('id', { count: 'exact' })
          .eq('user_id', userId) // Add user_id filter
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
        console.log('Dashboard - Updating setup progress based on existing data for user:', userId, updatedSetupItems);
        const currentProgress = await updateSetupProgress(userId, updatedSetupItems);
        setSetupProgress(currentProgress);
      }
      
    } catch (error) {
      console.error('Error checking setup items for user:', userId, error);
    }
  };

  // Function to load user accounts
  const loadUserAccounts = async (userId: string) => {
    if (!userId) {
        console.error("loadUserAccounts: No userId provided");
        setAccountError("Could not load accounts: User ID missing.");
        return;
    }
    try {
      console.log('Dashboard - Loading user accounts for user:', userId);
      // Fetch accounts
      const userAccounts = await getAccounts(userId);
      console.log('Dashboard - Accounts loaded:', userAccounts);
      setAccounts(userAccounts);
      setAccountError(null); 
      
      // Update setup progress based on accounts
      if (userAccounts.length > 0) {
        if (!setupProgress.accounts_setup) {
          console.log('Dashboard - Accounts found, updating accounts_setup to true for user:', userId);
          const updatedProgress = await updateSetupProgress(userId, { accounts_setup: true });
          setSetupProgress(updatedProgress);
        } else {
          console.log('Dashboard - Accounts found, accounts_setup is already true for user:', userId);
        }
      } else {
        // If no accounts, and accounts_setup was true, set it to false.
        if (setupProgress.accounts_setup) {
            console.log('Dashboard - No accounts found, setting accounts_setup to false for user:', userId);
            const updatedProgress = await updateSetupProgress(userId, { accounts_setup: false });
            setSetupProgress(updatedProgress);
        } else {
            console.log('Dashboard - No accounts found, accounts_setup is already false or state not initialized for user:', userId);
        }
      }
      
      // Get total balance
      const balance = await getTotalBalance();
      console.log('Dashboard - Total balance calculated:', balance);
      setTotalBalance(balance);
    } catch (error) {
      console.error('Error loading user accounts:', error);
    }
  };
  
  const handleSetupItemClick = async (item: keyof typeof setupProgress) => {
    console.log(`Dashboard - handleSetupItemClick called for ${item}`);
    // Store which setup item was clicked
    setLastClickedSetupItem(item);
    
    if (item === 'accounts_setup') {
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
      const updatedProgress = await updateSetupProgress(setupProgress.user_id, { [item]: newValue });
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
      
      if (!user || !user.id) {
        console.error("handleAddAccount: User ID not available.");
        setAccountError("User not identified. Cannot create account.");
        setIsSubmittingAccount(false);
        return;
      }
      // Save the account to the database
      const newAccount = await createAccount(accountData, user.id);
      
      console.log('Dashboard - Account created successfully:', newAccount);
      
      // Update setup progress
      const updatedProgress = await updateSetupProgress(user.id, { accounts_setup: true });
      setSetupProgress(updatedProgress);
      
      // Reload accounts
      await loadUserAccounts(user.id);
      
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
      let updatedItem: Partial<ExtendedSetupProgress> = {};
      
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
      const updatedProgress = await updateSetupProgress(setupProgress.user_id, updatedItem);
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
      const userId = setupProgress.user_id;
      
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
      const updatedProgress = await updateSetupProgress(userId, { debtSetup: true });
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
      const userId = setupProgress.user_id;
      
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
      const updatedProgress = await updateSetupProgress(userId, { goalsSetup: true });
      setSetupProgress(updatedProgress);
      
      // Close the modal
      setIsGoalModalOpen(false);
    } catch (error: any) {
      console.error('Error adding goal:', error);
      setAccountError(error.message || 'An error occurred while creating the goal.');
    }
  }
  
  // Fetch all user data
  const fetchAllUserData = async (userId: string) => {
    const supabase = createClient();

    // Debts
    const { data: debtsData } = await supabase.from('debts').select('*').eq('user_id', userId);
    setDebts(debtsData || []);

    // Investments
    const { data: investmentsData } = await supabase.from('investment_portfolio').select('*').eq('user_id', userId).single();
    setInvestments(investmentsData || null);

    // Budget Categories
    const { data: budgetCatData } = await supabase.from('budget_categories').select('*').eq('user_id', userId);
    setBudgetCategories(budgetCatData || []);

    // Budget Period (active)
    const { data: budgetPeriodData } = await supabase.from('budget_periods').select('*').eq('user_id', userId).eq('is_active', true).single();
    setBudgetPeriod(budgetPeriodData || null);

    // Cash Flow (current month)
    const month = new Date().toISOString().slice(0, 7);
    const { data: cashFlowData } = await supabase.from('cash_flow').select('*').eq('user_id', userId).eq('month', month).single();
    setCashFlow(cashFlowData || null);

    // Notifications (unread)
    const { data: notificationsData } = await supabase.from('notifications').select('*').eq('user_id', userId).eq('is_read', false).order('timestamp', { ascending: false }).limit(5);
    setNotifications(notificationsData || []);

    // User Preferences
    const { data: preferencesData } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();
    setUserPreferences(preferencesData || null);
  };

  // Call fetchAllUserData after user is set
  useEffect(() => {
    if (user && user.id) {
      fetchAllUserData(user.id);
    }
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Personalized Greeting & Profile */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back{user && user.full_name ? `, ${user.full_name}` : ''}!</h1>
          <p className="text-gray-500 mt-1">Here's your financial overview at a glance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Wellness Score</span>
            <span className="text-2xl font-semibold text-blue-600">{financialWellnessScore}</span>
          </div>
          {/* Profile avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
            {user && user.full_name ? user.full_name[0] : 'U'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Add Transaction</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Add Account</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600">Transfer Money</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700">Pay Bill</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Worth */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-xs text-gray-400">Net Worth</span>
          <span className="text-2xl font-bold text-gray-900">$0.00</span>
          {/* TODO: Calculate net worth from accounts, debts, investments */}
        </div>
        {/* Total Balances */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-xs text-gray-400">Cash & Bank</span>
          <span className="text-xl font-semibold text-green-600">{totalBalance ? `$${totalBalance.toLocaleString()}` : '$0.00'}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-xs text-gray-400">Credit/Debt</span>
          <span className="text-xl font-semibold text-red-600">{/* TODO: Calculate total debt */}$0.00</span>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-xs text-gray-400">Investments</span>
          <span className="text-xl font-semibold text-blue-600">{/* TODO: Calculate investments */}$0.00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
          <ul className="divide-y divide-gray-100">
            {recentTransactions.length > 0 ? recentTransactions.slice(0, 5).map((tx: any) => (
              <li key={tx.id} className="py-2 flex justify-between items-center">
                <span className="text-gray-700">{tx.description || tx.category}</span>
                <span className={`font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>{tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}</span>
              </li>
            )) : <li className="text-gray-400">No recent transactions</li>}
          </ul>
        </div>
        {/* Upcoming Bills */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Upcoming Bills</h2>
            <button 
              onClick={() => fetchRecentTransactions(true)} 
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          {upcomingBills.length > 0 && upcomingBills[0]._isOutdated && (
            <div className="mb-3 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Note: Your recurring bills have outdated due dates. Visit the Recurring page to update them.
            </div>
          )}
          <ul className="divide-y divide-gray-100">
            {upcomingBills.length > 0 ? upcomingBills.slice(0, 5).map((bill: any) => (
              <li key={bill.id} className="py-2 flex justify-between items-center">
                <span className="text-gray-700">{bill.name}</span>
                <span className={`text-gray-500 text-sm ${bill._isOutdated ? "text-amber-500" : ""}`}>
                  {new Date(bill.next_date).toLocaleDateString()}
                </span>
                <span className="font-semibold text-red-600">${Math.abs(bill.amount).toFixed(2)}</span>
              </li>
            )) : <li className="text-gray-400">No upcoming bills</li>}
          </ul>
        </div>
        {/* Budget Snapshot */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Budget Snapshot</h2>
          {budgetSnapshot ? (
            <>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Spent</span>
                <span className="font-semibold text-red-600">${budgetSnapshot.spent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Budgeted</span>
                <span className="font-semibold text-green-600">${budgetSnapshot.budgeted.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (budgetSnapshot.spent / budgetSnapshot.budgeted) * 100)}%` }}></div>
              </div>
              <div className="text-xs text-gray-400">Top Categories:</div>
              <ul className="text-xs text-gray-600">
                {budgetSnapshot.topCategories.map((cat: any) => (
                  <li key={cat.name}>{cat.name}: ${cat.spent.toFixed(2)}</li>
                ))}
              </ul>
            </>
          ) : <div className="text-gray-400">No budget data</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Goals */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Savings Goals</h2>
          {goals.length > 0 ? goals.slice(0, 2).map((goal: any) => (
            <div key={goal.id} className="mb-3">
              <div className="flex justify-between">
                <span className="text-gray-700">{goal.name}</span>
                <span className="text-gray-500 text-sm">{goal.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${goal.progress}%` }}></div>
              </div>
            </div>
          )) : <div className="text-gray-400">No savings goals</div>}
        </div>
        {/* Cash Flow Mini-Chart */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3">Cash Flow</h2>
          {/* TODO: Add mini chart component */}
          <div className="w-full h-24 flex items-center justify-center text-gray-400">[Mini Chart]</div>
        </div>
        {/* Alerts & Insights */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Alerts & Insights</h2>
          <ul className="space-y-2">
            {insights.length > 0 ? insights.map((insight, index) => (
              <li key={index} className={`text-sm ${insight.type === 'warning' ? 'text-yellow-600' : insight.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>{insight.message}</li>
            )) : <li className="text-gray-400">No alerts</li>}
          </ul>
        </div>
      </div>

      {/* New widgets/cards for each data type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Debts */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-xs text-gray-400">Debts</span>
          <span className="text-xl font-semibold text-red-600">{debts.reduce((sum, d) => sum + (d.balance || 0), 0).toLocaleString(undefined, { style: 'currency', currency: userPreferences?.currency || 'USD' })}</span>
        </div>
        {/* Investments */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-xs text-gray-400">Investments</span>
          <span className="text-xl font-semibold text-blue-600">{investments ? investments.total_value.toLocaleString(undefined, { style: 'currency', currency: userPreferences?.currency || 'USD' }) : '$0.00'}</span>
        </div>
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Notifications</h2>
          <ul className="divide-y divide-gray-100">
            {notifications.length > 0 ? notifications.map(n => (
              <li key={n.id} className="py-2 flex flex-col">
                <span className="font-semibold">{n.title}</span>
                <span className="text-gray-500 text-sm">{n.message}</span>
              </li>
            )) : <li className="text-gray-400">No new notifications</li>}
          </ul>
        </div>
        {/* Preferences */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Preferences</h2>
          <div className="text-gray-600 text-sm">Currency: {userPreferences?.currency || 'USD'}</div>
          <div className="text-gray-600 text-sm">Theme: {userPreferences?.theme || 'light'}</div>
        </div>
      </div>
    </div>
  )
} 
