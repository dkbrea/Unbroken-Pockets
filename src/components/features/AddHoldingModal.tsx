'use client'

import { useState, useEffect } from 'react'
import { XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type AddHoldingModalProps = {
  isOpen: boolean
  onClose: () => void
  onHoldingAdded: () => void
}

export default function AddHoldingModal({
  isOpen,
  onClose,
  onHoldingAdded
}: AddHoldingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    shares: '',
    pricePerShare: ''
  })
  
  // Calculated value (derived from shares and price)
  const calculatedValue = 
    parseFloat(formData.shares) && parseFloat(formData.pricePerShare) 
      ? (parseFloat(formData.shares) * parseFloat(formData.pricePerShare)).toFixed(2) 
      : '0.00'

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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'symbol') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Convert string values to numbers
      const shares = parseFloat(formData.shares)
      const pricePerShare = parseFloat(formData.pricePerShare)
      // Calculate value with fixed precision to match what's displayed in the modal
      const value = parseFloat((shares * pricePerShare).toFixed(2))
      
      // Set a reasonable default for change values (10% of value)
      const changeAmount = value * 0.1 // 10% of value
      const changePercentage = 10 // 10%
      
      // Log what we're about to send to the database
      console.log('Adding holding with data:', {
        symbol: formData.symbol,
        name: formData.name,
        shares,
        price_per_share: pricePerShare,
        pricePerShare,
        value,
        change_amount: changeAmount,
        change_percentage: changePercentage,
        user_id: userId
      })
      
      const { data, error } = await supabase
        .from('holdings')
        .insert({
          symbol: formData.symbol,
          name: formData.name,
          shares: shares,
          price_per_share: pricePerShare, // This is the database field name
          value: value,
          change_amount: changeAmount,
          change_percentage: changePercentage,
          user_id: userId
        })
        .select()
      
      if (error) {
        console.error('Error details:', error)
        throw error
      }

      if (data && data.length > 0) {
        console.log('Holding added successfully:', data)
        
        // Don't synchronize the holding as that will override user inputs
        
        // Notify parent component of the new holding
        onHoldingAdded()
        
        // Close modal and reset form
        onClose()
        setFormData({
          symbol: '',
          name: '',
          shares: '',
          pricePerShare: ''
        })
      }
    } catch (error) {
      console.error('Error adding holding:', error)
      alert('Failed to add holding. Please check the console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add Investment Holding</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Symbol */}
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <input
              id="symbol"
              name="symbol"
              type="text"
              required
              value={formData.symbol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
              placeholder="AAPL, VTI, etc."
            />
          </div>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
              placeholder="Apple Inc., Vanguard Total Stock Market ETF, etc."
            />
          </div>
          
          {/* Shares */}
          <div>
            <label htmlFor="shares" className="block text-sm font-medium text-gray-700 mb-1">
              Shares
            </label>
            <input
              id="shares"
              name="shares"
              type="number"
              step="0.001"
              required
              value={formData.shares}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
              placeholder="0.000"
            />
          </div>
          
          {/* Price Per Share */}
          <div>
            <label htmlFor="pricePerShare" className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Share
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="pricePerShare"
                name="pricePerShare"
                type="number"
                step="0.01"
                required
                value={formData.pricePerShare}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Total Value (auto-calculated) */}
          <div>
            <label htmlFor="calculatedValue" className="block text-sm font-medium text-gray-700 mb-1">
              Total Value (Auto-calculated)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="calculatedValue"
                type="text"
                readOnly
                value={calculatedValue}
                className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1F3A93] hover:bg-[#172d70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F3A93]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 