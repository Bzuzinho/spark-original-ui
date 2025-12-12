import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, X } from '@phosphor-icons/react';
import { PersonalTab } from './tabs/PersonalTab';
import { FinancialTab } from './tabs/FinancialTab';
import { SportsTab } from './tabs/SportsTab';
import { ConfigurationTab } from './tabs/ConfigurationTab';
import { toast } from 'sonner';

interface NavigationContext {
  eventId?: string;
  convocatoriaId?: string;
  tab?: string;
}

interface UserProfileProps {
  user: User;
  allUsers: User[];
  onBack: () => void;
  onSave: (user: User) => void;
  isAdmin: boolean;
  onNavigateToUser?: (userId: string) => void;
  onNavigate?: (view: string, context?: NavigationContext) => void;
}

export function UserProfile({ user: initialUser, allUsers, onBack, onSave, isAdmin, onNavigateToUser, onNavigate }: UserProfileProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    console.log('🔄 UserProfile recebeu novo initialUser:', initialUser.nome_completo, initialUser.id);
    setUser(initialUser);
    setHasChanges(false);
  }, [initialUser, initialUser.id]);

  const handleChange = (field: keyof User, value: any) => {
    setUser(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'encarregado_educacao' && value && value.length > 0) {
        const guardianId = value[0];
        const updatedUsers = allUsers.map(u => {
          if (u.id === guardianId) {
            const educandos = u.educandos || [];
            if (!educandos.includes(user.id)) {
              return { ...u, educandos: [...educandos, user.id] };
            }
          }
          return u;
        });
      }
      
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!user.nome_completo.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!user.data_nascimento) {
      toast.error('Data de nascimento é obrigatória');
      return;
    }
    if (!user.email_utilizador.trim()) {
      toast.error('Email de utilizador é obrigatório');
      return;
    }
    if (user.tipo_membro.length === 0) {
      toast.error('Selecione pelo menos um tipo de membro');
      return;
    }

    onSave(user);
    setHasChanges(false);
    toast.success('Dados guardados com sucesso!');
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('Tem alterações não guardadas. Deseja sair sem guardar?');
      if (!confirmed) return;
    }
    onBack();
  };

  const showSportsTab = user.tipo_membro.includes('atleta');

  return (
    <div className="space-y-2" key={user.id}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight">
              {user.nome_completo || 'Novo Membro'}
            </h1>
            <p className="text-muted-foreground text-xs">
              Nº de Sócio: {user.numero_socio}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} className="h-8 text-xs">
              <X className="mr-1" size={14} />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="h-8 text-xs">
              <Check className="mr-1" size={14} />
              Guardar
            </Button>
          </div>
        )}
      </div>

      <Card className="p-2 sm:p-3">
        <Tabs defaultValue="personal" className="space-y-2" key={user.id}>
          <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-1">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-9 sm:h-8">
              <TabsTrigger value="personal" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">Pessoal</TabsTrigger>
              <TabsTrigger value="financial" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">Financeiro</TabsTrigger>
              {showSportsTab && <TabsTrigger value="sports" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">Desportivo</TabsTrigger>}
              <TabsTrigger value="configuration" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">Configuração</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal" className="space-y-2 mt-2">
            <PersonalTab
              key={user.id}
              user={user}
              allUsers={allUsers}
              onChange={handleChange}
              isAdmin={isAdmin}
              onNavigateToUser={onNavigateToUser}
            />
          </TabsContent>

          <TabsContent value="financial" className="space-y-2 mt-2">
            <FinancialTab
              user={user}
              onChange={handleChange}
              isAdmin={isAdmin}
            />
          </TabsContent>

          {showSportsTab && (
            <TabsContent value="sports" className="space-y-2 mt-2">
              <SportsTab
                user={user}
                onChange={handleChange}
                isAdmin={isAdmin}
                onNavigate={onNavigate}
              />
            </TabsContent>
          )}

          <TabsContent value="configuration" className="space-y-2 mt-2">
            <ConfigurationTab
              user={user}
              onChange={handleChange}
              isAdmin={isAdmin}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {hasChanges && (
        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-accent text-accent-foreground p-2 rounded-lg shadow-lg border">
          <p className="text-xs font-medium">Alterações não guardadas</p>
        </div>
      )}
    </div>
  );
}
