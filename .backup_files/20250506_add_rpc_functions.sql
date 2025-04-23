-- Create an RPC function to add the user_id column to accounts table
CREATE OR REPLACE FUNCTION public.add_user_id_column_to_accounts()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the user_id column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'user_id'
    ) THEN
        -- Add the user_id column as VARCHAR instead of UUID to be more flexible
        ALTER TABLE public.accounts ADD COLUMN user_id VARCHAR(255);
        RAISE NOTICE 'Added user_id column to accounts table';
    ELSE
        RAISE NOTICE 'user_id column already exists in accounts table';
    END IF;
    
    -- Make sure RLS is enabled
    ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
    
    -- Create a simple, permissive policy for development
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Allow all operations for any user'
    ) THEN
        -- Drop any existing policies first
        DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
        DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
        DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
        DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
        DROP POLICY IF EXISTS "Development mode access for anon users" ON public.accounts;
        
        -- Create a simple permissive policy
        CREATE POLICY "Allow all operations for any user" ON public.accounts
            USING (true)
            WITH CHECK (true);
        
        RAISE NOTICE 'Created permissive RLS policy for accounts table';
    END IF;
    
    -- Update existing accounts to have default user_id if NULL
    UPDATE public.accounts SET user_id = 'default-user-id' WHERE user_id IS NULL;
    
    RETURN true;
END;
$$; 