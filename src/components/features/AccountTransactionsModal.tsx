'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Filter, 
  Search,
  CreditCard
} from 'lucide-react'
import TransactionsList from './TransactionsList'
import { useTransactionsData } from '@/hooks/useTransactionsData'

interface MonthYearDate {
  month: number;
  year: number;
}

interface AccountTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
  accountName: string;
}

const AccountTransactionsModal = ({ 
  isOpen, 
  onClose, 
  accountId, 
  accountName 
}: AccountTransactionsModalProps) => {
  const [selectedDate, setSelectedDate] = useState<MonthYearDate>(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reset to current month/year whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setSelectedDate({ month: now.getMonth(), year: now.getFullYear() });
      setSearchQuery('');
    }
  }, [isOpen]);
  
  // Get transactions data from hook
  const { 
    transactions, 
    isLoading, 
    deleteTransaction, 
    refetchTransactions 
  } = useTransactionsData();
  
  // Handle refresh request
  const handleRefresh = async () => {
    if (refetchTransactions) {
      await refetchTransactions();
    }
  };
  
  // Handle transaction deletion
  const handleDeleteTransaction = async (id: number) => {
    if (deleteTransaction) {
      await deleteTransaction(id);
    }
  };
  
  // Previous month handler
  const handlePreviousMonth = () => {
    setSelectedDate(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };
  
  // Next month handler
  const handleNextMonth = () => {
    setSelectedDate(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };
  
  // Format month and year for display
  const formattedMonthYear = useMemo(() => {
    const date = new Date(selectedDate.year, selectedDate.month, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate]);
  
  // Filter transactions for the selected account and month
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      // First check if the transaction is for this account
      if (transaction.account !== accountName) {
        return false;
      }
      
      // Then check if it's in the selected month/year
      const transactionDate = new Date(transaction.date);
      const isInSelectedMonth = 
        transactionDate.getMonth() === selectedDate.month && 
        transactionDate.getFullYear() === selectedDate.year;
        
      // Apply search query if it exists
      const matchesSearch = searchQuery 
        ? transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true;
        
      return isInSelectedMonth && matchesSearch;
    });
  }, [transactions, accountName, selectedDate, searchQuery]);
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
            {accountName} Transactions
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Modal Controls */}
        <div className="px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePreviousMonth} 
              className="p-2 rounded-full hover:bg-gray-100"
              title="Previous Month"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-700">{formattedMonthYear}</span>
            </div>
            
            <button 
              onClick={handleNextMonth} 
              className="p-2 rounded-full hover:bg-gray-100"
              title="Next Month"
            >
              <ArrowRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="mr-2 h-4 w-4 text-gray-500" />
              Filter
            </button>
            
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4 text-gray-500" />
              Export
            </button>
          </div>
        </div>
        
        {/* Modal Content - Transaction List */}
        <div className="flex-1 overflow-auto">
          <TransactionsList
            detailed={true}
            transactions={filteredTransactions}
            recentTransactions={[]}
            isLoading={isLoading}
            onDeleteTransaction={handleDeleteTransaction}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  )
}

export default AccountTransactionsModal 