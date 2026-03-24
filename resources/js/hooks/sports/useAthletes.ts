import { useEffect, useState } from 'react';
import { getAthletes } from '@/services/sports';
import type { Athlete } from '@/types/sports';

interface UseAthletesResult {
  data: Athlete[];
  loading: boolean;
  error: string | null;
}

export function useAthletes(enabled = true): UseAthletesResult {
  const [data, setData] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

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
  }, [enabled]);

  return { data, loading, error };
}
