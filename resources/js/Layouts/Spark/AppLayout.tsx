import { PropsWithChildren } from 'react';
import Sidebar from '@/Components/Sidebar';

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content - offset by sidebar width (256px = w-64) */}
            <div className="ml-64">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
