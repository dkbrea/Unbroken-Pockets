// SCRIPT TO SYNC EXISTING DEBTS TO RECURRING TRANSACTIONS
// This script creates recurring payment records for all existing debts
// Run with: node sync_debt_recurring_transactions.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (replace with your own values)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncDebtsToRecurringTransactions() {
  console.log('Starting sync of existing debts to recurring transactions...');
  
  try {
    // Get all debts
    const { data: debts, error: debtsError } = await supabase
      .from('debts')
      .select('*');
    
    if (debtsError) {
      throw new Error(`Error fetching debts: ${debtsError.message}`);
    }
    
    console.log(`Found ${debts.length} debts to process`);
    
    // Iterate through each debt
    let created = 0;
    let skipped = 0;
    
    for (const debt of debts) {
      // Check if a recurring transaction already exists for this debt
      const { data: existingTransactions, error: checkError } = await supabase
        .from('recurring_transactions')
        .select('id')
        .eq('debt_id', debt.id);
      
      if (checkError) {
        console.error(`Error checking existing transactions for debt ${debt.id}: ${checkError.message}`);
        continue;
      }
      
      // Skip if a recurring transaction already exists
      if (existingTransactions && existingTransactions.length > 0) {
        console.log(`Skipping debt ${debt.id} (${debt.name}): Recurring transaction already exists`);
        skipped++;
        continue;
      }
      
      // Calculate the next payment date based on the due date
      const today = new Date();
      const nextDate = new Date();
      
      // Set day of month to the debt's due date (or default to 1st if not specified)
      const dueDay = debt.due_date || 1;
      nextDate.setDate(dueDay);
      
      // If the due date for this month has already passed, move to next month
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      // Format to ISO string and take the date part only (YYYY-MM-DD)
      const formattedDate = nextDate.toISOString().split('T')[0];
      
      // Insert the recurring transaction
      const { data: result, error: insertError } = await supabase
        .from('recurring_transactions')
        .insert([
          {
            name: `Payment for ${debt.name}`,
            amount: -Math.abs(debt.minimum_payment),
            frequency: 'Monthly',
            category: 'Debt Payment',
            next_date: formattedDate,
            status: 'active',
            payment_method: 'Default',
            user_id: debt.user_id,
            debt_id: debt.id,
            type: 'debt_payment'
          }
        ]);
      
      if (insertError) {
        console.error(`Error creating recurring transaction for debt ${debt.id}: ${insertError.message}`);
        console.error('Full error details:', JSON.stringify(insertError, null, 2));
      } else {
        console.log(`Created recurring transaction for debt ${debt.id} (${debt.name})`);
        created++;
      }
    }
    
    console.log('Sync completed!');
    console.log(`Results: ${created} recurring transactions created, ${skipped} already existed`);
    
    // Get count of debt-related recurring transactions
    const { data: recurringCount, error: countError } = await supabase
      .from('recurring_transactions')
      .select('id')
      .not('debt_id', 'is', null);
    
    if (!countError) {
      console.log(`Total debt-related recurring transactions in the system: ${recurringCount.length}`);
    }
    
  } catch (error) {
    console.error('Error syncing debts to recurring transactions:', error);
  }
}

// Execute the sync function
syncDebtsToRecurringTransactions()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err)); 