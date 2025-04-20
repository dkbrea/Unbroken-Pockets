// Script to directly query budget_periods table
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with anon key
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnosePermissionIssue() {
  console.log('Testing Supabase connection and permissions...');
  
  try {
    // 1. First try a direct SELECT query on budget_periods
    console.log('\n1. Querying budget_periods directly:');
    const { data: budgetData, error: budgetError } = await supabase
      .from('budget_periods')
      .select('*');
    
    if (budgetError) {
      console.error('Error querying budget_periods:', budgetError);
    } else {
      console.log('Budget periods data:', budgetData);
    }
    
    // 2. Try executing a raw SQL query to check if it works differently
    console.log('\n2. Trying raw SQL query:');
    const { data: sqlData, error: sqlError } = await supabase
      .rpc('get_budget_periods');
    
    if (sqlError) {
      console.error('Error with RPC call:', sqlError);
      
      // Create the function if it doesn't exist
      console.log('\nAttempting to create RPC function:');
      const { error: createError } = await supabase.rpc('create_get_budget_periods_function');
      
      if (createError) {
        console.error('Error creating function:', createError);
      } else {
        console.log('Successfully created function, trying again...');
        
        // Try the function again
        const { data: retryData, error: retryError } = await supabase
          .rpc('get_budget_periods');
        
        if (retryError) {
          console.error('Error with retry RPC call:', retryError);
        } else {
          console.log('Function worked on retry:', retryData);
        }
      }
    } else {
      console.log('SQL data:', sqlData);
    }
    
    // 3. Test transactions table access for comparison
    console.log('\n3. Testing transactions table access:');
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (transactionError) {
      console.error('Error querying transactions:', transactionError);
    } else {
      console.log('Transaction data access successful:', transactionData.length > 0);
    }
  } catch (err) {
    console.error('Unexpected error in diagnosePermissionIssue:', err);
  }
}

diagnosePermissionIssue(); 