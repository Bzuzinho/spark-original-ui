import { ReactNode, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/Components/UI/button';
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
import { Separator } from '@/Components/UI/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/UI/avatar';
import type { User } from '@/types';

interface LayoutProps {
  children: ReactNode;
}

const mainMenuItems = [
  { id: 'dashboard', label: 'Início', icon: House, route: 'dashboard' },
  { id: 'members', label: 'Membros', icon: Users, route: 'dashboard' },
  { id: 'sports', label: 'Desportivo', icon: Trophy, route: 'dashboard' },
  { id: 'events', label: 'Eventos', icon: CalendarBlank, route: 'dashboard' },
  { id: 'financial', label: 'Financeiro', icon: CurrencyCircleDollar, route: 'dashboard' },
  { id: 'inventory', label: 'Inventário', icon: ShoppingCart, route: 'dashboard' },
  { id: 'sponsors', label: 'Patrocínios', icon: Handshake, route: 'dashboard' },
  { id: 'communication', label: 'Comunicação', icon: Envelope, route: 'dashboard' },
  { id: 'marketing', label: 'Marketing', icon: MegaphoneSimple, route: 'dashboard' },
];

const settingsMenuItems = [
  { id: 'settings', label: 'Configurações', icon: Gear, route: 'dashboard' },
];

export function AppLayout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { auth, url } = usePage<any>().props;
  const currentUser = auth?.user as User | undefined;
  
  const handleLogout = () => {
    router.post(route('logout'));
  };

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const name = currentUser.nome_completo || currentUser.name || '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">BC</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">BSCN</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Gestão de Clube</p>
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
          
          <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
            <div className="space-y-1 flex-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = url === route(item.route);
                
                return (
                  <Link
                    key={item.id}
                    href={route(item.route)}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3" weight={isActive ? "fill" : "regular"} size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-1">
              {settingsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = url === route(item.route);
                
                return (
                  <Link
                    key={item.id}
                    href={route(item.route)}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3" weight={isActive ? "fill" : "regular"} size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {currentUser && (
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.foto_perfil} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentUser.nome_completo || currentUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser.email_utilizador || currentUser.email}
                  </p>
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
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b p-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <List />
          </Button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
