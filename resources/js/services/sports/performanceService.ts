import { performance, scientificMetrics } from '@/data/sportsMock';
import type { PerformanceMetric } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

export interface PerformancePayload {
  performance: PerformanceMetric[];
  scientificMetrics: PerformanceMetric[];
}

/**
 * Agregação de métricas de performance.
 * Fallback: usa mock data se API indisponível.
 *
 * Nota: Endpoint /api/desportivo/performance ainda será criado
 * quando persistência de métricas for implementada (Fase 2).
 */
export async function getPerformance(): Promise<PerformancePayload> {
  const fallback: PerformancePayload = {
    performance,
    scientificMetrics,
  };

  return getSportsResource<PerformancePayload>('/api/desportivo/performance', fallback);
}
