import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key instead of anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function queryRecurringTransactions() {
  try {
    // Get all recurring transactions (no auth needed with service role)
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

queryRecurringTransactions();
