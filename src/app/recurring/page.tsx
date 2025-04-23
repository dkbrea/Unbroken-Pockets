'use client'

import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  List,
  CalendarDays,
  Wallet,
  Lock,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRecurringData, RecurringTransaction, RecurringViewMode } from '../../hooks/useRecurringData'
import { useDebtData } from '../../hooks/useDebtData'
import AddRecurringModal from '@/components/features/AddRecurringModal'
import EditRecurringModal from '@/components/features/EditRecurringModal'
import DeleteConfirmModal from '@/components/features/DeleteConfirmModal'
import RecurringCalendar from '@/components/features/RecurringCalendar'
import SyncRecurringButton from '@/components/SyncRecurringButton'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Recurring() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    viewType, 
    setViewType, 
    viewMode,
    setViewMode,
    displayTransactions,
    addRecurringTransaction,
    editRecurringTransaction,
    deleteRecurringTransaction,
    monthlyIncome,
    monthlyExpenses,
    monthlyDebt,
    netMonthly,
    calendarMonth,
    setCalendarMonth,
    calculateMonthIncome
  } = useRecurringData();
  
  // Get minimum payment from debt tracker
  const { totalMinPayment } = useDebtData();
  
  // Force refresh recurring data when the page loads
  useEffect(() => {
    const refreshData = async () => {
      try {
        console.log("Recurring page loaded, refreshing data...");
        // Access the supabase client
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("No authenticated user found");
          return;
        }
        
        // Fetch recurring transactions directly
        const { data, error } = await supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error fetching recurring transactions:", error);
        } else {
          console.log(`Found ${data?.length || 0} recurring transactions, including debt items:`, 
            data?.filter(tx => tx.debt_id).length || 0);
            
          // Debug debt transactions specifically
          const debtTransactions = data?.filter(tx => tx.debt_id);
          console.log("Debt transactions from database:", debtTransactions);
          
          // Check if there are debt_id values but they aren't being properly mapped to debtId
          if (debtTransactions && debtTransactions.length > 0) {
            console.log("First debt transaction:", debtTransactions[0]);
          }
        }
        
        // Directly check if debt payments are available
        const { data: debtPayments, error: debtError } = await supabase
          .from('recurring_transactions')
          .select('*')
          .not('debt_id', 'is', null);
          
        if (debtError) {
          console.error("Error fetching debt payments:", debtError);
        } else {
          console.log(`Found ${debtPayments?.length || 0} debt payments:`, debtPayments);
        }
      } catch (err) {
        console.error("Error refreshing data:", err);
      }
    };
    
    refreshData();
  }, []);
  
  // Handle edit button click
  const handleEditClick = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (transaction: RecurringTransaction) => {
    // Prevent deleting debt-related transactions
    if (transaction.debtId) {
      alert("This transaction is linked to a debt. Please delete the debt from the Debt Tracker page.");
      return;
    }
    
    setSelectedTransaction(transaction);
    setDeleteModalOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedTransaction) {
      await deleteRecurringTransaction(selectedTransaction.id);
    }
  };
  
  // Handle edit transaction
  const handleEditTransaction = async (id: number, updatedTransaction: Omit<RecurringTransaction, 'id'>) => {
    await editRecurringTransaction(id, updatedTransaction);
  };

  // Handle view mode toggle
  const toggleViewMode = (mode: RecurringViewMode) => {
    setViewMode(mode);
  };

  // Handle calendar month changes
  const handleMonthChange = (month: Date) => {
    setCalendarMonth(month);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Recurring Transactions</h1>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recurring..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
            <Filter className="mr-2 h-4 w-4 text-[#4A4A4A]" />
            Filter
          </button>
          
          <button 
            className="flex items-center bg-[#1F3A93] rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#172d70]"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Add Recurring
          </button>
          
          <SyncRecurringButton 
            onSync={() => {
              // Force refresh after syncing
              console.log("Syncing complete, refreshing data...");
              const refreshData = async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    console.error("No authenticated user found");
                    return;
                  }
                  
                  // Fetch recurring transactions directly
                  const { data, error } = await supabase
                    .from('recurring_transactions')
                    .select('*')
                    .eq('user_id', user.id);
                    
                  if (error) {
                    console.error("Error fetching recurring transactions:", error);
                  } else {
                    console.log(`Found ${data?.length || 0} recurring transactions after sync`);
                  }
                } catch (err) {
                  console.error("Error refreshing data after sync:", err);
                }
              };
              refreshData();
            }}
          />
          
          <button 
            className="flex items-center bg-green-600 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            onClick={() => {
              try {
                // Clear all cached recurring transaction data
                localStorage.removeItem('recurring_transactions');
                console.log("Cleared localStorage cache for recurring transactions");
                
                // Force a refresh from the server
                window.location.reload();
              } catch (err) {
                console.error("Error clearing cache:", err);
                alert("Error refreshing data. Please try again.");
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4 text-white" />
            Refresh Data
          </button>
          
          {process.env.NODE_ENV !== 'production' && (
            <button 
              className="ml-2 flex items-center bg-gray-200 rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-300"
              onClick={async () => {
                try {
                  // Test the database connection
                  console.log("Testing database connection...");
                  const { data: { user } } = await supabase.auth.getUser();
                  console.log("Current user:", user);
                  
                  if (!user) {
                    alert("No authenticated user found!");
                    return;
                  }
                  
                  // Try to fetch recurring transactions directly
                  const { data, error } = await supabase
                    .from('recurring_transactions')
                    .select('*')
                    .eq('user_id', user.id);
                  
                  console.log("Direct DB query result:", { data, error });
                  
                  if (error) {
                    alert(`Error fetching data: ${error.message}`);
                  } else {
                    alert(`Found ${data?.length || 0} recurring transactions for user ${user.id}`);
                  }
                } catch (err) {
                  console.error("Database test error:", err);
                  alert(`Database test error: ${err instanceof Error ? err.message : String(err)}`);
                }
              }}
            >
              Debug DB
            </button>
          )}
        </div>
      </div>
      
      {/* Note about debt payments */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <Wallet className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Debt Payments are Automatically Created</h3>
            <p className="text-sm text-blue-700 mt-1">
              Debt payments added in the <Link href="/debt" className="underline font-medium">Debt Tracker</Link> are automatically created here as recurring transactions. 
              You can adjust payment dates and amounts here, but use the Debt Tracker for major changes.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Troubleshooting:</strong> If a debt payment doesn't appear here, you can update the minimum payment amount in the Debt Tracker, which will create or update the recurring transaction.
            </p>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex border-b border-gray-200 mb-6">
        <div className="flex-1 flex">
          <button
            className={`py-3 px-4 border-b-2 ${
              viewType === 'upcoming'
                ? 'border-[#1F3A93] text-[#1F3A93] font-medium'
                : 'border-transparent text-gray-500 hover:text-[#1F3A93]'
            }`}
            onClick={() => setViewType('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`py-3 px-4 border-b-2 ${
              viewType === 'all'
                ? 'border-[#1F3A93] text-[#1F3A93] font-medium'
                : 'border-transparent text-gray-500 hover:text-[#1F3A93]'
            }`}
            onClick={() => setViewType('all')}
          >
            All Recurring
          </button>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center pr-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              className={`flex items-center px-3 py-1 rounded-md ${
                viewMode === 'list' 
                  ? 'bg-white text-[#1F3A93] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => toggleViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">List</span>
            </button>
            <button
              className={`flex items-center px-3 py-1 rounded-md ${
                viewMode === 'calendar' 
                  ? 'bg-white text-[#1F3A93] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => toggleViewMode('calendar')}
              aria-label="Calendar view"
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {viewType === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Monthly Income</h2>
            <div className="flex items-center">
              <ArrowUp className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-2xl font-bold text-gray-900">${monthlyIncome.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Monthly Expenses</h2>
            <div className="flex items-center">
              <ArrowDown className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-2xl font-bold text-gray-900">${monthlyExpenses.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Monthly Debt</h2>
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-2xl font-bold text-gray-900">${(totalMinPayment || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Net Monthly</h2>
            <p className="text-2xl font-bold text-gray-900">${(monthlyIncome - monthlyExpenses - (totalMinPayment || 0)).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        // List View - Recurring Transactions Table
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">
              {viewType === 'upcoming' ? 'Upcoming Recurring Transactions' : 'All Recurring Transactions'}
            </h2>
          </div>
          
          {displayTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600 mb-2">You don't have any recurring transactions yet.</p>
              <p className="text-gray-500 text-sm">Click the "Add Recurring" button above to create your first recurring transaction.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayTransactions.map((transaction) => (
                    <tr key={transaction.id} className={`hover:bg-gray-50 ${transaction.debtId ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.debtId ? (
                              <Wallet className="h-4 w-4 text-blue-600" />
                            ) : transaction.amount > 0 ? (
                              <ArrowUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{transaction.name}</span>
                              {transaction.debtId && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Debt Payment
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{transaction.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {transaction.frequency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(transaction.nextDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status === 'active' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Paused
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {transaction.debtId ? (
                          <>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => handleEditClick(transaction)}
                              aria-label={`Edit ${transaction.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <Link 
                              href="/debt" 
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            >
                              <span className="text-xs mr-1">Manage in</span>
                              <Wallet className="h-4 w-4" />
                            </Link>
                          </>
                        ) : (
                          <>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => handleEditClick(transaction)}
                              aria-label={`Edit ${transaction.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteClick(transaction)}
                              aria-label={`Delete ${transaction.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Calendar View
        <RecurringCalendar 
          transactions={displayTransactions}
          onTransactionClick={handleEditClick}
          currentMonth={calendarMonth}
          onMonthChange={handleMonthChange}
        />
      )}

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-[#F8F9FA] border border-gray-200 rounded-md">
        <div className="flex items-start">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-800">Pro Tip</h4>
            <p className="text-sm text-gray-600 mt-1">
              Set up recurring transactions for bills, subscriptions, and regular payments to better track your monthly expenses.
              {viewMode === 'calendar' && " The calendar view helps you visualize when payments are due throughout the month."}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Semi-monthly frequency:</strong> Use for transactions that occur twice a month (like paychecks on the 1st and 15th). 
              The calendar will display both occurrences, and income calculations will count it twice per month.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Debt Payments:</strong> Debt payments created in the Debt Tracker will appear here with a <Wallet className="h-3 w-3 inline mx-1 text-blue-600" /> icon.
              You can adjust payment amounts and dates here, but for major changes, use the Debt Tracker.
            </p>
          </div>
        </div>
      </div>

      {/* Add Recurring Modal */}
      <AddRecurringModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addRecurringTransaction}
      />
      
      {/* Edit Recurring Modal */}
      <EditRecurringModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdit={handleEditTransaction}
        transaction={selectedTransaction}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedTransaction?.name || ''}
        itemType="recurring transaction"
      />
    </div>
  )
} 