import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyFee {
  id: string;
  designacao: string;
  valor: number;
  ativo?: boolean;
}

interface CostCenter {
  id: string;
  nome: string;
  ativo: boolean;
}

interface FinancialTabProps {
  user: any;
  onChange: (field: string, value: any) => void;
  isAdmin: boolean;
  faturas?: any[];
  movimentos?: any[];
  monthlyFees?: MonthlyFee[];
  costCenters?: CostCenter[];
}

export function FinancialTab({
  user,
  onChange,
  isAdmin,
  faturas = [],
  movimentos = [],
  monthlyFees = [],
  costCenters = [],
}: FinancialTabProps) {
  const toNumber = (value: unknown) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isFutureInvoice = (fatura: any) => new Date(fatura.data_fatura) > getStartOfToday();

  const userFaturas = useMemo(() => {
    return (faturas || [])
      .filter((f) => f.user_id === user.id && !isFutureInvoice(f))
      .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime());
  }, [faturas, user.id]);

  const totalPago = useMemo(() => {
    return userFaturas
      .filter(f => f.estado_pagamento === 'pago')
      .reduce((sum, f) => sum + toNumber(f.valor_total), 0);
  }, [userFaturas]);

  const totalPendente = useMemo(() => {
    return userFaturas
      .filter(f => f.estado_pagamento === 'pendente' || f.estado_pagamento === 'vencido')
      .reduce((sum, f) => sum + toNumber(f.valor_total), 0);
  }, [userFaturas]);

  const contaCorrente = useMemo(() => {
    return toNumber(user.conta_corrente ?? 0) + toNumber(user.conta_corrente_manual ?? 0);
  }, [user.conta_corrente, user.conta_corrente_manual]);

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
    };
    return <Badge className={`${variants[estado] || 'bg-gray-100 text-gray-800'} text-xs px-1 py-0`}>{estado.toUpperCase()}</Badge>;
  };

  const mensalidadesDisponiveis = (monthlyFees || []).filter((fee) => fee.ativo !== false);
  const centrosCustoAtivos = (costCenters || []).filter((center) => center.ativo);

  const userMovimentos = useMemo(() => {
    return (movimentos || [])
      .filter(m => m.user_id === user.id)
      .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime());
  }, [movimentos, user.id]);

  return (
    <div className="space-y-1">
      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
        <Card className="p-0">
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-1">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 leading-none">
              <DollarSign size={14} />
              Conta Corrente
            </div>
            <div className={`text-lg font-bold leading-none ${contaCorrente < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {contaCorrente.toFixed(2)}€
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-1">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 leading-none">
              <TrendingUp size={14} />
              Total Pago
            </div>
            <div className="text-lg font-bold text-green-600 leading-none">
              {totalPago.toFixed(2)}€
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-1">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 leading-none">
              <TrendingDown size={14} />
              Pendente
            </div>
            <div className="text-lg font-bold text-amber-600 leading-none">
              {totalPendente.toFixed(2)}€
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-1">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 leading-none">
              📊
              Faturas
            </div>
            <div className="text-lg font-bold leading-none">
              {userFaturas.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1.5">Mensalidade</h3>
          <div className="space-y-1">
            <Label htmlFor="tipo_mensalidade" className="text-xs">Tipo</Label>
            <Select
              value={user.tipo_mensalidade || undefined}
              onValueChange={(value) => onChange('tipo_mensalidade', value)}
              disabled={!isAdmin}
            >
              <SelectTrigger id="tipo_mensalidade" className="h-7 text-xs">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {mensalidadesDisponiveis.length === 0 ? (
                  <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                    Nenhuma configurada
                  </div>
                ) : (
                  mensalidadesDisponiveis.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.designacao} - €{toNumber(m.valor).toFixed(2)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1.5">Centro de Custos</h3>
          <div className="space-y-1">
            <Label className="text-xs">Selecionar</Label>
            {centrosCustoAtivos.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2 border rounded text-center">
                Nenhum configurado
              </div>
            ) : (
              <Select
                value={user.centro_custo?.[0]?.id || user.centro_custo?.[0] || 'none'}
                onValueChange={(value) => {
                  if (!isAdmin) return;
                  onChange('centro_custo', value === 'none' ? [] : [value]);
                }}
                disabled={!isAdmin}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem centro</SelectItem>
                  {centrosCustoAtivos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </Card>
      </div>

      {/* Ajustes Manuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1.5">Conta Corrente Base</h3>
          <Input
            type="text"
            value={user.conta_corrente ? `€${parseFloat(user.conta_corrente).toFixed(2)}` : '€0.00'}
            readOnly
            disabled
            className="h-7 text-xs bg-muted"
          />
        </Card>

        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1.5">Ajuste Manual</h3>
          <Input
            type="number"
            value={user.conta_corrente_manual ?? 0}
            disabled={!isAdmin}
            onChange={(e) => onChange('conta_corrente_manual', Number(e.target.value))}
            className="h-7 text-xs"
          />
        </Card>
      </div>

      {/* Histórico Financeiro */}
      <Card className="p-2">
        <h3 className="text-xs font-semibold mb-1.5">Histórico de Faturas</h3>
        {userFaturas.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            Nenhuma fatura encontrada
          </div>
        ) : (
          <ScrollArea className="h-[240px]">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="text-xs h-7 py-1">Emissão</TableHead>
                  <TableHead className="text-xs h-7 py-1 hidden sm:table-cell">Vencimento</TableHead>
                  <TableHead className="text-xs h-7 py-1">Valor</TableHead>
                  <TableHead className="text-xs h-7 py-1">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userFaturas.map((fatura) => (
                  <TableRow key={fatura.id} className="text-xs">
                    <TableCell className="py-1">{format(new Date(fatura.data_emissao), 'dd/MM/yy')}</TableCell>
                    <TableCell className="py-1 hidden sm:table-cell">{format(new Date(fatura.data_vencimento), 'dd/MM/yy')}</TableCell>
                    <TableCell className="font-semibold py-1">€{toNumber(fatura.valor_total).toFixed(2)}</TableCell>
                    <TableCell className="py-1">{getEstadoBadge(fatura.estado_pagamento)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </Card>

      {/* Movimentos */}
      {userMovimentos.length > 0 && (
        <Card className="p-2">
          <h3 className="text-xs font-semibold mb-1.5">Movimentos</h3>
          <ScrollArea className="h-[240px]">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="text-xs h-7 py-1">Data</TableHead>
                  <TableHead className="text-xs h-7 py-1">Evento</TableHead>
                  <TableHead className="text-xs h-7 py-1">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userMovimentos.map((movimento) => (
                  <TableRow key={movimento.id} className="text-xs">
                    <TableCell className="py-1">{format(new Date(movimento.data_emissao), 'dd/MM/yy')}</TableCell>
                    <TableCell className="py-1">{movimento.evento_nome}</TableCell>
                    <TableCell className="font-semibold py-1 text-red-600">-€{toNumber(movimento.valor).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
