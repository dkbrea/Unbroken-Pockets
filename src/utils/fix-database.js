const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixDatabase() {
  try {
    // Connect to Supabase
    console.log('Connecting to Supabase...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Error: Missing Supabase credentials');
      console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file');
      process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('Connected to Supabase. Attempting to execute SQL directly...');
    
    // Execute raw SQL to add the user_id column
    try {
      // First attempt to check if Supabase REST API supports direct SQL execution
      await supabase.rpc('exec_sql', {
        sql: 'SELECT version();'
      }).then(response => {
        console.log('SQL execution supported:', response);
      }).catch(error => {
        console.log('SQL execution not supported via RPC:', error.message);
      });
      
      // Alternative approach: Create a client-side script to modify the schema
      console.log('Adding user_id column to accounts table via manual implementation...');
      
      // 1. First, fetch if we have an accounts table
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .limit(1);
      
      if (accountsError) {
        console.error('Error accessing accounts table:', accountsError.message);
        return;
      }
      
      console.log('Accounts table exists and is accessible.');
      
      // 2. Since we can't directly modify the schema via client-side JavaScript,
      // we'll provide instructions for running the SQL directly
      console.log('\n\nTo fix the database issue, you need to run the following SQL in your Supabase SQL editor:');
      console.log('--------------------------------');
      console.log(`
-- Add user_id column to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Update existing accounts with a user ID
UPDATE accounts 
SET user_id = (SELECT id FROM auth.users LIMIT 1) 
WHERE user_id IS NULL;

-- Make user_id required for future inserts
ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL;

-- Enable Row Level Security for accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts" 
ON accounts
FOR SELECT 
TO authenticated
USING ((auth.uid()) = user_id);

CREATE POLICY "Users can insert their own accounts" 
ON accounts
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can update their own accounts" 
ON accounts
FOR UPDATE 
TO authenticated
USING ((auth.uid()) = user_id)
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON accounts
FOR DELETE 
TO authenticated
USING ((auth.uid()) = user_id);
      `);
      console.log('--------------------------------');
      console.log('\nVisit: https://supabase.com/dashboard/project/vhtltupeibcofyopizxn/sql');
      console.log('Paste the SQL above and click "Run"');
      
    } catch (sqlError) {
      console.error('Error executing SQL:', sqlError);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

module.exports = { fixDatabase }; 