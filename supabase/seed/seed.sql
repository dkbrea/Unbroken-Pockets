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