-- This SQL script fixes permissions for recurring_transactions
-- To run this script:
-- 1. Log into your Supabase dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run"

-- First, check if the recurring_transactions table exists, and create it if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurring_transactions') THEN
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
    CREATE INDEX idx_recurring_transactions_status ON recurring_transactions(status);
    CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);
    
    RAISE NOTICE 'Created recurring_transactions table';
  ELSE
    RAISE NOTICE 'recurring_transactions table already exists';
  END IF;
END $$;

-- Ensure RLS is enabled for the recurring_transactions table
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Then drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions;

-- Create proper RLS policies
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

-- Check the user_id column type
DO $$
DECLARE
  column_type TEXT;
BEGIN
  SELECT data_type INTO column_type
  FROM information_schema.columns 
  WHERE table_name = 'recurring_transactions' 
  AND column_name = 'user_id';
  
  RAISE NOTICE 'Current user_id column type: %', column_type;
  
  -- If the column is VARCHAR but should be UUID, fix it
  IF column_type = 'character varying' THEN
    RAISE NOTICE 'Converting user_id from VARCHAR to UUID';
    ALTER TABLE public.recurring_transactions 
    ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
  END IF;
END $$;

-- Print the current RLS status
DO $$
BEGIN
  RAISE NOTICE 'Current RLS policies for recurring_transactions:';
END $$;

-- Verify the current state of RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'recurring_transactions' 
ORDER BY policyname; 