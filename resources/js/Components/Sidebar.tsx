import { Link, usePage, router } from '@inertiajs/react';
import { 
    House, 
    Users, 
    Trophy, 
    Calendar, 
    CurrencyDollar, 
    ShoppingCart, 
    Handshake, 
    EnvelopeSimple, 
    Megaphone,
    Gear,
    SignOut
} from '@phosphor-icons/react';

interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const mainMenuItems: MenuItem[] = [
    { name: 'Início', href: '/dashboard', icon: House },
    { name: 'Membros', href: '/membros', icon: Users },
    { name: 'Desportivo', href: '/desportivo', icon: Trophy },
    { name: 'Eventos', href: '/eventos', icon: Calendar },
    { name: 'Financeiro', href: '/financeiro', icon: CurrencyDollar },
    { name: 'Loja', href: '/loja', icon: ShoppingCart },
    { name: 'Patrocínios', href: '/patrocinios', icon: Handshake },
    { name: 'Comunicação', href: '/comunicacao', icon: EnvelopeSimple },
    { name: 'Marketing', href: '/marketing', icon: Megaphone },
];

export default function Sidebar() {
    const { url, auth } = usePage<any>().props;
    const currentPath = url;

    const isActive = (href: string) => currentPath === href;
    
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-blue-600 text-white flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-blue-500">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xl">BC</span>
                    </div>
                    <div>
                        <div className="font-bold text-lg">BSCN</div>
                        <div className="text-sm text-blue-200">Gestão de Clube</div>
                    </div>
                </div>
            </div>

            {/* Main Menu */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {mainMenuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg
                                        transition-colors duration-200
                                        ${active 
                                            ? 'bg-blue-700 text-white font-medium' 
                                            : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon size={20} weight={active ? 'fill' : 'regular'} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-blue-500">
                {/* Configurações */}
                <Link
                    href="/settings"
                    className={`
                        flex items-center gap-3 px-7 py-3
                        transition-colors duration-200
                        ${isActive('/settings')
                            ? 'bg-blue-700 text-white'
                            : 'text-blue-100 hover:bg-blue-500'
                        }
                    `}
                >
                    <Gear size={20} />
                    <span>Configurações</span>
                </Link>

                {/* User Section */}
                <div className="p-4 bg-blue-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center">
                            <span className="text-sm font-medium">
                                {auth?.user?.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                                {auth?.user?.name || 'Administrador'}
                            </div>
                            <div className="text-xs text-blue-200 truncate">
                                {auth?.user?.email || 'admin@bscn.pt'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sair */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-7 py-3 text-blue-100 hover:bg-blue-500 transition-colors"
                >
                    <SignOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
