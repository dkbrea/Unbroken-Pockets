require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addUserIdToInvestmentAccounts() {
  console.log('Starting to add user_id to investment_accounts table...');

  try {
    // First, check if the user_id column already exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_columns_info', { 
        p_table_name: 'investment_accounts',
        p_column_name: 'user_id'
      });

    if (columnsError) {
      console.error('Error checking if column exists:', columnsError);
      return;
    }

    // If column doesn't exist yet, add it
    if (columns.length === 0) {
      console.log('Adding user_id column to investment_accounts table...');
      
      // Add the user_id column
      const { error: alterError } = await supabase
        .rpc('execute_sql', { 
          sql_query: 'ALTER TABLE investment_accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE'
        });
      
      if (alterError) {
        console.error('Error adding user_id column:', alterError);
        return;
      }
      
      // Create an index on the user_id column
      const { error: indexError } = await supabase
        .rpc('execute_sql', { 
          sql_query: 'CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_id ON investment_accounts(user_id)'
        });
      
      if (indexError) {
        console.error('Error creating index on user_id:', indexError);
        return;
      }
      
      console.log('Successfully added user_id column and index');
    } else {
      console.log('user_id column already exists on investment_accounts table');
    }
    
    // Get a default user to set as owner for accounts without a user
    const { data: defaultUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();
    
    if (userError) {
      console.error('Error getting default user:', userError);
      return;
    }
    
    if (!defaultUser || !defaultUser.id) {
      console.error('No default user found in the database');
      return;
    }
    
    const defaultUserId = defaultUser.id;
    console.log(`Using default user ID ${defaultUserId} for missing user associations`);
    
    // Update existing accounts to associate with the default user
    const { error: updateError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `UPDATE investment_accounts SET user_id = '${defaultUserId}' WHERE user_id IS NULL`
      });
    
    if (updateError) {
      console.error('Error updating existing accounts with user_id:', updateError);
      return;
    }
    
    // Make the user_id column NOT NULL
    const { error: notNullError } = await supabase
      .rpc('execute_sql', { 
        sql_query: 'ALTER TABLE investment_accounts ALTER COLUMN user_id SET NOT NULL'
      });
    
    if (notNullError) {
      console.error('Error setting user_id to NOT NULL:', notNullError);
      return;
    }

    // Enable Row Level Security on the investment_accounts table
    const { error: rlsError } = await supabase
      .rpc('execute_sql', { 
        sql_query: 'ALTER TABLE investment_accounts ENABLE ROW LEVEL SECURITY'
      });
    
    if (rlsError) {
      console.error('Error enabling RLS on investment_accounts:', rlsError);
      return;
    }
    
    // Create RLS policies
    await createPolicies();
    
    console.log('Successfully updated investment_accounts table with user_id column and RLS policies');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function createPolicies() {
  const policies = [
    {
      name: "Users can view their own investment accounts",
      action: "SELECT",
      definition: "(auth.uid()) = user_id"
    },
    {
      name: "Users can insert their own investment accounts",
      action: "INSERT",
      definition: "(auth.uid()) = user_id",
      check: true
    },
    {
      name: "Users can update their own investment accounts",
      action: "UPDATE",
      definition: "(auth.uid()) = user_id",
      check: true
    },
    {
      name: "Users can delete their own investment accounts",
      action: "DELETE",
      definition: "(auth.uid()) = user_id"
    }
  ];
  
  for (const policy of policies) {
    let query = `CREATE POLICY "${policy.name}" ON investment_accounts FOR ${policy.action} `;
    
    if (policy.action === 'INSERT') {
      query += `WITH CHECK (${policy.definition})`;
    } else if (policy.action === 'UPDATE') {
      query += `USING (${policy.definition}) WITH CHECK (${policy.definition})`;
    } else {
      query += `USING (${policy.definition})`;
    }
    
    const { error } = await supabase.rpc('execute_sql', { sql_query: query });
    
    if (error) {
      console.error(`Error creating policy "${policy.name}":`, error);
    } else {
      console.log(`Created policy "${policy.name}"`);
    }
  }
}

// Run the script
addUserIdToInvestmentAccounts()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 