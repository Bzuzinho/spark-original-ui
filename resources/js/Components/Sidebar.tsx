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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <span className="font-bold text-xl">BC</span>
                    </div>
                    <div>
                        <div className="font-bold text-lg">BSCN</div>
                        <div className="text-sm text-muted-foreground">Gestão de Clube</div>
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
                                            ? 'bg-primary text-primary-foreground font-medium' 
                                            : 'hover:bg-muted'
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
            <div className="border-t">
                {/* Configurações */}
                <Link
                    href="/settings"
                    className={`
                        flex items-center gap-3 px-7 py-3
                        transition-colors duration-200
                        ${isActive('/settings')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }
                    `}
                >
                    <Gear size={20} />
                    <span>Configurações</span>
                </Link>

                {/* User Section */}
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <span className="text-sm font-medium">
                                {auth?.user?.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                                {auth?.user?.name || 'Administrador'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {auth?.user?.email || 'admin@bscn.pt'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sair */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-7 py-3 hover:bg-muted transition-colors"
                >
                    <SignOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
