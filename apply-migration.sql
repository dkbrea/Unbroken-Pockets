-- Migration: Fix variable expense transactions not updating budget on deletion
-- Description: This migration adds functionality to ensure that when variable expense 
--              transactions are deleted, the budget_entries.spent column is properly updated

-- Modify the sync_budget_transactions_from_is_budget_expense function to handle all expense types
CREATE OR REPLACE FUNCTION sync_budget_transactions_from_is_budget_expense()
RETURNS TRIGGER AS $$
DECLARE
  bt_exists INTEGER;
  transaction_month DATE;
  affected_category_id INTEGER;
  affected_user_id UUID;
  total_amount DECIMAL(12, 2);
  is_variable_expense BOOLEAN;
BEGIN
  -- For DELETE operations, we need to capture the category_id and month before the transaction is gone
  IF TG_OP = 'DELETE' THEN
    -- Check if this is a variable expense (regardless of is_budget_expense flag)
    is_variable_expense := OLD.transaction_type = 'Variable Expense';
    
    -- Store the relevant information from the transaction being deleted
    affected_category_id := OLD.budget_category_id;
    affected_user_id := OLD.user_id;
    transaction_month := DATE_TRUNC('month', OLD.date)::DATE;
    
    -- Proceed if this was either explicitly marked as a budget expense OR it's a variable expense with a category
    IF (OLD.is_budget_expense = true OR is_variable_expense) AND OLD.budget_category_id IS NOT NULL THEN
      -- Delete the corresponding budget_transaction
      DELETE FROM budget_transactions
      WHERE transaction_id = OLD.id
        AND user_id = OLD.user_id;
        
      -- Recalculate the total amount for this category and month
      SELECT COALESCE(SUM(amount), 0) INTO total_amount
      FROM budget_transactions
      WHERE category_id = affected_category_id
        AND user_id = affected_user_id
        AND DATE_TRUNC('month', date)::DATE = transaction_month;
      
      -- Update the budget entry with the new total
      UPDATE budget_entries
      SET spent = total_amount,
          updated_at = NOW()
      WHERE category_id = affected_category_id
        AND user_id = affected_user_id
        AND month = transaction_month;
    END IF;
    
    RETURN OLD;
  END IF;
  
  -- Check if this is a variable expense
  is_variable_expense := NEW.transaction_type = 'Variable Expense';
  
  -- When either is_budget_expense is true OR it's a variable expense, and budget_category_id exists
  IF (NEW.is_budget_expense = true OR is_variable_expense) AND NEW.budget_category_id IS NOT NULL THEN
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
    
    -- Calculate the total for this category and month
    transaction_month := DATE_TRUNC('month', NEW.date)::DATE;
    
    SELECT COALESCE(SUM(amount), 0) INTO total_amount
    FROM budget_transactions
    WHERE category_id = NEW.budget_category_id
      AND user_id = NEW.user_id
      AND DATE_TRUNC('month', date)::DATE = transaction_month;
    
    -- Check if a budget entry exists and update or create it
    UPDATE budget_entries
    SET spent = total_amount,
        updated_at = NOW()
    WHERE category_id = NEW.budget_category_id
      AND user_id = NEW.user_id
      AND month = transaction_month;
    
    -- If no rows were updated, create a new entry
    IF NOT FOUND THEN
      INSERT INTO budget_entries (
        category_id,
        user_id,
        month,
        allocated,
        spent,
        created_at,
        updated_at
      ) VALUES (
        NEW.budget_category_id,
        NEW.user_id,
        transaction_month,
        0, -- Default allocation
        total_amount,
        NOW(),
        NOW()
      );
    END IF;
    
  -- When is_budget_expense is set to false (or type changes from variable expense) and previously was tracked
  ELSIF (NEW.is_budget_expense = false OR NEW.transaction_type != 'Variable Expense') AND 
        (OLD.is_budget_expense = true OR OLD.transaction_type = 'Variable Expense') AND
        OLD.budget_category_id IS NOT NULL THEN
    -- Store information before deletion
    affected_category_id := OLD.budget_category_id;
    affected_user_id := OLD.user_id;
    transaction_month := DATE_TRUNC('month', OLD.date)::DATE;
    
    -- Delete from budget_transactions
    DELETE FROM budget_transactions
    WHERE transaction_id = NEW.id
      AND user_id = NEW.user_id;
      
    -- Recalculate the total amount for this category and month
    SELECT COALESCE(SUM(amount), 0) INTO total_amount
    FROM budget_transactions
    WHERE category_id = affected_category_id
      AND user_id = affected_user_id
      AND DATE_TRUNC('month', date)::DATE = transaction_month;
    
    -- Update the budget entry with the new total
    UPDATE budget_entries
    SET spent = total_amount,
        updated_at = NOW()
    WHERE category_id = affected_category_id
      AND user_id = affected_user_id
      AND month = transaction_month;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the delete trigger condition to also include variable expenses
DROP TRIGGER IF EXISTS after_transaction_is_budget_expense_delete ON transactions;
CREATE TRIGGER after_transaction_is_budget_expense_delete
AFTER DELETE ON transactions
FOR EACH ROW
WHEN (
  (OLD.is_budget_expense = true OR OLD.transaction_type = 'Variable Expense') 
  AND OLD.budget_category_id IS NOT NULL
)
EXECUTE FUNCTION sync_budget_transactions_from_is_budget_expense();

-- Update the update trigger condition
DROP TRIGGER IF EXISTS after_transaction_is_budget_expense_update ON transactions;
CREATE TRIGGER after_transaction_is_budget_expense_update
AFTER UPDATE ON transactions
FOR EACH ROW
WHEN (
  NEW.is_budget_expense IS DISTINCT FROM OLD.is_budget_expense OR
  NEW.transaction_type IS DISTINCT FROM OLD.transaction_type OR
  (
    (NEW.is_budget_expense = true OR NEW.transaction_type = 'Variable Expense') AND 
    (
      NEW.budget_category_id IS DISTINCT FROM OLD.budget_category_id OR
      NEW.amount IS DISTINCT FROM OLD.amount OR
      NEW.date IS DISTINCT FROM OLD.date OR
      NEW.name IS DISTINCT FROM OLD.name
    )
  )
)
EXECUTE FUNCTION sync_budget_transactions_from_is_budget_expense();

-- Update the insert trigger condition
DROP TRIGGER IF EXISTS after_transaction_is_budget_expense_insert ON transactions;
CREATE TRIGGER after_transaction_is_budget_expense_insert
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (
  (NEW.is_budget_expense = true OR NEW.transaction_type = 'Variable Expense') 
  AND NEW.budget_category_id IS NOT NULL
)
EXECUTE FUNCTION sync_budget_transactions_from_is_budget_expense();

-- Run an initial sync to make sure all variable expenses are properly tracked
DO $$
DECLARE
  transaction_record RECORD;
BEGIN
  -- Process all existing variable expense transactions with budget_category_id
  FOR transaction_record IN 
    SELECT * FROM transactions 
    WHERE transaction_type = 'Variable Expense' 
      AND budget_category_id IS NOT NULL
      AND (is_budget_expense IS NULL OR is_budget_expense = false)
  LOOP
    -- This will trigger the after_transaction_update trigger
    UPDATE transactions 
    SET updated_at = NOW() 
    WHERE id = transaction_record.id;
  END LOOP;
END $$; 