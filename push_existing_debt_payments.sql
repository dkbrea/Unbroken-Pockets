-- SYNC EXISTING DEBTS TO RECURRING TRANSACTIONS
-- This script creates recurring transactions for all existing debts
-- To run this script:
-- 1. Log into your Supabase dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run"

DO $$
DECLARE
  debt_record RECORD;
  next_payment_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  RAISE NOTICE 'Syncing existing debts to recurring transactions...';
  
  -- Check if both tables exist
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'debts') 
     AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurring_transactions') THEN
  
    -- Loop through each debt record
    FOR debt_record IN 
      SELECT * FROM debts
    LOOP
      -- Check if a recurring transaction already exists for this debt
      IF NOT EXISTS (
        SELECT 1 FROM recurring_transactions 
        WHERE debt_id = debt_record.id
      ) THEN
        -- Calculate the next payment date based on the due date
        -- Use make_date() function to create a date with the appropriate day of month
        IF debt_record.due_date IS NOT NULL THEN
          -- Get year and month parts from current date
          next_payment_date := make_date(
            EXTRACT(YEAR FROM today)::int,
            EXTRACT(MONTH FROM today)::int,
            debt_record.due_date::int
          );
        ELSE
          -- Default to the 1st of the month if due_date is NULL
          next_payment_date := make_date(
            EXTRACT(YEAR FROM today)::int,
            EXTRACT(MONTH FROM today)::int,
            1
          );
        END IF;
        
        -- If that date is in the past, move to next month
        IF next_payment_date < today THEN
          -- Move to the first day of next month
          next_payment_date := (date_trunc('month', next_payment_date) + interval '1 month')::date;
          
          -- Then set the correct day of month
          IF debt_record.due_date IS NOT NULL THEN
            next_payment_date := make_date(
              EXTRACT(YEAR FROM next_payment_date)::int,
              EXTRACT(MONTH FROM next_payment_date)::int,
              LEAST(debt_record.due_date::int, extract(day from (date_trunc('month', next_payment_date) + interval '1 month - 1 day')::date)::int)
            );
          END IF;
        END IF;
        
        -- Create a recurring transaction for this debt
        INSERT INTO recurring_transactions (
          name,
          amount,
          frequency,
          category,
          next_date,
          status,
          payment_method,
          user_id,
          debt_id,
          type,
          created_at,
          updated_at
        ) VALUES (
          'Payment for ' || debt_record.name,
          -ABS(debt_record.minimum_payment),
          'Monthly',
          'Debt Payment',
          next_payment_date,
          'active',
          'Default',
          debt_record.user_id,
          debt_record.id,
          'debt_payment',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created recurring transaction for debt: % with payment date: %', debt_record.name, next_payment_date;
      ELSE
        RAISE NOTICE 'Recurring transaction already exists for debt: %', debt_record.name;
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Sync completed successfully!';
  ELSE
    RAISE NOTICE 'Required tables do not exist - please make sure both debts and recurring_transactions tables are available';
  END IF;
END $$;

-- Count the results
SELECT COUNT(*) AS total_debts FROM debts;
SELECT COUNT(*) AS debt_recurring_transactions 
FROM recurring_transactions 
WHERE debt_id IS NOT NULL; 