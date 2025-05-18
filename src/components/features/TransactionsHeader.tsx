'use client';

import { useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Calendar,
  CreditCard
} from 'lucide-react';
import { DateRangeOption, TransactionFilter } from '@/types/transactions';
import DateRangeSelector from '@/components/ui/DateRangeSelector';

interface TransactionsHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: DateRangeOption;
  onDateFilterChange: (option: DateRangeOption) => void;
  hasAccountFilter: boolean;
  onClearAccountFilter?: () => void;
  debitAccountsCount: number;
  debitTransactionsCount: number;
  viewMode: 'all' | 'debit_only';
  onViewModeChange: (mode: 'all' | 'debit_only') => void;
  onExportClick: () => void;
  onAddTransactionClick: () => void;
  className?: string;
}

export default function TransactionsHeader({
  title,
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  hasAccountFilter,
  onClearAccountFilter,
  debitAccountsCount,
  debitTransactionsCount,
  viewMode,
  onViewModeChange,
  onExportClick,
  onAddTransactionClick,
  className = ''
}: TransactionsHeaderProps) {
  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  // Handle toggle view mode
  const handleToggleViewMode = useCallback(() => {
    onViewModeChange(viewMode === 'all' ? 'debit_only' : 'all');
  }, [viewMode, onViewModeChange]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">
          {title}
        </h1>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search transactions"
            />
          </div>
          
          <div className="flex items-center flex-wrap gap-2">
            {/* Date Filter */}
            <DateRangeSelector
              currentOption={dateFilter}
              onOptionChange={onDateFilterChange}
            />
            
            {/* Filters Button */}
            <button 
              className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#1F3A93]"
              aria-label="Filter options"
            >
              <Filter className="mr-2 h-4 w-4 text-[#4A4A4A]" aria-hidden="true" />
              Filters
              {hasAccountFilter && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5">
                  1
                </span>
              )}
            </button>
            
            {/* Debit Only Toggle */}
            {debitAccountsCount > 0 && (
              <button 
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  viewMode === 'debit_only' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-white border border-gray-300 text-[#4A4A4A]'
                } hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#1F3A93]`}
                onClick={handleToggleViewMode}
                aria-pressed={viewMode === 'debit_only'}
                aria-label={viewMode === 'all' ? 'Show debit transactions only' : 'Show all transactions'}
              >
                <CreditCard 
                  className={`mr-2 h-4 w-4 ${viewMode === 'debit_only' ? 'text-purple-700' : 'text-[#4A4A4A]'}`} 
                  aria-hidden="true"
                />
                {viewMode === 'all' ? 'Show Debit Only' : 'All Transactions'}
                {debitTransactionsCount > 0 && viewMode === 'all' && (
                  <span className="ml-2 bg-purple-100 text-purple-700 text-xs rounded-full px-2 py-0.5">
                    {debitTransactionsCount}
                  </span>
                )}
              </button>
            )}
            
            {/* Export Button */}
            <button 
              className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#1F3A93]"
              onClick={onExportClick}
              aria-label="Export transactions"
            >
              <Download className="mr-2 h-4 w-4 text-[#4A4A4A]" aria-hidden="true" />
              Export
            </button>
            
            {/* Add Transaction Button */}
            <button 
              className="flex items-center bg-[#1F3A93] rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#172d70] focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:ring-offset-2"
              onClick={onAddTransactionClick}
              aria-label="Add new transaction"
            >
              <Plus className="mr-2 h-4 w-4 text-white" aria-hidden="true" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Account Filter Alert */}
      {hasAccountFilter && onClearAccountFilter && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4" role="alert">
          <div className="flex justify-between items-center">
            <p className="text-blue-700">
              Showing transactions for account: <span className="font-semibold">{title.replace('Transactions: ', '')}</span>
            </p>
            <button 
              onClick={onClearAccountFilter}
              className="text-blue-700 hover:text-blue-900 font-medium focus:outline-none focus:underline"
              aria-label="Clear account filter"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 