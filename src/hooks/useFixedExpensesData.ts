import { useState, useEffect } from 'react';
import { getFixedExpenses, FixedExpense } from '@/lib/services/recurringService';

export function useFixedExpensesData() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch fixed expenses from the service
    async function loadFixedExpenses() {
      try {
        setIsLoading(true);
        const data = await getFixedExpenses();
        setFixedExpenses(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading fixed expenses:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading fixed expenses'));
        setIsLoading(false);
      }
    }

    loadFixedExpenses();
  }, []);

  return {
    fixedExpenses,
    isLoading,
    error
  };
} 