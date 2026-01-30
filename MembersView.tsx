import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { User } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserList } from '@/components/UserList';
import { UserProfile } from '@/components/UserProfile';
import { generateMemberNumber, createEmptyUser } from '@/lib/user-helpers';
import { MembersDashboardTab } from '@/components/tabs/members/MembersDashboardTab';
import { ChartLineUp, Users as UsersIcon } from '@phosphor-icons/react';

type View = 'dashboard' | 'list' | 'profile' | 'new';

interface NavigationContext {
  eventId?: string;
  convocatoriaId?: string;
  tab?: string;
}

interface MembersViewProps {
  onNavigate?: (view: string, context?: NavigationContext) => void;
}

export function MembersView({ onNavigate }: MembersViewProps) {
  const [users, setUsers] = useKV<User[]>('club-users', []);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUser] = useKV<User | null>('authenticated-user', null);

  const isAdmin = currentUser?.perfil === 'admin';
  const usersList = users || [];
  const selectedUser = usersList.find(u => u.id === selectedUserId);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('profile');
  };

  const handleNavigateToUser = (userId: string) => {
    const user = usersList.find(u => u.id === userId);
    console.log('🔍 [MembersView] Navegando para usuário:', { 
      userId, 
      userName: user?.nome_completo, 
      currentView,
      currentSelectedUserId: selectedUserId 
    });
    
    if (user) {
      console.log('✅ [MembersView] Usuário encontrado, atualizando estado...');
      setSelectedUserId(userId);
      setCurrentView('profile');
      console.log('✅ [MembersView] Estado atualizado - novo selectedUserId:', userId);
      
      setTimeout(() => {
        console.log('🔍 [MembersView] Verificando estado após atualização:', {
          selectedUserId,
          currentView,
          targetUserId: userId
        });
      }, 100);
    } else {
      console.error('❌ [MembersView] Usuário não encontrado:', userId);
    }
  };

  const handleCreateUser = () => {
    const newUser: User = {
      ...createEmptyUser(),
      id: crypto.randomUUID(),
      numero_socio: generateMemberNumber(usersList),
    };
    setUsers(currentUsers => [...(currentUsers || []), newUser]);
    setSelectedUserId(newUser.id);
    setCurrentView('new');
  };

  const handleSaveUser = (updatedUser: User) => {
    setUsers(currentUsers => {
      const currentList = currentUsers || [];
      const userIndex = currentList.findIndex(u => u.id === updatedUser.id);
      if (userIndex >= 0) {
        let newUsers = [...currentList];
        const oldUser = newUsers[userIndex];
        newUsers[userIndex] = updatedUser;
        
        if (updatedUser.encarregado_educacao && updatedUser.encarregado_educacao.length > 0) {
          updatedUser.encarregado_educacao.forEach(guardianId => {
            const guardianIndex = newUsers.findIndex(u => u.id === guardianId);
            if (guardianIndex >= 0) {
              const guardian = newUsers[guardianIndex];
              const educandos = guardian.educandos || [];
              if (!educandos.includes(updatedUser.id)) {
                newUsers[guardianIndex] = {
                  ...guardian,
                  educandos: [...educandos, updatedUser.id],
                };
              }
            }
          });
        }
        
        const removedGuardians = (oldUser.encarregado_educacao || []).filter(
          gId => !(updatedUser.encarregado_educacao || []).includes(gId)
        );
        removedGuardians.forEach(guardianId => {
          const guardianIndex = newUsers.findIndex(u => u.id === guardianId);
          if (guardianIndex >= 0) {
            const guardian = newUsers[guardianIndex];
            newUsers[guardianIndex] = {
              ...guardian,
              educandos: (guardian.educandos || []).filter(eId => eId !== updatedUser.id),
            };
          }
        });
        
        if (updatedUser.educandos && updatedUser.educandos.length > 0) {
          updatedUser.educandos.forEach(educandoId => {
            const educandoIndex = newUsers.findIndex(u => u.id === educandoId);
            if (educandoIndex >= 0) {
              const educando = newUsers[educandoIndex];
              const guardians = educando.encarregado_educacao || [];
              if (!guardians.includes(updatedUser.id)) {
                newUsers[educandoIndex] = {
                  ...educando,
                  encarregado_educacao: [...guardians, updatedUser.id],
                };
              }
            }
          });
        }
        
        const removedEducandos = (oldUser.educandos || []).filter(
          eId => !(updatedUser.educandos || []).includes(eId)
        );
        removedEducandos.forEach(educandoId => {
          const educandoIndex = newUsers.findIndex(u => u.id === educandoId);
          if (educandoIndex >= 0) {
            const educando = newUsers[educandoIndex];
            newUsers[educandoIndex] = {
              ...educando,
              encarregado_educacao: (educando.encarregado_educacao || []).filter(
                gId => gId !== updatedUser.id
              ),
            };
          }
        });
        
        return newUsers;
      }
      return currentList;
    });
  };

  const handleBack = () => {
    setSelectedUserId(null);
    setCurrentView('dashboard');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(currentUsers => {
      const currentList = currentUsers || [];
      return currentList.filter(u => u.id !== userId);
    });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
      {currentView === 'dashboard' && (
        <Tabs value="dashboard" onValueChange={(value) => setCurrentView(value as View)} className="w-full">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Membros</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Visão geral e gestão de todos os membros do clube
            </p>
          </div>

          <TabsList className="grid w-full grid-cols-2 h-auto gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs px-2 py-1.5">
              <ChartLineUp size={14} />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1.5 text-xs px-2 py-1.5">
              <UsersIcon size={14} />
              <span>Lista de Membros</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-3">
            <MembersDashboardTab />
          </TabsContent>

          <TabsContent value="list" className="mt-3">
            <UserList
              users={usersList}
              onSelectUser={handleSelectUser}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
              isAdmin={isAdmin}
            />
          </TabsContent>
        </Tabs>
      )}

      {currentView === 'list' && (
        <UserList
          users={usersList}
          onSelectUser={handleSelectUser}
          onCreateUser={handleCreateUser}
          onDeleteUser={handleDeleteUser}
          isAdmin={isAdmin}
        />
      )}

      {(currentView === 'profile' || currentView === 'new') && selectedUser && (
        <UserProfile
          key={`user-profile-${selectedUserId}`}
          user={selectedUser}
          allUsers={usersList}
          onBack={handleBack}
          onSave={handleSaveUser}
          isAdmin={isAdmin}
          onNavigateToUser={handleNavigateToUser}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
