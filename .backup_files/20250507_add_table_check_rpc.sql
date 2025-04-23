-- Function to safely check if the accounts table exists without using information_schema
CREATE OR REPLACE FUNCTION public.check_if_accounts_table_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Check if the table exists using pg_tables
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'accounts'
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$; 