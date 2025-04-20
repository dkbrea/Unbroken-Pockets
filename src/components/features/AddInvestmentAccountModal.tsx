'use client'

import { useState, useEffect } from 'react'
import { XCircle } from 'lucide-react'
import { Account } from '@/hooks/useInvestmentsData'
import { supabase } from '@/lib/supabase'

type AddInvestmentAccountModalProps = {
  isOpen: boolean
  onClose: () => void
  onAccountAdded: () => void
}

export default function AddInvestmentAccountModal({
  isOpen,
  onClose,
  onAccountAdded
}: AddInvestmentAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    balance: '',
    account_type: 'Retirement',
    last_updated: new Date().toISOString().split('T')[0]
  })
  
  // Get the current user's ID
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        console.log('Current user ID:', user.id)
      } else {
        console.error('No authenticated user found')
      }
    }
    
    if (isOpen) {
      getCurrentUser()
    }
  }, [isOpen])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      // Calculate change values (default to zero for new accounts)
      const change_amount = 0
      const change_percentage = 0
      
      console.log('Adding account with user_id:', userId)
      
      const { data, error } = await supabase
        .from('investment_accounts')
        .insert({
          name: formData.name,
          institution: formData.institution,
          balance: parseFloat(formData.balance),
          change_amount,
          change_percentage,
          account_type: formData.account_type,
          last_updated: formData.last_updated,
          user_id: userId
        })
        .select()
      
      if (error) {
        console.error('Error details:', error)
        throw error
      }
      
      console.log('Account added successfully:', data)
      
      // Notify parent component of the new account
      onAccountAdded()
      
      // Close modal and reset form
      onClose()
      setFormData({
        name: '',
        institution: '',
        balance: '',
        account_type: 'Retirement',
        last_updated: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error adding investment account:', error)
      alert('Failed to add investment account. Please check the console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add Investment Account</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
              placeholder="401(k), IRA, Brokerage, etc."
            />
          </div>
          
          {/* Institution */}
          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <input
              id="institution"
              name="institution"
              type="text"
              required
              value={formData.institution}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
              placeholder="Fidelity, Vanguard, Charles Schwab, etc."
            />
          </div>
          
          {/* Balance */}
          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                required
                value={formData.balance}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Account Type */}
          <div>
            <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              id="account_type"
              name="account_type"
              required
              value={formData.account_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
            >
              <option value="Retirement">Retirement</option>
              <option value="Taxable">Taxable</option>
              <option value="Education">Education</option>
              <option value="Alternative">Alternative</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Last Updated Date */}
          <div>
            <label htmlFor="last_updated" className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <input
              id="last_updated"
              name="last_updated"
              type="date"
              required
              value={formData.last_updated}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !userId}
              className="w-full bg-[#1F3A93] text-white py-2 px-4 rounded-md hover:bg-[#172d70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F3A93] disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Account'}
            </button>
            {!userId && (
              <p className="mt-2 text-sm text-red-600">
                You must be logged in to add an account
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 