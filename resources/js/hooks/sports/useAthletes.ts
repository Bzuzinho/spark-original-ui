import { useEffect, useState } from 'react';
import { getAthletes } from '@/services/sports';
import type { Athlete } from '@/types/sports';

interface UseAthletesResult {
  data: Athlete[];
  loading: boolean;
  error: string | null;
}

export function useAthletes(): UseAthletesResult {
  const [data, setData] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getAthletes()
      .then((payload) => {
        if (!active) return;
        setData(Array.isArray(payload) ? payload : []);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load athletes.');
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
