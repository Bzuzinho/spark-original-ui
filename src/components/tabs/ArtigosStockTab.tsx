import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import type { ArtigoLoja, Fornecedor, CentroCusto, MovimentoStock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, TrendUp, Pencil, Trash, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function ArtigosStockTab() {
  const [artigos, setArtigos] = useKV<ArtigoLoja[]>('loja-artigos', []);
  const [movimentosStock, setMovimentosStock] = useKV<MovimentoStock[]>('loja-movimentos-stock', []);
  const [fornecedores] = useKV<Fornecedor[]>('loja-fornecedores', []);
  const [centrosCusto] = useKV<CentroCusto[]>('club-centros-custo', []);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movimentoDialogOpen, setMovimentoDialogOpen] = useState(false);
  const [editingArtigo, setEditingArtigo] = useState<ArtigoLoja | null>(null);
  const [selectedArtigo, setSelectedArtigo] = useState<ArtigoLoja | null>(null);
  
  const [formData, setFormData] = useState<{
    nome: string;
    descricao: string;
    categoria: string;
    preco_venda: number;
    preco_custo: number;
    stock_atual: number;
    stock_minimo: number;
    fornecedor_id: string;
    centro_custo_id: string;
    ativo: boolean;
  }>({
    nome: '',
    descricao: '',
    categoria: '',
    preco_venda: 0,
    preco_custo: 0,
    stock_atual: 0,
    stock_minimo: 0,
    fornecedor_id: '',
    centro_custo_id: '',
    ativo: true,
  });

  const [movimentoData, setMovimentoData] = useState<{
    tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
    quantidade: number;
    motivo: string;
    fornecedor_id: string;
    valor_unitario: number;
  }>({
    tipo: 'entrada',
    quantidade: 0,
    motivo: '',
    fornecedor_id: '',
    valor_unitario: 0,
  });

  const handleCreate = () => {
    if (!formData.nome.trim() || !formData.categoria || !formData.centro_custo_id) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (editingArtigo) {
      setArtigos(current =>
        (current || []).map(artigo =>
          artigo.id === editingArtigo.id
            ? { ...artigo, ...formData }
            : artigo
        )
      );
      toast.success('Artigo atualizado!');
    } else {
      const novoArtigo: ArtigoLoja = {
        id: crypto.randomUUID(),
        ...formData,
        descricao: formData.descricao || undefined,
        preco_custo: formData.preco_custo || undefined,
        fornecedor_id: formData.fornecedor_id || undefined,
        created_at: new Date().toISOString(),
      };

      setArtigos(current => [...(current || []), novoArtigo]);
      toast.success('Artigo adicionado!');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleMovimentoStock = () => {
    if (!selectedArtigo || movimentoData.quantidade <= 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    const stockAnterior = selectedArtigo.stock_atual;
    let stockNovo = stockAnterior;

    if (movimentoData.tipo === 'entrada' || movimentoData.tipo === 'devolucao') {
      stockNovo = stockAnterior + movimentoData.quantidade;
    } else if (movimentoData.tipo === 'saida') {
      stockNovo = stockAnterior - movimentoData.quantidade;
    } else if (movimentoData.tipo === 'ajuste') {
      stockNovo = movimentoData.quantidade;
    }

    if (stockNovo < 0) {
      toast.error('Stock não pode ser negativo');
      return;
    }

    const movimento: MovimentoStock = {
      id: crypto.randomUUID(),
      artigo_id: selectedArtigo.id,
      tipo: movimentoData.tipo,
      quantidade: movimentoData.quantidade,
      stock_anterior: stockAnterior,
      stock_novo: stockNovo,
      motivo: movimentoData.motivo || undefined,
      fornecedor_id: movimentoData.fornecedor_id || undefined,
      valor_unitario: movimentoData.valor_unitario || undefined,
      centro_custo_id: selectedArtigo.centro_custo_id,
      data_movimento: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setMovimentosStock(current => [...(current || []), movimento]);

    setArtigos(current =>
      (current || []).map(art =>
        art.id === selectedArtigo.id
          ? { ...art, stock_atual: stockNovo }
          : art
      )
    );

    toast.success('Movimento de stock registado!');
    setMovimentoDialogOpen(false);
    resetMovimentoForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja eliminar este artigo?')) {
      setArtigos(current => (current || []).filter(art => art.id !== id));
      toast.success('Artigo eliminado!');
    }
  };

  const handleEdit = (artigo: ArtigoLoja) => {
    setEditingArtigo(artigo);
    setFormData({
      nome: artigo.nome,
      descricao: artigo.descricao || '',
      categoria: artigo.categoria,
      preco_venda: artigo.preco_venda,
      preco_custo: artigo.preco_custo || 0,
      stock_atual: artigo.stock_atual,
      stock_minimo: artigo.stock_minimo,
      fornecedor_id: artigo.fornecedor_id || '',
      centro_custo_id: artigo.centro_custo_id || '',
      ativo: artigo.ativo,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      preco_venda: 0,
      preco_custo: 0,
      stock_atual: 0,
      stock_minimo: 0,
      fornecedor_id: '',
      centro_custo_id: '',
      ativo: true,
    });
    setEditingArtigo(null);
  };

  const resetMovimentoForm = () => {
    setMovimentoData({
      tipo: 'entrada',
      quantidade: 0,
      motivo: '',
      fornecedor_id: '',
      valor_unitario: 0,
    });
    setSelectedArtigo(null);
  };

  const totalArtigos = (artigos || []).length;
  const totalStockBaixo = (artigos || []).filter(a => a.stock_atual <= a.stock_minimo).length;
  const valorTotalStock = (artigos || []).reduce((sum, a) => sum + (a.preco_venda * a.stock_atual), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Gestão de Artigos e Stocks</h2>
          <p className="text-xs text-muted-foreground">{totalArtigos} artigos registados</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-8 text-xs">
              <Plus className="mr-1.5" size={16} />
              Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArtigo ? 'Editar Artigo' : 'Novo Artigo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Artigo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: T-Shirt do Clube"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Ex: Vestuário, Equipamento"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do artigo"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_venda">Preço de Venda (€) *</Label>
                  <Input
                    id="preco_venda"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData({ ...formData, preco_venda: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_custo">Preço de Custo (€)</Label>
                  <Input
                    id="preco_custo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.preco_custo}
                    onChange={(e) => setFormData({ ...formData, preco_custo: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_atual">Stock Atual *</Label>
                  <Input
                    id="stock_atual"
                    type="number"
                    min="0"
                    value={formData.stock_atual}
                    onChange={(e) => setFormData({ ...formData, stock_atual: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
                  <Input
                    id="stock_minimo"
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fornecedor_id">Fornecedor</Label>
                  <Select value={formData.fornecedor_id} onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}>
                    <SelectTrigger id="fornecedor_id">
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {(fornecedores || []).filter(f => f.ativo).map(fornecedor => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>
                  {editingArtigo ? 'Atualizar' : 'Adicionar'} Artigo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={movimentoDialogOpen} onOpenChange={setMovimentoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Movimento de Stock - {selectedArtigo?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Stock Atual</p>
              <p className="text-xl font-bold">{selectedArtigo?.stock_atual || 0} unidades</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_movimento">Tipo de Movimento *</Label>
              <Select value={movimentoData.tipo} onValueChange={(value: 'entrada' | 'saida' | 'ajuste' | 'devolucao') => setMovimentoData({ ...movimentoData, tipo: value })}>
                <SelectTrigger id="tipo_movimento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade_mov">Quantidade *</Label>
              <Input
                id="quantidade_mov"
                type="number"
                min="0"
                value={movimentoData.quantidade}
                onChange={(e) => setMovimentoData({ ...movimentoData, quantidade: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {movimentoData.tipo === 'entrada' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fornecedor_mov">Fornecedor</Label>
                  <Select value={movimentoData.fornecedor_id} onValueChange={(value) => setMovimentoData({ ...movimentoData, fornecedor_id: value })}>
                    <SelectTrigger id="fornecedor_mov">
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {(fornecedores || []).filter(f => f.ativo).map(fornecedor => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_unitario">Valor Unitário (€)</Label>
                  <Input
                    id="valor_unitario"
                    type="number"
                    min="0"
                    step="0.01"
                    value={movimentoData.valor_unitario}
                    onChange={(e) => setMovimentoData({ ...movimentoData, valor_unitario: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="motivo_mov">Motivo</Label>
              <Textarea
                id="motivo_mov"
                value={movimentoData.motivo}
                onChange={(e) => setMovimentoData({ ...movimentoData, motivo: e.target.value })}
                placeholder="Motivo do movimento"
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => { setMovimentoDialogOpen(false); resetMovimentoForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleMovimentoStock}>
                Registar Movimento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-2 grid-cols-3">
        <Card className="p-2 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium">Total Artigos</p>
          <p className="text-lg sm:text-xl font-bold mt-0.5">{totalArtigos}</p>
        </Card>
        <Card className="p-2 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium">Stock Baixo</p>
          <p className="text-lg sm:text-xl font-bold text-orange-600 mt-0.5">{totalStockBaixo}</p>
        </Card>
        <Card className="p-2 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium">Valor Total</p>
          <p className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5">€{valorTotalStock.toFixed(2)}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nome</TableHead>
                <TableHead className="text-xs">Categoria</TableHead>
                <TableHead className="text-xs">Preço Venda</TableHead>
                <TableHead className="text-xs">Stock</TableHead>
                <TableHead className="text-xs">Stock Mín.</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(artigos || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum artigo registado
                  </TableCell>
                </TableRow>
              ) : (
                (artigos || []).map(artigo => (
                  <TableRow key={artigo.id}>
                    <TableCell className="text-xs font-medium">{artigo.nome}</TableCell>
                    <TableCell className="text-xs">{artigo.categoria}</TableCell>
                    <TableCell className="text-xs font-semibold">€{artigo.preco_venda.toFixed(2)}</TableCell>
                    <TableCell className="text-xs">
                      <span className={artigo.stock_atual <= artigo.stock_minimo ? 'text-orange-600 font-semibold' : ''}>
                        {artigo.stock_atual}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{artigo.stock_minimo}</TableCell>
                    <TableCell>
                      <Badge variant={artigo.stock_atual <= artigo.stock_minimo ? 'destructive' : 'default'} className="text-xs">
                        {artigo.stock_atual <= artigo.stock_minimo ? 'Baixo' : 'OK'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedArtigo(artigo);
                            setMovimentoDialogOpen(true);
                          }}
                          className="h-7 text-xs px-2"
                        >
                          <Package size={14} className="mr-1" />
                          Stock
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(artigo)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(artigo.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
