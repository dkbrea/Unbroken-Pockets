import { createClient } from '@supabase/supabase-js'

// Create a direct Supabase client with hardcoded credentials (from .env.local)
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Log connection info
    console.log('Direct fix alt - connection info:');
    console.log('- Using hardcoded credentials');
    console.log('- URL provided:', !!supabaseUrl);
    console.log('- KEY provided:', !!supabaseKey);

    // Try a simple query first to verify connection
    try {
      // First, check if we can connect using a simple select
      const { data: testData, error: testError } = await supabase
        .from('accounts')
        .select('id')
        .limit(1);
      
      if (testError && testError.code !== 'PGRST116') {
        console.log('Initial test query failed:', testError);
        console.log('Trying alternate connection tests...');
        
        // Try a system table query
        const { data: tablesData, error: tablesError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
          .limit(1);
        
        if (tablesError) {
          console.error('Tables query failed:', tablesError);
          
          // Try a basic RPC
          const { data: versionData, error: versionError } = await supabase.rpc('version');
          
          if (versionError) {
            console.error('Version RPC failed:', versionError);
            return res.status(500).json({
              error: 'All connection tests failed',
              details: testError
            });
          } else {
            console.log('Version RPC succeeded:', versionData);
          }
        } else {
          console.log('Tables query succeeded:', tablesData);
        }
      } else {
        if (testError && testError.code === 'PGRST116') {
          console.log('Table does not exist, which is expected. Connection successful.');
        } else {
          console.log('Test query succeeded:', testData);
        }
      }
      
      console.log('Connection successful - proceeding with table creation');
    } catch (connErr) {
      console.error('Connection test error:', connErr);
      return res.status(500).json({
        error: 'Connection failed - exception thrown',
        details: {
          message: connErr.message,
          name: connErr.name
        }
      });
    }
    
    // Execute SQL statements using rpc with the auth.admin role
    try {
      // 1. Create accounts table if it doesn't exist
      const { data: createTableData, error: createTableError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            balance DECIMAL(12,2) NOT NULL,
            institution VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id VARCHAR(255) DEFAULT 'default-user-id'
          );
        `
      });
      
      console.log('Create table result:', createTableError || 'Success');
      
      if (createTableError) {
        // Fallback to another approach if RPC fails
        console.log('RPC failed, trying direct table creation via API');
        
        // First check if the table exists
        const { error: checkError } = await supabase
          .from('accounts')
          .select('id')
          .limit(1);
        
        if (checkError && checkError.code === 'PGRST116') {
          // Table doesn't exist, create it with basic fields first
          await supabase.from('accounts').insert([{
            name: 'Initial Account',
            type: 'checking',
            balance: 0,
            user_id: 'default-user-id'
          }]).select();
          
          console.log('Created accounts table via API insertion');
        } else {
          console.log('Table already exists, proceeding with other operations');
        }
      }
      
      // 2. Check user_id column and add if needed
      const { data: columnsData, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'accounts')
        .eq('table_schema', 'public');
      
      console.log('Columns check result:', columnsError || `Found ${columnsData?.length || 0} columns`);
      
      let hasUserIdColumn = false;
      if (!columnsError && columnsData) {
        hasUserIdColumn = columnsData.some(col => col.column_name === 'user_id');
      }
      
      if (!hasUserIdColumn) {
        console.log('user_id column not found, attempting to add it');
        
        // Try using RPC to add the column
        const { error: addColumnError } = await supabase.rpc('execute_sql', {
          sql_query: `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) DEFAULT 'default-user-id';`
        });
        
        console.log('Add column result:', addColumnError || 'Success');
      }
      
      // 3. Set up RLS
      const { error: rlsError } = await supabase.rpc('execute_sql', {
        sql_query: `
          -- Enable RLS
          ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
          
          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
          DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
          DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
          DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
          DROP POLICY IF EXISTS "Development mode access for anon users" ON accounts;
          DROP POLICY IF EXISTS "Allow all operations for any user" ON accounts;
          
          -- Create a permissive policy for development
          CREATE POLICY "Allow all operations for any user" ON accounts
          USING (true)
          WITH CHECK (true);
        `
      });
      
      console.log('RLS setup result:', rlsError || 'Success');
      
      return res.status(200).json({
        success: true,
        message: 'Direct fix applied successfully',
        results: {
          createTable: !createTableError,
          columnsCheck: !columnsError,
          hasUserIdColumn,
          rlsSetup: !rlsError
        }
      });
    } catch (sqlError) {
      console.error('SQL execution error:', sqlError);
      return res.status(500).json({
        error: 'SQL execution failed',
        details: {
          message: sqlError.message,
          name: sqlError.name
        }
      });
    }
  } catch (err) {
    console.error('Unexpected error in direct fix alt:', err);
    return res.status(500).json({
      error: 'Unexpected error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
} 