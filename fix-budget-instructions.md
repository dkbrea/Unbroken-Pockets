# How to Fix Variable Expense Budget Recalculation

This guide provides instructions for fixing the issue where deleting variable expense transactions doesn't recalculate the budget spent amount.

## Option 1: Apply through Supabase Dashboard SQL Editor

1. Login to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the entire SQL content from `migration-to-apply.sql` into the editor
5. Run the SQL to apply the fix
6. After successful execution, run this SQL to mark the migration as applied:

```sql
-- Add migration to history
INSERT INTO schema_migrations 
(version, name, status, applied_at)
VALUES
('20250831', '20250831_fix_variable_expense_delete_sync.sql', 'applied', NOW());
```

## Option 2: Try Supabase CLI with New Migration

If you have the Supabase CLI working properly:

1. Make sure the file `supabase/migrations/20250831_fix_variable_expense_delete_sync.sql` exists
2. Try running one of these commands:

```bash
# Option A: Try to apply just the new migration
npx supabase db reset --db-only

# Option B: Try to apply all migrations in sequence (caution - may overwrite other changes)
npx supabase db reset
```

## What This Fix Does

This migration fixes the issue where deleting variable expense transactions doesn't recalculate the spent amount in budget entries. The key changes are:

1. The trigger function now checks if a transaction is either a budget expense OR a variable expense.
2. For DELETE operations, it properly recalculates the budget totals for both types of transactions.
3. The DELETE trigger now activates for both budget expenses and variable expenses.
4. The code also includes a one-time sync to ensure all existing variable expenses are properly tracked.

After applying this migration, deleting variable expense transactions will correctly update the budget entries' spent amount. 