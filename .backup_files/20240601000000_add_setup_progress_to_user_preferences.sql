-- Add setup_progress JSONB column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS setup_progress JSONB DEFAULT '{
  "accountsSetup": false,
  "recurringExpensesSetup": false,
  "recurringIncomeSetup": false,
  "subscriptionsSetup": false,
  "debtSetup": false,
  "goalsSetup": false
}';

-- Update database.types.ts structure
COMMENT ON COLUMN user_preferences.setup_progress IS 'Tracks onboarding progress for the user'; 