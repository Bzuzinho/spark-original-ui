import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, CalendarBlank, CurrencyCircleDollar, Heartbeat, UserCircle } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { User, Event, LancamentoFinanceiro } from '@/lib/types';

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const [users] = useKV<User[]>('club-users', []);
  const [events] = useKV<Event[]>('club-events', []);
  const [lancamentos] = useKV<LancamentoFinanceiro[]>('club-lancamentos', []);

  const activeMembers = users?.filter(u => u.estado === 'ativo').length || 0;
  const upcomingEvents = events?.filter(e => 
    e.estado === 'agendado' && new Date(e.data_inicio) >= new Date()
  ).length || 0;
  
  const monthlyRevenue = lancamentos?.filter(l => {
    const lancamentoDate = new Date(l.data);
    const now = new Date();
    return l.tipo === 'receita' && 
      lancamentoDate.getMonth() === now.getMonth() &&
      lancamentoDate.getFullYear() === now.getFullYear();
  }).reduce((sum, l) => sum + l.valor, 0) || 0;

  const totalAtletas = users?.filter(u => u.tipo_membro.includes('atleta')).length || 0;
  const atletasAtivos = users?.filter(u => 
    u.tipo_membro.includes('atleta') && u.ativo_desportivo
  ).length || 0;
  const encarregados = users?.filter(u => 
    u.tipo_membro.includes('encarregado_educacao')
  ).length || 0;

  const stats = [
    {
      title: 'Membros Ativos',
      value: activeMembers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      view: 'members'
    },
    {
      title: 'Atletas Ativos',
      value: atletasAtivos,
      icon: Heartbeat,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      view: 'members'
    },
    {
      title: 'Encarregados de Educação',
      value: encarregados,
      icon: UserCircle,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      view: 'members'
    },
    {
      title: 'Eventos Próximos',
      value: upcomingEvents,
      icon: CalendarBlank,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      view: 'events'
    },
    {
      title: 'Receitas do Mês',
      value: `€${monthlyRevenue.toFixed(2)}`,
      icon: CurrencyCircleDollar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      view: 'financial'
    }
  ];

  return (
    <div className="w-full px-2 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Visão geral do clube</p>
      </div>

      <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-2 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onNavigate(stat.view)}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium leading-tight truncate">{stat.title}</p>
                  <p className="text-base sm:text-xl font-bold mt-0.5 truncate">{stat.value}</p>
                </div>
                <div className={`p-1.5 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <Icon className={stat.color} size={16} weight="bold" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
        <Card className="p-2 sm:p-3 overflow-hidden">
          <h2 className="text-sm sm:text-base font-semibold mb-2">Próximos Eventos</h2>
          {events && events.length > 0 ? (
            <div className="space-y-1.5 overflow-hidden">
              {events
                .filter(e => e.estado === 'agendado' && new Date(e.data_inicio) >= new Date())
                .slice(0, 3)
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between p-1.5 border rounded-lg gap-2 overflow-hidden">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="font-medium text-xs truncate">{event.titulo}</p>
                      <p className="text-[10px] xs:text-xs text-muted-foreground truncate">
                        {new Date(event.data_inicio).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded whitespace-nowrap flex-shrink-0">
                      {event.tipo}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-3 text-xs">Nenhum evento agendado</p>
          )}
          <Button variant="outline" className="w-full mt-2 h-7 text-xs" onClick={() => onNavigate('events')}>
            Ver Todos os Eventos
          </Button>
        </Card>

        <Card className="p-2 sm:p-3 overflow-hidden">
          <h2 className="text-sm sm:text-base font-semibold mb-2">Atividade Recente</h2>
          {lancamentos && lancamentos.length > 0 ? (
            <div className="space-y-1.5 overflow-hidden">
              {lancamentos
                .slice()
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 3)
                .map(lancamento => (
                  <div key={lancamento.id} className="flex items-center justify-between p-1.5 border rounded-lg gap-2 overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="font-medium truncate text-xs">{lancamento.descricao}</p>
                      <p className="text-[10px] xs:text-xs text-muted-foreground truncate">
                        {new Date(lancamento.data).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <span className={`font-semibold text-xs whitespace-nowrap flex-shrink-0 ${lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {lancamento.tipo === 'receita' ? '+' : '-'}€{lancamento.valor.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-3 text-xs">Nenhuma transação registada</p>
          )}
          <Button variant="outline" className="w-full mt-2 h-7 text-xs" onClick={() => onNavigate('financial')}>
            Ver Financeiro
          </Button>
        </Card>
      </div>

      <Card className="p-2 sm:p-3">
        <h2 className="text-sm sm:text-base font-semibold mb-2">Acesso Rápido</h2>
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => onNavigate('members')}>
            <Users size={18} />
            <span className="text-xs">Membros</span>
          </Button>
          <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => onNavigate('sports')}>
            <Trophy size={18} />
            <span className="text-xs">Desportiva</span>
          </Button>
          <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => onNavigate('events')}>
            <CalendarBlank size={18} />
            <span className="text-xs">Eventos</span>
          </Button>
          <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => onNavigate('financial')}>
            <CurrencyCircleDollar size={18} />
            <span className="text-xs">Financeiro</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
