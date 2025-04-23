-- Migration: Add triggers for handling is_budget_expense flag
-- Description: This migration adds database triggers to ensure transactions with is_budget_expense=true
--              are properly synced to budget_transactions and then to budget_entries.

-- Function to sync budget_transactions when is_budget_expense changes
CREATE OR REPLACE FUNCTION sync_budget_transactions_from_is_budget_expense()
RETURNS TRIGGER AS $$
DECLARE
  bt_exists INTEGER;
BEGIN
  -- When is_budget_expense is set to true and budget_category_id exists
  IF NEW.is_budget_expense = true AND NEW.budget_category_id IS NOT NULL THEN
    -- Check if a budget_transaction already exists
    SELECT COUNT(*) INTO bt_exists
    FROM budget_transactions
    WHERE transaction_id = NEW.id
      AND user_id = NEW.user_id;
      
    IF bt_exists > 0 THEN
      -- Update existing budget_transaction
      UPDATE budget_transactions
      SET category_id = NEW.budget_category_id,
          amount = NEW.amount,
          date = NEW.date,
          description = NEW.name,
          updated_at = NOW()
      WHERE transaction_id = NEW.id
        AND user_id = NEW.user_id;
    ELSE
      -- Insert new budget_transaction
      INSERT INTO budget_transactions (
        transaction_id,
        user_id,
        category_id,
        amount,
        date,
        description,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.user_id,
        NEW.budget_category_id,
        NEW.amount,
        NEW.date,
        NEW.name,
        NOW(),
        NOW()
      );
    END IF;
  -- When is_budget_expense is set to false, remove from budget_transactions if it exists
  ELSIF NEW.is_budget_expense = false AND OLD.is_budget_expense = true THEN
    DELETE FROM budget_transactions
    WHERE transaction_id = NEW.id
      AND user_id = NEW.user_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger after UPDATE on transactions for is_budget_expense
DROP TRIGGER IF EXISTS after_transaction_is_budget_expense_update ON transactions;
CREATE TRIGGER after_transaction_is_budget_expense_update
AFTER UPDATE ON transactions
FOR EACH ROW
WHEN (
  NEW.is_budget_expense IS DISTINCT FROM OLD.is_budget_expense OR
  (NEW.is_budget_expense = true AND (
    NEW.budget_category_id IS DISTINCT FROM OLD.budget_category_id OR
    NEW.amount IS DISTINCT FROM OLD.amount OR
    NEW.date IS DISTINCT FROM OLD.date OR
    NEW.name IS DISTINCT FROM OLD.name
  ))
)
EXECUTE FUNCTION sync_budget_transactions_from_is_budget_expense();

-- Trigger after INSERT on transactions for is_budget_expense
DROP TRIGGER IF EXISTS after_transaction_is_budget_expense_insert ON transactions;
CREATE TRIGGER after_transaction_is_budget_expense_insert
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.is_budget_expense = true AND NEW.budget_category_id IS NOT NULL)
EXECUTE FUNCTION sync_budget_transactions_from_is_budget_expense();

-- Run an initial synchronization for existing transactions with is_budget_expense = true
DO $$
DECLARE
  transaction_record RECORD;
BEGIN
  -- Process all existing transactions with is_budget_expense = true and budget_category_id set
  FOR transaction_record IN 
    SELECT * FROM transactions 
    WHERE is_budget_expense = true AND budget_category_id IS NOT NULL
  LOOP
    -- This will trigger the after_transaction_update trigger
    UPDATE transactions 
    SET updated_at = NOW() 
    WHERE id = transaction_record.id;
  END LOOP;
END $$; 