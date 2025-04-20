-- Function to create the accounts table
CREATE OR REPLACE FUNCTION public.create_accounts_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the accounts table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(12,2) NOT NULL,
    institution VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255),
    account_number VARCHAR(255),
    is_hidden BOOLEAN DEFAULT false,
    icon VARCHAR(255),
    color VARCHAR(255),
    notes TEXT,
    last_updated DATE
  );
  
  RETURN true;
END;
$$; 