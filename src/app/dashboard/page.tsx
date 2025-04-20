'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight, CreditCard, ArrowDownCircle, ArrowUpCircle, 
         CalendarClock, Wallet, Target, BellRing, CircleDollarSign, Car, Home, Plane, GraduationCap, Briefcase, Plus } from 'lucide-react'
import AddAccountModal from '@/components/features/AddAccountModal'
import { createAccount, getAccounts, getTotalBalance, Account, AccountType, getCurrentUserId } from '@/lib/services/accountService'
import { getSetupProgress, updateSetupProgress, SetupProgress, DEFAULT_SETUP_PROGRESS, resetSetupProgress, ensureUserPreferencesExist } from '@/lib/services/setupProgressService'
import AddRecurringModal from '@/components/features/AddRecurringModal'
import AddDebtModal from '@/components/features/AddDebtModal'

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
  
  // Add state for error notification
  const [accountError, setAccountError] = useState<string | null>(null)
  
  // State for recurring transaction modal and tracking which button was clicked
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [lastClickedSetupItem, setLastClickedSetupItem] = useState<string | null>(null);
  
  // State for debt modal
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false)
  
  // State for goal modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  
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
        
        // Load accounts (even if they fail, don't block rendering the whole dashboard)
        loadUserAccounts().catch(err => {
          console.error('Error loading accounts (non-blocking):', err);
          setAccountError('Could not load accounts. Please try refreshing.');
        });
        
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
      
      // You would normally save this to the database here
      
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
      
      // You would normally save this to the database here
      
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
        
        {/* Getting Started Section */}
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