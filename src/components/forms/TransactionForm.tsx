import React, { useState } from 'react';
import { BudgetCategory } from '@/hooks/useBudgetData';

type TransactionFormProps = {
  categories: BudgetCategory[];
  onSubmit: (data: { categoryId: number; amount: number; description: string }) => void;
  onCancel: () => void;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || 0,
    amount: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      categoryId: formData.categoryId,
      amount: parseFloat(formData.amount),
      description: formData.description
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: parseInt(e.target.value) })
              }
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 