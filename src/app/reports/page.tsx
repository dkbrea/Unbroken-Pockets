'use client'

import { 
  Calendar, 
  Download, 
  ArrowRight,
  BarChart2,
  LineChart,
  BarChart
} from 'lucide-react'
import { useReportsData, ReportType } from '@/hooks/useReportsData'
import { ReactNode } from 'react'

export default function Reports() {
  const {
    activeTab,
    dateRange,
    reportTypes,
    categoryData,
    totalSpending,
    setActiveTab,
    setDateRange
  } = useReportsData();

  // Get the icon for a specific report type
  const getReportIcon = (reportId: string): ReactNode => {
    const report = reportTypes.find((report: ReportType) => report.id === reportId);
    if (!report) return null;
    const Icon = report.icon;
    return <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Reports</h1>
        
        <div className="flex items-center space-x-3">
          <button 
            className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]"
            onClick={() => {
              // In a real implementation, this would show a date picker
              const ranges = ['Last 6 months', 'Year to date', 'Last year', 'Custom range'];
              const currentIndex = ranges.indexOf(dateRange);
              const nextIndex = (currentIndex + 1) % ranges.length;
              setDateRange(ranges[nextIndex]);
            }}
          >
            <Calendar className="mr-2 h-4 w-4 text-[#4A4A4A]" />
            {dateRange}
          </button>
          
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5]">
            <Download className="mr-2 h-4 w-4 text-[#4A4A4A]" />
            Export
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map(report => (
          <button
            key={report.id}
            className={`flex items-center p-4 rounded-lg border transition-all ${
              activeTab === report.id 
              ? 'border-[#1F3A93] bg-[#1F3A93]/5' 
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab(report.id)}
          >
            <div className={`p-2 rounded-lg ${report.color} mr-3`}>
              <report.icon className="h-5 w-5" />
            </div>
            <span className={`text-sm font-medium ${
              activeTab === report.id ? 'text-[#1F3A93]' : 'text-gray-700'
            }`}>
              {report.name}
            </span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {reportTypes.find(report => report.id === activeTab)?.name}
        </h2>
        
        {activeTab === 'spending' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Spending Distribution</h3>
                <div className="h-64 w-full relative flex items-center justify-center">
                  {/* Placeholder for pie chart - in real app, use a chart library */}
                  <div className="h-48 w-48 rounded-full bg-gray-200 relative overflow-hidden">
                    {categoryData.map((category, index) => {
                      const percentage = (category.amount / totalSpending) * 100
                      const rotate = index === 0 ? 0 : categoryData.slice(0, index).reduce((sum, cat) => sum + (cat.amount / totalSpending) * 360, 0)
                      
                      return (
                        <div 
                          key={category.category}
                          className={`absolute top-0 left-0 h-full w-full ${category.color}`}
                          style={{ 
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(rotate * Math.PI / 180)}% ${50 - 50 * Math.sin(rotate * Math.PI / 180)}%, ${50 + 50 * Math.cos((rotate + percentage * 3.6) * Math.PI / 180)}% ${50 - 50 * Math.sin((rotate + percentage * 3.6) * Math.PI / 180)}%)`
                          }}
                        ></div>
                      )
                    })}
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-bold text-gray-900">${totalSpending.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Breakdown by Category</h3>
              <div className="space-y-4">
                {categoryData.map(category => (
                  <div key={category.category} className="flex items-center">
                    <div className={`w-4 h-4 rounded-sm ${category.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700 flex-1">{category.category}</span>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900 mr-4">
                        ${category.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {((category.amount / totalSpending) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="text-[#1F3A93] text-sm font-medium flex items-center hover:underline">
                  View detailed breakdown
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'income' && (
          <div className="text-center py-12 text-gray-500">
            {getReportIcon('income')}
            <p className="text-lg">Income Analysis report coming soon</p>
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div className="text-center py-12 text-gray-500">
            {getReportIcon('trends')}
            <p className="text-lg">Spending Trends report coming soon</p>
          </div>
        )}
        
        {activeTab === 'tax' && (
          <div className="text-center py-12 text-gray-500">
            {getReportIcon('tax')}
            <p className="text-lg">Tax report coming soon</p>
          </div>
        )}
      </div>
      
      {/* Report Settings */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Report Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
            <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent">
              <option>Pie Chart</option>
              <option>Bar Chart</option>
              <option>Line Chart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
            <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent">
              <option>Category</option>
              <option>Merchant</option>
              <option>Account</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>Last 6 months</option>
              <option>Year to date</option>
              <option>Last year</option>
              <option>Custom...</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include Categories</label>
            <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent">
              <option>All Categories</option>
              <option>Custom Selection...</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
} 