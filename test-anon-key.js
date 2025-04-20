// Test script for Supabase anon key connection
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with anon key
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection with anon key...');
  console.log(`Using URL: ${supabaseUrl}`);
  
  try {
    // Attempt to fetch transactions (this will only succeed if your RLS policies allow it)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching with anon key:', error);
      return;
    }
    
    console.log(`Connection successful! Found ${data ? data.length : 0} transactions:`);
    if (data && data.length > 0) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('No transactions found or no permission to access them with anon key.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection(); 