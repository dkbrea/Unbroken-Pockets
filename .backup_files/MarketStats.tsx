'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, Info } from 'lucide-react'
import axios from 'axios'
import MarketStatsLoading from './MarketStatsLoading'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MarketStatsProps {
  symbols?: string[]
  includeUserHoldings?: boolean
  updateHoldings?: boolean
}

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  userAvgPrice: number | null;
  userShares: number;
  userValue: number;
  isUserHolding: boolean;
  success: boolean;
  error?: string;
}

export default function MarketStats({ 
  symbols = ['SPY', 'QQQ', 'DIA'], 
  includeUserHoldings = true,
  updateHoldings = true
}: MarketStatsProps) {
  const [marketData, setMarketData] = useState<QuoteData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const fetchMarketData = async () => {
    try {
      setIsRefreshing(true)
      
      // Build the comma-separated list of symbols
      const symbolsParam = symbols.join(',')
      
      // Fetch data from our API route, including user holdings if requested
      const response = await axios.get(`/api/market-data?symbols=${encodeURIComponent(symbolsParam)}&includeUserHoldings=${includeUserHoldings}&updateHoldings=${updateHoldings}`)
      
      if (response.data.success) {
        setMarketData(response.data.data)
        setLastUpdated(response.data.timestamp)
        setError(null)
      } else {
        throw new Error(response.data.error || 'Failed to fetch market data')
      }
    } catch (err: any) {
      console.error('Error fetching market data:', err)
      setError(`Failed to fetch market data: ${err.message || 'Unknown error'}`)
      
      // If we have no data, set some placeholder values
      if (marketData.length === 0) {
        setMarketData(symbols.map(symbol => ({
          symbol,
          name: symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          userAvgPrice: null,
          userShares: 0,
          userValue: 0,
          isUserHolding: false,
          success: false
        })))
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }
  
  // Fetch data on mount and set up interval
  useEffect(() => {
    fetchMarketData()
    
    // No automatic refresh
    return () => {}
  }, [symbols.join(','), includeUserHoldings, updateHoldings])  // Use string join to avoid infinite loops
  
  // Format the timestamp for display
  const formattedTimestamp = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString()
    : 'Not available'
  
  if (isLoading) {
    return <MarketStatsLoading symbolCount={symbols.length} />
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Market Overview</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchMarketData}
            disabled={isRefreshing}
            className="flex items-center text-gray-600 text-xs bg-gray-100 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-200"
          >
            <RefreshCw className={`h-3 w-3 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Market Data'}</span>
          </button>
          
          <div className="text-xs text-gray-500">
            Last updated: {formattedTimestamp}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="flex items-center text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded mb-4">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {marketData.map(quote => {
          const isPositive = quote.changePercent >= 0
          
          return (
            <div key={quote.symbol} className="flex flex-col">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">{quote.name}</span>
                {quote.isUserHolding && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1">
                          <Info className="h-3 w-3 text-blue-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your avg price: ${quote.userAvgPrice?.toFixed(2)}</p>
                        <p>Shares: {quote.userShares}</p>
                        <p>Value: ${quote.userValue.toFixed(2)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-lg font-semibold">${quote.price.toFixed(2)}</span>
                <div className={`ml-2 flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  <span className="text-sm">
                    {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              {quote.isUserHolding && quote.userAvgPrice && (
                <div className="text-xs mt-1 text-gray-500">
                  Based on your avg price: ${quote.userAvgPrice.toFixed(2)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 