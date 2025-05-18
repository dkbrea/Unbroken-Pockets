-- Create debt payments forecast table
CREATE TABLE IF NOT EXISTS debt_payments_forecast (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  debt_id BIGINT REFERENCES debts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings forecast table
CREATE TABLE IF NOT EXISTS savings_forecast (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goal monthly contributions table
CREATE TABLE IF NOT EXISTS goal_monthly_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL,
  month DATE NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_user_id ON debt_payments_forecast(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_forecast_month ON debt_payments_forecast(month);
CREATE INDEX IF NOT EXISTS idx_savings_forecast_user_id ON savings_forecast(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_forecast_month ON savings_forecast(month);
CREATE INDEX IF NOT EXISTS idx_goal_monthly_contributions_user_id ON goal_monthly_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_monthly_contributions_month ON goal_monthly_contributions(month);

-- Set up Row Level Security (RLS)
ALTER TABLE debt_payments_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_monthly_contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for debt_payments_forecast
CREATE POLICY "Users can view their own debt payments forecast" 
  ON debt_payments_forecast FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt payments forecast" 
  ON debt_payments_forecast FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt payments forecast" 
  ON debt_payments_forecast FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt payments forecast" 
  ON debt_payments_forecast FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for savings_forecast
CREATE POLICY "Users can view their own savings forecast" 
  ON savings_forecast FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings forecast" 
  ON savings_forecast FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings forecast" 
  ON savings_forecast FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings forecast" 
  ON savings_forecast FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for goal_monthly_contributions
CREATE POLICY "Users can view their own goal monthly contributions" 
  ON goal_monthly_contributions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal monthly contributions" 
  ON goal_monthly_contributions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal monthly contributions" 
  ON goal_monthly_contributions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal monthly contributions" 
  ON goal_monthly_contributions FOR DELETE 
  USING (auth.uid() = user_id);
