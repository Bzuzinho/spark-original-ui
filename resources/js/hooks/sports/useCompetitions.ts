import { useEffect, useState } from 'react';
import { getCompetitions } from '@/services/sports';
import type { Competition } from '@/types/sports';

interface UseCompetitionsResult {
  data: Competition[];
  loading: boolean;
  error: string | null;
}

export function useCompetitions(): UseCompetitionsResult {
  const [data, setData] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getCompetitions()
      .then((payload) => {
        if (!active) return;
        setData(Array.isArray(payload) ? payload : []);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load competitions.');
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
