-- Enable RLS on the user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for select operations
CREATE POLICY "Users can select their own preferences" 
ON public.user_preferences
FOR SELECT
TO authenticated
USING ((user_id = (SELECT auth.uid())));

-- Create policy for insert operations
CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK ((user_id = (SELECT auth.uid())));

-- Create policy for update operations
CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences
FOR UPDATE
TO authenticated
USING ((user_id = (SELECT auth.uid())))
WITH CHECK ((user_id = (SELECT auth.uid())));

-- Create policy for delete operations
CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences
FOR DELETE
TO authenticated
USING ((user_id = (SELECT auth.uid())));

-- Create default preferences record for new users
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (
        user_id, 
        currency, 
        date_format, 
        theme, 
        hide_balances, 
        email_notifications, 
        browser_notifications, 
        mobile_notifications, 
        dashboard_widgets,
        setup_progress
    ) VALUES (
        NEW.id, 
        'USD', 
        'MM/DD/YYYY', 
        'light', 
        false, 
        true, 
        false, 
        false, 
        ARRAY['cashflow', 'budget', 'goals', 'recentTransactions', 'accounts'],
        '{
            "accountsSetup": false,
            "recurringExpensesSetup": false,
            "recurringIncomeSetup": false,
            "subscriptionsSetup": false,
            "debtSetup": false,
            "goalsSetup": false
        }'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create default preferences on user creation
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION create_default_user_preferences(); 