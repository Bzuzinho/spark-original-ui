import { competitions } from '@/data/sportsMock';
import type { Competition } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

interface BackendCompetition {
  id: string;
  titulo?: string;
  nome?: string;
  data_inicio: string;
  local?: string;
  tipo?: string;
  tipo_prova?: string;
}

/**
 * GET /api/desportivo/competitions
 * Retorna competições normalizadas para o tipo de UI.
 * Fallback: usa mock data se API indisponível.
 */
export async function getCompetitions(): Promise<Competition[]> {
  const payload = await getSportsResource<BackendCompetition[]>('/api/desportivo/competitions', competitions);

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((row) => ({
    id: row.id,
    titulo: row.titulo ?? row.nome ?? '',
    data_inicio: row.data_inicio,
    local: row.local,
    tipo: row.tipo ?? row.tipo_prova ?? 'prova',
  }));
}
