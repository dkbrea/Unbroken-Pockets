-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  balance DECIMAL(18, 2) NOT NULL,
  interest_rate DECIMAL(8, 4) NOT NULL,
  minimum_payment DECIMAL(18, 2) NOT NULL,
  category TEXT,
  lender TEXT,
  notes TEXT,
  due_date INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_category ON debts(category);

-- Set up Row Level Security (RLS)
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create policies for debts
CREATE POLICY "Users can view their own debts" 
  ON debts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" 
  ON debts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
  ON debts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
  ON debts FOR DELETE 
  USING (auth.uid() = user_id); 