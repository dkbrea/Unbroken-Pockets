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

async function queryRecurringTransactions() {
  try {
    // First get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }

    if (!session) {
      console.log('No active session. Please log in through the app first.');
      return;
    }

    console.log('Authenticated as user:', session.user.id);

    // Now try to get recurring transactions
    const { data: allRecurring, error: allError } = await supabase
      .from('recurring_transactions')
      .select('*');

    if (allError) {
      console.error('Error fetching all recurring:', allError);
    } else {
      console.log('\nAll Recurring Transactions:');
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
