// Script to check RLS status of all tables in Supabase
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with anon key
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSStatus() {
  console.log('Checking RLS status for all tables in Supabase...');
  
  try {
    // Direct SQL query through Supabase's stored procedure function
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT 
          tablename AS table_name, 
          rowsecurity AS has_rls 
        FROM 
          pg_tables 
        WHERE 
          schemaname = 'public'
        ORDER BY 
          tablename;
      `
    });
    
    if (error) {
      console.error('Error executing SQL query:', error);
      console.log('\nAttempting an alternative approach...');
      
      // If we can't execute SQL directly, try to query each table we know exists
      await checkTablesIndividually();
    } else if (data && data.rows) {
      displayRLSStatus(data.rows);
    } else {
      console.log('No data returned from the query.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

async function checkTablesIndividually() {
  // List of tables we know exist from the Supabase screenshot
  const knownTables = [
    'accounts',
    'asset_allocation',
    'budget_categories',
    'budget_periods',
    'cash_flow',
    'financial_goals',
    'holdings',
    'investment_accounts',
    'investment_portfolio',
    'notifications',
    'portfolio_performance',
    'report_types',
    'spending_categories',
    'transactions',
    'user_preferences',
    'users'
  ];
  
  // Try to query each table to see if we have access
  const results = [];
  
  for (const table of knownTables) {
    try {
      console.log(`Checking access to table: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      results.push({
        table_name: table,
        has_rls: error ? true : false,
        error: error ? error.message : null,
        has_access: !error
      });
    } catch (err) {
      results.push({
        table_name: table,
        has_rls: true,
        error: err.message,
        has_access: false
      });
    }
  }
  
  displayAccessResults(results);
}

function displayRLSStatus(data) {
  if (!data || data.length === 0) {
    console.log('No table data returned.');
    return;
  }
  
  console.log('\nRLS Status for public schema tables:');
  console.log('==================================');
  console.log('Table Name'.padEnd(30) + '| RLS Enabled');
  console.log('-'.repeat(30) + '+-' + '-'.repeat(10));
  
  data.forEach(row => {
    console.log(row.table_name.padEnd(30) + '| ' + (row.has_rls ? 'YES' : 'NO'));
  });
  
  console.log('\nSummary:');
  const enabledCount = data.filter(row => row.has_rls).length;
  console.log(`- ${enabledCount} of ${data.length} tables have RLS enabled`);
  console.log(`- ${data.length - enabledCount} of ${data.length} tables have RLS disabled`);
}

function displayAccessResults(results) {
  console.log('\nTable Access Results:');
  console.log('====================');
  console.log('Table Name'.padEnd(30) + '| Access | RLS Inferred');
  console.log('-'.repeat(30) + '+-' + '-'.repeat(8) + '+-' + '-'.repeat(12));
  
  results.forEach(row => {
    console.log(
      row.table_name.padEnd(30) + '| ' + 
      (row.has_access ? 'YES     ' : 'NO      ') + '| ' +
      (row.has_rls ? 'YES         ' : 'NO          ')
    );
  });
  
  console.log('\nSummary:');
  const enabledCount = results.filter(row => row.has_rls).length;
  console.log(`- ${enabledCount} of ${results.length} tables likely have RLS enabled`);
  console.log(`- ${results.length - enabledCount} of ${results.length} tables likely have RLS disabled`);
  
  console.log('\nNote: RLS status is inferred from access attempts and may not be 100% accurate.');
}

// Run the check
checkRLSStatus(); 