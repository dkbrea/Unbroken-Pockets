// Script to fix user_id format issues in recurring transactions
// This script ensures user_id values are in the correct format for RLS policies to work

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const readline = require('readline');

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
    
    console.log(`Authenticated as user: ${user.email} (ID: ${user.id})`);
    console.log('-'.repeat(80));

    // First, check if the table exists and if we can access it
    console.log('Checking table access...');
    const { count, error: countError } = await supabase
      .from('recurring_transactions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error accessing transactions table:', countError);
      process.exit(1);
    }
    
    console.log('Table exists and is accessible');
    console.log('-'.repeat(80));
    
    // Fetch all transactions for the current user
    console.log('Fetching transactions...');
    
    // First try exact match
    const { data: exactMatches, error: exactError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id);
    
    if (exactError) {
      console.error('Error fetching transactions with exact match:', exactError);
      process.exit(1);
    }
    
    console.log(`Found ${exactMatches.length} transactions with exact user ID match`);
    
    // Now try to find any inconsistently formatted IDs
    // Look for records that might have string vs UUID formatting issues
    const { data: allTransactions, error: allError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .not('user_id', 'is', null); // Skip null user_ids
    
    if (allError) {
      console.error('Error fetching all transactions:', allError);
    } else {
      console.log(`Found ${allTransactions.length} total transactions with non-null user_id`);
      
      // Look for potential format issues by comparing string representation
      const userIdStr = user.id.toString();
      const potentialMatches = allTransactions.filter(tx => 
        tx.user_id && tx.user_id.toString() === userIdStr && tx.user_id !== user.id
      );
      
      if (potentialMatches.length > 0) {
        console.log(`Found ${potentialMatches.length} transactions with user ID format issues`);
        
        // Show sample of the format issue
        if (potentialMatches.length > 0) {
          console.log('Sample transaction with format issue:');
          console.log(`ID: ${potentialMatches[0].id}`);
          console.log(`user_id: ${potentialMatches[0].user_id} (type: ${typeof potentialMatches[0].user_id})`);
          console.log(`Expected: ${user.id} (type: ${typeof user.id})`);
        }
        
        rl.question('Do you want to fix these format issues? (yes/no): ', async (answer) => {
          if (answer.toLowerCase() === 'yes') {
            console.log('Fixing user ID format issues...');
            
            let fixedCount = 0;
            const errors = [];
            
            // Update transactions one by one
            for (const tx of potentialMatches) {
              const { error: updateError } = await supabase
                .from('recurring_transactions')
                .update({ user_id: user.id })
                .eq('id', tx.id);
              
              if (updateError) {
                console.error(`Error updating transaction ${tx.id}:`, updateError);
                errors.push({ id: tx.id, error: updateError });
              } else {
                fixedCount++;
              }
            }
            
            console.log(`Fixed ${fixedCount} of ${potentialMatches.length} transactions`);
            if (errors.length > 0) {
              console.log(`Failed to fix ${errors.length} transactions`);
            }
          } else {
            console.log('No changes made');
          }
          
          // Now let's check for transactions without a valid user_id that might belong to current user
          console.log('-'.repeat(80));
          console.log('Checking for orphaned transactions in localStorage...');
          
          rl.question('Do you want to check localStorage for transactions that should be linked to your account? (yes/no): ', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
              rl.question('Please paste the contents of localStorage["recurring_transactions"] here: ', async (input) => {
                if (!input) {
                  console.log('No data provided');
                  rl.close();
                  return;
                }
                
                try {
                  const localTransactions = JSON.parse(input);
                  console.log(`Found ${localTransactions.length} local transactions`);
                  
                  // Find transactions in local storage that aren't in the database
                  const dbIds = new Set(allTransactions.map(tx => tx.id));
                  const orphanedTransactions = localTransactions.filter(tx => 
                    (typeof tx.id === 'number' && tx.id > 0 && !dbIds.has(tx.id))
                  );
                  
                  console.log(`Found ${orphanedTransactions.length} orphaned transactions in localStorage`);
                  
                  if (orphanedTransactions.length > 0) {
                    rl.question(`Do you want to link these ${orphanedTransactions.length} orphaned transactions to your account? (yes/no): `, async (answer) => {
                      if (answer.toLowerCase() === 'yes') {
                        console.log('Attempting to insert orphaned transactions...');
                        
                        const transactionsToInsert = orphanedTransactions.map(tx => ({
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
                        
                        const { data: insertedData, error: insertError } = await supabase
                          .from('recurring_transactions')
                          .insert(transactionsToInsert)
                          .select();
                        
                        if (insertError) {
                          console.error('Error inserting orphaned transactions:', insertError);
                        } else {
                          console.log(`Successfully inserted ${insertedData.length} orphaned transactions`);
                          console.log('New transaction IDs:', insertedData.map(tx => tx.id).join(', '));
                        }
                      }
                      
                      rl.close();
                    });
                  } else {
                    console.log('No orphaned transactions found to link');
                    rl.close();
                  }
                } catch (err) {
                  console.error('Error parsing localStorage data:', err);
                  rl.close();
                }
              });
            } else {
              rl.close();
            }
          });
        });
      } else {
        console.log('No user ID format issues found');
        rl.close();
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    rl.close();
    process.exit(1);
  }
}

// Handle readline close
rl.on('close', () => {
  console.log('Done');
  process.exit(0);
});

main(); 