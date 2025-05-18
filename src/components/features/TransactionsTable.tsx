'use client';

import { useState, useCallback, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import TransactionsList from './TransactionsList';
import BatchOperations from './BatchOperations';
import { Transaction, BatchOperationOptions } from '@/types/transactions';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface TransactionsTableProps {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  isLoading: boolean;
  onDeleteTransaction?: (id: number) => Promise<void>;
  onBatchDeleteTransactions?: (ids: number[]) => Promise<void>;
  onBatchExport?: (transactions: Transaction[]) => void;
  onBatchCategorize?: (ids: number[], category: string) => Promise<void>;
  onBatchTag?: (ids: number[], tag: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  detailed?: boolean;
}

export default function TransactionsTable({
  transactions,
  recentTransactions,
  isLoading,
  onDeleteTransaction,
  onBatchDeleteTransactions,
  onBatchExport,
  onBatchCategorize,
  onBatchTag,
  onRefresh,
  detailed = true
}: TransactionsTableProps) {
  // Debug logging for transactions
  console.log("TransactionsTable received:", { 
    transactionsCount: transactions.length,
    recentTransactionsCount: recentTransactions.length,
    isLoading,
    firstTransaction: transactions[0] || "No transactions" 
  });
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  
  // State for batch operations
  const [batchOptions, setBatchOptions] = useState<BatchOperationOptions>({
    selectedIds: [],
    allSelected: false
  });
  
  // State for sorting
  const [sortBy, setSortBy] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Handle batch selection change
  const handleBatchOptionsChange = useCallback((options: BatchOperationOptions) => {
    setBatchOptions(options);
  }, []);
  
  // Handle batch delete
  const handleBatchDelete = useCallback(async (ids: number[]) => {
    if (!onBatchDeleteTransactions) return;
    
    try {
      setError(null);
      await onBatchDeleteTransactions(ids);
      
      // Reset selection after successful batch operation
      setBatchOptions({
        selectedIds: [],
        allSelected: false
      });
    } catch (err) {
      setError('Failed to delete the selected transactions. Please try again.');
    }
  }, [onBatchDeleteTransactions]);
  
  // Handle batch export
  const handleBatchExport = useCallback((selectedTransactions: Transaction[]) => {
    if (!onBatchExport) return;
    
    try {
      onBatchExport(selectedTransactions);
    } catch (err) {
      setError('Failed to export the selected transactions. Please try again.');
    }
  }, [onBatchExport]);
  
  // Handle sort toggle
  const handleSortToggle = useCallback((column: keyof Transaction) => {
    setSortBy(prev => {
      if (prev === column) {
        // Toggle direction if same column
        setSortDirection(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
        return column;
      } else {
        // Default to descending for new column
        setSortDirection('desc');
        return column;
      }
    });
  }, []);
  
  // Selected transactions for batch operations
  const selectedTransactions = useMemo(() => {
    // Check if batchOptions and selectedIds exist before filtering
    if (!batchOptions?.selectedIds || !Array.isArray(batchOptions.selectedIds)) {
      return [];
    }
    return transactions.filter(t => t.id != null && batchOptions.selectedIds.includes(t.id));
  }, [transactions, batchOptions?.selectedIds]);
  
  // Determine if batch mode is active
  const batchMode = useMemo(() => 
    !!(onBatchDeleteTransactions || onBatchExport || onBatchCategorize || onBatchTag),
    [onBatchDeleteTransactions, onBatchExport, onBatchCategorize, onBatchTag]
  );

  // Create an adapter for onBatchOperationsChange to convert from count to BatchOperationOptions
  const handleBatchSelectionCountChange = useCallback((count: number) => {
    // We don't actually use the count here, since we already have the full BatchOperationOptions
    // This is just an adapter function to match the expected prop type
    console.log(`Selection count changed: ${count}`);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => setError(null)} 
          className="m-4" 
          autoHideAfter={5000}
        />
      )}
      
      {/* Table Header with sorting and batch operations */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {batchMode ? (
          <BatchOperations
            selectedTransactions={selectedTransactions}
            allTransactions={transactions}
            batchOptions={batchOptions}
            onSelectionChange={handleBatchOptionsChange}
            onBatchDelete={handleBatchDelete}
            onBatchExport={handleBatchExport}
            onBatchCategorize={onBatchCategorize}
            onBatchTag={onBatchTag}
          />
        ) : (
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="rounded text-[#1F3A93] focus:ring-[#1F3A93]"
              disabled
              aria-label="Select all transactions"
            />
            <span className="text-sm font-medium text-gray-500">Select all</span>
          </div>
        )}
        
        <div className="flex items-center">
          <button 
            className="flex items-center text-sm font-medium text-gray-500 hover:text-[#1F3A93] focus:outline-none focus:text-[#1F3A93]"
            onClick={() => handleSortToggle('date')}
            aria-label={`Sort by date, currently sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
          >
            <ArrowUpDown className="mr-1 h-4 w-4" aria-hidden="true" />
            Sort
          </button>
        </div>
      </div>
      
      {/* Transactions List */}
      <TransactionsList 
        transactions={transactions}
        isLoading={isLoading}
        showCategory={true}
        showAccount={true}
        onDeleteSuccess={onDeleteTransaction ? () => console.log("Transaction deleted") : undefined}
        onRefresh={onRefresh}
        batchMode={batchMode}
        onBatchOperationsChange={batchMode ? handleBatchSelectionCountChange : undefined}
        onError={(message) => setError(message)}
        emptyText="No transactions found"
      />
    </div>
  );
} 