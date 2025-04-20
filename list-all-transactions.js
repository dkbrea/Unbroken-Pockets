// Script to list all transactions from Supabase
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with anon key
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAllTransactions() {
  console.log('Fetching all transactions from Supabase...');
  
  try {
    // Fetch all transactions
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }
    
    console.log(`Found ${data.length} transactions in total:`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listAllTransactions(); 