-- Add user_id column to investment_accounts table
ALTER TABLE IF EXISTS public.investment_accounts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on the user_id column for better query performance
CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_id 
ON public.investment_accounts(user_id);

-- Get the first user ID to use as a default for existing records
DO $$
DECLARE
    default_user_id UUID;
BEGIN
    -- Get a default user ID from the users table
    SELECT id INTO default_user_id FROM auth.users LIMIT 1;
    
    IF default_user_id IS NOT NULL THEN
        -- Update existing records to use the default user ID
        UPDATE public.investment_accounts 
        SET user_id = default_user_id 
        WHERE user_id IS NULL;
        
        -- Make the user_id column NOT NULL
        ALTER TABLE public.investment_accounts ALTER COLUMN user_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'No users found in the database. Cannot set user_id column to NOT NULL.';
    END IF;
END $$;

-- Enable Row Level Security on the investment_accounts table
ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security policies

-- 1. Allow users to view their own investment accounts
CREATE POLICY "Users can view their own investment accounts" 
ON public.investment_accounts
FOR SELECT 
USING ((auth.uid())::uuid = user_id);

-- 2. Allow users to insert their own investment accounts
CREATE POLICY "Users can insert their own investment accounts" 
ON public.investment_accounts
FOR INSERT 
WITH CHECK ((auth.uid())::uuid = user_id);

-- 3. Allow users to update their own investment accounts
CREATE POLICY "Users can update their own investment accounts" 
ON public.investment_accounts
FOR UPDATE 
USING ((auth.uid())::uuid = user_id)
WITH CHECK ((auth.uid())::uuid = user_id);

-- 4. Allow users to delete their own investment accounts
CREATE POLICY "Users can delete their own investment accounts" 
ON public.investment_accounts
FOR DELETE 
USING ((auth.uid())::uuid = user_id); 