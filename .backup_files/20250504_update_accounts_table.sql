-- Add user_id column to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE;

-- Enable Row Level Security for accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts table
CREATE POLICY "Users can view their own accounts" 
ON accounts 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own accounts" 
ON accounts 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own accounts" 
ON accounts 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own accounts" 
ON accounts 
FOR DELETE 
USING (user_id = auth.uid());

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id); 