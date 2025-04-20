'use client'

import { useState } from 'react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('Last 30 days')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'all' | 'debit_only'>('all')
  
  // Get transaction data
  const { transactions, filteredTransactions, setFilter } = useTransactionsData()
  
  // Get accounts data
  const { accounts } = useAccountsData()
  
  // Count credit/debit transactions
  const debitAccountsCount = accounts.filter(
    acc => acc.type === 'credit' || acc.type === 'loan'
  ).length
  
  const debitTransactionsCount = transactions.filter(
    t => t.is_debt_transaction
  ).length

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Transactions</h1>
        
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
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Debt Payment Widget */}
      <DebtPaymentWidget />

      {debitAccountsCount > 0 && (
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
        <TransactionsList detailed={true} />
      </div>
      
      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  )
} 