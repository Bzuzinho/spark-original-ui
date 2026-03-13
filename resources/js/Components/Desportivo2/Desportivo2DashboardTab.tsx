import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Heartbeat, CalendarBlank, Gauge, UsersThree, WarningCircle, Anchor } from '@phosphor-icons/react';
import { MiniCard, SectionTitle, SmallMetric } from '@/components/sports/shared';
import type { Competition, Stats, Training, User } from './types';

interface Alert {
  title: string;
  message: string;
  type: string;
}

interface UpcomingCompetition {
  id: string;
  nome: string;
  data_inicio: string;
  num_atletas_inscritos: number;
}

interface Props {
  stats: Stats;
  alerts: Alert[];
  trainings: Training[];
  upcomingCompetitions: UpcomingCompetition[];
  competitions: Competition[];
  users: User[];
  volumeByAthlete: Array<{ nome_completo: string; total_m: number }>;
  onOpenCais: (trainingId: string, modoCais: boolean) => void;
}

export function Desportivo2DashboardTab({
  stats,
  alerts,
  trainings,
  upcomingCompetitions,
  competitions,
  users,
  volumeByAthlete,
  onOpenCais,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);
  const todayTrainings = (trainings ?? []).filter((t) => t.data === today);
  const activeNow = todayTrainings.filter((t) => {
    const start = t.hora_inicio ?? '00:00';
    const end = t.hora_fim ?? '23:59';
    return start <= nowTime && nowTime <= end;
  });
  const nextCompetition = upcomingCompetitions[0] ?? null;
  const highlightedAthletes = volumeByAthlete.slice(0, 4);

  const activeAthletesCount = (users ?? []).filter((u) => {
    const tipos = u.tipo_membro ?? [];
    return u.estado === 'ativo' && tipos.includes('atleta');
  }).length;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <SmallMetric label="Atletas hoje" value={activeAthletesCount || stats.athletesCount} icon={<UsersThree size={18} className="text-blue-600" />} />
        <SmallMetric label="Treinos" value={stats.trainings7Days} hint="janela 7 dias" icon={<CalendarBlank size={18} className="text-emerald-600" />} />
        <SmallMetric label="A decorrer" value={activeNow.length} hint={today} icon={<Heartbeat size={18} className="text-indigo-600" />} />
        <SmallMetric label="Próxima prova" value={nextCompetition ? nextCompetition.nome : 'Sem prova'} hint={nextCompetition?.data_inicio ?? 'sem agenda'} icon={<Gauge size={18} className="text-amber-600" />} />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Modo rápido de presenças</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeNow.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem treinos a decorrer. Podes abrir presenças por treino do dia.</p>
            )}
            {(activeNow.length > 0 ? activeNow : todayTrainings.slice(0, 3)).map((training) => (
              <div key={training.id} className="border rounded-md p-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium">{training.numero_treino || 'Treino'} · {training.tipo_treino}</p>
                  <p className="text-[11px] text-muted-foreground">{training.data} {training.hora_inicio ?? '--:--'} {training.local ? `· ${training.local}` : ''}</p>
                </div>
                <Button size="sm" className="gap-1" onClick={() => onOpenCais(training.id, true)}>
                  <Anchor size={12} /> Cais
                </Button>
              </div>
            ))}
            {todayTrainings.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => onOpenCais(todayTrainings[0].id, false)}>
                Abrir tab Cais
              </Button>
            )}
          </CardContent>
        </Card>

        <MiniCard
          title="Treino do dia"
          subtitle={todayTrainings[0] ? `${todayTrainings[0].tipo_treino} · ${todayTrainings[0].hora_inicio ?? '--:--'}` : 'Sem treino previsto para hoje'}
          right={<Badge variant="outline" className="text-[10px]">{todayTrainings.length} hoje</Badge>}
        >
          {todayTrainings[0] && (
            <p className="text-[11px] text-muted-foreground">
              Local: {todayTrainings[0].local || 'N/D'} · Volume: {todayTrainings[0].volume_planeado_m ?? 0}m
            </p>
          )}
        </MiniCard>

        <MiniCard
          title="Treinos em simultâneo"
          subtitle="Leitura operacional rápida"
          right={<Badge variant="secondary" className="text-[10px]">{Math.max(activeNow.length, todayTrainings.length)}</Badge>}
        >
          <p className="text-[11px] text-muted-foreground">
            {activeNow.length > 1 ? `${activeNow.length} treinos ativos no mesmo período.` : 'Sem sobreposição crítica neste momento.'}
          </p>
        </MiniCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <SectionTitle title="Próxima competição" subtitle="Resumo executivo" />
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingCompetitions.length === 0 && <p className="text-xs text-muted-foreground">Sem competições na próxima janela.</p>}
            {upcomingCompetitions.slice(0, 3).map((competition) => (
              <div key={competition.id} className="flex items-center justify-between border rounded-md p-2">
                <div>
                  <p className="text-xs font-medium">{competition.nome}</p>
                  <p className="text-xs text-muted-foreground">{competition.data_inicio}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{competition.num_atletas_inscritos} atletas</Badge>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Total competições registadas: {competitions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Atletas em destaque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {highlightedAthletes.length === 0 && <p className="text-xs text-muted-foreground">Sem indicadores de destaque.</p>}
            {highlightedAthletes.map((row) => (
              <div key={row.nome_completo} className="border rounded-md p-2 flex items-center justify-between">
                <p className="text-xs font-medium truncate">{row.nome_completo}</p>
                <Badge variant="secondary" className="text-[10px]">{(row.total_m / 1000).toFixed(1)} km</Badge>
              </div>
            ))}
            {alerts.slice(0, 1).map((alert) => (
              <div key={`${alert.title}-${alert.message}`} className="border rounded-md p-2">
                <div className="flex items-center gap-2">
                  <WarningCircle size={14} className="text-amber-600" />
                  <p className="text-xs font-medium">{alert.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
