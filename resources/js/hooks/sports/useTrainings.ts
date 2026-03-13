import { useEffect, useState } from 'react';
import { getTrainings } from '@/services/sports';
import type { Training } from '@/types/sports';

interface UseTrainingsResult {
  data: Training[];
  loading: boolean;
  error: string | null;
}

export function useTrainings(): UseTrainingsResult {
  const [data, setData] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getTrainings()
      .then((payload) => {
        if (!active) return;
        setData(Array.isArray(payload) ? payload : []);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load trainings.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
