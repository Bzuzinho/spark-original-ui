import { User } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DadosDesportivosTab } from './sports-member/DadosDesportivosTab';
import { ConvocatoriasTab } from './sports-member/ConvocatoriasTab';
import { RegistoPresencasTab } from './sports-member/RegistoPresencasTab';
import { ResultadosTab } from './sports-member/ResultadosTab';
import { TreinosTab } from './sports-member/TreinosTab';
import { PlaneamentoTab } from './sports-member/PlaneamentoTab';

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
  if (!user.tipo_membro.includes('atleta')) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">
          Esta secção está disponível apenas para membros do tipo Atleta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Tabs defaultValue="dados" className="space-y-2">
        <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-9">
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
        </div>

        <TabsContent value="dados" className="mt-2">
          <DadosDesportivosTab user={user} onChange={onChange} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="convocatorias" className="mt-2">
          <ConvocatoriasTab user={user} onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="presencas" className="mt-2">
          <RegistoPresencasTab user={user} />
        </TabsContent>

        <TabsContent value="resultados" className="mt-2">
          <ResultadosTab user={user} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="treinos" className="mt-2">
          <TreinosTab user={user} />
        </TabsContent>

        <TabsContent value="planeamento" className="mt-2">
          <PlaneamentoTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
