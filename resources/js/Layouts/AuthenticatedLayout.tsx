import { PropsWithChildren, ReactNode } from 'react';
import Sidebar from '@/Components/Sidebar';

export default function AuthenticatedLayout({ 
    children, 
    header 
}: PropsWithChildren<{ header?: ReactNode }>) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content - offset pela sidebar 256px */}
            <div className="ml-64">
                <main className="p-8">
                    {header && (
                        <header className="mb-6">
                            {header}
                        </header>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}