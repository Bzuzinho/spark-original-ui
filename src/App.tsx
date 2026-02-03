import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Layout } from '@/components/Layout';
import { LoginView } from '@/views/LoginView';
import { HomeView } from '@/views/HomeView';
import { MembersView } from '@/views/MembersView';
import { SportsView } from '@/views/SportsView';
import { EventsView } from '@/views/EventsView';
import { FinancialView } from '@/views/FinancialView';
import { LojaView } from '@/views/LojaView';
import { SponsorsView } from '@/views/SponsorsView';
import { MarketingView } from '@/views/MarketingView';
import { CommunicationView } from '@/views/CommunicationView';
import { SettingsView } from '@/views/SettingsView';
import { Toaster } from '@/components/ui/sonner';
import { DiagnosticOverlay } from '@/components/DiagnosticOverlay';
import { authenticateUser } from '@/lib/auth';
import type { User } from '@/lib/types';
import { toast } from 'sonner';

declare const spark: {
  kv: {
    get: <T>(key: string) => Promise<T | undefined>;
    set: <T>(key: string, value: T) => Promise<void>;
  };
};

type ViewType = 'home' | 'members' | 'sports' | 'events' | 'financial' | 'loja' | 'sponsors' | 'marketing' | 'communication' | 'settings';

interface NavigationContext {
  eventId?: string;
  convocatoriaId?: string;
  tab?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [navigationContext, setNavigationContext] = useState<NavigationContext>({});
  const [currentUser, setCurrentUser] = useKV<User | null>('authenticated-user', null);
  const [users, setUsers] = useKV<User[]>('club-users', []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  useEffect(() => {
    const initializeAdmin = async () => {
      const storedUsers = await spark.kv.get<User[]>('club-users');
      const currentUsers = storedUsers || [];
      const adminBscnExists = currentUsers.some(u => u.email_utilizador === 'admin@bscn.pt');
      const adminBeneditaExists = currentUsers.some(u => u.email_utilizador === 'admin@benedita.pt');
      
      let updatedUsers = [...currentUsers];
      let hasChanges = false;
      
      if (!adminBscnExists && currentUsers.length === 0) {
        const adminUser: User = {
          id: crypto.randomUUID(),
          numero_socio: '2025-0001',
          nome_completo: 'Administrador',
          email_utilizador: 'admin@bscn.pt',
          senha: 'password123',
          perfil: 'admin',
          tipo_membro: [],
          estado: 'ativo',
          data_nascimento: '1990-01-01',
          menor: false,
          sexo: 'masculino',
          rgpd: true,
          consentimento: true,
          afiliacao: true,
          declaracao_de_transporte: true,
          ativo_desportivo: false,
        };
        updatedUsers.push(adminUser);
        hasChanges = true;
      }
      
      if (!adminBeneditaExists) {
        const adminBeneditaUser: User = {
          id: crypto.randomUUID(),
          numero_socio: '2025-0002',
          nome_completo: 'Administrador Benedita',
          email_utilizador: 'admin@benedita.pt',
          senha: 'benedita2025',
          perfil: 'admin',
          tipo_membro: [],
          estado: 'ativo',
          data_nascimento: '1990-01-01',
          menor: false,
          sexo: 'masculino',
          rgpd: true,
          consentimento: true,
          afiliacao: true,
          declaracao_de_transporte: true,
          ativo_desportivo: false,
        };
        updatedUsers.push(adminBeneditaUser);
        hasChanges = true;
      } else {
        const adminIndex = updatedUsers.findIndex(u => u.email_utilizador === 'admin@benedita.pt');
        if (adminIndex !== -1) {
          updatedUsers[adminIndex] = {
            ...updatedUsers[adminIndex],
            senha: 'benedita2025'
          };
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        await spark.kv.set('club-users', updatedUsers);
        setUsers(() => updatedUsers);
      }
    };

    const initializeUserTypes = async () => {
      const userTypes = await spark.kv.get('settings-user-types');
      if (!userTypes || (Array.isArray(userTypes) && userTypes.length === 0)) {
        await spark.kv.set('settings-user-types', [
          {
            id: crypto.randomUUID(),
            name: 'Atleta',
            description: 'Membro praticante de modalidades desportivas',
          },
          {
            id: crypto.randomUUID(),
            name: 'Encarregado de Educação',
            description: 'Responsável legal por atletas menores',
          },
          {
            id: crypto.randomUUID(),
            name: 'Treinador',
            description: 'Responsável técnico pelo treino de atletas',
          },
          {
            id: crypto.randomUUID(),
            name: 'Dirigente',
            description: 'Membro da direção do clube',
          },
          {
            id: crypto.randomUUID(),
            name: 'Sócio',
            description: 'Membro associado do clube',
          },
          {
            id: crypto.randomUUID(),
            name: 'Funcionário',
            description: 'Colaborador do clube',
          },
        ]);
      }
    };

    const migrateUserTypes = async () => {
      const storedUsers = await spark.kv.get<User[]>('club-users');
      if (!storedUsers || storedUsers.length === 0) return;

      let needsUpdate = false;
      const updatedUsers = storedUsers.map(user => {
        if (user.tipo_membro.includes('socio' as any)) {
          needsUpdate = true;
          return {
            ...user,
            tipo_membro: user.tipo_membro.filter(t => t !== 'socio') as any
          };
        }
        return user;
      });

      if (needsUpdate) {
        await spark.kv.set('club-users', updatedUsers);
        setUsers(() => updatedUsers);
      }
    };

    const migrateEscaloesToIds = async () => {
      const storedUsers = await spark.kv.get<User[]>('club-users');
      const ageGroups = await spark.kv.get<any[]>('settings-age-groups');
      
      if (!storedUsers || !ageGroups || storedUsers.length === 0 || ageGroups.length === 0) return;

      let needsUpdate = false;
      const updatedUsers = storedUsers.map(user => {
        if (!user.escalao || user.escalao.length === 0) return user;
        
        const currentEscalao = user.escalao[0];
        const escalaoObj = ageGroups.find(e => e.name === currentEscalao);
        
        if (escalaoObj && escalaoObj.id !== currentEscalao) {
          needsUpdate = true;
          return {
            ...user,
            escalao: [escalaoObj.id]
          };
        }
        
        return user;
      });

      if (needsUpdate) {
        await spark.kv.set('club-users', updatedUsers);
        setUsers(() => updatedUsers);
      }
    };

    const initializeFinancialData = async () => {
      const mensalidades = await spark.kv.get('club-mensalidades');
      if (!mensalidades) {
        await spark.kv.set('club-mensalidades', [
          {
            id: crypto.randomUUID(),
            designacao: 'Mensalidade Infantil',
            valor: 30,
            ativo: true,
            created_at: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            designacao: 'Mensalidade Juvenil',
            valor: 35,
            ativo: true,
            created_at: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            designacao: 'Mensalidade Sénior',
            valor: 40,
            ativo: true,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      const centrosCusto = await spark.kv.get('club-centros-custo');
      if (!centrosCusto) {
        await spark.kv.set('club-centros-custo', [
          {
            id: crypto.randomUUID(),
            nome: 'Geral do Clube',
            tipo: 'departamento' as const,
            ativo: true,
            created_at: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            nome: 'Escalão Infantil',
            tipo: 'equipa' as const,
            ativo: true,
            created_at: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            nome: 'Escalão Juvenil',
            tipo: 'equipa' as const,
            ativo: true,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    };
    
    initializeAdmin();
    initializeUserTypes();
    initializeFinancialData();
    migrateUserTypes();
    migrateEscaloesToIds();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const currentUsers = await spark.kv.get<User[]>('club-users');
    const user = await authenticateUser(email, password, currentUsers || []);
    
    if (user) {
      setCurrentUser(() => user);
      setIsAuthenticated(true);
      toast.success(`Bem-vindo, ${user.nome_completo}!`);
    } else {
      toast.error('Email ou palavra-passe incorretos');
    }
  };

  const handleLogout = () => {
    setCurrentUser(() => null);
    setIsAuthenticated(false);
    setCurrentView('home');
    toast.success('Sessão terminada com sucesso');
  };

  const handleNavigate = (view: string, context?: NavigationContext) => {
    setCurrentView(view as ViewType);
    setNavigationContext(context || {});
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} />;
      case 'members':
        return <MembersView onNavigate={handleNavigate} />;
      case 'sports':
        return <SportsView onNavigate={handleNavigate} />;
      case 'events':
        return <EventsView navigationContext={navigationContext} onClearContext={() => setNavigationContext({})} />;
      case 'financial':
        return <FinancialView />;
      case 'loja':
        return <LojaView />;
      case 'sponsors':
        return <SponsorsView />;
      case 'marketing':
        return <MarketingView />;
      case 'communication':
        return <CommunicationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginView onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Layout 
        currentView={currentView} 
        onNavigate={handleNavigate}
        currentUser={currentUser || null}
        onLogout={handleLogout}
      >
        {renderView()}
      </Layout>
      <Toaster />
      <DiagnosticOverlay />
    </>
  );
}

export default App;