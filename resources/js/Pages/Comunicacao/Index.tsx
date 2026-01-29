import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ComunicacaoIndex() {
    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Comunicação
                </h1>
            }
        >
            <Head title="Comunicação" />

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                    Módulo Comunicação em desenvolvimento.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Esta página será migrada do Spark em breve.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
