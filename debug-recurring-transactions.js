// Script to debug recurring transactions in Supabase
// This script checks the recurring_transactions table and prints information
// to help troubleshoot why data isn't showing up

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error: User not authenticated', userError);
      console.log('Please login first using the web application');
      process.exit(1);
    }
    
    console.log(`Authenticated as user: ${user.email} (ID: ${user.id})`);
    console.log('-'.repeat(80));
    
    // Check table schema to ensure columns are set up correctly
    console.log('1. CHECKING TABLE SCHEMA');
    console.log('-'.repeat(80));
    
    try {
      // This needs admin privileges which the client doesn't have, but we can check the error message
      const { error: schemaError } = await supabase.rpc('get_schema', { table_name: 'recurring_transactions' });
      console.log('Schema query result:', schemaError ? 'Error accessing schema (expected if not admin)' : 'Success');
      
      // Try a simple count query to see if the table exists
      const { count, error: countError } = await supabase
        .from('recurring_transactions')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log('Table access error:', countError.message);
      } else {
        console.log('Table exists and is accessible');
      }
    } catch (e) {
      console.log('Schema query error:', e.message);
    }
    console.log('-'.repeat(80));
    
    // Check all transactions (limited to first 100)
    console.log('2. CHECKING ALL TRANSACTIONS (FIRST 100)');
    console.log('-'.repeat(80));
    
    const { data: allTransactions, error: allError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .limit(100);
    
    if (allError) {
      console.error('Error fetching all transactions:', allError);
    } else {
      console.log(`Found ${allTransactions.length} total transactions in the table`);
      
      // Show a summary of user_ids present in the data
      const userIds = [...new Set(allTransactions.map(tx => tx.user_id))];
      console.log(`Transactions belong to ${userIds.length} distinct users:`, userIds);
      
      // Check for any data with null user_id
      const nullUserIdCount = allTransactions.filter(tx => tx.user_id === null).length;
      if (nullUserIdCount > 0) {
        console.log(`WARNING: Found ${nullUserIdCount} transactions with NULL user_id`);
      }
    }
    console.log('-'.repeat(80));
    
    // Check transactions for the current user
    console.log('3. CHECKING CURRENT USER TRANSACTIONS');
    console.log('-'.repeat(80));
    
    const { data: userTransactions, error: userTxError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id);
    
    if (userTxError) {
      console.error('Error fetching user transactions:', userTxError);
    } else {
      console.log(`Found ${userTransactions.length} transactions for current user`);
      
      if (userTransactions.length > 0) {
        console.log('Sample transaction:', userTransactions[0]);
      } else {
        console.log('No transactions found for current user');
      }
      
      // Check auth.uid() vs user.id to detect potential type mismatches
      try {
        const { data: authCheck, error: authError } = await supabase.rpc('check_auth_match', { 
          input_id: user.id 
        });
        
        if (authError) {
          console.log('Cannot check auth.uid() match due to permissions or function not existing');
        } else {
          console.log('Auth UID check result:', authCheck);
        }
      } catch (e) {
        console.log('Auth check error (expected if function not defined):', e.message);
      }
    }
    console.log('-'.repeat(80));
    
    // Check RLS policies
    console.log('4. CHECKING ROW LEVEL SECURITY POLICIES');
    console.log('-'.repeat(80));
    try {
      // This query will fail without admin privileges, but we can check the error message
      const { error: rlsError } = await supabase.rpc('get_policies', { 
        table_name: 'recurring_transactions' 
      });
      
      console.log('RLS query result:', rlsError ? 'Error accessing policies (expected if not admin)' : 'Success');
    } catch (e) {
      console.log('RLS query error:', e.message);
    }
    console.log('-'.repeat(80));
    
    // Quick query to check if the fields are correct
    console.log('5. SAMPLE DATA FORMAT CHECK');
    console.log('-'.repeat(80));
    const testTransaction = {
      name: 'DEBUG TEST TRANSACTION',
      amount: 100.00,
      frequency: 'monthly',
      category: 'Debug',
      next_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      payment_method: 'Test Method',
      user_id: user.id,
      type: 'expense',
      description: 'Test transaction for debugging'
    };
    
    // First just log the structure so we can see what we're sending
    console.log('Test transaction structure:', testTransaction);
    
    // Insert a test transaction to check field mappings
    console.log('Attempting to insert test transaction...');
    const { data: insertedTest, error: insertError } = await supabase
      .from('recurring_transactions')
      .insert([testTransaction])
      .select();
    
    if (insertError) {
      console.error('Error inserting test transaction:', insertError);
      
      // Try to figure out specific field problems
      for (const field in testTransaction) {
        const fieldTest = { ...testTransaction };
        delete fieldTest[field];
        
        console.log(`Testing without field: ${field}`);
        const { error: fieldError } = await supabase
          .from('recurring_transactions')
          .insert([fieldTest]);
        
        console.log(`Result without ${field}: ${fieldError ? 'Error' : 'Success'}`);
      }
    } else {
      console.log('Successfully inserted test transaction:', insertedTest[0]);
      
      // Clean up the test transaction
      const { error: deleteError } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', insertedTest[0].id);
      
      if (deleteError) {
        console.log('Error deleting test transaction:', deleteError);
      } else {
        console.log('Successfully deleted test transaction');
      }
    }
    
    console.log('-'.repeat(80));
    console.log('DEBUGGING COMPLETE');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main().then(() => process.exit(0)); 