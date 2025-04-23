'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ArrowUpDown,
  Calendar,
  CreditCard
} from 'lucide-react'

// Components
import TransactionsList from '@/components/features/TransactionsList'
import AddTransactionModal from '@/components/features/AddTransactionModal'
import EditTransactionModal from '@/components/features/EditTransactionModal'
import DebtPaymentWidget from '@/components/features/DebtPaymentWidget'
import { useTransactionsData } from '@/hooks/useTransactionsData'
import { useAccountsData } from '@/hooks/useAccountsData'

export default function Transactions() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('Last 30 days')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'all' | 'debit_only'>('all')
  const [accountFilter, setAccountFilter] = useState<string | null>(null)
  const [accountName, setAccountName] = useState<string | null>(null)
  
  // Add state for tracking the selected account ID for new transactions
  const [selectedAccountForNewTransaction, setSelectedAccountForNewTransaction] = useState<string | null>(null)
  
  // Get transaction data
  const { 
    transactions, 
    recentTransactions, 
    filteredTransactions, 
    setFilter, 
    refetchTransactions,
    deleteTransaction,
    isLoading
  } = useTransactionsData()
  
  // Get accounts data
  const { accounts } = useAccountsData()
  
  // Apply filters from URL query parameters
  useEffect(() => {
    if (!searchParams) return
    
    const accountId = searchParams.get('accountId')
    const accountNameParam = searchParams.get('accountName')
    
    if (accountId) {
      console.log(`Filtering transactions for account ID: ${accountId}`)
      setAccountFilter(accountId)
      
      // Store the account ID for new transactions
      setSelectedAccountForNewTransaction(accountId)
      
      // Find the account in our accounts data by ID
      const matchingAccount = accounts.find(acc => acc.id?.toString() === accountId)
      
      // If we found a matching account by ID, use its name
      if (matchingAccount) {
        setAccountName(matchingAccount.name)
      }
      // Otherwise use the name from URL parameter if available
      else if (accountNameParam) {
        setAccountName(decodeURIComponent(accountNameParam))
      }
      
      // Update the transactions filter to only show this account's transactions
      if (matchingAccount) {
        setFilter({ accounts: [matchingAccount.name] })
      }
    }
  }, [searchParams, accounts, setFilter])
  
  // Count credit/debit transactions
  const debitAccountsCount = accounts.filter(
    acc => acc.type === 'credit' || acc.type === 'loan'
  ).length
  
  const debitTransactionsCount = transactions.filter(
    t => t.is_debt_transaction
  ).length

  // Handle transaction added callback
  const handleTransactionAdded = useCallback(async (newTransaction: any) => {
    console.log('New transaction added, refreshing list:', newTransaction);
    
    // Force a refresh of the transaction data
    if (refetchTransactions) {
      await refetchTransactions();
    }
  }, [refetchTransactions]);

  // Handle transaction deletion
  const handleDeleteTransaction = useCallback(async (id: number) => {
    await deleteTransaction(id);
  }, [deleteTransaction]);

  // Handle refresh request
  const handleRefresh = useCallback(async () => {
    if (refetchTransactions) {
      await refetchTransactions();
    }
  }, [refetchTransactions]);

  // Determine which transactions to display based on view mode
  const displayTransactions = viewMode === 'debit_only'
    ? transactions.filter(t => t.is_debt_transaction)
    : transactions;

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">
          {accountName ? `Transactions: ${accountName}` : 'Transactions'}
        </h1>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setFilter({ searchQuery: e.target.value })
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
              <Calendar className="mr-2 h-4 w-4 text-[#4A4A4A]" />
              {dateFilter}
            </button>
            
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
              <Filter className="mr-2 h-4 w-4 text-[#4A4A4A]" />
              Filters
              {accountFilter && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5">
                  1
                </span>
              )}
            </button>
            
            {debitAccountsCount > 0 && (
              <button 
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  viewMode === 'debit_only' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-white border border-gray-300 text-[#4A4A4A]'
                } hover:bg-[#F5F5F5]`}
                onClick={() => setViewMode(viewMode === 'all' ? 'debit_only' : 'all')}
              >
                <CreditCard className={`mr-2 h-4 w-4 ${viewMode === 'debit_only' ? 'text-purple-700' : 'text-[#4A4A4A]'}`} />
                {viewMode === 'all' ? 'Show Debit Only' : 'All Transactions'}
                {debitTransactionsCount > 0 && viewMode === 'all' && (
                  <span className="ml-2 bg-purple-100 text-purple-700 text-xs rounded-full px-2 py-0.5">
                    {debitTransactionsCount}
                  </span>
                )}
              </button>
            )}
            
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
              <Download className="mr-2 h-4 w-4 text-[#4A4A4A]" />
              Export
            </button>
            
            <button 
              className="flex items-center bg-[#1F3A93] rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#172d70]"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-2 h-4 w-4 text-white" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Account Filter Alert */}
      {accountFilter && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-blue-700">
              Showing transactions for account: <span className="font-semibold">{accountName}</span>
            </p>
            <button 
              onClick={() => {
                setAccountFilter(null)
                setAccountName(null)
                setFilter({ accounts: [] })
                window.history.pushState({}, '', '/transactions')
              }}
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Debt Payment Widget */}
      <DebtPaymentWidget />

      {debitAccountsCount > 0 && !accountFilter && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-purple-800 flex items-center">
            <CreditCard className="mr-2 h-5 w-5" /> 
            Credit Card & Debt Accounts
          </h2>
          <p className="text-purple-700 mt-1">
            Transactions made using credit cards or other debt accounts are indicated with a <CreditCard className="inline h-3 w-3 mx-1" /> icon.
            These expenses don't reduce your budget balance immediately, but should be paid off later to stay on budget.
          </p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded text-[#1F3A93] focus:ring-[#1F3A93]" />
            <span className="text-sm font-medium text-gray-500">Select all</span>
          </div>
          
          <div className="flex items-center">
            <button className="flex items-center text-sm font-medium text-gray-500 hover:text-[#1F3A93]">
              <ArrowUpDown className="mr-1 h-4 w-4" />
              Sort
            </button>
          </div>
        </div>
        
        {/* Transactions List */}
        <TransactionsList 
          detailed={true}
          transactions={displayTransactions}
          recentTransactions={recentTransactions}
          isLoading={isLoading}
          onDeleteTransaction={handleDeleteTransaction}
          onRefresh={handleRefresh}
        />
      </div>
      
      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal 
          isOpen={true} 
          onClose={() => setShowAddModal(false)}
          onTransactionAdded={handleTransactionAdded}
          preselectedAccountId={selectedAccountForNewTransaction}
        />
      )}
    </div>
  )
} 