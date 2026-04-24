import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    CreditCard,
    FileText,
    History,
    Receipt,
} from 'lucide-react';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PageProps as SharedPageProps } from '@/types';

interface PaymentStatus {
    key: 'paid' | 'pending' | 'overdue' | 'partial' | 'cancelled';
    label: string;
}

interface PaymentSummary {
    id: string;
    label: string;
    date: string | null;
    amount: number;
    status: PaymentStatus;
}

interface PaymentMovement {
    id: string;
    description: string;
    date: string | null;
    due_date: string | null;
    amount: number;
    status: PaymentStatus;
    reference: string | null;
    receipt_number: string | null;
    payment_method: string | null;
    actions: {
        can_view_receipt: boolean;
        can_view_detail: boolean;
        can_pay: boolean;
    };
}

interface LatestReceipt {
    id: string;
    receipt_number: string;
    date: string | null;
    amount: number;
    can_view_receipt: boolean;
}

interface PortalPaymentsProps {
    user: {
        id: string | number;
        name: string;
        email?: string | null;
    };
    is_also_admin: boolean;
    has_family: boolean;
    secure_payment_enabled: boolean;
    hero: {
        title: string;
        status: string;
        outstanding_value: number;
        next_payment: PaymentSummary | null;
        actions: {
            can_view_receipts: boolean;
            can_view_history: boolean;
            can_pay: boolean;
        };
    };
    kpis: {
        outstanding_value: number;
        next_payment: PaymentSummary | null;
        plan: string;
        receipts_this_year: number;
    };
    account_current: {
        outstanding_value: number;
        overdue_invoices: number;
        overdue_value: number;
        next_payment: PaymentSummary | null;
        plan: string;
        general_status: string;
    };
    movements: PaymentMovement[];
    latest_receipts: LatestReceipt[];
}

type PageProps = SharedPageProps<PortalPaymentsProps>;

const statusClassMap: Record<PaymentStatus['key'], string> = {
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    overdue: 'border-rose-200 bg-rose-50 text-rose-700',
    partial: 'border-sky-200 bg-sky-50 text-sky-700',
    cancelled: 'border-slate-200 bg-slate-100 text-slate-600',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(value || 0);
}

function formatDate(date: string | null | undefined): string {
    if (!date) {
        return 'Sem data';
    }

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return 'Sem data';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
    }).format(parsed);
}

function formatFullDate(date: string | null | undefined): string {
    if (!date) {
        return 'Sem data';
    }

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return 'Sem data';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(parsed);
}

function statusChip(status: PaymentStatus) {
    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClassMap[status.key]}`}>
            {status.label}
        </span>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {message}
        </div>
    );
}

function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Payments() {
    const {
        auth,
        clubSettings,
        is_also_admin,
        has_family,
        secure_payment_enabled,
        hero,
        kpis,
        account_current,
        movements,
        latest_receipts,
    } = usePage<PageProps>().props;

    const outstandingMovements = movements.filter((movement) => ['pending', 'overdue', 'partial'].includes(movement.status.key));
    const hasDebt = account_current.outstanding_value > 0;

    return (
        <>
            <Head title="Pagamentos" />

            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="payments"
                hasFamily={has_family}
            >
                <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#0f57b3_0%,#114c98_100%)] px-4 py-5 text-white shadow-[0_16px_32px_rgba(15,76,152,0.2)] sm:px-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Portal</p>
                            <h2 className="mt-2 text-2xl font-semibold">{hero.title}</h2>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasDebt ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {hero.status}
                                </span>
                                {!hasDebt ? <span className="text-sm text-blue-100">Tudo em dia.</span> : null}
                            </div>
                            <p className="mt-4 text-sm text-blue-50">
                                Consulte apenas a sua situação financeira: conta corrente, faturas, recibos e próximos pagamentos, sem ferramentas administrativas.
                            </p>
                        </div>

                        <div className="grid gap-3 rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur sm:min-w-[320px]">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">Valor em dívida</p>
                                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(hero.outstanding_value)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">Próximo pagamento</p>
                                {hero.next_payment ? (
                                    <>
                                        <p className="mt-2 text-sm font-semibold text-white">{hero.next_payment.label}</p>
                                        <p className="mt-1 text-sm text-blue-50">{formatFullDate(hero.next_payment.date)} · {formatCurrency(hero.next_payment.amount)}</p>
                                    </>
                                ) : (
                                    <p className="mt-2 text-sm text-blue-50">Sem pagamentos pendentes.</p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('latest-receipts')}
                                    className="inline-flex items-center justify-center rounded-2xl bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    Ver recibos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('movements')}
                                    className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    Histórico
                                </button>
                                {secure_payment_enabled && hero.actions.can_pay ? (
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-2xl border border-lime-200 bg-lime-50 px-3.5 py-2 text-sm font-semibold text-lime-700 transition hover:bg-lime-100"
                                    >
                                        Pagar
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PortalKpiCard label="Valor em dívida" value={formatCurrency(kpis.outstanding_value)} helper="total por regularizar" icon={CreditCard} />
                    <PortalKpiCard label="Próximo pagamento" value={kpis.next_payment ? formatDate(kpis.next_payment.date) : 'Sem data'} helper={kpis.next_payment ? formatCurrency(kpis.next_payment.amount) : 'Tudo em dia'} icon={CalendarClock} />
                    <PortalKpiCard label="Plano / mensalidade" value={kpis.plan} helper="configuração atual" icon={FileText} />
                    <PortalKpiCard label="Recibos no ano" value={String(kpis.receipts_this_year)} helper="emitidos este ano" icon={Receipt} />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] xl:items-start">
                    <div className="space-y-4">
                        <PortalSection title="Faturas e movimentos" description="Histórico financeiro visível ao utilizador final." actionLabel="Ver histórico" onAction={() => scrollToSection('movements')}>
                            <div id="movements" className="space-y-3">
                                {movements.length > 0 ? movements.map((movement) => (
                                    <article key={movement.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold text-slate-900">{movement.description}</h3>
                                                    {statusChip(movement.status)}
                                                </div>
                                                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                                    <p><span className="font-medium text-slate-800">Data:</span> {formatFullDate(movement.date)}</p>
                                                    <p><span className="font-medium text-slate-800">Valor:</span> {formatCurrency(movement.amount)}</p>
                                                    <p><span className="font-medium text-slate-800">Referência / recibo:</span> {movement.receipt_number || movement.reference || 'Sem referência'}</p>
                                                    <p><span className="font-medium text-slate-800">Método de pagamento:</span> {movement.payment_method || 'Não disponível'}</p>
                                                    <p className="sm:col-span-2"><span className="font-medium text-slate-800">Vencimento:</span> {formatFullDate(movement.due_date)}</p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-wrap gap-2 md:max-w-[180px] md:flex-col">
                                                {movement.actions.can_view_receipt ? (
                                                    <button type="button" className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                                                        Ver recibo
                                                    </button>
                                                ) : null}
                                                {movement.actions.can_view_detail ? (
                                                    <button type="button" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                                                        Ver detalhe
                                                    </button>
                                                ) : null}
                                                {secure_payment_enabled && movement.actions.can_pay ? (
                                                    <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
                                                        Pagar
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                )) : (
                                    <EmptyState message="Tudo em dia." />
                                )}
                            </div>
                        </PortalSection>
                    </div>

                    <div className="space-y-4">
                        <PortalSection title="Conta corrente" description="Resumo consolidado apenas com a sua informação." actionLabel="Abrir recibos" onAction={() => scrollToSection('latest-receipts')}>
                            <div className="space-y-3">
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Estado geral</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <CheckCircle2 className={`h-5 w-5 ${hasDebt ? 'text-amber-500' : 'text-emerald-500'}`} />
                                        <p className="text-base font-semibold text-slate-900">{account_current.general_status}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Valor em dívida</p>
                                        <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(account_current.outstanding_value)}</p>
                                    </div>
                                    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Faturas vencidas</p>
                                        <p className="mt-2 text-xl font-semibold text-slate-900">{account_current.overdue_invoices}</p>
                                        <p className="mt-1 text-sm text-slate-500">{formatCurrency(account_current.overdue_value)}</p>
                                    </div>
                                    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Próximo pagamento</p>
                                        {account_current.next_payment ? (
                                            <>
                                                <p className="mt-2 text-base font-semibold text-slate-900">{account_current.next_payment.label}</p>
                                                <p className="mt-1 text-sm text-slate-500">{formatFullDate(account_current.next_payment.date)} · {formatCurrency(account_current.next_payment.amount)}</p>
                                            </>
                                        ) : (
                                            <p className="mt-2 text-sm text-slate-500">Tudo em dia.</p>
                                        )}
                                    </div>
                                    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Plano de mensalidade</p>
                                        <p className="mt-2 text-base font-semibold text-slate-900">{account_current.plan}</p>
                                    </div>
                                </div>
                            </div>
                        </PortalSection>

                        <PortalSection title="Últimos recibos" description="Recibos emitidos e disponíveis para consulta." actionLabel="Ir ao topo" onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div id="latest-receipts" className="space-y-3">
                                {latest_receipts.length > 0 ? latest_receipts.map((receipt) => (
                                    <article key={receipt.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{receipt.receipt_number}</p>
                                                <p className="mt-1 text-xs text-slate-500">{formatFullDate(receipt.date)}</p>
                                                <p className="mt-2 text-sm font-medium text-slate-700">{formatCurrency(receipt.amount)}</p>
                                            </div>
                                            {receipt.can_view_receipt ? (
                                                <button type="button" className="inline-flex items-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                                                    Ver recibo
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            ) : null}
                                        </div>
                                    </article>
                                )) : (
                                    <EmptyState message="Ainda não existem recibos emitidos." />
                                )}
                            </div>
                        </PortalSection>

                        <PortalSection title="Pendências" description="Apenas faturas por regularizar neste portal." actionLabel="Ver lista" onAction={() => scrollToSection('movements')}>
                            {outstandingMovements.length > 0 ? (
                                <div className="space-y-2">
                                    {outstandingMovements.slice(0, 4).map((movement) => (
                                        <div key={movement.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{movement.description}</p>
                                                <p className="mt-1 text-xs text-slate-500">{formatFullDate(movement.due_date)} · {movement.status.label}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(movement.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Não existem faturas pendentes." />
                            )}
                        </PortalSection>
                    </div>
                </section>
            </PortalLayout>
        </>
    );
}