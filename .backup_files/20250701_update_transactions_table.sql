-- Update transactions table to add debt_id and improve debt tracking

-- Add debt_id column to transactions table
ALTER TABLE IF EXISTS transactions
ADD COLUMN IF NOT EXISTS debt_id INTEGER REFERENCES debts(id),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for improved performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_debt_id ON transactions(debt_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Set up Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON transactions FOR DELETE 
  USING (auth.uid() = user_id); 