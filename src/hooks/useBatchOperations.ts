'use client';

import { useState, useCallback, useMemo } from 'react';
import { Transaction, BatchOperationOptions } from '@/types/transactions';

/**
 * Custom hook for batch operations on transactions
 */
export function useBatchOperations(
  allTransactions: Transaction[],
  onDeleteTransaction?: (id: number) => Promise<void>,
  onExport?: (transactions: Transaction[]) => void
) {
  const [batchOptions, setBatchOptions] = useState<BatchOperationOptions>({
    selectedIds: [],
    allSelected: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Selected transactions for batch operations
  const selectedTransactions = useMemo(() => {
    return allTransactions.filter(t => batchOptions.selectedIds.includes(t.id || 0));
  }, [allTransactions, batchOptions.selectedIds]);
  
  // Handler for selecting/deselecting transactions
  const handleSelectionChange = useCallback((options: BatchOperationOptions) => {
    setBatchOptions(options);
  }, []);
  
  // Handler for selecting all transactions
  const selectAll = useCallback(() => {
    setBatchOptions({
      selectedIds: allTransactions.map(t => t.id || 0),
      allSelected: true
    });
  }, [allTransactions]);
  
  // Handler for deselecting all transactions
  const deselectAll = useCallback(() => {
    setBatchOptions({
      selectedIds: [],
      allSelected: false
    });
  }, []);
  
  // Handler for toggling selection of a specific transaction
  const toggleSelection = useCallback((transaction: Transaction) => {
    if (!transaction.id) return;
    
    setBatchOptions(prev => {
      const isSelected = prev.selectedIds.includes(transaction.id || 0);
      
      if (isSelected) {
        // Deselect this transaction
        return {
          ...prev,
          selectedIds: prev.selectedIds.filter(id => id !== transaction.id),
          allSelected: false
        };
      } else {
        // Select this transaction
        return {
          ...prev,
          selectedIds: [...prev.selectedIds, transaction.id]
        };
      }
    });
  }, []);
  
  // Handler for batch delete operations
  const batchDelete = useCallback(async () => {
    if (!onDeleteTransaction) return;
    
    setError(null);
    try {
      // Process deletes sequentially to avoid race conditions
      for (const id of batchOptions.selectedIds) {
        await onDeleteTransaction(id);
      }
      
      // Reset selection after successful operation
      setBatchOptions({
        selectedIds: [],
        allSelected: false
      });
    } catch (err) {
      setError('Failed to delete selected transactions');
      throw err;
    }
  }, [batchOptions.selectedIds, onDeleteTransaction]);
  
  // Handler for batch export operations
  const batchExport = useCallback(() => {
    if (!onExport || selectedTransactions.length === 0) return;
    
    try {
      onExport(selectedTransactions);
    } catch (err) {
      setError('Failed to export selected transactions');
    }
  }, [selectedTransactions, onExport]);
  
  return {
    batchOptions,
    selectedTransactions,
    error,
    handleSelectionChange,
    selectAll,
    deselectAll,
    toggleSelection,
    batchDelete,
    batchExport
  };
} 