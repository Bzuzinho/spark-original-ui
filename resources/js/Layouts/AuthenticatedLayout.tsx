import { PropsWithChildren } from 'react';
import AppLayout from './Spark/AppLayout';

export default function AuthenticatedLayout({ 
    children, 
    header 
}: PropsWithChildren<{ header?: React.ReactNode }>) {
    return (
        <AppLayout>
            {header && (
                <header className="mb-6">
                    <div className="bg-white rounded-lg shadow px-6 py-4">
                        {header}
                    </div>
                </header>
            )}
            {children}
        </AppLayout>
    );
}
