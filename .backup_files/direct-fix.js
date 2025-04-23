import { createClient } from '@supabase/supabase-js'

// Create a direct Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Log environment variables (masked for security)
    console.log('Direct fix - env check:');
    console.log('- SUPABASE_URL provided:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('- SUPABASE_ANON_KEY provided:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('- URL length:', process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0);
    console.log('- KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);

    // Try a simple query first to verify connection
    try {
      const { data, error } = await supabase.from('pg_catalog.pg_tables').select('*').limit(1);
      
      if (error) {
        console.error('Catalog query failed:', error);
        return res.status(500).json({
          error: 'Connection failed - cannot access pg_catalog',
          details: error
        });
      }
      
      console.log('Connection successful - catalog query worked');
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
    
    // Execute direct SQL statements
    try {
      // 1. Create accounts table if it doesn't exist
      const createTableSQL = `
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
      `;
      
      // 2. Add user_id column if it doesn't exist
      const addColumnSQL = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'accounts' AND column_name = 'user_id'
          ) THEN
            ALTER TABLE accounts ADD COLUMN user_id VARCHAR(255) DEFAULT 'default-user-id';
          END IF;
        END $$;
      `;
      
      // 3. Enable RLS and set up policies
      const rlsSQL = `
        -- Enable RLS
        ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
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
      `;
      
      // Execute the SQL statements
      const createResult = await supabase.query(createTableSQL);
      console.log('Create table result:', createResult);
      
      const columnResult = await supabase.query(addColumnSQL);
      console.log('Add column result:', columnResult);
      
      const rlsResult = await supabase.query(rlsSQL);
      console.log('RLS setup result:', rlsResult);
      
      return res.status(200).json({
        success: true,
        message: 'Direct fix applied successfully',
        results: {
          createTable: !createResult.error,
          addColumn: !columnResult.error,
          rlsSetup: !rlsResult.error
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
    console.error('Unexpected error in direct fix:', err);
    return res.status(500).json({
      error: 'Unexpected error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
} 