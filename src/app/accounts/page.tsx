'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, CreditCard, Wallet, BuildingIcon, CircleDollarSign, Edit, Trash2 } from 'lucide-react'
import { getAccounts, getTotalBalance, updateAccount, deleteAccount } from '@/lib/services/accountService'
import type { Account as ImportedAccount, AccountType } from '@/lib/types/states'
import AddAccountModal from '@/components/features/AddAccountModal'
import EditAccountModal from '@/components/features/EditAccountModal'
import DeleteConfirmModal from '@/components/features/DeleteConfirmModal'
import AccountTransactionsModal from '@/components/features/AccountTransactionsModal'
import { createAccount } from '@/lib/services/accountService'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDebtData } from '@/hooks/useDebtData'
import AddTransactionModal from '@/components/features/AddTransactionModal'

// Extend the base Account type to include debt-specific properties
interface Account extends ImportedAccount {
  is_debt?: boolean;
  interest_rate?: number;
  minimum_payment?: number;
}

export default function Accounts() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'checking' | 'savings' | 'credit' | 'investment'>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  // Get credit card debts
  const { debts } = useDebtData()
  const creditCardDebts = debts.filter(debt => debt.category === 'Credit Card').map(debt => ({
    ...debt,
    user_id: debt.user_id || currentUserId || ''
  }))
  
  // Convert credit card debts to account format for display
  const creditCardAccounts: Account[] = creditCardDebts.map((debt) => ({
    id: debt.id.toString(),
    user_id: debt.user_id,
    name: debt.name,
    institution: debt.lender || 'Unknown',
    balance: debt.balance,
    type: 'credit' as AccountType,
    created_at: debt.createdAt || new Date().toISOString(),
    updated_at: debt.updatedAt || new Date().toISOString(),
    is_debt: true,
    interest_rate: debt.interestRate,
    minimum_payment: debt.minimumPayment,
    account_number: null,
    currency: 'USD',
    last_four: null,
    status: 'active'
  }))
  
  // Combined accounts for display
  const allAccounts = [...accounts, ...creditCardAccounts]
  
  // New state for transactions modal
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false)
  const [selectedAccountForTransactions, setSelectedAccountForTransactions] = useState<Account | null>(null)
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false)
  const [selectedAccountForAddTransaction, setSelectedAccountForAddTransaction] = useState<Account | null>(null)
  
  // Function to handle opening the transactions modal
  const handleViewTransactions = (account: Account) => {
    setSelectedAccountForTransactions(account)
    setIsTransactionsModalOpen(true)
  }
  
  // Function to handle opening the add transaction modal
  const handleAddTransaction = (account: Account) => {
    setSelectedAccountForAddTransaction(account)
    setIsAddTransactionModalOpen(true)
  }
  
  useEffect(() => {
    // Check authentication status first
    checkAuthAndLoadData()
  }, [router])
  
  const checkAuthAndLoadData = async () => {
    try {
      // const supabase = createClient() // REMOVED: No longer creating a local client instance

      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error checking session:', sessionError)
        setError('Failed to authenticate user')
        setLoading(false)
        return
      }
      
      // Check for bypass parameter in the URL for development
      const bypassAuth = typeof window !== 'undefined' && 
        window.location.search.includes('bypassAuth=true')

      let userIdToUse: string | null = null;

      if (sessionData.session?.user?.id) {
        userIdToUse = sessionData.session.user.id;
      } else if (bypassAuth) {
        // In bypass mode, you might want to set a mock user ID or handle appropriately
        console.warn("Bypass auth mode: No actual user session. Using mock user ID if available or null.");
        const mockUser = localStorage.getItem('mock_user');
        if (mockUser) {
          userIdToUse = JSON.parse(mockUser).id;
        } else {
          // Fallback or error if no mock user in bypass mode
          setError("Bypass auth mode enabled, but no mock user data found in local storage.");
          setLoading(false);
          return;
        }
      }

      console.log('Auth check - Session data:', sessionData)
      console.log('Auth check - Bypass auth:', bypassAuth)
      console.log('Auth check - User ID to use:', userIdToUse)

      if (!userIdToUse && !bypassAuth) { // Condition adjusted, bypassAuth already implies we might not have a session
        // Redirect to login if no session and not bypassing auth
        console.log('No active session or usable user ID, redirecting to login')
        router.push('/auth/signin')
        return
      }
      
      setCurrentUserId(userIdToUse); // STORE userId
      setAuthChecked(true)

      // Now load the accounts - ensure we load accounts right after auth is confirmed
      console.log('Auth confirmed, loading accounts data for user:', userIdToUse)
      if (userIdToUse) {
        await loadAccounts(userIdToUse)
      } else if (bypassAuth && !userIdToUse) {
        // If bypassing auth but couldn't get a mock user ID, it's an error state.
        setError("Bypass auth mode: No mock user ID to load data for.");
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in auth check or loading accounts:', err) // Combined error handling
      setError('An unexpected error occurred during authentication or data loading')
      setLoading(false)
    }
  }
  
  const loadAccounts = async (userId: string) => { // MODIFIED: Accept userId
    if (!userId) {
      setError("User ID is missing, cannot load accounts.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true)
      setError(null)

      console.log('Loading accounts data for user:', userId)
      // Add a small delay to ensure database operations complete
      await new Promise(resolve => setTimeout(resolve, 100))

      const userAccounts = await getAccounts(userId) // PASS userId
      console.log('Accounts loaded:', userAccounts)
      console.log('Account count:', userAccounts.length)
      console.log('Account user_ids:', userAccounts.map(a => a.user_id))
      setAccounts(userAccounts)

      // getTotalBalance in service fetches its own userId, but good practice to be consistent
      // If you modify getTotalBalance to accept userId, pass it here too.
      const balance = await getTotalBalance() // This service function gets its own userId
      console.log('Total balance calculated:', balance)
      setTotalBalance(balance)
    } catch (error: any) {
      console.error('Error loading accounts:', error)
      setError(error.message || 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddAccount = async (accountData: { name: string; institution: string; type: AccountType; balance: number }) => {
    if (!currentUserId) {
      setError("User ID is missing, cannot add account.");
      setIsSubmittingAccount(false); // Ensure submitting state is reset
      return;
    }
    try {
      setIsSubmittingAccount(true)
      setError(null)

      console.log('Adding new account for user:', currentUserId, accountData)

      // Save account to database
      const newAccount = await createAccount(accountData, currentUserId) // PASS currentUserId

      if (newAccount) {
        console.log('New account created successfully:', newAccount)
        await loadAccounts(currentUserId) // PASS currentUserId
        setIsAccountModalOpen(false)
      } else {
        console.error('Failed to create account, no error returned')
        setError('Failed to create account. Please try again.')
      }
    } catch (error: any) {
      console.error('Error adding account:', error)
      setError(error.message || 'An error occurred while creating the account.')
    } finally {
      setIsSubmittingAccount(false)
    }
  }
  
  const handleUpdateAccount = async (id: string, accountData: { name: string; institution: string; type: AccountType; balance: number }) => {
    if (!currentUserId) {
      setError("User ID is missing, cannot update account.");
      setIsSubmittingAccount(false);
      return;
    }
    try {
      setIsSubmittingAccount(true)
      setError(null)
      
      console.log('Updating account for user:', currentUserId, { id, ...accountData })
      
      // Update account in database
      const updatedAccount = await updateAccount(id, accountData, currentUserId) // PASS currentUserId
      
      if (updatedAccount) {
        console.log('Account updated successfully:', updatedAccount)
        await loadAccounts(currentUserId) // PASS currentUserId
        setIsEditModalOpen(false)
      } else {
        console.error('Failed to update account, no error returned')
        setError('Failed to update account. Please try again.')
      }
    } catch (error: any) {
      console.error('Error updating account:', error)
      setError(error.message || 'An error occurred while updating the account.')
    } finally {
      setIsSubmittingAccount(false)
    }
  }
  
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setIsEditModalOpen(true)
  }
  
  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account)
    setIsDeleteModalOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (selectedAccount?.id && currentUserId) { // Check for currentUserId
      try {
        setError(null)
        console.log('Deleting account for user:', currentUserId, selectedAccount.id)
        
        const deleted = await deleteAccount(selectedAccount.id.toString(), currentUserId) // Ensure ID is string
        
        if (deleted) {
          console.log('Account deleted successfully')
          await loadAccounts(currentUserId) // PASS currentUserId
          setIsDeleteModalOpen(false)
        } else {
          console.error('Failed to delete account, no error returned')
          setError('Failed to delete account. Please try again.')
        }
      } catch (error: any) {
        console.error('Error deleting account:', error)
        setError(error.message || 'An error occurred while deleting the account.')
      }
    }
  }
  
  const getAccountIcon = (type: string) => {
    switch(type) {
      case 'checking':
        return <CircleDollarSign className="h-6 w-6 text-blue-600" />
      case 'savings':
        return <BuildingIcon className="h-6 w-6 text-green-600" />
      case 'credit':
        return <CreditCard className="h-6 w-6 text-purple-600" />
      case 'cash':
        return <Wallet className="h-6 w-6 text-yellow-600" />
      case 'investment':
        return <BuildingIcon className="h-6 w-6 text-indigo-600" />
      default:
        return <CircleDollarSign className="h-6 w-6 text-gray-600" />
    }
  }
  
  const filterAccountsByType = (accounts: Account[]) => {
    switch(activeTab) {
      case 'checking':
        return accounts.filter(a => a.type === 'checking' || a.type === 'cash')
      case 'savings':
        return accounts.filter(a => a.type === 'savings')
      case 'credit':
        return accounts.filter(a => a.type === 'credit')
      case 'investment':
        return accounts.filter(a => a.type === 'investment')
      default:
        return accounts
    }
  }
  
  const filteredAccounts = filterAccountsByType(
    allAccounts.filter(account => 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account.institution && account.institution.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )

  const handleTabClick = (tab: 'all' | 'checking' | 'savings' | 'credit' | 'investment') => {
    setActiveTab(tab)
  }

  // Total credit card debt
  const totalCreditCardDebt = creditCardDebts.reduce((sum, debt) => sum + debt.balance, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1F3A93]">Accounts</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            onClick={() => setIsAccountModalOpen(true)}
            disabled={isSubmittingAccount}
          >
            <Plus className="h-5 w-5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => { if (currentUserId) loadAccounts(currentUserId); }}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading accounts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900">No accounts yet</h3>
          <p className="mt-1 text-gray-500">Get started by adding your first account.</p>
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </button>
          
          {/* Debug button */}
          <div className="mt-8 text-xs text-gray-400">
            <button
              onClick={async () => {
                try {
                  // Check for auth status
                  // const supabase = createClient(); // REMOVED, use singleton
                  const { data: { user }, error: authError } = await supabase.auth.getUser(); // USE SINGLETON
                  console.log('Auth check - Current user:', user);
                  if (authError) {
                    console.error('Auth error:', authError);
                    alert(`Auth error: ${authError.message}`);
                  }
                  
                  if (!user) {
                    alert('No user is currently logged in. Please sign in first.');
                    return;
                  }
                  
                  // Check for accounts without user_id filter
                  const { data, error } = await supabase
                    .from('accounts')
                    .select('*');
                    
                  if (error) {
                    console.error('Error fetching accounts:', error);
                    alert(`Error fetching accounts: ${error.message}`);
                    return;
                  }
                  
                  if (data.length === 0) {
                    alert('No accounts found in the database.');
                  } else {
                    // Show accounts with user IDs
                    console.log('All accounts:', data);
                    const userIds = [...new Set(data.map(a => a.user_id))];
                    alert(`Found ${data.length} account(s) with ${userIds.length} different user IDs.\nYour user ID: ${user.id}\nAccount user IDs: ${userIds.join(', ')}`);
                  }
                } catch (e: any) {
                  console.error('Debug error:', e);
                  alert(`Error: ${e.message}`);
                }
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Debug Database
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Financial Overview Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Balance Card - Enhanced version of existing card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg col-span-1">
              <h2 className="text-xl font-medium mb-1">Total Balance</h2>
              <p className="text-3xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-blue-100 text-sm mt-2">Across {accounts.length} accounts</p>
            </div>
            
            {/* Account Type Summary */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 col-span-1">
              <h2 className="text-xl font-medium mb-3 text-gray-800">Spending</h2>
              <p className="text-2xl font-bold text-gray-900">
                ${accounts.filter(a => a.type === 'checking' || a.type === 'cash').reduce((sum, account) => sum + account.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {accounts.filter(a => a.type === 'checking' || a.type === 'cash').length} accounts
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 col-span-1">
              <h2 className="text-xl font-medium mb-3 text-gray-800">Savings</h2>
              <p className="text-2xl font-bold text-green-600">
                ${accounts.filter(a => a.type === 'savings' || a.type === 'investment').reduce((sum, account) => sum + account.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {accounts.filter(a => a.type === 'savings' || a.type === 'investment').length} accounts
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 col-span-1">
              <h2 className="text-xl font-medium mb-3 text-gray-800">Credit Cards</h2>
              <p className="text-2xl font-bold text-red-600">
                ${totalCreditCardDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {creditCardDebts.length} credit cards
              </p>
            </div>
          </div>

          {/* Account Type Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button 
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabClick('all')}
                >
                  All Accounts
                </button>
                <button 
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'checking' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabClick('checking')}
                >
                  Checking & Cash
                </button>
                <button 
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'savings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabClick('savings')}
                >
                  Savings
                </button>
                <button 
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'credit' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabClick('credit')}
                >
                  Credit Cards
                </button>
                <button 
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'investment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabClick('investment')}
                >
                  Investments
                </button>
              </nav>
            </div>
          </div>

          {/* Accounts Grid - Enhanced from existing layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Account Header with Color Bar based on type */}
                <div className={`h-2 ${
                  account.type === 'checking' ? 'bg-blue-500' :
                  account.type === 'savings' ? 'bg-green-500' :
                  account.type === 'credit' ? 'bg-red-500' :
                  account.type === 'cash' ? 'bg-yellow-500' :
                  'bg-indigo-500'
                }`}></div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${
                        account.type === 'checking' ? 'bg-blue-100 text-blue-600' :
                        account.type === 'savings' ? 'bg-green-100 text-green-600' :
                        account.type === 'credit' ? 'bg-red-100 text-red-600' :
                        account.type === 'cash' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{account.name}</h3>
                        <p className="text-gray-500 text-sm">{account.institution || 'Personal'}</p>
                        {account.is_debt && (
                          <p className="text-xs text-red-500 mt-1">
                            Interest: {(account as any).interest_rate}% | Min Payment: ${(account as any).minimum_payment}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!account.is_debt ? (
                        <>
                          <button 
                            onClick={() => handleEditAccount(account)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit Account"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAccount(account)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/debt"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Manage in Debt Tracker"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Balance with card styling based on account type */}
                  <div className={`p-4 mb-4 rounded-lg ${
                    account.type === 'checking' ? 'bg-blue-50' :
                    account.type === 'savings' ? 'bg-green-50' :
                    account.type === 'credit' ? 'bg-red-50' :
                    account.type === 'cash' ? 'bg-yellow-50' :
                    'bg-indigo-50'
                  }`}>
                    <p className="text-gray-600 text-sm">Current Balance</p>
                    <p className={`text-2xl font-bold ${
                      account.type === 'credit' ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Type</span>
                      <span className="capitalize">{account.type}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 text-sm">Last Updated</span>
                      <span className="text-sm text-gray-600">{account.updated_at ? new Date(account.updated_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    
                    {/* Quick Actions with actual navigation links */}
                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                      {!account.is_debt ? (
                        <>
                          <button 
                            onClick={() => handleViewTransactions(account)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Transactions
                          </button>
                          <button 
                            onClick={() => handleAddTransaction(account)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Add Transaction
                          </button>
                        </>
                      ) : (
                        <div className="flex w-full justify-center">
                          <Link
                            href="/debt"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Manage in Debt Tracker
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* No Results State */}
          {accounts.length > 0 && filteredAccounts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No accounts found matching "{searchQuery}"</p>
            </div>
          )}
        </>
      )}
      
      {/* Debug Panel */}
      <div className="mt-8 p-4 border border-gray-200 rounded-lg">
        <details>
          <summary className="cursor-pointer font-semibold">Debug Information</summary>
          <div className="mt-2 p-4 bg-gray-100 rounded overflow-auto max-h-96">
            <h3 className="font-bold">Accounts ({accounts.length})</h3>
            <pre className="text-xs whitespace-pre-wrap mt-2">{JSON.stringify(accounts, null, 2)}</pre>
            
            {/* Developer Actions */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-4">
                <h4 className="font-semibold">Developer Actions</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button 
                    onClick={() => { if (currentUserId) loadAccounts(currentUserId); }}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Reload Accounts
                  </button>
                  <button
                    onClick={async () => {
                      if (!currentUserId) {
                        alert('Please log in to clear accounts.');
                        return;
                      }
                      alert("clearAllAccounts functionality is currently disabled.");
                    }}
                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Clear All Accounts (Disabled)
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('mock_user');
                      alert('Mock user data cleared. Page will reload.');
                      window.location.reload();
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    Clear User Data
                  </button>
                  <button 
                    onClick={() => {
                      // Create a consistent mock user for testing
                      const mockUser = {
                        id: 'test-user-1234',
                        email: 'test@example.com',
                        last_sign_in_at: new Date().toISOString()
                      };
                      localStorage.setItem('mock_user', JSON.stringify(mockUser));
                      alert(`Set consistent mock user: ${mockUser.id}. Page will reload with bypass mode.`);
                      window.location.href = window.location.pathname + '?bypassAuth=true';
                    }}
                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Set Test User
                  </button>
                  <button 
                    onClick={() => window.location.href = window.location.pathname + '?bypassAuth=true'}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                  >
                    Enable Bypass Mode
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        // Access Supabase directly to get all accounts without user_id filter
                        // const supabase = createClient(); // REMOVED, use singleton
                        const { data, error } = await supabase // USE SINGLETON
                          .from('accounts')
                          .select('*')
                          .order('name');
                          
                        if (error) {
                          console.error('Error fetching all accounts:', error);
                          alert('Error fetching all accounts: ' + error.message);
                          return;
                        }
                        
                        console.log('All accounts without filter:', data);
                        alert(`Found ${data.length} total accounts in the database. Check console for details.`);
                        
                        // Show user IDs to help debug
                        if (data.length > 0) {
                          const userIds = [...new Set(data.map(a => a.user_id))];
                          console.log('Unique user_ids in database:', userIds);
                          
                          // Get current user ID for comparison
                          const { data: { user } } = await supabase.auth.getUser();
                          console.log('Current authenticated user ID:', user?.id);
                          
                          // Get localStorage user if any
                          try {
                            const mockUserStr = localStorage.getItem('mock_user');
                            if (mockUserStr) {
                              const mockUser = JSON.parse(mockUserStr);
                              console.log('Mock user ID from localStorage:', mockUser.id);
                            }
                          } catch (e) {
                            console.error('Error checking localStorage user:', e);
                          }
                        }
                      } catch (e: any) {
                        console.error('Error in debug action:', e);
                        alert('Error: ' + e.message);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                  >
                    Debug All Accounts
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-bold">Authentication State</h3>
              <button
                onClick={async () => {
                  try {
                    // const supabase = createClient(); // REMOVED, use singleton
                    const { data, error } = await supabase.auth.getSession(); // USE SINGLETON
                    console.log('Current session:', data, error);
                    
                    // Display in the debug panel
                    const debugElement = document.getElementById('auth-debug');
                    if (debugElement) {
                      debugElement.textContent = JSON.stringify(data, null, 2);
                    }
                  } catch (err) {
                    console.error('Error checking auth:', err);
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded mt-1"
              >
                Check Auth State
              </button>
              <pre id="auth-debug" className="text-xs whitespace-pre-wrap mt-2 p-2 bg-gray-200 rounded"></pre>
            </div>
          </div>
        </details>
      </div>
      
      {/* Edit Account Modal - Only render when selectedAccount is not null */}
      {selectedAccount && (
        <EditAccountModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateAccount}
          account={selectedAccount}
          isSubmitting={isSubmittingAccount}
        />
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleAddAccount}
        isSubmitting={isSubmittingAccount}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedAccount?.name || ''}
        itemType="account"
      />

      {/* Account Transactions Modal */}
      {selectedAccountForTransactions && !selectedAccountForTransactions.is_debt && (
        <AccountTransactionsModal
          isOpen={isTransactionsModalOpen}
          onClose={() => setIsTransactionsModalOpen(false)}
          accountId={selectedAccountForTransactions.id || ''}
          accountName={selectedAccountForTransactions.name}
        />
      )}

      {/* Add Transaction Modal */}
      {selectedAccountForAddTransaction && !selectedAccountForAddTransaction.is_debt && (
        <AddTransactionModal
          isOpen={isAddTransactionModalOpen}
          onClose={() => setIsAddTransactionModalOpen(false)}
          onTransactionAdded={() => { if (currentUserId) loadAccounts(currentUserId); }}
          preselectedAccountId={selectedAccountForAddTransaction.id || ''}
        />
      )}
    </div>
  )
} 