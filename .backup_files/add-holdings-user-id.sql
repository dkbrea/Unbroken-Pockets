-- Add user_id column to holdings table
ALTER TABLE IF EXISTS public.holdings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on the user_id column for better query performance
CREATE INDEX IF NOT EXISTS idx_holdings_user_id 
ON public.holdings(user_id);

-- Get the first user ID to use as a default for existing records
DO $$
DECLARE
    default_user_id UUID;
BEGIN
    -- Get a default user ID from the users table
    SELECT id INTO default_user_id FROM auth.users LIMIT 1;
    
    IF default_user_id IS NOT NULL THEN
        -- Update existing records to use the default user ID
        UPDATE public.holdings 
        SET user_id = default_user_id 
        WHERE user_id IS NULL;
        
        -- Make the user_id column NOT NULL
        ALTER TABLE public.holdings ALTER COLUMN user_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'No users found in the database. Cannot set user_id column to NOT NULL.';
    END IF;
END $$;

-- Enable Row Level Security on the holdings table
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security policies

-- 1. Allow users to view their own holdings
CREATE POLICY "Users can view their own holdings" 
ON public.holdings
FOR SELECT 
USING ((auth.uid())::uuid = user_id);

-- 2. Allow users to insert their own holdings
CREATE POLICY "Users can insert their own holdings" 
ON public.holdings
FOR INSERT 
WITH CHECK ((auth.uid())::uuid = user_id);

-- 3. Allow users to update their own holdings
CREATE POLICY "Users can update their own holdings" 
ON public.holdings
FOR UPDATE 
USING ((auth.uid())::uuid = user_id)
WITH CHECK ((auth.uid())::uuid = user_id);

-- 4. Allow users to delete their own holdings
CREATE POLICY "Users can delete their own holdings" 
ON public.holdings
FOR DELETE 
USING ((auth.uid())::uuid = user_id); 