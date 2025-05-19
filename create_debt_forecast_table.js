import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your local Supabase URL and anon key
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDebtPaymentsForecastTable() {
  try {
    // First check if the table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('debt_payments_forecast')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table does not exist, creating it...');
      
      // Create the table using raw SQL
      const { error } = await supabase.rpc('create_debt_payments_forecast_table');
      
      if (error) {
        console.error('Error creating table:', error);
        return;
      }
      
      console.log('Table created successfully!');
    } else {
      console.log('Table already exists:', tableExists);
    }
    
    // Test inserting a record
    const { data, error } = await supabase
      .from('debt_payments_forecast')
      .insert({
        debt_id: 1,
        user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
        month: '2025-05',
        amount: -100.00
      })
      .select();
    
    if (error) {
      console.error('Error inserting test record:', error);
      return;
    }
    
    console.log('Test record inserted:', data);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// First create the function to create the table
async function createFunction() {
  const createFunctionSQL = `
  CREATE OR REPLACE FUNCTION create_debt_payments_forecast_table()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    CREATE TABLE IF NOT EXISTS public.debt_payments_forecast (
      id SERIAL PRIMARY KEY,
      debt_id INTEGER NOT NULL,
      user_id UUID NOT NULL,
      month VARCHAR(7) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(debt_id, month, user_id)
    );
    
    -- Add indexes for performance
    CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_debt_id ON public.debt_payments_forecast(debt_id);
    CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_user_id ON public.debt_payments_forecast(user_id);
    CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_month ON public.debt_payments_forecast(month);
    
    -- Enable RLS
    ALTER TABLE public.debt_payments_forecast ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    DROP POLICY IF EXISTS select_own_debt_payments ON public.debt_payments_forecast;
    CREATE POLICY select_own_debt_payments ON public.debt_payments_forecast 
      FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS insert_own_debt_payments ON public.debt_payments_forecast;
    CREATE POLICY insert_own_debt_payments ON public.debt_payments_forecast 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS update_own_debt_payments ON public.debt_payments_forecast;
    CREATE POLICY update_own_debt_payments ON public.debt_payments_forecast 
      FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS delete_own_debt_payments ON public.debt_payments_forecast;
    CREATE POLICY delete_own_debt_payments ON public.debt_payments_forecast 
      FOR DELETE USING (auth.uid() = user_id);
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON TABLE public.debt_payments_forecast TO postgres, anon, authenticated, service_role;
    GRANT USAGE, SELECT ON SEQUENCE public.debt_payments_forecast_id_seq TO postgres, anon, authenticated, service_role;
  END;
  $$;
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
  
  if (error) {
    console.error('Error creating function:', error);
    return false;
  }
  
  console.log('Function created successfully!');
  return true;
}

// Execute the process
async function run() {
  const functionCreated = await createFunction();
  if (functionCreated) {
    await createDebtPaymentsForecastTable();
  }
}

run();
