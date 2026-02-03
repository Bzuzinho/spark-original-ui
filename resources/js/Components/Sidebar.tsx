import { Link, usePage } from '@inertiajs/react';
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
    { name: 'Marketing', href: '/campanhas-marketing', icon: Megaphone },
];

export default function Sidebar() {
    const { url, auth } = usePage<any>().props;
    const currentPath = url;

    const isActive = (href: string) => currentPath === href;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-gray-800 flex flex-col border-r border-gray-200">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-gray-900 font-bold text-xl">BC</span>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-gray-900">BSCN</div>
                        <div className="text-sm text-gray-500">Gestão de Clube</div>
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
                                            ? 'bg-blue-600 text-white font-medium' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <Icon size={20} weight={active ? 'fill' : 'regular'} />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-gray-200">
                {/* Configurações */}
                <Link
                    href="/configuracoes"
                    className={`
                        flex items-center gap-3 px-7 py-3
                        transition-colors duration-200
                        ${isActive('/configuracoes')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                    `}
                >
                    <Gear size={20} />
                    <span className="text-sm">Configurações</span>
                </Link>

                {/* User Section */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            <span className="text-sm font-medium">
                                {auth?.user?.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate text-gray-900">
                                {auth?.user?.name || 'Admin'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {auth?.user?.email || 'admin@test.com'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sair */}
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-7 py-3 text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-200"
                >
                    <SignOut size={20} />
                    <span className="text-sm">Sair</span>
                </Link>
            </div>
        </aside>
    );
}