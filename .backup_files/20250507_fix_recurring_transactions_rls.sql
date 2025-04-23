-- Enable Row Level Security for recurring_transactions
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent conflicts)
DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions;

-- Create policies for recurring_transactions
CREATE POLICY "Users can view their own recurring transactions" 
ON public.recurring_transactions
FOR SELECT 
TO authenticated
USING ((auth.uid()) = user_id);

CREATE POLICY "Users can insert their own recurring transactions" 
ON public.recurring_transactions
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
ON public.recurring_transactions
FOR UPDATE 
TO authenticated
USING ((auth.uid()) = user_id)
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
ON public.recurring_transactions
FOR DELETE 
TO authenticated
USING ((auth.uid()) = user_id);

-- Fix user_id column data type if needed
DO $$
BEGIN
  -- Check if column exists and is the wrong type
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'recurring_transactions' 
    AND column_name = 'user_id' 
    AND data_type = 'character varying'
  ) THEN
    -- Attempt to alter the column to UUID type
    ALTER TABLE public.recurring_transactions 
    ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
  END IF;
END $$; 