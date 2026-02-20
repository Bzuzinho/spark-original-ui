import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { format } from 'date-fns';
import { useMemo } from 'react';

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
  const getEstadoDisplay = (fatura: any) => {
    const vencimento = new Date(fatura.data_vencimento);
    if ((fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') && vencimento < new Date()) {
      return 'vencido';
    }
    return fatura.estado_pagamento;
  };
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

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      parcial: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={`${variants[estado] || 'bg-gray-100 text-gray-800'} text-xs px-1 py-0`}>{estado.toUpperCase()}</Badge>;
  };

  const userMovimentos = useMemo(() => {
    return (movimentos || [])
      .filter(m => m.user_id === user.id)
      .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime());
  }, [movimentos, user.id]);

  const centroCustoIds = useMemo(() => {
    if (!user.centro_custo) return [];
    if (user.centro_custo.length === 0) return [];

    const first = user.centro_custo[0];
    if (typeof first === 'object' && first !== null) {
      return (user.centro_custo as Array<{ id: string }>).map((c) => c.id);
    }

    return user.centro_custo as string[];
  }, [user.centro_custo]);

  const selectedCentroCustoId = centroCustoIds[0] || '';

  const mensalidadesDisponiveis = (monthlyFees || []).filter((fee) => fee.ativo !== false);
  const centrosCustoAtivos = (costCenters || []).filter((center) => center.ativo);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <div className="space-y-1">
          <Label htmlFor="tipo_mensalidade" className="text-xs">Tipo de Mensalidade</Label>
          <Select
            value={user.tipo_mensalidade || undefined}
            onValueChange={(value) => onChange('tipo_mensalidade', value)}
            disabled={!isAdmin}
          >
            <SelectTrigger id="tipo_mensalidade" className="h-7 text-xs">
              <SelectValue placeholder="Selecionar tipo de mensalidade" />
            </SelectTrigger>
            <SelectContent>
              {mensalidadesDisponiveis.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                  Nenhuma mensalidade configurada. Configure em Configuracoes → Financeiro.
                </div>
              ) : (
                mensalidadesDisponiveis.map((mensalidade) => (
                  <SelectItem key={mensalidade.id} value={mensalidade.id}>
                    {mensalidade.designacao} - €{toNumber(mensalidade.valor).toFixed(2)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Centro de Custos</Label>
          {centrosCustoAtivos.length === 0 ? (
            <Card className="p-2">
              <div className="text-center text-xs text-muted-foreground">
                Nenhum centro de custos configurado. Configure em Configuracoes → Financeiro.
              </div>
            </Card>
          ) : (
            <Select
              value={selectedCentroCustoId || 'none'}
              onValueChange={(value) => {
                if (!isAdmin) return;
                onChange('centro_custo', value === 'none' ? [] : [value]);
              }}
              disabled={!isAdmin}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Selecionar centro de custos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem centro de custos</SelectItem>
                {centrosCustoAtivos.map((center) => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="conta_corrente" className="text-xs">Conta Corrente</Label>
        <Input
          id="conta_corrente"
          type="text"
          value={user.conta_corrente ? `€${parseFloat(user.conta_corrente).toFixed(2)}` : '€0.00'}
          readOnly
          disabled
          className="h-7 text-xs bg-muted"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="conta_corrente_manual" className="text-xs">Ajuste Manual</Label>
        <Input
          id="conta_corrente_manual"
          type="number"
          value={user.conta_corrente_manual ?? 0}
          disabled={!isAdmin}
          onChange={(event) => onChange('conta_corrente_manual', Number(event.target.value))}
          className="h-7 text-xs"
        />
      </div>

      <div className="border-t pt-2">
        <h3 className="text-xs font-semibold mb-1.5">Histórico Financeiro</h3>
        
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <Card className="p-1.5">
            <p className="text-xs text-muted-foreground">Total de Faturas</p>
            <p className="text-base font-bold">{userFaturas.length}</p>
          </Card>
          <Card className="p-1.5">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="text-base font-bold text-green-600">€{toNumber(totalPago).toFixed(2)}</p>
          </Card>
          <Card className="p-1.5">
            <p className="text-xs text-muted-foreground">Total Pendente</p>
            <p className="text-base font-bold text-orange-600">€{toNumber(totalPendente).toFixed(2)}</p>
          </Card>
        </div>

        {userFaturas.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground border rounded-lg text-xs">
            <p>Nenhuma fatura encontrada para este utilizador</p>
          </div>
        ) : (
          <Card>
            <ScrollArea className="h-[240px]">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="text-xs h-7 py-1">Tipo</TableHead>
                    <TableHead className="text-xs h-7 py-1">Emissão</TableHead>
                    <TableHead className="text-xs h-7 py-1 hidden sm:table-cell">Vencimento</TableHead>
                    <TableHead className="text-xs h-7 py-1">Valor</TableHead>
                    <TableHead className="text-xs h-7 py-1">Estado</TableHead>
                    <TableHead className="text-xs h-7 py-1 hidden md:table-cell">Recibo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userFaturas.map(fatura => (
                    <TableRow key={fatura.id} className="text-xs">
                      <TableCell className="py-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">{fatura.tipo}</Badge>
                      </TableCell>
                      <TableCell className="py-1">{format(new Date(fatura.data_emissao), 'dd/MM/yy')}</TableCell>
                      <TableCell className="py-1 hidden sm:table-cell">{format(new Date(fatura.data_vencimento), 'dd/MM/yy')}</TableCell>
                      <TableCell className="font-semibold py-1">€{toNumber(fatura.valor_total).toFixed(2)}</TableCell>
                      <TableCell className="py-1">{getEstadoBadge(getEstadoDisplay(fatura))}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-1 hidden md:table-cell">
                        {fatura.numero_recibo || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        )}
      </div>

      <div className="border-t pt-2 mt-3">
        <h3 className="text-xs font-semibold mb-1.5">Movimentos de Custos Internos</h3>
        
        {userMovimentos.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground border rounded-lg text-xs">
            <p>Nenhum movimento de custos internos encontrado</p>
          </div>
        ) : (
          <Card>
            <ScrollArea className="h-[240px]">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="text-xs h-7 py-1">Tipo</TableHead>
                    <TableHead className="text-xs h-7 py-1">Data Emissão</TableHead>
                    <TableHead className="text-xs h-7 py-1">Evento</TableHead>
                    <TableHead className="text-xs h-7 py-1">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userMovimentos.map(movimento => (
                    <TableRow key={movimento.id} className="text-xs">
                      <TableCell className="py-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">{movimento.tipo}</Badge>
                      </TableCell>
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
    </div>
  );
}
