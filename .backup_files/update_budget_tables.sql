-- Modify existing budget_categories table to add user_id
ALTER TABLE budget_categories 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update RLS for budget_categories
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own budget categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can insert their own budget categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can update their own budget categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can delete their own budget categories" ON budget_categories;

-- Create new policies
CREATE POLICY "Users can view their own budget categories" 
  ON budget_categories FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own budget categories" 
  ON budget_categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" 
  ON budget_categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" 
  ON budget_categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Create budget_entries table to track monthly allocations and spending
CREATE TABLE IF NOT EXISTS budget_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- Store as first day of month (e.g., '2023-05-01' for May 2023)
  allocated DECIMAL(12, 2) NOT NULL DEFAULT 0,
  spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure one entry per category per month per user
  UNIQUE(user_id, category_id, month)
);

-- Add RLS policies for budget_entries
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget entries" 
  ON budget_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget entries" 
  ON budget_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget entries" 
  ON budget_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget entries" 
  ON budget_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Create budget_transactions table to link transactions to budget categories
CREATE TABLE IF NOT EXISTS budget_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id INTEGER, -- Reference to transactions table (if applicable)
  category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for budget_transactions
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget transactions" 
  ON budget_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget transactions" 
  ON budget_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget transactions" 
  ON budget_transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget transactions" 
  ON budget_transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_user_id ON budget_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_category_id ON budget_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_month ON budget_entries(month);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_user_id ON budget_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_category_id ON budget_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_date ON budget_transactions(date); 