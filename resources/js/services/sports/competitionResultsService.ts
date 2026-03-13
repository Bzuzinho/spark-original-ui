import { competitionResults } from '@/data/sportsMock';
import type { CompetitionResult } from '@/types/sports';
import { getSportsResource } from './sportsApiClient';

interface BackendCompetitionResult {
  id: string;
  prova?: string;
  tempo?: string | null;
  classificacao?: number | null;
  colocacao?: number | null;
  user_id?: string;
  user_nome?: string;
  competition_id?: string;
  competition_nome?: string;
}

function normalizeCompetitionResult(row: BackendCompetitionResult): CompetitionResult {
  return {
    id: row.id,
    prova: row.prova ?? '',
    tempo: row.tempo ?? null,
    classificacao: row.classificacao ?? row.colocacao ?? null,
    event: row.competition_id
      ? { id: row.competition_id, titulo: row.competition_nome ?? '' }
      : undefined,
    athlete: row.user_id
      ? { nome_completo: row.user_nome ?? '' }
      : undefined,
  };
}

export async function getCompetitionResults(): Promise<CompetitionResult[]> {
  const payload = await getSportsResource<BackendCompetitionResult[]>('/api/desportivo/competition-results', competitionResults);
  return Array.isArray(payload) ? payload.map(normalizeCompetitionResult) : [];
}
