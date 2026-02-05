import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
    ChartLineUp, 
    Receipt, 
    ArrowsDownUp, 
    ListBullets, 
    ChartBar,
    TrendUp,
    TrendDown,
    Wallet,
    WarningCircle 
} from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Transaction {
    id: string;
    user_id?: string;
    category_id?: string;
    descricao: string;
    valor: number;
    tipo: 'receita' | 'despesa';
    data: string;
    metodo_pagamento?: string;
    comprovativo?: string;
    estado: 'paga' | 'pendente' | 'cancelada';
    observacoes?: string;
    user?: any;
    category?: any;
}

interface MembershipFee {
    id: string;
    user_id: string;
    mes: number;
    ano: number;
    valor: number;
    estado: 'paga' | 'pendente' | 'atrasada';
    data_pagamento?: string;
    transaction_id?: string;
    user?: any;
    transaction?: any;
}

interface FinancialCategory {
    id: string;
    nome: string;
    tipo: 'receita' | 'despesa';
    cor?: string;
    ativa: boolean;
}

interface Props {
    transactions: Transaction[];
    membershipFees: MembershipFee[];
    categories: FinancialCategory[];
    users: any[];
    stats: {
        saldoAtual: number;
        receitasMes: number;
        despesasMes: number;
        mensalidadesAtrasadas: number;
        totalReceitas: number;
        totalDespesas: number;
    };
    monthlyData: Array<{
        mes: string;
        receitas: number;
        despesas: number;
    }>;
}

export default function FinanceiroIndex({ 
    transactions, 
    membershipFees, 
    categories, 
    users, 
    stats, 
    monthlyData 
}: Props) {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Módulo Financeiro</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Gestão completa das finanças do clube
                    </p>
                </div>
            }
        >
            <Head title="Gestão Financeira" />

            <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-3">
                    <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                        <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-5 h-9 sm:h-8 text-xs min-w-full sm:min-w-0">
                            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
                                <ChartLineUp size={16} className="sm:hidden" />
                                <ChartLineUp size={14} className="hidden sm:inline" />
                                <span>Dashboard</span>
                            </TabsTrigger>
                            <TabsTrigger value="mensalidades" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
                                <Receipt size={16} className="sm:hidden" />
                                <Receipt size={14} className="hidden sm:inline" />
                                <span>Mensalidades</span>
                            </TabsTrigger>
                            <TabsTrigger value="transacoes" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
                                <ArrowsDownUp size={16} className="sm:hidden" />
                                <ArrowsDownUp size={14} className="hidden sm:inline" />
                                <span>Transações</span>
                            </TabsTrigger>
                            <TabsTrigger value="categorias" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
                                <ListBullets size={16} className="sm:hidden" />
                                <ListBullets size={14} className="hidden sm:inline" />
                                <span>Categorias</span>
                            </TabsTrigger>
                            <TabsTrigger value="relatorios" className="flex items-center gap-1.5 px-3 sm:px-2 text-xs whitespace-nowrap">
                                <ChartBar size={16} className="sm:hidden" />
                                <ChartBar size={14} className="hidden sm:inline" />
                                <span>Relatórios</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="dashboard">
                        <DashboardTab stats={stats} monthlyData={monthlyData} />
                    </TabsContent>

                    <TabsContent value="mensalidades">
                        <MensalidadesTab membershipFees={membershipFees} users={users} />
                    </TabsContent>

                    <TabsContent value="transacoes">
                        <TransacoesTab transactions={transactions} categories={categories} users={users} />
                    </TabsContent>

                    <TabsContent value="categorias">
                        <CategoriasTab categories={categories} />
                    </TabsContent>

                    <TabsContent value="relatorios">
                        <RelatoriosTab stats={stats} monthlyData={monthlyData} />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}

// Dashboard Tab Component
function DashboardTab({ stats, monthlyData }: { stats: Props['stats'], monthlyData: Props['monthlyData'] }) {
    const saldoMes = stats.receitasMes - stats.despesasMes;

    return (
        <div className="space-y-2 sm:space-y-3">
            <div className="grid gap-2 grid-cols-2 lg:grid-cols-5">
                <Card className="p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground font-medium leading-tight">Saldo Atual</p>
                            <p className="text-lg sm:text-xl font-bold text-primary mt-0.5 truncate">
                                €{stats.saldoAtual.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                            <Wallet className="text-primary" size={16} weight="bold" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground font-medium leading-tight">Receitas Mês</p>
                            <p className="text-lg sm:text-xl font-bold text-green-600 mt-0.5 truncate">
                                €{stats.receitasMes.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
                            <TrendUp className="text-green-600" size={16} weight="bold" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground font-medium leading-tight">Mensalidades Atrasadas</p>
                            <p className="text-lg sm:text-xl font-bold text-red-600 mt-0.5 truncate">
                                {stats.mensalidadesAtrasadas}
                            </p>
                        </div>
                        <div className="p-1.5 rounded-lg bg-red-50 flex-shrink-0">
                            <WarningCircle className="text-red-600" size={16} weight="bold" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground font-medium leading-tight">Saldo Mensal</p>
                            <p className={`text-lg sm:text-xl font-bold mt-0.5 truncate ${saldoMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                €{saldoMes.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-1.5 rounded-lg bg-orange-50 flex-shrink-0">
                            <Receipt className="text-orange-600" size={16} weight="bold" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground font-medium leading-tight">Despesas Mês</p>
                            <p className="text-lg sm:text-xl font-bold text-red-600 mt-0.5 truncate">
                                €{stats.despesasMes.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-1.5 rounded-lg bg-red-50 flex-shrink-0">
                            <TrendDown className="text-red-600" size={16} weight="bold" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-2 sm:p-2.5">
                <h3 className="font-semibold text-xs sm:text-sm mb-1.5">Evolução Mensal (últimos 6 meses)</h3>
                <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} contentStyle={{ fontSize: '11px' }} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Line type="monotone" dataKey="receitas" stroke="#16a34a" strokeWidth={2} name="Receitas" />
                            <Line type="monotone" dataKey="despesas" stroke="#dc2626" strokeWidth={2} name="Despesas" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}

// Mensalidades Tab Component
function MensalidadesTab({ membershipFees, users }: { membershipFees: MembershipFee[], users: any[] }) {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Mensalidades</h2>
                <Button size="sm">Gerar Mensalidades</Button>
            </div>
            <div className="space-y-2">
                {membershipFees.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma mensalidade encontrada
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Membro</th>
                                    <th className="text-left p-2">Mês/Ano</th>
                                    <th className="text-right p-2">Valor</th>
                                    <th className="text-center p-2">Estado</th>
                                    <th className="text-right p-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {membershipFees.map((fee) => (
                                    <tr key={fee.id} className="border-b hover:bg-muted/50">
                                        <td className="p-2">{fee.user?.full_name || 'N/A'}</td>
                                        <td className="p-2">{fee.mes}/{fee.ano}</td>
                                        <td className="text-right p-2">€{fee.valor.toFixed(2)}</td>
                                        <td className="text-center p-2">
                                            <Badge variant={
                                                fee.estado === 'paga' ? 'default' : 
                                                fee.estado === 'atrasada' ? 'destructive' : 
                                                'secondary'
                                            }>
                                                {fee.estado}
                                            </Badge>
                                        </td>
                                        <td className="text-right p-2">
                                            {fee.estado !== 'paga' && (
                                                <Button size="sm" variant="outline">Marcar Paga</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Card>
    );
}

// Transações Tab Component
function TransacoesTab({ transactions, categories, users }: { transactions: Transaction[], categories: FinancialCategory[], users: any[] }) {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Transações</h2>
                <Button size="sm">Nova Transação</Button>
            </div>
            <div className="space-y-2">
                {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma transação encontrada
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Data</th>
                                    <th className="text-left p-2">Descrição</th>
                                    <th className="text-left p-2">Categoria</th>
                                    <th className="text-right p-2">Valor</th>
                                    <th className="text-center p-2">Tipo</th>
                                    <th className="text-center p-2">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                                        <td className="p-2">{new Date(transaction.data).toLocaleDateString('pt-PT')}</td>
                                        <td className="p-2">{transaction.descricao}</td>
                                        <td className="p-2">{transaction.category?.nome || '-'}</td>
                                        <td className={`text-right p-2 font-semibold ${transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.tipo === 'receita' ? '+' : '-'}€{transaction.valor.toFixed(2)}
                                        </td>
                                        <td className="text-center p-2">
                                            <Badge variant={transaction.tipo === 'receita' ? 'default' : 'secondary'}>
                                                {transaction.tipo}
                                            </Badge>
                                        </td>
                                        <td className="text-center p-2">
                                            <Badge variant={
                                                transaction.estado === 'paga' ? 'default' : 
                                                transaction.estado === 'cancelada' ? 'destructive' : 
                                                'secondary'
                                            }>
                                                {transaction.estado}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Card>
    );
}

// Categorias Tab Component
function CategoriasTab({ categories }: { categories: FinancialCategory[] }) {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Categorias Financeiras</h2>
                <Button size="sm">Nova Categoria</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 col-span-full">
                        Nenhuma categoria encontrada
                    </p>
                ) : (
                    categories.map((category) => (
                        <Card key={category.id} className="p-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-sm">{category.nome}</h3>
                                    <Badge 
                                        variant={category.tipo === 'receita' ? 'default' : 'secondary'}
                                        className="mt-1"
                                    >
                                        {category.tipo}
                                    </Badge>
                                </div>
                                {category.ativa ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        Ativa
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                        Inativa
                                    </Badge>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </Card>
    );
}

// Relatórios Tab Component
function RelatoriosTab({ stats, monthlyData }: { stats: Props['stats'], monthlyData: Props['monthlyData'] }) {
    return (
        <div className="space-y-3">
            <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3">Resumo Financeiro</h3>
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm font-medium">Total de Receitas</span>
                        <span className="text-lg font-bold text-green-600">€{stats.totalReceitas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm font-medium">Total de Despesas</span>
                        <span className="text-lg font-bold text-red-600">€{stats.totalDespesas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm font-medium">Saldo Total</span>
                        <span className={`text-lg font-bold ${stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{stats.saldoAtual.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm font-medium">Mensalidades Atrasadas</span>
                        <span className="text-lg font-bold text-orange-600">{stats.mensalidadesAtrasadas}</span>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3">Análise Mensal</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="receitas" fill="#16a34a" name="Receitas" />
                            <Bar dataKey="despesas" fill="#dc2626" name="Despesas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
