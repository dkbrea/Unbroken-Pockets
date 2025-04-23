'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { AccountType } from '@/lib/services/accountService'
import Link from 'next/link'

interface AddAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (accountData: { name: string; institution: string; type: AccountType; balance: number }) => void
  isSubmitting?: boolean
}

const AddAccountModal = ({ isOpen, onClose, onSubmit, isSubmitting = false }: AddAccountModalProps) => {
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [balance, setBalance] = useState('')
  const [errors, setErrors] = useState({
    name: '',
    balance: ''
  })
  const [apiError, setApiError] = useState<string | null>(null)

  if (!isOpen) return null

  const validateForm = () => {
    let valid = true
    const newErrors = {
      name: '',
      balance: ''
    }

    if (!name.trim()) {
      newErrors.name = 'Account name is required'
      valid = false
    }

    if (!balance.trim()) {
      newErrors.balance = 'Balance is required'
      valid = false
    } else {
      const balanceNum = parseFloat(balance)
      if (isNaN(balanceNum)) {
        newErrors.balance = 'Balance must be a valid number'
        valid = false
      }
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    
    if (validateForm()) {
      // Log submission for debugging
      console.log('Submitting account data:', {
        name,
        institution: institution || 'Personal',
        type,
        balance: parseFloat(balance)
      })
      
      try {
        // Set loading state
        setApiError(null);
        
        onSubmit({
          name,
          institution: institution || 'Personal', // Default to 'Personal' if not provided
          type,
          balance: parseFloat(balance)
        })
        
        // Note: Form will be reset automatically on successful submission
      } catch (error: any) {
        console.error('Error in account submission:', error)
        setApiError(error.message || 'Failed to create account')
      }
    }
  }

  // Function to save and start a new account entry
  const handleSaveAndAddAnother = (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    
    if (validateForm()) {
      try {
        // Set loading state
        setApiError(null);
        
        onSubmit({
          name,
          institution: institution || 'Personal',
          type,
          balance: parseFloat(balance)
        })
        
        // Reset form for next entry if successful
        resetForm()
        
        // Focus on account name field
        setTimeout(() => {
          const nameInput = document.getElementById('accountName')
          if (nameInput) nameInput.focus()
        }, 100)
      } catch (error: any) {
        console.error('Error in account submission:', error)
        setApiError(error.message || 'Failed to create account')
      }
    }
  }

  // Reset form helper function
  const resetForm = () => {
    setName('')
    setType('checking')
    setBalance('')
    setInstitution('')
    setErrors({ name: '', balance: '' })
    setApiError(null)
  }

  // Check if form is complete and valid
  const isFormComplete = name.trim() !== '' && balance.trim() !== '' && !errors.name && !errors.balance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Account</h2>
          <button 
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* API Error */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error creating account</p>
              <p className="text-sm">{apiError}</p>
              <div className="mt-2">
                <p className="text-xs text-red-600">Troubleshooting tips:</p>
                <ul className="text-xs list-disc pl-5 mt-1">
                  <li>Check your internet connection</li>
                  <li>Make sure you're logged in or using bypass mode</li>
                  {apiError.toLowerCase().includes('database') && (
                    <li className="font-medium">
                      Database issues detected - 
                      <Link href="/admin/fix-database" className="text-red-800 underline ml-1">
                        Run database fix tool
                      </Link>
                    </li>
                  )}
                  <li>Try refreshing the page and trying again</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Account Name */}
          <div className="mb-4">
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              id="accountName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Main Checking"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          {/* Institution */}
          <div className="mb-4">
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
              Institution (Optional)
            </label>
            <input
              id="institution"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Chase Bank"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Account Type */}
          <div className="mb-4">
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              id="accountType"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="cash">Cash</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          
          {/* Current Balance */}
          <div className="mb-6">
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                id="balance"
                type="text"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
            {errors.balance && <p className="mt-1 text-sm text-red-600">{errors.balance}</p>}
          </div>
          
          {/* Form Completion Status */}
          {isFormComplete && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              ✓ All required fields are complete
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndAddAnother}
              className={`px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSubmitting || !isFormComplete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting || !isFormComplete}
            >
              {isSubmitting ? 'Saving...' : 'Save & Add Another'}
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              } ${!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting || !isFormComplete}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        {/* Development tools - only visible in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <details>
              <summary className="text-sm text-gray-500 cursor-pointer">Developer Options</summary>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="mr-2 px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName('Test Account')
                    setType('checking')
                    setBalance('1000')
                    setInstitution('Test Bank')
                  }}
                  className="mr-2 px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Fill Test Data
                </button>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddAccountModal 