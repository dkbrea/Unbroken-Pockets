// Script to fetch and display transaction data from Supabase
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with anon key
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample fallback data from the application code (for comparison)
const sampleFallbackData = [
  {
    id: 1,
    date: '2023-06-01',
    name: 'Grocery Store',
    category: 'Food',
    amount: -120.50,
    account: 'Checking Account',
    logo: '/logos/grocery.png',
    isReconciled: true,
    notes: 'Weekly groceries',
    tags: ['groceries', 'essential']
  },
  {
    id: 2,
    date: '2023-06-02',
    name: 'Gas Station',
    category: 'Transportation',
    amount: -45.00,
    account: 'Credit Card',
    logo: '/logos/gas.png',
    isReconciled: true,
    notes: 'Fill up tank',
    tags: ['car', 'essential']
  }
];

async function analyzeTransactionData() {
  console.log('Fetching transaction data from Supabase...');
  
  try {
    // Get all transactions from Supabase
    const { data: dbTransactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }
    
    console.log(`Successfully fetched ${dbTransactions.length} transactions from Supabase.`);
    
    // Display first 3 transactions from the database
    console.log('\nSample transactions from Supabase database:');
    console.log('==========================================');
    dbTransactions.slice(0, 3).forEach((tx, i) => {
      console.log(`\nTransaction #${i+1}:`);
      console.log(JSON.stringify(tx, null, 2));
    });
    
    // Display sample fallback data
    console.log('\nSample fallback data (that might be showing in your app):');
    console.log('====================================================');
    sampleFallbackData.slice(0, 2).forEach((tx, i) => {
      console.log(`\nFallback Transaction #${i+1}:`);
      console.log(JSON.stringify(tx, null, 2));
    });
    
    // Compare date patterns to determine if the app might be using fallback data
    console.log('\nData pattern analysis:');
    console.log('====================');
    
    // Check date patterns
    const dbDatePattern = dbTransactions.length > 0 ? dbTransactions[0].date.substring(0, 4) : '';
    const sampleDatePattern = sampleFallbackData.length > 0 ? sampleFallbackData[0].date.substring(0, 4) : '';
    
    console.log(`Database dates start with: ${dbDatePattern}`);
    console.log(`Fallback dates start with: ${sampleDatePattern}`);
    
    if (dbDatePattern && sampleDatePattern && dbDatePattern !== sampleDatePattern) {
      console.log('\n🔍 FINDING: Your application may be showing fallback data instead of database data.');
      console.log('The date patterns between the database and sample data are different.');
    }
    
    // Check property name differences
    const dbProps = dbTransactions.length > 0 ? Object.keys(dbTransactions[0]) : [];
    const sampleProps = sampleFallbackData.length > 0 ? Object.keys(sampleFallbackData[0]) : [];
    
    const missingInDb = sampleProps.filter(prop => !dbProps.includes(prop));
    const missingInSample = dbProps.filter(prop => !sampleProps.includes(prop));
    
    if (missingInDb.length > 0) {
      console.log(`\n🔍 FINDING: Database is missing these properties that exist in sample data: ${missingInDb.join(', ')}`);
    }
    
    if (missingInSample.length > 0) {
      console.log(`\n🔍 FINDING: Sample data is missing these properties that exist in database: ${missingInSample.join(', ')}`);
    }
    
    // Property name case differences
    const caseChanges = [];
    for (const dbProp of dbProps) {
      const matchingProp = sampleProps.find(p => p.toLowerCase() === dbProp.toLowerCase() && p !== dbProp);
      if (matchingProp) {
        caseChanges.push({ db: dbProp, sample: matchingProp });
      }
    }
    
    if (caseChanges.length > 0) {
      console.log('\n🔍 FINDING: Property name case differences between database and sample data:');
      caseChanges.forEach(({ db, sample }) => {
        console.log(`  - Database: "${db}" vs Sample: "${sample}"`);
      });
    }
    
    // Provide recommendations
    console.log('\nRECOMMENDATIONS:');
    console.log('===============');
    console.log('1. Check if your application code is properly using the database data instead of fallback data');
    console.log('2. Verify the environment variables for Supabase connection are correctly set');
    console.log('3. Look for property name mismatches - database uses snake_case while app might expect camelCase');
    console.log('4. Inspect your application\'s data fetching logic for conditions that might cause it to use fallback data');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the analysis
analyzeTransactionData(); 