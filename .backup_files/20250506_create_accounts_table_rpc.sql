-- Function to create the accounts table if it doesn't exist
CREATE OR REPLACE FUNCTION create_accounts_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Check if the table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'accounts'
  ) INTO table_exists;
  
  -- If the table doesn't exist, create it
  IF NOT table_exists THEN
    EXECUTE '
      CREATE TABLE public.accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        balance DECIMAL(12,2) NOT NULL,
        institution VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id VARCHAR(255)
      );
      
      -- Enable RLS for the accounts table
      ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
      
      -- Create a policy that allows all operations for any user
      CREATE POLICY "Allow all operations for any user" ON public.accounts
      USING (true)
      WITH CHECK (true);
    ';
    
    RAISE NOTICE 'Accounts table created successfully';
    RETURN true;
  ELSE
    RAISE NOTICE 'Accounts table already exists';
    RETURN false;
  END IF;
END;
$$; 