-- Add user_id column to accounts table
ALTER TABLE accounts ADD COLUMN user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Enable Row Level Security for accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts" 
ON accounts
FOR SELECT 
TO authenticated
USING ((auth.uid()) = user_id);

CREATE POLICY "Users can insert their own accounts" 
ON accounts
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can update their own accounts" 
ON accounts
FOR UPDATE 
TO authenticated
USING ((auth.uid()) = user_id)
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON accounts
FOR DELETE 
TO authenticated
USING ((auth.uid()) = user_id); 