import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowRight,
    BellRing,
    CalendarDays,
    CheckCheck,
    CircleAlert,
    CircleCheckBig,
    FileText,
    FolderOpen,
    Inbox,
    MailOpen,
    ShieldAlert,
} from 'lucide-react';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PageProps as SharedPageProps } from '@/types';

interface CommunicationCategory {
    key: 'financeiro' | 'treinos' | 'eventos' | 'geral' | 'documentos';
    label: string;
}

interface CommunicationState {
    key: 'read' | 'unread' | 'action_required';
    label: string;
}

interface CommunicationItem {
    id: string;
    title: string;
    description: string;
    body: string;
    date: string | null;
    category: CommunicationCategory;
    state: CommunicationState;
    source: 'alert' | 'internal';
    link: string | null;
    sender_name: string | null;
    can_mark_read: boolean;
    mark_read_payload: {
        source: 'alert' | 'internal';
        alert_id?: string | null;
        recipient_entry_id?: string | null;
    };
    actions: {
        can_open: boolean;
        can_open_detail: boolean;
        can_respond: boolean;
        detail_label: string;
    };
}

interface PortalCommunicationsProps {
    is_also_admin: boolean;
    has_family: boolean;
    communications: {
        hero: {
            title: string;
            unread_label: string;
            action_label: string;
        };
        kpis: {
            unread: number;
            action_required: number;
            total_this_month: number;
            read: number;
        };
        inbox: {
            unread: number;
            action_required: number;
            total_this_month: number;
        };
        categories: Array<CommunicationCategory & { count: number }>;
        items: CommunicationItem[];
        empty_states: {
            unread: string;
            recent: string;
            pending: string;
        };
    };
}

type PageProps = SharedPageProps<PortalCommunicationsProps>;

function formatDate(date: string | null): string {
    if (!date) {
        return 'Sem data';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return 'Sem data';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
}

function stateClasses(state: CommunicationState['key']): string {
    switch (state) {
        case 'action_required':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'read':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        default:
            return 'border-blue-200 bg-blue-50 text-blue-700';
    }
}

function categoryClasses(category: CommunicationCategory['key']): string {
    switch (category) {
        case 'financeiro':
            return 'bg-emerald-50 text-emerald-700';
        case 'treinos':
            return 'bg-sky-50 text-sky-700';
        case 'eventos':
            return 'bg-amber-50 text-amber-700';
        case 'documentos':
            return 'bg-indigo-50 text-indigo-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {message}
        </div>
    );
}

export default function Communications() {
    const { auth, clubSettings, is_also_admin, has_family, communications } = usePage<PageProps>().props;
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [selectedCategory, setSelectedCategory] = useState<CommunicationCategory['key'] | 'all'>('all');
    const [expandedItemId, setExpandedItemId] = useState<string | null>(communications.items[0]?.id ?? null);

    const visibleItems = useMemo(() => {
        return communications.items.filter((item) => {
            if (filter === 'unread' && item.state.key === 'read') {
                return false;
            }

            if (selectedCategory !== 'all' && item.category.key !== selectedCategory) {
                return false;
            }

            return true;
        });
    }, [communications.items, filter, selectedCategory]);

    const pendingItems = useMemo(
        () => communications.items.filter((item) => item.state.key === 'action_required'),
        [communications.items],
    );

    const markRead = (item: CommunicationItem) => {
        if (!item.can_mark_read) {
            return;
        }

        router.post(route('portal.communications.read'), item.mark_read_payload, {
            preserveScroll: true,
            preserveState: true,
            only: ['communications', 'communicationAlerts', 'flash'],
        });
    };

    const markAllRead = () => {
        router.post(route('portal.communications.markAllRead'), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['communications', 'communicationAlerts', 'flash'],
        });
    };

    const openItem = (item: CommunicationItem) => {
        setExpandedItemId(item.id);

        if (item.link) {
            router.visit(item.link);
            return;
        }

        if (item.can_mark_read) {
            markRead(item);
        }
    };

    return (
        <>
            <Head title="Comunicados" />
            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="communications"
                hasFamily={has_family}
            >
                <section className="overflow-hidden rounded-[28px] border border-blue-900/10 bg-[linear-gradient(180deg,rgba(24,102,191,0.96)_0%,rgba(18,79,152,0.92)_100%)] px-4 py-5 text-white shadow-[0_18px_36px_rgba(20,75,154,0.18)] sm:px-5 lg:px-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Portal</p>
                            <h2 className="mt-2 text-2xl font-semibold">{communications.hero.title}</h2>
                            <p className="mt-3 text-sm text-blue-50">
                                Consulta simples de comunicados, notificações internas, avisos de treino, pagamentos, eventos e mensagens do clube recebidas pelo utilizador.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                                    {communications.hero.unread_label}
                                </span>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                                    {communications.hero.action_label}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setFilter('unread')}
                                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                            >
                                Ver não lidos
                            </button>
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                                Marcar todos como lidos
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PortalKpiCard label="Não lidos" value={String(communications.kpis.unread)} helper="por abrir" icon={MailOpen} />
                    <PortalKpiCard label="Ações pendentes" value={String(communications.kpis.action_required)} helper="exigem atenção" icon={ShieldAlert} />
                    <PortalKpiCard label="Total este mês" value={String(communications.kpis.total_this_month)} helper="recebidos" icon={CalendarDays} />
                    <PortalKpiCard label="Lidos" value={String(communications.kpis.read)} helper="já tratados" icon={CircleCheckBig} />
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)] xl:items-start">
                    <PortalSection
                        title="Comunicados recebidos"
                        description="Apenas comunicações recebidas pelo utilizador autenticado."
                        actionLabel={filter === 'unread' ? 'Ver todos' : 'Ver não lidos'}
                        onAction={() => setFilter((current) => current === 'unread' ? 'all' : 'unread')}
                    >
                        <div className="mb-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Todas
                            </button>
                            {communications.categories.map((category) => (
                                <button
                                    key={category.key}
                                    type="button"
                                    onClick={() => setSelectedCategory(category.key)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${selectedCategory === category.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            {visibleItems.length === 0 ? (
                                <EmptyState message={filter === 'unread' ? communications.empty_states.unread : communications.empty_states.recent} />
                            ) : visibleItems.map((item) => {
                                const isExpanded = expandedItemId === item.id;

                                return (
                                    <article key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryClasses(item.category.key)}`}>
                                                        {item.category.label}
                                                    </span>
                                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stateClasses(item.state.key)}`}>
                                                        {item.state.label}
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
                                                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                    <span>{formatDate(item.date)}</span>
                                                    {item.sender_name ? <span>Remetente: {item.sender_name}</span> : null}
                                                    <span>{item.source === 'alert' ? 'Notificação interna' : 'Mensagem interna'}</span>
                                                </div>
                                            </div>

                                            {item.state.key === 'action_required' ? (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                                    <CircleAlert className="h-3.5 w-3.5" />
                                                    Ação necessária
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => openItem(item)}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                <FolderOpen className="h-4 w-4" />
                                                Abrir comunicado
                                            </button>
                                            {item.can_mark_read ? (
                                                <button
                                                    type="button"
                                                    onClick={() => markRead(item)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                >
                                                    <CheckCheck className="h-4 w-4" />
                                                    Marcar como lido
                                                </button>
                                            ) : null}
                                            {item.actions.can_respond ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openItem(item)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                    {item.actions.detail_label}
                                                </button>
                                            ) : null}
                                        </div>

                                        {isExpanded ? (
                                            <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4 text-sm text-slate-700">
                                                <p className="whitespace-pre-line leading-6">{item.body || item.description}</p>
                                            </div>
                                        ) : null}
                                    </article>
                                );
                            })}
                        </div>
                    </PortalSection>

                    <div className="space-y-4">
                        <PortalSection title="Caixa de entrada" description="Resumo rápido da atividade recente.">
                            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Inbox className="h-4 w-4" />
                                        <p className="text-sm font-semibold">Não lidos</p>
                                    </div>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{communications.inbox.unread}</p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <CircleAlert className="h-4 w-4" />
                                        <p className="text-sm font-semibold">Ações necessárias</p>
                                    </div>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{communications.inbox.action_required}</p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <BellRing className="h-4 w-4" />
                                        <p className="text-sm font-semibold">Total do mês</p>
                                    </div>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{communications.inbox.total_this_month}</p>
                                </div>
                            </div>
                        </PortalSection>

                        <PortalSection title="Categorias" description="Treinos, eventos, financeiro, documentos e geral.">
                            <div className="space-y-2">
                                {communications.categories.map((category) => (
                                    <button
                                        key={category.key}
                                        type="button"
                                        onClick={() => setSelectedCategory(category.key)}
                                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
                                    >
                                        <span className="text-sm font-semibold text-slate-800">{category.label}</span>
                                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{category.count}</span>
                                    </button>
                                ))}
                            </div>
                        </PortalSection>

                        <PortalSection title="Ações pendentes" description="Itens que exigem resposta ou detalhe adicional.">
                            {pendingItems.length === 0 ? (
                                <EmptyState message={communications.empty_states.pending} />
                            ) : (
                                <div className="space-y-2">
                                    {pendingItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => openItem(item)}
                                            className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100"
                                        >
                                            <p className="text-sm font-semibold text-amber-900">{item.title}</p>
                                            <p className="mt-1 text-xs text-amber-700">{item.category.label} · {formatDate(item.date)}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </PortalSection>

                        <PortalSection title="Acesso rápido" description="Atalhos para treinos, eventos e documentos relacionados.">
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                <button
                                    type="button"
                                    onClick={() => router.visit('/portal/eventos')}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                                >
                                    Agenda e treinos
                                    <CalendarDays className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/portal/documentos')}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                                >
                                    Documentos
                                    <FileText className="h-4 w-4" />
                                </button>
                            </div>
                        </PortalSection>
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}