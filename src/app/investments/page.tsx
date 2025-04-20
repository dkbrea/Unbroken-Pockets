'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart2,
  Calendar, 
  ChevronDown, 
  Plus,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  Edit
} from 'lucide-react'
import { TimeRange, Holding } from '@/hooks/useInvestmentsData'
import { useRealTimeInvestments } from '@/hooks/useRealTimeInvestments'
import AddInvestmentAccountModal from '@/components/features/AddInvestmentAccountModal'
import AddHoldingModal from '@/components/features/AddHoldingModal'
import EditHoldingModal from '@/components/features/EditHoldingModal'
import EditAccountModal from '@/components/features/EditAccountModal'
import MarketStats from '@/components/features/MarketStats'
import ServerMarketStats from '@/components/features/ServerMarketStats'
import { supabase } from '@/lib/supabase'
import { synchronizeAllHoldings } from '@/lib/synchronizeHoldings'
import DeleteHoldingModal from '@/components/features/DeleteHoldingModal'
import DeleteAccountModal from '@/components/features/DeleteAccountModal'

export default function Investments() {
  const [hideBalances, setHideBalances] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')
  const { 
    portfolioSummary = {
      totalValue: 0,
      change: { amount: 0, percentage: 0 },
      timeRangePerformance: {
        '1D': { amount: 0, percentage: 0 },
        '1W': { amount: 0, percentage: 0 },
        '1M': { amount: 0, percentage: 0 },
        '1Y': { amount: 0, percentage: 0 },
        'All': { amount: 0, percentage: 0 }
      }
    }, 
    assetAllocation = [], 
    accounts = [], 
    topHoldings = [], 
    isLoading, 
    error,
    lastUpdated,
    refreshMarketData
  } = useRealTimeInvestments()
  
  // Get current performance based on selected time range
  const currentPerformance = portfolioSummary.timeRangePerformance[timeRange]
  
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [showAddHoldingModal, setShowAddHoldingModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showEditHoldingModal, setShowEditHoldingModal] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)
  const [showDeleteHoldingModal, setShowDeleteHoldingModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [holdingToDelete, setHoldingToDelete] = useState<Holding | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<any | null>(null)
  const [showEditAccountModal, setShowEditAccountModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null)
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Trigger real-time data refresh
      await refreshMarketData()
      
      // Wait a bit for visual feedback
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    } catch (error) {
      console.error('Error refreshing data:', error)
      setIsRefreshing(false)
    }
  }
  
  const handleRefreshHolding = async (holdingId: string | number) => {
    setIsRefreshing(true)
    try {
      // Trigger real-time data refresh
      await refreshMarketData()
      
      // Wait a bit for visual feedback
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    } catch (error) {
      console.error('Error refreshing data:', error)
      setIsRefreshing(false)
    }
  }
  
  const handleSynchronizeHoldings = async () => {
    if (!supabase) return;
    
    try {
      setIsRefreshing(true);
      
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        console.error('No authenticated user found');
        return;
      }
      
      await synchronizeAllHoldings(data.user.id);
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error synchronizing holdings:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleEditAccount = (account: any) => {
    setSelectedAccount(account)
    setShowEditAccountModal(true)
  }
  
  const handleDeleteAccount = (account: any) => {
    setAccountToDelete(account)
    setShowDeleteAccountModal(true)
  }
  
  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return
    
    try {
      const { error } = await supabase
        .from('investment_accounts')
        .delete()
        .eq('id', accountToDelete.id)
      
      if (error) throw error
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }
  
  const handleDeleteHolding = (holding: Holding) => {
    setHoldingToDelete(holding)
    setShowDeleteHoldingModal(true)
  }
  
  const confirmDeleteHolding = async () => {
    if (!holdingToDelete) return
    
    try {
      const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', holdingToDelete.id)
      
      if (error) throw error
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error deleting holding:', error)
    }
  }

  const handleEditHolding = (holding: Holding) => {
    setSelectedHolding(holding)
    setShowEditHoldingModal(true)
  }

  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? new Intl.DateTimeFormat('en-US', { 
        dateStyle: 'medium',
        timeStyle: 'medium'
      }).format(lastUpdated)
    : 'Not yet updated';

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Investments</h1>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <div className="relative">
            <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A]">
              <Calendar className="mr-2 h-4 w-4 text-[#4A4A4A]" />
              <div>
                <div className="text-[#4A4A4A]">Last Updated</div>
                <div className={`text-xs ${lastUpdated ? 'text-green-600' : 'text-gray-500'}`}>
                  {formattedLastUpdated}
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5] disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 text-[#4A4A4A] ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : isLoading ? 'Loading...' : 'Refresh Prices'}
          </button>
          
          <button 
            onClick={handleSynchronizeHoldings}
            disabled={isRefreshing || isLoading}
            className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F5F5F5] disabled:opacity-50"
          >
            {isRefreshing ? 'Syncing...' : 'Fix Holdings Data'}
          </button>
          
          <button 
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center bg-[#1F3A93] rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#172d70]"
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Add Account
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>An error occurred while loading your investment data. Please try refreshing the page.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex items-center">
        <RefreshCw className="h-4 w-4 mr-2 text-blue-600" />
        <p>Market data must be refreshed manually. Use the refresh buttons to get the latest prices.</p>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-[#1F3A93] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading investment data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Market Overview */}
          <MarketStats 
            symbols={topHoldings.length > 0 
              ? ['SPY', ...topHoldings.slice(0, 5).map(h => h.symbol)]
              : ['SPY', 'QQQ', 'DIA', 'IWM', 'VEU']
            } 
            updateHoldings={true}
          />
          
          {/* Portfolio Summary */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800">Portfolio Summary</h2>
              <button 
                onClick={() => setHideBalances(!hideBalances)}
                className="text-gray-500 hover:text-[#1F3A93]"
              >
                {hideBalances ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Total Portfolio Value</p>
                  <div className="flex items-end">
                    <p className="text-3xl font-bold text-gray-900">
                      {hideBalances ? '•••••••' : `$${portfolioSummary.totalValue.toLocaleString()}`}
                    </p>
                    <div className={`ml-4 flex items-center px-2 py-1 rounded-md ${
                      portfolioSummary.change.percentage >= 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {portfolioSummary.change.percentage >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        portfolioSummary.change.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {portfolioSummary.change.percentage >= 0 ? '+' : ''}
                        {hideBalances ? '•••' : `$${portfolioSummary.change.amount.toLocaleString()}`} ({portfolioSummary.change.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  {(['1D', '1W', '1M', '1Y', 'All'] as TimeRange[]).map(range => (
                    <button
                      key={range}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        timeRange === range 
                        ? 'bg-[#1F3A93] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{timeRange} Performance</p>
                  <div className="flex items-center">
                    <span className={`text-lg font-medium ${
                      currentPerformance.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentPerformance.percentage >= 0 ? '+' : ''}
                      {hideBalances ? '•••' : `$${currentPerformance.amount.toLocaleString()}`} ({currentPerformance.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Asset Allocation</p>
                <div className="flex items-center space-x-6">
                  <div className="relative h-32 w-32">
                    {/* Simple pie chart */}
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      {assetAllocation.map((asset, index) => {
                        const previousPercentages = assetAllocation
                          .slice(0, index)
                          .reduce((acc, curr) => acc + curr.percentage, 0)
                        const startAngle = (previousPercentages / 100) * 360
                        const endAngle = startAngle + (asset.percentage / 100) * 360
                        
                        // Calculate the SVG path for the pie slice
                        const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180))
                        const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180))
                        const endX = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180))
                        const endY = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180))
                        
                        const largeArcFlag = asset.percentage > 50 ? 1 : 0
                        
                        // Map color classes to actual color values
                        const colorMap = {
                          'bg-blue-500': '#3B82F6',
                          'bg-green-500': '#10B981',
                          'bg-purple-500': '#8B5CF6',
                          'bg-yellow-500': '#F59E0B',
                          'bg-red-500': '#EF4444'
                        }
                        
                        // Get the fill color from the map or use a default
                        const fillColor = colorMap[asset.color as keyof typeof colorMap] || '#3B82F6'
                        
                        return (
                          <path
                            key={asset.name}
                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                            fill={fillColor}
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                        )
                      })}
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    {assetAllocation.map(asset => {
                      // Map color classes to actual color values
                      const colorMap = {
                        'bg-blue-500': '#3B82F6',
                        'bg-green-500': '#10B981',
                        'bg-purple-500': '#8B5CF6',
                        'bg-yellow-500': '#F59E0B',
                        'bg-red-500': '#EF4444'
                      }
                      
                      // Get the fill color from the map or use a default
                      const backgroundColor = colorMap[asset.color as keyof typeof colorMap] || '#3B82F6'
                      
                      return (
                        <div key={asset.name} className="flex items-center">
                          <div style={{ backgroundColor }} className="w-3 h-3 rounded-sm mr-2"></div>
                          <span className="text-xs text-gray-600">{asset.name}</span>
                          <span className="text-xs font-medium text-gray-800 ml-2">{asset.percentage}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Accounts */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Investment Accounts</h2>
              <button 
                onClick={() => setShowAddAccountModal(true)}
                className="text-[#1F3A93] text-sm font-medium hover:underline flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Account
              </button>
            </div>
            
            {accounts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#1F3A93]/10 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-[#1F3A93]" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No investment accounts</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                  Add your investment accounts to track your portfolio balance and performance.
                </p>
                <button
                  onClick={() => setShowAddAccountModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F3A93] hover:bg-[#172d70]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Change</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accounts.map(account => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{account.name}</div>
                              <div className="text-xs text-gray-500">{account.institution}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {account.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {hideBalances ? '•••••••' : `$${account.balance.toLocaleString()}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`flex items-center justify-end text-sm font-medium ${
                            account.change.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {account.change.percentage >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {account.change.percentage >= 0 ? '+' : ''}
                            {hideBalances ? '•••' : `$${account.change.amount.toLocaleString()}`} ({account.change.percentage}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEditAccount(account)}
                            className="text-[#1F3A93] hover:text-[#172d70] mr-4"
                            title="Edit account"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAccount(account)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Holdings */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Top Holdings</h2>
              <button 
                onClick={() => setShowAddHoldingModal(true)}
                className="text-[#1F3A93] text-sm font-medium hover:underline flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Holding
              </button>
            </div>
            
            {topHoldings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#1F3A93]/10 flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-[#1F3A93]" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No holdings added yet</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                  Add stocks, ETFs, and other securities to start tracking your investment performance.
                </p>
                <button
                  onClick={() => setShowAddHoldingModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F3A93] hover:bg-[#172d70]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Holding
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topHoldings.map(holding => (
                      <tr key={holding.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#1F3A93]">{holding.symbol}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{holding.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {hideBalances ? '•••••••' : `$${holding.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">{holding.shares.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">${holding.pricePerShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`flex items-center justify-end text-sm font-medium ${
                            holding.change.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {holding.change.percentage >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {holding.change.percentage >= 0 ? '+' : ''}
                            {(holding.change.percentage || 0).toFixed(2)}%
                            <button 
                              onClick={() => handleRefreshHolding(holding.id)}
                              title="Refresh changes based on current market prices"
                              className="ml-2 text-gray-400 hover:text-[#1F3A93] focus:outline-none"
                              disabled={isRefreshing}
                            >
                              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEditHolding(holding)}
                            className="text-[#1F3A93] hover:text-[#172d70] mr-4"
                            title="Edit holding"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteHolding(holding)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete holding"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Modals */}
          <AddInvestmentAccountModal
            isOpen={showAddAccountModal}
            onClose={() => setShowAddAccountModal(false)}
            onAccountAdded={() => window.location.reload()}
          />
          
          <AddHoldingModal
            isOpen={showAddHoldingModal}
            onClose={() => setShowAddHoldingModal(false)}
            onHoldingAdded={() => window.location.reload()}
          />
          
          {selectedHolding && (
            <EditHoldingModal
              isOpen={showEditHoldingModal}
              onClose={() => setShowEditHoldingModal(false)}
              onHoldingUpdated={() => window.location.reload()}
              holding={selectedHolding}
            />
          )}
          
          {selectedAccount && (
            <EditAccountModal
              isOpen={showEditAccountModal}
              onClose={() => setShowEditAccountModal(false)}
              onAccountUpdated={() => window.location.reload()}
              account={selectedAccount}
            />
          )}
          
          {holdingToDelete && (
            <DeleteHoldingModal
              isOpen={showDeleteHoldingModal}
              onClose={() => setShowDeleteHoldingModal(false)}
              onConfirm={confirmDeleteHolding}
              holdingName={holdingToDelete.name}
              holdingSymbol={holdingToDelete.symbol}
            />
          )}
          
          {accountToDelete && (
            <DeleteAccountModal
              isOpen={showDeleteAccountModal}
              onClose={() => setShowDeleteAccountModal(false)}
              onConfirm={confirmDeleteAccount}
              accountName={accountToDelete.name}
              institutionName={accountToDelete.institution}
            />
          )}
        </>
      )}
    </div>
  )
} 