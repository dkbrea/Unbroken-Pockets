-- MAKE PAYMENT_METHOD COLUMN OPTIONAL
-- This script makes the payment_method column optional in the recurring_transactions table
-- To run this script:
-- 1. Log into your Supabase dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run"

DO $$
BEGIN
  RAISE NOTICE 'Making payment_method column optional in recurring_transactions table...';
  
  -- Check if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurring_transactions') THEN
    -- Check if payment_method column has NOT NULL constraint
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'recurring_transactions'
        AND column_name = 'payment_method'
        AND is_nullable = 'NO'
    ) THEN
      -- Alter the column to make it nullable
      ALTER TABLE public.recurring_transactions ALTER COLUMN payment_method DROP NOT NULL;
      RAISE NOTICE 'Successfully made payment_method column optional';
    ELSE
      RAISE NOTICE 'payment_method column is already optional';
    END IF;
  ELSE
    RAISE NOTICE 'Table recurring_transactions does not exist!';
  END IF;
END $$; 