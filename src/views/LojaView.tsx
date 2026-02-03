import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EncomendasTab } from '@/components/tabs/EncomendasTab';
import { ArtigosStockTab } from '@/components/tabs/ArtigosStockTab';
import { FornecedoresTab } from '@/components/tabs/FornecedoresTab';
import { LojaDashboard } from '@/components/tabs/loja/LojaDashboard';
import { ChartLineUp, ShoppingCart, Package, Users } from '@phosphor-icons/react';

export function LojaView() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Loja</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Encomendas, artigos e fornecedores
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm gap-1.5 py-2">
            <ChartLineUp size={16} />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="encomendas" className="text-xs sm:text-sm gap-1.5 py-2">
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Encomendas</span>
            <span className="sm:hidden">Enc.</span>
          </TabsTrigger>
          <TabsTrigger value="artigos" className="text-xs sm:text-sm gap-1.5 py-2">
            <Package size={16} />
            <span className="hidden sm:inline">Artigos & Stock</span>
            <span className="sm:hidden">Artigos</span>
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="text-xs sm:text-sm gap-1.5 py-2">
            <Users size={16} />
            <span className="hidden sm:inline">Fornecedores</span>
            <span className="sm:hidden">Forn.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-3">
          <LojaDashboard />
        </TabsContent>

        <TabsContent value="encomendas" className="mt-3">
          <EncomendasTab />
        </TabsContent>

        <TabsContent value="artigos" className="mt-3">
          <ArtigosStockTab />
        </TabsContent>

        <TabsContent value="fornecedores" className="mt-3">
          <FornecedoresTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
