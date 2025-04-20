-- Script to make payment_method column optional in recurring_transactions table
-- To run this script:
-- 1. Log into your Supabase dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run"

-- First, check if the recurring_transactions table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurring_transactions') THEN
    -- Alter the payment_method column to remove the NOT NULL constraint
    ALTER TABLE public.recurring_transactions ALTER COLUMN payment_method DROP NOT NULL;
    RAISE NOTICE 'Made payment_method column optional in recurring_transactions table';
  ELSE
    RAISE NOTICE 'recurring_transactions table does not exist';
  END IF;
END $$;

-- Print confirmation
SELECT 'payment_method column constraint modification complete' as result; 