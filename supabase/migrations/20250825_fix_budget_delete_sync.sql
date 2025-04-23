-- Migration: Fix budget sync for deleted transactions
-- Description: This migration addresses an issue where deleting a transaction 
--              with is_budget_expense=true does not update the budget_entries.spent column

-- Update the sync_budget_transactions_from_is_budget_expense function to handle deletions properly
CREATE OR REPLACE FUNCTION sync_budget_transactions_from_is_budget_expense()
RETURNS TRIGGER AS $$
DECLARE
  bt_exists INTEGER;
  transaction_month DATE;
  affected_category_id INTEGER;
  affected_user_id UUID;
  total_amount DECIMAL(12, 2);
BEGIN
  -- For DELETE operations, we need to capture the category_id and month before the transaction is gone
  IF TG_OP = 'DELETE' THEN
    -- Store the relevant information from the transaction being deleted
    affected_category_id := OLD.budget_category_id;
    affected_user_id := OLD.user_id;
    transaction_month := DATE_TRUNC('month', OLD.date)::DATE;
    
    -- Only proceed if this was a budget expense
    IF OLD.is_budget_expense = true AND OLD.budget_category_id IS NOT NULL THEN
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
    
  -- When is_budget_expense is set to false, remove from budget_transactions if it exists
  ELSIF NEW.is_budget_expense = false AND OLD.is_budget_expense = true THEN
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

-- Add the delete trigger
DROP TRIGGER IF EXISTS after_transaction_is_budget_expense_delete ON transactions;
CREATE TRIGGER after_transaction_is_budget_expense_delete
AFTER DELETE ON transactions
FOR EACH ROW
WHEN (OLD.is_budget_expense = true AND OLD.budget_category_id IS NOT NULL)
EXECUTE FUNCTION sync_budget_transactions_from_is_budget_expense();

-- Ensure the existing triggers reference the updated function
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

DROP TRIGGER IF EXISTS after_transaction_is_budget_expense_insert ON transactions;
CREATE TRIGGER after_transaction_is_budget_expense_insert
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.is_budget_expense = true AND NEW.budget_category_id IS NOT NULL)
EXECUTE FUNCTION sync_budget_transactions_from_is_budget_expense(); 