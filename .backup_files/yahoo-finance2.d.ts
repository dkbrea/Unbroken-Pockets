declare module 'yahoo-finance2' {
  interface QuoteResponse {
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketOpen: number;
    regularMarketPreviousClose: number;
    symbol: string;
    shortName?: string;
    longName?: string;
    marketCap?: number;
    volume?: number;
    [key: string]: any;
  }

  function quote(symbol: string): Promise<QuoteResponse>;
  function search(query: string): Promise<any>;
  function historical(symbol: string, options?: any): Promise<any>;

  // CommonJS module pattern
  const yahooFinance: {
    quote: typeof quote;
    search: typeof search;
    historical: typeof historical;
  };
  
  export = yahooFinance;
} 