import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import type { AthleteOperationalRow, User } from './types';

interface VolumeRow {
  nome_completo: string;
  total_m: number;
}

interface Props {
  users: User[];
  volumeByAthlete: VolumeRow[];
  athleteOperationalRows: AthleteOperationalRow[];
  ageGroups?: Array<{ id: string; nome: string }>;
}

interface AthleteExtended extends User {
  num_federacao?: string | null;
  informacoes_medicas?: unknown;
}

function getAssiduidadeMeta(percentRaw: number): { label: string; className: string } {
  const percent = Math.max(0, Math.min(100, Math.round(percentRaw)));

  if (percent <= 50) {
    return { label: 'Alerta', className: 'text-red-700 border-red-300 bg-red-50' };
  }

  if (percent <= 70) {
    return { label: 'Baixa', className: 'text-amber-700 border-amber-300 bg-amber-50' };
  }

  if (percent <= 90) {
    return { label: 'Normal', className: 'text-blue-700 border-blue-300 bg-blue-50' };
  }

  return { label: 'Alta', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' };
}

function getDisciplinaMeta(status: string | undefined): { label: string; className: string } {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'critico') {
    return { label: 'Crítico', className: 'text-red-700 border-red-300 bg-red-50' };
  }

  if (normalized === 'atencao' || normalized === 'alerta') {
    return { label: 'Atenção', className: 'text-amber-700 border-amber-300 bg-amber-50' };
  }

  return { label: 'Normal', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' };
}

function getMedicalMeta(athlete: AthleteExtended): { label: string; className: string } {
  const rawMedical = athlete.informacoes_medicas;
  let apto: unknown = null;

  if (typeof rawMedical === 'string' && rawMedical.trim() !== '') {
    try {
      const parsed = JSON.parse(rawMedical);
      apto = (parsed as any)?.apto;
    } catch {
      apto = null;
    }
  } else if (rawMedical && typeof rawMedical === 'object') {
    apto = (rawMedical as any)?.apto;
  }

  if (apto === true || apto === 'apto') {
    return { label: 'Apto', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' };
  }

  if (apto === false || apto === 'nao_apto') {
    return { label: 'Não apto', className: 'text-red-700 border-red-300 bg-red-50' };
  }

  if (athlete.data_atestado_medico) {
    return { label: 'Atestado OK', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' };
  }

  return { label: 'Pendente', className: 'text-amber-700 border-amber-300 bg-amber-50' };
}

export function DesportivoAtletasTab({ users, volumeByAthlete, athleteOperationalRows, ageGroups = [] }: Props) {
  const activeAthletes = (users ?? []).filter((user) => {
    const tipo = user.tipo_membro ?? [];
    return tipo.includes('atleta');
  });

  const ageGroupById = new Map((ageGroups || []).map((group) => [String(group.id), group.nome]));

  const topVolume = volumeByAthlete[0]?.total_m ?? 0;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Consulta operacional de atletas. Criação de atleta mantém-se fora do Desportivo.
      </p>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {activeAthletes.map((athlete) => {
          const athleteExt = athlete as AthleteExtended;
          const volume = volumeByAthlete.find((row) => row.nome_completo === athlete.nome_completo)?.total_m ?? 0;
          const operational = athleteOperationalRows.find((row) => row.user_id === athlete.id);
          const assiduidadePct = operational?.assiduidade_percent ?? (topVolume > 0 ? Math.round((volume / topVolume) * 100) : 0);
          const assiduidadeMeta = getAssiduidadeMeta(assiduidadePct);
          const disciplinaMeta = getDisciplinaMeta(operational?.disciplina_status);
          const medicalMeta = getMedicalMeta(athleteExt);
          const escalaoValues = Array.isArray(athlete.escalao)
            ? athlete.escalao
            : athlete.escalao
              ? [athlete.escalao]
              : [];
          const escalaoLabel = escalaoValues.length > 0
            ? escalaoValues
                .map((value) => {
                  const normalized = String(value);
                  return ageGroupById.get(normalized) || normalized;
                })
                .join(', ')
            : 'Sem escalão';

          return (
            <Card key={athlete.id} className="border">
              <CardContent className="p-3 space-y-3">
                <div className="rounded-md border p-2 bg-slate-50/60">
                  <p className="text-xs font-semibold leading-tight break-words">
                    {athleteExt.num_federacao || 'Sem nº'} - {athlete.nome_completo} - {escalaoLabel}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="border rounded px-2 py-2 bg-white space-y-1">
                    <p className="text-muted-foreground">Assiduidade Mensal</p>
                    <p className="font-semibold">{Math.max(0, Math.min(100, Math.round(assiduidadePct)))}%</p>
                    <Badge variant="outline" className={`text-[10px] ${assiduidadeMeta.className}`}>
                      {assiduidadeMeta.label}
                    </Badge>
                  </div>
                  <div className="border rounded px-2 py-2 bg-white space-y-1">
                    <p className="text-muted-foreground">Informações Médicas</p>
                    <Badge variant="outline" className={`text-[10px] ${medicalMeta.className}`}>
                      {medicalMeta.label}
                    </Badge>
                  </div>
                  <div className="border rounded px-2 py-2 bg-white space-y-1">
                    <p className="text-muted-foreground">Disciplina</p>
                    <Badge variant="outline" className={`text-[10px] ${disciplinaMeta.className}`}>
                      {disciplinaMeta.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {activeAthletes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-xs text-muted-foreground">
              Sem atletas do tipo Atleta para mostrar.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}