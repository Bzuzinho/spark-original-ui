import type { Athlete } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

/**
 * GET /api/desportivo/athletes
 * Retorna lista de atletas ativos do sistema.
 * Sem fallback mock em produção.
 */
export async function getAthletes(): Promise<Athlete[]> {
  return getSportsResource<Athlete[]>('/api/desportivo/athletes', []);
}
