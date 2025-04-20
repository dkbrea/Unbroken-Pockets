'use client';

import React, { useState } from 'react';
import InvestmentPerformanceChart from '../../../components/InvestmentPerformanceChart';
import { useInvestmentsData, TimeRange } from '../../../hooks/useInvestmentsData';

export default function InvestmentPerformanceExample() {
  const { 
    portfolioSummary, 
    timeRange, 
    setTimeRange, 
    hideBalances, 
    setHideBalances 
  } = useInvestmentsData();
  
  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '1Y', 'All'];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Investment Performance Chart</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Portfolio Performance</h2>
            <p className="text-gray-500">Total Value: {hideBalances ? '***' : `$${portfolioSummary.totalValue.toLocaleString()}`}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setHideBalances(!hideBalances)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              {hideBalances ? 'Show' : 'Hide'} Balances
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-2xl font-bold ${portfolioSummary.change.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {hideBalances ? '***' : `$${portfolioSummary.change.amount.toLocaleString()}`}
              </span>
              <span className={`ml-2 ${portfolioSummary.change.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioSummary.change.percentage >= 0 ? '+' : ''}
                {portfolioSummary.change.percentage.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex space-x-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    timeRange === range 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <InvestmentPerformanceChart
          timeRange={timeRange}
          currentValue={portfolioSummary.totalValue}
          performanceData={portfolioSummary.timeRangePerformance[timeRange]}
          hideBalances={hideBalances}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">How to Use This Component</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <pre className="text-sm overflow-x-auto">
{`import InvestmentPerformanceChart from '../components/InvestmentPerformanceChart';
import { TimeRange, PerformanceData } from '../hooks/useInvestmentsData';

// Example usage
<InvestmentPerformanceChart
  timeRange="1Y"
  currentValue={325750.82}
  performanceData={{ amount: 42350.87, percentage: 14.94 }}
  hideBalances={false}
/>`}
          </pre>
        </div>
        
        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium">timeRange:</span> Time period for the chart ('1D', '1W', '1M', '1Y', 'All')
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">currentValue:</span> Current total value of the portfolio
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">performanceData:</span> Object containing performance metrics (amount, percentage)
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">hideBalances:</span> (Optional) Whether to hide monetary values for privacy
          </p>
        </div>
      </div>
    </div>
  );
} 