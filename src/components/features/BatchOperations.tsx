'use client';

import { useState } from 'react';
import { Trash2, Download, Tag, CreditCard, CheckSquare, Square, ArrowUpDown } from 'lucide-react';
import { Transaction, BatchOperationOptions } from '@/types/transactions';

interface BatchOperationsProps {
  selectedTransactions: Transaction[];
  allTransactions: Transaction[];
  batchOptions: BatchOperationOptions;
  onSelectionChange: (options: BatchOperationOptions) => void;
  onBatchDelete?: (ids: number[]) => Promise<void>;
  onBatchExport?: (transactions: Transaction[]) => void;
  onBatchCategorize?: (ids: number[], category: string) => Promise<void>;
  onBatchTag?: (ids: number[], tag: string) => Promise<void>;
  className?: string;
}

export default function BatchOperations({
  selectedTransactions,
  allTransactions,
  batchOptions,
  onSelectionChange,
  onBatchDelete,
  onBatchExport,
  onBatchCategorize,
  onBatchTag,
  className = '',
}: BatchOperationsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const selectedCount = selectedTransactions.length;
  const allSelected = batchOptions.allSelected;
  const hasSelected = selectedCount > 0;
  
  // Toggle select all
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      onSelectionChange({
        selectedIds: [],
        allSelected: false
      });
    } else {
      // Select all
      onSelectionChange({
        selectedIds: allTransactions.map(t => t.id),
        allSelected: true
      });
    }
  };
  
  // Get unique categories from all transactions
  const uniqueCategories = Array.from(new Set(allTransactions.map(t => t.category)))
    .filter(Boolean)
    .sort();
    
  // Get unique tags from all transactions
  const uniqueTags = Array.from(
    new Set(
      allTransactions
        .filter(t => t.tags && t.tags.length > 0)
        .flatMap(t => t.tags || [])
    )
  ).sort();
  
  return (
    <div className={`flex items-center space-x-2 p-2 ${className}`}>
      <button
        className="flex items-center focus:outline-none"
        onClick={handleSelectAll}
        aria-label={allSelected ? "Deselect all transactions" : "Select all transactions"}
      >
        {allSelected ? (
          <CheckSquare className="h-5 w-5 text-[#1F3A93]" />
        ) : (
          <Square className="h-5 w-5 text-gray-400" />
        )}
        <span className="ml-2 text-sm text-gray-700">
          {allSelected ? 'Deselect all' : 'Select all'}
        </span>
      </button>
      
      {hasSelected && (
        <>
          <div className="text-sm text-gray-500 mx-2 border-l border-gray-300 pl-2">
            {selectedCount} selected
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Delete selected */}
            {onBatchDelete && (
              <button
                className="flex items-center rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete selected transactions"
              >
                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                <span>Delete</span>
              </button>
            )}
            
            {/* Export selected */}
            {onBatchExport && (
              <button
                className="flex items-center rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => onBatchExport(selectedTransactions)}
                aria-label="Export selected transactions"
              >
                <Download className="h-4 w-4 mr-1 text-[#1F3A93]" />
                <span>Export</span>
              </button>
            )}
            
            {/* Categorize selected */}
            {onBatchCategorize && uniqueCategories.length > 0 && (
              <div className="relative">
                <button
                  className="flex items-center rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  aria-label="Categorize selected transactions"
                  aria-expanded={showCategoryDropdown}
                  aria-haspopup="listbox"
                >
                  <CreditCard className="h-4 w-4 mr-1 text-[#1F3A93]" />
                  <span>Categorize</span>
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {uniqueCategories.map(category => (
                      <button
                        key={category}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          onBatchCategorize(batchOptions.selectedIds, category);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Add tag to selected */}
            {onBatchTag && (
              <div className="relative">
                <button
                  className="flex items-center rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  aria-label="Tag selected transactions"
                  aria-expanded={showTagDropdown}
                  aria-haspopup="listbox"
                >
                  <Tag className="h-4 w-4 mr-1 text-[#1F3A93]" />
                  <span>Add Tag</span>
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
                
                {showTagDropdown && (
                  <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {uniqueTags.length > 0 ? (
                      uniqueTags.map(tag => (
                        <button
                          key={tag}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            onBatchTag(batchOptions.selectedIds, tag);
                            setShowTagDropdown(false);
                          }}
                        >
                          {tag}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No tags available</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Selected Transactions
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {selectedCount} transactions? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    if (onBatchDelete) {
                      onBatchDelete(batchOptions.selectedIds);
                    }
                    setShowDeleteConfirm(false);
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 