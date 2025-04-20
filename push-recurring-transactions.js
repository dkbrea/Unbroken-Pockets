// Script to sync locally stored recurring transactions to Supabase
// This script retrieves transactions from localStorage and pushes them to Supabase
// Usage: node push-recurring-transactions.js

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const readline = require('readline');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error: User not authenticated', userError);
      console.log('Please login first using the web application');
      process.exit(1);
    }
    
    console.log(`Authenticated as user: ${user.email}`);
    
    // Check if the user wants to input JSON directly or load from a file
    rl.question('Do you want to (1) paste JSON directly or (2) load from a file? ', async (choice) => {
      if (choice === '1') {
        // Direct input method
        rl.question('Please paste the contents of localStorage["recurring_transactions"] here: ', async (input) => {
          processTransactions(input, user);
        });
      } else if (choice === '2') {
        // File input method
        rl.question('Enter the path to the JSON file containing recurring transactions: ', async (filePath) => {
          try {
            const fileData = fs.readFileSync(filePath, 'utf8');
            processTransactions(fileData, user);
          } catch (err) {
            console.error('Error reading file:', err);
            rl.close();
            process.exit(1);
          }
        });
      } else {
        console.error('Invalid choice');
        rl.close();
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    rl.close();
    process.exit(1);
  }
}

function processTransactions(input, user) {
  if (!input) {
    console.error('No data provided');
    rl.close();
    process.exit(1);
  }
  
  let localTransactions;
  try {
    localTransactions = JSON.parse(input);
    console.log(`Found ${localTransactions.length} local transactions`);
  } catch (err) {
    console.error('Error parsing input as JSON:', err);
    rl.close();
    process.exit(1);
  }
  
  // Fetch existing transactions from Supabase
  supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', user.id)
    .then(({ data: existingTransactions, error: fetchError }) => {
      if (fetchError) {
        console.error('Error fetching existing transactions:', fetchError);
        rl.close();
        process.exit(1);
      }
      
      console.log(`Found ${existingTransactions.length} existing transactions in Supabase`);
      
      // Find transactions that are in localStorage but not in Supabase
      const transactionsToSync = localTransactions.filter(localTx => {
        // Skip if it already has a valid database ID (positive number) and exists in the database
        if (typeof localTx.id === 'number' && localTx.id > 0) {
          return !existingTransactions.some(dbTx => dbTx.id === localTx.id);
        }
        
        // Otherwise check by name, amount, and date
        return !existingTransactions.some(dbTx => 
          dbTx.name === localTx.name && 
          dbTx.amount === localTx.amount && 
          dbTx.next_date === localTx.nextDate
        );
      });
      
      console.log(`Found ${transactionsToSync.length} transactions to sync`);
      
      if (transactionsToSync.length === 0) {
        console.log('No new transactions to sync. Exiting.');
        rl.close();
        return;
      }
      
      // Confirm before proceeding
      rl.question(`Do you want to push ${transactionsToSync.length} transactions to Supabase? (yes/no): `, async (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('Operation cancelled');
          rl.close();
          return;
        }
        
        // Prepare transactions for insertion
        const transactionsToInsert = transactionsToSync.map(tx => ({
          name: tx.name,
          amount: tx.amount,
          frequency: tx.frequency,
          category: tx.category,
          next_date: tx.nextDate,
          status: tx.status || 'active',
          payment_method: tx.paymentMethod,
          user_id: user.id,
          type: tx.type || 'expense',
          description: tx.description || '',
          start_date: tx.startDate || tx.nextDate,
          debt_id: tx.debtId
        }));
        
        // Insert transactions into Supabase
        supabase
          .from('recurring_transactions')
          .insert(transactionsToInsert)
          .select()
          .then(({ data: insertedData, error: insertError }) => {
            if (insertError) {
              console.error('Error inserting transactions:', insertError);
              rl.close();
              process.exit(1);
            }
            
            console.log(`Successfully synced ${insertedData.length} transactions to Supabase`);
            console.log('Transaction IDs:', insertedData.map(tx => tx.id).join(', '));
            
            rl.close();
          });
      });
    });
}

// Make the script compatible with CommonJS
rl.on('close', () => {
  process.exit(0);
});

main(); 