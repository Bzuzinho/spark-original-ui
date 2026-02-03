import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import type { EncomendaArtigo, ArtigoLoja, User, CentroCusto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, CheckCircle, XCircle, Clock, Pencil, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';

type EstadoEncomenda = 'pendente' | 'aprovada' | 'em_preparacao' | 'entregue' | 'cancelada';
type LocalEntrega = 'clube' | 'morada_atleta' | 'outro';

export function EncomendasTab() {
  const [encomendas, setEncomendas] = useKV<EncomendaArtigo[]>('loja-encomendas', []);
  const [artigos] = useKV<ArtigoLoja[]>('loja-artigos', []);
  const [users] = useKV<User[]>('club-users', []);
  const [centrosCusto] = useKV<CentroCusto[]>('club-centros-custo', []);
  const [escaloes] = useKV<any[]>('settings-age-groups', []);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEncomenda, setEditingEncomenda] = useState<EncomendaArtigo | null>(null);
  
  const [formData, setFormData] = useState<{
    user_id: string;
    artigo_id: string;
    quantidade: number;
    escalao_id: string;
    centro_custo_id: string;
    local_entrega: LocalEntrega;
    morada_entrega: string;
    observacoes: string;
  }>({
    user_id: '',
    artigo_id: '',
    quantidade: 1,
    escalao_id: '',
    centro_custo_id: '',
    local_entrega: 'clube',
    morada_entrega: '',
    observacoes: '',
  });

  const handleCreate = async () => {
    if (!formData.user_id || !formData.artigo_id || !formData.escalao_id || !formData.centro_custo_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const artigo = (artigos || []).find(a => a.id === formData.artigo_id);
    if (!artigo) {
      toast.error('Artigo não encontrado');
      return;
    }

    if (artigo.stock_atual < formData.quantidade) {
      toast.error('Stock insuficiente');
      return;
    }

    const valor_unitario = artigo.preco_venda;
    const valor_total = valor_unitario * formData.quantidade;

    const novaEncomenda: EncomendaArtigo = {
      id: crypto.randomUUID(),
      data_encomenda: new Date().toISOString(),
      user_id: formData.user_id,
      artigo_id: formData.artigo_id,
      quantidade: formData.quantidade,
      valor_unitario,
      valor_total,
      escalao_id: formData.escalao_id,
      centro_custo_id: formData.centro_custo_id,
      local_entrega: formData.local_entrega,
      morada_entrega: formData.local_entrega !== 'clube' ? formData.morada_entrega : undefined,
      estado: 'pendente',
      observacoes: formData.observacoes || undefined,
      created_at: new Date().toISOString(),
    };

    setEncomendas(current => [...(current || []), novaEncomenda]);
    
    const faturas = await window.spark.kv.get<any[]>('club-faturas') || [];
    const novaFatura = {
      id: crypto.randomUUID(),
      user_id: formData.user_id,
      data_fatura: new Date().toISOString(),
      data_emissao: new Date().toISOString(),
      data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      valor_total,
      estado_pagamento: 'pendente' as const,
      centro_custo_id: formData.centro_custo_id,
      tipo: 'material' as const,
      observacoes: `Encomenda de artigo: ${artigo.nome}`,
      created_at: new Date().toISOString(),
    };
    
    await window.spark.kv.set('club-faturas', [...faturas, novaFatura]);
    
    const faturaItens = await window.spark.kv.get<any[]>('club-fatura-itens') || [];
    const novoItem = {
      id: crypto.randomUUID(),
      fatura_id: novaFatura.id,
      descricao: artigo.nome,
      valor_unitario,
      quantidade: formData.quantidade,
      imposto_percentual: 0,
      total_linha: valor_total,
      produto_id: artigo.id,
      centro_custo_id: formData.centro_custo_id,
      created_at: new Date().toISOString(),
    };
    
    await window.spark.kv.set('club-fatura-itens', [...faturaItens, novoItem]);

    toast.success('Encomenda criada e fatura gerada!');
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdateEstado = (encomendaId: string, novoEstado: EstadoEncomenda) => {
    setEncomendas(current => 
      (current || []).map(enc => 
        enc.id === encomendaId ? { ...enc, estado: novoEstado } : enc
      )
    );
    toast.success('Estado atualizado!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja eliminar esta encomenda?')) {
      setEncomendas(current => (current || []).filter(enc => enc.id !== id));
      toast.success('Encomenda eliminada!');
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      artigo_id: '',
      quantidade: 1,
      escalao_id: '',
      centro_custo_id: '',
      local_entrega: 'clube',
      morada_entrega: '',
      observacoes: '',
    });
    setEditingEncomenda(null);
  };

  const getEstadoBadge = (estado: EstadoEncomenda) => {
    const variants: Record<EstadoEncomenda, { variant: any; icon: any; label: string }> = {
      pendente: { variant: 'secondary', icon: Clock, label: 'Pendente' },
      aprovada: { variant: 'default', icon: CheckCircle, label: 'Aprovada' },
      em_preparacao: { variant: 'default', icon: Package, label: 'Em Preparação' },
      entregue: { variant: 'default', icon: CheckCircle, label: 'Entregue' },
      cancelada: { variant: 'destructive', icon: XCircle, label: 'Cancelada' },
    };
    
    const { variant, icon: Icon, label } = variants[estado];
    
    return (
      <Badge variant={variant} className="text-xs gap-1">
        <Icon size={12} weight="bold" />
        {label}
      </Badge>
    );
  };

  const atletasAtivos = (users || []).filter(u => u.estado === 'ativo' && u.tipo_membro.includes('atleta'));

  const totalEncomendas = (encomendas || []).length;
  const totalPendentes = (encomendas || []).filter(e => e.estado === 'pendente').length;
  const totalEntregues = (encomendas || []).filter(e => e.estado === 'entregue').length;
  const valorTotal = (encomendas || []).reduce((sum, e) => sum + e.valor_total, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Encomendas de Artigos</h2>
          <p className="text-xs text-muted-foreground">{totalEncomendas} encomendas registadas</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-8 text-xs">
              <Plus className="mr-1.5" size={16} />
              Nova Encomenda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Encomenda de Artigo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id">Atleta *</Label>
                  <Select value={formData.user_id} onValueChange={(value) => {
                    setFormData({ ...formData, user_id: value });
                    const user = (users || []).find(u => u.id === value);
                    if (user && user.escalao && user.escalao.length > 0) {
                      setFormData(prev => ({ ...prev, escalao_id: user.escalao![0] }));
                    }
                  }}>
                    <SelectTrigger id="user_id">
                      <SelectValue placeholder="Selecione o atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {atletasAtivos.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.nome_completo} ({user.numero_socio})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artigo_id">Artigo *</Label>
                  <Select value={formData.artigo_id} onValueChange={(value) => setFormData({ ...formData, artigo_id: value })}>
                    <SelectTrigger id="artigo_id">
                      <SelectValue placeholder="Selecione o artigo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(artigos || []).filter(a => a.ativo && a.stock_atual > 0).map(artigo => (
                        <SelectItem key={artigo.id} value={artigo.id}>
                          {artigo.nome} - €{artigo.preco_venda.toFixed(2)} (Stock: {artigo.stock_atual})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="escalao_id">Escalão do Atleta *</Label>
                  <Select value={formData.escalao_id} onValueChange={(value) => setFormData({ ...formData, escalao_id: value })}>
                    <SelectTrigger id="escalao_id">
                      <SelectValue placeholder="Selecione o escalão" />
                    </SelectTrigger>
                    <SelectContent>
                      {(escaloes || []).map(escalao => (
                        <SelectItem key={escalao.id} value={escalao.id}>
                          {escalao.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="centro_custo_id">Centro de Custos *</Label>
                <Select value={formData.centro_custo_id} onValueChange={(value) => setFormData({ ...formData, centro_custo_id: value })}>
                  <SelectTrigger id="centro_custo_id">
                    <SelectValue placeholder="Selecione o centro de custos" />
                  </SelectTrigger>
                  <SelectContent>
                    {(centrosCusto || []).filter(cc => cc.ativo).map(cc => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.nome} ({cc.tipo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="local_entrega">Local de Entrega *</Label>
                <Select value={formData.local_entrega} onValueChange={(value: LocalEntrega) => setFormData({ ...formData, local_entrega: value })}>
                  <SelectTrigger id="local_entrega">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clube">Clube</SelectItem>
                    <SelectItem value="morada_atleta">Morada do Atleta</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.local_entrega !== 'clube' && (
                <div className="space-y-2">
                  <Label htmlFor="morada_entrega">Morada de Entrega</Label>
                  <Textarea
                    id="morada_entrega"
                    value={formData.morada_entrega}
                    onChange={(e) => setFormData({ ...formData, morada_entrega: e.target.value })}
                    placeholder="Insira a morada de entrega"
                    rows={2}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>
                  Criar Encomenda
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        <Card className="p-2 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium">Total Encomendas</p>
          <p className="text-lg sm:text-xl font-bold mt-0.5">{totalEncomendas}</p>
        </Card>
        <Card className="p-2 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium">Pendentes</p>
          <p className="text-lg sm:text-xl font-bold text-orange-600 mt-0.5">{totalPendentes}</p>
        </Card>
        <Card className="p-2 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium">Entregues</p>
          <p className="text-lg sm:text-xl font-bold text-green-600 mt-0.5">{totalEntregues}</p>
        </Card>
        <Card className="p-2 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium">Valor Total</p>
          <p className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5">€{valorTotal.toFixed(2)}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs">Atleta</TableHead>
                <TableHead className="text-xs">Artigo</TableHead>
                <TableHead className="text-xs">Qtd</TableHead>
                <TableHead className="text-xs">Valor</TableHead>
                <TableHead className="text-xs">Escalão</TableHead>
                <TableHead className="text-xs">Entrega</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(encomendas || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                    Nenhuma encomenda registada
                  </TableCell>
                </TableRow>
              ) : (
                (encomendas || []).map(encomenda => {
                  const user = (users || []).find(u => u.id === encomenda.user_id);
                  const artigo = (artigos || []).find(a => a.id === encomenda.artigo_id);
                  const escalao = (escaloes || []).find(e => e.id === encomenda.escalao_id);
                  
                  return (
                    <TableRow key={encomenda.id}>
                      <TableCell className="text-xs">
                        {new Date(encomenda.data_encomenda).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell className="text-xs">
                        {user?.nome_completo || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {artigo?.nome || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {encomenda.quantidade}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        €{encomenda.valor_total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {escalao?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {encomenda.local_entrega === 'clube' ? 'Clube' : 
                         encomenda.local_entrega === 'morada_atleta' ? 'Morada Atleta' : 'Outro'}
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(encomenda.estado)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {encomenda.estado === 'pendente' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateEstado(encomenda.id, 'aprovada')}
                              className="h-7 text-xs px-2"
                            >
                              Aprovar
                            </Button>
                          )}
                          {encomenda.estado === 'aprovada' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateEstado(encomenda.id, 'entregue')}
                              className="h-7 text-xs px-2"
                            >
                              Entregar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(encomenda.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash size={14} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
