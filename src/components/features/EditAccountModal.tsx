'use client'

import { useState, useEffect } from 'react'
import { XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { AccountType } from '@/lib/types/states'

interface Account {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: AccountType;
  account_type?: string; // For backward compatibility
  updated_at: string;
  change?: {
    amount: number;
    percentage: number;
  };
}

type EditAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, accountData: { name: string; institution: string; type: AccountType; balance: number }) => void;
  account: Account | null;
  isSubmitting?: boolean;
}

export default function EditAccountModal({
  isOpen,
  onClose,
  onSubmit,
  account,
  isSubmitting = false
}: EditAccountModalProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form data from the account prop
  const [formData, setFormData] = useState({
    name: account?.name || '',
    institution: account?.institution || '',
    balance: account?.balance?.toString() || '',
    account_type: account?.account_type || account?.type || 'checking',
    updated_at: account?.updated_at || new Date().toISOString().split('T')[0]
  });
  
  // Update form data when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        institution: account.institution || '',
        balance: account.balance?.toString() || '',
        account_type: account.account_type || account.type || 'checking',
        updated_at: account.updated_at || new Date().toISOString().split('T')[0]
      });
    }
  }, [account]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!account) {
        throw new Error('No account selected');
      }

      // Validate the user is authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Calculate change values - preserve existing percentages or default to zero
      const changeAmount = account?.change?.amount || 0;
      const changePercentage = account?.change?.percentage || 0;
      
      // Update the account in the database
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          name: formData.name,
          institution: formData.institution,
          balance: parseFloat(formData.balance),
          account_type: formData.account_type,
          type: formData.account_type as AccountType, // Add type field to match both schemas
          updated_at: formData.updated_at,
          change_amount: changeAmount,
          change_percentage: changePercentage,
        })
        .eq('id', account.id);
      
      if (updateError) {
        console.error('Error updating account:', updateError);
        throw updateError;
      }
      
      console.log('Account updated successfully');
      
      // Call the callback function
      onSubmit(account.id, {
        name: formData.name,
        institution: formData.institution,
        type: formData.account_type as AccountType,
        balance: parseFloat(formData.balance)
      });
      
      // Close the modal
      onClose();
    } catch (err: any) {
      console.error('Error updating account:', err);
      setError(err.message || 'Failed to update account. Please try again.');
    }
  };
  
  if (!isOpen || !account) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit {account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account
          </h2>
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
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="cash">Cash</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          
          {/* Last Updated Date */}
          <div>
            <label htmlFor="updated_at" className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <input
              id="updated_at"
              name="updated_at"
              type="date"
              required
              value={formData.updated_at}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end pt-4 space-x-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1F3A93] hover:bg-[#172d70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F3A93]"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 