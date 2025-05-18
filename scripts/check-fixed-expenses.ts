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

async function checkFixedExpenses() {
  try {
    // Get all fixed expenses
    const { data: fixedExpenses, error } = await supabase
      .from('fixed_expenses')
      .select('*');

    if (error) {
      throw error;
    }

    console.log('All Fixed Expenses:');
    console.log(JSON.stringify(fixedExpenses, null, 2));

    // Look for any fixed expenses related to Insurance
    const insuranceExpenses = fixedExpenses?.filter(fe => 
      fe.name?.toLowerCase().includes('insurance') || 
      fe.recurring_transaction_id === 19
    );

    if (insuranceExpenses?.length) {
      console.log('\nInsurance-related Fixed Expenses:');
      console.log(JSON.stringify(insuranceExpenses, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkFixedExpenses();
