import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { 
  CalendarBlank, 
  Trophy,
  Users,
  TrendUp,
  ClockCounterClockwise,
  CheckCircle,
  Warning
} from '@phosphor-icons/react';
import type { Event, ConvocatoriaGrupo, TreinoAtleta } from '@/lib/types';

export function EventosDashboard() {
  const [events] = useKV<Event[]>('club-events', []);
  const [convocatorias] = useKV<ConvocatoriaGrupo[]>('convocatorias', []);
  const [presencas] = useKV<TreinoAtleta[]>('treino-atletas', []);

  const [stats, setStats] = useState({
    totalEventos: 0,
    eventosAgendados: 0,
    eventosEmCurso: 0,
    eventosConcluidos: 0,
    treinos: 0,
    provas: 0,
    convocatoriasAtivas: 0,
    taxaPresencaMedia: 0,
  });

  const [eventosPorTipo, setEventosPorTipo] = useState<Array<{ tipo: string; count: number }>>([]);
  const [proximosEventos, setProximosEventos] = useState<Event[]>([]);

  useEffect(() => {
    const calcularStats = () => {
      const eventsList = events || [];
      const convocatoriasList = convocatorias || [];
      const presencasList = presencas || [];
      
      const now = new Date();
      const seteDiasFrente = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const totalEventos = eventsList.length;
      const eventosAgendados = eventsList.filter(e => e.estado === 'agendado').length;
      const eventosEmCurso = eventsList.filter(e => e.estado === 'em_curso').length;
      const eventosConcluidos = eventsList.filter(e => e.estado === 'concluido').length;
      
      const treinos = eventsList.filter(e => e.tipo === 'treino').length;
      const provas = eventsList.filter(e => e.tipo === 'prova').length;

      const convocatoriasAtivas = convocatoriasList.filter(c => {
        const evento = eventsList.find(e => e.id === c.evento_id);
        if (!evento) return false;
        const dataEvento = new Date(evento.data_inicio);
        return dataEvento >= now;
      }).length;

      const totalPresentes = presencasList.filter(p => p.presente).length;
      const totalPresencas = presencasList.length;
      const taxaPresencaMedia = totalPresencas > 0 ? (totalPresentes / totalPresencas) * 100 : 0;

      setStats({
        totalEventos,
        eventosAgendados,
        eventosEmCurso,
        eventosConcluidos,
        treinos,
        provas,
        convocatoriasAtivas,
        taxaPresencaMedia,
      });

      const tipoMap = new Map<string, number>();
      eventsList.forEach(event => {
        const tipo = event.tipo || 'Outro';
        tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
      });

      const tipoStats = Array.from(tipoMap.entries())
        .map(([tipo, count]) => ({ tipo, count }))
        .sort((a, b) => b.count - a.count);

      setEventosPorTipo(tipoStats);

      const proximos = eventsList
        .filter(e => {
          const dataInicio = new Date(e.data_inicio);
          return dataInicio >= now && dataInicio <= seteDiasFrente;
        })
        .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
        .slice(0, 5);

      setProximosEventos(proximos);
    };

    calcularStats();
  }, [events, convocatorias, presencas]);

  const mainStats = [
    {
      title: 'Total de Eventos',
      value: stats.totalEventos,
      icon: CalendarBlank,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Eventos Agendados',
      value: stats.eventosAgendados,
      icon: ClockCounterClockwise,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Em Curso',
      value: stats.eventosEmCurso,
      icon: TrendUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Concluídos',
      value: stats.eventosConcluidos,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Treinos',
      value: stats.treinos,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Provas',
      value: stats.provas,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Convocatórias Ativas',
      value: stats.convocatoriasAtivas,
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Taxa de Presença Média',
      value: `${stats.taxaPresencaMedia.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-4">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Eventos por Tipo</h3>
          <div className="space-y-2">
            {eventosPorTipo.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados disponíveis</p>
            ) : (
              eventosPorTipo.map((item) => (
                <div key={item.tipo} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm capitalize">{item.tipo}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Próximos Eventos (7 dias)</h3>
          <div className="space-y-2">
            {proximosEventos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem eventos próximos</p>
            ) : (
              proximosEventos.map((evento) => (
                <div key={evento.id} className="py-2 border-b last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{evento.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(evento.data_inicio).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      evento.tipo === 'prova' ? 'bg-yellow-100 text-yellow-700' :
                      evento.tipo === 'treino' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {evento.tipo}
                    </span>
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
