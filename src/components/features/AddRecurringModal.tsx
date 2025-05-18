'use client';

import { useState } from 'react';
import { 
  X, 
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { RecurringTransaction, RecurringTransactionInput } from '@/hooks/useRecurringData';
import { useAccounts } from '@/hooks/useSupabaseData';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: RecurringTransactionInput) => void;
}

const AddRecurringModal = ({ isOpen, onClose, onAdd }: AddRecurringModalProps) => {
  // Import accounts from the useAccounts hook
  const { accounts = [], isLoading: accountsLoading } = useAccounts();

  const [formData, setFormData] = useState<RecurringTransactionInput>({
    name: '',
    amount: 0,
    frequency: 'Monthly',
    category: '',
    nextDate: new Date().toISOString().split('T')[0],
    status: 'active',
    paymentMethod: 'Not specified',
    type: 'expense',
    description: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [isIncome, setIsIncome] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      // Convert to number and apply sign based on isIncome
      const amount = Math.abs(parseFloat(value) || 0);
      setFormData(prev => ({
        ...prev,
        amount: isIncome ? amount : -amount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const toggleTransactionType = () => {
    setIsIncome(!isIncome);
    setFormData(prev => ({
      ...prev,
      amount: prev.amount !== 0 ? -prev.amount : 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make a copy of the form data to ensure we're working with the correct values
    const submissionData = {
      ...formData,
      // Ensure amount has correct sign based on transaction type
      amount: isIncome ? Math.abs(formData.amount) : -Math.abs(formData.amount),
      // Set the type explicitly based on isIncome
      type: isIncome ? 'income' : 'expense',
    };
    
    console.log("Submitting recurring transaction:", submissionData);
    
    // Call the onAdd function with the data
    onAdd(submissionData);
    onClose();

    // Reset the form
    setFormData({
      name: '',
      amount: 0,
      frequency: 'Monthly',
      category: '',
      nextDate: new Date().toISOString().split('T')[0],
      status: 'active',
      paymentMethod: 'Not specified',
      type: 'expense',
      description: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsIncome(false);
    
    console.log("Form reset after submission");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Add Recurring Transaction</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Transaction Type Toggle */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="flex">
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-2 border ${!isIncome ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-500'} rounded-l-md flex-1`}
                  onClick={() => !isIncome || toggleTransactionType()}
                >
                  <ArrowDown className={`h-4 w-4 mr-2 ${!isIncome ? 'text-red-500' : 'text-gray-400'}`} />
                  Expense
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-2 border ${isIncome ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-300 text-gray-500'} rounded-r-md flex-1`}
                  onClick={() => isIncome || toggleTransactionType()}
                >
                  <ArrowUp className={`h-4 w-4 mr-2 ${isIncome ? 'text-green-500' : 'text-gray-400'}`} />
                  Income
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                required
              />
            </div>

            {/* Amount */}
            <div className="md:col-span-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={Math.abs(formData.amount)}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {isIncome ? (
                  <>
                    <option value="Income">Income</option>
                    <option value="Salary">Salary</option>
                    <option value="Investment">Investment</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Other Income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Housing">Housing</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Food">Food</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Debt">Debt</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                required
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Semi-monthly">Semi-monthly (Twice a month)</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-annually">Semi-annually</option>
                <option value="Annually">Annually</option>
              </select>
              {formData.frequency === 'Semi-monthly' && (
                <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded-md">
                  <p>Semi-monthly means the transaction occurs twice a month (e.g., on the 1st and 15th). It will be counted twice in monthly calculations.</p>
                </div>
              )}
            </div>

            {/* Next Date */}
            <div>
              <label htmlFor="nextDate" className="block text-sm font-medium text-gray-700 mb-2">
                Next Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  id="nextDate"
                  name="nextDate"
                  value={formData.nextDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex">
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-2 border ${formData.status === 'active' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-300 text-gray-500'} rounded-l-md flex-1`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                >
                  <CheckCircle2 className={`h-4 w-4 mr-2 ${formData.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                  Active
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-2 border ${formData.status === 'paused' ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-300 text-gray-500'} rounded-r-md flex-1`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'paused' }))}
                >
                  <XCircle className={`h-4 w-4 mr-2 ${formData.status === 'paused' ? 'text-yellow-500' : 'text-gray-400'}`} />
                  Paused
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1F3A93] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#172d70]"
            >
              Add Recurring Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecurringModal; 