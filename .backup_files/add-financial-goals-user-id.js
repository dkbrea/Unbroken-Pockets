const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to add user_id column to financial_goals table
async function addUserIdToFinancialGoals() {
  try {
    console.log('Adding user_id column to financial_goals table...');

    // Check if we can use PostgreSQL to add the column directly
    try {
      console.log('Using direct SQL to add user_id column...');
      
      // Try directly adding the column
      const { data, error } = await supabase.from('financial_goals').select('*').limit(1);
      
      if (error) {
        if (error.message.includes('column "user_id" does not exist')) {
          console.log('Need to add user_id column...');
          
          // Trying to add the column
          await supabase.from('_schema').select('*');
          
          // Alternative approach since _schema access might be restricted
          const commands = [
            {
              name: 'Add user_id column',
              query: `ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
            },
            {
              name: 'Create index',
              query: `CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id)`
            },
            {
              name: 'Update existing goals',
              query: `UPDATE financial_goals SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL`
            },
            {
              name: 'Enable RLS',
              query: `ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY`
            },
            {
              name: 'Create select policy',
              query: `CREATE POLICY IF NOT EXISTS "Users can view their own goals" ON financial_goals FOR SELECT USING ((auth.uid()) = user_id)`
            },
            {
              name: 'Create insert policy',
              query: `CREATE POLICY IF NOT EXISTS "Users can insert their own goals" ON financial_goals FOR INSERT WITH CHECK ((auth.uid()) = user_id)`
            },
            {
              name: 'Create update policy',
              query: `CREATE POLICY IF NOT EXISTS "Users can update their own goals" ON financial_goals FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id)`
            },
            {
              name: 'Create delete policy',
              query: `CREATE POLICY IF NOT EXISTS "Users can delete their own goals" ON financial_goals FOR DELETE USING ((auth.uid()) = user_id)`
            }
          ];
          
          // Since we don't have direct SQL access, let's try another approach
          console.log('Creating a temporary function to add the user_id column...');
          
          // Function to modify the hook to work with the existing user_id column
          console.log('Updating the useGoalsData hook to work with the user_id column...');
          console.log('Please update the src/hooks/useGoalsData.ts file with the following change:');
          console.log(`
// In the addGoal function, remove the user_id line:
const { error } = await supabase
  .from('financial_goals')
  .insert({
    // Do not add user_id here, it will be handled by RLS
    name: goal.name,
    icon: iconName,
    color: goal.color,
    current_amount: goal.currentAmount,
    target_amount: goal.targetAmount,
    target_date: goal.targetDate,
    contribution_frequency: goal.contributions.frequency,
    contribution_amount: goal.contributions.amount
  });
`);
          
          // Print instructions for manually adding the column
          console.log(`
IMPORTANT: The script cannot directly add the user_id column.
Please follow these instructions to add it manually:

1. Connect to your Supabase project at ${supabaseUrl}
2. Go to the SQL Editor
3. Run the following SQL commands:

ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
UPDATE financial_goals SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goals" ON financial_goals FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own goals" ON financial_goals FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own goals" ON financial_goals FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own goals" ON financial_goals FOR DELETE USING ((auth.uid()) = user_id);
`);
        } else {
          console.error('Error checking financial_goals table:', error.message);
        }
      } else {
        console.log('financial_goals table structure:', Object.keys(data[0] || {}));
        if (data.length > 0 && 'user_id' in data[0]) {
          console.log('user_id column already exists in financial_goals table');
        } else {
          console.log('user_id column needs to be added to financial_goals table');
          console.log('Please follow the instructions above to add it manually.');
        }
      }
    } catch (err) {
      console.error('Error executing SQL queries:', err.message);
      console.log('Please follow the instructions above to add the user_id column manually.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the function
addUserIdToFinancialGoals(); 