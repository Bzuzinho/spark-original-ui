import { useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Fatura, LancamentoFinanceiro, CentroCusto, User } from '@/lib/types';
import { TrendUp, TrendDown, Wallet, Receipt, WarningCircle } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function DashboardTab() {
  const [faturas] = useKV<Fatura[]>('club-faturas', []);
  const [lancamentos] = useKV<LancamentoFinanceiro[]>('club-lancamentos', []);
  const [centrosCusto] = useKV<CentroCusto[]>('club-centros-custo', []);
  const [users] = useKV<User[]>('club-users', []);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const faturasVencidas = (faturas || []).filter(f => {
      const vencimento = new Date(f.data_vencimento);
      return f.estado_pagamento === 'pendente' && vencimento < now;
    });

    const valorMensalidadesVencidas = faturasVencidas.reduce((sum, f) => sum + f.valor_total, 0);

    const faturasPendentes = (faturas || []).filter(f => 
      f.estado_pagamento === 'pendente' || f.estado_pagamento === 'vencido'
    );

    const valorPendentes = faturasPendentes.reduce((sum, f) => sum + f.valor_total, 0);

    const mensalidadesCobradas = (faturas || [])
      .filter(f => f.estado_pagamento === 'pago')
      .reduce((sum, f) => sum + f.valor_total, 0);

    const receitasMes = (lancamentos || [])
      .filter(l => {
        const data = new Date(l.data);
        return l.tipo === 'receita' && 
               data.getMonth() === currentMonth && 
               data.getFullYear() === currentYear;
      })
      .reduce((sum, l) => sum + l.valor, 0);

    const despesasMes = (lancamentos || [])
      .filter(l => {
        const data = new Date(l.data);
        return l.tipo === 'despesa' && 
               data.getMonth() === currentMonth && 
               data.getFullYear() === currentYear;
      })
      .reduce((sum, l) => sum + l.valor, 0);

    const receitasTotal = (lancamentos || [])
      .filter(l => l.tipo === 'receita')
      .reduce((sum, l) => sum + l.valor, 0);

    const despesasTotal = (lancamentos || [])
      .filter(l => l.tipo === 'despesa')
      .reduce((sum, l) => sum + l.valor, 0);

    const totalGeral = receitasTotal - despesasTotal + mensalidadesCobradas;

    return {
      mensalidadesVencidas: faturasVencidas.length,
      valorMensalidadesVencidas,
      valorPendentes,
      mensalidadesCobradas,
      receitasMes,
      despesasMes,
      receitasTotal,
      despesasTotal,
      totalGeral,
      saldoMes: receitasMes - despesasMes,
      saldoTotal: receitasTotal - despesasTotal,
    };
  }, [faturas, lancamentos]);

  const centrosCustoData = useMemo(() => {
    const data = (centrosCusto || []).filter(cc => cc.ativo).map(cc => {
      const despesas = (lancamentos || [])
        .filter(l => l.tipo === 'despesa' && l.centro_custo_id === cc.id)
        .reduce((sum, l) => sum + l.valor, 0);
      
      const receitas = (lancamentos || [])
        .filter(l => l.tipo === 'receita' && l.centro_custo_id === cc.id)
        .reduce((sum, l) => sum + l.valor, 0);

      return {
        nome: cc.nome,
        despesas,
        receitas,
        saldo: receitas - despesas,
      };
    });

    return data.sort((a, b) => b.despesas - a.despesas).slice(0, 6);
  }, [centrosCusto, lancamentos]);

  const monthlyData = useMemo(() => {
    const months: { mes: string; receitas: number; despesas: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const receitas = (lancamentos || [])
        .filter(l => {
          const d = new Date(l.data);
          return l.tipo === 'receita' && d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, l) => sum + l.valor, 0);
      
      const despesas = (lancamentos || [])
        .filter(l => {
          const d = new Date(l.data);
          return l.tipo === 'despesa' && d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, l) => sum + l.valor, 0);

      months.push({
        mes: date.toLocaleDateString('pt-PT', { month: 'short' }),
        receitas,
        despesas,
      });
    }
    
    return months;
  }, [lancamentos]);

  const tiposFaturaData = useMemo(() => {
    const tipos = ['mensalidade', 'inscricao', 'material', 'servico', 'outro'];
    return tipos.map(tipo => ({
      name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      value: (faturas || []).filter(f => f.tipo === tipo).length,
    })).filter(d => d.value > 0);
  }, [faturas]);

  const COLORS = ['oklch(0.45 0.15 250)', 'oklch(0.68 0.18 45)', 'oklch(0.55 0.22 25)', 'oklch(0.6 0.15 150)', 'oklch(0.5 0.12 300)'];

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-5">
        <Card className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium leading-tight">Total Geral</p>
              <p className="text-lg sm:text-xl font-bold text-primary mt-0.5 truncate">€{stats.totalGeral.toFixed(2)}</p>
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
              <p className="text-lg sm:text-xl font-bold text-green-600 mt-0.5 truncate">€{stats.receitasMes.toFixed(2)}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
              <TrendUp className="text-green-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium leading-tight">Mensalidades Vencidas</p>
              <p className="text-lg sm:text-xl font-bold text-red-600 mt-0.5 truncate">{stats.mensalidadesVencidas}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-red-50 flex-shrink-0">
              <WarningCircle className="text-red-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium leading-tight">Pendentes</p>
              <p className="text-lg sm:text-xl font-bold text-orange-600 mt-0.5 truncate">€{stats.valorPendentes.toFixed(2)}</p>
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
              <p className="text-lg sm:text-xl font-bold text-red-600 mt-0.5 truncate">€{stats.despesasMes.toFixed(2)}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-red-50 flex-shrink-0">
              <TrendDown className="text-red-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 lg:grid-cols-2">
        <Card className="p-2 sm:p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-semibold text-xs sm:text-sm">Saldo Atual</h3>
            <Wallet size={16} className="text-primary" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-1.5 bg-muted/50 rounded-lg">
              <span className="text-xs font-medium">Saldo Total</span>
              <span className={`text-base sm:text-lg font-bold ${stats.saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{stats.saldoTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-muted/50 rounded-lg">
              <span className="text-xs font-medium">Saldo do Mês</span>
              <span className={`text-base sm:text-lg font-bold ${stats.saldoMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{stats.saldoMes.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-2.5">
          <h3 className="font-semibold text-xs sm:text-sm mb-1.5">Distribuição de Faturas por Tipo</h3>
          <div className="h-[120px] sm:h-[140px]">
            {tiposFaturaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tiposFaturaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tiposFaturaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                Sem dados disponíveis
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 lg:grid-cols-2">
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
                <Line type="monotone" dataKey="receitas" stroke="oklch(0.55 0.15 150)" strokeWidth={2} name="Receitas" />
                <Line type="monotone" dataKey="despesas" stroke="oklch(0.55 0.22 25)" strokeWidth={2} name="Despesas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-2 sm:p-2.5">
          <h3 className="font-semibold text-xs sm:text-sm mb-1.5">Despesas e Receitas por Centro de Custo</h3>
          <div className="h-[180px] sm:h-[200px]">
            {centrosCustoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={centrosCustoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} contentStyle={{ fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="receitas" fill="oklch(0.55 0.15 150)" name="Receitas" />
                  <Bar dataKey="despesas" fill="oklch(0.55 0.22 25)" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                Nenhum centro de custo configurado
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
