import { Head, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Plus, ShoppingCart, Package, TrendUp } from '@phosphor-icons/react';

interface Product {
    id: string;
    nome: string;
    descricao?: string;
    codigo: string;
    categoria?: string;
    preco: number;
    stock: number;
    stock_minimo: number;
    imagem?: string;
    ativo: boolean;
    is_low_stock: boolean;
}

interface Stats {
    total_produtos: number;
    valor_total_stock: number;
    produtos_baixo_stock: number;
}

interface Props {
    products: Product[];
    stats: Stats;
    categorias: string[];
    filters?: {
        categoria?: string;
        ativo?: boolean;
        low_stock?: boolean;
    };
}

export default function InventarioIndex({ products, stats, categorias, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        codigo: '',
        categoria: '',
        preco: 0,
        stock: 0,
        stock_minimo: 0,
        ativo: true,
    });

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            codigo: '',
            categoria: '',
            preco: 0,
            stock: 0,
            stock_minimo: 0,
            ativo: true,
        });
        setEditingProduct(null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (editingProduct) {
            router.put(`/inventario/${editingProduct.id}`, formData, {
                onSuccess: () => {
                    setDialogOpen(false);
                    resetForm();
                },
            });
        } else {
            router.post('/inventario', formData, {
                onSuccess: () => {
                    setDialogOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            nome: product.nome,
            descricao: product.descricao || '',
            codigo: product.codigo,
            categoria: product.categoria || '',
            preco: product.preco,
            stock: product.stock,
            stock_minimo: product.stock_minimo,
            ativo: product.ativo,
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja eliminar este produto?')) {
            router.delete(`/inventario/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Gestão de Inventário
                </h1>
            }
        >
            <Head title="Gestão de Inventário" />

            <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
                <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Inventário</h1>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            {products?.length || 0} produtos em stock
                        </p>
                    </div>
                    
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="h-8 text-xs">
                                <Plus className="mr-1.5 sm:mr-2" size={16} />
                                <span className="hidden sm:inline">Novo Produto</span>
                                <span className="sm:hidden">Novo</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome *</Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        placeholder="Nome do produto"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="codigo">Código *</Label>
                                    <Input
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        placeholder="Código único do produto"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoria</Label>
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
                                            required
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
                                            required
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
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => {
                                        setDialogOpen(false);
                                        resetForm();
                                    }}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                    <Card className="p-2 sm:p-3">
                        <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground font-medium leading-tight">Valor Total em Stock</p>
                                <p className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5 truncate">€{stats.valor_total_stock.toFixed(2)}</p>
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
                                <p className="text-lg sm:text-xl font-bold mt-0.5">{stats.total_produtos}</p>
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
                                <p className="text-lg sm:text-xl font-bold text-orange-600 mt-0.5">{stats.produtos_baixo_stock}</p>
                            </div>
                            <div className="p-1.5 rounded-lg bg-orange-50 flex-shrink-0">
                                <TrendUp className="text-orange-600" size={16} weight="bold" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Products Grid */}
                <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {products.map(product => (
                        <Card key={product.id} className="p-2.5 sm:p-3 transition-all hover:shadow-md">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-sm line-clamp-2 flex-1">{product.nome}</h3>
                                    <Badge variant={product.is_low_stock ? 'destructive' : 'default'} className="text-xs flex-shrink-0">
                                        {product.is_low_stock ? 'Stock Baixo' : 'OK'}
                                    </Badge>
                                </div>

                                <div className="text-lg sm:text-xl font-bold text-primary">
                                    €{product.preco.toFixed(2)}
                                </div>

                                <div className="space-y-0.5 text-xs">
                                    <p className="text-muted-foreground truncate">Código: {product.codigo}</p>
                                    {product.categoria && (
                                        <p className="text-muted-foreground truncate">Categoria: {product.categoria}</p>
                                    )}
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

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-8 text-xs"
                                        onClick={() => handleEdit(product)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 text-xs"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
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
        </AuthenticatedLayout>
    );
}
