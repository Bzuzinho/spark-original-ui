import { User } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { DadosDesportivosTab } from './Sports/DadosDesportivosTab';
import { ConvocatoriasTab } from './Sports/ConvocatoriasTab';
import { RegistoPresencasTab } from './Sports/RegistoPresencasTab';
import { ResultadosTab } from './Sports/ResultadosTab';
import { TreinosTab } from './Sports/TreinosTab';
import { PlaneamentoTab } from './Sports/PlaneamentoTab';

interface NavigationContext {
  eventId?: string;
  convocatoriaId?: string;
  tab?: string;
}

interface SportsTabProps {
  user: User;
  onChange: (field: keyof User, value: any) => void;
  isAdmin: boolean;
  onNavigate?: (view: string, context?: NavigationContext) => void;
}

export function SportsTab({ user, onChange, isAdmin, onNavigate }: SportsTabProps) {
  if (!user.tipo_membro?.includes('atleta')) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">
          Esta secção está disponível apenas para membros do tipo Atleta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Tabs defaultValue="dados" className="space-y-1">
        <TabsList className="h-8 bg-slate-200">
          <TabsTrigger value="dados" className="whitespace-nowrap text-xs px-3 py-1">
            Dados Desportivos
          </TabsTrigger>
          <TabsTrigger value="convocatorias" className="whitespace-nowrap text-xs px-3 py-1">
            Convocatórias
          </TabsTrigger>
          <TabsTrigger value="presencas" className="whitespace-nowrap text-xs px-3 py-1">
            Registo Presenças
          </TabsTrigger>
          <TabsTrigger value="resultados" className="whitespace-nowrap text-xs px-3 py-1">
            Resultados
          </TabsTrigger>
          <TabsTrigger value="treinos" className="whitespace-nowrap text-xs px-3 py-1">
            Treinos
          </TabsTrigger>
          <TabsTrigger value="planeamento" className="whitespace-nowrap text-xs px-3 py-1">
            Planeamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-1 bg-white p-0 rounded-lg border border-white">
          <DadosDesportivosTab user={user} onChange={onChange} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="convocatorias" className="mt-1 bg-white p-0 rounded-lg border border-white">
          <ConvocatoriasTab user={user} onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="presencas" className="mt-1 bg-white p-0 rounded-lg border border-white">
          <RegistoPresencasTab user={user} />
        </TabsContent>

        <TabsContent value="resultados" className="mt-1 bg-white p-0 rounded-lg border border-white">
          <ResultadosTab user={user} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="treinos" className="mt-1 bg-white p-0 rounded-lg border border-white">
          <TreinosTab user={user} />
        </TabsContent>

        <TabsContent value="planeamento" className="mt-1 bg-white p-0 rounded-lg border border-white">
          <PlaneamentoTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
