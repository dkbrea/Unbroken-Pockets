'use client'

import { useState, useMemo } from 'react'
import { 
  CreditCard, 
  ArrowRight, 
  Building, 
  ChevronDown, 
  ChevronUp,
  Check 
} from 'lucide-react'
import { useDebtData } from '@/hooks/useDebtData'
import { useAccountsData } from '@/hooks/useAccountsData'
import { useTransactionsData } from '@/hooks/useTransactionsData'

const DebtPaymentWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentAccount, setPaymentAccount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Get data from hooks
  const { debts = [] } = useDebtData()
  const { accounts = [] } = useAccountsData()
  const { addTransaction } = useTransactionsData()

  // Filter accounts to only checking/savings/cash
  const paymentAccounts = useMemo(() => {
    return accounts.filter(acc => 
      ['checking', 'savings', 'cash'].includes(acc.type) && 
      !acc.isHidden
    )
  }, [accounts])

  // Check if we have both debts and accounts to work with
  const hasDebtAccountsAndPaymentAccounts = debts.length > 0 && paymentAccounts.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDebt || !paymentAmount || !paymentAccount) {
      alert('Please fill in all required fields')
      return
    }
    
    const amountValue = parseFloat(paymentAmount)
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid payment amount')
      return
    }
    
    // Find the selected debt
    const debt = debts.find(d => d.id === parseInt(selectedDebt.toString()))
    if (!debt) {
      alert('Selected debt not found')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create a transaction for the payment
      const today = new Date().toISOString().split('T')[0]
      
      await addTransaction({
        date: today,
        name: `Payment to ${debt.name}`,
        category: 'Debt Payment',
        amount: -amountValue, // Negative amount since it's an expense
        account: paymentAccount,
        notes: `Debt payment for ${debt.name}`,
        tags: ['debt', 'payment'],
        debt_id: debt.id
      })
      
      // Reset form
      setPaymentAmount('')
      setSuccessMessage(`Successfully recorded payment of $${amountValue.toFixed(2)} to ${debt.name}`)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error recording debt payment:', error)
      alert('There was an error recording your payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hasDebtAccountsAndPaymentAccounts) {
    return null
  }

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Make a Debt Payment</h2>
        </div>
        
        <button className="text-gray-500 hover:text-gray-700">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {successMessage ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              {successMessage}
            </div>
          ) : null}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Debt
                </label>
                <div className="relative">
                  <select
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={selectedDebt || ""}
                    onChange={(e) => setSelectedDebt(e.target.value ? parseInt(e.target.value) : null)}
                    required
                  >
                    <option value="">Select a debt account</option>
                    {debts.map(debt => (
                      <option key={debt.id} value={debt.id}>
                        {debt.name} (${debt.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay From Account
                </label>
                <div className="relative">
                  <select
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    required
                  >
                    <option value="">Select payment account</option>
                    {paymentAccounts.map(account => (
                      <option key={account.id} value={account.name}>
                        {account.name} (${account.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <Building className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center bg-purple-600 rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (
                  <>
                    Record Payment <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              <strong>Note:</strong> Recording a payment helps you track your debt repayment progress. 
              Make sure to also make the actual payment with your financial institution.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebtPaymentWidget 