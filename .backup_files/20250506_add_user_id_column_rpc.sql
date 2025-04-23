-- Function to add user_id column to the accounts table if it doesn't exist
CREATE OR REPLACE FUNCTION add_user_id_column()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists boolean;
BEGIN
  -- Check if the column exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'accounts'
    AND column_name = 'user_id'
  ) INTO column_exists;
  
  -- If the column doesn't exist, add it
  IF NOT column_exists THEN
    EXECUTE 'ALTER TABLE public.accounts ADD COLUMN user_id VARCHAR(255)';
    RAISE NOTICE 'user_id column added successfully';
    RETURN true;
  ELSE
    RAISE NOTICE 'user_id column already exists';
    RETURN false;
  END IF;
END;
$$; 