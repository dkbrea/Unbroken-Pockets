import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, parseISO, startOfMonth } from 'date-fns';

interface BudgetTransaction {
  id: number;
  user_id: string;
  transaction_id: number | null;
  category_id: number;
  amount: number;
  date: string;
  description: string | null;
}

export async function POST() {
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
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error(userError?.message || 'User not authenticated');
    }
    
    // 1. Get distinct category_id and month combinations from budget_transactions
    const { data: distinctCombos, error: distinctError } = await supabase
      .from('budget_transactions')
      .select('category_id, date')
      .eq('user_id', user.id);
    
    if (distinctError) {
      throw new Error(`Error fetching distinct categories and months: ${distinctError.message}`);
    }
    
    // Transform dates to month starts and create unique combinations
    const monthCategoryMap = new Map<string, Set<number>>();
    
    distinctCombos?.forEach(combo => {
      const date = parseISO(combo.date);
      const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
      
      if (!monthCategoryMap.has(monthStart)) {
        monthCategoryMap.set(monthStart, new Set());
      }
      
      monthCategoryMap.get(monthStart)?.add(combo.category_id);
    });
    
    const results = {
      updated: 0,
      created: 0,
      errors: 0,
      details: [] as string[]
    };
    
    // Process each unique month and category combination
    for (const [month, categories] of monthCategoryMap.entries()) {
      for (const categoryId of categories) {
        try {
          // Get sum of transactions for this month and category
          const monthDate = new Date(month);
          const nextMonth = new Date(monthDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const nextMonthFormatted = format(nextMonth, 'yyyy-MM-dd');
          
          const { data: transactions, error: txError } = await supabase
            .from('budget_transactions')
            .select('amount')
            .eq('category_id', categoryId)
            .eq('user_id', user.id)
            .gte('date', month)
            .lt('date', nextMonthFormatted);
          
          if (txError) {
            throw new Error(`Error fetching transactions: ${txError.message}`);
          }
          
          const totalAmount = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
          
          // Check if budget entry exists
          const { data: existingEntries, error: entriesError } = await supabase
            .from('budget_entries')
            .select('*')
            .eq('category_id', categoryId)
            .eq('user_id', user.id)
            .eq('month', month);
          
          if (entriesError) {
            throw new Error(`Error checking for existing entries: ${entriesError.message}`);
          }
          
          if (existingEntries && existingEntries.length > 0) {
            // Update existing entry (spent value only)
            const { error: updateError } = await supabase
              .from('budget_entries')
              .update({
                spent: totalAmount,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingEntries[0].id);
            
            if (updateError) {
              throw new Error(`Error updating entry: ${updateError.message}`);
            }
            
            results.updated++;
            results.details.push(`Updated category ${categoryId} for ${month}: ${existingEntries[0].spent} → ${totalAmount}`);
          } else {
            // Create new entry
            const { error: insertError } = await supabase
              .from('budget_entries')
              .insert({
                category_id: categoryId,
                month: month,
                allocated: 0, // Default allocation
                spent: totalAmount,
                user_id: user.id
              });
            
            if (insertError) {
              throw new Error(`Error creating entry: ${insertError.message}`);
            }
            
            results.created++;
            results.details.push(`Created new entry for category ${categoryId} for ${month}: ${totalAmount}`);
          }
        } catch (error) {
          console.error(`Error processing category ${categoryId} for ${month}:`, error);
          results.errors++;
          results.details.push(`Error with category ${categoryId} for ${month}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Synchronized budget entries with budget transactions: ${results.updated} updated, ${results.created} created, ${results.errors} errors`,
      results
    });
    
  } catch (error: unknown) {
    console.error('Error in sync-budget-data API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
} 