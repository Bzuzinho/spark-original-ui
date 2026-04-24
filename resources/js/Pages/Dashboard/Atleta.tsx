import { Head, router, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    CalendarDays,
    ChevronRight,
    CreditCard,
    Dumbbell,
    FileText,
    House,
    IdCard,
    MessageCircle,
    Megaphone,
    ShoppingBag,
    Trophy,
    Users,
} from 'lucide-react';
import PortalCard from '@/Components/Portal/PortalCard';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import PortalLayout from '@/Layouts/PortalLayout';
import { portalRoutes } from '@/lib/portalRoutes';
import type { ClubSettingsProps, PageProps as SharedPageProps } from '@/types';

interface UserSummary {
    id: number | string;
    name: string;
    email?: string | null;
}

interface Athlete {
    name: string;
    escalao: string | null;
    numero_socio: string | null;
    foto_perfil: string | null;
    estado: string | null;
    conta_corrente: string | number | null;
}

interface ProximoTreino {
    id: string;
    numero_treino: string | null;
    data: string | null;
    hora_inicio: string | null;
    hora_fim: string | null;
    local: string | null;
    tipo_treino: string | null;
    escaloes: string[];
    grupo_label: string | null;
}

interface ProximoEvento {
    id: string;
    titulo: string;
    data_inicio: string | null;
    hora_inicio: string | null;
    local: string | null;
    estado: string | null;
    tipo: string | null;
}

interface UltimoResultado {
    id: string;
    competicao: string | null;
    data: string | null;
    estilo: string | null;
    distancia_m: number | null;
    tempo_formatado: string | null;
    posicao: number | null;
    desclassificado: boolean;
}

interface Mensalidade {
    id: string;
    mes: string | null;
    valor: string | number | null;
    estado: string | null;
    data_vencimento?: string | null;
}

interface ResumoPortal {
    treinos_mes: number;
    eventos_proximos: number;
    conta_corrente: string | number | null;
    assiduidade_percent: number | null;
    treinos_agendados_mes: number;
}

interface AlertItem {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    link?: string | null;
    is_read: boolean;
    created_at: string;
}

interface AccessControlProps {
    currentUserType?: {
        id?: string;
        nome?: string | null;
        codigo?: string | null;
    } | null;
}

interface DashboardProps {
    user?: UserSummary;
    athlete: Athlete;
    proximo_treino?: ProximoTreino | null;
    proximos_eventos: ProximoEvento[];
    ultimos_resultados: UltimoResultado[];
    mensalidades: Mensalidade[];
    proxima_mensalidade_pendente?: Mensalidade | null;
    resumo?: ResumoPortal;
    modulos_visiveis: string[];
    is_also_admin: boolean;
    is_atleta?: boolean;
    has_family?: boolean;
    family_summary?: {
        total_familias: number;
        total_elementos: number;
        educandos: number;
        alertas: number;
        pagamentos_pendentes: number;
        convocatorias_pendentes: number;
    } | null;
    family_portal_url?: string | null;
    perfil_tipos?: string[];
    portal_context_label?: string | null;
    accessControl?: AccessControlProps;
    communicationAlerts?: {
        unreadCount: number;
        recent: AlertItem[];
    };
    clubSettings?: ClubSettingsProps;
}

type PageProps = SharedPageProps<DashboardProps>;

interface QuickAccessItem {
    key: string;
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    accentClass: string;
}

function profileSubtitle(athlete: Athlete, currentProfile: string): string {
    return [athlete.escalao, currentProfile].filter(Boolean).join(' · ') || currentProfile;
}

function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return (parts[0]?.[0] ?? 'U').toUpperCase();
}

function parseNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: string | number | null | undefined): string {
    const parsed = parseNumber(value);

    if (parsed === null) {
        return '0,00 €';
    }

    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(parsed);
}

function formatDate(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!dateStr) {
        return 'Sem data';
    }

    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return 'Sem data';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        ...options,
    }).format(date);
}

function formatDateTime(dateStr: string | null | undefined, timeStr: string | null | undefined): string {
    const formattedDate = formatDate(dateStr, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    });
    const formattedTime = timeStr ? timeStr.slice(0, 5) : null;

    return formattedTime ? `${formattedDate}, ${formattedTime}` : formattedDate;
}

function formatInvoiceState(state: string | null | undefined): string {
    switch ((state ?? '').toLowerCase()) {
        case 'pago':
            return 'Regularizado';
        case 'pendente':
            return 'Pendente';
        case 'em_atraso':
        case 'atraso':
            return 'Em atraso';
        default:
            return state?.trim() || 'Sem atualização';
    }
}

export default function Atleta() {
    const { props } = usePage<PageProps>();
    const {
        auth,
        athlete,
        clubSettings,
        accessControl,
        communicationAlerts,
        proximo_treino,
        proximos_eventos = [],
        ultimos_resultados = [],
        mensalidades = [],
        proxima_mensalidade_pendente,
        resumo,
        modulos_visiveis = [],
        is_also_admin = false,
        is_atleta = true,
        has_family = false,
        family_summary = null,
        family_portal_url = null,
        perfil_tipos = [],
        portal_context_label,
    } = props;

    const memberId = String(props.user?.id ?? auth.user?.id ?? '');
    const currentProfile = portal_context_label || accessControl?.currentUserType?.nome?.trim() || (is_atleta ? 'Atleta' : perfil_tipos[0] || 'Portal');
    const currentBalance = parseNumber(resumo?.conta_corrente ?? athlete.conta_corrente);
    const nextEvent = proximos_eventos[0] ?? null;
    const recentAlerts = (communicationAlerts?.recent ?? []).slice(0, 3);
    const upcomingEvents = proximos_eventos.slice(0, 2);
    const recentResults = ultimos_resultados.slice(0, 2);
    const pendingInvoice = proxima_mensalidade_pendente
        ?? mensalidades.find((invoice) => (invoice.estado ?? '').toLowerCase() !== 'pago')
        ?? null;

    const dashboardHref = portalRoutes.dashboard;
    const memberProfileHref = portalRoutes.profile;
    const trainingsHref = portalRoutes.trainings;
    const convocationsHref = portalRoutes.events;
    const paymentsHref = portalRoutes.payments;
    const resultsHref = portalRoutes.results;
    const documentsHref = portalRoutes.documents;
    const communicationsHref = portalRoutes.communications;
    const storeHref = portalRoutes.shop;

    const quickAccessItems: QuickAccessItem[] = [
        {
            key: 'meus-dados',
            title: 'Os meus dados',
            description: 'Ficha pessoal',
            icon: IdCard,
            href: memberProfileHref,
            accentClass: 'bg-blue-50 text-blue-600',
        },
        {
            key: 'treinos',
            title: 'Treinos',
            description: 'Próximos e realizados',
            icon: Dumbbell,
            href: trainingsHref,
            accentClass: 'bg-sky-50 text-sky-600',
        },
        {
            key: 'convocatorias',
            title: 'Convocatórias / Eventos',
            description: 'Provas e eventos',
            icon: Megaphone,
            href: convocationsHref,
            accentClass: 'bg-orange-50 text-orange-600',
        },
        {
            key: 'pagamentos',
            title: 'Pagamentos',
            description: 'Faturas e quotas',
            icon: CreditCard,
            href: paymentsHref,
            accentClass: 'bg-emerald-50 text-emerald-600',
        },
        ...(has_family && family_portal_url ? [{
            key: 'familia',
            title: 'Família',
            description: family_summary?.educandos ? `${family_summary.educandos} educando(s)` : 'Área familiar',
            icon: Users,
            href: family_portal_url,
            accentClass: 'bg-rose-50 text-rose-600',
        }] : []),
        {
            key: 'resultados',
            title: 'Resultados',
            description: 'Tempos e evolução',
            icon: Trophy,
            href: resultsHref,
            accentClass: 'bg-violet-50 text-violet-600',
        },
        {
            key: 'documentos',
            title: 'Documentos',
            description: 'Licenças e anexos',
            icon: FileText,
            href: documentsHref,
            accentClass: 'bg-indigo-50 text-indigo-600',
        },
        {
            key: 'comunicados',
            title: 'Comunicados',
            description: 'Avisos do clube',
            icon: MessageCircle,
            href: communicationsHref,
            accentClass: 'bg-purple-50 text-purple-600',
        },
        {
            key: 'loja',
            title: 'Loja / Requisições',
            description: 'Equipamento do clube',
            icon: ShoppingBag,
            href: storeHref,
            accentClass: 'bg-amber-50 text-amber-600',
        },
    ];

    const nextAction = (() => {
        if (proximo_treino) {
            return {
                eyebrow: 'Próximo treino',
                title: formatDateTime(proximo_treino.data, proximo_treino.hora_inicio),
                badge: 'Sessão agendada',
                lineOne: proximo_treino.numero_treino ? `Treino ${proximo_treino.numero_treino}` : 'Treino planeado',
                lineTwo: [proximo_treino.local, proximo_treino.grupo_label || proximo_treino.tipo_treino].filter(Boolean).join(' • '),
                cta: 'Ver detalhes',
                href: trainingsHref,
                icon: Dumbbell,
            };
        }

        if (nextEvent) {
            return {
                eyebrow: 'Próxima ação',
                title: nextEvent.titulo,
                badge: nextEvent.estado?.trim() || 'Agendado',
                lineOne: formatDateTime(nextEvent.data_inicio, nextEvent.hora_inicio),
                lineTwo: nextEvent.local || nextEvent.tipo || 'Local por definir',
                cta: 'Ver agenda',
                href: convocationsHref,
                icon: CalendarDays,
            };
        }

        if (pendingInvoice) {
            return {
                eyebrow: 'Pagamento pendente',
                title: pendingInvoice.mes || formatInvoiceState(pendingInvoice.estado),
                badge: formatInvoiceState(pendingInvoice.estado),
                lineOne: formatCurrency(pendingInvoice.valor),
                lineTwo: pendingInvoice.data_vencimento ? `Vencimento ${formatDate(pendingInvoice.data_vencimento, { day: '2-digit', month: 'short' })}` : 'Consulte a sua conta corrente',
                cta: 'Ver pagamentos',
                href: paymentsHref,
                icon: CreditCard,
            };
        }

        return {
            eyebrow: 'Próxima ação',
            title: 'Acompanhar a sua área pessoal',
            badge: 'Portal ativo',
            lineOne: 'Consulte agenda, pagamentos e comunicados num só lugar.',
            lineTwo: 'Tudo o que precisa, sem entrar na área administrativa.',
            cta: 'Atualizar área',
            href: dashboardHref,
            icon: House,
        };
    })();

    const NextActionIcon = nextAction.icon;

    const kpis: Array<{ label: string; value: string; helper: string; icon: LucideIcon }> = [
        {
            label: 'Treinos',
            value: String(resumo?.treinos_mes ?? 0),
            helper: 'Este mês',
            icon: Dumbbell,
        },
        {
            label: 'Eventos',
            value: String(resumo?.eventos_proximos ?? proximos_eventos.length),
            helper: 'Próximos',
            icon: CalendarDays,
        },
        {
            label: 'Conta Corrente',
            value: formatCurrency(currentBalance),
            helper: 'Saldo atual',
            icon: CreditCard,
        },
        {
            label: 'Assiduidade',
            value: resumo?.assiduidade_percent !== null && resumo?.assiduidade_percent !== undefined ? `${resumo.assiduidade_percent}%` : '—',
            helper: 'Este mês',
            icon: Trophy,
        },
    ];

    const handleVisit = (href: string) => {
        router.visit(href || dashboardHref);
    };

    return (
        <>
            <Head title="A Minha Área" />

            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="dashboard"
                hasFamily={has_family}
            >
                <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#0f57b3_0%,#114c98_100%)] px-2.5 py-2.5 text-white shadow-[0_16px_32px_rgba(15,76,152,0.22)] md:px-3 md:py-3">
                    <div className="relative">
                        <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-20 w-20 rounded-full bg-white/8 md:h-24 md:w-24" />
                        <div className="relative flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-start gap-2">
                                    {athlete.foto_perfil ? (
                                        <img src={athlete.foto_perfil} alt={athlete.name} className="h-16 w-16 rounded-xl border border-white/20 object-cover md:h-[4.5rem] md:w-[4.5rem]" />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/90 text-xl font-bold text-[#0f57b3] md:h-[4.5rem] md:w-[4.5rem]">
                                            {getInitials(athlete.name)}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <h2 className="truncate text-base font-semibold leading-tight text-white md:text-[1.05rem]">
                                            {athlete.name}
                                        </h2>
                                        <p className="text-[11px] text-blue-100 md:text-xs">{profileSubtitle(athlete, currentProfile)}</p>
                                        <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-semibold">
                                            <span className="rounded-full bg-lime-100 px-1.5 py-0.5 text-lime-800">{athlete.estado?.trim() || 'Ativo'}</span>
                                            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-white">{currentProfile}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:hidden">
                                    {is_also_admin ? (
                                        <button
                                            type="button"
                                            onClick={() => handleVisit('/dashboard?mode=admin')}
                                            className="rounded-lg border border-orange-300/80 bg-orange-50 px-2.5 py-1.5 text-[10px] font-semibold text-orange-600"
                                        >
                                            Administração
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleVisit(nextAction.href)}
                                className="group flex w-full items-center justify-between gap-2 rounded-[16px] border border-white/15 bg-white/10 px-2.5 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-white/12 md:h-8 md:w-8">
                                        <NextActionIcon className="h-4 w-4 text-white" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-100">{nextAction.eyebrow}</p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                            <h3 className="text-sm font-semibold leading-none text-white md:text-[0.95rem]">{nextAction.title}</h3>
                                            <span className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-semibold text-orange-600">{nextAction.badge}</span>
                                        </div>
                                        <p className="mt-0.5 text-[11px] text-blue-50 md:text-xs">{nextAction.lineOne}</p>
                                        <p className="mt-0.5 text-[11px] text-blue-100/90 md:text-xs">{nextAction.lineTwo}</p>
                                    </div>
                                </div>

                                <div className="hidden shrink-0 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white transition group-hover:bg-white/15 sm:block">
                                    {nextAction.cta}
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">
                    <div>
                        <div className="mb-3">
                            <h2 className="text-[1.25rem] font-semibold leading-tight text-slate-900">Resumo rápido</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {kpis.map((item) => (
                                <PortalKpiCard key={item.label} label={item.label} value={item.value} helper={item.helper} icon={item.icon} />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2">
                        <PortalSection
                            title="Comunicados recentes"
                            description=""
                            actionLabel="Ver todos"
                            onAction={() => handleVisit(communicationsHref)}
                        >
                            <div className="space-y-2.5">
                                {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
                                    <button
                                        key={alert.id}
                                        type="button"
                                        onClick={() => handleVisit(alert.link || communicationsHref)}
                                        className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-slate-50"
                                    >
                                        <div className={`mt-1 h-2.5 w-2.5 rounded-full ${alert.is_read ? 'bg-slate-300' : 'bg-blue-600'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">{alert.title}</p>
                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{alert.message}</p>
                                        </div>
                                        <span className="text-[11px] text-slate-400">{formatDate(alert.created_at?.slice(0, 10), { day: '2-digit', month: 'short' })}</span>
                                    </button>
                                )) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Sem comunicados recentes.
                                    </div>
                                )}
                            </div>
                        </PortalSection>

                        <PortalSection
                            title="Próximos eventos"
                            description=""
                            actionLabel="Ver todos"
                            onAction={() => handleVisit(convocationsHref)}
                        >
                            <div className="space-y-2.5">
                                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                                    <button
                                        key={event.id}
                                        type="button"
                                        onClick={() => handleVisit(convocationsHref)}
                                        className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-slate-50"
                                    >
                                        <div className="mt-[0.45rem] h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">{event.titulo}</p>
                                            <p className="mt-1 text-xs text-slate-500">{formatDate(event.data_inicio, { day: '2-digit', month: 'long' })} · {event.local || 'Local por definir'}</p>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Sem eventos próximos.
                                    </div>
                                )}
                            </div>
                        </PortalSection>
                    </div>
                </section>

                <PortalSection title="Acesso rápido" description="">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {quickAccessItems.map((item) => (
                            <PortalCard
                                key={item.key}
                                title={item.title}
                                description={item.description}
                                icon={item.icon}
                                accentClass={item.accentClass}
                                onClick={() => handleVisit(item.href)}
                            />
                        ))}
                    </div>
                </PortalSection>

                <PortalSection
                    title="Últimos resultados"
                    description="Resumo rápido do desempenho mais recente."
                    actionLabel="Ver resultados"
                    onAction={() => handleVisit(resultsHref)}
                >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                        {recentResults.length > 0 ? recentResults.map((result) => (
                            <div key={result.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-900">{result.estilo || 'Prova'} {result.distancia_m ? `${result.distancia_m}m` : ''}</p>
                                <p className="mt-1 text-xs text-slate-500">{result.competicao || 'Competição sem nome'}</p>
                                <div className="mt-4 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Tempo</p>
                                        <p className="mt-1 text-lg font-semibold text-slate-900">{result.tempo_formatado || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Posição</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700">{result.desclassificado ? 'DSQ' : result.posicao ? `${result.posicao}º` : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2">
                                Sem resultados recentes.
                            </div>
                        )}
                    </div>
                </PortalSection>
            </PortalLayout>
        </>
    );
}
