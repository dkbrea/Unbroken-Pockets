import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Define types for our data structures
interface BudgetEntry {
  id: number;
  user_id: string;
  category_id: number;
  month: string;
  allocated: number;
  spent: number;
  created_at: string;
  updated_at: string;
}

interface BudgetTransaction {
  id: number;
  user_id: string;
  transaction_id: number | null;
  category_id: number;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  date: string;
  name: string;
  category: string;
  amount: number;
  account: string;
  budget_category_id: number;
  [key: string]: any; // To accommodate additional fields
}

interface MonthCategoryGrouping {
  month: string;
  category_id: number;
  total_amount: number;
  transactions: BudgetTransaction[];
}

interface Discrepancy {
  category_id: number;
  month: string;
  budget_entry_spent: number;
  transactions_sum: number;
  difference: number;
}

interface MissingTransaction {
  category_id: number;
  month: string;
  budget_entry_spent: number;
}

export async function GET() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase credentials not configured' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Fetch data from budget_entries
    const { data: budgetEntries, error: entriesError } = await supabase
      .from('budget_entries')
      .select('*');
    
    if (entriesError) {
      throw new Error(`Error fetching budget_entries: ${entriesError.message}`);
    }
    
    // Fetch data from budget_transactions
    const { data: budgetTransactions, error: transactionsError } = await supabase
      .from('budget_transactions')
      .select('*');
    
    if (transactionsError) {
      throw new Error(`Error fetching budget_transactions: ${transactionsError.message}`);
    }
    
    // Fetch transactions with budget_category_id
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .not('budget_category_id', 'is', null);
    
    if (txError) {
      throw new Error(`Error fetching transactions: ${txError.message}`);
    }
    
    // Analyze for discrepancies
    const analysis = {
      discrepancies: [] as Discrepancy[],
      missingTransactions: [] as MissingTransaction[]
    };
    
    if (budgetEntries && budgetTransactions && budgetEntries.length > 0 && budgetTransactions.length > 0) {
      // Group budget transactions by category and month
      const transactionsByMonthAndCategory: Record<string, MonthCategoryGrouping> = {};
      
      budgetTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
        const key = `${month}_${transaction.category_id}`;
        
        if (!transactionsByMonthAndCategory[key]) {
          transactionsByMonthAndCategory[key] = {
            month,
            category_id: transaction.category_id,
            total_amount: 0,
            transactions: []
          };
        }
        
        transactionsByMonthAndCategory[key].total_amount += transaction.amount;
        transactionsByMonthAndCategory[key].transactions.push(transaction);
      });
      
      // Compare with budget entries
      budgetEntries.forEach(entry => {
        const month = entry.month.substring(0, 10); // Truncate to YYYY-MM-DD
        const key = `${month}_${entry.category_id}`;
        
        if (transactionsByMonthAndCategory[key]) {
          const transactionsTotal = transactionsByMonthAndCategory[key].total_amount;
          
          if (Math.abs(entry.spent - transactionsTotal) > 0.01) { // Allow for small floating point differences
            analysis.discrepancies.push({
              category_id: entry.category_id,
              month,
              budget_entry_spent: entry.spent,
              transactions_sum: transactionsTotal,
              difference: entry.spent - transactionsTotal
            });
          }
        } else {
          analysis.missingTransactions.push({
            category_id: entry.category_id,
            month,
            budget_entry_spent: entry.spent
          });
        }
      });
    }
    
    // Return all the data
    return NextResponse.json({
      budget_entries: budgetEntries,
      budget_transactions: budgetTransactions,
      transactions_with_budget_category: transactions,
      analysis
    });
    
  } catch (error: unknown) {
    console.error('Error in budget-data API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 