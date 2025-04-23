import { useState, useEffect } from 'react';
import { getFinancialGoals, FinancialGoal } from '@/lib/services/financialGoalService';

export function useFinancialGoalsData() {
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch financial goals from the service
    async function loadFinancialGoals() {
      try {
        setIsLoading(true);
        const data = await getFinancialGoals();
        setFinancialGoals(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading financial goals:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading financial goals'));
        setIsLoading(false);
      }
    }

    loadFinancialGoals();
  }, []);

  return {
    financialGoals,
    isLoading,
    error
  };
} 