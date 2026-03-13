import type { Training } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

/**
 * GET /api/desportivo/trainings
 * Retorna lista de treinos com dados essenciais.
 * Sem fallback mock em produção.
 */
export async function getTrainings(): Promise<Training[]> {
  return getSportsResource<Training[]>('/api/desportivo/trainings', []);
}
