import { ReactNode, useState, PropsWithChildren } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Users,
    CalendarBlank,
    Trophy,
    ShoppingCart,
    CurrencyCircleDollar,
    Handshake,
    MegaphoneSimple,
    House,
    List,
    X,
    Gear,
    SignOut,
    Envelope
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth: {
        user: User;
    };
}

const mainMenuItems = [
    { id: 'dashboard', label: 'Início', icon: House, route: '/dashboard' },
    { id: 'membros', label: 'Membros', icon: Users, route: '/membros' },
    { id: 'desportivo', label: 'Desportivo', icon: Trophy, route: '/desportivo' },
    { id: 'eventos', label: 'Eventos', icon: CalendarBlank, route: '/eventos' },
    { id: 'financeiro', label: 'Financeiro', icon: CurrencyCircleDollar, route: '/financeiro' },
    { id: 'inventario', label: 'Inventário', icon: ShoppingCart, route: '/inventario' },
    { id: 'patrocinios', label: 'Patrocínios', icon: Handshake, route: '/patrocinios' },
    { id: 'comunicacao', label: 'Comunicação', icon: Envelope, route: '/comunicacao' },
    { id: 'marketing', label: 'Marketing', icon: MegaphoneSimple, route: '/marketing' },
];

const settingsMenuItems = [
    { id: 'configuracoes', label: 'Configurações', icon: Gear, route: '/configuracoes' },
];

export default function AuthenticatedLayout({ 
    header, 
    children 
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const currentRoute = route().current();

    const getUserInitials = () => {
        if (!auth.user) return 'U';
        const names = auth.user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return auth.user.name[0].toUpperCase();
    };

    const handleNavigate = (routePath: string) => {
        router.visit(routePath);
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const isActive = (itemId: string) => {
        if (itemId === 'dashboard') return currentRoute === 'dashboard';
        return currentRoute?.startsWith(itemId) || false;
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border",
                "transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Logo Header */}
                    <div className="p-6 border-b border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img 
                                    src="/images/logo-cutout.png"
                                    alt="Logo BSCN" 
                                    className="h-12 w-12 object-contain"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold text-sidebar-foreground">BSCN</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Gestão de Clube</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X />
                            </Button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
                        {/* Main Menu */}
                        <div className="space-y-1 flex-1">
                            {mainMenuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.id);

                                return (
                                    <Button
                                        key={item.id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start",
                                            active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                                            !active && "hover:bg-sidebar-accent text-sidebar-foreground"
                                        )}
                                        onClick={() => handleNavigate(item.route)}
                                    >
                                        <Icon className="mr-3" size={18} weight={active ? "fill" : "regular"} />
                                        {item.label}
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Separator */}
                        <Separator className="my-4" />

                        {/* Settings Menu */}
                        <div className="space-y-1">
                            {settingsMenuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.id);

                                return (
                                    <Button
                                        key={item.id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start",
                                            active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                                            !active && "hover:bg-sidebar-accent text-sidebar-foreground"
                                        )}
                                        onClick={() => handleNavigate(item.route)}
                                    >
                                        <Icon className="mr-3" size={18} weight={active ? "fill" : "regular"} />
                                        {item.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* User Profile Footer */}
                    {auth.user && (
                        <div className="p-4 border-t border-sidebar-border">
                            <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-sidebar-foreground">{auth.user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{auth.user.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleLogout}
                            >
                                <SignOut className="mr-3" />
                                Sair
                            </Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="bg-card border-b lg:hidden">
                    <div className="p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <List />
                        </Button>
                    </div>
                </header>

                {/* Page Header (if provided) - SEM border-b */}
                {header && (
                    <header className="bg-background">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}