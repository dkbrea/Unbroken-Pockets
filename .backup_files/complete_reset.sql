-- PART 1: Drop all tables in the proper order to avoid foreign key constraint issues
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

-- PART 2: Recreate tables from migrations

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  allocated DECIMAL(12, 2) NOT NULL,
  spent DECIMAL(12, 2) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create budget_periods table
CREATE TABLE IF NOT EXISTS budget_periods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cash_flow table
CREATE TABLE IF NOT EXISTS cash_flow (
  id SERIAL PRIMARY KEY,
  month VARCHAR(50) NOT NULL,
  income DECIMAL(12, 2) NOT NULL,
  expenses DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  current_amount DECIMAL(12, 2) NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  target_date DATE NOT NULL,
  contribution_frequency VARCHAR(50) NOT NULL,
  contribution_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create investment_portfolio table
CREATE TABLE IF NOT EXISTS investment_portfolio (
  id SERIAL PRIMARY KEY,
  total_value DECIMAL(12, 2) NOT NULL,
  change_amount DECIMAL(12, 2) NOT NULL,
  change_percentage DECIMAL(6, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create portfolio_performance table
CREATE TABLE IF NOT EXISTS portfolio_performance (
  id SERIAL PRIMARY KEY,
  time_range VARCHAR(10) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  percentage DECIMAL(6, 2) NOT NULL,
  portfolio_id INTEGER REFERENCES investment_portfolio(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create asset_allocation table
CREATE TABLE IF NOT EXISTS asset_allocation (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  percentage INTEGER NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create investment_accounts table
CREATE TABLE IF NOT EXISTS investment_accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL,
  change_amount DECIMAL(12, 2) NOT NULL,
  change_percentage DECIMAL(6, 2) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  last_updated DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  shares DECIMAL(12, 2) NOT NULL,
  price_per_share DECIMAL(12, 2) NOT NULL,
  change_amount DECIMAL(12, 2) NOT NULL,
  change_percentage DECIMAL(6, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create report_types table
CREATE TABLE IF NOT EXISTS report_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spending_categories table
CREATE TABLE IF NOT EXISTS spending_categories (
  id SERIAL PRIMARY KEY,
  report_type_id VARCHAR(50) REFERENCES report_types(id),
  category VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  last_updated DATE NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  color VARCHAR(50),
  account_number VARCHAR(4),
  notes TEXT,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  account VARCHAR(255) NOT NULL,
  logo VARCHAR(255),
  is_reconciled BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags VARCHAR(255)[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_email_verified BOOLEAN DEFAULT FALSE
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(3) DEFAULT 'USD',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  theme VARCHAR(20) DEFAULT 'light',
  hide_balances BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  browser_notifications BOOLEAN DEFAULT FALSE,
  mobile_notifications BOOLEAN DEFAULT FALSE,
  dashboard_widgets VARCHAR(255)[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(20) NOT NULL,
  source VARCHAR(20) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  action_label VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  next_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  payment_method VARCHAR(255) NOT NULL,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_status ON recurring_transactions(status);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- PART 3: Add Row Level Security Policies

-- Enable Row Level Security for recurring_transactions
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

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

-- Create policies for accounts
CREATE POLICY "Users can view their own accounts" 
ON public.accounts
FOR SELECT 
TO authenticated
USING ((auth.uid()) = user_id);

CREATE POLICY "Users can insert their own accounts" 
ON public.accounts
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.accounts
FOR UPDATE 
TO authenticated
USING ((auth.uid()) = user_id)
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.accounts
FOR DELETE 
TO authenticated
USING ((auth.uid()) = user_id);

-- PART 4: Seed data

-- Insert mock user
INSERT INTO users (id, email, first_name, last_name, avatar, is_email_verified) 
VALUES ('usr_123456', 'user@example.com', 'John', 'Doe', 'https://i.pravatar.cc/150?img=68', true);

-- Insert budget periods
INSERT INTO budget_periods (name, is_active) VALUES 
  ('May 2023', TRUE);

-- Insert budget categories
INSERT INTO budget_categories (name, allocated, spent, icon, color) VALUES
  ('Housing', 1800, 1650, 'Home', 'text-blue-600 bg-blue-100'),
  ('Groceries', 600, 420, 'ShoppingCart', 'text-green-600 bg-green-100'),
  ('Transportation', 400, 380, 'Car', 'text-purple-600 bg-purple-100'),
  ('Dining Out', 350, 410, 'Utensils', 'text-red-600 bg-red-100'),
  ('Entertainment', 250, 180, 'Coffee', 'text-yellow-600 bg-yellow-100'),
  ('Personal', 200, 170, 'Briefcase', 'text-indigo-600 bg-indigo-100');

-- Insert cash flow data
INSERT INTO cash_flow (month, income, expenses) VALUES
  ('Jan', 5200, 4320),
  ('Feb', 5350, 4150),
  ('Mar', 5100, 4600),
  ('Apr', 5500, 4200),
  ('May', 5450, 4100),
  ('Jun', 5300, 4400);

-- Insert financial goals
INSERT INTO financial_goals (name, icon, color, current_amount, target_amount, target_date, contribution_frequency, contribution_amount) VALUES
  ('Emergency Fund', 'CircleDollarSign', 'bg-blue-100 text-blue-600', 8500, 10000, '2023-08-01', 'Monthly', 500),
  ('New Car', 'Car', 'bg-green-100 text-green-600', 12000, 30000, '2024-06-01', 'Monthly', 1000),
  ('Down Payment', 'Home', 'bg-purple-100 text-purple-600', 35000, 100000, '2025-01-01', 'Monthly', 1500),
  ('Vacation', 'Plane', 'bg-yellow-100 text-yellow-600', 2200, 5000, '2023-11-01', 'Monthly', 400),
  ('Education', 'GraduationCap', 'bg-red-100 text-red-600', 15000, 50000, '2026-01-01', 'Monthly', 800),
  ('Retirement', 'Briefcase', 'bg-indigo-100 text-indigo-600', 120000, 1000000, '2050-01-01', 'Monthly', 2000);

-- Insert investment portfolio
INSERT INTO investment_portfolio (total_value, change_amount, change_percentage) VALUES
  (325750.82, 2145.32, 0.66);

-- Insert portfolio performance
WITH portfolio AS (SELECT id FROM investment_portfolio LIMIT 1)
INSERT INTO portfolio_performance (time_range, amount, percentage, portfolio_id) VALUES
  ('1D', 215.43, 0.07, (SELECT id FROM portfolio)),
  ('1W', 890.21, 0.28, (SELECT id FROM portfolio)),
  ('1M', 1530.45, 0.47, (SELECT id FROM portfolio)),
  ('1Y', 42350.87, 14.94, (SELECT id FROM portfolio)),
  ('All', 125750.82, 62.88, (SELECT id FROM portfolio));

-- Insert asset allocation
INSERT INTO asset_allocation (name, value, percentage, color) VALUES
  ('US Stocks', 182420.46, 56, 'bg-blue-500'),
  ('International Stocks', 52120.13, 16, 'bg-green-500'),
  ('Bonds', 48862.62, 15, 'bg-purple-500'),
  ('Real Estate', 26060.07, 8, 'bg-yellow-500'),
  ('Alternative', 16287.54, 5, 'bg-red-500');

-- Insert investment accounts
INSERT INTO investment_accounts (name, institution, balance, change_amount, change_percentage, account_type, last_updated) VALUES
  ('401(k)', 'Fidelity', 185345.67, 1250.45, 0.68, 'Retirement', '2023-04-28'),
  ('Roth IRA', 'Vanguard', 87652.34, 530.82, 0.61, 'Retirement', '2023-04-28'),
  ('Brokerage Account', 'Charles Schwab', 42450.89, 215.56, 0.51, 'Taxable', '2023-04-28'),
  ('Crypto Wallet', 'Coinbase', 10301.92, 148.49, 1.46, 'Alternative', '2023-04-28');

-- Insert holdings
INSERT INTO holdings (symbol, name, value, shares, price_per_share, change_amount, change_percentage) VALUES
  ('VTI', 'Vanguard Total Stock Market ETF', 45320.45, 215.43, 210.37, 350.34, 0.78),
  ('VXUS', 'Vanguard Total International Stock ETF', 25670.23, 432.12, 59.41, 120.56, 0.47),
  ('BND', 'Vanguard Total Bond Market ETF', 32450.67, 380.58, 85.27, -45.67, -0.14),
  ('VNQ', 'Vanguard Real Estate ETF', 18540.32, 178.25, 104.01, 78.93, 0.43),
  ('AAPL', 'Apple Inc.', 15320.78, 85.67, 178.85, 250.34, 1.66);

-- Insert report types
INSERT INTO report_types (id, name, icon, color) VALUES
  ('spending', 'Spending by Category', 'PieChart', 'bg-blue-100 text-blue-600'),
  ('income', 'Income Analysis', 'BarChart2', 'bg-green-100 text-green-600'),
  ('trends', 'Spending Trends', 'LineChart', 'bg-purple-100 text-purple-600'),
  ('tax', 'Tax Report', 'BarChart', 'bg-yellow-100 text-yellow-600');

-- Insert spending categories
INSERT INTO spending_categories (report_type_id, category, amount, color) VALUES
  ('spending', 'Housing', 1850, 'bg-blue-500'),
  ('spending', 'Food', 850, 'bg-green-500'),
  ('spending', 'Transportation', 450, 'bg-purple-500'),
  ('spending', 'Entertainment', 350, 'bg-yellow-500'),
  ('spending', 'Utilities', 320, 'bg-red-500'),
  ('spending', 'Other', 580, 'bg-gray-500');

-- Insert recurring transactions
INSERT INTO recurring_transactions (name, amount, frequency, category, next_date, status, payment_method, user_id) VALUES
  ('Rent Payment', -1800, 'Monthly', 'Housing', '2023-04-30', 'active', 'Chase Checking', 'usr_123456'),
  ('Netflix Subscription', -15.99, 'Monthly', 'Entertainment', '2023-05-04', 'active', 'Amex Gold Card', 'usr_123456'),
  ('Gym Membership', -45, 'Monthly', 'Health & Fitness', '2023-05-09', 'active', 'Chase Checking', 'usr_123456'),
  ('Salary', 4200, 'Bi-weekly', 'Income', '2023-05-14', 'active', 'Direct Deposit', 'usr_123456'),
  ('Car Insurance', -95, 'Monthly', 'Insurance', '2023-05-21', 'active', 'Amex Gold Card', 'usr_123456'),
  ('Internet Bill', -79.99, 'Monthly', 'Utilities', '2023-05-24', 'active', 'Chase Checking', 'usr_123456'),
  ('Music Subscription', -9.99, 'Monthly', 'Entertainment', '2023-05-15', 'paused', 'Amex Gold Card', 'usr_123456'); 