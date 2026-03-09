import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EventosShowPage() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Eventos - Show</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">Em desenvolvimento</p>
                </div>
            }
        >
            <Head title="Eventos - Show" />

            <div className="p-4 sm:p-6">
                <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                    Pagina Eventos (Show) em desenvolvimento.
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
