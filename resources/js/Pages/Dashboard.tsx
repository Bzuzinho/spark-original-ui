import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Users, Trophy, Calendar } from '@phosphor-icons/react';
import StatsCard from '@/Components/StatsCard';

interface Props {
    userTypes?: any[];
    ageGroups?: any[];
    stats?: {
        totalUsers: number;
        totalUserTypes: number;
        totalAgeGroups: number;
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

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Utilizadores"
                        value={stats.totalUsers}
                        icon={Users}
                        iconBgColor="#dbeafe"
                        iconColor="#2563eb"
                    />
                    <StatsCard
                        title="Tipos de Utilizador"
                        value={stats.totalUserTypes}
                        icon={Trophy}
                        iconBgColor="#dcfce7"
                        iconColor="#16a34a"
                    />
                    <StatsCard
                        title="Escalões"
                        value={stats.totalAgeGroups}
                        icon={Calendar}
                        iconBgColor="#f3e8ff"
                        iconColor="#9333ea"
                    />
                </div>
            )}

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Types */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Tipos de Utilizador</h3>
                    </div>
                    <div className="p-6">
                        {userTypes.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Nenhum tipo de utilizador configurado
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {userTypes.map((type) => (
                                    <div 
                                        key={type.id} 
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
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
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
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
                        <h3 className="text-lg font-semibold text-gray-800">Escalões</h3>
                    </div>
                    <div className="p-6">
                        {ageGroups.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Nenhum escalão configurado
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {ageGroups.map((group) => (
                                    <div 
                                        key={group.id} 
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
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

            {/* Migration Status */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900">
                            Migração Spark → Laravel COMPLETA (Visual)
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Sidebar azul BSCN implementada, 9 menus principais ativos, navegação Inertia SPA funcional.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
