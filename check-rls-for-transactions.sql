-- This SQL script checks and fixes RLS policies for recurring_transactions table
-- To run this script:
-- 1. Log into your Supabase dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run"

-- Check table existence and structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurring_transactions') THEN
    RAISE NOTICE 'Table recurring_transactions does not exist!';
  ELSE
    RAISE NOTICE 'Table recurring_transactions exists';
    
    -- Check the data type of the user_id column
    DECLARE
      column_type TEXT;
    BEGIN
      SELECT data_type INTO column_type
      FROM information_schema.columns 
      WHERE table_schema = 'public'
        AND table_name = 'recurring_transactions' 
        AND column_name = 'user_id';
      
      RAISE NOTICE 'user_id column type: %', column_type;
      
      -- If the column is the wrong type, convert it
      IF column_type = 'character varying' THEN
        RAISE NOTICE 'Converting user_id from VARCHAR to UUID...';
        BEGIN
          ALTER TABLE public.recurring_transactions 
            ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
          RAISE NOTICE 'Conversion successful!';
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Error converting user_id: %', SQLERRM;
        END;
      END IF;
    END;
  END IF;
END $$;

-- Check if RLS is enabled for the table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'recurring_transactions';

-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'recurring_transactions';

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions;

-- First, make sure RLS is enabled
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Then create proper RLS policies
CREATE POLICY "Users can view their own recurring transactions" 
ON public.recurring_transactions
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions" 
ON public.recurring_transactions
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
ON public.recurring_transactions
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
ON public.recurring_transactions
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Check policies again after recreation
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'recurring_transactions';

-- Test if auth.uid() matches the expected format
CREATE OR REPLACE FUNCTION public.check_auth_match(input_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY definer
AS $$
  SELECT jsonb_build_object(
    'auth_uid', auth.uid(),
    'input_id', input_id,
    'match', auth.uid() = input_id,
    'auth_uid_type', pg_typeof(auth.uid())::text,
    'input_id_type', pg_typeof(input_id)::text
  );
$$;

-- Add a row level security policy for the function
DROP POLICY IF EXISTS "Users can execute check_auth_match" ON public.check_auth_match;
CREATE POLICY "Users can execute check_auth_match"
ON public.check_auth_match
FOR ALL
TO authenticated
USING (true);

-- Sample query to find data with inconsistent user_id format
SELECT 
  id, 
  name, 
  user_id, 
  pg_typeof(user_id)::text as user_id_type,
  created_at
FROM 
  public.recurring_transactions
LIMIT 5;

-- Count transactions by user_id
SELECT 
  user_id,
  pg_typeof(user_id)::text as user_id_type,
  COUNT(*) as transaction_count
FROM 
  public.recurring_transactions
GROUP BY 
  user_id, pg_typeof(user_id)::text
ORDER BY 
  transaction_count DESC;

-- Add a new index on user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'recurring_transactions' 
    AND indexname = 'idx_recurring_transactions_user_id'
  ) THEN
    CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
    RAISE NOTICE 'Created index on user_id column';
  ELSE
    RAISE NOTICE 'Index on user_id already exists';
  END IF;
END $$; 