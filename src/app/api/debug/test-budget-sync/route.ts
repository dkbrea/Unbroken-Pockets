import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { startOfMonth, parseISO } from 'date-fns';

export async function POST(req: Request) {
  try {
    const { transactionId, categoryId, action } = await req.json();
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }
    
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
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    let result;
    
    if (action === 'mark') {
      if (!categoryId) {
        return NextResponse.json({ error: 'Category ID is required for mark action' }, { status: 400 });
      }
      
      // Mark transaction as budget expense
      const { data, error } = await supabase
        .from('transactions')
        .update({
          is_budget_expense: true,
          budget_category_id: categoryId,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      result = { 
        action: 'marked',
        transaction: data && data.length > 0 ? data[0] : null
      };
    } else if (action === 'unmark') {
      // Unmark transaction as budget expense
      const { data, error } = await supabase
        .from('transactions')
        .update({
          is_budget_expense: false,
          budget_category_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      result = { 
        action: 'unmarked',
        transaction: data && data.length > 0 ? data[0] : null
      };
    } else if (action === 'delete') {
      // First, get the transaction to save its details
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single();
      
      if (transactionError) {
        return NextResponse.json({ error: transactionError.message }, { status: 500 });
      }
      
      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      
      // Save category information if this is a budget expense
      let categoryInfo = null;
      let updatedEntry = null;
      
      if (transaction.is_budget_expense && transaction.budget_category_id) {
        const categoryId = transaction.budget_category_id;
        const transactionDate = parseISO(transaction.date);
        const monthStart = startOfMonth(transactionDate).toISOString().split('T')[0];
        
        // Save the current spent value for comparison
        const { data: preDeletionEntry } = await supabase
          .from('budget_entries')
          .select('*')
          .eq('category_id', categoryId)
          .eq('user_id', user.id)
          .eq('month', monthStart)
          .single();
        
        categoryInfo = {
          categoryId,
          month: monthStart,
          preDeletionSpent: preDeletionEntry?.spent || 0
        };
        
        // Now delete the transaction
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transactionId)
          .eq('user_id', user.id);
        
        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
        
        // Wait a brief moment for triggers to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check the budget entry to see if the spent value was updated
        const { data: postDeletionEntry } = await supabase
          .from('budget_entries')
          .select('*')
          .eq('category_id', categoryId)
          .eq('user_id', user.id)
          .eq('month', monthStart)
          .single();
        
        updatedEntry = postDeletionEntry;
      } else {
        // Not a budget expense, just delete it
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transactionId)
          .eq('user_id', user.id);
        
        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
      }
      
      result = {
        action: 'deleted',
        transaction,
        categoryInfo,
        updatedEntry
      };
    } else if (action === 'verify') {
      // Check if the transaction exists
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single();
      
      if (transactionError) {
        return NextResponse.json({ error: transactionError.message }, { status: 500 });
      }
      
      // Check if a corresponding budget_transaction exists
      const { data: budgetTransaction, error: budgetTransactionError } = await supabase
        .from('budget_transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('user_id', user.id);
      
      if (budgetTransactionError) {
        return NextResponse.json({ error: budgetTransactionError.message }, { status: 500 });
      }
      
      // If the transaction has a budget_category_id, check corresponding budget entry
      let budgetEntry = null;
      if (transaction.budget_category_id) {
        // Extract the month from the transaction date
        const transactionDate = new Date(transaction.date);
        const monthStart = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1).toISOString().split('T')[0];
        
        const { data: entry, error: entryError } = await supabase
          .from('budget_entries')
          .select('*')
          .eq('category_id', transaction.budget_category_id)
          .eq('user_id', user.id)
          .eq('month', monthStart);
        
        if (entryError) {
          return NextResponse.json({ error: entryError.message }, { status: 500 });
        }
        
        budgetEntry = entry && entry.length > 0 ? entry[0] : null;
      }
      
      result = {
        action: 'verified',
        transaction,
        budgetTransaction: budgetTransaction && budgetTransaction.length > 0 ? budgetTransaction[0] : null,
        budgetEntry
      };
    } else {
      return NextResponse.json({ error: 'Invalid action, must be "mark", "unmark", "verify", or "delete"' }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error in test-budget-sync API route:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 