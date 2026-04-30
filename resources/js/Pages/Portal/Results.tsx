import { Head, usePage } from '@inertiajs/react';
import { Activity, CalendarClock, ChevronRight, Medal, TrendingUp, Trophy } from 'lucide-react';
import { useState } from 'react';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import PortalLayout from '@/Layouts/PortalLayout';
import type { ClubSettingsProps, PageProps as SharedPageProps } from '@/types';

interface PortalUserSummary {
    id: string | number;
    name: string;
    email?: string | null;
}

interface HeroResult {
    prova: string;
    time: string;
    event: string;
    highlight: string;
}

interface PersonalRecordHighlight {
    label: string;
    context: string | null;
}

type BadgeTone = 'blue' | 'emerald' | 'amber' | 'slate';

interface ResultBadge {
    key: string;
    label: string;
    tone: BadgeTone;
}

interface ResultCard {
    id: string;
    prova: string;
    distance: string;
    style: string;
    time: string;
    event: string;
    location: string;
    date: string | null;
    date_label: string;
    ranking: string;
    evolution_label: string;
    evolution_seconds: number | null;
    badges: ResultBadge[];
    details: {
        official_time: string;
        previous_time: string | null;
        points_fina: number | null;
        notes: string | null;
    };
}

interface BestTimeCard {
    id: string;
    prova: string;
    best_time: string;
    date: string | null;
    date_label: string;
    event: string;
}

interface EvolutionEntry {
    id: string;
    label: string;
    time: string;
    performance_percent: number;
}

interface ResultsPortalProps {
    user: PortalUserSummary;
    perfil_tipos: string[];
    is_also_admin: boolean;
    is_athlete: boolean;
    has_family?: boolean;
    clubSettings?: ClubSettingsProps;
    hero: {
        last_result: HeroResult | null;
        best_time: HeroResult | null;
        personal_record: PersonalRecordHighlight | null;
    };
    kpis: {
        events_this_season: number;
        personal_bests: number;
        latest_time: string | null;
        main_event_evolution: string | null;
        main_event_label: string | null;
    };
    latest_results: ResultCard[];
    best_times: BestTimeCard[];
    evolution: {
        has_data: boolean;
        prova: string | null;
        improvement_seconds: number | null;
        improvement_label: string;
        entries: EvolutionEntry[];
    };
}

type PageProps = SharedPageProps<ResultsPortalProps>;

const badgeToneClasses: Record<BadgeTone, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-600',
};

export default function Results() {
    const { props } = usePage<PageProps>();
    const { auth, clubSettings, has_family = false } = props;
    const {
        is_also_admin,
        is_athlete,
        hero,
        kpis,
        latest_results = [],
        best_times = [],
        evolution,
    } = props;
    const [expandedResultId, setExpandedResultId] = useState<string | null>(latest_results[0]?.id ?? null);

    const hasResults = latest_results.length > 0;

    return (
        <>
            <Head title="Resultados" />

            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="results"
                hasFamily={has_family}
            >
                <section className="overflow-hidden rounded-[20px] border border-blue-900/10 bg-[linear-gradient(180deg,rgba(29,78,216,0.92)_0%,rgba(30,64,175,0.9)_100%)] px-3.5 py-4 text-white shadow-[0_14px_28px_rgba(30,64,175,0.16)] sm:px-4 lg:px-5">
                    <div className="flex flex-col items-start gap-3">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">Resultados</p>
                            <h1 className="mt-1.5 text-xl font-semibold">Resultados</h1>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <a
                                href="#portal-results-evolution"
                                className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                                Ver evolução
                            </a>
                            <a
                                href="#portal-results-history"
                                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                            >
                                Histórico
                            </a>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                        <HeroHighlight
                            eyebrow="Último resultado"
                            title={hero.last_result?.prova ?? 'Sem resultados registados'}
                            value={hero.last_result?.time ?? '--:--.--'}
                            detail={hero.last_result?.event ?? 'Ainda não existem resultados registados.'}
                            note={hero.last_result?.highlight ?? 'Consulta apenas, sem ações administrativas.'}
                        />
                        <HeroHighlight
                            eyebrow="Melhor tempo"
                            title={hero.best_time?.prova ?? 'Sem marca disponível'}
                            value={hero.best_time?.time ?? '--:--.--'}
                            detail={hero.best_time?.event ?? 'Sem histórico suficiente.'}
                            note={hero.best_time?.highlight ?? 'Melhor marca oficial conhecida.'}
                        />
                        <HeroHighlight
                            eyebrow="Recorde pessoal"
                            title={hero.personal_record?.label ?? 'Sem recorde pessoal'}
                            value={hero.last_result?.time ?? '--:--.--'}
                            detail={hero.personal_record?.context ?? 'Será destacado quando existir histórico competitivo.'}
                            note="Novo recorde pessoal"
                        />
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PortalKpiCard label="Provas esta época" value={String(kpis.events_this_season)} helper="resultados oficiais" icon={Trophy} />
                    <PortalKpiCard label="Recordes pessoais" value={String(kpis.personal_bests)} helper="disciplinas em destaque" icon={Medal} />
                    <PortalKpiCard label="Último tempo" value={kpis.latest_time ?? '--:--.--'} helper="marca mais recente" icon={CalendarClock} />
                    <PortalKpiCard
                        label="Evolução prova principal"
                        value={kpis.main_event_evolution ?? 'Sem dados'}
                        helper={kpis.main_event_label ?? 'Aguardando histórico'}
                        icon={TrendingUp}
                    />
                </section>

                {!is_athlete ? (
                    <PortalSection title="Resultados" description="Vista exclusiva para atletas autenticados.">
                        <EmptyState
                            title="Resultados indisponíveis para este perfil"
                            message="Ainda não existem resultados registados."
                            detail="Os resultados de educandos devem ser consultados através do módulo Família."
                        />
                    </PortalSection>
                ) : !hasResults ? (
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] xl:items-start">
                        <PortalSection title="Últimos resultados" description="Histórico recente do atleta autenticado.">
                            <EmptyState
                                title="Ainda não existem resultados registados."
                                message="Ainda não existem resultados registados."
                                detail="Quando houver tempos oficiais, esta vista mostrará histórico, melhores marcas e evolução."
                            />
                        </PortalSection>

                        <div className="space-y-4">
                            <PortalSection title="Melhores tempos" description="Marcas de referência por prova.">
                                <EmptyState title="Sem marcas registadas" message="Ainda não existem resultados registados." />
                            </PortalSection>

                            <PortalSection title="Evolução" description="Comparação simples da prova principal.">
                                <EmptyState title="Sem dados suficientes para evolução." message="Sem dados suficientes para evolução." />
                            </PortalSection>
                        </div>
                    </div>
                ) : (
                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] xl:items-start">
                        <div id="portal-results-history" className="space-y-4">
                            <PortalSection title="Últimos resultados" description="Consulta apenas dos registos oficiais do atleta autenticado.">
                                <div className="space-y-3">
                                    {latest_results.map((result) => {
                                        const expanded = expandedResultId === result.id;

                                        return (
                                            <article key={result.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{result.date_label}</p>
                                                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{result.prova}</h3>
                                                        <p className="mt-1 text-sm text-slate-500">{result.event} · {result.location}</p>
                                                    </div>

                                                    <div className="flex flex-col items-start gap-2 lg:items-end">
                                                        <p className="text-2xl font-semibold text-slate-900">{result.time}</p>
                                                        <p className="text-sm font-medium text-slate-500">{result.ranking}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                    <MetaCard label="Distância" value={result.distance} />
                                                    <MetaCard label="Estilo" value={result.style} />
                                                    <MetaCard label="Classificação" value={result.ranking} />
                                                    <MetaCard label="Evolução" value={result.evolution_label} />
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {result.badges.map((badge) => (
                                                        <Badge key={badge.key} badge={badge} />
                                                    ))}
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedResultId(expanded ? null : result.id)}
                                                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                                                    >
                                                        Ver detalhe
                                                    </button>
                                                    <a
                                                        href="#portal-results-evolution"
                                                        className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                                    >
                                                        Comparar evolução
                                                    </a>
                                                </div>

                                                {expanded ? (
                                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <MetaCard label="Tempo oficial" value={result.details.official_time} />
                                                            <MetaCard label="Resultado anterior" value={result.details.previous_time ?? 'Sem comparativo'} />
                                                            <MetaCard label="Pontos FINA" value={result.details.points_fina ? String(result.details.points_fina) : 'Sem pontos'} />
                                                            <MetaCard label="Notas" value={result.details.notes || 'Sem observações.'} />
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </article>
                                        );
                                    })}
                                </div>
                            </PortalSection>
                        </div>

                        <div className="space-y-4">
                            <PortalSection title="Melhores tempos" description="Melhores marcas oficiais por prova.">
                                {best_times.length > 0 ? (
                                    <div className="space-y-3">
                                        {best_times.map((item) => (
                                            <article key={item.id} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-slate-900">{item.prova}</h3>
                                                        <p className="mt-1 text-sm text-slate-500">{item.event}</p>
                                                    </div>
                                                    <p className="text-lg font-semibold text-slate-900">{item.best_time}</p>
                                                </div>
                                                <p className="mt-3 text-sm text-slate-500">{item.date_label}</p>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState title="Sem marcas registadas" message="Ainda não existem resultados registados." />
                                )}
                            </PortalSection>

                            <PortalSection title="Evolução" description="Comparação visual da prova principal sem substituir a gestão administrativa." >
                                <div id="portal-results-evolution" className="space-y-4">
                                    {evolution.has_data ? (
                                        <>
                                            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Prova principal</p>
                                                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{evolution.prova}</h3>
                                                    </div>
                                                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                                        {evolution.improvement_seconds !== null && evolution.improvement_seconds > 0
                                                            ? `-${evolution.improvement_seconds.toFixed(2)}s`
                                                            : 'Sem melhoria'}
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-sm text-slate-600">{evolution.improvement_label}</p>
                                            </div>

                                            <div className="space-y-3">
                                                {evolution.entries.map((entry) => (
                                                    <div key={entry.id}>
                                                        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                                                            <span className="font-medium text-slate-700">{entry.label}</span>
                                                            <span className="text-slate-500">{entry.time}</span>
                                                        </div>
                                                        <div className="h-2.5 rounded-full bg-slate-100">
                                                            <div
                                                                className="h-2.5 rounded-full bg-[linear-gradient(90deg,rgba(59,130,246,0.92)_0%,rgba(16,185,129,0.9)_100%)]"
                                                                style={{ width: `${entry.performance_percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <EmptyState title="Sem dados suficientes para evolução." message="Sem dados suficientes para evolução." />
                                    )}
                                </div>
                            </PortalSection>

                            <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                                Os resultados apresentados são apenas de consulta pessoal. Resultados de educandos devem ser vistos através do módulo Família.
                            </div>
                        </div>
                    </section>
                )}
            </PortalLayout>
        </>
    );
}

function HeroHighlight({ eyebrow, title, value, detail, note }: { eyebrow: string; title: string; value: string; detail: string; note: string }) {
    return (
        <div className="rounded-[18px] border border-white/15 bg-white/10 p-3.5 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100">{eyebrow}</p>
            <h2 className="mt-1.5 text-base font-semibold text-white">{title}</h2>
            <p className="mt-1.5 text-xl font-semibold text-white">{value}</p>
            <p className="mt-1.5 text-xs text-blue-50">{detail}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-blue-100">{note}</p>
        </div>
    );
}

function MetaCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
        </div>
    );
}

function Badge({ badge }: { badge: ResultBadge }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeToneClasses[badge.tone]}`}>
            {badge.label}
        </span>
    );
}

function EmptyState({ title, message, detail }: { title: string; message: string; detail?: string }) {
    return (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <Activity className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
        </div>
    );
}