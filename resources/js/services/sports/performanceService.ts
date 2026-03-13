import type { PerformanceMetric } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

export interface PerformancePayload {
  performance: PerformanceMetric[];
  scientificMetrics: PerformanceMetric[];
}

/**
 * Agregação de métricas de performance.
 * Sem fallback mock em produção.
 */
export async function getPerformance(): Promise<PerformancePayload> {
  const fallback: PerformancePayload = {
    performance: [],
    scientificMetrics: [],
  };

  return getSportsResource<PerformancePayload>('/api/desportivo/performance', fallback);
}
