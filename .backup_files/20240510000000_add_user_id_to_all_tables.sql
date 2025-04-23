-- Add user_id column and RLS policies to all tables in the database
-- This ensures each user can only see and modify their own data

-- 1. Add user_id to budget_categories table
ALTER TABLE budget_categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);

-- 2. Add user_id to budget_periods table
ALTER TABLE budget_periods ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_budget_periods_user_id ON budget_periods(user_id);

-- 3. Add user_id to cash_flow table
ALTER TABLE cash_flow ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cash_flow_user_id ON cash_flow(user_id);

-- 4. Add user_id to financial_goals table
ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);

-- 5. Add user_id to investment_portfolio table
ALTER TABLE investment_portfolio ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_investment_portfolio_user_id ON investment_portfolio(user_id);

-- 6. Add user_id to portfolio_performance table
ALTER TABLE portfolio_performance ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_user_id ON portfolio_performance(user_id);

-- 7. Add user_id to asset_allocation table
ALTER TABLE asset_allocation ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_asset_allocation_user_id ON asset_allocation(user_id);

-- 8. Add user_id to investment_accounts table
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_id ON investment_accounts(user_id);

-- 9. Add user_id to holdings table
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);

-- 10. Add user_id to report_types table
ALTER TABLE report_types ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_report_types_user_id ON report_types(user_id);

-- 11. Add user_id to spending_categories table
ALTER TABLE spending_categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_spending_categories_user_id ON spending_categories(user_id);

-- 12. Add user_id to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Update existing rows with a default user ID (can be updated later)
DO $$
DECLARE
  default_user_id UUID;
BEGIN
  -- Get first user from auth.users as default (if any exists)
  SELECT id INTO default_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we found a user
  IF default_user_id IS NOT NULL THEN
    -- Update all tables where user_id is NULL
    UPDATE budget_categories SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE budget_periods SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE cash_flow SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE financial_goals SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE investment_portfolio SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE portfolio_performance SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE asset_allocation SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE investment_accounts SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE holdings SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE report_types SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE spending_categories SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE transactions SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE accounts SET user_id = default_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Make user_id NOT NULL after populating existing data
ALTER TABLE budget_categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE budget_periods ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE cash_flow ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE financial_goals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE investment_portfolio ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE portfolio_performance ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE asset_allocation ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE investment_accounts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE holdings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE report_types ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE spending_categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL;

-- Enable Row Level Security on all tables
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- accounts table RLS should already be enabled

-- Create RLS policies for each table
-- These policies ensure users can only access their own data

-- 1. budget_categories policies
CREATE POLICY "Users can view their own budget categories" ON budget_categories FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own budget categories" ON budget_categories FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own budget categories" ON budget_categories FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own budget categories" ON budget_categories FOR DELETE USING ((auth.uid()) = user_id);

-- 2. budget_periods policies
CREATE POLICY "Users can view their own budget periods" ON budget_periods FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own budget periods" ON budget_periods FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own budget periods" ON budget_periods FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own budget periods" ON budget_periods FOR DELETE USING ((auth.uid()) = user_id);

-- 3. cash_flow policies
CREATE POLICY "Users can view their own cash flow" ON cash_flow FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own cash flow" ON cash_flow FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own cash flow" ON cash_flow FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own cash flow" ON cash_flow FOR DELETE USING ((auth.uid()) = user_id);

-- 4. financial_goals policies
CREATE POLICY "Users can view their own financial goals" ON financial_goals FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own financial goals" ON financial_goals FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own financial goals" ON financial_goals FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own financial goals" ON financial_goals FOR DELETE USING ((auth.uid()) = user_id);

-- 5. investment_portfolio policies
CREATE POLICY "Users can view their own investment portfolio" ON investment_portfolio FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own investment portfolio" ON investment_portfolio FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own investment portfolio" ON investment_portfolio FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own investment portfolio" ON investment_portfolio FOR DELETE USING ((auth.uid()) = user_id);

-- 6. portfolio_performance policies
CREATE POLICY "Users can view their own portfolio performance" ON portfolio_performance FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own portfolio performance" ON portfolio_performance FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own portfolio performance" ON portfolio_performance FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own portfolio performance" ON portfolio_performance FOR DELETE USING ((auth.uid()) = user_id);

-- 7. asset_allocation policies
CREATE POLICY "Users can view their own asset allocation" ON asset_allocation FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own asset allocation" ON asset_allocation FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own asset allocation" ON asset_allocation FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own asset allocation" ON asset_allocation FOR DELETE USING ((auth.uid()) = user_id);

-- 8. investment_accounts policies
CREATE POLICY "Users can view their own investment accounts" ON investment_accounts FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own investment accounts" ON investment_accounts FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own investment accounts" ON investment_accounts FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own investment accounts" ON investment_accounts FOR DELETE USING ((auth.uid()) = user_id);

-- 9. holdings policies
CREATE POLICY "Users can view their own holdings" ON holdings FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own holdings" ON holdings FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own holdings" ON holdings FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own holdings" ON holdings FOR DELETE USING ((auth.uid()) = user_id);

-- 10. report_types policies
CREATE POLICY "Users can view their own report types" ON report_types FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own report types" ON report_types FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own report types" ON report_types FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own report types" ON report_types FOR DELETE USING ((auth.uid()) = user_id);

-- 11. spending_categories policies
CREATE POLICY "Users can view their own spending categories" ON spending_categories FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own spending categories" ON spending_categories FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own spending categories" ON spending_categories FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own spending categories" ON spending_categories FOR DELETE USING ((auth.uid()) = user_id);

-- 12. transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING ((auth.uid()) = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE USING ((auth.uid()) = user_id) WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE USING ((auth.uid()) = user_id); 