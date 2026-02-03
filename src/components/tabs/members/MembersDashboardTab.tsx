import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  UserCircle, 
  Heartbeat,
  ClockCounterClockwise,
  TrendUp,
  UsersThree,
  Warning
} from '@phosphor-icons/react';
import type { User, DadosDesportivos } from '@/lib/types';

export function MembersDashboardTab() {
  const [users] = useKV<User[]>('club-users', []);
  const [dadosDesportivos] = useKV<DadosDesportivos[]>('dados-desportivos', []);
  const [userTypes] = useKV<Array<{ id: string; name: string }>>('settings-user-types', []);
  const [escaloes] = useKV<Array<{ id: string; name: string }>>('settings-age-groups', []);

  const [stats, setStats] = useState({
    totalMembros: 0,
    membrosAtivos: 0,
    membrosInativos: 0,
    totalAtletas: 0,
    atletasAtivos: 0,
    encarregados: 0,
    treinadores: 0,
    novosUltimos30Dias: 0,
    atestadosACaducar: 0,
  });

  const [tipoMembrosStats, setTipoMembrosStats] = useState<Array<{ tipo: string; count: number }>>([]);
  const [escaloesStats, setEscaloesStats] = useState<Array<{ escalao: string; count: number }>>([]);

  useEffect(() => {
    const calcularStats = () => {
      const usersList = users || [];
      const dadosList = dadosDesportivos || [];
      
      const now = new Date();
      const trintaDiasAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalMembros = usersList.length;
      const membrosAtivos = usersList.filter(u => u.estado === 'ativo').length;
      const membrosInativos = usersList.filter(u => u.estado === 'inativo').length;
      
      const totalAtletas = usersList.filter(u => 
        u.tipo_membro.includes('atleta')
      ).length;
      
      const atletasAtivos = usersList.filter(u => 
        u.tipo_membro.includes('atleta') && u.ativo_desportivo
      ).length;
      
      const encarregados = usersList.filter(u => 
        u.tipo_membro.includes('encarregado_educacao')
      ).length;
      
      const treinadores = usersList.filter(u => 
        u.tipo_membro.includes('treinador')
      ).length;

      const novosUltimos30Dias = 0;

      const atestadosACaducar = dadosList.filter(d => {
        if (!d.data_atestado_medico || !d.ativo) return false;
        const dataAtestado = new Date(d.data_atestado_medico);
        const umAnoDepois = new Date(dataAtestado.getTime() + 365 * 24 * 60 * 60 * 1000);
        const trintaDiasAntes = new Date(umAnoDepois.getTime() - 30 * 24 * 60 * 60 * 1000);
        return now >= trintaDiasAntes && now <= umAnoDepois;
      }).length;

      setStats({
        totalMembros,
        membrosAtivos,
        membrosInativos,
        totalAtletas,
        atletasAtivos,
        encarregados,
        treinadores,
        novosUltimos30Dias,
        atestadosACaducar,
      });

      const tipoMap = new Map<string, number>();
      usersList.forEach(user => {
        user.tipo_membro.forEach(tipo => {
          const tipoObj = (userTypes || []).find(t => t.id === tipo);
          const tipoName = tipoObj?.name || tipo;
          tipoMap.set(tipoName, (tipoMap.get(tipoName) || 0) + 1);
        });
      });

      const tipoStats = Array.from(tipoMap.entries())
        .map(([tipo, count]) => ({ tipo, count }))
        .sort((a, b) => b.count - a.count);

      setTipoMembrosStats(tipoStats);

      const escalaoMap = new Map<string, number>();
      usersList.forEach(user => {
        (user.escalao || []).forEach(escalaoId => {
          const escalaoObj = (escaloes || []).find(e => e.id === escalaoId);
          const escalaoName = escalaoObj?.name || 'Sem escalão';
          escalaoMap.set(escalaoName, (escalaoMap.get(escalaoName) || 0) + 1);
        });
      });

      const escalaoStats = Array.from(escalaoMap.entries())
        .map(([escalao, count]) => ({ escalao, count }))
        .sort((a, b) => b.count - a.count);

      setEscaloesStats(escalaoStats);
    };

    calcularStats();
  }, [users, dadosDesportivos, userTypes, escaloes]);

  const mainStats = [
    {
      title: 'Total de Membros',
      value: stats.totalMembros,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Membros Ativos',
      value: stats.membrosAtivos,
      icon: TrendUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Atletas',
      value: stats.totalAtletas,
      icon: Heartbeat,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Atletas Ativos',
      value: stats.atletasAtivos,
      icon: Heartbeat,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Encarregados',
      value: stats.encarregados,
      icon: UserCircle,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Treinadores',
      value: stats.treinadores,
      icon: UsersThree,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Novos (30 dias)',
      value: stats.novosUltimos30Dias,
      icon: ClockCounterClockwise,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Atestados a Caducar',
      value: stats.atestadosACaducar,
      icon: Warning,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
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
          <h3 className="text-sm font-semibold mb-3">Membros por Tipo</h3>
          <div className="space-y-2">
            {tipoMembrosStats.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados disponíveis</p>
            ) : (
              tipoMembrosStats.map((item) => (
                <div key={item.tipo} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{item.tipo}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Atletas por Escalão</h3>
          <div className="space-y-2">
            {escaloesStats.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados disponíveis</p>
            ) : (
              escaloesStats.map((item) => (
                <div key={item.escalao} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{item.escalao}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
