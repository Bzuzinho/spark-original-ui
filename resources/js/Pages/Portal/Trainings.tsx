import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Activity,
    CheckCircle2,
    CircleGauge,
    Clock3,
    Dumbbell,
    MapPin,
    NotebookPen,
    Ruler,
    Waves,
    XCircle,
} from 'lucide-react';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import PortalLayout from '@/Layouts/PortalLayout';
import type { ClubSettingsProps, PageProps as SharedPageProps } from '@/types';

interface PortalUserSummary {
    id: string | number;
    name: string;
    email?: string | null;
}

interface TrainingStatus {
    key: 'pending' | 'confirmed' | 'justified' | 'completed' | 'absent';
    label: string;
    tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
}

interface TrainingPermissions {
    can_confirm_presence: boolean;
    can_justify_absence: boolean;
    can_correct_volume: boolean;
}

interface TrainingCard {
    id: string;
    training_id: string;
    date: string | null;
    date_label: string;
    weekday_label: string | null;
    time_label: string;
    location: string;
    title: string;
    group_label: string;
    planned_meters: number | null;
    planned_meters_label: string;
    final_meters: number | null;
    final_meters_label: string;
    completion_percent: number | null;
    coach_note: string | null;
    plan_note: string | null;
    status: TrainingStatus;
    permissions: TrainingPermissions;
}

interface CoachNote {
    id: string;
    date_label: string;
    context: string;
    note: string;
}

interface TrainingsPortalProps {
    user: PortalUserSummary;
    perfil_tipos: string[];
    is_also_admin: boolean;
    is_athlete: boolean;
    has_family?: boolean;
    clubSettings?: ClubSettingsProps;
    communicationAlerts?: {
        unreadCount: number;
    };
    summary: {
        trainings_this_month: number;
        confirmed_presence: number;
        volume_km: string;
        attendance_rate: number;
    };
    next_training: TrainingCard | null;
    upcoming_trainings: TrainingCard[];
    latest_training: TrainingCard | null;
    history: TrainingCard[];
    latest_coach_note: CoachNote | null;
}

type PageProps = SharedPageProps<TrainingsPortalProps>;

const statusToneClasses: Record<TrainingStatus['tone'], string> = {
    neutral: 'border-slate-200 bg-slate-100 text-slate-600',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function Trainings() {
    const { props } = usePage<PageProps>();
    const { auth, clubSettings, has_family = false } = props;
    const {
        user,
        perfil_tipos = [],
        communicationAlerts,
        is_also_admin,
        is_athlete,
        summary,
        next_training,
        upcoming_trainings = [],
        latest_training,
        history = [],
        latest_coach_note,
    } = props;

    const [expandedTrainingId, setExpandedTrainingId] = useState<string | null>(next_training?.id ?? latest_training?.id ?? null);
    const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
    const volumeForm = useForm<{ action: string; volume_real_m: string }>({
        action: 'correct_volume',
        volume_real_m: '',
    });

    const submitTrainingAction = (training: TrainingCard, action: 'confirm_presence' | 'justify_absence') => {
        router.patch(
            `/portal/treinos/${training.id}`,
            { action },
            { preserveScroll: true },
        );
    };

    const startVolumeEdit = (training: TrainingCard) => {
        setEditingTrainingId(training.id);
        volumeForm.setData({ action: 'correct_volume', volume_real_m: training.final_meters ? String(training.final_meters) : '' });
        volumeForm.clearErrors();
    };

    const submitVolumeCorrection = (trainingId: string) => {
        volumeForm.patch(`/portal/treinos/${trainingId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingTrainingId(null);
                volumeForm.reset('volume_real_m');
            },
        });
    };

    return (
        <>
            <Head title="Treinos" />

            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="trainings"
                hasFamily={has_family}
            >
                <section className="overflow-hidden rounded-[24px] border border-blue-900/10 bg-[linear-gradient(180deg,rgba(29,78,216,0.95)_0%,rgba(30,64,175,0.92)_100%)] px-4 py-5 text-white shadow-[0_16px_32px_rgba(30,64,175,0.18)] sm:px-5 lg:px-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Treinos</p>
                    <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-semibold">Treinos</h2>
                            <p className="mt-2 text-sm text-blue-50">
                                Vista simplificada para acompanhar presença, volume treinado, histórico recente e notas do treinador.
                            </p>
                        </div>

                        {next_training ? (
                            <div className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">Próximo treino</p>
                                <p className="mt-2 text-lg font-semibold">{formatHeroDate(next_training.weekday_label, next_training.time_label)}</p>
                                <p className="mt-1 text-sm text-blue-50">{next_training.location}</p>
                                <p className="mt-1 text-sm text-blue-50">{next_training.group_label}</p>
                                <p className="mt-1 text-sm text-white">{next_training.title}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {next_training.permissions.can_confirm_presence ? (
                                        <button
                                            type="button"
                                            onClick={() => submitTrainingAction(next_training, 'confirm_presence')}
                                            className="inline-flex items-center justify-center rounded-2xl bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                        >
                                            Confirmar presença
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedTrainingId(next_training.id)}
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Ver plano do treino
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-50 backdrop-blur">
                                Sem treinos agendados.
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PortalKpiCard label="Treinos do mês" value={String(summary.trainings_this_month)} helper="agendados" icon={CalendarDays} />
                    <PortalKpiCard label="Presenças confirmadas" value={String(summary.confirmed_presence)} helper="estado atual" icon={CheckCircle2} />
                    <PortalKpiCard label="Volume treinado" value={`${summary.volume_km} km`} helper="metros finais" icon={Waves} />
                    <PortalKpiCard label="Assiduidade" value={`${summary.attendance_rate}%`} helper="registos fechados" icon={Activity} />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] xl:items-start">
                    <div className="space-y-4">
                        <PortalSection title="Próximos treinos" description="Agenda confirmável do atleta, sem ações administrativas.">
                            {upcoming_trainings.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {upcoming_trainings.map((training) => (
                                        <article key={training.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{training.date_label}</p>
                                                    <h3 className="mt-2 text-base font-semibold text-slate-900">{training.title}</h3>
                                                    <p className="mt-1 text-sm text-slate-500">{training.group_label}</p>
                                                </div>
                                                <StatusBadge status={training.status} />
                                            </div>

                                            <div className="mt-4 space-y-2 text-sm text-slate-600">
                                                <InlineMeta icon={Clock3} label={training.time_label} />
                                                <InlineMeta icon={MapPin} label={training.location} />
                                                <InlineMeta icon={Ruler} label={`Metros previstos: ${training.planned_meters_label}`} />
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {training.permissions.can_confirm_presence ? (
                                                    <ActionButton onClick={() => submitTrainingAction(training, 'confirm_presence')}>
                                                        Confirmar presença
                                                    </ActionButton>
                                                ) : null}
                                                <SecondaryButton onClick={() => setExpandedTrainingId(expandedTrainingId === training.id ? null : training.id)}>
                                                    Ver treino
                                                </SecondaryButton>
                                                {training.permissions.can_justify_absence ? (
                                                    <SecondaryButton onClick={() => submitTrainingAction(training, 'justify_absence')} tone="danger">
                                                        Avisar ausência
                                                    </SecondaryButton>
                                                ) : null}
                                            </div>

                                            {expandedTrainingId === training.id ? (
                                                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                                                    <p className="font-medium text-slate-800">Plano</p>
                                                    <p className="mt-1">{training.plan_note || 'Sem plano detalhado disponível.'}</p>
                                                    {training.coach_note ? <p className="mt-3 text-slate-500">Nota do treinador: {training.coach_note}</p> : null}
                                                </div>
                                            ) : null}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Sem treinos agendados." />
                            )}
                        </PortalSection>

                        <PortalSection title="Último treino" description="Último registo concluído ou acompanhado neste portal.">
                            {latest_training ? (
                                <article className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge status={latest_training.status} />
                                                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{latest_training.date_label}</span>
                                            </div>
                                            <h3 className="mt-3 text-lg font-semibold text-slate-900">{latest_training.title}</h3>
                                            <p className="mt-1 text-sm text-slate-500">{latest_training.group_label}</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setExpandedTrainingId(expandedTrainingId === latest_training.id ? null : latest_training.id)}
                                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                        >
                                            Abrir detalhe
                                        </button>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        <MetricTile label="Metros previstos" value={latest_training.planned_meters_label} />
                                        <MetricTile label="Metros finais" value={latest_training.final_meters_label} />
                                        <MetricTile label="Conclusão" value={latest_training.completion_percent !== null ? `${latest_training.completion_percent}%` : 'Sem cálculo'} />
                                        <MetricTile label="Estado" value={latest_training.status.label} />
                                    </div>

                                    {latest_training.coach_note ? (
                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                                            <p className="font-medium text-slate-800">Observação curta</p>
                                            <p className="mt-1">{latest_training.coach_note}</p>
                                        </div>
                                    ) : null}

                                    {expandedTrainingId === latest_training.id ? (
                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                                            <p className="font-medium text-slate-800">Detalhe do treino</p>
                                            <div className="mt-3 space-y-2">
                                                <InlineMeta icon={Clock3} label={latest_training.time_label} />
                                                <InlineMeta icon={MapPin} label={latest_training.location} />
                                                <InlineMeta icon={NotebookPen} label={latest_training.plan_note || 'Sem plano detalhado disponível.'} />
                                            </div>
                                        </div>
                                    ) : null}

                                    {latest_training.permissions.can_correct_volume ? (
                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                                            {editingTrainingId === latest_training.id ? (
                                                <form
                                                    onSubmit={(event) => {
                                                        event.preventDefault();
                                                        submitVolumeCorrection(latest_training.id);
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Corrigir metros
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={50000}
                                                            value={volumeForm.data.volume_real_m}
                                                            onChange={(event) => volumeForm.setData('volume_real_m', event.target.value)}
                                                            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                                                            placeholder="Ex.: 3200"
                                                        />
                                                    </label>
                                                    {volumeForm.errors.volume_real_m ? <p className="text-sm text-rose-600">{volumeForm.errors.volume_real_m}</p> : null}
                                                    <div className="flex flex-wrap gap-2">
                                                        <ActionButton type="submit" disabled={volumeForm.processing}>Guardar metros</ActionButton>
                                                        <SecondaryButton onClick={() => setEditingTrainingId(null)}>Cancelar</SecondaryButton>
                                                    </div>
                                                </form>
                                            ) : (
                                                <ActionButton onClick={() => startVolumeEdit(latest_training)}>Corrigir metros</ActionButton>
                                            )}
                                        </div>
                                    ) : null}
                                </article>
                            ) : (
                                <EmptyState message={is_athlete ? 'Ainda não existem treinos concluídos.' : 'Sem treinos disponíveis para este utilizador.'} />
                            )}
                        </PortalSection>
                    </div>

                    <div className="space-y-4">
                        <PortalSection title="Histórico recente" description="Últimos treinos realizados e respetivo estado de presença.">
                            {history.length > 0 ? (
                                <div className="space-y-3">
                                    {history.map((training) => (
                                        <article key={training.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{training.date_label}</p>
                                                    <h3 className="mt-2 text-sm font-semibold text-slate-900">{training.title}</h3>
                                                    <p className="mt-1 text-sm text-slate-500">{training.final_meters_label}</p>
                                                </div>
                                                <StatusBadge status={training.status} compact />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Ainda não existem treinos concluídos." />
                            )}
                        </PortalSection>

                        <PortalSection title="Notas do treinador" description="Última observação registada sobre o teu treino.">
                            {latest_coach_note ? (
                                <article className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{latest_coach_note.date_label}</p>
                                    <h3 className="mt-2 text-base font-semibold text-slate-900">{latest_coach_note.context}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{latest_coach_note.note}</p>
                                </article>
                            ) : (
                                <EmptyState message="Sem notas do treinador." />
                            )}
                        </PortalSection>
                    </div>
                </section>
            </PortalLayout>
        </>
    );
}

function StatusBadge({ status, compact = false }: { status: TrainingStatus; compact?: boolean }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusToneClasses[status.tone]} ${compact ? '' : 'shadow-sm'}`}
        >
            {status.label}
        </span>
    );
}

function InlineMeta({ icon: Icon, label }: { icon: typeof Clock3; label: string }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
            <span>{label}</span>
        </div>
    );
}

function MetricTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-sm text-slate-500">
            {message}
        </div>
    );
}

function ActionButton({
    children,
    onClick,
    type = 'button',
    disabled = false,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
            {children}
        </button>
    );
}

function SecondaryButton({
    children,
    onClick,
    tone = 'default',
}: {
    children: React.ReactNode;
    onClick: () => void;
    tone?: 'default' | 'danger';
}) {
    const toneClass = tone === 'danger'
        ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-2xl border px-3.5 py-2 text-sm font-semibold transition ${toneClass}`}
        >
            {children}
        </button>
    );
}

function formatHeroDate(weekdayLabel: string | null, timeLabel: string): string {
    if (!weekdayLabel) {
        return timeLabel;
    }

    return `${weekdayLabel}, ${timeLabel}`;
}