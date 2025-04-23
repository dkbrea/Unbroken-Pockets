import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Holding } from '../../hooks/useInvestmentsData';

interface EditHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHoldingUpdated: () => void;
  holding: Holding;
}

export default function EditHoldingModal({
  isOpen,
  onClose,
  onHoldingUpdated,
  holding
}: EditHoldingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data when the holding prop changes
  const [formData, setFormData] = useState({
    symbol: holding.symbol,
    name: holding.name,
    shares: holding.shares,
    pricePerShare: holding.pricePerShare,
  });
  
  // Update form data when holding changes
  useEffect(() => {
    if (holding) {
      setFormData({
        symbol: holding.symbol,
        name: holding.name,
        shares: holding.shares,
        pricePerShare: holding.pricePerShare,
      });
    }
  }, [holding]);
  
  // Calculate value based on shares and price
  const calculatedValue = formData.shares && formData.pricePerShare 
    ? (formData.shares * formData.pricePerShare).toFixed(2) 
    : '0.00';
  
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    if (name === 'shares' || name === 'pricePerShare') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Calculate the new value based on shares and price with fixed precision
      const value = parseFloat((formData.shares * formData.pricePerShare).toFixed(2));
      
      // Set a reasonable default for change amount (10% of value)
      // We're not trying to calculate real market changes, just preserving user input
      const changeAmount = value * 0.1; // 10% of value
      const changePercentage = 10; // 10%
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      console.log('Updating holding with data:', {
        symbol: formData.symbol,
        name: formData.name,
        shares: formData.shares,
        price_per_share: formData.pricePerShare,
        value: value,
        change_amount: changeAmount,
        change_percentage: changePercentage
      });
      
      // Update the holding in the database
      const { error } = await supabase
        .from('holdings')
        .update({
          symbol: formData.symbol,
          name: formData.name,
          shares: formData.shares,
          price_per_share: formData.pricePerShare,
          value: value,
          change_amount: changeAmount,
          change_percentage: changePercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', holding.id);
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      console.log('Holding updated successfully');
      
      // Don't synchronize the holding as that might override user inputs
      // Just call the callback directly
      
      // Call the callback function
      onHoldingUpdated();
      
      // Close the modal
      onClose();
    } catch (err: any) {
      console.error('Error updating holding:', err);
      setError(err.message || 'Failed to update holding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Investment Holding</h2>
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
          
          {/* Price per Share */}
          <div>
            <label htmlFor="pricePerShare" className="block text-sm font-medium text-gray-700 mb-1">
              Price per Share ($)
            </label>
            <input
              id="pricePerShare"
              name="pricePerShare"
              type="number"
              step="0.01"
              required
              value={formData.pricePerShare}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1F3A93] focus:border-[#1F3A93]"
              placeholder="0.00"
            />
          </div>
          
          {/* Calculated Value - Read Only */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
              Value ($)
            </label>
            <input
              id="value"
              type="text"
              readOnly
              value={calculatedValue}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Calculated automatically from shares × price per share
            </p>
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