import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Users,
  TrendUp,
  CalendarBlank,
  Warning,
} from '@phosphor-icons/react';

interface Stats {
  athletesCount: number;
  trainings7Days: number;
  trainings30Days: number;
  km7Days: number;
  km30Days: number;
}

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

interface DesportivoDashboardProps {
  stats: Stats;
  alerts?: Alert[];
  upcomingCompetitions?: UpcomingCompetition[];
}

export function DesportivoDashboard({
  stats,
  alerts = [],
  upcomingCompetitions = [],
}: DesportivoDashboardProps) {
  const mainStats = [
    {
      title: 'Atletas Ativos',
      value: stats.athletesCount,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Treinos (7 dias)',
      value: stats.trainings7Days,
      icon: TrendUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Próximas Competições',
      value: upcomingCompetitions.length,
      icon: CalendarBlank,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Volume 7 dias',
      value: `${stats.km7Days} km`,
      icon: TrendUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-3 border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium leading-tight truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg shrink-0`}>
                  <Icon size={20} weight="duotone" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-3">
          <h3 className="text-xs font-semibold mb-2">Resumo de Treinos</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
              <span className="text-xs font-semibold text-blue-600">
                {stats.trainings7Days} treinos
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
              <span className="text-xs font-semibold text-emerald-600">
                {stats.trainings30Days} treinos
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-xs text-muted-foreground">Volume 7 dias</span>
              <span className="text-xs font-semibold">{stats.km7Days} km</span>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <h3 className="text-xs font-semibold mb-2">Volume Mensal</h3>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Km treinados nos últimos 30 dias
            </p>
            <p className="text-2xl font-bold">{stats.km30Days} km</p>
          </div>
        </Card>

        <Card className="p-3">
          <h3 className="text-xs font-semibold mb-2">Alertas</h3>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem alertas ativos</p>
            ) : (
              alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="border rounded-md p-2 flex items-start gap-2"
                >
                  <Warning size={16} className="text-amber-600 shrink-0 mt-0.5" weight="duotone" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
