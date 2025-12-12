import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from '@/components/tabs/sports/DashboardTab';
import { PlaneamentoTab } from '@/components/tabs/sports/PlaneamentoTab';
import { TreinosTab } from '@/components/tabs/sports/TreinosTab';
import { PresencasTab } from '@/components/tabs/sports/PresencasTab';
import { CompeticoesTab } from '@/components/tabs/sports/CompeticoesTab';
import { RelatoriosTab } from '@/components/tabs/sports/RelatoriosTab';

interface SportsViewProps {
  onNavigate?: (view: string, context?: any) => void;
}

export function SportsView({ onNavigate }: SportsViewProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão Desportiva</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Planeamento de treinos, eventos e acompanhamento de atletas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="dashboard" className="text-xs px-2 py-1.5">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="planeamento" className="text-xs px-2 py-1.5">
            Planeamento
          </TabsTrigger>
          <TabsTrigger value="treinos" className="text-xs px-2 py-1.5">
            Treinos
          </TabsTrigger>
          <TabsTrigger value="presencas" className="text-xs px-2 py-1.5">
            Presenças
          </TabsTrigger>
          <TabsTrigger value="competicoes" className="text-xs px-2 py-1.5">
            Competições
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs px-2 py-1.5">
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-3">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="planeamento" className="mt-3">
          <PlaneamentoTab />
        </TabsContent>

        <TabsContent value="treinos" className="mt-3">
          <TreinosTab onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="presencas" className="mt-3">
          <PresencasTab onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="competicoes" className="mt-3">
          <CompeticoesTab onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-3">
          <RelatoriosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
