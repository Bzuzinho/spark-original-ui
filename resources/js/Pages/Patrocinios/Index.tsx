import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PatrociniosIndex() {
    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Gestão de Patrocínios
                </h1>
            }
        >
            <Head title="Gestão de Patrocínios" />

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                    Módulo Gestão de Patrocínios em desenvolvimento.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Esta página será migrada do Spark em breve.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
