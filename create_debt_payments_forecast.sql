-- Create debt_payments_forecast table if it doesn't exist
CREATE TABLE IF NOT EXISTS debt_payments_forecast (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(debt_id, month, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_debt_id ON debt_payments_forecast(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_user_id ON debt_payments_forecast(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_month ON debt_payments_forecast(month);

-- Add RLS (Row Level Security) policies
ALTER TABLE debt_payments_forecast ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own data
CREATE POLICY select_own_debt_payments ON debt_payments_forecast 
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert only their own data
CREATE POLICY insert_own_debt_payments ON debt_payments_forecast 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own data
CREATE POLICY update_own_debt_payments ON debt_payments_forecast 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own data
CREATE POLICY delete_own_debt_payments ON debt_payments_forecast 
  FOR DELETE USING (auth.uid() = user_id);
