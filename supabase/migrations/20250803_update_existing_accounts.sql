-- Update existing accounts with the default user ID
-- Replace 'usr_123456' with your default user ID if different
UPDATE accounts SET user_id = 'usr_123456' WHERE user_id IS NULL;

-- Make user_id required for future inserts
ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL; 