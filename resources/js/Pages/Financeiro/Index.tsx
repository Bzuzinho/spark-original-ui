import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ChartLineUp, Receipt, ArrowsDownUp, Bank, ChartBar } from '@phosphor-icons/react';
import { DashboardTab } from './DashboardTab';
import { FaturasTab } from './FaturasTab';
import { MovimentosTab } from './MovimentosTab';
import { BancoTab } from './BancoTab';
import { RelatoriosTab } from './RelatoriosTab';
import {
  Fatura,
  FaturaItem,
  Movimento,
  MovimentoItem,
  LancamentoFinanceiro,
  ExtratoBancario,
  ConciliacaoMapa,
  CentroCusto,
  User,
  Product,
  MonthlyFee,
  AgeGroup,
  InvoiceType,
} from './types';

interface Props {
  faturas: Fatura[];
  faturaItens: FaturaItem[];
  movimentos: Movimento[];
  movimentoItens: MovimentoItem[];
  lancamentos: LancamentoFinanceiro[];
  extratos: ExtratoBancario[];
  conciliacoes: ConciliacaoMapa[];
  centrosCusto: CentroCusto[];
  users: User[];
  products: Product[];
  mensalidades: MonthlyFee[];
  ageGroups: AgeGroup[];
  invoiceTypes: InvoiceType[];
}

export default function FinanceiroIndex({
  faturas,
  faturaItens,
  movimentos,
  movimentoItens,
  lancamentos,
  extratos,
  conciliacoes,
  centrosCusto,
  users,
  products,
  mensalidades,
  ageGroups,
  invoiceTypes,
}: Props) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [faturasState, setFaturas] = useState<Fatura[]>(faturas || []);
  const [faturaItensState, setFaturaItens] = useState<FaturaItem[]>(faturaItens || []);
  const [movimentosState, setMovimentos] = useState<Movimento[]>(movimentos || []);
  const [movimentoItensState, setMovimentoItens] = useState<MovimentoItem[]>(movimentoItens || []);
  const [lancamentosState, setLancamentos] = useState<LancamentoFinanceiro[]>(lancamentos || []);
  const [extratosState, setExtratos] = useState<ExtratoBancario[]>(extratos || []);
  const [conciliacoesState, setConciliacoes] = useState<ConciliacaoMapa[]>(conciliacoes || []);
  const [productsState, setProducts] = useState<Product[]>(products || []);

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Modulo Financeiro</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Gestao completa das financas do clube</p>
        </div>
      }
    >
      <Head title="Gestao Financeira" />

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
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
                <span>Relatorios</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            {activeTab === 'dashboard' ? (
              <DashboardTab
                faturas={faturasState}
                lancamentos={lancamentosState}
                movimentos={movimentosState}
                extratos={extratosState}
                centrosCusto={centrosCusto || []}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="faturas">
            <FaturasTab
              faturas={faturasState}
              setFaturas={setFaturas}
              faturaItens={faturaItensState}
              setFaturaItens={setFaturaItens}
              lancamentos={lancamentosState}
              setLancamentos={setLancamentos}
              conciliacoes={conciliacoesState}
              setConciliacoes={setConciliacoes}
              setExtratos={setExtratos}
              users={users || []}
              mensalidades={mensalidades || []}
              centrosCusto={centrosCusto || []}
              products={productsState}
              setProducts={setProducts}
              invoiceTypes={invoiceTypes || []}
            />
          </TabsContent>

          <TabsContent value="movimentos">
            <MovimentosTab
              movimentos={movimentosState}
              setMovimentos={setMovimentos}
              movimentoItens={movimentoItensState}
              setMovimentoItens={setMovimentoItens}
              lancamentos={lancamentosState}
              setLancamentos={setLancamentos}
              users={users || []}
              centrosCusto={centrosCusto || []}
              products={productsState}
              setProducts={setProducts}
              faturas={faturasState}
            />
          </TabsContent>

          <TabsContent value="banco">
            <BancoTab
              extratos={extratosState}
              setExtratos={setExtratos}
              lancamentos={lancamentosState}
              setLancamentos={setLancamentos}
              faturas={faturasState}
              setFaturas={setFaturas}
              movimentos={movimentosState}
              setMovimentos={setMovimentos}
              setConciliacoes={setConciliacoes}
              centrosCusto={centrosCusto || []}
              users={users || []}
            />
          </TabsContent>

          <TabsContent value="relatorios">
            {activeTab === 'relatorios' ? (
              <RelatoriosTab
                faturas={faturasState}
                lancamentos={lancamentosState}
                centrosCusto={centrosCusto || []}
                users={users || []}
                ageGroups={ageGroups || []}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
