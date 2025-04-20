const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Log the loaded environment variables (without sensitive data)
console.log('Environment variables loaded:');
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Read migration files from supabase/migrations directory
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to apply migrations in order
    
    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    console.log(`Found ${files.length} migration files to apply.`);
    
    // Apply each migration file
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Applying migration: ${file}...`);
      
      try {
        // Use RPC to execute a SQL function since direct SQL doesn't work
        const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
        
        if (error) {
          console.error(`Error applying migration ${file}:`, error);
          console.log('Will attempt to create an execute_sql function first...');
          
          // Create the execute_sql function first
          const createFunctionSql = `
          CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
          RETURNS VOID
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$;
          `;
          
          // Execute this via direct REST API call since RPC function doesn't exist yet
          // This is a simplified approach that might need customization based on your Supabase setup
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ sql_query: createFunctionSql })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating execute_sql function:', errorData);
            console.log('Skipping migration:', file);
            continue;
          }
          
          // Now try applying the migration again
          const retryResult = await supabase.rpc('execute_sql', { sql_query: sql });
          
          if (retryResult.error) {
            console.error(`Error applying migration ${file} (retry):`, retryResult.error);
            console.log('Skipping migration:', file);
            continue;
          }
        }
        
        console.log(`Successfully applied migration: ${file}`);
      } catch (migrationError) {
        console.error(`Error applying migration ${file}:`, migrationError);
        console.log('Skipping migration:', file);
      }
    }
    
    console.log('Database migrations completed.');
  } catch (error) {
    console.error('Unexpected error during migrations:', error);
  }
}

applyMigrations(); 