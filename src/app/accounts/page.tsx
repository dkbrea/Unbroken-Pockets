'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, CreditCard, Wallet, BuildingIcon, CircleDollarSign, Edit, Trash2 } from 'lucide-react'
import { getAccounts, getTotalBalance, Account, AccountType, clearAllAccounts, updateAccount, deleteAccount } from '@/lib/services/accountService'
import AddAccountModal from '@/components/features/AddAccountModal'
import EditAccountModal from '@/components/features/EditAccountModal'
import DeleteConfirmModal from '@/components/features/DeleteConfirmModal'
import { createAccount } from '@/lib/services/accountService'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  
  useEffect(() => {
    // Check authentication status first
    checkAuthAndLoadData()
  }, [router])
  
  const checkAuthAndLoadData = async () => {
    try {
      const supabase = createClient()
      
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
      
      console.log('Auth check - Session data:', sessionData)
      console.log('Auth check - Bypass auth:', bypassAuth)
      
      if (!sessionData.session && !bypassAuth) {
        // Redirect to login if no session and not bypassing auth
        console.log('No active session, redirecting to login')
        router.push('/auth/signin')
        return
      }
      
      setAuthChecked(true)
      
      // Now load the accounts - ensure we load accounts right after auth is confirmed
      console.log('Auth confirmed, loading accounts data...')
      await loadAccounts()
    } catch (err) {
      console.error('Error in auth check:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }
  
  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading accounts data...')
      // Add a small delay to ensure database operations complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const userAccounts = await getAccounts()
      console.log('Accounts loaded:', userAccounts)
      console.log('Account count:', userAccounts.length)
      console.log('Account user_ids:', userAccounts.map(a => a.user_id))
      setAccounts(userAccounts)
      
      const balance = await getTotalBalance()
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
    try {
      setIsSubmittingAccount(true)
      setError(null)
      
      console.log('Adding new account:', accountData)
      
      // Save account to database
      const newAccount = await createAccount(accountData)
      
      if (newAccount) {
        console.log('New account created successfully:', newAccount)
        await loadAccounts()
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
  
  const handleUpdateAccount = async (id: number, accountData: { name: string; institution: string; type: AccountType; balance: number }) => {
    try {
      setIsSubmittingAccount(true)
      setError(null)
      
      console.log('Updating account:', { id, ...accountData })
      
      // Update account in database
      const updatedAccount = await updateAccount(id, accountData)
      
      if (updatedAccount) {
        console.log('Account updated successfully:', updatedAccount)
        await loadAccounts()
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
    if (selectedAccount?.id) {
      try {
        setError(null)
        console.log('Deleting account:', selectedAccount.id)
        
        const deleted = await deleteAccount(selectedAccount.id)
        
        if (deleted) {
          console.log('Account deleted successfully')
          await loadAccounts()
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
  
  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.institution && account.institution.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Accounts</h1>
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

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 mb-8 text-white shadow-lg">
        <h2 className="text-xl font-medium mb-1">Total Balance</h2>
        <p className="text-4xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => loadAccounts()} 
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
                  const supabase = createClient();
                  const { data: { user }, error: authError } = await supabase.auth.getUser();
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
          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded-full mr-3">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{account.name}</h3>
                      <p className="text-gray-500 text-sm">{account.institution || 'Personal'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
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
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Balance</span>
                    <span className="font-semibold">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 text-sm">Type</span>
                    <span className="capitalize">{account.type}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 text-sm">Last Updated</span>
                    <span className="text-sm text-gray-600">{account.last_updated ? new Date(account.last_updated).toLocaleDateString() : 'N/A'}</span>
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
                    onClick={loadAccounts}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Reload Accounts
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const success = await clearAllAccounts();
                        if (success) {
                          alert('All accounts cleared successfully');
                          loadAccounts(); // Reload the accounts
                        } else {
                          alert('Failed to clear accounts');
                        }
                      } catch (error) {
                        console.error('Error clearing accounts:', error);
                        alert('Error clearing accounts');
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Clear All Accounts
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
                        const supabase = createClient();
                        const { data, error } = await supabase
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
                    const supabase = createClient();
                    const { data, error } = await supabase.auth.getSession();
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
      
      {/* Edit Account Modal */}
      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateAccount}
        account={selectedAccount}
        isSubmitting={isSubmittingAccount}
      />

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
    </div>
  )
} 