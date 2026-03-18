import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Heartbeat, CalendarBlank, Gauge, UsersThree, WarningCircle, TrendUp } from '@phosphor-icons/react';
import { SectionTitle, SmallMetric } from '@/components/sports/shared';
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
}

export function DesportivoDashboardTab({
  stats,
  alerts,
  trainings,
  upcomingCompetitions,
  competitions,
  users,
  volumeByAthlete,
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
  const topAthletes = volumeByAthlete.slice(0, 5);

  const activeAthletesCount = (users ?? []).filter((u) => {
    const tipos = u.tipo_membro ?? [];
    return u.estado === 'ativo' && tipos.includes('atleta');
  }).length;

  const attendanceRate = stats.attendanceRate ?? null;

  return (
    <div className="space-y-3">
      {/* ── Métricas de topo ─────────────────────────────────────────── */}
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <SmallMetric label="Atletas ativos" value={activeAthletesCount || stats.athletesCount} icon={<UsersThree size={18} className="text-blue-600" />} />
        <SmallMetric label="Treinos (7 dias)" value={stats.trainings7Days} hint="janela atual" icon={<CalendarBlank size={18} className="text-emerald-600" />} />
        <SmallMetric label="A decorrer" value={activeNow.length} hint={today} icon={<Heartbeat size={18} className="text-indigo-600" />} />
        <SmallMetric label="Próxima prova" value={nextCompetition ? nextCompetition.nome : 'Sem prova'} hint={nextCompetition?.data_inicio ?? 'sem agenda'} icon={<Gauge size={18} className="text-amber-600" />} />
      </div>

      {/* ── Alertas + Competições + Carga ────────────────────────────── */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Alertas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <WarningCircle size={14} className="text-amber-500" /> Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem alertas ativos.</p>
            )}
            {alerts.map((alert) => (
              <div key={`${alert.title}-${alert.message}`} className="border rounded-md p-2">
                <p className="text-xs font-medium">{alert.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Próximas competições */}
        <Card>
          <CardHeader className="pb-2">
            <SectionTitle title="Próximas competições" subtitle={`${competitions.length} total registadas`} />
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingCompetitions.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem competições na próxima janela.</p>
            )}
            {upcomingCompetitions.slice(0, 4).map((competition) => (
              <div key={competition.id} className="flex items-center justify-between border rounded-md p-2">
                <div>
                  <p className="text-xs font-medium">{competition.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{competition.data_inicio}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{competition.num_atletas_inscritos} atletas</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Estatísticas de presença e carga */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendUp size={14} className="text-emerald-500" /> Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendanceRate !== null && (
              <div className="border rounded-md p-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Taxa de presença</p>
                <Badge variant="secondary" className="text-[10px]">{attendanceRate}%</Badge>
              </div>
            )}
            <div className="border rounded-md p-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Treinos hoje</p>
              <Badge variant="outline" className="text-[10px]">{todayTrainings.length}</Badge>
            </div>
            <div className="border rounded-md p-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Atletas registados</p>
              <Badge variant="outline" className="text-[10px]">{activeAthletesCount || stats.athletesCount}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Volume por atleta ────────────────────────────────────────── */}
      {topAthletes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Volume acumulado — top atletas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {topAthletes.map((row) => (
                <div key={row.nome_completo} className="border rounded-md p-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium truncate">{row.nome_completo}</p>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{(row.total_m / 1000).toFixed(1)} km</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
