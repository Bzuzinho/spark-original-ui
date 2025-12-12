import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Product, Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ShoppingCart, Package, TrendUp } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function InventoryView() {
  const [products, setProducts] = useKV<Product[]>('club-products', []);
  const [sales] = useKV<Sale[]>('club-sales', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    preco: 0,
    stock: 0,
    stock_minimo: 0,
    ativo: true,
  });

  const handleCreate = () => {
    if (!formData.nome.trim() || !formData.categoria) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...formData,
      descricao: formData.descricao || undefined,
    };

    setProducts(current => [...(current || []), newProduct]);
    toast.success('Produto adicionado!');
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      preco: 0,
      stock: 0,
      stock_minimo: 0,
      ativo: true,
    });
  };

  const totalValue = (products || []).reduce((sum, p) => sum + (p.preco * p.stock), 0);
  const lowStock = (products || []).filter(p => p.stock <= p.stock_minimo).length;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Inventário</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {products?.length || 0} produtos em stock
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-8 text-xs">
              <Plus className="mr-1.5 sm:mr-2" size={16} />
              <span className="hidden sm:inline">Novo Produto</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Equipamento, Merchandising"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do produto"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (€) *</Label>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
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

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>
                  Adicionar Produto
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        <Card className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium leading-tight">Valor Total em Stock</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5 truncate">€{totalValue.toFixed(2)}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
              <Package className="text-blue-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium leading-tight">Produtos</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5">{products?.length || 0}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
              <ShoppingCart className="text-green-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 col-span-2 sm:col-span-1">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium leading-tight">Stock Baixo</p>
              <p className="text-lg sm:text-xl font-bold text-orange-600 mt-0.5">{lowStock}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-orange-50 flex-shrink-0">
              <TrendUp className="text-orange-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {(products || []).map(product => (
          <Card key={product.id} className="p-2.5 sm:p-3 transition-all hover:shadow-md">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1">{product.nome}</h3>
                <Badge variant={product.stock <= product.stock_minimo ? 'destructive' : 'default'} className="text-xs flex-shrink-0">
                  {product.stock <= product.stock_minimo ? 'Stock Baixo' : 'OK'}
                </Badge>
              </div>

              <div className="text-lg sm:text-xl font-bold text-primary">
                €{product.preco.toFixed(2)}
              </div>

              <div className="space-y-0.5 text-xs">
                <p className="text-muted-foreground truncate">Categoria: {product.categoria}</p>
                {product.descricao && (
                  <p className="text-muted-foreground line-clamp-2">{product.descricao}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Stock Atual</p>
                  <p className="font-semibold text-sm">{product.stock}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock Mínimo</p>
                  <p className="font-semibold text-sm">{product.stock_minimo}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(!products || products.length === 0) && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <Package className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhum produto registado</h3>
            <p className="text-muted-foreground text-xs">
              Adicione produtos ao seu inventário.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
