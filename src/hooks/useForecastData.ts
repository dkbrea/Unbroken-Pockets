import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ForecastData {
  debtPaymentsByMonth: Array<{
    id: string;
    amount: number;
  }[]>;
  savingsByMonth: Array<{
    id: string;
    amount: number;
  }[]>;
}

export function useForecastData(startDate?: Date, endDate?: Date) {
  const [forecastData, setForecastData] = useState<ForecastData>({
    debtPaymentsByMonth: [],
    savingsByMonth: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError(new Error('No authenticated user'));
          return;
        }

        // Fetch debt payments forecast
        const { data: debtPayments, error: debtError } = await supabase
          .from('debt_payments_forecast')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: true });

        if (debtError) throw debtError;

        // Fetch savings forecast
        const { data: savings, error: savingsError } = await supabase
          .from('savings_forecast')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: true });

        if (savingsError) throw savingsError;

        // Group by month
        const debtByMonth = groupByMonth(debtPayments || []);
        const savingsByMonth = groupByMonth(savings || []);

        setForecastData({
          debtPaymentsByMonth: debtByMonth,
          savingsByMonth
        });
      } catch (err) {
        console.error('Error fetching forecast data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecastData();
  }, [startDate, endDate]);

  return { forecastData, isLoading, error };
}

function groupByMonth(data: any[]): Array<{ id: string; amount: number; }[]> {
  return data.reduce((acc: any[], item) => {
    const monthIndex = new Date(item.month).getMonth();
    if (!acc[monthIndex]) {
      acc[monthIndex] = [];
    }
    acc[monthIndex].push({
      id: item.id,
      amount: item.amount
    });
    return acc;
  }, Array(12).fill([]));
} 