'use client';

import { useState } from 'react';
import { 
  X, 
  Calendar,
  Percent,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface DebtInput {
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  category: string;
  lender: string;
  notes: string;
  dueDate?: number; // Day of month when payment is due
}

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (debt: DebtInput) => void;
}

const DEFAULT_DEBT: DebtInput = {
  name: '',
  balance: 0,
  interestRate: 0,
  minimumPayment: 0,
  category: '',
  lender: '',
  notes: '',
  dueDate: 1
};

const AddDebtModal = ({ isOpen, onClose, onAdd }: AddDebtModalProps) => {
  const [formData, setFormData] = useState<DebtInput>({...DEFAULT_DEBT});
  const { addToast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (['balance', 'interestRate', 'minimumPayment', 'dueDate'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onAdd(formData);
      
      // Show success toast notification
      addToast(
        `${formData.name} has been added to your debt tracker. A recurring payment has been automatically created in your Recurring Transactions.`,
        'success',
        5000
      );
      
      setFormData({...DEFAULT_DEBT}); // Reset form
      onClose();
    } catch (error) {
      console.error("Error adding debt:", error);
      
      // Show error toast notification
      addToast(
        `There was an error adding ${formData.name}. The debt was added but the recurring transaction may not have been created.`,
        'error',
        5000
      );
      
      setFormData({...DEFAULT_DEBT}); // Reset form
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Add New Debt</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Debt Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Debt Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                placeholder="Credit Card, Auto Loan, Mortgage, etc."
                required
              />
            </div>

            {/* Lender */}
            <div className="md:col-span-2">
              <label htmlFor="lender" className="block text-sm font-medium text-gray-700 mb-2">
                Lender / Bank
              </label>
              <input
                type="text"
                id="lender"
                name="lender"
                value={formData.lender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                placeholder="Bank name or lender"
              />
            </div>

            {/* Current Balance */}
            <div>
              <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="balance"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>

            {/* Minimum Payment */}
            <div>
              <label htmlFor="minimumPayment" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Monthly Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="minimumPayment"
                  name="minimumPayment"
                  value={formData.minimumPayment}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Day of Month)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  min="1"
                  max="31"
                />
              </div>
            </div>

            {/* Category */}
            <div className="md:col-span-2">
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
                <option value="Credit Card">Credit Card</option>
                <option value="Mortgage">Mortgage</option>
                <option value="Auto Loan">Auto Loan</option>
                <option value="Student Loan">Student Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Medical Debt">Medical Debt</option>
                <option value="Tax Debt">Tax Debt</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Line of Credit">Line of Credit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          {/* Payment Strategy Info */}
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Payment Strategy Tips:</p>
                <p>• <b>Snowball Method:</b> Pay minimum on all debts, then put extra money toward the smallest balance first.</p>
                <p>• <b>Avalanche Method:</b> Pay minimum on all debts, then put extra money toward the highest interest rate first.</p>
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
              Add Debt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDebtModal; 