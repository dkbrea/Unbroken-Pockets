import { Home, ShoppingCart, Car, Utensils, Coffee, Briefcase, CircleDollarSign, Plane, GraduationCap, CreditCard, Wallet, BuildingIcon } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { supabase } from './supabase';
import { BudgetCategory, BudgetState } from '../hooks/useBudgetData';
import { CashFlowData, CashFlowState } from '../hooks/useCashFlowData';
import { Goal, GoalsState } from '../hooks/useGoalsData';
import { PortfolioSummary, AssetAllocation, Account, Holding, TimeRange, InvestmentsState, PerformanceData } from '../hooks/useInvestmentsData';
import { ReportType, CategoryData, ReportsState } from '../hooks/useReportsData';
import { Transaction, TransactionsState } from '../hooks/useTransactionsData';
import { Account as FinancialAccount, AccountsState } from '../hooks/useAccountsData';
import { UserProfile, UserProfileState } from '../hooks/useUserProfile';
import { Notification, NotificationsState } from '../hooks/useNotifications';
import { RecurringTransaction, RecurringState } from '../hooks/useRecurringData';
import { createClient } from '@supabase/supabase-js';

// Icon mapping helper
const getIconByName = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Home': Home,
    'ShoppingCart': ShoppingCart,
    'Car': Car,
    'Utensils': Utensils,
    'Coffee': Coffee,
    'Briefcase': Briefcase,
    'CircleDollarSign': CircleDollarSign,
    'Plane': Plane,
    'GraduationCap': GraduationCap,
    'CreditCard': CreditCard,
    'Wallet': Wallet,
    'BuildingIcon': BuildingIcon
  };
  
  return iconMap[iconName] || Home;
};

// Budget data functions
export const loadBudgetData = async (): Promise<Partial<BudgetState>> => {
  // Get active budget period
  try {
    console.log('Attempting to fetch budget period...');
    const { data: periodData, error: periodError } = await supabase
      .from('budget_periods')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (periodError) {
      console.error('Error loading budget period:', periodError);
      // Provide fallback data instead of returning empty object
      return useFallbackBudgetData();
    }
    
    if (!periodData) {
      console.error('No active budget period found');
      return useFallbackBudgetData();
    }
    
    console.log('Successfully loaded budget period:', periodData);
    
    // Get budget categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('budget_categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error loading budget categories:', categoriesError);
      return useFallbackBudgetData();
    }
    
    // Transform to match hook format
    const budgetCategories: BudgetCategory[] = categoriesData.map(category => ({
      id: category.id,
      name: category.name,
      allocated: category.allocated,
      spent: category.spent,
      icon: getIconByName(category.icon),
      color: category.color
    }));
    
    const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    const remainingBudget = totalAllocated - totalSpent;
    
    return {
      activePeriod: periodData.name,
      budgetCategories,
      totalAllocated,
      totalSpent,
      remainingBudget
    };
  } catch (err) {
    console.error('Unexpected error in loadBudgetData:', err);
    return useFallbackBudgetData();
  }
};

// Fallback data function for budget
const useFallbackBudgetData = (): Partial<BudgetState> => {
  console.log('Using fallback budget data');
  
  // Sample budget categories
  const budgetCategories: BudgetCategory[] = [
    {
      id: 1,
      name: 'Housing',
      allocated: 1800,
      spent: 1650,
      icon: Home,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 2,
      name: 'Groceries',
      allocated: 600,
      spent: 420,
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 3,
      name: 'Transportation',
      allocated: 400,
      spent: 380,
      icon: Car,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 4,
      name: 'Dining Out',
      allocated: 350,
      spent: 410,
      icon: Utensils,
      color: 'text-red-600 bg-red-100'
    },
    {
      id: 5,
      name: 'Entertainment',
      allocated: 250,
      spent: 180,
      icon: Coffee,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ];
  
  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalAllocated - totalSpent;
  
  return {
    activePeriod: 'May 2025 (Fallback)',
    budgetCategories,
    totalAllocated,
    totalSpent,
    remainingBudget
  };
};

// Cash Flow data functions
export const loadCashFlowData = async (): Promise<Partial<CashFlowState>> => {
  try {
    const { data: cashFlowData, error } = await supabase
      .from('cash_flow')
      .select('*');
    
    if (error) {
      console.error('Error loading cash flow data:', error);
      return useFallbackCashFlowData();
    }
    
    // If no data is returned, use fallback data
    if (!cashFlowData || cashFlowData.length === 0) {
      console.log('No cash flow data found in database, using fallback data');
      return useFallbackCashFlowData();
    }
    
    // Transform to match hook format
    const cashFlow: CashFlowData[] = cashFlowData.map(item => ({
      month: item.month,
      income: item.income,
      expenses: item.expenses
    }));
    
    const totalIncome = cashFlow.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = cashFlow.reduce((sum, month) => sum + month.expenses, 0);
    const netCashFlow = totalIncome - totalExpenses;
    
    // Get last 3 months
    const last3Months = [...cashFlow].slice(-3);
    
    return {
      cashFlowData: cashFlow,
      totalIncome,
      totalExpenses,
      netCashFlow,
      last3Months
    };
  } catch (err) {
    console.error('Unexpected error in loadCashFlowData:', err);
    return useFallbackCashFlowData();
  }
};

// Fallback data function for cash flow
const useFallbackCashFlowData = (): Partial<CashFlowState> => {
  // Sample cash flow data
  const cashFlow: CashFlowData[] = [
    { month: 'Jan', income: 6200, expenses: 4800 },
    { month: 'Feb', income: 6300, expenses: 4700 },
    { month: 'Mar', income: 6150, expenses: 4900 },
    { month: 'Apr', income: 6400, expenses: 5100 },
    { month: 'May', income: 6200, expenses: 4950 },
    { month: 'Jun', income: 6300, expenses: 5050 },
    { month: 'Jul', income: 6500, expenses: 5200 },
    { month: 'Aug', income: 6400, expenses: 5100 },
    { month: 'Sep', income: 6350, expenses: 5150 },
    { month: 'Oct', income: 6450, expenses: 5250 },
    { month: 'Nov', income: 6550, expenses: 5300 },
    { month: 'Dec', income: 7000, expenses: 5800 }
  ];
  
  const totalIncome = cashFlow.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = cashFlow.reduce((sum, month) => sum + month.expenses, 0);
  const netCashFlow = totalIncome - totalExpenses;
  
  // Get last 3 months
  const last3Months = [...cashFlow].slice(-3);
  
  return {
    cashFlowData: cashFlow,
    totalIncome,
    totalExpenses,
    netCashFlow,
    last3Months
  };
};

// Goals data functions
export const loadGoalsData = async (): Promise<Partial<GoalsState>> => {
  try {
    const { data: goalsData, error } = await supabase
      .from('financial_goals')
      .select('*');
    
    if (error) {
      console.error('Error loading goals data:', error);
      return useFallbackGoalsData();
    }
    
    // If no data is returned, use fallback data
    if (!goalsData || goalsData.length === 0) {
      console.log('No goals data found in database, using fallback data');
      return useFallbackGoalsData();
    }
    
    // Transform to match hook format
    const goals: Goal[] = goalsData.map(goal => ({
      id: goal.id,
      name: goal.name,
      icon: getIconByName(goal.icon),
      color: goal.color,
      currentAmount: goal.current_amount,
      targetAmount: goal.target_amount,
      targetDate: goal.target_date,
      contributions: {
        frequency: goal.contribution_frequency,
        amount: goal.contribution_amount
      }
    }));
    
    // Calculate progress and other derived data
    const goalsWithProgress = goals.map(goal => {
      const progressPercent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
      const remaining = goal.targetAmount - goal.currentAmount;
      
      // Calculate months until target date
      const today = new Date();
      const targetDate = new Date(goal.targetDate);
      const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                            targetDate.getMonth() - today.getMonth();
      
      // Estimate completion date based on current contributions
      const monthsToComplete = remaining / goal.contributions.amount;
      const completionDate = new Date();
      completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
      
      // Check if on track
      const onTrack = monthsToComplete <= monthsRemaining;
      
      return {
        ...goal,
        progressPercent,
        remaining,
        monthsRemaining,
        monthsToComplete: Math.ceil(monthsToComplete),
        completionDate,
        onTrack
      };
    });
    
    // Sort by progress for "In Progress" tab
    const inProgressGoals = [...goalsWithProgress]
      .filter(goal => goal.progressPercent < 100)
      .sort((a, b) => b.progressPercent - a.progressPercent);
    
    // Sort by completion date for "Timeline" tab  
    const timelineGoals = [...goalsWithProgress]
      .filter(goal => goal.progressPercent < 100)
      .sort((a, b) => a.completionDate.getTime() - b.completionDate.getTime());
    
    // Calculate total monthly contribution
    const totalMonthlyContribution = goals.reduce((sum, goal) => sum + goal.contributions.amount, 0);
    
    return {
      goals,
      goalsWithProgress,
      inProgressGoals,
      timelineGoals,
      totalMonthlyContribution
    };
  } catch (err) {
    console.error('Unexpected error in loadGoalsData:', err);
    return useFallbackGoalsData();
  }
};

// Fallback data function for goals
const useFallbackGoalsData = (): Partial<GoalsState> => {
  // Sample goals data
  const goals = [
    { 
      id: 1, 
      name: 'Emergency Fund', 
      icon: CircleDollarSign,
      color: 'bg-blue-100 text-blue-600',
      currentAmount: 8500,
      targetAmount: 10000,
      targetDate: '2023-08-01',
      contributions: {
        frequency: 'Monthly',
        amount: 500
      }
    },
    { 
      id: 2, 
      name: 'New Car', 
      icon: Car,
      color: 'bg-green-100 text-green-600',
      currentAmount: 12000,
      targetAmount: 30000,
      targetDate: '2024-06-01',
      contributions: {
        frequency: 'Monthly',
        amount: 1000
      }
    },
    { 
      id: 3, 
      name: 'Down Payment', 
      icon: Home,
      color: 'bg-purple-100 text-purple-600',
      currentAmount: 35000,
      targetAmount: 100000,
      targetDate: '2025-01-01',
      contributions: {
        frequency: 'Monthly',
        amount: 1500
      }
    },
    { 
      id: 4, 
      name: 'Vacation', 
      icon: Plane,
      color: 'bg-yellow-100 text-yellow-600',
      currentAmount: 2200,
      targetAmount: 5000,
      targetDate: '2023-11-01',
      contributions: {
        frequency: 'Monthly',
        amount: 400
      }
    },
    { 
      id: 5, 
      name: 'Education', 
      icon: GraduationCap,
      color: 'bg-red-100 text-red-600',
      currentAmount: 15000,
      targetAmount: 50000,
      targetDate: '2026-01-01',
      contributions: {
        frequency: 'Monthly',
        amount: 800
      }
    },
    { 
      id: 6, 
      name: 'Retirement', 
      icon: Briefcase,
      color: 'bg-indigo-100 text-indigo-600',
      currentAmount: 120000,
      targetAmount: 1000000,
      targetDate: '2050-01-01',
      contributions: {
        frequency: 'Monthly',
        amount: 2000
      }
    }
  ];
  
  // Calculate progress percentages and derived data
  const goalsWithProgress = goals.map(goal => {
    const progressPercent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
    const remaining = goal.targetAmount - goal.currentAmount;
    
    // Calculate months until target date
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                          targetDate.getMonth() - today.getMonth();
    
    // Estimate completion date based on current contributions
    const monthsToComplete = remaining / goal.contributions.amount;
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
    
    // Check if on track
    const onTrack = monthsToComplete <= monthsRemaining;
    
    return {
      ...goal,
      progressPercent,
      remaining,
      monthsRemaining,
      monthsToComplete: Math.ceil(monthsToComplete),
      completionDate,
      onTrack
    };
  });
  
  // Sort by progress for "In Progress" tab
  const inProgressGoals = [...goalsWithProgress]
    .filter(goal => goal.progressPercent < 100)
    .sort((a, b) => b.progressPercent - a.progressPercent);
  
  // Sort by completion date for "Timeline" tab  
  const timelineGoals = [...goalsWithProgress]
    .filter(goal => goal.progressPercent < 100)
    .sort((a, b) => a.completionDate.getTime() - b.completionDate.getTime());
  
  // Calculate total monthly contribution
  const totalMonthlyContribution = goals.reduce((sum, goal) => sum + goal.contributions.amount, 0);
  
  return {
    goals,
    goalsWithProgress,
    inProgressGoals,
    timelineGoals,
    totalMonthlyContribution
  };
};

// Investments data functions
export async function loadInvestmentsData(): Promise<Partial<InvestmentsState>> {
  try {
    // Get the current logged in user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      console.error('No authenticated user found');
      return {
        portfolioSummary: {
          totalValue: 0,
          change: {
            amount: 0,
            percentage: 0
          },
          timeRangePerformance: {
            '1D': { amount: 0, percentage: 0 },
            '1W': { amount: 0, percentage: 0 },
            '1M': { amount: 0, percentage: 0 },
            '1Y': { amount: 0, percentage: 0 },
            'All': { amount: 0, percentage: 0 }
          }
        },
        assetAllocation: [],
        accounts: [],
        topHoldings: []
      };
    }
    
    const userId = userData.user.id;
    
    // First check if a portfolio exists for this user
    const { data: portfolioCheck, error: portfolioCheckError } = await supabase
      .from('investment_portfolio')
      .select('id')
      .eq('user_id', userId);
    
    // If no portfolio exists for this user, create one
    if ((!portfolioCheck || portfolioCheck.length === 0) && !portfolioCheckError) {
      console.log('No portfolio found for user, creating a default one');
      
      // Create a default portfolio
      const { data: newPortfolio, error: createError } = await supabase
        .from('investment_portfolio')
        .insert({
          total_value: 0,
          change_amount: 0,
          change_percentage: 0,
          user_id: userId
        })
        .select();
      
      if (createError) {
        console.error('Error creating portfolio:', createError);
        return {
          portfolioSummary: {
            totalValue: 0,
            change: {
              amount: 0,
              percentage: 0
            },
            timeRangePerformance: {
              '1D': { amount: 0, percentage: 0 },
              '1W': { amount: 0, percentage: 0 },
              '1M': { amount: 0, percentage: 0 },
              '1Y': { amount: 0, percentage: 0 },
              'All': { amount: 0, percentage: 0 }
            }
          },
          assetAllocation: [],
          accounts: [],
          topHoldings: [],
        };
      }
      
      // Create default time range performance records
      const timeRanges = ['1D', '1W', '1M', '1Y', 'All'];
      
      for (const range of timeRanges) {
        await supabase
          .from('portfolio_performance')
          .insert({
            time_range: range,
            amount: 0,
            percentage: 0,
            portfolio_id: newPortfolio[0].id
          });
      }
    }
    
    // Get accounts and holdings first to calculate actual total value
    let accounts: Account[] = [];
    let topHoldings: Holding[] = [];
    
    // Get accounts
    const { data: accountRows, error: accountsError } = await supabase
      .from('investment_accounts')
      .select('*')
      .eq('user_id', userId);
    
    if (accountsError) {
      console.error('Error fetching investment accounts:', accountsError);
    } else if (accountRows) {
      accounts = accountRows.map((row) => ({
        id: row.id,
        name: row.name,
        institution: row.institution,
        balance: row.balance || 0,
        change: {
          amount: row.change_amount || 0,
          percentage: row.change_percentage || 0
        },
        type: row.account_type || '',
        lastUpdated: row.last_updated,
      }));
    }
    
    // Get top holdings
    const { data: holdingsRows, error: holdingsError } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId);
    
    if (holdingsError) {
      console.error('Error fetching holdings:', holdingsError);
    } else if (holdingsRows) {
      topHoldings = holdingsRows.map((row) => ({
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
    }
    
    // Calculate the actual total portfolio value from accounts and holdings
    const totalAccountsValue = accounts.reduce((sum, account) => sum + account.balance, 0);
    // We don't add holdings value to avoid double counting, assuming holdings are part of accounts
    const totalPortfolioValue = totalAccountsValue;
    
    // Calculate the total change values
    const totalChangeAmount = accounts.reduce((sum, account) => sum + account.change.amount, 0);
    const totalChangePercentage = totalPortfolioValue > 0 
      ? (totalChangeAmount / (totalPortfolioValue - totalChangeAmount)) * 100 
      : 0;
    
    // Now get or create portfolio summary
    const portfolioSummary: PortfolioSummary = {
      totalValue: totalPortfolioValue,
      change: {
        amount: totalChangeAmount,
        percentage: parseFloat(totalChangePercentage.toFixed(2))
      },
      timeRangePerformance: {
        '1D': { amount: totalChangeAmount, percentage: parseFloat(totalChangePercentage.toFixed(2)) },
        '1W': { amount: 0, percentage: 0 },
        '1M': { amount: 0, percentage: 0 },
        '1Y': { amount: 0, percentage: 0 },
        'All': { amount: 0, percentage: 0 }
      }
    };
    
    // Get existing portfolio record
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('investment_portfolio')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (portfolioError) {
      console.error('Error fetching portfolio data:', portfolioError);
    } else if (portfolioData) {
      // Update the portfolio with the new calculated values
      const { error: updateError } = await supabase
        .from('investment_portfolio')
        .update({
          total_value: totalPortfolioValue,
          change_amount: totalChangeAmount,
          change_percentage: parseFloat(totalChangePercentage.toFixed(2))
        })
        .eq('id', portfolioData.id);
        
      if (updateError) {
        console.error('Error updating portfolio totals:', updateError);
      }
      
      // Get portfolio performance data for different time ranges
      const { data: performanceRows, error: performanceError } = await supabase
        .from('portfolio_performance')
        .select('*')
        .eq('portfolio_id', portfolioData.id);
      
      if (performanceError) {
        console.error('Error fetching performance data:', performanceError);
      } else if (performanceRows) {
        const timeRangePerformance: Record<TimeRange, PerformanceData> = {
          '1D': { amount: totalChangeAmount, percentage: parseFloat(totalChangePercentage.toFixed(2)) },
          '1W': { amount: 0, percentage: 0 },
          '1M': { amount: 0, percentage: 0 },
          '1Y': { amount: 0, percentage: 0 },
          'All': { amount: 0, percentage: 0 }
        };
        
        // Update each performance record with new values
        for (const range of Object.keys(timeRangePerformance) as TimeRange[]) {
          const performanceRecord = performanceRows.find(row => row.time_range === range);
          
          if (performanceRecord) {
            if (range === '1D') {
              // Update the 1D performance with current day change
              await supabase
                .from('portfolio_performance')
                .update({
                  amount: totalChangeAmount,
                  percentage: parseFloat(totalChangePercentage.toFixed(2))
                })
                .eq('id', performanceRecord.id);
            }
            
            // Get the current values from the database
            timeRangePerformance[range] = {
              amount: performanceRecord.amount || 0,
              percentage: performanceRecord.percentage || 0
            };
            
            // For 1D, use the calculated values
            if (range === '1D') {
              timeRangePerformance[range] = {
                amount: totalChangeAmount,
                percentage: parseFloat(totalChangePercentage.toFixed(2))
              };
            }
          }
        }
        
        portfolioSummary.timeRangePerformance = timeRangePerformance;
      }
    }
    
    // Get asset allocation data
    let assetAllocation: AssetAllocation[] = [];
    
    const { data: allocationRows, error: allocationError } = await supabase
      .from('asset_allocation')
      .select('*');
    
    if (allocationError) {
      console.error('Error fetching asset allocation:', allocationError);
    } else if (allocationRows) {
      assetAllocation = allocationRows.map((row) => ({
        name: row.name,
        value: row.value || 0,
        percentage: row.percentage || 0,
        color: row.color || getDefaultColorForAsset(row.name),
      }));
      
      // Update the asset allocation values based on actual holdings
      // This is simplified - in a real app, you would categorize each holding
      if (totalPortfolioValue > 0 && assetAllocation.length > 0) {
        // Update values based on percentages
        assetAllocation = assetAllocation.map(asset => ({
          ...asset,
          value: (asset.percentage / 100) * totalPortfolioValue
        }));
      }
    }
    
    return {
      portfolioSummary,
      assetAllocation,
      accounts,
      topHoldings,
    };
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    return {
      portfolioSummary: {
        totalValue: 0,
        change: {
          amount: 0,
          percentage: 0
        },
        timeRangePerformance: {
          '1D': { amount: 0, percentage: 0 },
          '1W': { amount: 0, percentage: 0 },
          '1M': { amount: 0, percentage: 0 },
          '1Y': { amount: 0, percentage: 0 },
          'All': { amount: 0, percentage: 0 }
        }
      },
      assetAllocation: [],
      accounts: [],
      topHoldings: [],
    };
  }
}

// Helper function to assign default colors to asset categories
const getDefaultColorForAsset = (assetName: string): string => {
  const defaultColors: Record<string, string> = {
    'US Stocks': 'bg-blue-500',
    'International Stocks': 'bg-green-500',
    'Bonds': 'bg-purple-500',
    'Real Estate': 'bg-yellow-500',
    'Alternative': 'bg-red-500'
  };
  
  return defaultColors[assetName] || 'bg-blue-500';
};

// Reports data functions
export const loadReportsData = async (): Promise<Partial<ReportsState>> => {
  try {
    // Get report types
    const { data: reportTypesData, error: reportTypesError } = await supabase
      .from('report_types')
      .select('*');
    
    if (reportTypesError) {
      console.error('Error loading report types:', reportTypesError);
      return useFallbackReportsData();
    }
    
    // If no data is returned, use fallback data
    if (!reportTypesData || reportTypesData.length === 0) {
      console.log('No report types found in database, using fallback data');
      return useFallbackReportsData();
    }
    
    // Get spending categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('spending_categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error loading spending categories:', categoriesError);
      return useFallbackReportsData();
    }
    
    // Format report types
    const reportTypes: ReportType[] = reportTypesData.map(item => ({
      id: item.id,
      name: item.name,
      icon: getIconByName(item.icon) as any,
      color: item.color
    }));
    
    // Format category data
    const categoryData: CategoryData[] = categoriesData.map(item => ({
      category: item.category,
      amount: item.amount,
      color: item.color
    }));
    
    const totalSpending = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
    
    return {
      reportTypes,
      categoryData,
      totalSpending
    };
  } catch (err) {
    console.error('Unexpected error in loadReportsData:', err);
    return useFallbackReportsData();
  }
};

// Fallback data function for reports
const useFallbackReportsData = (): Partial<ReportsState> => {
  // Sample report types
  const reportTypes: ReportType[] = [
    {
      id: 'monthly',
      name: 'Monthly Report',
      icon: CircleDollarSign,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: Wallet,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'annual',
      name: 'Annual Summary',
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-600'
    }
  ];
  
  // Sample spending categories
  const categoryData: CategoryData[] = [
    {
      category: 'Housing',
      amount: 1800,
      color: '#4C51BF'
    },
    {
      category: 'Food',
      amount: 500,
      color: '#38B2AC'
    },
    {
      category: 'Transportation',
      amount: 400,
      color: '#ED8936'
    },
    {
      category: 'Entertainment',
      amount: 300,
      color: '#667EEA'
    },
    {
      category: 'Healthcare',
      amount: 250,
      color: '#E53E3E'
    },
    {
      category: 'Shopping',
      amount: 400,
      color: '#9F7AEA'
    },
    {
      category: 'Utilities',
      amount: 200,
      color: '#48BB78'
    }
  ];
  
  const totalSpending = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  
  return {
    reportTypes,
    categoryData,
    totalSpending
  };
};

// Transactions data functions
export const loadTransactionsData = async (): Promise<Partial<TransactionsState>> => {
  try {
    // Use console.log to debug the Supabase URL and API key
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Loading transactions from Supabase...');
    
    const { data: transactionsData, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    // Log the raw response and error for debugging
    console.log('Supabase response:', transactionsData);
    console.log('Supabase error:', error);
    
    if (error) {
      console.error('Error loading transactions data:', error);
      return useFallbackTransactionsData();
    }
    
    // Log transaction data for debugging
    console.log('Transactions data received:', transactionsData ? transactionsData.length : 0, 'records');
    
    // If no data is returned, use fallback data
    if (!transactionsData || transactionsData.length === 0) {
      console.log('No transactions found in database, using fallback data');
      return useFallbackTransactionsData();
    }
    
    // Log the first transaction object structure to understand the data
    console.log('First transaction from Supabase:', transactionsData[0]);
    
    // Transform to match hook format
    const transactions: Transaction[] = transactionsData.map(transaction => {
      console.log('Processing transaction:', transaction);
      return {
        id: transaction.id,
        date: transaction.date,
        name: transaction.name,
        category: transaction.category,
        amount: transaction.amount,
        account: transaction.account,
        logo: transaction.logo || '/logos/default.png', // Provide a default logo if none exists
        isReconciled: transaction.is_reconciled,
        notes: transaction.notes,
        tags: transaction.tags || [] // Provide default empty array if tags is null
      };
    });
    
    // Filter transactions for recent ones (last 5)
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    console.log('Processed transactions:', transactions.length);
    console.log('Recent transactions:', recentTransactions.length);
    console.log('First processed transaction:', transactions[0]);
    
    return {
      transactions,
      recentTransactions
    };
  } catch (err) {
    console.error('Unexpected error in loadTransactionsData:', err);
    console.error('Error details:', err instanceof Error ? err.message : String(err));
    return useFallbackTransactionsData();
  }
};

// Fallback data function for transactions
const useFallbackTransactionsData = (): Partial<TransactionsState> => {
  // Sample transaction data
  const transactions: Transaction[] = [
    {
      id: 1,
      date: '2023-06-01',
      name: 'Grocery Store',
      category: 'Food',
      amount: -120.50,
      account: 'Checking Account',
      logo: '/logos/grocery.png',
      isReconciled: true,
      notes: 'Weekly groceries',
      tags: ['groceries', 'essential']
    },
    {
      id: 2,
      date: '2023-06-02',
      name: 'Gas Station',
      category: 'Transportation',
      amount: -45.00,
      account: 'Credit Card',
      logo: '/logos/gas.png',
      isReconciled: true,
      notes: 'Fill up tank',
      tags: ['car', 'essential']
    },
    {
      id: 3,
      date: '2023-06-03',
      name: 'Coffee Shop',
      category: 'Food',
      amount: -5.75,
      account: 'Checking Account',
      logo: '/logos/coffee.png',
      isReconciled: true,
      notes: '',
      tags: ['coffee']
    },
    {
      id: 4,
      date: '2023-06-05',
      name: 'Salary Deposit',
      category: 'Income',
      amount: 3000.00,
      account: 'Checking Account',
      logo: '/logos/income.png',
      isReconciled: true,
      notes: 'Monthly salary',
      tags: ['income', 'salary']
    },
    {
      id: 5,
      date: '2023-06-05',
      name: 'Rent Payment',
      category: 'Housing',
      amount: -1200.00,
      account: 'Checking Account',
      logo: '/logos/housing.png',
      isReconciled: true,
      notes: 'Monthly rent',
      tags: ['rent', 'essential']
    },
    {
      id: 6,
      date: '2023-06-06',
      name: 'Internet Bill',
      category: 'Utilities',
      amount: -75.00,
      account: 'Credit Card',
      logo: '/logos/internet.png',
      isReconciled: true,
      notes: 'Monthly internet service',
      tags: ['utilities', 'essential']
    },
    {
      id: 7,
      date: '2023-06-10',
      name: 'Restaurant',
      category: 'Food',
      amount: -65.20,
      account: 'Credit Card',
      logo: '/logos/restaurant.png',
      isReconciled: true,
      notes: 'Dinner with friends',
      tags: ['dining', 'social']
    },
    {
      id: 8,
      date: '2023-06-15',
      name: 'Movie Theater',
      category: 'Entertainment',
      amount: -25.00,
      account: 'Credit Card',
      logo: '/logos/entertainment.png',
      isReconciled: false,
      notes: 'Weekend movie',
      tags: ['entertainment']
    },
    {
      id: 9,
      date: '2023-06-20',
      name: 'Online Shopping',
      category: 'Shopping',
      amount: -89.99,
      account: 'Credit Card',
      logo: '/logos/shopping.png',
      isReconciled: false,
      notes: 'New headphones',
      tags: ['shopping', 'electronics']
    },
    {
      id: 10,
      date: '2023-06-25',
      name: 'Pharmacy',
      category: 'Healthcare',
      amount: -35.50,
      account: 'Checking Account',
      logo: '/logos/healthcare.png',
      isReconciled: false,
      notes: 'Prescription medication',
      tags: ['healthcare', 'essential']
    }
  ];
  
  // Sort by date (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get recent transactions (last 5)
  const recentTransactions = sortedTransactions.slice(0, 5);
  
  return {
    transactions: sortedTransactions,
    recentTransactions
  };
};

// Accounts data functions
export const loadAccountsData = async (): Promise<Partial<AccountsState>> => {
  const { data: accountsData, error } = await supabase
    .from('accounts')
    .select('*');
  
  if (error) {
    console.error('Error loading accounts data:', error);
    return {};
  }
  
  // Transform to match hook format
  const accounts: FinancialAccount[] = accountsData.map(account => ({
    id: account.id,
    name: account.name,
    institution: account.institution,
    balance: account.balance,
    type: account.type,
    lastUpdated: account.last_updated,
    isHidden: account.is_hidden,
    icon: getIconByName(account.icon),
    color: account.color,
    accountNumber: account.account_number,
    notes: account.notes
  }));
  
  // Get visible accounts
  const visibleAccounts = accounts.filter(account => !account.isHidden);
  
  // Calculate financial summary
  let totalBalance = 0;
  let totalAssets = 0;
  let totalLiabilities = 0;

  accounts.forEach(account => {
    totalBalance += account.balance;
    
    if (account.balance > 0) {
      totalAssets += account.balance;
    } else {
      totalLiabilities += Math.abs(account.balance);
    }
  });

  const netWorth = totalAssets - totalLiabilities;
  
  return {
    accounts,
    visibleAccounts,
    totalBalance,
    totalAssets,
    totalLiabilities,
    netWorth
  };
};

// User profile data functions
export const loadUserProfileData = async (userId: string): Promise<Partial<UserProfileState>> => {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error loading user data:', userError);
      
      // Get basic user info from auth instead
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Error getting auth user:", authError);
        return { isAuthenticated: false };
      }
      
      // Return default user profile with auth data
      return { 
        isAuthenticated: true,
        profile: {
          id: user.id,
          email: user.email || '',
          firstName: '',
          lastName: '',
          avatar: '',
          createdAt: user.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isEmailVerified: user.email_confirmed_at ? true : false,
          preferences: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            theme: 'light',
            hideBalances: false,
            notifications: {
              email: true,
              browser: false,
              mobile: false
            },
            dashboardWidgets: []
          }
        }
      };
    }
  
    // Get user preferences
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (preferencesError) {
      console.error('Error loading user preferences:', preferencesError);
      return { 
        isAuthenticated: true,
        profile: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          avatar: userData.avatar,
          createdAt: userData.created_at,
          lastLogin: userData.last_login,
          isEmailVerified: userData.is_email_verified,
          preferences: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            theme: 'light',
            hideBalances: false,
            notifications: {
              email: true,
              browser: false,
              mobile: false
            },
            dashboardWidgets: []
          }
        }
      };
    }
    
    // Build complete user profile
    const profile: UserProfile = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      avatar: userData.avatar,
      createdAt: userData.created_at,
      lastLogin: userData.last_login,
      isEmailVerified: userData.is_email_verified,
      preferences: {
        currency: preferencesData.currency,
        dateFormat: preferencesData.date_format,
        theme: preferencesData.theme,
        hideBalances: preferencesData.hide_balances,
        notifications: {
          email: preferencesData.email_notifications,
          browser: preferencesData.browser_notifications,
          mobile: preferencesData.mobile_notifications
        },
        dashboardWidgets: preferencesData.dashboard_widgets
      }
    };
    
    return {
      profile,
      isAuthenticated: true
    };
  } catch (error) {
    console.error('Unexpected error in loadUserProfileData:', error);
    return { isAuthenticated: false };
  }
};

// Notifications data functions
export const loadNotificationsData = async (userId: string): Promise<Partial<NotificationsState>> => {
  const { data: notificationsData, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error loading notifications data:', error);
    return {};
  }
  
  // Transform to match hook format
  const notifications: Notification[] = notificationsData.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    timestamp: notification.timestamp,
    type: notification.type,
    source: notification.source,
    isRead: notification.is_read,
    actionUrl: notification.action_url,
    actionLabel: notification.action_label
  }));
  
  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.isRead).length;
  
  return {
    notifications,
    unreadCount
  };
};

// Recurring Transactions data functions
export const loadRecurringData = async (userId: string): Promise<Partial<RecurringState>> => {
  try {
    if (!userId) {
      console.error('No user ID provided to loadRecurringData');
      return {
        recurringTransactions: [],
        filteredTransactions: [],
        displayTransactions: []
      };
    }
    
    console.log('Loading recurring transactions for user:', userId);
    
    const { data: recurringData, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error loading recurring transactions data:', error);
      // Return empty arrays instead of fallback data
      return {
        recurringTransactions: [],
        filteredTransactions: [],
        displayTransactions: []
      };
    }
    
    // If no data is returned, use empty arrays instead of fallback
    if (!recurringData || recurringData.length === 0) {
      console.log('No recurring transactions found in database, returning empty arrays');
      return {
        recurringTransactions: [],
        filteredTransactions: [],
        displayTransactions: []
      };
    }
    
    console.log(`Found ${recurringData.length} recurring transactions for user ${userId}`);
    
    // Transform to match hook format
    const recurringTransactions: RecurringTransaction[] = recurringData.map(transaction => ({
      id: transaction.id,
      name: transaction.name || 'Unnamed Transaction',
      amount: transaction.amount || 0,
      frequency: transaction.frequency || 'Monthly',
      category: transaction.category || 'Uncategorized',
      nextDate: transaction.next_date || new Date().toISOString(),
      status: (transaction.status as 'active' | 'paused') || 'active',
      paymentMethod: transaction.payment_method || 'Other',
      debtId: transaction.debt_id,
      user_id: transaction.user_id,
      createdAt: transaction.created_at || new Date().toISOString(),
      updatedAt: transaction.updated_at || new Date().toISOString(),
      type: transaction.type || 'expense',
      description: transaction.description || '',
      startDate: transaction.start_date || transaction.next_date || new Date().toISOString()
    }));
    
    console.log("Loaded recurring transactions:", recurringTransactions);
    
    return {
      recurringTransactions,
      filteredTransactions: recurringTransactions,
      displayTransactions: recurringTransactions.filter(t => t.status === 'active')
        .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
    };
  } catch (err) {
    console.error('Unexpected error in loadRecurringData:', err);
    // Return empty arrays instead of fallback data
    return {
      recurringTransactions: [],
      filteredTransactions: [],
      displayTransactions: []
    };
  }
}; 