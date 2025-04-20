'use client'

import { 
  Filter, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  Download
} from 'lucide-react'
import { useCashFlowData } from '@/hooks/useCashFlowData'

export default function CashFlow() {
  const {
    dateFilter,
    cashFlowData,
    totalIncome,
    totalExpenses,
    netCashFlow,
    last3Months,
    setDateFilter
  } = useCashFlowData();

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Cash Flow</h1>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
            {dateFilter}
            <ChevronDown className="ml-2 h-4 w-4 text-[#4A4A4A]" />
          </button>
          
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
            <Filter className="mr-2 h-4 w-4 text-[#4A4A4A]" />
            Filter
          </button>
          
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
            <Download className="mr-2 h-4 w-4 text-[#4A4A4A]" />
            Export
          </button>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Total Income</h2>
          <div className="flex items-center">
            <ArrowUp className="h-8 w-8 text-green-500 mr-3" />
            <span className="text-2xl font-bold text-gray-900">${totalIncome.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Total Expenses</h2>
          <div className="flex items-center">
            <ArrowDown className="h-8 w-8 text-red-500 mr-3" />
            <span className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Net Cash Flow</h2>
          <div className="flex items-center">
            {netCashFlow >= 0 ? (
              <ArrowUp className="h-8 w-8 text-green-500 mr-3" />
            ) : (
              <ArrowDown className="h-8 w-8 text-red-500 mr-3" />
            )}
            <span className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(netCashFlow).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Income vs Expenses</h2>
        <div className="h-64 w-full">
          {/* Chart placeholder - in real app, use a chart library */}
          <div className="flex h-full items-end justify-around">
            {cashFlowData.map((month, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 w-1/6">
                <div className="w-full flex justify-center space-x-1">
                  <div 
                    className="w-8 bg-green-500 rounded-t-sm" 
                    style={{ height: `${(month.income / 6000) * 200}px` }}
                  ></div>
                  <div 
                    className="w-8 bg-red-500 rounded-t-sm" 
                    style={{ height: `${(month.expenses / 6000) * 200}px` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-500">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">Income</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">Expenses</span>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <h2 className="text-lg font-medium text-gray-700 p-6 border-b border-gray-200">Monthly Breakdown</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {last3Months.map((month, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${month.income.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${month.expenses.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={month.income - month.expenses >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(month.income - month.expenses).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      month.income - month.expenses >= 500 ? 'bg-green-100 text-green-800' :
                      month.income - month.expenses >= 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {month.income - month.expenses >= 500 ? 'Excellent' :
                       month.income - month.expenses >= 0 ? 'Good' : 'Deficit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 