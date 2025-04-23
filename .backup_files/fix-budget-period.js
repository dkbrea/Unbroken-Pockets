// Script to fix missing budget period
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with anon key
const supabaseUrl = 'https://vhtltupeibcofyopizxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGx0dXBlaWJjb2Z5b3BpenhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjcyOTYsImV4cCI6MjA2MDQ0MzI5Nn0.Qt13OpffPJSu_xct98xJo7Y3fNPgkaxSnlkFmB9vokQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixBudgetPeriod() {
  console.log('Checking budget_periods table...');
  
  // Check if there are any active budget periods
  const { data: existingPeriods, error: checkError } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('is_active', true);
  
  if (checkError) {
    console.error('Error checking budget periods:', checkError);
    return;
  }
  
  if (existingPeriods && existingPeriods.length > 0) {
    console.log('Active budget period already exists:', existingPeriods[0]);
    return;
  }
  
  // Insert a new budget period
  const { data, error } = await supabase
    .from('budget_periods')
    .insert([
      { name: 'May 2025', is_active: true }
    ])
    .select();
  
  if (error) {
    console.error('Error inserting budget period:', error);
    return;
  }
  
  console.log('Successfully added new budget period:', data);
}

fixBudgetPeriod(); 