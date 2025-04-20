import axios from 'axios';
import { PerformanceData, Holding } from '../hooks/useInvestmentsData';

// Yahoo Finance quote result interface
export interface QuoteResult {
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  shortName?: string;
  longName?: string;
  symbol: string;
  [key: string]: any; // For any other properties returned by Yahoo Finance
}

// Retrieve the API key from environment variables
export const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// Yahoo Finance instance
let yahooFinance: any = null;

// Initialize Yahoo Finance - this needs to be done using dynamic import for browser compatibility
async function initYahooFinance() {
  try {
    if (typeof window === 'undefined') {
      // Server-side execution
      const module = await import('yahoo-finance2');
      yahooFinance = module.default;
      console.log('Yahoo Finance initialized successfully (server-side)');
    } else {
      // Browser execution - yahoo-finance2 is not fully browser compatible
      // To make it work in browser, we'd need additional configuration
      console.warn('Yahoo Finance may not work in browser environment - using mock data');
      yahooFinance = null;
    }
  } catch (error) {
    console.warn('Failed to initialize Yahoo Finance:', error);
    yahooFinance = null;
  }
}

// Initialize right away
initYahooFinance();

// Interface for quote data (keeping the same interface to maintain compatibility)
export interface QuoteData {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

// Get quote data from Yahoo Finance or fall back to mock data
export const getQuote = async (symbol: string): Promise<QuoteData> => {
  try {
    // Check if Yahoo Finance is available
    if (yahooFinance) {
      try {
        console.log(`Fetching real quote data for ${symbol}`);
        const result = await yahooFinance.quote(symbol) as QuoteResult;
        
        // Map Yahoo Finance response to our interface
        return {
          c: result.regularMarketPrice,
          d: result.regularMarketChange,
          dp: result.regularMarketChangePercent,
          h: result.regularMarketDayHigh ?? 0,
          l: result.regularMarketDayLow ?? 0,
          o: result.regularMarketOpen ?? 0,
          pc: result.regularMarketPreviousClose ?? 0
        };
      } catch (error) {
        console.warn(`Yahoo Finance API error for ${symbol}:`, error);
        console.warn('Falling back to mock data');
      }
    } else {
      console.log(`Using mock data for ${symbol} (Yahoo Finance not available)`);
    }
    
    // Fall back to mock data if Yahoo Finance is not available or returns an error
    return getMockQuoteData(symbol);
  } catch (error) {
    console.error(`Error getting quote for ${symbol}:`, error);
    return getMockQuoteData(symbol);
  }
};

// Generate realistic mock data
const getMockQuoteData = (symbol: string): QuoteData => {
  // Create deterministic but somewhat random values based on symbol
  const symbolHash = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seed = symbolHash / 100;
  
  // Base price between $50 and $500
  const basePrice = 50 + (seed % 450);
  
  // Change between -5% and +5%
  const changePercent = (((seed * 31) % 10) - 5);
  const change = basePrice * (changePercent / 100);

  return {
    c: parseFloat(basePrice.toFixed(2)),
    d: parseFloat(change.toFixed(2)),
    dp: parseFloat(changePercent.toFixed(2)),
    h: parseFloat((basePrice * 1.02).toFixed(2)),
    l: parseFloat((basePrice * 0.98).toFixed(2)),
    o: parseFloat((basePrice * 0.99).toFixed(2)),
    pc: parseFloat((basePrice - change).toFixed(2))
  };
};

// Update a single holding with reasonable change values but PRESERVE user input values
export const updateHoldingWithRealTimeData = async (holding: Holding): Promise<Holding> => {
  try {
    // Get current market data for the symbol
    if (yahooFinance && holding.symbol) {
      try {
        const result = await yahooFinance.quote(holding.symbol) as QuoteResult;
        const currentPrice = result.regularMarketPrice;
        
        // Calculate the change based on user's average purchase price
        const userAvgPrice = holding.pricePerShare;
        const change = currentPrice - userAvgPrice;
        const changePercentage = (change / userAvgPrice) * 100;
        
        return {
          ...holding,
          change: {
            amount: change,
            percentage: changePercentage
          }
        };
      } catch (error) {
        console.warn(`Error fetching current market data for ${holding.symbol}:`, error);
        // Fall back to default if market data fetch fails
      }
    }
    
    // If we can't get market data or there's an error, use existing values or defaults
    if (holding.change.amount === 0 && holding.change.percentage === 0) {
      // Use 10% of the user's value as a default change
      const estimatedChange = holding.value * 0.1;
      const percentageChange = 10;
      
      return {
        ...holding,
        change: {
          amount: estimatedChange,
          percentage: percentageChange
        }
      };
    }
    
    // Otherwise, keep the holding as is
    return holding;
  } catch (error) {
    console.error(`Error updating holding ${holding.symbol}:`, error);
    return holding;
  }
};

// Update all holdings with real-time data
export const updateHoldingsWithRealTimeData = async (holdings: Holding[]): Promise<Holding[]> => {
  try {
    // Process each holding to ensure it has reasonable change values
    const updatedHoldings = await Promise.all(
      holdings.map(holding => updateHoldingWithRealTimeData(holding))
    );
    
    return updatedHoldings;
  } catch (error) {
    console.error('Error updating holdings:', error);
    return holdings;
  }
};

// Set up data streaming (simplified since Yahoo Finance doesn't have WebSockets in the library)
export const setupRealtimeUpdates = (symbols: string[], onUpdate: (data: any) => void) => {
  // Set up polling instead of WebSockets
  const intervalId = setInterval(async () => {
    for (const symbol of symbols) {
      try {
        const data = await getQuote(symbol);
        onUpdate({
          symbol: symbol,
          data: [{
            p: data.c,
            t: Math.floor(Date.now() / 1000),
            s: symbol,
            v: Math.floor(Math.random() * 1000)
          }],
          type: 'trade'
        });
      } catch (error) {
        console.error(`Error in polling update for ${symbol}:`, error);
      }
    }
  }, 5000); // Poll every 5 seconds
  
  // Return function to clean up
  return () => {
    clearInterval(intervalId);
  };
}; 