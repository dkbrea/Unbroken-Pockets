import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecurringTransactions() {
  try {
    // Get all recurring transactions
    const { data: allRecurring, error: allError } = await supabase
      .from('recurring_transactions')
      .select('*');

    if (allError) {
      console.error('Error fetching all recurring:', allError);
    } else {
      console.log('All Recurring Transactions:');
      console.log(JSON.stringify(allRecurring, null, 2));
    }

    // Look specifically for ID 19
    const { data: recurring19, error: error19 } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', 19);

    if (error19) {
      console.error('\nError fetching #19:', error19);
    } else {
      console.log('\nRecurring Transaction #19:');
      console.log(JSON.stringify(recurring19, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecurringTransactions();
