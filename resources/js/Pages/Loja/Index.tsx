import { FormEvent, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

type StoreProduct = {
  id: string;
  codigo: string;
  nome: string;
  categoria?: string | null;
  descricao?: string | null;
  imagem?: string | null;
  preco: number;
  stock_available: number;
  variant_options: string[];
};

type Profile = {
  id: string;
  nome_completo: string;
  is_self: boolean;
};

type CartItem = {
  id: string;
  article_id: string;
  variant?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  article: {
    id: string;
    codigo: string;
    nome: string;
    imagem?: string | null;
    stock_available: number;
  } | null;
};

type OrderItem = {
  id: string;
  article_code_snapshot: string;
  article_name_snapshot: string;
  variant_snapshot?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type StoreOrder = {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  notes?: string | null;
  created_at: string;
  user: { id: string; nome_completo: string } | null;
  target_user: { id: string; nome_completo: string } | null;
  financial_invoice: {
    id: string;
    valor_total: number;
    estado_pagamento: string;
  } | null;
  items: OrderItem[];
};

type Props = {
  activeTab: 'loja' | 'pedidos';
  products: StoreProduct[];
  categories: string[];
  filters: {
    search?: string;
    category?: string | null;
  };
  profiles: Profile[];
  selectedProfileId: string;
  cart: {
    items: CartItem[];
    subtotal: number;
    total: number;
  };
  orders: StoreOrder[];
  canManagePendingOrders: boolean;
  statusLabels: Record<string, string>;
};

function euro(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value || 0);
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-PT');
}

export default function LojaIndex({
  activeTab,
  products,
  categories,
  filters,
  profiles,
  selectedProfileId,
  cart,
  orders,
  canManagePendingOrders,
  statusLabels,
}: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || 'all');
  const [productQty, setProductQty] = useState<Record<string, number>>({});
  const [productVariant, setProductVariant] = useState<Record<string, string>>({});
  const [cartVariantDraft, setCartVariantDraft] = useState<Record<string, string>>({});
  const [orderNotes, setOrderNotes] = useState('');
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<StoreOrder | null>(null);
  const [editingOrderNotes, setEditingOrderNotes] = useState('');
  const [editingOrderQuantities, setEditingOrderQuantities] = useState<Record<string, number>>({});

  const cartItemsCount = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items],
  );

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) || profiles[0],
    [profiles, selectedProfileId],
  );

  const goToTab = (tab: string, extraParams?: Record<string, string>) => {
    const routeName = tab === 'pedidos' ? 'loja.pedidos' : 'loja.index';

    router.get(
      route(routeName),
      {
        target_user_id: selectedProfileId,
        ...(tab === 'loja' ? { search: search || undefined, category: category === 'all' ? undefined : category } : {}),
        ...extraParams,
      },
      { preserveState: true, replace: true },
    );
  };

  const submitFilters = (e: FormEvent) => {
    e.preventDefault();
    goToTab('loja');
  };

  const onProfileChange = (profileId: string) => {
    goToTab(activeTab, { target_user_id: profileId });
  };

  const addToCart = (product: StoreProduct) => {
    const quantity = Math.max(1, Number(productQty[product.id] || 1));
    const variant = productVariant[product.id] || null;

    if (product.variant_options.length > 0 && !variant) {
      return;
    }

    router.post(
      route('loja.cart.store'),
      {
        article_id: product.id,
        target_user_id: selectedProfileId,
        quantity,
        variant,
      },
      {
        preserveScroll: true,
      },
    );
  };

  const updateCartItem = (item: CartItem, nextQuantity: number, nextVariant?: string) => {
    router.put(
      route('loja.cart.update', item.id),
      {
        quantity: Math.max(1, nextQuantity),
        variant: nextVariant ?? item.variant ?? null,
      },
      {
        preserveScroll: true,
      },
    );
  };

  const removeCartItem = (item: CartItem) => {
    router.delete(route('loja.cart.destroy', item.id), {
      preserveScroll: true,
    });
  };

  const confirmOrder = () => {
    router.post(
      route('loja.orders.store'),
      {
        target_user_id: selectedProfileId,
        notes: orderNotes || null,
      },
      {
        preserveScroll: true,
      },
    );
  };

  const openEditOrderModal = (order: StoreOrder) => {
    setEditingOrder(order);
    setEditingOrderNotes(order.notes || '');
    setEditingOrderQuantities(
      Object.fromEntries(order.items.map((item) => [item.id, item.quantity])),
    );
  };

  const submitOrderUpdate = () => {
    if (!editingOrder) return;

    router.put(
      route('loja.orders.update', editingOrder.id),
      {
        notes: editingOrderNotes || null,
        items: editingOrder.items.map((item) => ({
          id: item.id,
          quantity: Math.max(1, Number(editingOrderQuantities[item.id] ?? item.quantity)),
        })),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingOrder(null);
          setEditingOrderNotes('');
          setEditingOrderQuantities({});
        },
      },
    );
  };

  const deletePendingOrder = (order: StoreOrder) => {
    if (!window.confirm('Pretende apagar este pedido pendente? Esta ação vai repor o stock e remover a fatura associada.')) {
      return;
    }

    router.delete(route('loja.orders.destroy', order.id), {
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      fullWidth
      header={
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Loja do Clube</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Loja interna para membros, atletas e encarregados</p>
        </div>
      }
    >
      <Head title="Loja do Clube" />

      <div className="flex flex-col gap-3">
        <section>
        <Tabs value={activeTab} onValueChange={goToTab} className="space-y-3">
          <TabsList className="grid w-full grid-cols-2 h-auto gap-1">
            <TabsTrigger value="loja">Loja</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="loja" className="space-y-3">
            <Card className="w-full gap-0 py-0">
              <CardContent className="p-1.5 sm:p-2">
                <div className="grid gap-1 md:grid-cols-[minmax(0,1fr)_190px] lg:grid-cols-[minmax(0,1fr)_210px]">
                  <div className="grid gap-1 sm:grid-cols-2">
                    <div className="rounded-md border bg-muted/20 p-1.5 text-sm">
                      <Label className="text-[11px] font-medium">Perfil de compra</Label>
                      <Select value={selectedProfileId} onValueChange={onProfileChange}>
                        <SelectTrigger className="mt-1 h-7 bg-white text-xs">
                          <SelectValue placeholder="Selecionar perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.nome_completo} {profile.is_self ? '(Eu)' : '(Dependente)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-md border bg-muted/20 p-1.5 text-sm">
                      <p className="text-[11px] font-medium text-foreground">A comprar para</p>
                      <div className="flex min-h-7 items-center">
                        <p className="text-xs text-muted-foreground">{selectedProfile?.nome_completo || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCartModalOpen(true)}
                    className="flex h-full min-h-16 items-center justify-between rounded-md border bg-muted/20 p-2 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="space-y-0">
                      <p className="text-xs font-medium text-foreground">Carrinho</p>
                      <p className="text-xs text-muted-foreground">{cartItemsCount} item(ns)</p>
                      <p className="text-sm font-semibold text-foreground">{euro(cart.total)}</p>
                    </div>

                    <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm">
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 py-0">
              <CardContent className="p-2 sm:p-2.5">
                <form onSubmit={submitFilters} className="grid gap-2 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <Label className="text-xs">Pesquisar</Label>
                    <Input
                      className="mt-1 h-9 bg-white text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Nome, código ou descrição"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1 h-9 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="h-9 w-full">Filtrar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const qty = productQty[product.id] ?? 1;
                const variant = productVariant[product.id] ?? '';

                return (
                  <Card key={product.id} className="overflow-hidden gap-0 py-0">
                    <CardContent className="space-y-2 p-2.5 sm:p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border bg-muted/20 p-2 sm:h-24 sm:w-24">
                          {product.imagem ? (
                            <img
                              src={product.imagem}
                              alt={product.nome}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-center text-xs text-muted-foreground">
                              Sem imagem
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="text-sm font-semibold leading-tight text-foreground sm:text-base">
                            {product.nome}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            {product.categoria && (
                              <Badge variant="secondary" className="h-5 px-2 text-[11px] font-medium">
                                {product.categoria}
                              </Badge>
                            )}
                            <span className="text-muted-foreground">Stock: {product.stock_available}</span>
                            <span className="font-semibold text-foreground">{euro(product.preco)}</span>
                          </div>
                        </div>
                      </div>

                      {product.variant_options.length > 0 && (
                        <div>
                          <Label className="text-xs">Tamanho / Variante</Label>
                          <Select
                            value={variant}
                            onValueChange={(value) => setProductVariant((prev) => ({ ...prev, [product.id]: value }))}
                          >
                            <SelectTrigger className="mt-1 h-9 bg-white text-xs">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.variant_options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5">
                        <div>
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            className="mt-1 h-9 bg-white text-sm"
                            type="number"
                            min={1}
                            max={Math.max(1, product.stock_available)}
                            value={qty}
                            onChange={(e) =>
                              setProductQty((prev) => ({
                                ...prev,
                                [product.id]: Number(e.target.value || 1),
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            className="h-9 w-9 shrink-0 p-0 sm:w-10"
                            onClick={() => addToCart(product)}
                            disabled={product.stock_available <= 0 || (product.variant_options.length > 0 && !variant)}
                            type="button"
                            aria-label={`Adicionar ${product.nome} ao carrinho`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {products.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">Sem artigos visíveis na loja para os filtros atuais.</CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pedidos" className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Pedido {order.id.slice(0, 8)}</CardTitle>
                    <Badge>{statusLabels[order.status] || order.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Criado em {formatDate(order.created_at)} · Para {order.target_user?.nome_completo || order.user?.nome_completo || '-'}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {canManagePendingOrders && order.status === 'pending_payment' && (
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={() => openEditOrderModal(order)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button type="button" variant="destructive" size="sm" className="h-8 gap-1" onClick={() => deletePendingOrder(order)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Apagar
                      </Button>
                    </div>
                  )}

                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                      <div>
                        <div className="font-medium">{item.article_name_snapshot}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.article_code_snapshot}
                          {item.variant_snapshot ? ` · ${item.variant_snapshot}` : ''}
                          {` · x${item.quantity}`}
                        </div>
                      </div>
                      <div>{euro(item.line_total)}</div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2 border-t text-sm font-semibold">
                    <span>Total</span>
                    <span>{euro(order.total)}</span>
                  </div>

                  {order.financial_invoice && (
                    <div className="text-xs text-muted-foreground">
                      Fatura: {order.financial_invoice.id.slice(0, 8)} · Estado pagamento: {order.financial_invoice.estado_pagamento}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {orders.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">Sem pedidos registados.</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </section>

        <Dialog open={cartModalOpen} onOpenChange={setCartModalOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Carrinho</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.article?.nome || 'Artigo removido'}</p>
                          <p className="text-xs text-muted-foreground">{item.article?.codigo || '-'}</p>
                        </div>
                        <div className="font-medium">{euro(item.line_total)}</div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-2">
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            className="bg-white mt-1"
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item, Number(e.target.value || 1))}
                          />
                        </div>

                        <div>
                          <Label>Variante</Label>
                          <Input
                            className="bg-white mt-1"
                            value={cartVariantDraft[item.id] ?? item.variant ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCartVariantDraft((prev) => ({ ...prev, [item.id]: value }));
                            }}
                            onBlur={(e) => {
                              const nextVariant = e.target.value || '';
                              updateCartItem(item, item.quantity, nextVariant);
                            }}
                            placeholder="Opcional"
                          />
                        </div>

                        <div className="flex items-end text-sm text-muted-foreground">
                          Unitário: {euro(item.unit_price)}
                        </div>

                        <div className="flex items-end">
                          <Button type="button" variant="destructive" className="w-full" onClick={() => removeCartItem(item)}>
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cart.items.length === 0 && <p className="text-sm text-muted-foreground">Carrinho vazio.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Confirmar pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="flex items-center justify-between"><span>Subtotal</span><span>{euro(cart.subtotal)}</span></div>
                    <div className="flex items-center justify-between font-semibold"><span>Total</span><span>{euro(cart.total)}</span></div>
                  </div>

                  <div>
                    <Label>Notas</Label>
                    <Input className="bg-white mt-1" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Notas opcionais do pedido" />
                  </div>

                  <Button type="button" className="w-full" disabled={cart.items.length === 0} onClick={confirmOrder}>
                    Confirmar pedido
                  </Button>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={editingOrder !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingOrder(null);
              setEditingOrderNotes('');
              setEditingOrderQuantities({});
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar pedido pendente</DialogTitle>
            </DialogHeader>

            {editingOrder && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {editingOrder.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_120px] items-end gap-3 rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">{item.article_name_snapshot}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.article_code_snapshot}
                          {item.variant_snapshot ? ` · ${item.variant_snapshot}` : ''}
                          {` · ${euro(item.unit_price)}`}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs">Quantidade</Label>
                        <Input
                          className="mt-1 h-9 bg-white"
                          type="number"
                          min={1}
                          value={editingOrderQuantities[item.id] ?? item.quantity}
                          onChange={(e) =>
                            setEditingOrderQuantities((prev) => ({
                              ...prev,
                              [item.id]: Number(e.target.value || 1),
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label>Notas</Label>
                  <Input
                    className="mt-1 bg-white"
                    value={editingOrderNotes}
                    onChange={(e) => setEditingOrderNotes(e.target.value)}
                    placeholder="Notas do pedido"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingOrder(null);
                      setEditingOrderNotes('');
                      setEditingOrderQuantities({});
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" onClick={submitOrderUpdate}>
                    Guardar alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
}
