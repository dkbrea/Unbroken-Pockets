-- Functions and triggers to automatically sync budget_entries with budget_transactions

-- Function to update budget_entries.spent based on budget_transactions
CREATE OR REPLACE FUNCTION update_budget_entry_from_transactions()
RETURNS TRIGGER AS $$
DECLARE
  transaction_month DATE;
  entry_exists INTEGER;
  total_amount DECIMAL(12, 2);
BEGIN
  -- Determine the month (first day of month) for the transaction
  transaction_month := DATE_TRUNC('month', COALESCE(NEW.date, OLD.date))::DATE;
  
  -- Calculate total amount for this category and month from budget_transactions
  SELECT COALESCE(SUM(amount), 0) INTO total_amount
  FROM budget_transactions
  WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    AND user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND DATE_TRUNC('month', date)::DATE = transaction_month;
  
  -- Check if a budget entry already exists for this month and category
  SELECT COUNT(*) INTO entry_exists
  FROM budget_entries
  WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    AND user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND month = transaction_month;
  
  IF entry_exists > 0 THEN
    -- Update existing entry
    UPDATE budget_entries
    SET spent = total_amount,
        updated_at = NOW()
    WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
      AND user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND month = transaction_month;
  ELSE
    -- Create new entry with default allocation
    INSERT INTO budget_entries (
      category_id,
      user_id,
      month,
      allocated,
      spent,
      created_at,
      updated_at
    ) VALUES (
      COALESCE(NEW.category_id, OLD.category_id),
      COALESCE(NEW.user_id, OLD.user_id),
      transaction_month,
      0, -- Default allocation
      total_amount,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger after INSERT on budget_transactions
CREATE OR REPLACE TRIGGER after_budget_transaction_insert
AFTER INSERT ON budget_transactions
FOR EACH ROW
EXECUTE FUNCTION update_budget_entry_from_transactions();

-- Trigger after UPDATE on budget_transactions
CREATE OR REPLACE TRIGGER after_budget_transaction_update
AFTER UPDATE ON budget_transactions
FOR EACH ROW
WHEN (
  OLD.category_id != NEW.category_id OR
  OLD.amount != NEW.amount OR
  OLD.date != NEW.date OR
  OLD.user_id != NEW.user_id
)
EXECUTE FUNCTION update_budget_entry_from_transactions();

-- Trigger after DELETE on budget_transactions
CREATE OR REPLACE TRIGGER after_budget_transaction_delete
AFTER DELETE ON budget_transactions
FOR EACH ROW
EXECUTE FUNCTION update_budget_entry_from_transactions();

-- Function to sync budget_transactions when transactions with budget_category_id change
CREATE OR REPLACE FUNCTION sync_budget_transactions_from_main_transactions()
RETURNS TRIGGER AS $$
DECLARE
  bt_exists INTEGER;
BEGIN
  -- Only proceed if the transaction has a budget_category_id
  IF TG_OP = 'DELETE' OR NEW.budget_category_id IS NULL THEN
    -- For DELETE operations or when budget_category_id is removed, delete from budget_transactions
    DELETE FROM budget_transactions
    WHERE transaction_id = OLD.id
      AND user_id = OLD.user_id;
  ELSE
    -- For INSERT or UPDATE with budget_category_id
    -- Check if a budget_transaction already exists for this transaction
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
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger after INSERT on transactions
CREATE OR REPLACE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.budget_category_id IS NOT NULL)
EXECUTE FUNCTION sync_budget_transactions_from_main_transactions();

-- Trigger after UPDATE on transactions
CREATE OR REPLACE TRIGGER after_transaction_update
AFTER UPDATE ON transactions
FOR EACH ROW
WHEN (
  NEW.budget_category_id IS DISTINCT FROM OLD.budget_category_id OR
  NEW.amount IS DISTINCT FROM OLD.amount OR
  NEW.date IS DISTINCT FROM OLD.date OR
  NEW.name IS DISTINCT FROM OLD.name
)
EXECUTE FUNCTION sync_budget_transactions_from_main_transactions();

-- Trigger after DELETE on transactions
CREATE OR REPLACE TRIGGER after_transaction_delete
AFTER DELETE ON transactions
FOR EACH ROW
WHEN (OLD.budget_category_id IS NOT NULL)
EXECUTE FUNCTION sync_budget_transactions_from_main_transactions(); 