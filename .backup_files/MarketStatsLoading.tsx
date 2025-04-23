import React from 'react';

interface MarketStatsLoadingProps {
  symbolCount?: number;
}

export default function MarketStatsLoading({ symbolCount = 3 }: MarketStatsLoadingProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(symbolCount)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 