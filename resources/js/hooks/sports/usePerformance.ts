import { useEffect, useState } from 'react';
import { getPerformance } from '@/services/sports';
import type { PerformanceMetric } from '@/types/sports';

interface UsePerformanceData {
  performance: PerformanceMetric[];
  scientificMetrics: PerformanceMetric[];
}

interface UsePerformanceResult {
  data: UsePerformanceData;
  loading: boolean;
  error: string | null;
}

export function usePerformance(enabled = true): UsePerformanceResult {
  const [data, setData] = useState<UsePerformanceData>({ performance: [], scientificMetrics: [] });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;

    void getPerformance()
      .then((payload) => {
        if (!active) return;
        setData({
          performance: Array.isArray(payload?.performance) ? payload.performance : [],
          scientificMetrics: Array.isArray(payload?.scientificMetrics) ? payload.scientificMetrics : [],
        });
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load performance data.');
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
