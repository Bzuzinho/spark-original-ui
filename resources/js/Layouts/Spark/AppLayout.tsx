import { PropsWithChildren } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  Users,
  CalendarBlank,
  Trophy,
  ShoppingCart,
  CurrencyCircleDollar,
  Handshake,
  MegaphoneSimple,
  House,
  Gear,
  SignOut,
  Envelope
} from '@phosphor-icons/react';

const mainMenuItems = [
  { id: 'dashboard', label: 'Início', icon: House, href: '/dashboard' },
  { id: 'members', label: 'Membros', icon: Users, href: '/membros' },
  { id: 'sports', label: 'Desportivo', icon: Trophy, href: '/desportivo' },
  { id: 'events', label: 'Eventos', icon: CalendarBlank, href: '/eventos' },
  { id: 'financial', label: 'Financeiro', icon: CurrencyCircleDollar, href: '/financeiro' },
  { id: 'inventory', label: 'Loja', icon: ShoppingCart, href: '/loja' },
  { id: 'sponsors', label: 'Patrocínios', icon: Handshake, href: '/patrocinios' },
  { id: 'communication', label: 'Comunicação', icon: Envelope, href: '/comunicacao' },
  { id: 'marketing', label: 'Marketing', icon: MegaphoneSimple, href: '/marketing' },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const { url, auth } = usePage<any>().props;

    const handleLogout = () => {
        router.post('/logout');
    };

    const getUserInitials = () => {
        if (!auth?.user?.name) return 'A';
        const names = auth.user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return auth.user.name[0].toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 border-r border-gray-200">
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                                BC
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">BSCN</h2>
                                <p className="text-sm text-gray-500">Gestão de Clube</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Menu */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3">
                        {mainMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = url === item.href;
                            
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 mb-1 rounded-lg
                                        transition-colors duration-200
                                        ${isActive 
                                            ? 'bg-yellow-400 text-gray-900 font-medium shadow-sm' 
                                            : 'text-gray-700 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                        
                        {/* Separator */}
                        <div className="my-4 border-t border-gray-200"></div>
                        
                        {/* Settings */}
                        <Link
                            href="/settings"
                            className={`
                                flex items-center gap-3 px-4 py-3 mb-1 rounded-lg
                                transition-colors duration-200
                                ${url === '/settings'
                                    ? 'bg-yellow-400 text-gray-900 font-medium shadow-sm' 
                                    : 'text-gray-700 hover:bg-gray-200'
                                }
                            `}
                        >
                            <Gear size={20} />
                            <span className="font-medium">Configurações</span>
                        </Link>
                    </nav>
                    
                    {/* User Section */}
                    {auth?.user && (
                        <div className="border-t border-gray-200">
                            <div className="p-4 bg-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-medium text-sm text-white">
                                        {getUserInitials()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{auth.user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{auth.user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-300 border border-gray-300 rounded-lg transition-colors"
                                >
                                    <SignOut size={18} />
                                    <span>Sair</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
