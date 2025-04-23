'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Wallet,
  Lock
} from 'lucide-react';
import { RecurringTransaction } from '@/hooks/useRecurringData';
import { useAccounts } from '@/hooks/useSupabaseData';

interface EditRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number, transaction: Omit<RecurringTransaction, 'id'>) => void;
  transaction: RecurringTransaction | null;
}

const EditRecurringModal = ({ isOpen, onClose, onEdit, transaction }: EditRecurringModalProps) => {
  // Import accounts from the useAccounts hook
  const { accounts = [], isLoading: accountsLoading } = useAccounts();

  const [formData, setFormData] = useState<Omit<RecurringTransaction, 'id'>>({
    name: '',
    amount: 0,
    frequency: 'Monthly',
    category: '',
    nextDate: new Date().toISOString().split('T')[0],
    status: 'active',
    paymentMethod: 'Not specified',
    user_id: '',
    createdAt: '',
    updatedAt: '',
    type: 'expense',
    description: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [isIncome, setIsIncome] = useState(false);

  // Check if this is a debt-related transaction
  const isDebtRelated = transaction?.debtId !== undefined;

  // Update form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name,
        amount: Math.abs(transaction.amount),
        frequency: transaction.frequency,
        category: transaction.category,
        nextDate: transaction.nextDate,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        user_id: transaction.user_id,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        type: transaction.type,
        description: transaction.description || '',
        startDate: transaction.startDate || new Date().toISOString().split('T')[0]
      });
      setIsIncome(transaction.amount > 0);
    }
  }, [transaction]);

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
    
    if (!transaction) return;
    
    // Make a copy of the form data to ensure we're working with the correct values
    let submissionData = {
      ...formData,
      // Ensure amount has correct sign based on transaction type
      amount: isIncome ? Math.abs(formData.amount) : -Math.abs(formData.amount),
    };
    
    // For debt transactions, ensure certain values don't change
    if (isDebtRelated && transaction) {
      submissionData = {
        ...submissionData,
        name: transaction.name, // Keep original name
        type: 'expense', // Always an expense
        category: 'Debt', // Always in Debt category
        frequency: transaction.frequency, // Keep original frequency
      };
    }
    
    console.log("Submitting edited recurring transaction:", submissionData);
    
    // Call the onEdit function with the data
    onEdit(transaction.id, submissionData);
    onClose();
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">
            Edit Recurring Transaction
            {isDebtRelated && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full inline-flex items-center">
                <Wallet className="h-3 w-3 mr-1" />
                Debt Payment
              </span>
            )}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {isDebtRelated && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Debt Payment Transaction</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This is a transaction created from the Debt Tracker. Some fields are locked to maintain consistency.
                    You can edit the payment amount, date, and status.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Transaction Type Toggle */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="flex">
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-2 border ${!isIncome ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-500'} rounded-l-md flex-1 ${isDebtRelated ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => !isDebtRelated && !isIncome && toggleTransactionType()}
                  disabled={isDebtRelated}
                >
                  <ArrowDown className={`h-4 w-4 mr-2 ${!isIncome ? 'text-red-500' : 'text-gray-400'}`} />
                  Expense
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center px-4 py-2 border ${isIncome ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-300 text-gray-500'} rounded-r-md flex-1 ${isDebtRelated ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => !isDebtRelated && isIncome && toggleTransactionType()}
                  disabled={isDebtRelated}
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent ${isDebtRelated ? 'bg-gray-100' : ''}`}
                readOnly={isDebtRelated}
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent ${isDebtRelated ? 'bg-gray-100' : ''}`}
                disabled={isDebtRelated}
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent ${isDebtRelated ? 'bg-gray-100' : ''}`}
                disabled={isDebtRelated}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecurringModal; 