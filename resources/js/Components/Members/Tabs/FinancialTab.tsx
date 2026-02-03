import { Label } from '@/Components/ui/Label';
import { Input } from '@/Components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface FinancialTabProps {
  user: any;
  onChange: (field: string, value: any) => void;
  isAdmin: boolean;
  faturas?: any[];
  movimentos?: any[];
}

export function FinancialTab({ user, onChange, isAdmin, faturas = [], movimentos = [] }: FinancialTabProps) {
  const userFaturas = useMemo(() => {
    return (faturas || [])
      .filter(f => f.user_id === user.id)
      .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime());
  }, [faturas, user.id]);

  const totalPago = useMemo(() => {
    return userFaturas
      .filter(f => f.estado_pagamento === 'pago')
      .reduce((sum, f) => sum + f.valor_total, 0);
  }, [userFaturas]);

  const totalPendente = useMemo(() => {
    return userFaturas
      .filter(f => f.estado_pagamento === 'pendente' || f.estado_pagamento === 'vencido')
      .reduce((sum, f) => sum + f.valor_total, 0);
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

  const mensalidadesDisponiveis = [
    { id: 'standard', name: 'Mensalidade Standard', amount: 30 },
    { id: 'junior', name: 'Mensalidade Júnior', amount: 25 },
    { id: 'senior', name: 'Mensalidade Sénior', amount: 35 },
  ];

  const costCenters = [
    { id: 'natacao', nome: 'Natação', ativo: true },
    { id: 'polo', nome: 'Pólo Aquático', ativo: true },
    { id: 'masters', nome: 'Masters', ativo: true },
  ];

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
                  Nenhuma mensalidade configurada. Configure em Configurações → Financeiro.
                </div>
              ) : (
                mensalidadesDisponiveis.map((mensalidade) => (
                  <SelectItem key={mensalidade.id} value={mensalidade.id}>
                    {mensalidade.name} - €{mensalidade.amount.toFixed(2)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="centro_custo" className="text-xs">Centro de Custos</Label>
          <Select
            value={user.centro_custo?.[0] || undefined}
            onValueChange={(value) => onChange('centro_custo', [value])}
            disabled={!isAdmin}
          >
            <SelectTrigger id="centro_custo" className="h-7 text-xs">
              <SelectValue placeholder="Selecionar centro de custos" />
            </SelectTrigger>
            <SelectContent>
              {costCenters.filter(c => c.ativo).length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                  Nenhum centro de custos configurado. Configure em Configurações → Financeiro.
                </div>
              ) : (
                costCenters
                  .filter(c => c.ativo)
                  .map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.nome}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
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

      <div className="border-t pt-2">
        <h3 className="text-xs font-semibold mb-1.5">Histórico Financeiro</h3>
        
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <Card className="p-1.5">
            <p className="text-xs text-muted-foreground">Total de Faturas</p>
            <p className="text-base font-bold">{userFaturas.length}</p>
          </Card>
          <Card className="p-1.5">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="text-base font-bold text-green-600">€{totalPago.toFixed(2)}</p>
          </Card>
          <Card className="p-1.5">
            <p className="text-xs text-muted-foreground">Total Pendente</p>
            <p className="text-base font-bold text-orange-600">€{totalPendente.toFixed(2)}</p>
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
                      <TableCell className="font-semibold py-1">€{fatura.valor_total.toFixed(2)}</TableCell>
                      <TableCell className="py-1">{getEstadoBadge(fatura.estado_pagamento)}</TableCell>
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
                      <TableCell className="font-semibold py-1 text-red-600">-€{movimento.valor.toFixed(2)}</TableCell>
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
