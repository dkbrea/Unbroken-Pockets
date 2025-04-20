import yahooFinance from 'yahoo-finance2';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ServerMarketStatsProps {
  symbols?: string[];
}

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Interface for Yahoo Finance quote results
interface QuoteResult {
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  [key: string]: any; // For any other properties returned by Yahoo Finance
}

// Map of symbols to friendly names
const symbolNames: Record<string, string> = {
  'SPY': 'S&P 500',
  'QQQ': 'NASDAQ',
  'DIA': 'Dow Jones',
  'IWM': 'Russell 2000',
  'VEU': 'FTSE All-World ex-US',
  // Add any user holdings here with neutral names to avoid conflict
  'AAPL': 'AAPL',
  'TSLA': 'TSLA',
  'NVDA': 'NVDA',
  'MSFT': 'MSFT',
  'AMZN': 'AMZN',
  'GOOGL': 'GOOGL',
  'META': 'META',
};

async function getQuotes(symbols: string[]): Promise<QuoteData[]> {
  try {
    const quotes: QuoteData[] = [];
    
    for (const symbol of symbols) {
      try {
        const result = await yahooFinance.quote(symbol) as QuoteResult;
        quotes.push({
          symbol,
          name: symbolNames[symbol] || symbol,
          price: result.regularMarketPrice,
          change: result.regularMarketChange,
          changePercent: result.regularMarketChangePercent
        });
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        // Use placeholders for failed fetches
        quotes.push({
          symbol,
          name: symbolNames[symbol] || symbol,
          price: 0,
          change: 0,
          changePercent: 0
        });
      }
    }
    
    return quotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

export default async function ServerMarketStats({ symbols = ['SPY', 'QQQ', 'DIA'] }: ServerMarketStatsProps) {
  const quotes = await getQuotes(symbols);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Market Overview</h2>
        <div className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">
          <span>Live data</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {quotes.length === 0 ? (
          // Fallback when no data is available
          [...Array(symbols.length)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : (
          // Real data
          quotes.map(quote => {
            const isPositive = quote.changePercent >= 0;
            
            return (
              <div key={quote.symbol} className="flex flex-col">
                <span className="text-sm text-gray-500">{quote.name}</span>
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 