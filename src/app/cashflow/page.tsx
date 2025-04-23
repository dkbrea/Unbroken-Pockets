'use client'

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PieChart,
  ArrowRight,
  Info,
  Wallet
} from 'lucide-react'
import { useCashFlowData } from '@/hooks/useCashFlowData'

export default function CashFlow() {
  const [timeRange, setTimeRange] = useState('3months')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)) // YYYY-MM format
  
  // Use our custom hook
  const { 
    cashFlowMetrics, 
    monthlyData, 
    cashFlowScore, 
    upcomingTransactions, 
    isLoading 
  } = useCashFlowData({
    timeRange,
    selectedMonth,
    includeCategories: true
  })
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
  
  // Helper function to format dates safely
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Date unavailable"
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Loading cash flow data...</span>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1F3A93]">Cash Flow</h1>
        
        <div className="flex space-x-2">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              className="pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Month Selector */}
          <div className="relative">
            <input
              type="month"
              className="pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Cash Flow Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Cash Flow Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Cash Flow Health</h2>
            <Info className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              {/* Simple gauge visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold">{cashFlowScore || 0}</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="12" 
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke={cashFlowScore >= 70 ? "#10B981" : cashFlowScore >= 40 ? "#F59E0B" : "#EF4444"} 
                  strokeWidth="12" 
                  strokeDasharray="339.3"
                  strokeDashoffset={339.3 - (339.3 * (cashFlowScore || 0) / 100)} 
                  transform="rotate(-90 60 60)" 
                />
              </svg>
            </div>
          </div>
          
          <p className="text-center mt-2 text-sm text-gray-500">
            {cashFlowScore >= 70 ? 'Excellent cash flow health' : 
             cashFlowScore >= 40 ? 'Moderate cash flow health' : 
             'Your cash flow needs attention'}
          </p>
        </div>
        
        {/* Net Cash Flow */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Net Cash Flow</h2>
            <Info className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-center my-4">
            <div className={`text-3xl font-bold ${(cashFlowMetrics?.netCashFlow || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(cashFlowMetrics?.netCashFlow || 0)}
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${(cashFlowMetrics?.netCashFlowChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(cashFlowMetrics?.netCashFlowChangePercent || 0) >= 0 ? 
                <TrendingUp className="h-5 w-5 mr-1" /> : 
                <TrendingDown className="h-5 w-5 mr-1" />
              }
              <span>{Math.abs(cashFlowMetrics?.netCashFlowChangePercent || 0).toFixed(1)}% from last period</span>
            </div>
          </div>
        </div>
        
        {/* Income vs Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Income vs Expenses</h2>
            <Info className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-xl font-semibold text-green-500">{formatCurrency(cashFlowMetrics?.totalIncome || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-xl font-semibold text-red-500">{formatCurrency(Math.abs(cashFlowMetrics?.totalExpenses || 0))}</p>
            </div>
          </div>
          
          {/* Simple bar visualization */}
          <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500" 
              style={{ 
                width: `${(cashFlowMetrics?.totalIncome && cashFlowMetrics?.totalExpenses) ? 
                  ((cashFlowMetrics.totalIncome / (cashFlowMetrics.totalIncome + Math.abs(cashFlowMetrics.totalExpenses))) * 100) : 
                  50}%` 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              {((cashFlowMetrics?.totalIncome || 0) / ((cashFlowMetrics?.totalIncome || 0) + Math.abs(cashFlowMetrics?.totalExpenses || 0)) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500">
              {((Math.abs(cashFlowMetrics?.totalExpenses || 0)) / ((cashFlowMetrics?.totalIncome || 0) + Math.abs(cashFlowMetrics?.totalExpenses || 0)) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
      
      {/* Category Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Expense Categories</h2>
          
          <div className="space-y-3">
            {cashFlowMetrics?.topExpenseCategories?.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm font-medium text-red-500">{formatCurrency(Math.abs(category.amount))}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500" 
                    style={{ 
                      width: `${Math.min(100, (Math.abs(category.amount) / Math.abs(cashFlowMetrics?.totalExpenses || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((Math.abs(category.amount) / Math.abs(cashFlowMetrics?.totalExpenses || 1)) * 100).toFixed(1)}% of expenses
                </p>
              </div>
            )) || <p className="text-sm text-gray-500 italic">No expense data available</p>}
          </div>
        </div>
        
        {/* Top Income Sources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Income Sources</h2>
          
          <div className="space-y-3">
            {cashFlowMetrics?.topIncomeCategories?.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm font-medium text-green-500">{formatCurrency(category.amount)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ 
                      width: `${Math.min(100, (category.amount / (cashFlowMetrics?.totalIncome || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((category.amount / (cashFlowMetrics?.totalIncome || 1)) * 100).toFixed(1)}% of income
                </p>
              </div>
            )) || <p className="text-sm text-gray-500 italic">No income data available</p>}
          </div>
        </div>
      </div>
      
      {/* Cash Flow Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cash Flow Health Score */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-medium text-gray-800">Cash Flow Health</h2>
            <div className="bg-blue-100 rounded-full p-1">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="relative w-32 h-32">
              {/* This would be a proper gauge chart in a real implementation */}
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 via-green-500 to-green-600" 
                  style={{ width: `${cashFlowScore}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{cashFlowScore}</span>
              </div>
            </div>
            
            <div className="ml-6">
              <p className="text-lg font-medium text-gray-800">
                {cashFlowScore >= 80 ? 'Excellent' : 
                 cashFlowScore >= 60 ? 'Good' : 
                 cashFlowScore >= 40 ? 'Fair' : 
                 'Needs Attention'}
              </p>
              <p className="text-gray-600 mt-1">Your cash flow is {cashFlowScore >= 60 ? 'healthy' : 'concerning'}</p>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                How to improve <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Net Cash Flow */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-medium text-gray-800">Net Cash Flow</h2>
          <div className="mt-4">
            <p className={`text-3xl font-bold ${cashFlowMetrics.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(cashFlowMetrics.netCashFlow)}
            </p>
            <div className="flex items-center mt-2 text-sm">
              <span className={`flex items-center ${
                cashFlowMetrics.netCashFlowChangePercent > 0 ? 'text-green-600' : 
                cashFlowMetrics.netCashFlowChangePercent < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {cashFlowMetrics.netCashFlowChangePercent > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : cashFlowMetrics.netCashFlowChangePercent < 0 ? (
                  <TrendingDown className="h-4 w-4 mr-1" />
                ) : null}
                
                {Math.abs(cashFlowMetrics.netCashFlowChangePercent).toFixed(1)}% from last month
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(cashFlowMetrics.totalIncome)}
              </p>
              <div className="flex items-center mt-1 text-xs">
                <span className={`flex items-center ${
                  cashFlowMetrics.incomeChangePercent > 0 ? 'text-green-600' : 
                  cashFlowMetrics.incomeChangePercent < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {cashFlowMetrics.incomeChangePercent > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : cashFlowMetrics.incomeChangePercent < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : null}
                  
                  {Math.abs(cashFlowMetrics.incomeChangePercent).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(cashFlowMetrics.totalExpenses)}
              </p>
              <div className="flex items-center mt-1 text-xs">
                <span className={`flex items-center ${
                  cashFlowMetrics.expensesChangePercent < 0 ? 'text-green-600' : 
                  cashFlowMetrics.expensesChangePercent > 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {cashFlowMetrics.expensesChangePercent < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : cashFlowMetrics.expensesChangePercent > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : null}
                  
                  {Math.abs(cashFlowMetrics.expensesChangePercent).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cash Flow Insights */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-medium text-gray-800">Insights</h2>
          <div className="mt-4 space-y-4">
            {cashFlowMetrics.netCashFlow > cashFlowMetrics.previousNetCashFlow && (
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Your net cash flow improved by {formatCurrency(cashFlowMetrics.netCashFlow - cashFlowMetrics.previousNetCashFlow)} compared to last month.
                </p>
              </div>
            )}
            
            {cashFlowMetrics.netCashFlow < cashFlowMetrics.previousNetCashFlow && (
              <div className="flex items-start">
                <div className="bg-red-100 rounded-full p-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Your net cash flow decreased by {formatCurrency(cashFlowMetrics.previousNetCashFlow - cashFlowMetrics.netCashFlow)} compared to last month.
                </p>
              </div>
            )}
            
            {cashFlowMetrics.topExpenseCategories.length > 0 && (
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Your largest expense category this month was '{cashFlowMetrics.topExpenseCategories[0].name}' at {formatCurrency(cashFlowMetrics.topExpenseCategories[0].amount)}.
                </p>
              </div>
            )}
            
            <div className="flex items-start">
              <div className="bg-purple-100 rounded-full p-2">
                <PieChart className="h-4 w-4 text-purple-600" />
              </div>
              <p className="ml-3 text-sm text-gray-700">
                You're saving approximately {((cashFlowMetrics.totalIncome > 0 ? (cashFlowMetrics.netCashFlow / cashFlowMetrics.totalIncome) * 100 : 0)).toFixed(1)}% of your income this month.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Income vs Expenses Chart Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Income vs Expenses Timeline</h2>
        
        <div className="h-80 w-full">
          {/* 
            This would be replaced with a proper chart component, 
            e.g., using Chart.js, Recharts, or another charting library
          */}
          <div className="flex flex-col items-center justify-center h-full">
            {monthlyData.length > 0 ? (
              <div className="w-full h-full flex items-end justify-around p-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex items-center">
                      <div className="text-xs text-gray-500 mb-2">{data.month}</div>
                      <div className="relative w-16">
                        <div 
                          className="bg-green-500 w-6 absolute bottom-0 left-0 rounded-t"
                          style={{ height: `${Math.min(200, data.income / 20)}px` }}
                        ></div>
                        <div 
                          className="bg-red-500 w-6 absolute bottom-0 right-0 rounded-t"
                          style={{ height: `${Math.min(200, data.expenses / 20)}px` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="text-gray-400">No data available for the selected time period</div>
                <p className="text-sm text-gray-500 mt-2">
                  Try selecting a different time range
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Category Breakdown and Cash Flow Forecast in a 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Expense Categories</h2>
          
          <div className="space-y-4">
            {cashFlowMetrics.topExpenseCategories.length > 0 ? (
              cashFlowMetrics.topExpenseCategories.map(category => (
                <div key={category.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${category.color}`} 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{category.percentage.toFixed(1)}% of expenses</span>
                    {/* Show change from previous period */}
                    {category.changePercent !== undefined && (
                      <span className={category.changePercent < 0 ? 'text-green-600' : category.changePercent > 0 ? 'text-red-600' : 'text-gray-500'}>
                        {category.changePercent > 0 ? '+' : ''}{category.changePercent.toFixed(1)}% vs. last month
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No expense data available for the selected month</p>
            )}
          </div>
        </div>
        
        {/* Cash Flow Forecast */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Cash Flow Forecast</h2>
          
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Based on your recurring income and expenses, here's your projected cash flow for the next 30 days:
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-lg font-semibold">{formatCurrency(8435.75)}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Projected Balance</p>
                <p className="text-lg font-semibold">{formatCurrency(9218.50)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Upcoming Income</h3>
              <div className="space-y-2">
                {upcomingTransactions.filter(t => t.amount > 0).length > 0 ? (
                  upcomingTransactions
                    .filter(t => t.amount > 0)
                    .map((transaction, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium">{transaction.name}</p>
                            <p className="text-xs text-gray-500">Expected on {formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-green-600">+{formatCurrency(transaction.amount)}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No upcoming income detected</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Upcoming Expenses</h3>
              <div className="space-y-2">
                {upcomingTransactions.filter(t => t.amount < 0).length > 0 ? (
                  upcomingTransactions
                    .filter(t => t.amount < 0)
                    .map((transaction, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          {transaction.debt_id || transaction.is_debt_transaction ? (
                            <Wallet className="h-4 w-4 text-blue-600 mr-2" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{transaction.name}</p>
                            <p className="text-xs text-gray-500">Due on {formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${transaction.debt_id || transaction.is_debt_transaction ? 'text-blue-600' : 'text-red-600'}`}>
                          -{formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No upcoming expenses detected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Seasonality Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Seasonality Analysis</h2>
        
        <div className="h-80 w-full">
          {/* 
            This would be replaced with a proper chart component showing
            spending patterns across months/seasons
          */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-gray-400">Seasonality chart would be implemented here</div>
            <p className="text-sm text-gray-500 mt-2">
              Showing spending patterns across different months and seasons
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 