import { useState, useEffect } from 'react'
import { useTransactionsData } from './useTransactionsData'
import { useAccountsData } from './useAccountsData'
import type { Transaction as BaseTransaction } from './useTransactionsData'
import { supabase } from '@/lib/supabase'

// Extend the Transaction type to include isProjected property for our needs
type Transaction = BaseTransaction & { isProjected?: boolean };

// Define types for the hook's return values
export interface CashFlowMetrics {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  previousTotalIncome: number
  previousTotalExpenses: number
  previousNetCashFlow: number
  incomeChangePercent: number
  expensesChangePercent: number
  netCashFlowChangePercent: number
  categorySummary: CategorySummary[]
  topExpenseCategories: CategorySummary[]
  topIncomeCategories: CategorySummary[]
}

export interface CategorySummary {
  name: string
  amount: number
  percentage: number
  previousAmount?: number
  change?: number
  changePercent?: number
  color?: string
}

export interface MonthData {
  month: string
  income: number
  expenses: number
  netCashFlow: number
}

interface CashFlowOptions {
  timeRange?: string
  selectedMonth?: string
  includeCategories?: boolean
}

const predefinedColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
]

export function useCashFlowData(options: CashFlowOptions = {}) {
  const { 
    timeRange = '3months', 
    selectedMonth = new Date().toISOString().substring(0, 7),  // YYYY-MM format
    includeCategories = true
  } = options
  
  // Get transactions data
  const { transactions, isLoading: isLoadingTransactions } = useTransactionsData()
  
  // Get accounts data
  const { accounts, isLoading: isLoadingAccounts } = useAccountsData()
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  
  // Get user ID on mount
  useEffect(() => {
    async function getUserId() {
      setIsLoadingUser(true)
      const { data, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error fetching user:', error)
      } else if (data?.user) {
        setUserId(data.user.id)
      }
      
      setIsLoadingUser(false)
    }
    
    getUserId()
  }, [])
  
  // States for processed data
  const [cashFlowMetrics, setCashFlowMetrics] = useState<CashFlowMetrics>({
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    previousTotalIncome: 0,
    previousTotalExpenses: 0,
    previousNetCashFlow: 0,
    incomeChangePercent: 0,
    expensesChangePercent: 0,
    netCashFlowChangePercent: 0,
    categorySummary: [],
    topExpenseCategories: [],
    topIncomeCategories: []
  })
  
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([])
  const [cashFlowScore, setCashFlowScore] = useState<number>(0)
  const [upcomingTransactions, setUpcomingTransactions] = useState<Transaction[]>([])
  
  // Process transactions to calculate cash flow metrics
  useEffect(() => {
    // Only process if we have transactions and know the user ID
    if (transactions.length > 0 && !isLoadingUser) {
      // Filter transactions by user ID if we have one
      const userTransactions = userId 
        ? transactions.filter(t => t.user_id === userId)
        : transactions
        
      if (userTransactions.length > 0) {
        calculateCashFlowMetrics(userTransactions)
        calculateMonthlyData(userTransactions)
        calculateCashFlowScore(userTransactions)
        
        // Call the async function with proper error handling
        const fetchUpcomingTransactions = async () => {
          try {
            await calculateUpcomingTransactions(userTransactions)
          } catch (error) {
            console.error('Error calculating upcoming transactions:', error)
          }
        }
        
        fetchUpcomingTransactions()
      } else {
        console.log('No transactions found for the current user')
      }
    }
  }, [transactions, selectedMonth, timeRange, includeCategories, userId, isLoadingUser])
  
  // Calculate main cash flow metrics for the selected month
  const calculateCashFlowMetrics = (transactions: Transaction[]) => {
    // Extract year and month from selectedMonth (format: YYYY-MM)
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)
    
    // Get the previous month
    const previousDate = new Date(selectedYear, selectedMonthNum - 1, 1)
    previousDate.setMonth(previousDate.getMonth() - 1)
    const previousYear = previousDate.getFullYear()
    const previousMonthNum = previousDate.getMonth() + 1
    
    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(transaction => {
      const transDate = new Date(transaction.date)
      return transDate.getFullYear() === selectedYear && 
             transDate.getMonth() + 1 === selectedMonthNum
    })
    
    // Filter transactions for previous month
    const previousMonthTransactions = transactions.filter(transaction => {
      const transDate = new Date(transaction.date)
      return transDate.getFullYear() === previousYear && 
             transDate.getMonth() + 1 === previousMonthNum
    })
    
    // Calculate totals for current month
    const totalIncome = currentMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
      
    const totalExpenses = currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
    const netCashFlow = totalIncome - totalExpenses
    
    // Calculate totals for previous month
    const previousTotalIncome = previousMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
      
    const previousTotalExpenses = previousMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
    const previousNetCashFlow = previousTotalIncome - previousTotalExpenses
    
    // Calculate percent changes
    const incomeChangePercent = previousTotalIncome === 0 ? 0 : 
      ((totalIncome - previousTotalIncome) / previousTotalIncome) * 100
      
    const expensesChangePercent = previousTotalExpenses === 0 ? 0 : 
      ((totalExpenses - previousTotalExpenses) / previousTotalExpenses) * 100
      
    const netCashFlowChangePercent = previousNetCashFlow === 0 ? 0 : 
      ((netCashFlow - previousNetCashFlow) / Math.abs(previousNetCashFlow)) * 100
    
    // Calculate category summaries if enabled
    let categorySummary: CategorySummary[] = []
    let topExpenseCategories: CategorySummary[] = []
    let topIncomeCategories: CategorySummary[] = []
    
    if (includeCategories) {
      // Calculate expense categories
      const expensesByCategory = currentMonthTransactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized'
          if (!acc[category]) {
            acc[category] = 0
          }
          acc[category] += Math.abs(t.amount)
          return acc
        }, {} as Record<string, number>)
      
      // Calculate expense categories for previous month
      const previousExpensesByCategory = previousMonthTransactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized'
          if (!acc[category]) {
            acc[category] = 0
          }
          acc[category] += Math.abs(t.amount)
          return acc
        }, {} as Record<string, number>)
      
      // Transform into array and calculate percentages
      categorySummary = Object.entries(expensesByCategory).map(([name, amountFromEntries], index) => {
        const previousAmount = previousExpensesByCategory[name] || 0;
        const currentAmount = Number(amountFromEntries); // Explicit cast
        const percentage = totalExpenses > 0 ? (currentAmount / totalExpenses) * 100 : 0;
        const change = currentAmount - previousAmount;
        const changePercent = previousAmount > 0 ? (change / previousAmount) * 100 : 0;
        
        return {
          name,
          amount: currentAmount, // Use the casted amount
          percentage,
          previousAmount,
          change,
          changePercent,
          color: predefinedColors[index % predefinedColors.length]
        };
      });
      
      // Sort by amount and take top 5 expense categories
      topExpenseCategories = [...categorySummary]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      // Calculate income categories
      const incomeByCategory = currentMonthTransactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized Income'
          if (!acc[category]) {
            acc[category] = 0
          }
          acc[category] += t.amount // Income is positive
          return acc
        }, {} as Record<string, number>)

      const previousIncomeByCategory = previousMonthTransactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized Income'
          if (!acc[category]) {
            acc[category] = 0
          }
          acc[category] += t.amount // Income is positive
          return acc
        }, {} as Record<string, number>)

      topIncomeCategories = Object.entries(incomeByCategory)
        .map(([name, amountFromEntries], index) => {
          const previousAmount = previousIncomeByCategory[name] || 0;
          const currentAmount = Number(amountFromEntries); // Explicit cast
          const percentage = totalIncome > 0 ? (currentAmount / totalIncome) * 100 : 0;
          const change = currentAmount - previousAmount;
          const changePercent = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

          return {
            name,
            amount: currentAmount, // Use the casted amount
            percentage,
            previousAmount,
            change,
            changePercent,
            color: predefinedColors[(index + 5) % predefinedColors.length] // Offset color index
          };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    }
    
    // Update the state with calculated values
    setCashFlowMetrics({
      totalIncome,
      totalExpenses,
      netCashFlow,
      previousTotalIncome,
      previousTotalExpenses,
      previousNetCashFlow,
      incomeChangePercent,
      expensesChangePercent,
      netCashFlowChangePercent,
      categorySummary,
      topExpenseCategories,
      topIncomeCategories
    })
  }
  
  // Calculate monthly data for the charts
  const calculateMonthlyData = (transactions: Transaction[]) => {
    // Determine how many months to include based on timeRange
    let monthsToInclude = 3
    switch (timeRange) {
      case '1month':
        monthsToInclude = 1
        break
      case '3months':
        monthsToInclude = 3
        break
      case '6months':
        monthsToInclude = 6
        break
      case '12months':
        monthsToInclude = 12
        break
      case 'ytd':
        const currentMonth = new Date().getMonth() + 1
        monthsToInclude = currentMonth
        break
    }
    
    // Generate array of months to include
    const months: string[] = []
    const today = new Date()
    
    for (let i = 0; i < monthsToInclude; i++) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      const monthStr = date.toISOString().substring(0, 7) // YYYY-MM
      months.unshift(monthStr) // Add to beginning to maintain chronological order
    }
    
    // Calculate data for each month
    const monthlyData = months.map(monthStr => {
      const [year, month] = monthStr.split('-').map(Number)
      
      // Filter transactions for this month
      const monthTransactions = transactions.filter(transaction => {
        const transDate = new Date(transaction.date)
        return transDate.getFullYear() === year && 
               transDate.getMonth() + 1 === parseInt(month as unknown as string)
      })
      
      const income = monthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
        
      const expenses = monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
      const netCashFlow = income - expenses
      
      // Format month name (e.g., "Jan 2023")
      const date = new Date(year, parseInt(month as unknown as string) - 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      const formattedMonth = `${monthName} ${year}`
      
      return {
        month: formattedMonth,
        income,
        expenses,
        netCashFlow
      }
    })
    
    setMonthlyData(monthlyData)
  }
  
  // Calculate cash flow health score (0-100)
  const calculateCashFlowScore = (transactions: Transaction[]) => {
    // Extract the last 3 months of data for score calculation
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)
    const lastThreeMonths: MonthData[] = []
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(selectedYear, selectedMonthNum - 1)
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      // Filter transactions for this month
      const monthTransactions = transactions.filter(transaction => {
        const transDate = new Date(transaction.date)
        return transDate.getFullYear() === year && 
               transDate.getMonth() + 1 === month
      })
      
      const income = monthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
        
      const expenses = monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
      const netCashFlow = income - expenses
      
      lastThreeMonths.push({
        month: `${year}-${month}`,
        income,
        expenses,
        netCashFlow
      })
    }
    
    // Calculate score components (simplified version)
    // 1. Income-to-expense ratio (40 points) - optimal: 1.5 or higher
    const avgIncome = lastThreeMonths.reduce((sum, data) => sum + data.income, 0) / lastThreeMonths.length
    const avgExpenses = lastThreeMonths.reduce((sum, data) => sum + data.expenses, 0) / lastThreeMonths.length
    const incomeExpenseRatio = avgIncome / (avgExpenses || 1)
    const ratioScore = Math.min(40, Math.round((incomeExpenseRatio / 1.5) * 40))
    
    // 2. Consistency of positive cash flow (30 points)
    const positiveCashFlowMonths = lastThreeMonths.filter(data => data.netCashFlow > 0).length
    const consistencyScore = Math.round((positiveCashFlowMonths / 3) * 30)
    
    // 3. Growth in net cash flow (30 points)
    let growthScore = 15 // Neutral starting point
    
    if (lastThreeMonths.length >= 2) {
      const currentMonthCashFlow = lastThreeMonths[0].netCashFlow
      const previousMonthCashFlow = lastThreeMonths[1].netCashFlow
      
      if (currentMonthCashFlow > previousMonthCashFlow) {
        growthScore = 30 // Improved cash flow
      } else if (currentMonthCashFlow < previousMonthCashFlow) {
        growthScore = Math.max(0, 15 - Math.min(15, Math.abs(currentMonthCashFlow - previousMonthCashFlow) / avgIncome * 100))
      }
    }
    
    // Calculate final score (0-100)
    const finalScore = Math.min(100, Math.max(0, Math.round(ratioScore + consistencyScore + growthScore)))
    setCashFlowScore(finalScore)
  }
  
  // Calculate upcoming transactions based on recurring patterns
  const calculateUpcomingTransactions = async (transactions: Transaction[]) => {
    // Get recurring transactions from Supabase directly
    const today = new Date();
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error fetching user for upcoming transactions:', userError);
        setUpcomingTransactions([]);
        return;
      }
      
      // Get the next 30 days
      const next30Days = new Date(today);
      next30Days.setDate(today.getDate() + 30);
      
      // Format dates for comparison (YYYY-MM-DD)
      const todayStr = today.toISOString().split('T')[0];
      const next30DaysStr = next30Days.toISOString().split('T')[0];
      
      console.log(`Fetching recurring transactions between ${todayStr} and ${next30DaysStr}`);
      
      // Fetch recurring transactions that are due in the next 30 days
      const { data: recurringTransactions, error: recurringError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('next_date', todayStr)
        .lte('next_date', next30DaysStr);
      
      if (recurringError) {
        console.error('Error fetching recurring transactions:', recurringError);
        console.log('Falling back to pattern detection');
        await calculateFallbackUpcomingTransactions(transactions, user.id);
        return;
      }
      
      console.log(`Found ${recurringTransactions?.length || 0} upcoming recurring transactions for next 30 days (${todayStr} to ${next30DaysStr}):`, 
        recurringTransactions?.map(rt => ({ 
          name: rt.name, 
          type: rt.type, 
          amount: rt.amount, 
          next_date: rt.next_date,
          frequency: rt.frequency 
        })));
      
      // Convert recurring transactions to the Transaction format
      if (recurringTransactions && recurringTransactions.length > 0) {
        const upcomingTransactionsFormatted = recurringTransactions.map(rt => {
          // Determine if it's income or expense based on the type field
          const isIncome = rt.type === 'income';
          const isExpense = rt.type === 'expense';
          const isDebt = rt.type === 'debt';
          
          console.log(`Processing ${rt.name} with type: ${rt.type}, amount: ${rt.amount}, next_date: ${rt.next_date}`);
          
          // Ensure amount has the right sign based on transaction type
          let amount = rt.amount;
          if (isIncome) {
            amount = Math.abs(rt.amount);
          } else if (isExpense || isDebt) {
            amount = -Math.abs(rt.amount);
          }
          
          // Format transaction for display
          return {
            id: rt.id,
            date: rt.next_date,
            name: rt.name,
            category: rt.category || 'Uncategorized',
            amount: amount,
            account: '',
            notes: rt.description || '',
            tags: [],
            user_id: user.id,
            isProjected: true,
            isReconciled: false,
            is_debt_transaction: isDebt
          } as Transaction;
        });
        
        console.log('Formatted upcoming transactions (before sorting):', upcomingTransactionsFormatted.map(t => ({
          name: t.name,
          amount: t.amount,
          date: t.date
        })));
        
        // Sort by date (ascending)
        upcomingTransactionsFormatted.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        console.log('Formatted upcoming transactions (after sorting):', upcomingTransactionsFormatted.map(t => ({
          name: t.name,
          amount: t.amount,
          date: t.date
        })));
        
        if (upcomingTransactionsFormatted.length === 0) {
          console.log('No upcoming transactions found from recurring sources, trying fallback');
          await calculateFallbackUpcomingTransactions(transactions, user.id);
        } else {
          setUpcomingTransactions(upcomingTransactionsFormatted);
        }
      } else {
        console.log('No upcoming recurring transactions found, falling back to pattern detection');
        await calculateFallbackUpcomingTransactions(transactions, user.id);
      }
    } catch (error) {
      console.error('Error calculating upcoming transactions:', error);
      setUpcomingTransactions([]);
    }
  }
  
  // Fallback method for detecting patterns in existing transactions
  const calculateFallbackUpcomingTransactions = async (transactions: Transaction[], userId: string) => {
    console.log('Using fallback pattern detection with', transactions.length, 'transactions');
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions available for pattern detection');
      setUpcomingTransactions([]);
      return;
    }
    
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);
    
    console.log(`Fallback pattern detection looking for transactions from ${today.toISOString().split('T')[0]} to ${next30Days.toISOString().split('T')[0]}`);
    
    const recurringByName: Record<string, Array<Transaction>> = {};
    
    // Group transactions by name
    transactions.forEach(transaction => {
      if (transaction.name) {
        if (!recurringByName[transaction.name]) {
          recurringByName[transaction.name] = [];
        }
        recurringByName[transaction.name].push(transaction);
      }
    });
    
    // Find transaction names that occur at least twice
    const potentiallyRecurring = Object.entries(recurringByName)
      .filter(([_, transactions]) => transactions.length >= 2)
      .map(([name, transactions]) => {
        // Sort by date descending (newest first)
        return {
          name,
          transactions: transactions.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        };
      });
    
    console.log(`Found ${potentiallyRecurring.length} potentially recurring transaction patterns`);
    
    const upcomingTransactions: Transaction[] = [];
    
    // Analyze patterns and project future transactions
    potentiallyRecurring.forEach(({ name, transactions }) => {
      if (transactions.length < 2) return;
      
      const latestTransaction = transactions[0];
      const secondLatestTransaction = transactions[1];
      
      const latestDate = new Date(latestTransaction.date);
      const secondLatestDate = new Date(secondLatestTransaction.date);
      
      // Calculate difference in days between the two most recent occurrences
      const daysDifference = Math.round(
        (latestDate.getTime() - secondLatestDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      console.log(`'${name}' occurs every ~${daysDifference} days`);
      
      // Only consider patterns between 14 and 45 days (approx. monthly) or 
      // weekly (6-8 days) or bi-weekly (13-15 days)
      const isWeekly = daysDifference >= 6 && daysDifference <= 8;
      const isBiWeekly = daysDifference >= 13 && daysDifference <= 15;
      const isMonthly = daysDifference >= 25 && daysDifference <= 35;
      
      if (isWeekly || isBiWeekly || isMonthly) {
        // Project next occurrence
        const nextDate = new Date(latestDate);
        nextDate.setDate(latestDate.getDate() + daysDifference);
        
        // Check if next date is within the next 30 days and in the future
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);
        
        if (nextDate > today && nextDate <= next30Days) {
          console.log(`Projecting '${name}' on ${nextDate.toISOString().split('T')[0]}`);
          
          upcomingTransactions.push({
            ...latestTransaction,
            id: latestTransaction.id,
            date: nextDate.toISOString().split('T')[0],
            isProjected: true,
            user_id: userId
          });
        }
      }
    });
    
    console.log(`Projected ${upcomingTransactions.length} upcoming transactions based on patterns`);
    
    // Additional fallback: include fixed expenses from the last month
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const oneMonthAgo = lastMonth.toISOString().split('T')[0];
    
    const recentFixedExpenses = transactions.filter(t => 
      t.date >= oneMonthAgo && 
      t.amount < 0 && 
      t.category && 
      ['Rent', 'Mortgage', 'Utilities', 'Subscription', 'Insurance', 'Loan Payment'].includes(t.category)
    );
    
    if (recentFixedExpenses.length > 0) {
      console.log(`Found ${recentFixedExpenses.length} recent fixed expenses to project`);
      
      recentFixedExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const nextDate = new Date(expenseDate);
        nextDate.setMonth(expenseDate.getMonth() + 1);
        
        // Only include if not already projected and within next 30 days
        const isDuplicate = upcomingTransactions.some(t => 
          t.name === expense.name && Math.abs(t.amount - expense.amount) < 0.01
        );
        
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);
        
        if (!isDuplicate && nextDate > today && nextDate <= next30Days) {
          console.log(`Projecting fixed expense '${expense.name}' on ${nextDate.toISOString().split('T')[0]}`);
          
          upcomingTransactions.push({
            ...expense,
            id: expense.id,
            date: nextDate.toISOString().split('T')[0],
            isProjected: true,
            user_id: userId
          });
        }
      });
    }
    
    // Handle recurring income sources like salary, similar to fixed expenses
    const recentIncomes = transactions.filter(t => 
      t.date >= oneMonthAgo && 
      t.amount > 0 && 
      t.category && 
      ['Salary', 'Income', 'Wages', 'Paycheck', 'Dividend', 'Interest', 'Rental Income'].includes(t.category)
    );
    
    if (recentIncomes.length > 0) {
      console.log(`Found ${recentIncomes.length} recent income sources to project`);
      
      recentIncomes.forEach(income => {
        const incomeDate = new Date(income.date);
        const nextDate = new Date(incomeDate);
        nextDate.setMonth(incomeDate.getMonth() + 1);
        
        // Only include if not already projected and within next 30 days
        const isDuplicate = upcomingTransactions.some(t => 
          t.name === income.name && Math.abs(t.amount - income.amount) < 0.01
        );
        
        if (!isDuplicate && nextDate > today && nextDate <= next30Days) {
          console.log(`Projecting income '${income.name}' on ${nextDate.toISOString().split('T')[0]}`);
          
          upcomingTransactions.push({
            ...income,
            id: income.id,
            date: nextDate.toISOString().split('T')[0],
            isProjected: true,
            user_id: userId
          });
        }
      });
    }
    
    // Final check: Look for any income transactions within the last 60 days
    // If we still have no income projections, project any income we find
    const incomeTransactions = upcomingTransactions.filter(t => t.amount > 0);
    if (incomeTransactions.length === 0) {
      const twoMonthsAgo = new Date(today);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const twoMonthsAgoStr = twoMonthsAgo.toISOString().split('T')[0];
      
      const anyIncomes = transactions.filter(t => 
        t.date >= twoMonthsAgoStr && 
        t.amount > 0
      );
      
      console.log(`Found ${anyIncomes.length} income transactions in the last 60 days`);
      
      // Group incomes by name
      const incomeByName: Record<string, Transaction[]> = {};
      anyIncomes.forEach(income => {
        if (!incomeByName[income.name]) {
          incomeByName[income.name] = [];
        }
        incomeByName[income.name].push(income);
      });
      
      // For each income source, project the next occurrence
      Object.entries(incomeByName).forEach(([name, incomes]) => {
        if (incomes.length === 0) return;
        
        // Sort by date descending (newest first)
        incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const latestIncome = incomes[0];
        const latestDate = new Date(latestIncome.date);
        
        // Project the next income date based on this month
        const nextDate = new Date(latestDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        if (nextDate > today && nextDate <= next30Days) {
          console.log(`Projecting future income '${name}' on ${nextDate.toISOString().split('T')[0]}`);
          
          upcomingTransactions.push({
            ...latestIncome,
            id: latestIncome.id,
            date: nextDate.toISOString().split('T')[0],
            isProjected: true,
            user_id: userId
          });
        }
      });
    }
    
    if (upcomingTransactions.length === 0) {
      console.log("No patterns detected for upcoming transactions");
    } else {
      console.log(`Total ${upcomingTransactions.length} upcoming transactions detected via patterns`);
      
      // Sort by date (ascending)
      upcomingTransactions.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    
    setUpcomingTransactions(upcomingTransactions);
  }
  
  return {
    cashFlowMetrics,
    monthlyData,
    cashFlowScore,
    upcomingTransactions,
    isLoading: isLoadingTransactions || isLoadingAccounts || isLoadingUser
  }
} 