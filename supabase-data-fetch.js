// This script fetches and displays all recurring transactions from your Supabase database
// with authentication to access user data protected by RLS policies
// Run with: node supabase-data-fetch.js
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Create Supabase client with anon key
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function
async function main() {
  console.log('Supabase Recurring Transactions Viewer');
  console.log('====================================');
  
  // Ask for login credentials
  rl.question('Enter your email: ', async (email) => {
    rl.question('Enter your password: ', async (password) => {
      try {
        // Sign in
        console.log(`Attempting to sign in as ${email}...`);
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error('Sign in error:', signInError.message);
          rl.close();
          return;
        }
        
        console.log(`Successfully signed in as ${user.email} (User ID: ${user.id})`);
        
        // Now fetch recurring transactions for this authenticated user
        await fetchRecurringTransactions(user.id);
        
        rl.close();
      } catch (err) {
        console.error('Unexpected error during authentication:', err);
        rl.close();
      }
    });
  });
}

// Function to fetch recurring transactions for a specific user
async function fetchRecurringTransactions(userId) {
  console.log(`Fetching recurring transactions for user ID: ${userId}...`);
  
  try {
    // First try to filter by user_id (if RLS is set up properly)
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('next_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching recurring transactions:', error);
      return;
    }
    
    console.log(`Found ${data ? data.length : 0} recurring transactions:`);
    if (data && data.length > 0) {
      // Format each transaction to make it easier to read
      console.log('Recurring Transactions:');
      data.forEach((tx, index) => {
        console.log(`\n--- Transaction ${index + 1} ---`);
        console.log(`ID: ${tx.id}`);
        console.log(`Name: ${tx.name}`);
        console.log(`Amount: $${tx.amount}`);
        console.log(`Category: ${tx.category}`);
        console.log(`Next Date: ${tx.next_date}`);
        console.log(`Status: ${tx.status}`);
        console.log(`User ID: ${tx.user_id}`);
        console.log(`Type: ${tx.type || 'Not specified'}`);
      });
      
      // Also output the full JSON for reference
      console.log('\nFull JSON data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('No recurring transactions found in database.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the main function
main();

// Close readline on exit
rl.on('close', () => {
  console.log('Session ended.');
  process.exit(0);
}); 