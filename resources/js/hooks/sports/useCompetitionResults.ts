import { useEffect, useState } from 'react';
import { getCompetitionResults } from '@/services/sports';
import type { CompetitionResult } from '@/types/sports';

interface UseCompetitionResultsResult {
  data: CompetitionResult[];
  loading: boolean;
  error: string | null;
}

export function useCompetitionResults(enabled = true): UseCompetitionResultsResult {
  const [data, setData] = useState<CompetitionResult[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;

    void getCompetitionResults()
      .then((payload) => {
        if (!active) return;
        setData(Array.isArray(payload) ? payload : []);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load competition results.');
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
