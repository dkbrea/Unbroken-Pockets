import { createClient } from '@supabase/supabase-js'

// Create a direct Supabase client with hardcoded credentials (from .env.local)
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch all columns from the accounts table
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'accounts')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('Error fetching table schema:', columnsError);
      
      // Try a direct query to the accounts table
      const { data: accountSample, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .limit(1);
        
      if (accountError) {
        console.error('Error fetching accounts sample:', accountError);
        return res.status(500).json({ 
          error: 'Failed to fetch schema information',
          details: columnsError
        });
      }
      
      // If we can get a sample, return the keys as column names
      return res.status(200).json({
        message: 'Retrieved column names from sample data',
        columns: accountSample && accountSample.length > 0 
          ? Object.keys(accountSample[0]).map(key => ({ column_name: key }))
          : []
      });
    }

    // Try to get existing data to verify
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .limit(5);

    // List all tables in public schema for reference
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    return res.status(200).json({
      accounts_table_columns: columns,
      sample_data: accounts || [],
      all_public_tables: tablesError ? [] : tables,
      error: accountsError ? accountsError.message : null
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({
      error: 'Unexpected error',
      message: err.message
    });
  }
} 