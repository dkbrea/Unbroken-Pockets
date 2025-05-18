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

async function queryTransactions() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    console.log('All Transactions:');
    console.log(JSON.stringify(data, null, 2));

    // Specifically look for Insurance transaction
    const insuranceTransactions = data?.filter(t => t.name === 'Insurance');
    if (insuranceTransactions?.length) {
      console.log('\nInsurance Transactions:');
      console.log(JSON.stringify(insuranceTransactions, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

queryTransactions();
