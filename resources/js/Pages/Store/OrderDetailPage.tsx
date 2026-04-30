import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PageProps as SharedPageProps } from '@/types';
import { formatStoreCurrency, formatStoreDate, storeOrderStatusClass, storeOrderStatusLabel, type StoreOrder } from '@/lib/storeApi';

interface OrderDetailPageProps {
    order: StoreOrder;
}

type PageProps = SharedPageProps<OrderDetailPageProps> & {
    accessControl?: {
        visibleMenuModules?: string[];
    };
};

export default function OrderDetailPage() {
    const { props } = usePage<PageProps>();
    const { auth, clubSettings, accessControl, order } = props;

    return (
        <>
            <Head title={order.numero} />
            <PortalLayout user={auth.user} clubSettings={clubSettings} isAlsoAdmin={Boolean(accessControl?.visibleMenuModules?.includes('loja'))} activeNav="shop" hasFamily={false}>
                <button
                    type="button"
                    onClick={() => router.visit('/loja/historico')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao historico
                </button>

                <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-semibold text-slate-900">{order.numero}</h1>
                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${storeOrderStatusClass(order.estado)}`}>
                                        {storeOrderStatusLabel(order.estado)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-500">Criada em {formatStoreDate(order.created_at)}</p>
                                {order.target_user?.nome_completo ? <p className="mt-1 text-sm text-slate-500">Comprar para: {order.target_user.nome_completo}</p> : null}
                            </div>
                            <p className="text-xl font-semibold text-blue-700">{formatStoreCurrency(order.total)}</p>
                        </div>

                        <div className="mt-5 space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{item.descricao}</p>
                                            <p className="mt-1 text-xs text-slate-500">{item.quantidade} x {formatStoreCurrency(item.preco_unitario)}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-blue-700">{formatStoreCurrency(item.total_linha)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <aside className="space-y-4">
                        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <h2 className="text-base font-semibold text-slate-900">Resumo financeiro</h2>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <div className="flex items-center justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">{formatStoreCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Total</span>
                                    <span className="font-semibold text-blue-700">{formatStoreCurrency(order.total)}</span>
                                </div>
                            </div>

                            {order.observacoes ? (
                                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Observacoes</p>
                                    <p className="mt-2 text-sm text-slate-600">{order.observacoes}</p>
                                </div>
                            ) : null}
                        </section>
                    </aside>
                </section>
            </PortalLayout>
        </>
    );
}