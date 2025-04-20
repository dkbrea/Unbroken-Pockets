-- Drop all tables in the proper order to avoid foreign key constraint issues
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS spending_categories CASCADE;
DROP TABLE IF EXISTS report_types CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS investment_accounts CASCADE;
DROP TABLE IF EXISTS asset_allocation CASCADE;
DROP TABLE IF EXISTS portfolio_performance CASCADE;
DROP TABLE IF EXISTS investment_portfolio CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS cash_flow CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS budget_periods CASCADE;

-- Reset all sequences
ALTER SEQUENCE IF EXISTS budget_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS budget_periods_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cash_flow_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS financial_goals_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS investment_portfolio_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS portfolio_performance_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS asset_allocation_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS investment_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS holdings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS report_types_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS spending_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_preferences_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS recurring_transactions_id_seq RESTART WITH 1; 