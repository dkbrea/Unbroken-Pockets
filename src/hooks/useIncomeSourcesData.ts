import { useState, useEffect } from 'react';
import { getIncomeSources, IncomeSource } from '@/lib/services/recurringService';

export function useIncomeSourcesData() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch income sources from the service
    async function loadIncomeSources() {
      try {
        setIsLoading(true);
        const data = await getIncomeSources();
        setIncomeSources(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading income sources:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading income sources'));
        setIsLoading(false);
      }
    }

    loadIncomeSources();
  }, []);

  return {
    incomeSources,
    isLoading,
    error
  };
} 