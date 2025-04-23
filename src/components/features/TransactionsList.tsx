'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowUp, ArrowDown, ChevronRight, CreditCard, Pencil, Trash2, AlertCircle } from 'lucide-react'
import EditTransactionModal from './EditTransactionModal'

type TransactionsListProps = {
  detailed?: boolean;
  limit?: number;
  transactions: any[]; // Get this from parent
  recentTransactions: any[]; // Get this from parent
  isLoading: boolean;  // Get this from parent
  onDeleteTransaction?: (id: number) => Promise<void>; // Pass this up to parent
  onRefresh?: () => Promise<void>;  // Use parent's refresh function
}

const TransactionsList = ({ 
  detailed = false, 
  limit,
  transactions = [],
  recentTransactions = [],
  isLoading = false,
  onDeleteTransaction,
  onRefresh
}: TransactionsListProps) => {
  const [listKey, setListKey] = useState(Date.now());
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  
  // Add this effect to refresh the key when transactions change
  useEffect(() => {
    setListKey(Date.now());
  }, [transactions]);
  
  // Add this console log to debug when transactions change
  useEffect(() => {
    console.log('TransactionsList - transactions updated:', transactions.length);
  }, [transactions]);
  
  // Use the Supabase data or fallback to empty array if not loaded yet
  // If limit is provided, take that many transactions, otherwise use all recent transactions
  const displayTransactions = limit 
    ? transactions.slice(0, limit) 
    : (detailed ? transactions : recentTransactions || []);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
  }

  // Handle edit button click
  const handleEditClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (transaction: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (transactionToDelete?.id && onDeleteTransaction) {
      try {
        await onDeleteTransaction(transactionToDelete.id);
        setShowDeleteModal(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  // Function to close modal and reset selected transaction
  const handleCloseModal = () => {
    setShowEditModal(false);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setSelectedTransaction(null);
    }, 300);
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden w-full">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
          <div className="col-span-4">NAME</div>
          <div className="col-span-3">CATEGORY</div>
          <div className="col-span-3">ACCOUNT</div>
          <div className="col-span-2 text-right">AMOUNT</div>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div 
              key={index}
              className="py-5 px-6 border-b border-gray-100 grid grid-cols-12 gap-4"
            >
              <div className="col-span-4 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 mr-4"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="col-span-3 flex items-center">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="col-span-3 flex items-center">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <div className="h-3 bg-gray-200 rounded w-14"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Display empty state
  if (displayTransactions.length === 0) {
    return (
      <div className="bg-white overflow-hidden w-full">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
          <div className="col-span-4">NAME</div>
          <div className="col-span-3">CATEGORY</div>
          <div className="col-span-3">ACCOUNT</div>
          <div className="col-span-2 text-right">AMOUNT</div>
        </div>
        <div className="py-12 text-center">
          <p className="text-gray-600 mb-2">No transactions found</p>
          <p className="text-gray-500 text-sm">Add a transaction to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden w-full" key={listKey}>
      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
        <div className="col-span-4">NAME</div>
        <div className="col-span-3">CATEGORY</div>
        <div className="col-span-3">ACCOUNT</div>
        <div className="col-span-2 text-right">AMOUNT</div>
      </div>

      {/* Transactions List */}
      <div>
        {displayTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="py-5 px-6 border-b border-gray-100 grid grid-cols-12 gap-4 hover:bg-gray-50 transition-colors"
          >
            {/* Name & Date */}
            <div className="col-span-4 flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                (transaction.transaction_type === 'Income' || transaction.amount > 0) ? 'bg-green-100' : 'bg-red-100'
              } mr-4 flex-shrink-0`}>
                {(transaction.transaction_type === 'Income' || transaction.amount > 0) ? (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {transaction.name}
                  {transaction.is_debt_transaction && (
                    <span className="ml-2">
                      <CreditCard className="h-3 w-3 text-purple-600 inline" aria-label="Credit/Debt transaction" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(transaction.date)}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="col-span-3 flex items-center">
              <span className="text-sm text-gray-500">{transaction.category}</span>
            </div>

            {/* Account */}
            <div className="col-span-3 flex items-center">
              <span className="text-sm text-gray-500">{transaction.account}</span>
            </div>

            {/* Amount */}
            <div className="col-span-1 flex items-center justify-end">
              <span className={`text-sm font-medium ${
                (transaction.transaction_type === 'Income' || transaction.amount > 0) ? 'text-green-600' : 'text-red-600'
              }`}>
                ${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(transaction);
                }}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Edit Transaction"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => handleDeleteClick(transaction, e)}
                className="p-1 ml-1 text-red-600 hover:text-red-800"
                title="Delete Transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link - Only show when not in detailed view */}
      {!detailed && (
        <div className="py-3 px-6 border-t border-gray-200 bg-white">
          <button className="text-sm text-[#1F3A93] flex items-center hover:underline mx-auto">
            View all transactions <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
      
      {/* Edit Transaction Modal - Only render when showEditModal is true */}
      {showEditModal && selectedTransaction && (
        <EditTransactionModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          transaction={selectedTransaction}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
            </div>
            
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete the transaction "{transactionToDelete.name}"? 
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsList 