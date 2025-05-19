-- Drop the table if it exists
DROP TABLE IF EXISTS public.debt_payments_forecast CASCADE;

-- Create the table
CREATE TABLE public.debt_payments_forecast (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(debt_id, month, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_debt_payments_forecast_debt_id ON public.debt_payments_forecast(debt_id);
CREATE INDEX idx_debt_payments_forecast_user_id ON public.debt_payments_forecast(user_id);
CREATE INDEX idx_debt_payments_forecast_month ON public.debt_payments_forecast(month);

-- Enable RLS
ALTER TABLE public.debt_payments_forecast ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY select_own_debt_payments ON public.debt_payments_forecast 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own_debt_payments ON public.debt_payments_forecast 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own_debt_payments ON public.debt_payments_forecast 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own_debt_payments ON public.debt_payments_forecast 
  FOR DELETE USING (auth.uid() = user_id);

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE public.debt_payments_forecast TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.debt_payments_forecast_id_seq TO postgres, anon, authenticated, service_role;
