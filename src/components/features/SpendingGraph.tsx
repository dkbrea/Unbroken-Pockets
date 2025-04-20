'use client'

import { ChevronDown } from 'lucide-react'
import { useReports } from '@/hooks/useSupabaseData'

// Tailwind color mapping to hex values
const tailwindColors = {
  'blue': '#3B82F6',
  'green': '#10B981',
  'purple': '#8B5CF6',
  'yellow': '#F59E0B',
  'red': '#EF4444',
  'gray': '#6B7280',
  'indigo': '#6366F1',
  'pink': '#EC4899',
  'teal': '#14B8A6',
  'orange': '#F97316',
  'lime': '#84CC16',
  'cyan': '#06B6D4',
  'fuchsia': '#D946EF',
  'emerald': '#10B981',
  'violet': '#8B5CF6',
  'rose': '#F43F5E',
  'sky': '#0EA5E9',
  'amber': '#F59E0B',
}

// Convert Tailwind color class to hex color
const convertTailwindToHex = (color) => {
  if (color.startsWith('#')) {
    return color; // Already a hex color
  }
  
  // Extract the color name from the Tailwind class (e.g., 'bg-blue-500' -> 'blue')
  const match = color.match(/bg-([a-z]+)-\d+/);
  if (match && match[1] && tailwindColors[match[1]]) {
    return tailwindColors[match[1]];
  }
  
  // Default fallback color if no match
  return '#6B7280'; // gray-500
}

const SpendingGraph = () => {
  const { categoryData, totalSpending, isLoading, error } = useReports();
  
  // Use data from Supabase or fall back to mock data if needed
  const spendingData = categoryData ? categoryData.map(category => ({
    name: category.category,
    amount: category.amount,
    percentage: Math.round((category.amount / (totalSpending || 1)) * 100),
    color: convertTailwindToHex(category.color)
  })) : [
    { name: 'Housing', amount: 1200, percentage: 32, color: '#FFC857' },
    { name: 'Food & Dining', amount: 650, percentage: 17, color: '#FFB74D' },
    { name: 'Transportation', amount: 350, percentage: 9, color: '#4FC3F7' },
    { name: 'Entertainment', amount: 280, percentage: 7, color: '#9575CD' },
    { name: 'Shopping', amount: 420, percentage: 11, color: '#4DB6AC' },
    { name: 'Health & Fitness', amount: 180, percentage: 5, color: '#F06292' },
    { name: 'Other', amount: 740, percentage: 19, color: '#A1A1AA' },
  ];

  // Calculate the total spending if not provided from Supabase
  const totalAmount = totalSpending || spendingData.reduce((sum, category) => sum + category.amount, 0);

  // Display loading state
  if (isLoading) {
    return (
      <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1F3A93]">Spending by Category</h2>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 flex justify-center">
            <div className="w-48 h-48 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
          <div className="md:col-span-3">
            <div className="flex justify-between mb-2">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-gray-200"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 w-full">
        <div className="text-red-500">
          Error loading spending data: {error.message}
        </div>
      </div>
    );
  }

  // Function to generate a simple pie chart
  const generatePieChart = () => {
    let cumulativePercentage = 0
    
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {spendingData.map((category, index) => {
          const startAngle = cumulativePercentage * 3.6 // Convert percentage to degrees (360 degrees / 100)
          cumulativePercentage += category.percentage
          const endAngle = cumulativePercentage * 3.6
          
          // Convert angles to radians
          const startRad = (startAngle - 90) * Math.PI / 180
          const endRad = (endAngle - 90) * Math.PI / 180
          
          // Calculate path
          const x1 = 50 + 50 * Math.cos(startRad)
          const y1 = 50 + 50 * Math.sin(startRad)
          const x2 = 50 + 50 * Math.cos(endRad)
          const y2 = 50 + 50 * Math.sin(endRad)
          
          // Create the path
          const largeArcFlag = category.percentage > 50 ? 1 : 0
          const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
          
          return (
            <path
              key={index}
              d={pathData}
              fill={category.color}
              className="hover:opacity-80 cursor-pointer transition-opacity"
            />
          )
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
    )
  }

  return (
    <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#1F3A93]">Spending by Category</h2>
        <button className="flex items-center text-sm text-[#4A4A4A] hover:text-[#1F3A93]">
          All Categories
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Pie Chart */}
        <div className="md:col-span-2 flex justify-center">
          <div className="w-48 h-48">
            {generatePieChart()}
          </div>
        </div>

        {/* Categories List */}
        <div className="md:col-span-3">
          <div className="flex justify-between text-sm text-[#4A4A4A] mb-2 font-medium">
            <span>Category</span>
            <span>Amount</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {spendingData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-[#4A4A4A]">{category.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">${category.amount.toLocaleString()}</span>
                  <span className="text-xs text-[#4A4A4A] ml-2">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
            <span className="font-semibold text-[#4A4A4A]">Total</span>
            <span className="font-semibold text-[#4A4A4A]">${totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpendingGraph 