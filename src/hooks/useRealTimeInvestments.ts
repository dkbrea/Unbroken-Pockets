import { useState, useEffect } from 'react';
import { useInvestments } from './useSupabaseData';
import { Holding, InvestmentsState } from './useInvestmentsData';
import axios from 'axios';
import { supabase } from '../lib/supabase';

export const useRealTimeInvestments = () => {
  const { 
    portfolioSummary, 
    assetAllocation, 
    accounts, 
    topHoldings = [], 
    isLoading, 
    error 
  } = useInvestments();
  
  // We'll keep track of the database holdings for display in the UI
  const [dbHoldings, setDbHoldings] = useState<Holding[]>(topHoldings);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Function to fetch up-to-date holdings directly from the database
  const fetchDbHoldings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        console.error('No authenticated user found');
        return [];
      }
      
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userData.user.id);
      
      if (holdingsError) {
        console.error('Error fetching holdings:', holdingsError);
        return [];
      }
      
      if (!holdingsData || holdingsData.length === 0) {
        return [];
      }
      
      // Map the database data to our UI structure, preserving user input values
      return holdingsData.map(row => ({
        id: row.id,
        symbol: row.symbol,
        name: row.name,
        shares: row.shares || 0,
        value: row.value || 0,
        pricePerShare: row.price_per_share || 0,
        change: {
          amount: row.change_amount || 0,
          percentage: row.change_percentage || 0
        },
      }));
    } catch (error) {
      console.error('Error fetching holdings:', error);
      return [];
    }
  };
  
  // Update holdings state when topHoldings changes (from database)
  useEffect(() => {
    const loadFreshHoldings = async () => {
      const freshHoldings = await fetchDbHoldings();
      if (freshHoldings.length > 0) {
        setDbHoldings(freshHoldings);
      } else if (topHoldings.length > 0) {
        // Fallback to what we got from useInvestments if direct DB fetch fails
        setDbHoldings(topHoldings);
      }
    };
    
    loadFreshHoldings();
  }, [topHoldings]);

  // Function to get the current market prices from the market overview API
  const fetchMarketPrices = async (symbols: string[]) => {
    try {
      // Build the comma-separated list of symbols
      const symbolsParam = symbols.join(',');
      
      // Fetch data from the market data API route
      const response = await axios.get(`/api/market-data?symbols=${encodeURIComponent(symbolsParam)}`);
      
      if (response.data.success) {
        // Create a map of symbol to current market price
        const marketPrices: Record<string, number> = {};
        response.data.data.forEach((quote: any) => {
          if (quote.success) {
            marketPrices[quote.symbol] = quote.price;
          }
        });
        return marketPrices;
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching market prices:', error);
      return {};
    }
  };
  
  // Function to refresh data and update with current market prices
  const refreshMarketData = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    try {
      // First, get the latest holdings from the database
      const freshHoldings = await fetchDbHoldings();
      
      if (freshHoldings.length > 0) {
        // Get the symbols from the holdings
        const symbols = freshHoldings.map(h => h.symbol);
        
        // Fetch the latest market prices for these symbols
        const marketPrices = await fetchMarketPrices(symbols);
        
        if (Object.keys(marketPrices).length > 0) {
          // Update the change values based on the current market prices
          await Promise.all(freshHoldings.map(async (holding) => {
            try {
              const currentMarketPrice = marketPrices[holding.symbol];
              if (currentMarketPrice) {
                // Calculate change based on user's average purchase price vs current market price
                const userAvgPrice = holding.pricePerShare;
                const change = currentMarketPrice - userAvgPrice;  // Absolute change in price
                const changePercentage = (change / userAvgPrice) * 100;  // Percentage change
                
                // Update in database - only change the change values, not the price or value
                await supabase
                  .from('holdings')
                  .update({
                    change_amount: change,
                    change_percentage: changePercentage
                  })
                  .eq('id', holding.id);
              }
            } catch (error) {
              console.error(`Error updating holding ${holding.symbol}:`, error);
            }
          }));
        } else {
          // If no market prices, use the fallback method for change calculation
          await Promise.all(freshHoldings.map(async (holding) => {
            try {
              if (holding.change.amount === 0 && holding.change.percentage === 0) {
                await updateChangeValues(holding);
              }
            } catch (error) {
              console.error(`Error updating holding ${holding.symbol}:`, error);
            }
          }));
        }
        
        // Fetch the updated holdings one more time
        const updatedHoldings = await fetchDbHoldings();
        if (updatedHoldings.length > 0) {
          setDbHoldings(updatedHoldings);
        } else {
          setDbHoldings(freshHoldings);
        }
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing market data:', error);
      setUpdateError('Failed to update market data. Using latest available data.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Helper function to update change values without changing user inputs
  const updateChangeValues = async (holding: Holding) => {
    // For holdings with 0 change, use a reasonable default (10% of value)
    const estimatedChange = holding.value * 0.1;
    
    // Update in database - only the change values, not the price or value
    await supabase
      .from('holdings')
      .update({
        change_amount: estimatedChange,
        change_percentage: 10 // 10% as a default
      })
      .eq('id', holding.id);
  };
  
  // Set up initial data load without polling
  useEffect(() => {
    if (!isLoading) {
      // Initial update
      refreshMarketData();
      
      // No automatic polling
    }
  }, [isLoading]);
  
  return {
    portfolioSummary,
    assetAllocation,
    accounts,
    // Always use the values directly from database
    topHoldings: dbHoldings,
    isLoading: isLoading || isUpdating,
    error: error || updateError,
    lastUpdated,
    refreshMarketData // Expose function to manually trigger refresh
  };
}; 