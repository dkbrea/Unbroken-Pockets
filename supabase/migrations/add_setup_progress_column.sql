-- Add setup_progress column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS setup_progress JSONB DEFAULT '{
  "accountsSetup": false,
  "recurringExpensesSetup": false,
  "recurringIncomeSetup": false,
  "subscriptionsSetup": false,
  "debtSetup": false,
  "goalsSetup": false
}'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN public.user_preferences.setup_progress IS 'Tracks user progress through various setup steps';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_setup_progress ON public.user_preferences USING gin(setup_progress);

-- Update all existing records to have a default setup_progress value
UPDATE public.user_preferences
SET setup_progress = '{
  "accountsSetup": false,
  "recurringExpensesSetup": false,
  "recurringIncomeSetup": false,
  "subscriptionsSetup": false,
  "debtSetup": false,
  "goalsSetup": false
}'::jsonb
WHERE setup_progress IS NULL; 