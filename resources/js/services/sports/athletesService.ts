import { athletes } from '@/data/sportsMock';
import type { Athlete } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

/**
 * GET /api/desportivo/athletes
 * Retorna lista de atletas ativos do sistema.
 * Fallback: usa mock data se API indisponível.
 */
export async function getAthletes(): Promise<Athlete[]> {
  return getSportsResource<Athlete[]>('/api/desportivo/athletes', athletes);
}
