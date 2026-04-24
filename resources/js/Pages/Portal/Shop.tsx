import { Head, router, usePage } from '@inertiajs/react';
import { CircleAlert, ClipboardList, Package2, ReceiptText, ShoppingBag } from 'lucide-react';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import { Button } from '@/Components/ui/button';
import PortalLayout from '@/Layouts/PortalLayout';
import { portalRoutes } from '@/lib/portalRoutes';
import type { PageProps as SharedPageProps } from '@/types';

interface ShopSummary {
    available_articles: number;
    pending_requests: number;
    delivered_requests: number;
    low_stock_articles: number;
}

interface ShopProduct {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    category: string;
    availability: 'available' | 'limited' | 'unavailable' | 'on_order';
    availability_label: string;
    stock_available: number;
    sizes: string[];
    has_price: boolean;
}

interface ShopRequest {
    id: string;
    article: string;
    requested_at: string | null;
    status: 'draft' | 'pending' | 'approved' | 'invoiced' | 'delivered' | 'cancelled';
    status_label: string;
    has_invoice: boolean;
    total_amount: number;
}

interface ShopPayload {
    summary: ShopSummary;
    products: ShopProduct[];
    requests: ShopRequest[];
    notes: string[];
    categories: string[];
}

interface PortalShopProps {
    is_also_admin: boolean;
    has_family: boolean;
    shop: ShopPayload;
}

type PageProps = SharedPageProps<PortalShopProps>;

function formatCurrency(value: number | null): string {
    if (value === null) {
        return 'Sob consulta';
    }

    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

function formatRequestDate(value: string | null): string {
    if (!value) {
        return 'Data por confirmar';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        dateStyle: 'medium',
    }).format(new Date(value));
}

function availabilityClasses(status: ShopProduct['availability']): string {
    switch (status) {
        case 'limited':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'unavailable':
            return 'border-rose-200 bg-rose-50 text-rose-700';
        case 'on_order':
            return 'border-indigo-200 bg-indigo-50 text-indigo-700';
        default:
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
}

function requestStatusClasses(status: ShopRequest['status']): string {
    switch (status) {
        case 'approved':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'delivered':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'cancelled':
            return 'border-rose-200 bg-rose-50 text-rose-700';
        default:
            return 'border-amber-200 bg-amber-50 text-amber-700';
    }
}

function navigateToSection(selector: string) {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Shop() {
    const { auth, clubSettings, is_also_admin, has_family, shop } = usePage<PageProps>().props;
    const hasProducts = shop.products.length > 0;
    const hasRequests = shop.requests.length > 0;

    return (
        <>
            <Head title="Loja e Requisições" />

            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="shop"
                hasFamily={has_family}
            >
                <section className="overflow-hidden rounded-[28px] border border-blue-900/10 bg-[linear-gradient(180deg,rgba(31,94,184,0.96)_0%,rgba(19,74,148,0.92)_100%)] px-4 py-5 text-white shadow-[0_18px_36px_rgba(19,74,148,0.18)] sm:px-5 lg:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Portal</p>
                            <h1 className="mt-2 text-2xl font-semibold">Loja e Requisições</h1>
                            <p className="mt-2 text-sm text-blue-50">
                                Consulta simples de material do clube, pedidos pessoais e requisições online, sem expor gestão administrativa de inventário.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-sm text-blue-100">
                                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Material disponível</span>
                                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Toucas, t-shirts e kits do clube</span>
                            </div>
                        </div>

                        <div className="w-full max-w-md rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Destaque</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                                    <p className="text-xs uppercase tracking-[0.14em] text-blue-100">Artigos disponíveis</p>
                                    <p className="mt-2 text-2xl font-semibold text-white">{shop.summary.available_articles}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                                    <p className="text-xs uppercase tracking-[0.14em] text-blue-100">Pedidos pendentes</p>
                                    <p className="mt-2 text-2xl font-semibold text-white">{shop.summary.pending_requests}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Button className="rounded-full bg-white text-blue-700 hover:bg-blue-50" onClick={() => navigateToSection('#artigos-disponiveis')}>
                                    Ver artigos
                                </Button>
                                <Button variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white" onClick={() => navigateToSection('#meus-pedidos')}>
                                    Os meus pedidos
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PortalKpiCard label="Artigos disponíveis" value={String(shop.summary.available_articles)} helper="Catálogo visível" icon={ShoppingBag} />
                    <PortalKpiCard label="Pedidos pendentes" value={String(shop.summary.pending_requests)} helper="A aguardar validação" icon={ClipboardList} />
                    <PortalKpiCard label="Pedidos entregues" value={String(shop.summary.delivered_requests)} helper="Histórico pessoal" icon={ReceiptText} />
                    <PortalKpiCard label="Artigos com stock baixo" value={String(shop.summary.low_stock_articles)} helper="Confirmação necessária" icon={Package2} />
                </section>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)] xl:items-start">
                    <div className="space-y-5">
                        <div id="artigos-disponiveis" className="scroll-mt-24" />
                        <PortalSection title="Artigos disponíveis" description="Só são mostrados artigos ativos e disponíveis no Portal. O stock final é sempre confirmado no backend antes de qualquer entrega.">
                            {hasProducts ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {shop.products.map((product) => (
                                        <article key={product.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{product.category}</p>
                                                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h3>
                                                </div>
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${availabilityClasses(product.availability)}`}>
                                                    {product.availability_label}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                {product.description || 'Artigo disponível para consulta e pedido no Portal.'}
                                            </p>

                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{product.has_price ? formatCurrency(product.price) : 'Sob consulta'}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1">Stock visível: {Math.max(product.stock_available, 0)}</span>
                                            </div>

                                            {product.sizes.length > 0 ? (
                                                <div className="mt-4">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tamanhos</p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {product.sizes.map((size) => (
                                                            <span key={`${product.id}-${size}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                                                                {size}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}

                                            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                                <Button className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => router.visit(portalRoutes.communications)}>
                                                    Pedir artigo
                                                </Button>
                                                <Button variant="outline" className="rounded-full" onClick={() => router.visit(portalRoutes.communications)}>
                                                    Reservar
                                                </Button>
                                                <Button variant="ghost" className="justify-start rounded-full text-slate-700 hover:text-slate-900" onClick={() => router.visit(portalRoutes.documents)}>
                                                    Ver detalhe
                                                </Button>
                                                <Button variant="ghost" className="justify-start rounded-full text-slate-700 hover:text-slate-900" onClick={() => router.visit(portalRoutes.communications)}>
                                                    Pedir informação
                                                </Button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Sem artigos disponíveis." />
                            )}
                        </PortalSection>
                    </div>

                    <aside className="space-y-5">
                        <div id="meus-pedidos" className="scroll-mt-24" />
                        <PortalSection title="Os meus pedidos" description="Apenas pedidos e requisições associados ao utilizador autenticado.">
                            {hasRequests ? (
                                <div className="space-y-3">
                                    {shop.requests.map((request) => (
                                        <article key={request.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{request.article}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{formatRequestDate(request.requested_at)}</p>
                                                </div>
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${requestStatusClasses(request.status)}`}>
                                                    {request.status_label}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                                {request.total_amount > 0 ? <span className="rounded-full bg-slate-100 px-3 py-1">{formatCurrency(request.total_amount)}</span> : null}
                                                {request.has_invoice ? <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Pode gerar fatura</span> : null}
                                            </div>

                                            <Button variant="outline" className="mt-4 w-full rounded-full" onClick={() => router.visit(portalRoutes.communications)}>
                                                Ver detalhe
                                            </Button>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <EmptyState message="Ainda não existem pedidos." />
                                    <EmptyState message="Sem requisições pendentes." />
                                </div>
                            )}
                        </PortalSection>

                        <PortalSection title="Notas" description="Regras operacionais mantidas no backend do Portal.">
                            <div className="space-y-3">
                                {shop.notes.map((note) => (
                                    <div key={note} className="flex gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mt-0.5 rounded-2xl bg-blue-50 p-2 text-blue-700">
                                            <CircleAlert className="h-4 w-4" />
                                        </div>
                                        <p className="text-sm leading-6 text-slate-600">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </PortalSection>

                        <PortalSection title="Categorias" description="Vista simplificada do catálogo no Portal.">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                {['Equipamento', 'Material treino', 'Requisições/empréstimos', 'Merchandising'].map((category) => {
                                    const isAvailable = shop.categories.includes(category);

                                    return (
                                        <div key={category} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-slate-900">{category}</p>
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {isAvailable ? 'Com artigos' : 'Sem artigos'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </PortalSection>
                    </aside>
                </div>
            </PortalLayout>
        </>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}