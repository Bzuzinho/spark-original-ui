import { FormEvent, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
  activeTab: 'loja' | 'carrinho' | 'pedidos';
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
  statusLabels,
}: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || 'all');
  const [productQty, setProductQty] = useState<Record<string, number>>({});
  const [productVariant, setProductVariant] = useState<Record<string, string>>({});
  const [cartVariantDraft, setCartVariantDraft] = useState<Record<string, string>>({});
  const [orderNotes, setOrderNotes] = useState('');

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) || profiles[0],
    [profiles, selectedProfileId],
  );

  const goToTab = (tab: string, extraParams?: Record<string, string>) => {
    const routeName = tab === 'carrinho' ? 'loja.carrinho' : tab === 'pedidos' ? 'loja.pedidos' : 'loja.index';

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

      <div className="space-y-3">
        <Card>
          <CardContent className="pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Perfil de compra</Label>
                <Select value={selectedProfileId} onValueChange={onProfileChange}>
                  <SelectTrigger className="bg-white mt-1">
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
              <div className="rounded-md border p-3 bg-muted/30 text-sm">
                <p className="font-medium">A comprar para</p>
                <p className="text-muted-foreground">{selectedProfile?.nome_completo || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={goToTab} className="space-y-3">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-1">
            <TabsTrigger value="loja">Loja</TabsTrigger>
            <TabsTrigger value="carrinho">Carrinho</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="loja" className="space-y-3">
            <Card>
              <CardContent className="pt-4">
                <form onSubmit={submitFilters} className="grid gap-3 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <Label>Pesquisar</Label>
                    <Input
                      className="bg-white mt-1"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Nome, código ou descrição"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white mt-1">
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
                    <Button type="submit" className="w-full">Filtrar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const qty = productQty[product.id] ?? 1;
                const variant = productVariant[product.id] ?? '';

                return (
                  <Card key={product.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{product.nome}</CardTitle>
                      <div className="text-xs text-muted-foreground">{product.codigo}</div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {product.categoria && <Badge variant="secondary">{product.categoria}</Badge>}
                      {product.descricao && <p className="text-sm text-muted-foreground">{product.descricao}</p>}

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{euro(product.preco)}</span>
                        <span className="text-xs text-muted-foreground">Stock: {product.stock_available}</span>
                      </div>

                      {product.variant_options.length > 0 && (
                        <div>
                          <Label>Tamanho / Variante</Label>
                          <Select
                            value={variant}
                            onValueChange={(value) => setProductVariant((prev) => ({ ...prev, [product.id]: value }))}
                          >
                            <SelectTrigger className="bg-white mt-1">
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

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            className="bg-white mt-1"
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
                            className="w-full"
                            onClick={() => addToCart(product)}
                            disabled={product.stock_available <= 0 || (product.variant_options.length > 0 && !variant)}
                            type="button"
                          >
                            Adicionar
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

          <TabsContent value="carrinho" className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Carrinho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
      </div>
    </AuthenticatedLayout>
  );
}
