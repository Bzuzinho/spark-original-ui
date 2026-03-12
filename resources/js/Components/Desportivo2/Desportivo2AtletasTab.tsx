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
}

function getAssiduidadeLabel(percent: number): string {
  if (percent >= 85) return 'Alta';
  if (percent >= 65) return 'Média';
  return 'Baixa';
}

function getDisciplinaLabel(status: string | undefined): string {
  if (status === 'critico') return 'Crítico';
  if (status === 'atencao') return 'Atenção';
  return 'OK';
}

export function Desportivo2AtletasTab({ users, volumeByAthlete, athleteOperationalRows }: Props) {
  const activeAthletes = (users ?? []).filter((user) => {
    const tipo = user.tipo_membro ?? [];
    return user.estado === 'ativo' && tipo.includes('atleta');
  });

  const topVolume = volumeByAthlete[0]?.total_m ?? 0;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Consulta operacional de atletas. Criação de atleta mantém-se fora do Desportivo 2.
      </p>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {activeAthletes.map((athlete) => {
          const volume = volumeByAthlete.find((row) => row.nome_completo === athlete.nome_completo)?.total_m ?? 0;
          const operational = athleteOperationalRows.find((row) => row.user_id === athlete.id);
          const assiduidadePct = operational?.assiduidade_percent ?? (topVolume > 0 ? Math.round((volume / topVolume) * 100) : 0);
          const medicalOk = Boolean(athlete.data_atestado_medico);

          return (
            <Card key={athlete.id} className="border">
              <CardContent className="p-3 space-y-2">
                <div>
                  <p className="text-xs font-semibold truncate">{athlete.nome_completo}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Categoria: {(athlete.escalao ?? []).join(', ') || 'Sem grupo'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className="border rounded px-2 py-1">
                    <p className="text-muted-foreground">PB</p>
                    <p className="font-medium">{operational?.pb_label || 'Sem registo'}</p>
                  </div>
                  <div className="border rounded px-2 py-1">
                    <p className="text-muted-foreground">Assiduidade</p>
                    <p className="font-medium">{getAssiduidadeLabel(assiduidadePct)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="outline" className={medicalOk ? 'text-emerald-700 border-emerald-300' : 'text-amber-700 border-amber-300'}>
                    Médico: {medicalOk ? 'OK' : 'Pendente'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      operational?.disciplina_status === 'critico'
                        ? 'text-red-700 border-red-300'
                        : operational?.disciplina_status === 'atencao'
                          ? 'text-amber-700 border-amber-300'
                          : 'text-slate-700 border-slate-300'
                    }
                  >
                    Disciplina: {getDisciplinaLabel(operational?.disciplina_status)}
                  </Badge>
                  {(operational?.total_resultados ?? 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {operational?.total_resultados} resultados
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {activeAthletes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-xs text-muted-foreground">
              Sem atletas ativos para mostrar.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}