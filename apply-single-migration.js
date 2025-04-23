// Script to apply a single migration file directly to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Read the migration file content
const migrationFile = path.join(__dirname, 'supabase/migrations/20250830_fix_variable_expense_delete_sync.sql');
const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

// Prompt for Supabase credentials
rl.question('Enter your Supabase URL: ', (supabaseUrl) => {
  rl.question('Enter your Supabase service role key: ', (serviceRoleKey) => {
    // Create Supabase client with service role key (admin privileges)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Apply the migration
    applyMigration(supabase)
      .then(() => {
        rl.close();
      })
      .catch((err) => {
        console.error('Error in migration process:', err);
        rl.close();
      });
  });
});

// Function to execute the migration
async function applyMigration(supabase) {
  console.log(`Applying migration from ${migrationFile}...`);

  try {
    // Try different approaches to run the SQL directly
    
    // Approach 1: Use RPC if available
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: migrationSQL
      });
      
      if (!error) {
        console.log('Migration applied successfully using exec_sql RPC');
        await updateMigrationHistory(supabase);
        return;
      }
    } catch (rpcError) {
      console.log('exec_sql RPC not available, trying alternative methods...');
    }
    
    // Approach 2: Use REST API if available
    try {
      const { error } = await supabase.from('_migration').select('*').limit(1);
      
      if (!error) {
        console.log('Using REST API to execute SQL is not supported directly.');
        console.log('Please apply the migration manually using the Supabase dashboard SQL editor');
        console.log('SQL to apply:');
        console.log(migrationSQL);
        return;
      }
    } catch (restError) {
      console.log('REST API not available for migrations');
    }
    
    // If we reach here, we couldn't apply the migration automatically
    console.log('Unable to apply migration automatically.');
    console.log('Please copy the SQL below and apply it through the Supabase dashboard SQL editor:');
    console.log('\n' + migrationSQL);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

async function updateMigrationHistory(supabase) {
  try {
    const { error } = await supabase
      .from('schema_migrations')
      .insert({
        version: '20250830',
        name: '20250830_fix_variable_expense_delete_sync.sql',
        status: 'applied',
        applied_at: new Date().toISOString()
      });

    if (error) {
      console.log('Unable to update migration history, but migration was applied');
      console.error(error);
      return;
    }

    console.log('Migration history updated successfully');
  } catch (err) {
    console.error('Error updating migration history:', err);
  }
} 