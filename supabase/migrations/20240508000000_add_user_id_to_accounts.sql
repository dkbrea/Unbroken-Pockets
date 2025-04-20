-- Add user_id column to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Update existing accounts with the default user ID from auth
UPDATE accounts SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id required for future inserts
ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL;

-- Enable Row Level Security for accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

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