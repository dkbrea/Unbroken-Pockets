-- Disable Row Level Security for recurring_transactions (to be consistent with other tables)
ALTER TABLE public.recurring_transactions DISABLE ROW LEVEL SECURITY;

-- Remove any existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions; 