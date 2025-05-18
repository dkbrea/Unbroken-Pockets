import React, { useState } from 'react';
import {
  Home,
  ShoppingCart,
  Car,
  Utensils,
  Coffee,
  Briefcase,
  Film,
  Heart,
  ShoppingBag,
  MoreHorizontal
} from 'lucide-react';

type CategoryFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  title: string;
};

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  title
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    icon: initialData?.iconName || 'ShoppingCart',
    color: initialData?.color || 'bg-blue-100',
    allocated: initialData?.allocated || 0
  });

  const icons = {
    Home,
    ShoppingCart,
    Car,
    Utensils,
    Coffee,
    Briefcase,
    Film,
    Heart,
    ShoppingBag,
    MoreHorizontal
  };

  const colors = [
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-red-100',
    'bg-purple-100',
    'bg-pink-100',
    'bg-indigo-100',
    'bg-gray-100'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(icons).map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  className={`p-2 rounded-lg ${
                    formData.icon === name ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setFormData({ ...formData, icon: name })}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${color} ${
                    formData.color === color ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          {initialData && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Allocation
              </label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2"
                value={formData.allocated}
                onChange={(e) =>
                  setFormData({ ...formData, allocated: parseFloat(e.target.value) || 0 })
                }
                min="0"
                step="0.01"
              />
            </div>
          )}

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
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 