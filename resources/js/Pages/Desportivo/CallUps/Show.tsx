import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DesportivoConvocatoriasShowPage() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Desportivo - Convocatorias - Show</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">Em desenvolvimento</p>
                </div>
            }
        >
            <Head title="Desportivo - Convocatorias - Show" />

            <div className="p-4 sm:p-6">
                <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                    Pagina Desportivo - Convocatorias (Show) em desenvolvimento.
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
