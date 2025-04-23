-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  next_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  payment_method VARCHAR(255) NOT NULL,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_status ON recurring_transactions(status);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);

-- Enable Row Level Security for recurring_transactions
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for recurring_transactions
CREATE POLICY "Users can view their own recurring transactions" 
ON public.recurring_transactions
FOR SELECT 
TO authenticated
USING ((auth.uid()) = user_id);

CREATE POLICY "Users can insert their own recurring transactions" 
ON public.recurring_transactions
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
ON public.recurring_transactions
FOR UPDATE 
TO authenticated
USING ((auth.uid()) = user_id)
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
ON public.recurring_transactions
FOR DELETE 
TO authenticated
USING ((auth.uid()) = user_id);

-- Insert recurring transactions
INSERT INTO recurring_transactions (name, amount, frequency, category, next_date, status, payment_method, user_id) VALUES
  ('Rent Payment', -1800, 'Monthly', 'Housing', '2023-04-30', 'active', 'Chase Checking', 'usr_123456'),
  ('Netflix Subscription', -15.99, 'Monthly', 'Entertainment', '2023-05-04', 'active', 'Amex Gold Card', 'usr_123456'),
  ('Gym Membership', -45, 'Monthly', 'Health & Fitness', '2023-05-09', 'active', 'Chase Checking', 'usr_123456'),
  ('Salary', 4200, 'Bi-weekly', 'Income', '2023-05-14', 'active', 'Direct Deposit', 'usr_123456'),
  ('Car Insurance', -95, 'Monthly', 'Insurance', '2023-05-21', 'active', 'Amex Gold Card', 'usr_123456'),
  ('Internet Bill', -79.99, 'Monthly', 'Utilities', '2023-05-24', 'active', 'Chase Checking', 'usr_123456'),
  ('Music Subscription', -9.99, 'Monthly', 'Entertainment', '2023-05-15', 'paused', 'Amex Gold Card', 'usr_123456'); 