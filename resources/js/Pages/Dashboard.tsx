import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Users, Trophy, Calendar, GraduationCap, CurrencyCircleDollar } from '@phosphor-icons/react';
import StatsCard from '@/Components/StatsCard';

interface Props {
    userTypes?: any[];
    ageGroups?: any[];
    stats?: {
        totalUsers: number;
        totalUserTypes: number;
        totalAgeGroups: number;
        totalMembers: number;
        activeAthletes: number;
        guardians: number;
        upcomingEvents: number;
        monthlyRevenue: number;
    };
}

export default function Dashboard({ userTypes = [], ageGroups = [], stats }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Bem-vindo ao BSCN Gestão de Clube
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Cards - 5 cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <StatsCard
                        title="Membros Ativos"
                        value={stats.totalMembers}
                        icon={Users}
                        iconBgColor="#DBEAFE"
                        iconColor="#2563EB"
                    />
                    <StatsCard
                        title="Atletas Ativos"
                        value={stats.activeAthletes}
                        icon={Trophy}
                        iconBgColor="#D1FAE5"
                        iconColor="#10B981"
                    />
                    <StatsCard
                        title="Encarregados de Educação"
                        value={stats.guardians}
                        icon={GraduationCap}
                        iconBgColor="#CFFAFE"
                        iconColor="#06B6D4"
                    />
                    <StatsCard
                        title="Eventos Próximos"
                        value={stats.upcomingEvents}
                        icon={Calendar}
                        iconBgColor="#DBEAFE"
                        iconColor="#2563EB"
                    />
                    <StatsCard
                        title="Receitas do Mês"
                        value={`€${stats.monthlyRevenue.toFixed(2)}`}
                        icon={CurrencyCircleDollar}
                        iconBgColor="#E9D5FF"
                        iconColor="#9333EA"
                    />
                </div>
            )}

            {/* Grid 3 Sections: Events | Activity | Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Upcoming Events */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Próximos Eventos</h3>
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-sm">Nenhum evento agendado</p>
                    </div>
                    <Link 
                        href="/eventos" 
                        className="block w-full mt-4 text-sm text-center text-blue-600 hover:underline"
                    >
                        Ver Todos os Eventos →
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Atividade Recente</h3>
                    <div className="space-y-2">
                        {/* Item 1 */}
                        <div className="text-sm pb-3">
                            <p className="font-medium text-gray-900">Pagamento de fatura mensal - Alexandre Quitério Anastácio</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-500 text-xs">07/10/2025</span>
                                <span className="text-green-600 font-medium">+€35.00</span>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="text-sm pb-3">
                            <p className="font-medium text-gray-900">Pagamento de fatura mensal - Ana Luísa Silva Rodrigues</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-500 text-xs">07/10/2025</span>
                                <span className="text-green-600 font-medium">+€25.00</span>
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className="text-sm pb-1">
                            <p className="font-medium text-gray-900">Pagamento de fatura mensal - André Sousa Paulo</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-500 text-xs">07/10/2025</span>
                                <span className="text-green-600 font-medium">+€25.00</span>
                            </div>
                        </div>
                    </div>
                    <Link 
                        href="/financeiro" 
                        className="block w-full mt-4 text-sm text-center text-blue-600 hover:underline"
                    >
                        Ver Financeiro →
                    </Link>
                </div>

                {/* Quick Access */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Acesso Rápido</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link 
                            href="/membros" 
                            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <Users size={32} className="text-gray-600 mb-2" weight="regular" />
                            <span className="text-sm text-gray-700">Membros</span>
                        </Link>
                        <Link 
                            href="/desportivo" 
                            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <Trophy size={32} className="text-gray-600 mb-2" weight="regular" />
                            <span className="text-sm text-gray-700">Desportiva</span>
                        </Link>
                        <Link 
                            href="/eventos" 
                            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <Calendar size={32} className="text-gray-600 mb-2" weight="regular" />
                            <span className="text-sm text-gray-700">Eventos</span>
                        </Link>
                        <Link 
                            href="/financeiro" 
                            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <CurrencyCircleDollar size={32} className="text-gray-600 mb-2" weight="regular" />
                            <span className="text-sm text-gray-700">Financeiro</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Sections - 2 columns: User Types | Age Groups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Types */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">Tipos de Utilizador</h3>
                    </div>
                    <div className="p-6">
                        {userTypes.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Nenhum tipo de utilizador configurado
                            </p>
                        ) : (
                            <div className="space-y-0">
                                {userTypes.map((type) => (
                                    <div 
                                        key={type.id} 
                                        className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{type.name}</div>
                                            {type.description && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {type.description}
                                                </div>
                                            )}
                                        </div>
                                        {type.active && (
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                Ativo
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Age Groups */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">Escalões</h3>
                    </div>
                    <div className="p-6">
                        {ageGroups.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Nenhum escalão configurado
                            </p>
                        ) : (
                            <div className="space-y-0">
                                {ageGroups.map((group) => (
                                    <div 
                                        key={group.id} 
                                        className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                                    >
                                        <div className="font-medium text-gray-900">{group.name}</div>
                                        <div className="text-sm text-gray-600">
                                            {group.min_age} - {group.max_age} anos
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
