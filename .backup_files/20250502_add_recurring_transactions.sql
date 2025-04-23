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

-- Set Row Level Security (to be consistent with other tables)
ALTER TABLE public.recurring_transactions DISABLE ROW LEVEL SECURITY; 