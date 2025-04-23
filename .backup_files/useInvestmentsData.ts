import { useState, useMemo } from 'react';

export type TimeRange = '1D' | '1W' | '1M' | '1Y' | 'All';

export type PerformanceData = {
  amount: number;
  percentage: number;
};

export type PortfolioSummary = {
  totalValue: number;
  change: {
    amount: number;
    percentage: number;
  };
  timeRangePerformance: Record<TimeRange, PerformanceData>;
};

export type AssetAllocation = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type Account = {
  id: number;
  name: string;
  institution: string;
  balance: number;
  change: {
    amount: number;
    percentage: number;
  };
  type: string;
  lastUpdated: string;
};

export type Holding = {
  id: number;
  symbol: string;
  name: string;
  value: number;
  shares: number;
  pricePerShare: number;
  change: {
    amount: number;
    percentage: number;
  };
};

export type InvestmentsState = {
  timeRange: TimeRange;
  hideBalances: boolean;
  portfolioSummary: PortfolioSummary;
  assetAllocation: AssetAllocation[];
  accounts: Account[];
  topHoldings: Holding[];
  currentPerformance: PerformanceData;
  setTimeRange: (range: TimeRange) => void;
  setHideBalances: (hide: boolean) => void;
};

export function useInvestmentsData(): InvestmentsState {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [hideBalances, setHideBalances] = useState(false);
  
  // Demo investment data
  const portfolioSummary: PortfolioSummary = {
    totalValue: 325750.82,
    change: {
      amount: 2145.32,
      percentage: 0.66
    },
    timeRangePerformance: {
      '1D': { amount: 215.43, percentage: 0.07 },
      '1W': { amount: 890.21, percentage: 0.28 },
      '1M': { amount: 1530.45, percentage: 0.47 },
      '1Y': { amount: 42350.87, percentage: 14.94 },
      'All': { amount: 125750.82, percentage: 62.88 }
    }
  };
  
  // Asset allocation
  const assetAllocation: AssetAllocation[] = [
    { name: 'US Stocks', value: 182420.46, percentage: 56, color: 'bg-blue-500' },
    { name: 'International Stocks', value: 52120.13, percentage: 16, color: 'bg-green-500' },
    { name: 'Bonds', value: 48862.62, percentage: 15, color: 'bg-purple-500' },
    { name: 'Real Estate', value: 26060.07, percentage: 8, color: 'bg-yellow-500' },
    { name: 'Alternative', value: 16287.54, percentage: 5, color: 'bg-red-500' }
  ];
  
  // Accounts
  const accounts: Account[] = [
    { 
      id: 1, 
      name: '401(k)', 
      institution: 'Fidelity',
      balance: 185345.67,
      change: { amount: 1250.45, percentage: 0.68 },
      type: 'Retirement',
      lastUpdated: '2023-04-28'
    },
    { 
      id: 2, 
      name: 'Roth IRA', 
      institution: 'Vanguard',
      balance: 87652.34,
      change: { amount: 530.82, percentage: 0.61 },
      type: 'Retirement',
      lastUpdated: '2023-04-28'
    },
    { 
      id: 3, 
      name: 'Brokerage Account', 
      institution: 'Charles Schwab',
      balance: 42450.89,
      change: { amount: 215.56, percentage: 0.51 },
      type: 'Taxable',
      lastUpdated: '2023-04-28'
    },
    { 
      id: 4, 
      name: 'Crypto Wallet', 
      institution: 'Coinbase',
      balance: 10301.92,
      change: { amount: 148.49, percentage: 1.46 },
      type: 'Alternative',
      lastUpdated: '2023-04-28'
    }
  ];
  
  // Top holdings
  const topHoldings: Holding[] = [
    { 
      id: 1, 
      symbol: 'VTI', 
      name: 'Vanguard Total Stock Market ETF',
      value: 45320.45,
      shares: 215.43,
      pricePerShare: 210.37,
      change: { amount: 350.34, percentage: 0.78 }
    },
    { 
      id: 2, 
      symbol: 'VXUS', 
      name: 'Vanguard Total International Stock ETF',
      value: 25670.23,
      shares: 432.12,
      pricePerShare: 59.41,
      change: { amount: 120.56, percentage: 0.47 }
    },
    { 
      id: 3, 
      symbol: 'BND', 
      name: 'Vanguard Total Bond Market ETF',
      value: 32450.67,
      shares: 380.58,
      pricePerShare: 85.27,
      change: { amount: -45.67, percentage: -0.14 }
    },
    { 
      id: 4, 
      symbol: 'VNQ', 
      name: 'Vanguard Real Estate ETF',
      value: 18540.32,
      shares: 178.25,
      pricePerShare: 104.01,
      change: { amount: 78.93, percentage: 0.43 }
    },
    { 
      id: 5, 
      symbol: 'AAPL', 
      name: 'Apple Inc.',
      value: 15320.78,
      shares: 85.67,
      pricePerShare: 178.85,
      change: { amount: 250.34, percentage: 1.66 }
    }
  ];
  
  // Current time period performance
  const currentPerformance = useMemo(() => {
    return portfolioSummary.timeRangePerformance[timeRange];
  }, [portfolioSummary, timeRange]);

  return {
    timeRange,
    hideBalances,
    portfolioSummary,
    assetAllocation,
    accounts,
    topHoldings,
    currentPerformance,
    setTimeRange,
    setHideBalances
  };
} 