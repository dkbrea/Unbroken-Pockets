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
    // Get recurring transaction with id 19
    const { data: recurring, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', 19)
      .single();

    if (recurringError) {
      throw recurringError;
    }

    console.log('Recurring Transaction #19:');
    console.log(JSON.stringify(recurring, null, 2));

    // Get all transactions linked to this recurring transaction
    const { data: linkedTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('recurring_id', 19);

    if (transactionsError) {
      throw transactionsError;
    }

    console.log('\nLinked Transactions:');
    console.log(JSON.stringify(linkedTransactions, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecurringTransactions();
