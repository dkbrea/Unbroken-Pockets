-- Check if RLS is enabled on accounts table and enable it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'accounts' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on accounts table';
    ELSE
        RAISE NOTICE 'RLS already enabled on accounts table';
    END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;

-- Create policies with correct auth.uid() usage
CREATE POLICY "Users can view their own accounts" 
ON accounts 
FOR SELECT 
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own accounts" 
ON accounts 
FOR INSERT 
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own accounts" 
ON accounts 
FOR UPDATE 
USING (user_id = (select auth.uid())) 
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own accounts" 
ON accounts 
FOR DELETE 
USING (user_id = (select auth.uid()));

-- Add policy for anon users in development mode
CREATE POLICY "Development mode access for anon users"
ON accounts
TO anon
USING (true)
WITH CHECK (true);

-- Make sure the user_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'accounts' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to accounts table';
    ELSE
        RAISE NOTICE 'user_id column already exists in accounts table';
    END IF;
END $$; 