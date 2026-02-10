import { useState, useMemo } from 'react';
import { Card } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ChartBar, Users, CurrencyCircleDollar, Funnel } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Fatura, LancamentoFinanceiro, CentroCusto, User, AgeGroup } from './types';

type TipoRelatorio = 'escalao' | 'centro-custo' | 'atleta';

interface RelatoriosTabProps {
  faturas: Fatura[];
  lancamentos: LancamentoFinanceiro[];
  centrosCusto: CentroCusto[];
  users: User[];
  ageGroups: AgeGroup[];
}

export function RelatoriosTab({ faturas, lancamentos, centrosCusto, users, ageGroups }: RelatoriosTabProps) {
  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  const isFutureInvoice = (fatura: Fatura) => new Date(fatura.data_fatura) > getStartOfToday();
  const faturasAtivas = (faturas || []).filter((f) => !isFutureInvoice(f));

  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('escalao');
  const [escalaoFilter, setEscalaoFilter] = useState<string>('all');
  const [centroCustoFilter, setCentroCustoFilter] = useState<string>('all');

  const getEscalaoName = (escalaoId: string) => {
    const ageGroup = (ageGroups || []).find((ag) => ag.id === escalaoId);
    return ageGroup?.nome || escalaoId;
  };

  const escaloes = useMemo(() => {
    const escalaoSet = new Set<string>();
    (users || []).forEach((user) => {
      (user.escalao || []).forEach((esc) => escalaoSet.add(esc));
    });
    return Array.from(escalaoSet);
  }, [users]);

  const relatorioEscalao = useMemo(() => {
    const data = escaloes.map((escalao) => {
      const usuariosEscalao = (users || []).filter((u) => u.escalao?.includes(escalao));
      const userIds = usuariosEscalao.map((u) => u.id);

      const receitas = (lancamentos || [])
        .filter((l) => l.tipo === 'receita' && l.user_id && userIds.includes(l.user_id))
        .reduce((sum, l) => sum + l.valor, 0);

      const faturasEscalao = faturasAtivas.filter((f) => userIds.includes(f.user_id));
      const totalFaturado = faturasEscalao.reduce((sum, f) => sum + f.valor_total, 0);
      const totalPago = faturasEscalao
        .filter((f) => f.estado_pagamento === 'pago')
        .reduce((sum, f) => sum + f.valor_total, 0);
      const totalPendente = faturasEscalao
        .filter((f) => f.estado_pagamento === 'pendente' || f.estado_pagamento === 'vencido')
        .reduce((sum, f) => sum + f.valor_total, 0);

      return {
        escalaoId: escalao,
        escalao: getEscalaoName(escalao),
        receitas,
        totalFaturado,
        totalPago,
        totalPendente,
        numeroAtletas: usuariosEscalao.length,
      };
    });

    if (escalaoFilter !== 'all') {
      return data.filter((d) => d.escalaoId === escalaoFilter);
    }

    return data.sort((a, b) => b.receitas - a.receitas);
  }, [escaloes, users, lancamentos, faturasAtivas, escalaoFilter, ageGroups]);

  const relatorioCentroCusto = useMemo(() => {
    const data = (centrosCusto || [])
      .filter((cc) => cc.ativo)
      .map((cc) => {
        const despesas = (lancamentos || [])
          .filter((l) => l.tipo === 'despesa' && l.centro_custo_id === cc.id)
          .reduce((sum, l) => sum + l.valor, 0);

        const receitas = (lancamentos || [])
          .filter((l) => l.tipo === 'receita' && l.centro_custo_id === cc.id)
          .reduce((sum, l) => sum + l.valor, 0);

        const saldo = receitas - despesas;

        return {
          id: cc.id,
          nome: cc.nome,
          tipo: cc.tipo,
          despesas,
          receitas,
          saldo,
        };
      });

    if (centroCustoFilter !== 'all') {
      return data.filter((d) => d.id === centroCustoFilter);
    }

    return data.sort((a, b) => b.despesas - a.despesas);
  }, [centrosCusto, lancamentos, centroCustoFilter]);

  const relatorioAtleta = useMemo(() => {
    const data = (users || [])
      .filter((u) => (u.tipo_membro || []).includes('atleta'))
      .map((user) => {
        const faturasUsuario = faturasAtivas.filter((f) => f.user_id === user.id);
        const valorPago = faturasUsuario
          .filter((f) => f.estado_pagamento === 'pago')
          .reduce((sum, f) => sum + f.valor_total, 0);

        const despesas = (lancamentos || [])
          .filter((l) => l.tipo === 'despesa' && l.user_id === user.id)
          .reduce((sum, l) => sum + l.valor, 0);

        const pesoFinanceiro = valorPago - despesas;

        const escalaoNames = (user.escalao || []).map((escId) => getEscalaoName(escId)).join(', ');

        return {
          id: user.id,
          nome: user.nome_completo,
          numero_socio: user.numero_socio,
          valorPago,
          despesas,
          pesoFinanceiro,
          escalao: escalaoNames || '-',
        };
      });

    return data.sort((a, b) => b.pesoFinanceiro - a.pesoFinanceiro);
  }, [users, faturasAtivas, lancamentos, ageGroups]);

  const chartData = useMemo(() => {
    if (tipoRelatorio === 'escalao') {
      return relatorioEscalao.map((item) => ({
        name: item.escalao,
        Receitas: item.receitas,
        Faturado: item.totalFaturado,
      }));
    }
    if (tipoRelatorio === 'centro-custo') {
      return relatorioCentroCusto.slice(0, 10).map((item) => ({
        name: item.nome.length > 15 ? item.nome.substring(0, 15) + '...' : item.nome,
        Receitas: item.receitas,
        Despesas: item.despesas,
      }));
    }
    return [];
  }, [tipoRelatorio, relatorioEscalao, relatorioCentroCusto]);

  return (
    <div className="space-y-3">
      <Card className="p-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Funnel size={14} className="text-primary" />
          <h3 className="font-semibold text-xs">Filtros de Relatorio</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="space-y-0.5">
            <Label className="text-xs">Tipo de Relatorio</Label>
            <Select value={tipoRelatorio} onValueChange={(v) => setTipoRelatorio(v as TipoRelatorio)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="escalao">Rendimento por Escalao</SelectItem>
                <SelectItem value="centro-custo">Gastos por Centro de Custo</SelectItem>
                <SelectItem value="atleta">Peso Financeiro por Atleta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoRelatorio === 'escalao' && (
            <div className="space-y-0.5">
              <Label className="text-xs">Filtrar Escalao</Label>
              <Select value={escalaoFilter} onValueChange={setEscalaoFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Escaloes</SelectItem>
                  {escaloes.map((esc) => (
                    <SelectItem key={esc} value={esc}>
                      {getEscalaoName(esc)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipoRelatorio === 'centro-custo' && (
            <div className="space-y-0.5">
              <Label className="text-xs">Filtrar Centro de Custo</Label>
              <Select value={centroCustoFilter} onValueChange={setCentroCustoFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Centros</SelectItem>
                  {(centrosCusto || [])
                    .filter((cc) => cc.ativo)
                    .map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {(tipoRelatorio === 'escalao' || tipoRelatorio === 'centro-custo') && chartData.length > 0 && (
        <Card className="p-3">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <ChartBar size={18} className="text-primary" />
            Visualizacao Grafica
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {tipoRelatorio === 'escalao' && (
                  <>
                    <Bar dataKey="Receitas" fill="oklch(0.55 0.15 150)" />
                    <Bar dataKey="Faturado" fill="oklch(0.45 0.15 250)" />
                  </>
                )}
                {tipoRelatorio === 'centro-custo' && (
                  <>
                    <Bar dataKey="Receitas" fill="oklch(0.55 0.15 150)" />
                    <Bar dataKey="Despesas" fill="oklch(0.55 0.22 25)" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {tipoRelatorio === 'escalao' && (
        <Card className="p-4">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Relatorio: Rendimento por Escalao
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escalao</TableHead>
                <TableHead className="text-right">Nº Atletas</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Total Faturado</TableHead>
                <TableHead className="text-right">Total Pago</TableHead>
                <TableHead className="text-right">Pendente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorioEscalao.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum dado disponivel
                  </TableCell>
                </TableRow>
              ) : (
                relatorioEscalao.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.escalao}</TableCell>
                    <TableCell className="text-right">{item.numeroAtletas}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      €{item.receitas.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">€{item.totalFaturado.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600">€{item.totalPago.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-orange-600">€{item.totalPendente.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
              {relatorioEscalao.length > 0 && (
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">
                    {relatorioEscalao.reduce((sum, item) => sum + item.numeroAtletas, 0)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    €{relatorioEscalao.reduce((sum, item) => sum + item.receitas, 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    €{relatorioEscalao.reduce((sum, item) => sum + item.totalFaturado, 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    €{relatorioEscalao.reduce((sum, item) => sum + item.totalPago, 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    €{relatorioEscalao.reduce((sum, item) => sum + item.totalPendente, 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {tipoRelatorio === 'centro-custo' && (
        <Card className="p-4">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <CurrencyCircleDollar size={20} className="text-primary" />
            Relatorio: Gastos por Centro de Custo
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorioCentroCusto.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum centro de custo configurado
                  </TableCell>
                </TableRow>
              ) : (
                relatorioCentroCusto.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="capitalize">{item.tipo}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      €{item.receitas.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      €{item.despesas.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      €{item.saldo.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {relatorioCentroCusto.length > 0 && (
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={2}>TOTAL</TableCell>
                  <TableCell className="text-right text-green-600">
                    €{relatorioCentroCusto.reduce((sum, item) => sum + item.receitas, 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    €{relatorioCentroCusto.reduce((sum, item) => sum + item.despesas, 0).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      relatorioCentroCusto.reduce((sum, item) => sum + item.saldo, 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    €{relatorioCentroCusto
                      .reduce((sum, item) => sum + item.saldo, 0)
                      .toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {tipoRelatorio === 'atleta' && (
        <Card className="p-4">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Relatorio: Peso Financeiro por Atleta
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Valor Pago - Despesas = Peso Financeiro (quanto o atleta contribui liquido para o clube)
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Numero Socio</TableHead>
                <TableHead>Escalao</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Peso Financeiro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorioAtleta.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum atleta encontrado
                  </TableCell>
                </TableRow>
              ) : (
                relatorioAtleta.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.numero_socio}</TableCell>
                    <TableCell>{item.escalao}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      €{item.valorPago.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">€{item.despesas.toFixed(2)}</TableCell>
                    <TableCell
                      className={`text-right font-bold ${item.pesoFinanceiro >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      €{item.pesoFinanceiro.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
