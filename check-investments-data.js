require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInvestmentsData() {
  console.log('Checking investment accounts data...');

  try {
    // First, check if there are any accounts in the investment_accounts table
    const { data: accounts, error: accountsError } = await supabase
      .from('investment_accounts')
      .select('*');
    
    if (accountsError) {
      console.error('Error fetching investment accounts:', accountsError);
      return;
    }
    
    console.log(`Found ${accounts.length} investment accounts in total.`);
    
    // Check which ones have user_id and which don't
    const accountsWithUserId = accounts.filter(acc => acc.user_id);
    const accountsWithoutUserId = accounts.filter(acc => !acc.user_id);
    
    console.log(`Accounts with user_id: ${accountsWithUserId.length}`);
    console.log(`Accounts without user_id: ${accountsWithoutUserId.length}`);
    
    if (accountsWithUserId.length > 0) {
      console.log('Sample account with user_id:');
      console.log(JSON.stringify(accountsWithUserId[0], null, 2));
    }
    
    if (accountsWithoutUserId.length > 0) {
      console.log('Sample account without user_id:');
      console.log(JSON.stringify(accountsWithoutUserId[0], null, 2));
      
      // We should fix accounts that don't have user_id
      console.log('These accounts need to be updated with a user_id');
    }
    
    // Check the hook function that's loading data in the app
    console.log('\nChecking how the app is loading investment data...');
    console.log('The loadInvestmentsData function should be filtering by user_id like this:');
    console.log(`
    // In src/lib/supabaseUtils.ts, the loadInvestmentsData function should include:
    
    // Get accounts that belong to the current user
    const { data: accountsData, error: accountsError } = await supabase
      .from('investment_accounts')
      .select('*')
      .eq('user_id', auth.uid()); // This line is important!
    `);
    
    // Get all users for reference
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`\nFound ${users.length} users in the system.`);
    console.log('Users:');
    console.log(JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
checkInvestmentsData()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 