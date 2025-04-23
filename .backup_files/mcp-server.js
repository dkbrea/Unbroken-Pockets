import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Connect to Supabase using your project credentials
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Setup stdio interface for Cursor
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Listen for Cursor commands
rl.on('line', async (input) => {
  try {
    const request = JSON.parse(input);
    const { command, payload } = request;

    let response;

    if (command === 'get_accounts') {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (userId) {
        // Get accounts for the current user
        response = await supabase.from('accounts').select('*').eq('user_id', userId);
      } else {
        // No user logged in or couldn't get user ID
        response = { data: [], error: null };
      }
    }

    if (command === 'add_account') {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      response = await supabase.from('accounts').insert([
        {
          name: payload.name,
          institution: payload.institution,
          balance: payload.balance,
          type: payload.type,
          last_updated: payload.lastUpdated || new Date().toISOString().split('T')[0],
          is_hidden: payload.isHidden ?? false,
          icon: payload.icon ?? null,
          color: payload.color ?? null,
          account_number: payload.accountNumber ?? null,
          notes: payload.notes ?? null,
          user_id: userId // Add user_id field
        }
      ]);
    }

    if (command === 'add_user_id_to_goals') {
      // Execute SQL to add user_id column to financial_goals if it doesn't exist
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          DO $$
          BEGIN
            -- Add user_id column if it doesn't exist
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'financial_goals' AND column_name = 'user_id'
            ) THEN
              ALTER TABLE financial_goals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
              CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
              
              -- Update existing goals with the default user ID
              UPDATE financial_goals SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
              
              -- Enable RLS
              ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
              
              -- Create RLS policies
              CREATE POLICY "Users can view their own goals" 
              ON financial_goals FOR SELECT TO authenticated
              USING ((auth.uid()) = user_id);
              
              CREATE POLICY "Users can insert their own goals" 
              ON financial_goals FOR INSERT TO authenticated
              WITH CHECK ((auth.uid()) = user_id);
              
              CREATE POLICY "Users can update their own goals" 
              ON financial_goals FOR UPDATE TO authenticated
              USING ((auth.uid()) = user_id)
              WITH CHECK ((auth.uid()) = user_id);
              
              CREATE POLICY "Users can delete their own goals" 
              ON financial_goals FOR DELETE TO authenticated
              USING ((auth.uid()) = user_id);
            END IF;
          END $$;
        `
      });

      if (error) {
        response = { error };
      } else {
        response = { data: 'User ID column added to financial_goals table successfully' };
      }
    }

    if (command === 'run-database-fix') {
      // Execute SQL to add user_id column if it doesn't exist
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          DO $$
          BEGIN
            -- Add user_id column if it doesn't exist
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'accounts' AND column_name = 'user_id'
            ) THEN
              ALTER TABLE accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
              CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
              
              -- Update existing accounts with the default user ID
              UPDATE accounts SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
              
              -- Enable RLS
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
            END IF;
          END $$;
        `
      });

      if (error) {
        response = { error };
      } else {
        response = { data: 'Database fix applied successfully' };
      }
    }

    process.stdout.write(
      JSON.stringify({ type: 'response', data: response.data }) + '\n'
    );
  } catch (err) {
    process.stdout.write(JSON.stringify({ type: 'error', error: err.message }) + '\n');
  }
});
