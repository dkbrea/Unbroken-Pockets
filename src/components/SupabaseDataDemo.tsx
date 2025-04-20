'use client';

import { useSupabaseData } from '../hooks/useSupabaseData';

export const SupabaseDataDemo = () => {
  const { budget, cashFlow, goals, investments, reports, isLoading, error } = useSupabaseData();

  if (isLoading) {
    return <div className="p-4">Loading data from Supabase...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading data: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Data Demo</h1>
      
      {/* Budget Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Budget Data</h2>
        <div className="bg-white p-4 rounded shadow">
          <p>Active Period: {budget.activePeriod}</p>
          <p>Total Budget: ${budget.totalAllocated?.toFixed(2)}</p>
          <p>Total Spent: ${budget.totalSpent?.toFixed(2)}</p>
          <p>Remaining: ${budget.remainingBudget?.toFixed(2)}</p>
          
          <h3 className="font-medium mt-4 mb-2">Categories:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budget.budgetCategories?.map(category => (
              <div key={category.id} className="border p-3 rounded">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded ${category.color}`}>
                    <category.icon size={16} />
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="mt-2">
                  <p>Budget: ${category.allocated.toFixed(2)}</p>
                  <p>Spent: ${category.spent.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Cash Flow Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cash Flow Data</h2>
        <div className="bg-white p-4 rounded shadow">
          <p>Total Income: ${cashFlow.totalIncome?.toFixed(2)}</p>
          <p>Total Expenses: ${cashFlow.totalExpenses?.toFixed(2)}</p>
          <p>Net Cash Flow: ${cashFlow.netCashFlow?.toFixed(2)}</p>
          
          <h3 className="font-medium mt-4 mb-2">Monthly Data:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Month</th>
                  <th className="p-2 text-left">Income</th>
                  <th className="p-2 text-left">Expenses</th>
                  <th className="p-2 text-left">Net</th>
                </tr>
              </thead>
              <tbody>
                {cashFlow.cashFlowData?.map((month, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{month.month}</td>
                    <td className="p-2">${month.income.toFixed(2)}</td>
                    <td className="p-2">${month.expenses.toFixed(2)}</td>
                    <td className="p-2">${(month.income - month.expenses).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Goals Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Financial Goals</h2>
        <div className="bg-white p-4 rounded shadow">
          <p>Total Monthly Contribution: ${goals.totalMonthlyContribution?.toFixed(2)}</p>
          
          <h3 className="font-medium mt-4 mb-2">Goals:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.goalsWithProgress?.map(goal => (
              <div key={goal.id} className="border p-3 rounded">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded ${goal.color}`}>
                    <goal.icon size={16} />
                  </div>
                  <span className="font-medium">{goal.name}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }} 
                    />
                  </div>
                  <p>{goal.progressPercent}% Complete</p>
                  <p>Current: ${goal.currentAmount.toFixed(2)}</p>
                  <p>Target: ${goal.targetAmount.toFixed(2)}</p>
                  <p>On Track: {goal.onTrack ? 'Yes ✅' : 'No ❌'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Investments Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Investments</h2>
        <div className="bg-white p-4 rounded shadow">
          <p>Portfolio Value: ${investments.portfolioSummary?.totalValue.toFixed(2)}</p>
          <p>
            Change: ${investments.portfolioSummary?.change.amount.toFixed(2)} 
            ({investments.portfolioSummary?.change.percentage.toFixed(2)}%)
          </p>
          
          <h3 className="font-medium mt-4 mb-2">Asset Allocation:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {investments.assetAllocation?.map((asset, index) => (
              <div key={index} className="border p-3 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${asset.color}`}></div>
                  <span className="font-medium">{asset.name}</span>
                </div>
                <div className="mt-2">
                  <p>${asset.value.toFixed(2)}</p>
                  <p>{asset.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
          
          <h3 className="font-medium mt-4 mb-2">Top Holdings:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Symbol</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Value</th>
                  <th className="p-2 text-left">Shares</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Change</th>
                </tr>
              </thead>
              <tbody>
                {investments.topHoldings?.map(holding => (
                  <tr key={holding.id} className="border-b">
                    <td className="p-2 font-medium">{holding.symbol}</td>
                    <td className="p-2">{holding.name}</td>
                    <td className="p-2">${holding.value.toFixed(2)}</td>
                    <td className="p-2">{holding.shares.toFixed(2)}</td>
                    <td className="p-2">${holding.pricePerShare.toFixed(2)}</td>
                    <td className="p-2">
                      <span className={holding.change.percentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {holding.change.percentage >= 0 ? '+' : ''}{holding.change.percentage.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Reports Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Reports</h2>
        <div className="bg-white p-4 rounded shadow">
          <p>Total Spending: ${reports.totalSpending?.toFixed(2)}</p>
          
          <h3 className="font-medium mt-4 mb-2">Report Types:</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {reports.reportTypes?.map(type => (
              <button 
                key={type.id} 
                className={`flex items-center gap-1 px-3 py-2 rounded ${type.color}`}
              >
                <type.icon size={16} />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
          
          <h3 className="font-medium mt-4 mb-2">Spending Categories:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.categoryData?.map((category, index) => (
              <div key={index} className="border p-3 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="mt-2">
                  <p>${category.amount.toFixed(2)}</p>
                  <p>{(category.amount / (reports.totalSpending || 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 