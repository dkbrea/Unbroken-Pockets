'use client'

import { useState, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDown, 
  Edit,
  Trash2,
  BarChart4,
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
  HelpCircle,
  AlertCircle
} from 'lucide-react'
import AddDebtModal from '@/components/features/AddDebtModal'
import DeleteConfirmModal from '@/components/features/DeleteConfirmModal'
import EditDebtModal from '@/components/features/EditDebtModal'
import { useDebtData, Debt } from '@/hooks/useDebtData'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DebtPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'snowball' | 'avalanche'>('snowball')
  const [extraPayment, setExtraPayment] = useState<number>(0)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  
  // Use the debt hook
  const { 
    debts = [],
    totalDebt = 0,
    totalMinPayment = 0,
    addDebt,
    updateDebt,
    deleteDebt,
    isLoading,
    error
  } = useDebtData()
  
  // Filter debts based on search query
  const filteredDebts = useMemo(() => {
    return debts.filter(debt => 
      debt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debt.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [debts, searchQuery])
  
  // Sort debts based on payment method
  const sortedDebts = useMemo(() => {
    if (paymentMethod === 'snowball') {
      // Snowball: Sort by balance (smallest to largest)
      return [...filteredDebts].sort((a, b) => a.balance - b.balance)
    } else {
      // Avalanche: Sort by interest rate (highest to lowest)
      return [...filteredDebts].sort((a, b) => b.interestRate - a.interestRate)
    }
  }, [filteredDebts, paymentMethod])
  
  // Calculate payment plan
  const paymentPlan = useMemo(() => {
    if (sortedDebts.length === 0) return { monthlyPlan: [], monthsUntilDebtFree: 0 }
    
    // Deep copy the debts to avoid mutating the original
    const debtsCopy = sortedDebts.map(debt => ({...debt}))
    
    // Define payment type
    type DebtPayment = {
      debtId: number;
      debtName: string;
      minimumPayment: number;
      extraPayment: number;
      interestPaid: number;
      principalPaid: number;
      remainingBalance: number;
    };
    
    // Define monthly plan type
    type MonthlyPlan = {
      month: number;
      payments: DebtPayment[];
      totalPaid: number;
      remainingBalance: number;
      interestPaid: number;
      principalPaid: number;
    };
    
    const monthlyPlan: MonthlyPlan[] = [];
    let totalMonths = 0
    let monthsUntilDebtFree = 0
    
    // Calculate minimum payment for all debts
    const minPayments = debtsCopy.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    
    // Calculate total payment (min payments + extra payment)
    const totalPayment = minPayments + extraPayment
    
    // Keep track of which debts are paid off
    const remainingDebts = [...debtsCopy]
    
    // Calculate payment plan month by month until all debts are paid off
    while (remainingDebts.length > 0 && totalMonths < 300) { // Limit to 25 years (300 months)
      totalMonths++
      
      const thisMonth: MonthlyPlan = {
        month: totalMonths,
        payments: [] as DebtPayment[],
        totalPaid: 0,
        remainingBalance: 0,
        interestPaid: 0,
        principalPaid: 0
      }
      
      // Make minimum payments on all debts
      for (let i = 0; i < remainingDebts.length; i++) {
        const debt = remainingDebts[i]
        const interestAmount = (debt.interestRate / 100 / 12) * debt.balance
        
        // Minimum payment or remaining balance, whichever is smaller
        const minPayment = Math.min(debt.minimumPayment, debt.balance + interestAmount)
        
        // Calculate principal payment (minimum payment minus interest)
        const principalPayment = minPayment - interestAmount
        
        // If this is the debt being targeted (first in the sorted list), add extra payment
        let extraAmount = 0
        if (i === 0) {
          // Calculate remaining payment capacity after minimum payments
          const availableExtra = totalPayment - minPayments
          extraAmount = Math.min(availableExtra, debt.balance)
        }
        
        // Update debt balance
        debt.balance = Math.max(0, debt.balance - principalPayment - extraAmount)
        
        // Add payment details to this month's data
        thisMonth.payments.push({
          debtId: debt.id,
          debtName: debt.name,
          minimumPayment: minPayment,
          extraPayment: extraAmount,
          interestPaid: interestAmount,
          principalPaid: principalPayment + extraAmount,
          remainingBalance: debt.balance
        })
        
        // Update month totals
        thisMonth.totalPaid += (minPayment + extraAmount)
        thisMonth.interestPaid += interestAmount
        thisMonth.principalPaid += (principalPayment + extraAmount)
      }
      
      // Remove any debts that are now paid off
      remainingDebts.forEach((debt, index) => {
        if (debt.balance <= 0.01) { // Allow for small rounding errors
          remainingDebts.splice(index, 1)
        }
      })
      
      // Calculate total remaining balance
      thisMonth.remainingBalance = remainingDebts.reduce((sum, debt) => sum + debt.balance, 0)
      
      // Add this month to the payment plan
      monthlyPlan.push(thisMonth)
      
      // Check if all debts are paid off
      if (remainingDebts.length === 0) {
        monthsUntilDebtFree = totalMonths
      }
    }
    
    return {
      monthlyPlan,
      monthsUntilDebtFree
    }
  }, [sortedDebts, extraPayment])
  
  // Handle debt editing
  const handleEditClick = (debt: Debt) => {
    setSelectedDebt(debt)
    setEditModalOpen(true)
  }
  
  // Handle debt deletion
  const handleDeleteClick = (debt: Debt) => {
    setSelectedDebt(debt)
    setDeleteModalOpen(true)
  }
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedDebt) {
      deleteDebt(selectedDebt.id)
      setDeleteModalOpen(false)
    }
  }

  // Function to handle manual sync to Supabase
  const handleSyncToSupabase = async () => {
    setSyncStatus('syncing');
    try {
      // Get the authenticated user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      let userId = 'test-user-id'; // Default fallback for development
      
      if (authError) {
        console.error('Authentication error:', authError);
        console.log('Using fallback test user ID');
        // Continue with fallback user ID
      } else if (authData?.user) {
        userId = authData.user.id;
        console.log('Authenticated user ID:', userId);
      } else {
        console.log('No authenticated user found, using test user ID');
      }
      
      // Check if Supabase connection is working
      const { data, error } = await supabase.from('debts').select('count').limit(1);
      
      if (error) {
        // Table might not exist yet
        if (error.code === '42P01') {
          setSyncStatus('error');
          console.error('Debts table does not exist yet in Supabase.');
          return;
        }
        throw error;
      }
      
      // Get debts from localStorage
      const localData = localStorage.getItem('debt_data');
      if (!localData) {
        setSyncStatus('idle');
        return;
      }
      
      const localDebts = JSON.parse(localData);
      if (!Array.isArray(localDebts) || localDebts.length === 0) {
        setSyncStatus('idle');
        return;
      }
      
      // Filter to only include debts with negative IDs (locally created)
      const localOnlyDebts = localDebts.filter(debt => debt.id < 0);
      
      if (localOnlyDebts.length === 0) {
        setSyncStatus('success');
        return;
      }
      
      console.log(`Found ${localOnlyDebts.length} local debts to sync`);
      
      // Format data for Supabase
      const debtsToUpload = localOnlyDebts.map(debt => ({
        name: debt.name,
        balance: debt.balance,
        interest_rate: debt.interestRate,
        minimum_payment: debt.minimumPayment,
        category: debt.category,
        lender: debt.lender,
        notes: debt.notes,
        due_date: debt.dueDate,
        user_id: userId,  // Use the user ID (either real or fallback)
      }));
      
      console.log('Preparing to upload debts:', debtsToUpload);
      
      // Upload to Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('debts')
        .insert(debtsToUpload)
        .select();
        
      if (insertError) {
        console.error('Error inserting data:', insertError);
        throw insertError;
      }
      
      console.log('Successfully uploaded debts:', insertedData);
      
      // If successful, reload the data
      window.location.reload();
      setSyncStatus('success');
    } catch (err) {
      console.error('Error syncing to Supabase:', err);
      setSyncStatus('error');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Debt Payoff Planner</h1>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search debts..."
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
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleSyncToSupabase}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              'Sync to Database'
            )}
          </button>
          
          <button
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Debt
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Total Debt</h2>
          <div className="flex items-center">
            <ArrowDown className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-2xl font-bold text-gray-900">${totalDebt.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Minimum Monthly Payment</h2>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-2xl font-bold text-gray-900">${totalMinPayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Debt Free In</h2>
          <p className="text-2xl font-bold text-gray-900">
            {paymentPlan?.monthsUntilDebtFree && paymentPlan.monthsUntilDebtFree > 0 
              ? `${Math.floor(paymentPlan.monthsUntilDebtFree / 12)} years, ${paymentPlan.monthsUntilDebtFree % 12} months` 
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Payment Strategy Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Payment Strategy</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payoff Method</label>
              <div className="flex">
                <button
                  className={`flex items-center justify-center px-4 py-2 border ${
                    paymentMethod === 'snowball' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-500'
                  } rounded-l-md flex-1`}
                  onClick={() => setPaymentMethod('snowball')}
                >
                  <TrendingDown className={`h-4 w-4 mr-2 ${paymentMethod === 'snowball' ? 'text-blue-500' : 'text-gray-400'}`} />
                  Snowball
                </button>
                <button
                  className={`flex items-center justify-center px-4 py-2 border ${
                    paymentMethod === 'avalanche' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-500'
                  } rounded-r-md flex-1`}
                  onClick={() => setPaymentMethod('avalanche')}
                >
                  <TrendingUp className={`h-4 w-4 mr-2 ${paymentMethod === 'avalanche' ? 'text-blue-500' : 'text-gray-400'}`} />
                  Avalanche
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <p>
                  <span className="font-semibold">Snowball:</span> Pay off smallest balances first (boosts motivation)
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Avalanche:</span> Pay off highest interest rates first (saves most money)
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="extraPayment" className="block text-sm font-medium text-gray-700 mb-2">
                Extra Monthly Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="extraPayment"
                  name="extraPayment"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  min="0"
                  step="10"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Adding extra payments can significantly reduce your debt payoff timeline.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Your Debts</h2>
        </div>
        
        {!sortedDebts || sortedDebts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 mb-2">You don't have any debts added yet.</p>
            <p className="text-gray-500 text-sm">Click the "Add Debt" button above to start tracking your debts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debt Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payoff Order</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDebts.map((debt, index) => (
                  <tr key={debt?.id || index} className={`hover:bg-gray-50 ${index === 0 ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-red-100`}>
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{debt?.name || 'Unnamed Debt'}</div>
                          <div className="text-xs text-gray-500">{debt?.category || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        ${debt?.balance?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Percent className="h-4 w-4 mr-1 text-gray-400" />
                        {debt?.interestRate?.toFixed(2) || '0.00'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${debt?.minimumPayment?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {index === 0 ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Current Focus
                          </span>
                        ) : (
                          <span className="text-gray-500">#{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => debt && handleEditClick(debt)}
                        aria-label={`Edit ${debt?.name || 'debt'}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => debt && handleDeleteClick(debt)}
                        aria-label={`Delete ${debt?.name || 'debt'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debt Payoff Chart - We'll add this in a future iteration */}

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-[#F8F9FA] border border-gray-200 rounded-md">
        <div className="flex items-start">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-800">Pro Tip</h4>
            <p className="text-sm text-gray-600 mt-1">
              Compare both payoff methods to see which one works best for your situation. While the avalanche method saves you more money in interest, the snowball method gives you quick wins that keep you motivated.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Add extra payments:</strong> Even small additional payments each month can dramatically reduce your total payoff time and save you money in interest.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Automatic payment tracking:</strong> When you add a debt here, a recurring transaction is automatically created in the <Link href="/recurring" className="text-[#1F3A93] hover:underline">Recurring Transactions</Link> page to help you track your monthly payments.
            </p>
          </div>
        </div>
      </div>

      {/* Add Debt Modal */}
      {isModalOpen && (
        <AddDebtModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addDebt}
        />
      )}
      
      {/* Edit Debt Modal - We'd implement this when needed */}
      {editModalOpen && (
        <EditDebtModal 
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onEdit={updateDebt}
          debt={selectedDebt}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={selectedDebt?.name || ''}
          itemType="debt"
        />
      )}
    </div>
  )
} 