import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecurringTransactions() {
  try {
    // First, get all recurring transactions to see what's available
    const { data: allRecurring, error: allError } = await supabase
      .from('recurring_transactions')
      .select('*');

    console.log('All Recurring Transactions:');
    console.log(JSON.stringify(allRecurring, null, 2));

    // Then specifically look for ID 19
    console.log('\nLooking for Recurring Transaction #19:');
    const { data: recurring19, error: error19 } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', 19);

    if (error19) {
      console.error('Error fetching #19:', error19);
    } else {
      console.log(JSON.stringify(recurring19, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecurringTransactions();
