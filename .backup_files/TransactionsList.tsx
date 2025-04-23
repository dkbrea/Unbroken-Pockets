'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUp, ArrowDown, ChevronRight, CreditCard, Pencil, MoreHorizontal } from 'lucide-react'
import { useTransactionsData } from '@/hooks/useTransactionsData'
import EditTransactionModal from './EditTransactionModal'

type TransactionsListProps = {
  detailed?: boolean;
  limit?: number;
}

const TransactionsList = ({ detailed = false, limit }: TransactionsListProps) => {
  const { transactions, recentTransactions, isLoading } = useTransactionsData();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
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

  // Display loading state
  if (isLoading) {
    return (
      <div className="bg-[#F5F5F5] rounded-lg shadow-sm overflow-hidden w-full">
        <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-white border-b border-gray-200">
          <div className="col-span-5 text-sm font-medium text-[#4A4A4A]">Name</div>
          <div className="col-span-3 text-sm font-medium text-[#4A4A4A]">Category</div>
          <div className="col-span-2 text-sm font-medium text-[#4A4A4A]">Account</div>
          <div className="col-span-2 text-sm font-medium text-[#4A4A4A] text-right">Amount</div>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div 
              key={index}
              className="grid grid-cols-12 gap-4 py-4 px-4 border-b border-gray-200"
            >
              <div className="col-span-5 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 mr-3"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="col-span-3 flex items-center">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="col-span-2 flex items-center">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
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
      <div className="bg-[#F5F5F5] rounded-lg shadow-sm overflow-hidden w-full p-8 text-center">
        <div className="text-[#4A4A4A]">
          No transactions found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] rounded-lg shadow-sm overflow-hidden w-full">
      {/* Table Header */}
      <div className="grid grid-cols-13 gap-4 py-3 px-4 bg-white border-b border-gray-200">
        <div className="col-span-5 text-sm font-medium text-[#4A4A4A]">Name</div>
        <div className="col-span-3 text-sm font-medium text-[#4A4A4A]">Category</div>
        <div className="col-span-2 text-sm font-medium text-[#4A4A4A]">Account</div>
        <div className="col-span-2 text-sm font-medium text-[#4A4A4A] text-right">Amount</div>
        <div className="col-span-1 text-sm font-medium text-[#4A4A4A] text-center">Actions</div>
      </div>

      {/* Transactions List */}
      <div>
        {displayTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="grid grid-cols-13 gap-4 py-4 px-4 border-b border-gray-200 hover:bg-white transition-colors"
          >
            {/* Name & Date */}
            <div className="col-span-5 flex items-center">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                <Image 
                  src={transaction.logo || 'https://picsum.photos/32/32?random=1'} 
                  alt={transaction.name} 
                  width={32} 
                  height={32}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-[#4A4A4A] flex items-center">
                  {transaction.name}
                  {transaction.is_debt_transaction && (
                    <span className="ml-2">
                      <CreditCard className="h-3 w-3 text-purple-600" aria-label="Credit/Debt transaction" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#4A4A4A]/70">{formatDate(transaction.date)}</div>
              </div>
            </div>

            {/* Category */}
            <div className="col-span-3 flex items-center">
              <span className="text-sm text-[#4A4A4A]">{transaction.category}</span>
            </div>

            {/* Account */}
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-[#4A4A4A]">{transaction.account}</span>
            </div>

            {/* Amount */}
            <div className="col-span-2 flex items-center justify-end">
              <div className={`flex items-center ${
                transaction.amount > 0 ? 'text-green-600' : 'text-[#4A4A4A]'
              }`}>
                {transaction.amount > 0 && <ArrowDown className="h-3 w-3 mr-1" />}
                <span className="text-sm font-medium">
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="col-span-1 flex items-center justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(transaction);
                }}
                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                title="Edit Transaction"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {!detailed && (
        <div className="py-3 px-4 border-t border-gray-200 bg-white">
          <button className="text-sm text-[#1F3A93] flex items-center hover:underline mx-auto">
            View all transactions <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
      
      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        transaction={selectedTransaction}
      />
    </div>
  )
}

export default TransactionsList 