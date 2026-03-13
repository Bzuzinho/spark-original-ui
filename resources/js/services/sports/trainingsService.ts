import { scheduled } from '@/data/sportsMock';
import type { Training } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

/**
 * GET /api/desportivo/trainings
 * Retorna lista de treinos com dados essenciais.
 * Fallback: usa mock data se API indisponível.
 */
export async function getTrainings(): Promise<Training[]> {
  return getSportsResource<Training[]>('/api/desportivo/trainings', scheduled);
}
