import { AppLayout } from '@/Layouts/Spark/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Users, Trophy } from '@phosphor-icons/react';

interface UserType {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

interface AgeGroup {
  id: number;
  name: string;
  min_age?: number;
  max_age?: number;
  sexo?: string;
}

interface DashboardProps {
  userTypes: UserType[];
  ageGroups: AgeGroup[];
  stats?: {
    totalUsers?: number;
    activeUsers?: number;
    totalGroups?: number;
  };
}

export default function Dashboard({ userTypes, ageGroups, stats }: DashboardProps) {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao sistema de gestão BSCN
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Utilizadores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Utilizadores Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" weight="fill" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Escalões</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGroups || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Types Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Tipos de Utilizador</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTypes && userTypes.length > 0 ? (
              userTypes.map((type) => (
                <Card key={type.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{type.name}</span>
                      {type.active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  {type.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum tipo de utilizador encontrado
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Age Groups Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Escalões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ageGroups && ageGroups.length > 0 ? (
              ageGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(group.min_age || group.max_age) && (
                      <p className="text-sm text-muted-foreground">
                        Idade: {group.min_age || 0} - {group.max_age || '∞'} anos
                      </p>
                    )}
                    {group.sexo && (
                      <p className="text-sm text-muted-foreground">
                        Sexo: {group.sexo === 'M' ? 'Masculino' : group.sexo === 'F' ? 'Feminino' : 'Misto'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum escalão encontrado
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
