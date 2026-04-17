import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { moduleTabbedContentClass, moduleTabsClass, moduleViewportClass } from '@/lib/module-layout';
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
      fullWidth
      header={
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Modulo Financeiro</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Gestao completa das financas do clube</p>
        </div>
      }
    >
      <Head title="Gestao Financeira" />

      <div className={moduleViewportClass}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className={moduleTabsClass}>
          <div className="w-full">
            <TabsList className="grid h-auto w-full shrink-0 grid-cols-2 gap-1 p-1 text-[11px] sm:h-9 sm:grid-cols-5 sm:text-xs">
              <TabsTrigger value="dashboard" className="flex h-8 items-center justify-center gap-1 px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <ChartLineUp size={14} />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="faturas" className="flex h-8 items-center justify-center gap-1 px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <Receipt size={14} />
                <span>Mensalidades</span>
              </TabsTrigger>
              <TabsTrigger value="movimentos" className="flex h-8 items-center justify-center gap-1 px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <ArrowsDownUp size={14} />
                <span>Movimentos</span>
              </TabsTrigger>
              <TabsTrigger value="banco" className="flex h-8 items-center justify-center gap-1 px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <Bank size={14} />
                <span>Banco</span>
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="flex h-8 items-center justify-center gap-1 px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <ChartBar size={14} />
                <span>Relatorios</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className={moduleTabbedContentClass}>
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

          <TabsContent value="faturas" className={moduleTabbedContentClass}>
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

          <TabsContent value="movimentos" className={moduleTabbedContentClass}>
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

          <TabsContent value="banco" className={moduleTabbedContentClass}>
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

          <TabsContent value="relatorios" className={moduleTabbedContentClass}>
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
