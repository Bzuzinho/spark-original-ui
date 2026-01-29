import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useUserTypes, useAgeGroups } from '@/hooks/useApi';

export default function Dashboard() {
    const { data: userTypes = [], isLoading: loadingTypes } = useUserTypes();
    const { data: ageGroups = [], isLoading: loadingGroups } = useAgeGroups();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-semibold mb-4">
                                Welcome to BSCN Gestão!
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {/* User Types Card */}
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">Tipos de Membro</h4>
                                    {loadingTypes ? (
                                        <p className="text-gray-500">Carregando...</p>
                                    ) : userTypes.length > 0 ? (
                                        <ul className="space-y-2">
                                            {userTypes.map((type: any) => (
                                                <li key={type.id} className="flex items-center justify-between">
                                                    <span>{type.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {type.active ? '✓ Ativo' : '✗ Inativo'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">Nenhum tipo de membro configurado</p>
                                    )}
                                </div>

                                {/* Age Groups Card */}
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">Escalões</h4>
                                    {loadingGroups ? (
                                        <p className="text-gray-500">Carregando...</p>
                                    ) : ageGroups.length > 0 ? (
                                        <ul className="space-y-2">
                                            {ageGroups.map((group: any) => (
                                                <li key={group.id} className="flex items-center justify-between">
                                                    <span>{group.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {group.min_age && group.max_age 
                                                            ? `${group.min_age}-${group.max_age} anos`
                                                            : 'Sem limite'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">Nenhum escalão configurado</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    🎉 <strong>Migração Spark → Laravel em progresso!</strong>
                                    <br />
                                    PostgreSQL conectado, API funcionais, React Query configurado.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
