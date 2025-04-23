// Debugging script to fetch data from budget-related tables

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (the actual URL and key will be read from environment variables or .env file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and key must be provided via environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch data from a table
async function fetchTableData(tableName) {
  console.log(`\nFetching data from ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Retrieved ${data.length} rows from ${tableName}`);
    console.table(data);
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error.message);
    return [];
  }
}

// Main function
async function main() {
  console.log('Budget Data Fetcher - Debugging Tool');
  console.log('====================================');

  // Fetch budget entries data
  const budgetEntries = await fetchTableData('budget_entries');
  
  // Fetch budget transactions data
  const budgetTransactions = await fetchTableData('budget_transactions');
  
  // Fetch transactions with budget_category_id
  console.log('\nFetching transactions with budget categories...');
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .not('budget_category_id', 'is', null);
    
    if (error) {
      throw error;
    }
    
    console.log(`Retrieved ${data.length} transactions with budget_category_id`);
    console.table(data);
  } catch (error) {
    console.error('Error fetching transactions with budget categories:', error.message);
  }
  
  // Additional analysis: Check for any discrepancies
  if (budgetEntries.length > 0 && budgetTransactions.length > 0) {
    console.log('\nAnalyzing data for potential discrepancies...');
    
    // Group budget transactions by category and month
    const transactionsByMonthAndCategory = {};
    
    budgetTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      const key = `${month}_${transaction.category_id}`;
      
      if (!transactionsByMonthAndCategory[key]) {
        transactionsByMonthAndCategory[key] = {
          month,
          category_id: transaction.category_id,
          total_amount: 0,
          transactions: []
        };
      }
      
      transactionsByMonthAndCategory[key].total_amount += transaction.amount;
      transactionsByMonthAndCategory[key].transactions.push(transaction);
    });
    
    // Compare with budget entries
    budgetEntries.forEach(entry => {
      const month = entry.month.substring(0, 10); // Truncate to YYYY-MM-DD
      const key = `${month}_${entry.category_id}`;
      
      if (transactionsByMonthAndCategory[key]) {
        const transactionsTotal = transactionsByMonthAndCategory[key].total_amount;
        
        if (Math.abs(entry.spent - transactionsTotal) > 0.01) { // Allow for small floating point differences
          console.log(`\nPossible discrepancy detected for category ${entry.category_id} in month ${month}:`);
          console.log(`- Budget entry spent: ${entry.spent}`);
          console.log(`- Sum of budget transactions: ${transactionsTotal}`);
          console.log(`- Difference: ${entry.spent - transactionsTotal}`);
        }
      } else {
        console.log(`\nBudget entry exists for category ${entry.category_id} in month ${month}, but no matching budget transactions found.`);
      }
    });
  }
}

// Run the main function
main()
  .catch(error => {
    console.error('Unexpected error:', error);
  })
  .finally(() => {
    console.log('\nScript execution completed.');
    process.exit(0);
  }); 