/**
 * Script to test budget syncing functionality
 * Run this script with:
 * node scripts/test-budget-sync.js [action] [transactionId] [categoryId]
 * 
 * Where:
 * - action: 'mark', 'unmark', or 'verify'
 * - transactionId: The ID of the transaction to test
 * - categoryId: (Only required for 'mark' action) The budget category ID
 * 
 * Examples:
 * node scripts/test-budget-sync.js mark 123 456
 * node scripts/test-budget-sync.js unmark 123
 * node scripts/test-budget-sync.js verify 123
 */

// No need for external dependencies, using built-in fetch

async function testBudgetSync() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node test-budget-sync.js [action] [transactionId] [categoryId]');
    process.exit(1);
  }
  
  const action = args[0];
  const transactionId = parseInt(args[1], 10);
  const categoryId = args[2] ? parseInt(args[2], 10) : undefined;
  
  if (!['mark', 'unmark', 'verify'].includes(action)) {
    console.error('Action must be one of: mark, unmark, verify');
    process.exit(1);
  }
  
  if (isNaN(transactionId) || transactionId <= 0) {
    console.error('Transaction ID must be a positive number');
    process.exit(1);
  }
  
  if (action === 'mark' && (isNaN(categoryId) || categoryId <= 0)) {
    console.error('Category ID must be a positive number for mark action');
    process.exit(1);
  }
  
  try {
    // Using the debug API endpoint
    const response = await fetch('http://localhost:3000/api/debug/test-budget-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        transactionId,
        categoryId
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error:', result.error || 'Unknown error');
      process.exit(1);
    }
    
    console.log('== Test Results ==');
    console.log(JSON.stringify(result, null, 2));
    
    if (action === 'verify') {
      console.log('\n== Summary ==');
      const { transaction, budgetTransaction, budgetEntry } = result.result;
      
      console.log(`Transaction ${transactionId}:`);
      console.log(`- is_budget_expense: ${transaction.is_budget_expense}`);
      console.log(`- budget_category_id: ${transaction.budget_category_id || 'null'}`);
      
      if (budgetTransaction) {
        console.log('\nBudget Transaction:');
        console.log(`- id: ${budgetTransaction.id}`);
        console.log(`- category_id: ${budgetTransaction.category_id}`);
        console.log(`- amount: ${budgetTransaction.amount}`);
      } else {
        console.log('\nNo budget transaction found');
      }
      
      if (budgetEntry) {
        console.log('\nBudget Entry:');
        console.log(`- id: ${budgetEntry.id}`);
        console.log(`- category_id: ${budgetEntry.category_id}`);
        console.log(`- month: ${budgetEntry.month}`);
        console.log(`- allocated: ${budgetEntry.allocated}`);
        console.log(`- spent: ${budgetEntry.spent}`);
      } else {
        console.log('\nNo budget entry found');
      }
      
      if (transaction.is_budget_expense && transaction.budget_category_id) {
        if (!budgetTransaction) {
          console.log('\n⚠️ ISSUE: Transaction is marked as budget expense but no budget transaction exists');
        }
        if (!budgetEntry) {
          console.log('\n⚠️ ISSUE: Transaction is marked as budget expense but no budget entry exists');
        }
      } else if (!transaction.is_budget_expense && budgetTransaction) {
        console.log('\n⚠️ ISSUE: Transaction is not marked as budget expense but a budget transaction exists');
      }
    }
    
  } catch (error) {
    console.error('Network error:', error.message);
    process.exit(1);
  }
}

testBudgetSync(); 