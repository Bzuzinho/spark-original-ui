import { ReactNode, useState } from 'react';
import { Button } from './ui/button';
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
  User as UserIcon,
  Envelope
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import logoCutout from '@/assets/images/Logo-cutout.png';
import type { User } from '@/lib/types';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const mainMenuItems = [
  { id: 'home', label: 'Início', icon: House },
  { id: 'members', label: 'Membros', icon: Users },
  { id: 'sports', label: 'Desportivo', icon: Trophy },
  { id: 'events', label: 'Eventos', icon: CalendarBlank },
  { id: 'financial', label: 'Financeiro', icon: CurrencyCircleDollar },
  { id: 'inventory', label: 'Inventário', icon: ShoppingCart },
  { id: 'sponsors', label: 'Patrocínios', icon: Handshake },
  { id: 'communication', label: 'Comunicação', icon: Envelope },
  { id: 'marketing', label: 'Marketing', icon: MegaphoneSimple },
];

const settingsMenuItems = [
  { id: 'settings', label: 'Configurações', icon: Gear },
];

export function Layout({ children, currentView, onNavigate, currentUser, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const names = currentUser.nome_completo.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return currentUser.nome_completo[0].toUpperCase();
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
                <img 
                  src={logoCutout} 
                  alt="Logo BSCN" 
                  className="h-16 w-auto object-contain"
                />
                <div>
                  <h2 className="text-xl font-semibold">BSCN</h2>
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
          
          <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
            <div className="space-y-1 flex-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="mr-3" weight={isActive ? "fill" : "regular"} />
                    {item.label}
                  </Button>
                );
              })}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-1">
              {settingsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="mr-3" weight={isActive ? "fill" : "regular"} />
                    {item.label}
                  </Button>
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
                  <p className="text-sm font-medium truncate">{currentUser.nome_completo}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email_utilizador}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onLogout}
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
