import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EventosIndex() {
    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Gestão de Eventos
                </h1>
            }
        >
            <Head title="Gestão de Eventos" />

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                    Módulo Gestão de Eventos em desenvolvimento.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Esta página será migrada do Spark em breve.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
