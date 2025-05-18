import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRecurring } from './useSupabaseData';
import { supabase } from '../lib/supabase';

export type RecurringTransaction = {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  nextDate: string;
  status: 'active' | 'paused';
  paymentMethod: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  description: string;
  startDate: string;
  debtId?: number;
  isProjected?: boolean; // Flag to indicate this is a projected occurrence
};

// Add a new viewMode type
export type RecurringViewMode = 'list' | 'calendar';

export type RecurringState = {
  searchQuery: string;
  viewType: 'upcoming' | 'all';
  viewMode: RecurringViewMode;
  recurringTransactions: RecurringTransaction[];
  filteredTransactions: RecurringTransaction[];
  displayTransactions: RecurringTransaction[];
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebt: number;
  netMonthly: number;
  calendarMonth: Date;
  setCalendarMonth: (month: Date) => void;
  calculateMonthIncome: (month: Date, transactions: RecurringTransaction[]) => number;
  calculateMonthExpenses: (month: Date, transactions: RecurringTransaction[]) => number;
  calculateMonthDebt: (month: Date, transactions: RecurringTransaction[]) => number;
  setSearchQuery: (query: string) => void;
  setViewType: (type: 'upcoming' | 'all') => void;
  setViewMode: (mode: RecurringViewMode) => void;
  addRecurringTransaction: (transaction: RecurringTransactionInput) => Promise<void>;
  editRecurringTransaction: (id: number, updatedTransaction: RecurringTransactionInput) => Promise<void>;
  deleteRecurringTransaction: (id: number) => Promise<void>;
};

// Define the RecurringTransactionInput type
export type RecurringTransactionInput = Omit<RecurringTransaction, 'id' | 'user_id' | 'createdAt' | 'updatedAt' | 'type'> & {
  id?: number;
  status?: 'active' | 'paused';
  type: string;
};

export function useRecurringData(): RecurringState {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'upcoming' | 'all'>('upcoming');
  const [viewMode, setViewMode] = useState<RecurringViewMode>('list');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
  // Get data from Supabase
  const { recurringTransactions = [], isLoading, mutate, error } = useRecurring();
  
  // Debug log when recurring transactions change
  useEffect(() => {
    console.log("Current recurring transactions:", recurringTransactions);
    // Look for debt transactions specifically - only consider it a debt transaction if debtId is non-null
    const debtTransactions = recurringTransactions.filter(tx => tx.debtId !== undefined && tx.debtId !== null);
    console.log("Debt-related transactions:", debtTransactions);
  }, [recurringTransactions]);
  
  // Track transactions for UI updates
  const [localTransactions, setLocalTransactions] = useState<RecurringTransaction[]>([]);
  
  // Initialize local transactions from localStorage if available
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem('recurring_transactions');
      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions);
        console.log("Loaded transactions from localStorage:", parsedTransactions);
        setLocalTransactions(parsedTransactions);
      }
    } catch (err) {
      console.error("Error loading transactions from localStorage:", err);
    }
  }, []);
  
  // Update local transactions when recurringTransactions change
  useEffect(() => {
    if (recurringTransactions && recurringTransactions.length > 0) {
      // Merge with local transactions that might not be in the database yet
      const mergedTransactions = [...recurringTransactions];
      
      // Find any local transactions that don't have a match in the database
      localTransactions.forEach(localTx => {
        // Check if this transaction exists in the database results
        const existsInDB = recurringTransactions.some(dbTx => 
          // Compare by ID if it's a number, otherwise compare by content
          (typeof localTx.id === 'number' && typeof dbTx.id === 'number' && localTx.id === dbTx.id) ||
          (localTx.name === dbTx.name && localTx.amount === dbTx.amount && localTx.nextDate === dbTx.nextDate)
        );
        
        // If it's not in the database, add it to our merged list
        if (!existsInDB) {
          mergedTransactions.push(localTx);
        }
      });
      
      console.log("Merged transactions:", mergedTransactions);
      
      // Debug debt transactions specifically
      const debtTransactions = mergedTransactions.filter(tx => tx.debtId !== undefined && tx.debtId !== null);
      console.log("Debt transactions (all):", debtTransactions);
      
      // Verify that debt transactions have all necessary fields
      const verifiedTransactions = mergedTransactions.map(tx => {
        if (tx.debtId !== undefined && tx.debtId !== null) {
          console.log(`Processing debt transaction: ${tx.name} (ID: ${tx.id}, DebtID: ${tx.debtId})`);
        }
        return tx;
      });
      
      // Save to localStorage for persistence before setting state to avoid feedback loop
      try {
        localStorage.setItem('recurring_transactions', JSON.stringify(verifiedTransactions));
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }
      
      // Update state at the end
      setLocalTransactions(verifiedTransactions);
    }
  }, [recurringTransactions]);
  
  // Calculate summary values
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyDebt, setMonthlyDebt] = useState(0);
  const [netMonthly, setNetMonthly] = useState(0);
  
  // Get current user from supabase
  const [user, setUser] = useState<{ id: string } | null>(null);
  
  // Load user on component mount
  useEffect(() => {
    const loadUser = async () => {
      if (supabase) {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          setUser(data.user);
        } else {
          console.error("Error loading user:", error);
        }
      }
    };
    
    loadUser();
  }, []);
  
  // Periodically check for orphaned debt transactions that reference deleted debts
  useEffect(() => {
    // Only run this if we have debt-related transactions and a user
    const debtTransactions = localTransactions.filter(tx => tx.debtId !== undefined && tx.debtId !== null);
    if (debtTransactions.length === 0 || !user) return;
    
    const validateDebtTransactions = async () => {
      if (!supabase) return;
      
      try {
        console.log("Validating debt-related recurring transactions...");
        
        // Get all existing debt IDs for this user
        const { data: debts, error: debtsError } = await supabase
          .from("debts")
          .select("id")
          .eq("user_id", user.id);
          
        if (debtsError) {
          console.error("Error fetching debts for validation:", debtsError);
          return;
        }
        
        // Create a set of valid debt IDs for fast lookup
        const validDebtIds = new Set((debts || []).map(d => d.id));
        console.log("Valid debt IDs:", Array.from(validDebtIds));
        
        // Find orphaned debt transactions (transactions with debt_id that no longer exists)
        const orphanedTransactions = debtTransactions.filter(tx => 
          tx.debtId && !validDebtIds.has(tx.debtId)
        );
        
        if (orphanedTransactions.length > 0) {
          console.log(`Found ${orphanedTransactions.length} orphaned debt transactions:`, orphanedTransactions);
          
          // Remove orphaned transactions from local state
          const cleanedTransactions = localTransactions.filter(tx => 
            !tx.debtId || validDebtIds.has(tx.debtId)
          );
          
          // Update local state if we found orphaned transactions
          if (cleanedTransactions.length < localTransactions.length) {
            console.log(`Removing ${localTransactions.length - cleanedTransactions.length} orphaned transactions`);
            setLocalTransactions(cleanedTransactions);
            
            // Also save to localStorage
            localStorage.setItem('recurring_transactions', JSON.stringify(cleanedTransactions));
            
            // Try to delete them from the database as well
            for (const tx of orphanedTransactions) {
              if (typeof tx.id === 'number' && tx.id > 0) {
                try {
                  const { error: deleteError } = await supabase
                    .from("recurring_transactions")
                    .delete()
                    .eq("id", tx.id);
                  
                  if (deleteError) {
                    console.error(`Error deleting orphaned transaction ${tx.id}:`, deleteError);
                  } else {
                    console.log(`Successfully deleted orphaned transaction ${tx.id} from database`);
                  }
                } catch (err) {
                  console.error(`Error deleting orphaned transaction ${tx.id}:`, err);
                }
              }
            }
            
            // Force refresh data
            mutate();
          } else {
            console.log("No orphaned transactions to remove");
          }
        } else {
          console.log("No orphaned debt transactions found");
        }
      } catch (err) {
        console.error("Error validating debt transactions:", err);
      }
    };
    
    // Run validation on component mount and when transactions change
    validateDebtTransactions();
    
  }, [localTransactions, supabase, user, mutate]);
  
  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!localTransactions || localTransactions.length === 0 || isLoading) return [];
    
    const filtered = localTransactions.filter(transaction => 
      transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log("Filtered transactions:", filtered);
    return filtered;
  }, [localTransactions, searchQuery, isLoading]);
  
  // For upcoming view, show active transactions within the next 30 days and project recurring instances
  const displayTransactions = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];
    
    let displayed = [];
    if (viewType === 'upcoming') {
      // Get today and 30 days from today
      const today = new Date();
      const next30Days = new Date(today);
      next30Days.setDate(today.getDate() + 30);
      
      // Format for comparison
      const todayStr = today.toISOString().split('T')[0];
      const next30DaysStr = next30Days.toISOString().split('T')[0];
      
      console.log(`Filtering upcoming transactions between ${todayStr} and ${next30DaysStr}`);
      
      // First, get transactions with nextDate already in the range
      const immediateTransactions = filteredTransactions
        .filter(t => t.status === 'active' && t.nextDate >= todayStr && t.nextDate <= next30DaysStr);
      
      // Add these to our displayed transactions
      displayed = [...immediateTransactions];
      
      // Now, project additional occurrences for recurring transactions
      const activeTransactions = filteredTransactions.filter(t => t.status === 'active');
      
      // For each active transaction, project occurrences based on frequency
      activeTransactions.forEach(transaction => {
        // Skip if the transaction's nextDate is already in our displayed list
        if (immediateTransactions.some(t => t.id === transaction.id)) {
          return;
        }
        
        // Get the base date to project from
        const baseDate = new Date(transaction.nextDate);
        
        // Project based on frequency
        const projectedDates: Date[] = [];
        
        switch (transaction.frequency.toLowerCase()) {
          case 'daily':
            // Project daily occurrences
            for (let i = 1; i <= 30; i++) {
              const projectedDate = new Date(baseDate);
              projectedDate.setDate(baseDate.getDate() + i);
              
              if (projectedDate > today && projectedDate <= next30Days) {
                projectedDates.push(projectedDate);
              }
            }
            break;
            
          case 'weekly':
            // Project weekly occurrences
            for (let i = 1; i <= 4; i++) {
              const projectedDate = new Date(baseDate);
              projectedDate.setDate(baseDate.getDate() + (i * 7));
              
              if (projectedDate > today && projectedDate <= next30Days) {
                projectedDates.push(projectedDate);
              }
            }
            break;
            
          case 'bi-weekly':
            // Project bi-weekly occurrences
            for (let i = 1; i <= 2; i++) {
              const projectedDate = new Date(baseDate);
              projectedDate.setDate(baseDate.getDate() + (i * 14));
              
              if (projectedDate > today && projectedDate <= next30Days) {
                projectedDates.push(projectedDate);
              }
            }
            break;
            
          case 'semi-monthly':
            // Project semi-monthly occurrences (usually 1st and 15th)
            // For simplicity, we'll just add 15 days to the base date
            const semiMonthlyDate = new Date(baseDate);
            semiMonthlyDate.setDate(baseDate.getDate() + 15);
            
            if (semiMonthlyDate > today && semiMonthlyDate <= next30Days) {
              projectedDates.push(semiMonthlyDate);
            }
            break;
            
          case 'monthly':
            // Project monthly occurrence
            const monthlyDate = new Date(baseDate);
            monthlyDate.setMonth(baseDate.getMonth() + 1);
            
            if (monthlyDate > today && monthlyDate <= next30Days) {
              projectedDates.push(monthlyDate);
            }
            break;
            
          case 'quarterly':
            // Project quarterly occurrence
            const quarterlyDate = new Date(baseDate);
            quarterlyDate.setMonth(baseDate.getMonth() + 3);
            
            if (quarterlyDate > today && quarterlyDate <= next30Days) {
              projectedDates.push(quarterlyDate);
            }
            break;
        }
        
        // For each projected date, create a copy of the transaction with the new date
        projectedDates.forEach(date => {
          const projectedTransaction = {
            ...transaction,
            nextDate: date.toISOString().split('T')[0],
            isProjected: true, // Flag to indicate this is a projected occurrence
          };
          
          displayed.push(projectedTransaction);
        });
      });
      
      // Sort all transactions by date
      displayed.sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
      
      console.log(`Found ${displayed.length} upcoming transactions in the next 30 days (including projections)`);
    } else {
      displayed = filteredTransactions;
    }
    
    console.log("Display transactions:", displayed);
    return displayed;
  }, [filteredTransactions, viewType]);
  
  // Helper function to calculate monthly multiplier based on frequency
  const getMonthlyMultiplier = useCallback((frequency: string): number => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 30; // Approximate days in a month
      case 'weekly':
        return 4.33; // Average weeks in a month (52/12)
      case 'bi-weekly':
        return 2.17; // Bi-weekly is roughly 26 times per year, so 26/12
      case 'semi-monthly':
        return 2; // Exactly twice per month
      case 'monthly':
        return 1;
      case 'quarterly':
        return 1/3; // 4 times per year, so divided by 12 months
      case 'semi-annually':
        return 1/6; // 2 times per year
      case 'annually':
        return 1/12; // Once per year
      default:
        return 1;
    }
  }, []);

  // Helper function to count occurrences of a transaction in a specific month
  const countOccurrencesInMonth = useCallback((transaction: RecurringTransaction, month: Date): number => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    
    // Parse transaction date
    const nextDateStr = transaction.nextDate;
    const [yearStr, monthStr, dayStr] = nextDateStr.split('-').map(num => parseInt(num, 10));
    const nextDate = new Date(yearStr, monthStr - 1, dayStr);
    
    // If it's not active, return 0
    if (transaction.status !== 'active') {
      return 0;
    }
    
    // Count how many times this transaction occurs in the month
    switch (transaction.frequency.toLowerCase()) {
      case 'daily':
        return daysInMonth;
      case 'weekly':
        // Calculate how many of the same weekday fall in this month
        let count = 0;
        const weekday = nextDate.getDay();
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, monthNum, day);
          if (date.getDay() === weekday) count++;
        }
        return count;
      case 'bi-weekly':
        // Improved bi-weekly calculation to ensure accurate count
        // Find all potential dates in the month that match the biweekly pattern
        const firstDayOfMonth = new Date(year, monthNum, 1);
        const lastDayOfMonth = new Date(year, monthNum, daysInMonth);
        
        // Start by finding a reference point
        // We'll go back in time to find a known occurrence, then project forward
        let referenceDate = new Date(nextDate);
        
        // Make sure our reference date is in the past relative to the month we're checking
        // Go back far enough to ensure we capture all possible occurrences
        // Going back at least 6 months should be more than sufficient
        const sixMonthsAgo = new Date(year, monthNum - 6, 1);
        while (referenceDate > sixMonthsAgo) {
          const prevDate = new Date(referenceDate);
          prevDate.setDate(prevDate.getDate() - 14);
          referenceDate = prevDate;
        }
        
        // Now count forward from this reference date
        let biWeeklyCount = 0;
        let currentDate = new Date(referenceDate);
        
        // Keep advancing by 14 days and counting occurrences in our target month
        while (currentDate <= lastDayOfMonth) {
          if (currentDate.getMonth() === monthNum && currentDate.getFullYear() === year) {
            biWeeklyCount++;
          }
          currentDate.setDate(currentDate.getDate() + 14);
        }
        
        // Debug output
        console.log(`Bi-weekly occurrences for ${transaction.name} in ${month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}: ${biWeeklyCount}, start date: ${referenceDate.toLocaleDateString()}`);
        
        return biWeeklyCount;
      case 'semi-monthly':
        // Semi-monthly is typically 1st and 15th
        // Special case: if it's February and month has 28 days, check if both dates fall inside the month
        return 2;
      case 'monthly':
        // Check if the day exists in the month we're checking
        return (dayStr <= daysInMonth) ? 1 : 0;
      case 'quarterly':
        // Check if this quarter month matches our target month
        const quarterMonths = [
          monthStr - 1, 
          (monthStr + 2) % 12, 
          (monthStr + 5) % 12, 
          (monthStr + 8) % 12
        ];
        return quarterMonths.includes(monthNum) ? 1 : 0;
      case 'semi-annually':
        // Check if this semi-annual month matches our target month
        const semiMonths = [monthStr - 1, (monthStr + 5) % 12];
        return semiMonths.includes(monthNum) ? 1 : 0;
      case 'annually':
        // Check if this annual month matches our target month
        return (monthStr - 1 === monthNum) ? 1 : 0;
      default:
        return 1;
    }
  }, []);
  
  // Function to calculate income for a specific month
  const calculateMonthIncome = useCallback((month: Date, transactions: RecurringTransaction[]): number => {
    // Filter for active income transactions
    const incomeTransactions = transactions.filter(t => t.amount > 0 && t.status === 'active');
    
    console.log(`Calculating income for ${month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}`);
    
    // Sum up all income for the month with detailed logging
    const incomeTotal = incomeTransactions.reduce((total, transaction) => {
      const occurrences = countOccurrencesInMonth(transaction, month);
      const amount = transaction.amount * occurrences;
      
      console.log(`${transaction.name} (${transaction.frequency}): $${transaction.amount} x ${occurrences} = $${amount}`);
      
      return total + amount;
    }, 0);
    
    console.log(`Total income for ${month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}: $${incomeTotal}`);
    
    return incomeTotal;
  }, [countOccurrencesInMonth]);
  
  // Function to calculate expenses for a specific month
  const calculateMonthExpenses = useCallback((month: Date, transactions: RecurringTransaction[]): number => {
    // Filter for active expense transactions that are not debt payments
    const expenseTransactions = transactions.filter(t => 
      t.amount < 0 && 
      t.status === 'active' && 
      t.type !== 'debt_payment' && // Exclude debt_payment type
      !t.debtId // Also exclude transactions with debtId for backward compatibility
    );
    
    console.log(`Calculating expenses for ${month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}`);
    
    // Sum up all expenses for the month with detailed logging
    const expenseTotal = expenseTransactions.reduce((total, transaction) => {
      const occurrences = countOccurrencesInMonth(transaction, month);
      const amount = Math.abs(transaction.amount) * occurrences;
      
      console.log(`${transaction.name} (${transaction.frequency}): $${Math.abs(transaction.amount)} x ${occurrences} = $${amount}`);
      
      return total + amount;
    }, 0);
    
    console.log(`Total expenses for ${month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}: $${expenseTotal}`);
    
    return expenseTotal;
  }, [countOccurrencesInMonth]);
  
  // Function to calculate debt payments for a specific month
  const calculateMonthDebt = useCallback((month: Date, transactions: RecurringTransaction[]): number => {
    // Filter for active debt payments (either by type or by debtId)
    const debtTransactions = transactions.filter(t => 
      t.amount < 0 && 
      t.status === 'active' && 
      (t.type === 'debt_payment' || (t.debtId !== undefined && t.debtId !== null))
    );
    
    console.log(`Calculating debt payments for ${month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}`);
    
    // Sum up all debt payments for the month with detailed logging
    const debtTotal = debtTransactions.reduce((total, transaction) => {
      const occurrences = countOccurrencesInMonth(transaction, month);
      const amount = Math.abs(transaction.amount) * occurrences;
      
      console.log(`${transaction.name} (${transaction.frequency}): $${Math.abs(transaction.amount)} x ${occurrences} = $${amount}`);
      
      return total + amount;
    }, 0);
    
    console.log(`Total debt payments for ${month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}: $${debtTotal}`);
    
    return debtTotal;
  }, [countOccurrencesInMonth]);
  
  // Update summary values when displayTransactions change
  useEffect(() => {
    if (displayTransactions && displayTransactions.length > 0) {
      // Debug active debt transactions
      const activeDebtTransactions = displayTransactions.filter(t => t.amount < 0 && t.debtId && t.status === 'active');
      console.log("Active debt transactions:", activeDebtTransactions);
      
      // If in calendar view, use the calendar month for calculations
      if (viewMode === 'calendar') {
        const income = calculateMonthIncome(calendarMonth, displayTransactions);
        const expenses = calculateMonthExpenses(calendarMonth, displayTransactions);
        const debt = calculateMonthDebt(calendarMonth, displayTransactions);
        const net = income - expenses;
        
        setMonthlyIncome(income);
        setMonthlyExpenses(expenses);
        setMonthlyDebt(debt);
        setNetMonthly(net);
        
        console.log("Updated calendar summary values:", { income, expenses, debt, net });
      } else {
        // For list view, use the standard frequency-based calculation
        const income = displayTransactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => {
            const monthlyMultiplier = getMonthlyMultiplier(t.frequency);
            return sum + (Math.abs(t.amount) * monthlyMultiplier);
          }, 0);
          
        // Calculate expenses with frequency adjustment
        const expenses = displayTransactions
          .filter(t => 
            t.amount < 0 && 
            t.type !== 'debt_payment' && // Exclude debt_payment type
            !(t.debtId !== undefined && t.debtId !== null) // Use the proper check for debtId
          )
          .reduce((sum, t) => {
            const monthlyMultiplier = getMonthlyMultiplier(t.frequency);
            return sum + (Math.abs(t.amount) * monthlyMultiplier);
          }, 0);
        
        // Calculate debt payments separately
        const debtTransactions = displayTransactions.filter(t => 
          t.amount < 0 && 
          (t.type === 'debt_payment' || (t.debtId !== undefined && t.debtId !== null))
        );
        console.log("Debt transactions for calculation:", debtTransactions);
        
        const debt = debtTransactions.reduce((sum, t) => {
          const monthlyMultiplier = getMonthlyMultiplier(t.frequency);
          const payment = Math.abs(t.amount) * monthlyMultiplier;
          console.log(`Debt payment for ${t.name}: $${Math.abs(t.amount)} x ${monthlyMultiplier} = $${payment}`);
          return sum + payment;
        }, 0);
          
        // Calculate net (should already account for frequency since we're using adjusted income and expenses)
        const net = income - expenses;
        
        setMonthlyIncome(income);
        setMonthlyExpenses(expenses);
        setMonthlyDebt(debt);
        setNetMonthly(net);
        
        console.log("Updated list summary values with frequency adjustment:", { income, expenses, debt, net });
      }
    } else {
      setMonthlyIncome(0);
      setMonthlyExpenses(0);
      setMonthlyDebt(0);
      setNetMonthly(0);
    }
  }, [displayTransactions, calendarMonth, viewMode, calculateMonthIncome, calculateMonthExpenses, calculateMonthDebt, getMonthlyMultiplier]);

  // Add a new recurring transaction
  const addRecurringTransaction = async (transaction: RecurringTransactionInput) => {
    if (!supabase || !user) {
      console.error("Supabase or user not available");
      return;
    }

    console.log("Current user:", user);
    
    try {
      // Create a client-side transaction with a temporary ID for display
      const tempId = -(Math.floor(Math.random() * 10000));
      const clientTransaction: RecurringTransaction = {
        id: tempId,
        ...transaction,
        status: transaction.status || 'active',
        user_id: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Try to insert into Supabase
      const { data, error } = await supabase
        .from("recurring_transactions")
        .insert([
          {
            name: transaction.name,
            amount: transaction.amount,
            type: transaction.type,
            frequency: transaction.frequency,
            start_date: transaction.startDate,
            next_date: transaction.nextDate,
            description: transaction.description || "",
            status: transaction.status || "active",
            category: transaction.category,
            payment_method: transaction.paymentMethod,
            user_id: user.id
          },
        ])
        .select();
      
      if (error) {
        console.error("Error adding recurring transaction:", error.message);
        throw new Error(error.message);
      }

      // Successfully added to database - data will contain the newly added record
      console.log("Successfully added recurring transaction:", data);

      // If it's an income transaction, also add it to the income_sources table
      if (transaction.type === 'income' && data && data.length > 0) {
        const recurringId = data[0].id;
        
        console.log("Adding to income_sources with recurring transaction ID:", recurringId);
        
        const { error: incomeError } = await supabase
          .from("income_sources")
          .insert([
            {
              recurring_transaction_id: recurringId,
              user_id: user?.id,
              name: transaction.name,
              category: transaction.category,
              amount: transaction.amount,
              next_date: transaction.nextDate,
              frequency: transaction.frequency,
              type: transaction.type,
              status: transaction.status || "active",
              payment_method: transaction.paymentMethod,
              notes: transaction.description || "",
              // id is auto-generated
            },
          ]);
        
        if (incomeError) {
          console.error("Error adding income source:", incomeError.message);
          // Don't throw here, we already added the recurring transaction successfully
        } else {
          console.log("Successfully added income source for recurring transaction ID:", recurringId);
        }
      }
      
      // If it's an expense transaction, also add it to the fixed_expenses table
      if (transaction.type === 'expense' && data && data.length > 0) {
        const recurringId = data[0].id;
        
        console.log("Adding to fixed_expenses with recurring transaction ID:", recurringId);
        
        const { error: expenseError } = await supabase
          .from("fixed_expenses")
          .insert([
            {
              recurring_transaction_id: recurringId,
              // No need to duplicate data as we will join with the recurring_transactions table
            },
          ]);
        
        if (expenseError) {
          console.error("Error adding fixed expense:", expenseError.message);
          // Don't throw here, we already added the recurring transaction successfully
        } else {
          console.log("Successfully added fixed expense for recurring transaction ID:", recurringId);
        }
      }

      // Refresh the transactions list
      mutate();
    } catch (error) {
      console.error("Error in addRecurringTransaction:", error);
      throw error;
    }
  };

  // Edit a recurring transaction
  const editRecurringTransaction = async (id: number, updatedTransaction: RecurringTransactionInput) => {
    if (!supabase || !user) {
      console.error("Supabase or user not available");
      return;
    }

    try {
      console.log("Editing recurring transaction:", id, updatedTransaction);
      
      // Get the existing transaction
      const existingTransaction = localTransactions.find(t => t.id === id);
      if (!existingTransaction) {
        console.error("Transaction not found for editing");
        return;
      }
      
      // Special handling for debt-related transactions
      if (existingTransaction.debtId) {
        console.log("Editing debt-related transaction");
        
        // For debt transactions, only allow editing certain fields
        const { data, error } = await supabase
          .from("recurring_transactions")
          .update({
            next_date: updatedTransaction.nextDate,
            amount: updatedTransaction.amount,
            status: updatedTransaction.status || "active",
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) {
          console.error("Error updating debt recurring transaction:", error);
        } else {
          console.log("Successfully updated debt transaction in database:", data);
          
          // If amount changed, update the debt information
          if (Math.abs(existingTransaction.amount) !== Math.abs(updatedTransaction.amount)) {
            try {
              // Find the debt
              const { data: debtData, error: debtFetchError } = await supabase
                .from("debts")
                .select("*")
                .eq("id", existingTransaction.debtId)
                .single();
                
              if (debtFetchError) {
                console.error("Error fetching related debt:", debtFetchError);
              } else if (debtData) {
                // Update the debt's minimum payment
                const { error: debtUpdateError } = await supabase
                  .from("debts")
                  .update({
                    minimumPayment: Math.abs(updatedTransaction.amount),
                    updated_at: new Date().toISOString()
                  })
                  .eq("id", existingTransaction.debtId);
                  
                if (debtUpdateError) {
                  console.error("Error updating related debt:", debtUpdateError);
                } else {
                  console.log("Updated minimum payment for debt:", existingTransaction.debtId);
                }
              }
            } catch (err) {
              console.error("Error syncing transaction update with debt:", err);
            }
          }
        }
      } else {
        // Normal editing for non-debt transactions - allow editing all fields
        const { data, error } = await supabase
          .from("recurring_transactions")
          .update({
            name: updatedTransaction.name,
            amount: updatedTransaction.amount,
            type: updatedTransaction.type,
            frequency: updatedTransaction.frequency,
            start_date: updatedTransaction.startDate,
            next_date: updatedTransaction.nextDate,
            description: updatedTransaction.description || "",
            status: updatedTransaction.status || "active",
            category: updatedTransaction.category,
            payment_method: updatedTransaction.paymentMethod,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) {
          console.error("Error updating recurring transaction:", error);
        } else {
          console.log("Successfully updated transaction in database:", data);
          
          // Check if the transaction type has changed
          if (existingTransaction.type !== updatedTransaction.type) {
            console.log(`Transaction type changed from ${existingTransaction.type} to ${updatedTransaction.type}`);
            
            // Handle transition between income and expense types
            if (existingTransaction.type === 'income' && updatedTransaction.type === 'expense') {
              console.log("Converting from income to expense - need to remove from income_sources and add to fixed_expenses");
              
              // Remove from income_sources
              const { error: removeIncomeError } = await supabase
                .from("income_sources")
                .delete()
                .eq("recurring_transaction_id", id);
                
              if (removeIncomeError) {
                console.error("Error removing from income_sources:", removeIncomeError);
              } else {
                console.log("Successfully removed from income_sources");
              }
              
              // Add to fixed_expenses
              const { error: addExpenseError } = await supabase
                .from("fixed_expenses")
                .insert([
                  {
                    recurring_transaction_id: id,
                  },
                ]);
                
              if (addExpenseError) {
                console.error("Error adding to fixed_expenses:", addExpenseError);
              } else {
                console.log("Successfully added to fixed_expenses");
              }
            } 
            else if (existingTransaction.type === 'expense' && updatedTransaction.type === 'income') {
              console.log("Converting from expense to income - need to remove from fixed_expenses and add to income_sources");
              
              // Remove from fixed_expenses
              const { error: removeExpenseError } = await supabase
                .from("fixed_expenses")
                .delete()
                .eq("recurring_transaction_id", id);
                
              if (removeExpenseError) {
                console.error("Error removing from fixed_expenses:", removeExpenseError);
              } else {
                console.log("Successfully removed from fixed_expenses");
              }
              
              // Add to income_sources
              const { error: addIncomeError } = await supabase
                .from("income_sources")
                .insert([
                  {
                    recurring_transaction_id: id,
                  },
                ]);
                
              if (addIncomeError) {
                console.error("Error adding to income_sources:", addIncomeError);
              } else {
                console.log("Successfully added to income_sources");
              }
            }
          }
        }
      }
      
      // Update in local state regardless of database result
      const updatedLocalTransactions = localTransactions.map(tx => {
        if (tx.id === id) {
          // For debt transactions, only update allowed fields
          if (existingTransaction.debtId) {
            return {
              ...tx,
              amount: updatedTransaction.amount,
              nextDate: updatedTransaction.nextDate,
              status: updatedTransaction.status || tx.status,
              updatedAt: new Date().toISOString(),
            };
          }
          // For normal transactions, update all fields
          return {
            ...tx,
            ...updatedTransaction,
            updatedAt: new Date().toISOString(),
          };
        }
        return tx;
      });
      
      setLocalTransactions(updatedLocalTransactions);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('recurring_transactions', JSON.stringify(updatedLocalTransactions));
        console.log("Saved updated transactions to localStorage");
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }

      // Force refresh data
      await mutate();
    } catch (err) {
      console.error("Unexpected error updating transaction:", err);
    }
  };

  // Delete a recurring transaction
  const deleteRecurringTransaction = async (id: number) => {
    if (!supabase || !user) {
      console.error("Supabase or user not available");
      return;
    }

    try {
      console.log("Deleting recurring transaction:", id);
      
      // Check if this is a debt-related transaction 
      const existingTransaction = displayTransactions.find(t => t.id === id);
      if (existingTransaction?.debtId) {
        console.error("Cannot directly delete debt transactions. Please delete the debt from the Debt Tracker page.");
        // Return without making changes
        return;
      }
      
      // Check if we need to remove from income_sources or fixed_expenses
      if (existingTransaction) {
        if (existingTransaction.type === 'income') {
          console.log("Removing entry from income_sources table");
          const { error: incomeError } = await supabase
            .from("income_sources")
            .delete()
            .eq("recurring_transaction_id", id);
            
          if (incomeError) {
            console.error("Error removing from income_sources:", incomeError);
          } else {
            console.log("Successfully removed from income_sources");
          }
        } 
        else if (existingTransaction.type === 'expense') {
          console.log("Removing entry from fixed_expenses table");
          const { error: expenseError } = await supabase
            .from("fixed_expenses")
            .delete()
            .eq("recurring_transaction_id", id);
            
          if (expenseError) {
            console.error("Error removing from fixed_expenses:", expenseError);
          } else {
            console.log("Successfully removed from fixed_expenses");
          }
        }
      }
      
      // Try to delete from Supabase
      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting recurring transaction:", error);
      } else {
        console.log("Successfully deleted transaction from database");
      }
      
      // Always update local state regardless of database result
      const updatedLocalTransactions = localTransactions.filter(tx => tx.id !== id);
      setLocalTransactions(updatedLocalTransactions);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('recurring_transactions', JSON.stringify(updatedLocalTransactions));
        console.log("Saved updated transactions to localStorage after delete");
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }

      // Force refresh data - this is a complete refresh from the database
      await mutate();
      
      // Additional step to ensure cache is cleared
      try {
        // Clear the localStorage cache and reload from server
        localStorage.removeItem('recurring_transactions');
        console.log("Cleared localStorage cache for recurring transactions");
        
        // Force a refresh from the server with a small delay
        setTimeout(() => {
          mutate();
        }, 300);
      } catch (err) {
        console.error("Error clearing cache:", err);
      }
    } catch (err) {
      console.error("Unexpected error deleting transaction:", err);
    }
  };

  // Debug log when there are errors
  useEffect(() => {
    if (error) {
      console.error("Error in recurring data hook:", error);
    }
  }, [error]);

  return {
    searchQuery,
    viewType,
    viewMode,
    recurringTransactions: localTransactions || [],
    filteredTransactions,
    displayTransactions,
    monthlyIncome,
    monthlyExpenses,
    monthlyDebt,
    netMonthly,
    calendarMonth,
    setCalendarMonth,
    calculateMonthIncome,
    calculateMonthExpenses,
    calculateMonthDebt,
    setSearchQuery,
    setViewType,
    setViewMode,
    addRecurringTransaction,
    editRecurringTransaction,
    deleteRecurringTransaction
  };
} 