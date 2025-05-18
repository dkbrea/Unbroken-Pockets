import React, { useState } from 'react';

type AllocationFormProps = {
  category: {
    id: number;
    name: string;
    allocated: number;
    entityType?: 'category' | 'debt' | 'goal';
  };
  onSubmit: (amount: number) => void;
  onCancel: () => void;
  leftToAllocate: number;
  totalDebtPayments: number;
  totalGoalContributions: number;
  fixedExpenses: number;
  totalSubscriptions: number;
};

export const AllocationForm: React.FC<AllocationFormProps> = ({
  category,
  onSubmit,
  onCancel,
  leftToAllocate,
  totalDebtPayments,
  totalGoalContributions,
  fixedExpenses,
  totalSubscriptions
}) => {
  const [amount, setAmount] = useState(category.allocated.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(amount) || 0);
  };

  const getTitle = () => {
    switch (category.entityType) {
      case 'debt':
        return 'Update Debt Payment';
      case 'goal':
        return 'Update Goal Contribution';
      default:
        return 'Update Allocation';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {category.name}
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Budget Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fixed Expenses:</span>
                <span>${fixedExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Subscriptions:</span>
                <span>${totalSubscriptions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Debt Payments:</span>
                <span>${totalDebtPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Goal Contributions:</span>
                <span>${totalGoalContributions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Left to Allocate:</span>
                <span className={leftToAllocate >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${leftToAllocate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 