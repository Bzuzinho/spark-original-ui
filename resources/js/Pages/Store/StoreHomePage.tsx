import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import CategoryScroller from '@/Components/Store/CategoryScroller';
import ProductCard from '@/Components/Store/ProductCard';
import StoreHeader from '@/Components/Store/StoreHeader';
import StoreHeroCarousel from '@/Components/Store/StoreHeroCarousel';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PageProps as SharedPageProps } from '@/types';
import {
    formatStoreCurrency,
    type StoreCart,
    type StoreCategory,
    type StoreHeroItem,
    type StoreProduct,
    type StoreProfileOption,
    storeRequest,
    visitStoreProduct,
} from '@/lib/storeApi';

interface StoreHomePageProps {
    heroItems: StoreHeroItem[];
    categories: StoreCategory[];
    featuredProducts: StoreProduct[];
    products: StoreProduct[];
    filters: {
        search?: string;
        categoria?: string | null;
    };
    cart: StoreCart;
    profiles: StoreProfileOption[];
}

type PageProps = SharedPageProps<StoreHomePageProps> & {
    accessControl?: {
        visibleMenuModules?: string[];
    };
};

export default function StoreHomePage() {
    const { props } = usePage<PageProps>();
    const { auth, clubSettings, accessControl, heroItems, categories, featuredProducts, products, filters, cart, profiles } = props;
    const [search, setSearch] = useState(filters.search || '');
    const [activeCategoryId, setActiveCategoryId] = useState(filters.categoria || 'all');
    const [localCart, setLocalCart] = useState<StoreCart>(cart);
    const [busyProductId, setBusyProductId] = useState<string | null>(null);

    const isAlsoAdmin = Boolean(accessControl?.visibleMenuModules?.includes('loja'));
    const hasFamily = profiles.length > 1;

    const visibleFeatured = useMemo(() => {
        if (activeCategoryId === 'all') {
            return featuredProducts;
        }

        return featuredProducts.filter((product) => product.categoria_id === activeCategoryId);
    }, [activeCategoryId, featuredProducts]);

    const visibleProducts = useMemo(() => {
        if (activeCategoryId === 'all') {
            return products;
        }

        return products.filter((product) => product.categoria_id === activeCategoryId);
    }, [activeCategoryId, products]);

    const applyFilters = () => {
        router.get('/loja', {
            search: search || undefined,
            categoria: activeCategoryId === 'all' ? undefined : activeCategoryId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleAddToCart = async (product: StoreProduct) => {
        try {
            setBusyProductId(product.id);
            const nextCart = await storeRequest<StoreCart>('/api/loja/carrinho/itens', {
                method: 'POST',
                body: JSON.stringify({
                    article_id: product.id,
                    quantidade: 1,
                }),
            });

            setLocalCart(nextCart);
            toast.success('Artigo adicionado ao carrinho.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel adicionar ao carrinho.');
        } finally {
            setBusyProductId(null);
        }
    };

    const handleHeroNavigation = (item: StoreHeroItem) => {
        if (item.tipo_destino === 'produto' && item.produto?.slug) {
            visitStoreProduct(item.produto.slug);
            return;
        }

        if (item.tipo_destino === 'categoria' && item.categoria?.id) {
            setActiveCategoryId(item.categoria.id);
            router.get('/loja', { categoria: item.categoria.id }, { preserveState: true, replace: true });
            return;
        }

        if (item.tipo_destino === 'url' && item.url_destino) {
            window.open(item.url_destino, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <>
            <Head title="Loja" />
            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={isAlsoAdmin}
                activeNav="shop"
                hasFamily={hasFamily}
            >
                <StoreHeader
                    search={search}
                    onSearchChange={setSearch}
                    onSubmitSearch={applyFilters}
                    cartCount={localCart.count}
                    onOpenCart={() => router.visit('/loja/carrinho')}
                />

                <StoreHeroCarousel items={heroItems} onNavigate={handleHeroNavigation} />

                <CategoryScroller categories={categories} activeCategoryId={activeCategoryId} onSelect={(categoryId) => {
                    setActiveCategoryId(categoryId);
                    router.get('/loja', {
                        search: search || undefined,
                        categoria: categoryId === 'all' ? undefined : categoryId,
                    }, {
                        preserveState: true,
                        replace: true,
                    });
                }} />

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
                    <div className="space-y-4">
                        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Destaques da semana</h2>
                                    <p className="text-sm text-slate-500">Produtos em evidencia para o portal pessoal.</p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {visibleFeatured.length > 0 ? visibleFeatured.map((product) => (
                                    <div key={`featured-${product.id}`} className={busyProductId === product.id ? 'opacity-70' : ''}>
                                        <ProductCard product={product} onView={(item) => visitStoreProduct(item.slug)} onAdd={handleAddToCart} />
                                    </div>
                                )) : (
                                    <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
                                        Sem destaques ativos para os filtros atuais.
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Colecao completa</h2>
                                    <p className="text-sm text-slate-500">Explora todos os artigos ativos da Loja do Clube.</p>
                                </div>
                                <span className="text-sm font-semibold text-blue-700">{visibleProducts.length} artigo(s)</span>
                            </div>

                            <div className="mt-4 grid gap-4 grid-cols-2 xl:grid-cols-4">
                                {visibleProducts.length > 0 ? visibleProducts.map((product) => (
                                    <div key={product.id} className={busyProductId === product.id ? 'opacity-70' : ''}>
                                        <ProductCard product={product} onView={(item) => visitStoreProduct(item.slug)} onAdd={handleAddToCart} />
                                    </div>
                                )) : (
                                    <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 col-span-2 xl:col-span-4">
                                        Nao existem produtos para a pesquisa ou categoria selecionada.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4">
                        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <h2 className="text-base font-semibold text-slate-900">Carrinho rapido</h2>
                            <p className="mt-1 text-sm text-slate-500">Resumo do pedido do utilizador autenticado.</p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Artigos</p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-900">{localCart.count}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Subtotal</p>
                                    <p className="mt-2 text-xl font-semibold text-blue-700">{formatStoreCurrency(localCart.subtotal)}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Comprar para</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{profiles.length > 1 ? `${profiles.length} perfis disponíveis` : 'O proprio utilizador'}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {localCart.items.slice(0, 3).map((item) => (
                                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{item.produto?.nome}</p>
                                                <p className="mt-1 text-xs text-slate-500">{item.quantidade} x {formatStoreCurrency(item.preco_unitario)}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-blue-700">{formatStoreCurrency(item.total_linha)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-2">
                                <button
                                    type="button"
                                    onClick={() => router.visit('/loja/carrinho')}
                                    className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Abrir carrinho
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/loja/historico')}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Ver historico
                                </button>
                            </div>
                        </section>
                    </aside>
                </section>
            </PortalLayout>
        </>
    );
}
