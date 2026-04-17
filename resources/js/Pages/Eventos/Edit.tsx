import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { moduleScrollableContentClass, moduleViewportClass } from '@/lib/module-layout';

export default function EventosEditPage() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Eventos - Edit</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">Em desenvolvimento</p>
                </div>
            }
        >
            <Head title="Eventos - Edit" />

            <div className={moduleViewportClass}>
                <div className={moduleScrollableContentClass}>
                    <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground sm:p-6">
                        Pagina Eventos (Edit) em desenvolvimento.
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
