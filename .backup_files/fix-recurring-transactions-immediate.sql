-- IMMEDIATE FIX FOR RECURRING TRANSACTIONS
-- This script fixes issues with recurring transactions not appearing in the table
-- To run this script:
-- 1. Log into your Supabase dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run"

-- Part 1: Check table structure and user_id column type
DO $$
DECLARE
  column_type TEXT;
  policy_exists BOOLEAN;
BEGIN
  RAISE NOTICE 'Starting comprehensive fix for recurring transactions...';
  
  -- Check if the table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurring_transactions') THEN
    RAISE NOTICE 'Table recurring_transactions does not exist!';
    
    -- Create the table if it doesn't exist
    CREATE TABLE public.recurring_transactions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      frequency VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      next_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      payment_method VARCHAR(255) NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      type VARCHAR(50) DEFAULT 'expense',
      description TEXT,
      start_date DATE,
      debt_id INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    RAISE NOTICE 'Created recurring_transactions table';
  ELSE
    RAISE NOTICE 'Table recurring_transactions exists';
    
    -- Check the user_id column type
    SELECT data_type INTO column_type
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'recurring_transactions' 
      AND column_name = 'user_id';
    
    RAISE NOTICE 'Current user_id column type: %', column_type;
    
    -- Fix column type if needed
    IF column_type = 'character varying' THEN
      RAISE NOTICE 'Converting user_id from VARCHAR to UUID...';
      ALTER TABLE public.recurring_transactions 
        ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
      RAISE NOTICE 'Conversion successful!';
    END IF;
    
    -- Check for missing columns
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'recurring_transactions'
                  AND column_name = 'debt_id') THEN
      ALTER TABLE public.recurring_transactions ADD COLUMN debt_id INTEGER;
      RAISE NOTICE 'Added missing debt_id column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'recurring_transactions'
                  AND column_name = 'type') THEN
      ALTER TABLE public.recurring_transactions ADD COLUMN type VARCHAR(50) DEFAULT 'expense';
      RAISE NOTICE 'Added missing type column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'recurring_transactions'
                  AND column_name = 'description') THEN
      ALTER TABLE public.recurring_transactions ADD COLUMN description TEXT;
      RAISE NOTICE 'Added missing description column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'recurring_transactions'
                  AND column_name = 'start_date') THEN
      ALTER TABLE public.recurring_transactions ADD COLUMN start_date DATE;
      RAISE NOTICE 'Added missing start_date column';
    END IF;
  END IF;
  
  -- Ensure created_at and updated_at columns exist
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'recurring_transactions'
                AND column_name = 'created_at') THEN
    ALTER TABLE public.recurring_transactions 
      ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    RAISE NOTICE 'Added missing created_at column';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'recurring_transactions'
                AND column_name = 'updated_at') THEN
    ALTER TABLE public.recurring_transactions 
      ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    RAISE NOTICE 'Added missing updated_at column';
  END IF;
  
  -- Create necessary indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'recurring_transactions' 
    AND indexname = 'idx_recurring_transactions_user_id'
  ) THEN
    CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
    RAISE NOTICE 'Created index on user_id column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'recurring_transactions' 
    AND indexname = 'idx_recurring_transactions_next_date'
  ) THEN
    CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);
    RAISE NOTICE 'Created index on next_date column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'recurring_transactions' 
    AND indexname = 'idx_recurring_transactions_status'
  ) THEN
    CREATE INDEX idx_recurring_transactions_status ON recurring_transactions(status);
    RAISE NOTICE 'Created index on status column';
  END IF;
END $$;

-- Part 2: Enable and fix Row Level Security
DO $$
BEGIN
  -- First, make sure RLS is enabled
  ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE 'Enabled Row Level Security on recurring_transactions table';
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
  DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON public.recurring_transactions;
  DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
  DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions;
  RAISE NOTICE 'Dropped existing policies';
  
  -- Create optimized policies using the (select auth.uid()) pattern
  CREATE POLICY "Users can view their own recurring transactions" 
  ON public.recurring_transactions
  FOR SELECT 
  TO authenticated
  USING ((select auth.uid()) = user_id);
  
  CREATE POLICY "Users can insert their own recurring transactions" 
  ON public.recurring_transactions
  FOR INSERT 
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
  
  CREATE POLICY "Users can update their own recurring transactions" 
  ON public.recurring_transactions
  FOR UPDATE 
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
  
  CREATE POLICY "Users can delete their own recurring transactions" 
  ON public.recurring_transactions
  FOR DELETE 
  TO authenticated
  USING ((select auth.uid()) = user_id);
  
  RAISE NOTICE 'Created RLS policies with optimized auth.uid() check';
END $$;

-- Part 3: Create auth.uid() check function for client diagnostics
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

-- Make the function accessible
GRANT EXECUTE ON FUNCTION public.check_auth_match TO authenticated;

-- Part 4: Diagnostic queries
-- Check current RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'recurring_transactions';

-- Check if RLS is enabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'recurring_transactions';

-- Sample data check (first 5 rows)
SELECT 
  id, 
  name, 
  amount,
  user_id, 
  pg_typeof(user_id)::text as user_id_type
FROM 
  public.recurring_transactions
LIMIT 5;

-- Transactions per user
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

-- Part 5: Fix any NULL user_id values (optional)
-- Uncomment this section if you want to delete transactions with NULL user_id
/*
DELETE FROM public.recurring_transactions
WHERE user_id IS NULL;
RAISE NOTICE 'Deleted transactions with NULL user_id';
*/

-- Part 6: Add a trigger to set updated_at on changes
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.recurring_transactions;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 