import { Card } from '@/Components/ui/card';
import { 
    Users, 
    UserCircle, 
    Heartbeat,
    ClockCounterClockwise,
    TrendUp,
    UsersThree,
    Warning
} from '@phosphor-icons/react';

interface Stats {
    totalMembros: number;
    membrosAtivos: number;
    membrosInativos: number;
    totalAtletas: number;
    atletasAtivos: number;
    encarregados: number;
    treinadores: number;
    novosUltimos30Dias: number;
    atestadosACaducar: number;
}

interface TipoStat {
    tipo: string;
    count: number;
}

interface EscalaoStat {
    escalao: string;
    count: number;
}

interface Props {
    stats: Stats;
    tipoMembrosStats: TipoStat[];
    escaloesStats: EscalaoStat[];
}

export default function MembrosDashboard({ stats, tipoMembrosStats, escaloesStats }: Props) {
    const statCards = [
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
            color: 'text-green-600',
            bgColor: 'bg-green-50',
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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
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
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
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
        <div className="space-y-3">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="p-2.5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">
                                        {stat.title}
                                    </p>
                                    <p className="text-xl font-bold">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                                    <Icon size={18} className={stat.color} weight="duotone" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Members by Type */}
                <Card className="p-3">
                    <h3 className="text-sm font-semibold mb-2.5">Membros por Tipo</h3>
                    <div className="space-y-1.5">
                        {tipoMembrosStats.length > 0 ? (
                            tipoMembrosStats.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-1 border-b last:border-0">
                                    <span className="text-[11px] text-gray-700">{item.tipo}</span>
                                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[11px] text-muted-foreground py-2 text-center">
                                Nenhum dado disponível
                            </p>
                        )}
                    </div>
                </Card>

                {/* Athletes by Age Group */}
                <Card className="p-3">
                    <h3 className="text-sm font-semibold mb-2.5">Atletas por Escalão</h3>
                    <div className="space-y-1.5">
                        {escaloesStats.length > 0 ? (
                            escaloesStats.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-1 border-b last:border-0">
                                    <span className="text-[11px] text-gray-700">{item.escalao}</span>
                                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[11px] text-muted-foreground py-2 text-center">
                                Nenhum dado disponível
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
