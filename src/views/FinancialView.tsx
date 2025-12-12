import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from '@/components/financial/DashboardTab';
import { FaturasTab } from '@/components/financial/FaturasTab';
import { MovimentosTab } from '@/components/financial/MovimentosTab';
import { BancoTab } from '@/components/financial/BancoTab';
import { RelatoriosTab } from '@/components/financial/RelatoriosTab';
import { ChartLineUp, Receipt, ArrowsDownUp, Bank, ChartBar } from '@phosphor-icons/react';

export function FinancialView() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Módulo Financeiro</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Gestão completa das finanças do clube
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-3">
        <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-5 h-9 sm:h-8 text-xs min-w-full sm:min-w-0">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
              <ChartLineUp size={16} className="sm:hidden" />
              <ChartLineUp size={14} className="hidden sm:inline" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="faturas" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
              <Receipt size={16} className="sm:hidden" />
              <Receipt size={14} className="hidden sm:inline" />
              <span>Mensalidades</span>
            </TabsTrigger>
            <TabsTrigger value="movimentos" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
              <ArrowsDownUp size={16} className="sm:hidden" />
              <ArrowsDownUp size={14} className="hidden sm:inline" />
              <span>Movimentos</span>
            </TabsTrigger>
            <TabsTrigger value="banco" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
              <Bank size={16} className="sm:hidden" />
              <Bank size={14} className="hidden sm:inline" />
              <span>Banco</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
              <ChartBar size={16} className="sm:hidden" />
              <ChartBar size={14} className="hidden sm:inline" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="faturas">
          <FaturasTab />
        </TabsContent>

        <TabsContent value="movimentos">
          <MovimentosTab />
        </TabsContent>

        <TabsContent value="banco">
          <BancoTab />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
