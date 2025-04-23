import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: './.env.local' });

// Connect to Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAccountsTable() {
  try {
    console.log('Starting database fix...');
    
    // Check if user_id column exists
    const { data: columnExists, error: checkError } = await supabase.rpc('run_sql', {
      query: `
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'accounts' AND column_name = 'user_id'
        );
      `
    });
    
    if (checkError) {
      console.error('Error checking column existence:', checkError);
      return;
    }
    
    if (columnExists && columnExists.length > 0 && columnExists[0].exists) {
      console.log('user_id column already exists');
      return;
    }
    
    // Add user_id column
    console.log('Adding user_id column...');
    const { error: alterError } = await supabase.rpc('run_sql', {
      query: `
        -- Add user_id column
        ALTER TABLE accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
        
        -- Update existing accounts with a user ID
        UPDATE accounts 
        SET user_id = (SELECT id FROM auth.users LIMIT 1) 
        WHERE user_id IS NULL;
        
        -- Enable Row Level Security
        ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view their own accounts" 
        ON accounts FOR SELECT TO authenticated
        USING ((auth.uid()) = user_id);
        
        CREATE POLICY "Users can insert their own accounts" 
        ON accounts FOR INSERT TO authenticated
        WITH CHECK ((auth.uid()) = user_id);
        
        CREATE POLICY "Users can update their own accounts" 
        ON accounts FOR UPDATE TO authenticated
        USING ((auth.uid()) = user_id)
        WITH CHECK ((auth.uid()) = user_id);
        
        CREATE POLICY "Users can delete their own accounts" 
        ON accounts FOR DELETE TO authenticated
        USING ((auth.uid()) = user_id);
      `
    });
    
    if (alterError) {
      console.error('Error adding user_id column:', alterError);
      return;
    }
    
    console.log('Database fix applied successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixAccountsTable(); 