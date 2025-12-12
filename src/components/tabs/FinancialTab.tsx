import { User, Fatura, FaturaItem, MovimentoConvocatoria, MovimentoConvocatoriaItem } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useKV } from '@github/spark/hooks';
import { format, isAfter } from 'date-fns';
import { useMemo, useState } from 'react';
import { PencilSimple, Trash, Plus, X } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FinancialTabProps {
  user: User;
  onChange: (field: keyof User, value: any) => void;
  isAdmin: boolean;
}

export function FinancialTab({ user, onChange, isAdmin }: FinancialTabProps) {
  const [faturas, setFaturas] = useKV<Fatura[]>('club-faturas', []);
  const [faturaItens, setFaturaItens] = useKV<FaturaItem[]>('club-fatura-itens', []);
  const [movimentosConvocatoria, setMovimentosConvocatoria] = useKV<MovimentoConvocatoria[]>('movimentos-convocatoria', []);
  const [mensalidades] = useKV<Array<{ id: string; name: string; amount: number; ageGroupId: string }>>('settings-monthly-fees', []);
  const [costCenters] = useKV<Array<{ id: string; nome: string; tipo: string; ativo: boolean }>>('club-centros-custo', []);
  
  const [editingFatura, setEditingFatura] = useState<Fatura | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingFaturaId, setDeletingFaturaId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editingMovimento, setEditingMovimento] = useState<MovimentoConvocatoria | null>(null);
  const [isEditMovimentoDialogOpen, setIsEditMovimentoDialogOpen] = useState(false);
  const [deletingMovimentoId, setDeletingMovimentoId] = useState<string | null>(null);
  const [isDeleteMovimentoDialogOpen, setIsDeleteMovimentoDialogOpen] = useState(false);

  const userFaturas = useMemo(() => {
    const now = new Date();
    return (faturas || [])
      .filter(f => {
        if (f.user_id !== user.id) return false;
        
        if (f.tipo === 'mensalidade' && f.mes) {
          const [ano, mes] = f.mes.split('-').map(Number);
          const primeiroDiaMes = new Date(ano, mes - 1, 1);
          
          if (isAfter(primeiroDiaMes, now)) {
            return false;
          }
        }
        
        return true;
      })
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

  const getEstadoBadge = (estado: Fatura['estado_pagamento']) => {
    const variants = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      parcial: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={`${variants[estado]} text-xs px-1 py-0`}>{estado.toUpperCase()}</Badge>;
  };

  const handleEditFatura = (fatura: Fatura) => {
    setEditingFatura(fatura);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingFatura) return;
    
    setFaturas((currentFaturas) => 
      (currentFaturas || []).map(f => f.id === editingFatura.id ? editingFatura : f)
    );
    
    toast.success('Fatura atualizada com sucesso');
    setIsEditDialogOpen(false);
    setEditingFatura(null);
  };

  const handleDeleteFatura = (faturaId: string) => {
    setDeletingFaturaId(faturaId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingFaturaId) return;
    
    setFaturas((currentFaturas) => 
      (currentFaturas || []).filter(f => f.id !== deletingFaturaId)
    );
    
    setFaturaItens((currentItens) => 
      (currentItens || []).filter(item => item.fatura_id !== deletingFaturaId)
    );
    
    toast.success('Fatura eliminada com sucesso');
    setIsDeleteDialogOpen(false);
    setDeletingFaturaId(null);
  };

  const userMovimentosConvocatoria = useMemo(() => {
    return (movimentosConvocatoria || [])
      .filter(m => m.user_id === user.id)
      .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime());
  }, [movimentosConvocatoria, user.id]);

  const handleEditMovimento = (movimento: MovimentoConvocatoria) => {
    setEditingMovimento(movimento);
    setIsEditMovimentoDialogOpen(true);
  };

  const handleSaveMovimentoEdit = () => {
    if (!editingMovimento) return;
    
    setMovimentosConvocatoria((currentMovimentos) => 
      (currentMovimentos || []).map(m => m.id === editingMovimento.id ? editingMovimento : m)
    );
    
    toast.success('Movimento atualizado com sucesso');
    setIsEditMovimentoDialogOpen(false);
    setEditingMovimento(null);
  };

  const handleDeleteMovimento = (movimentoId: string) => {
    setDeletingMovimentoId(movimentoId);
    setIsDeleteMovimentoDialogOpen(true);
  };

  const confirmDeleteMovimento = () => {
    if (!deletingMovimentoId) return;
    
    setMovimentosConvocatoria((currentMovimentos) => 
      (currentMovimentos || []).filter(m => m.id !== deletingMovimentoId)
    );
    
    toast.success('Movimento eliminado com sucesso');
    setIsDeleteMovimentoDialogOpen(false);
    setDeletingMovimentoId(null);
  };

  const handleAddItemToMovimento = () => {
    if (!editingMovimento) return;
    
    const newItem: MovimentoConvocatoriaItem = {
      id: crypto.randomUUID(),
      movimento_convocatoria_id: editingMovimento.id,
      descricao: '',
      valor: 0,
    };
    
    setEditingMovimento({
      ...editingMovimento,
      itens: [...editingMovimento.itens, newItem],
    });
  };

  const handleRemoveItemFromMovimento = (itemId: string) => {
    if (!editingMovimento) return;
    
    setEditingMovimento({
      ...editingMovimento,
      itens: editingMovimento.itens.filter(item => item.id !== itemId),
    });
  };

  const handleUpdateMovimentoItem = (itemId: string, field: keyof MovimentoConvocatoriaItem, value: any) => {
    if (!editingMovimento) return;
    
    setEditingMovimento({
      ...editingMovimento,
      itens: editingMovimento.itens.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const recalculateMovimentoValor = () => {
    if (!editingMovimento) return;
    
    const total = editingMovimento.itens.reduce((sum, item) => sum + (item.valor || 0), 0);
    
    setEditingMovimento({
      ...editingMovimento,
      valor: total,
    });
  };

  const mensalidadesDisponiveis = mensalidades || [];

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
              {(costCenters || []).filter(c => c.ativo).length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                  Nenhum centro de custos configurado. Configure em Configurações → Financeiro.
                </div>
              ) : (
                (costCenters || [])
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
                    {isAdmin && <TableHead className="text-xs h-7 py-1 w-20">Ações</TableHead>}
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
                      {isAdmin && (
                        <TableCell className="py-1">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditFatura(fatura)}
                            >
                              <PencilSimple className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteFatura(fatura.id)}
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
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
        
        {userMovimentosConvocatoria.length === 0 ? (
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
                    {isAdmin && <TableHead className="text-xs h-7 py-1 w-20">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userMovimentosConvocatoria.map(movimento => (
                    <TableRow key={movimento.id} className="text-xs">
                      <TableCell className="py-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">{movimento.tipo}</Badge>
                      </TableCell>
                      <TableCell className="py-1">{format(new Date(movimento.data_emissao), 'dd/MM/yy')}</TableCell>
                      <TableCell className="py-1">{movimento.evento_nome}</TableCell>
                      <TableCell className="font-semibold py-1 text-red-600">-€{movimento.valor.toFixed(2)}</TableCell>
                      {isAdmin && (
                        <TableCell className="py-1">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditMovimento(movimento)}
                            >
                              <PencilSimple className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteMovimento(movimento.id)}
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Fatura</DialogTitle>
          </DialogHeader>
          {editingFatura && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-valor" className="text-xs">Valor Total</Label>
                <Input
                  id="edit-valor"
                  type="number"
                  step="0.01"
                  value={editingFatura.valor_total}
                  onChange={(e) => setEditingFatura({
                    ...editingFatura,
                    valor_total: parseFloat(e.target.value) || 0
                  })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-estado" className="text-xs">Estado de Pagamento</Label>
                <Select
                  value={editingFatura.estado_pagamento}
                  onValueChange={(value) => setEditingFatura({
                    ...editingFatura,
                    estado_pagamento: value as Fatura['estado_pagamento']
                  })}
                >
                  <SelectTrigger id="edit-estado" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-data-emissao" className="text-xs">Data de Emissão</Label>
                <Input
                  id="edit-data-emissao"
                  type="date"
                  value={editingFatura.data_emissao}
                  onChange={(e) => setEditingFatura({
                    ...editingFatura,
                    data_emissao: e.target.value
                  })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-data-vencimento" className="text-xs">Data de Vencimento</Label>
                <Input
                  id="edit-data-vencimento"
                  type="date"
                  value={editingFatura.data_vencimento}
                  onChange={(e) => setEditingFatura({
                    ...editingFatura,
                    data_vencimento: e.target.value
                  })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-recibo" className="text-xs">Número do Recibo</Label>
                <Input
                  id="edit-recibo"
                  value={editingFatura.numero_recibo || ''}
                  onChange={(e) => setEditingFatura({
                    ...editingFatura,
                    numero_recibo: e.target.value
                  })}
                  className="h-8 text-xs"
                  placeholder="Opcional"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-8 text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="h-8 text-xs">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Fatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar esta fatura? Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditMovimentoDialogOpen} onOpenChange={setIsEditMovimentoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Movimento de Custos Internos</DialogTitle>
          </DialogHeader>
          {editingMovimento && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Evento</Label>
                <Input
                  value={editingMovimento.evento_nome}
                  disabled
                  className="h-8 text-xs bg-muted"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-movimento-data" className="text-xs">Data de Emissão</Label>
                <Input
                  id="edit-movimento-data"
                  type="date"
                  value={editingMovimento.data_emissao}
                  onChange={(e) => setEditingMovimento({
                    ...editingMovimento,
                    data_emissao: e.target.value
                  })}
                  className="h-8 text-xs"
                />
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold">Itens do Movimento</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItemToMovimento}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Item
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {editingMovimento.itens.map((item, index) => (
                    <Card key={item.id} className="p-2">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Descrição</Label>
                            <Textarea
                              value={item.descricao}
                              onChange={(e) => handleUpdateMovimentoItem(item.id, 'descricao', e.target.value)}
                              className="h-16 text-xs resize-none"
                              placeholder="Ex: Inscrição na prova 50m Livres"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Valor (€)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.valor}
                              onChange={(e) => {
                                handleUpdateMovimentoItem(item.id, 'valor', parseFloat(e.target.value) || 0);
                                setTimeout(recalculateMovimentoValor, 0);
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive mt-5"
                          onClick={() => {
                            handleRemoveItemFromMovimento(item.id);
                            setTimeout(recalculateMovimentoValor, 0);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {editingMovimento.itens.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground border rounded-lg text-xs">
                    <p>Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Valor Total</Label>
                  <p className="text-lg font-bold text-red-600">-€{editingMovimento.valor.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMovimentoDialogOpen(false)} className="h-8 text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSaveMovimentoEdit} className="h-8 text-xs">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteMovimentoDialogOpen} onOpenChange={setIsDeleteMovimentoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Movimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar este movimento de custos internos? Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMovimento} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
