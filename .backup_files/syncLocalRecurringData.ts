import { supabase } from './supabase';
import { RecurringTransaction } from '@/hooks/useRecurringData';

/**
 * Synchronizes all locally stored recurring transactions to Supabase
 * @returns Object with results of the sync operation
 */
export async function syncLocalRecurringToSupabase(): Promise<{
  success: boolean;
  newlySynced: number;
  alreadySynced: number;
  failed: number;
  error?: any;
}> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      return { 
        success: false, 
        newlySynced: 0, 
        alreadySynced: 0, 
        failed: 0,
        error: userError || new Error("User not authenticated") 
      };
    }
    
    // Get local transactions
    const localDataStr = localStorage.getItem('recurring_transactions');
    if (!localDataStr) {
      console.log("No local transactions found");
      return { success: true, newlySynced: 0, alreadySynced: 0, failed: 0 };
    }
    
    const localTransactions: RecurringTransaction[] = JSON.parse(localDataStr);
    if (!localTransactions || localTransactions.length === 0) {
      console.log("No local transactions found");
      return { success: true, newlySynced: 0, alreadySynced: 0, failed: 0 };
    }
    
    console.log(`Found ${localTransactions.length} local transactions`);
    
    // Fetch existing transactions from Supabase
    const { data: existingTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id);
    
    if (fetchError) {
      console.error("Error fetching existing transactions:", fetchError);
      return { 
        success: false, 
        newlySynced: 0, 
        alreadySynced: 0, 
        failed: 0,
        error: fetchError 
      };
    }
    
    // Find transactions that exist locally but not in the database
    const transactionsToSync = localTransactions.filter(localTx => {
      // Skip if it already has a valid database ID (positive number) and exists in the database
      if (typeof localTx.id === 'number' && localTx.id > 0) {
        return !existingTransactions.some(dbTx => dbTx.id === localTx.id);
      }
      
      // Otherwise check by name, amount, and date
      return !existingTransactions.some(dbTx => 
        dbTx.name === localTx.name && 
        dbTx.amount === localTx.amount && 
        dbTx.next_date === localTx.nextDate
      );
    });
    
    console.log(`Found ${transactionsToSync.length} transactions to sync`);
    
    if (transactionsToSync.length === 0) {
      console.log("No new transactions to sync");
      return { 
        success: true, 
        newlySynced: 0, 
        alreadySynced: localTransactions.length, 
        failed: 0 
      };
    }
    
    // Process each transaction individually for better error handling
    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    for (const tx of transactionsToSync) {
      try {
        // Convert local format to database format
        const transactionToInsert = {
          name: tx.name,
          amount: tx.amount,
          frequency: tx.frequency,
          category: tx.category,
          next_date: tx.nextDate,
          status: tx.status || 'active',
          payment_method: tx.paymentMethod,
          user_id: user.id,
          type: tx.type || 'expense',
          description: tx.description || '',
          start_date: tx.startDate || tx.nextDate,
          // Only include debt_id if it's a valid number
          ...(tx.debtId && typeof tx.debtId === 'number' ? { debt_id: tx.debtId } : {})
        };
        
        console.log(`Inserting transaction: ${tx.name}`);
        
        // Insert into Supabase one at a time
        const { data, error: insertError } = await supabase
          .from('recurring_transactions')
          .insert([transactionToInsert])
          .select();
        
        if (insertError) {
          console.error(`Error inserting transaction '${tx.name}':`, insertError);
          if (insertError.details) console.error("Error details:", insertError.details);
          if (insertError.hint) console.error("Error hint:", insertError.hint);
          
          failedCount++;
          errors.push({
            transaction: tx.name,
            error: insertError
          });
        } else {
          console.log(`Successfully inserted transaction '${tx.name}'`);
          successCount++;
        }
      } catch (error) {
        console.error(`Unexpected error processing transaction '${tx.name}':`, error);
        failedCount++;
        errors.push({
          transaction: tx.name,
          error
        });
      }
    }
    
    console.log(`Successfully synced ${successCount} transactions, failed to sync ${failedCount} transactions`);
    if (errors.length > 0) {
      console.error("Errors:", errors);
    }
    
    return {
      success: failedCount === 0,
      newlySynced: successCount,
      alreadySynced: localTransactions.length - transactionsToSync.length,
      failed: failedCount,
      error: errors.length > 0 ? { errors, message: `Failed to sync ${failedCount} transactions` } : undefined
    };
  } catch (error) {
    console.error("Unexpected error during sync:", error);
    return {
      success: false,
      newlySynced: 0,
      alreadySynced: 0,
      failed: 0,
      error
    };
  }
} 