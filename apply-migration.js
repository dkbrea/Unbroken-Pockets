const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read in the migration file
const migrationContent = fs.readFileSync(
  path.join(__dirname, 'supabase/migrations/20250830_fix_variable_expense_delete_sync.sql'),
  'utf8'
);

// Initialize Supabase client
// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or service role key environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create client with service role for admin privileges
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running migration...');
  
  try {
    // Use the SQL executor function if available
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: migrationContent
    });
    
    if (error) {
      console.error('Error running migration with exec_sql:', error);
      console.log('Trying alternate method...');
      
      // Try direct SQL query if the RPC function isn't available
      const { error: directError } = await supabase.from('_direct_sql').rpc('sql', {
        query: migrationContent
      });
      
      if (directError) {
        console.error('Error running direct SQL:', directError);
        return;
      }
    }
    
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runMigration(); 