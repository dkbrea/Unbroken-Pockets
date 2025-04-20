import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic

// Map of symbols to friendly names
const symbolNames: Record<string, string> = {
  'SPY': 'S&P 500',
  'QQQ': 'NASDAQ',
  'DIA': 'Dow Jones',
  'IWM': 'Russell 2000',
  'VEU': 'FTSE All-World ex-US',
  'AAPL': 'AAPL',
  'TSLA': 'TSLA',
  'NVDA': 'NVDA',
  'MSFT': 'MSFT',
  'AMZN': 'AMZN',
  'GOOGL': 'GOOGL',
  'META': 'META',
};

// Define interfaces for our data types
interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  shares: number;
  price_per_share: number;
  value: number;
  change_amount?: number;
  change_percentage?: number;
  // Additional properties for market data
  current_market_price?: number;
  market_value?: number;
  market_change?: number;
  market_change_percentage?: number;
  value_change?: number;
}

interface MarketPrices {
  [symbol: string]: number;
}

// Interface for Yahoo Finance quote results
interface QuoteResult {
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  [key: string]: any; // For any other properties returned by Yahoo Finance
}

// Function to get user holdings from the database
async function getUserHoldings() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      return [];
    }
    
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error('Error fetching holdings:', error);
      return [];
    }
    
    return holdings || [];
  } catch (error) {
    console.error('Error getting user holdings:', error);
    return [];
  }
}

// Function to update holdings with the current market prices and calculate changes
async function updateHoldingsWithMarketData(holdings: Holding[], marketPrices: MarketPrices) {
  try {
    const updatedHoldings: Holding[] = [];
    
    for (const holding of holdings) {
      const currentMarketPrice = marketPrices[holding.symbol];
      if (!currentMarketPrice) continue;
      
      // Calculate changes based on user's average purchase price vs current market price
      // This shows the true performance of the holding since purchase
      const userAvgPrice = holding.price_per_share;
      const change = currentMarketPrice - userAvgPrice;  // Absolute change in price
      const changePercentage = (change / userAvgPrice) * 100;  // Percentage change since purchase
      
      // Calculate new value based on current market price
      const newValue = holding.shares * currentMarketPrice;
      const valueChange = newValue - holding.value;
      
      const updatedHolding = {
        ...holding,
        current_market_price: currentMarketPrice,
        market_value: newValue,
        market_change: change,
        market_change_percentage: changePercentage,
        value_change: valueChange
      };
      
      updatedHoldings.push(updatedHolding);
      
      // Update the holding in the database with calculated values based on market data
      // This ensures that the change values reflect the actual performance vs purchase price
      await supabase
        .from('holdings')
        .update({
          change_amount: change,
          change_percentage: changePercentage
        })
        .eq('id', holding.id);
    }
    
    return updatedHoldings;
  } catch (error) {
    console.error('Error updating holdings with market data:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // Get symbols from the query string
    const { searchParams } = new URL(request.url);
    let symbols = searchParams.get('symbols');
    const includeUserHoldings = searchParams.get('includeUserHoldings') === 'true';
    const updateHoldings = searchParams.get('updateHoldings') === 'true';

    // Default symbols if none are provided
    const symbolsArray = symbols 
      ? symbols.split(',').map(s => s.trim().toUpperCase())
      : ['SPY', 'QQQ', 'DIA'];

    // Get user holdings if requested
    let userHoldings: Holding[] = [];
    if (includeUserHoldings || updateHoldings) {
      userHoldings = await getUserHoldings();
      
      // Add user holding symbols to the symbols array if they're not already included
      userHoldings.forEach((holding: Holding) => {
        if (holding.symbol && !symbolsArray.includes(holding.symbol)) {
          symbolsArray.push(holding.symbol);
        }
      });
    }

    // Create a map of holdings by symbol for quick lookup
    const holdingsMap = userHoldings.reduce((map: Record<string, Holding>, holding: Holding) => {
      map[holding.symbol] = holding;
      return map;
    }, {});
    
    // Create a map to store current market prices for all symbols
    const marketPrices: MarketPrices = {};

    // Fetch quotes for each symbol
    const quotes = await Promise.all(
      symbolsArray.map(async (symbol) => {
        try {
          const result = await yahooFinance.quote(symbol) as QuoteResult;
          const currentPrice = result.regularMarketPrice;
          
          // Store the current market price for this symbol
          marketPrices[symbol] = currentPrice;
          
          // Get the user's holding for this symbol if it exists
          const userHolding = holdingsMap[symbol];
          
          // If we have user holding data, calculate change based on user's purchase price
          let change, changePercent;
          if (userHolding && userHolding.price_per_share) {
            // Calculate change based on user's average price
            const userAvgPrice = userHolding.price_per_share;
            change = currentPrice - userAvgPrice;
            changePercent = (change / userAvgPrice) * 100;
          } else {
            // Use market data if no user holding
            change = result.regularMarketChange;
            changePercent = result.regularMarketChangePercent;
          }
          
          return {
            symbol,
            name: symbolNames[symbol] || symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            dayHigh: result.regularMarketDayHigh,
            dayLow: result.regularMarketDayLow,
            open: result.regularMarketOpen,
            previousClose: result.regularMarketPreviousClose,
            // Include user-specific data if available
            userAvgPrice: userHolding?.price_per_share || null,
            userShares: userHolding?.shares || 0,
            userValue: userHolding?.value || 0,
            isUserHolding: !!userHolding,
            success: true
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          // Return a placeholder with error flag
          return {
            symbol,
            name: symbolNames[symbol] || symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            dayHigh: 0,
            dayLow: 0,
            open: 0, 
            previousClose: 0,
            userAvgPrice: null,
            userShares: 0,
            userValue: 0,
            isUserHolding: false,
            success: false,
            error: (error as Error).message
          };
        }
      })
    );
    
    // If updateHoldings is true, update the holdings with current market prices
    let updatedHoldings: Holding[] = [];
    if (updateHoldings && Object.keys(marketPrices).length > 0) {
      updatedHoldings = await updateHoldingsWithMarketData(userHoldings, marketPrices);
    }

    // Return the data as JSON
    return NextResponse.json({
      success: true,
      data: quotes,
      updatedHoldings: updateHoldings ? updatedHoldings : [],
      timestamp: new Date().toISOString(),
      hasUserData: includeUserHoldings,
      holdingsUpdated: updateHoldings
    });
  } catch (error) {
    console.error('Error in market data API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 