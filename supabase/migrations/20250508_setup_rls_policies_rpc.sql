-- Function to set up RLS policies for the accounts table
CREATE OR REPLACE FUNCTION public.setup_accounts_rls_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Enable RLS on the accounts table
  ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
  DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
  DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
  DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
  DROP POLICY IF EXISTS "Development mode access for anon users" ON public.accounts;
  DROP POLICY IF EXISTS "Allow all operations for any user" ON public.accounts;
  
  -- Create RLS policies for user-specific data access
  -- Allow users to view their own accounts
  CREATE POLICY "Users can view their own accounts" ON public.accounts
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);
    
  -- Allow users to insert their own accounts
  CREATE POLICY "Users can insert their own accounts" ON public.accounts
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);
    
  -- Allow users to update their own accounts
  CREATE POLICY "Users can update their own accounts" ON public.accounts
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
    
  -- Allow users to delete their own accounts
  CREATE POLICY "Users can delete their own accounts" ON public.accounts
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);
    
  -- For development environment only, allow anonymous access (useful for testing)
  CREATE POLICY "Development anonymous read access" ON public.accounts
    FOR SELECT
    TO anon
    USING (true);
    
  -- For development, allow anon to create accounts
  CREATE POLICY "Development anonymous write access" ON public.accounts
    FOR INSERT
    TO anon
    WITH CHECK (true);
  
  RETURN true;
END;
$$; 