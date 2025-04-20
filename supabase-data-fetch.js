// Simple script to fetch and display transaction data from Supabase
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key for full database access
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.3U0lJxu_PzyobNvSpI3QiYx57r4ke2ENA-zcunw6f7c';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchTransactions() {
  console.log('Fetching transactions from Supabase...');
  console.log(`Using URL: ${supabaseUrl}`);
  
  try {
    // Fetch all transactions
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }
    
    console.log(`Found ${data ? data.length : 0} transactions:`);
    if (data && data.length > 0) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('No transactions found in database.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

fetchTransactions(); 