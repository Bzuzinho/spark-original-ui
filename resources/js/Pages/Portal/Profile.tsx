import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    CalendarClock,
    Camera,
    FileText,
    FileUp,
    Receipt,
    ScrollText,
} from 'lucide-react';
import PortalCard from '@/Components/Portal/PortalCard';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import PortalLayout from '@/Layouts/PortalLayout';
import { portalRoutes } from '@/lib/portalRoutes';
import type { ClubSettingsProps, PageProps as SharedPageProps } from '@/types';

interface PortalBadge {
    label: string;
    tone: 'success' | 'info' | 'warning' | 'neutral';
}

interface DetailItem {
    label: string;
    value: string;
}

interface RelatedMember {
    id: string;
    name: string;
    member_number: string | null;
    type: string;
    state: string;
    is_minor: boolean;
    photo_url: string | null;
    portal_href: string;
}

interface DocumentItem {
    label: string;
    status: 'valid' | 'expiring' | 'expired' | 'pending';
    state_label: string;
    helper: string;
    meta: string;
}

interface NextPayment {
    label: string;
    due_date: string | null;
    amount: string;
    state: string;
}

interface ProfilePayload {
    id: string;
    name: string;
    member_number: string | null;
    type: string;
    state: string;
    photo_url: string | null;
    is_minor: boolean;
    viewing_self: boolean;
    can_edit: boolean;
    portal_href: string;
    editable: EditableProfileFields;
    summary_badges: PortalBadge[];
    personal: DetailItem[];
    status: DetailItem[];
    guardians: RelatedMember[];
    documents: DocumentItem[];
    sports: DetailItem[];
    financial: {
        current_balance: string;
        next_payment: NextPayment | null;
        plan: string;
    };
    flags: {
        is_athlete: boolean;
        is_socio: boolean;
        is_guardian: boolean;
        show_guardians: boolean;
    };
}

interface EditableProfileFields {
    nome_completo: string;
    data_nascimento: string | null;
    nif: string | null;
    cc: string | null;
    morada: string | null;
    codigo_postal: string | null;
    localidade: string | null;
    nacionalidade: string | null;
    sexo: 'masculino' | 'feminino' | null;
    contacto: string | null;
    email_secundario: string | null;
    num_federacao: string | null;
    numero_pmb: string | null;
    data_inscricao: string | null;
}

interface ViewerPayload {
    id: string;
    name: string;
    type: string;
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

interface PortalProfileProps {
    profile: ProfilePayload;
    viewer: ViewerPayload;
    viewer_dependents: RelatedMember[];
    allowed_profiles: Array<{ id: string; name: string; portal_href: string }>;
    modulos_visiveis: string[];
    is_also_admin: boolean;
    has_family?: boolean;
    clubSettings?: ClubSettingsProps;
    communicationAlerts?: {
        unreadCount: number;
        recent: AlertItem[];
    };
}

type PageProps = SharedPageProps<PortalProfileProps>;

function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return (parts[0]?.[0] ?? 'U').toUpperCase();
}

function badgeClasses(tone: PortalBadge['tone']): string {
    switch (tone) {
        case 'success':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'warning':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'neutral':
            return 'border-slate-200 bg-slate-100 text-slate-600';
        default:
            return 'border-blue-200 bg-blue-50 text-blue-700';
    }
}

function documentClasses(status: DocumentItem['status']): string {
    switch (status) {
        case 'valid':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'expiring':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'expired':
            return 'border-rose-200 bg-rose-50 text-rose-700';
        default:
            return 'border-slate-200 bg-slate-100 text-slate-600';
    }
}

function navigate(href: string) {
    if (href.startsWith('#')) {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    router.visit(href);
}

function InfoGrid({ items }: { items: DetailItem[] }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
            ))}
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 text-xs font-medium text-rose-600">{message}</p>;
}

function inputClass(hasError: boolean): string {
    return `mt-2 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
        hasError ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-blue-300'
    }`;
}

function RelatedCard({ member, onOpen }: { member: RelatedMember; onOpen: (href: string) => void }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="h-12 w-12 rounded-2xl object-cover" />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700">
                        {getInitials(member.name)}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.type} {member.member_number ? `· #${member.member_number}` : ''}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">{member.state}</span>
                        {member.is_minor ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Menor</span>
                        ) : null}
                    </div>
                </div>

                <div className="sm:ml-auto">
                    <button
                        type="button"
                        onClick={() => onOpen(member.portal_href)}
                        className="w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:w-auto"
                    >
                        Abrir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Profile() {
    const { props } = usePage<PageProps>();
    const { auth, clubSettings, has_family = false } = props;
    const {
        profile,
        viewer,
        viewer_dependents = [],
        allowed_profiles = [],
        modulos_visiveis = [],
        is_also_admin,
        communicationAlerts,
    } = props;

    const visibleModules = new Set(modulos_visiveis);
    const clubName = clubSettings?.nome_clube?.trim() || clubSettings?.display_name?.trim() || 'ClubOS';
    const clubShortName = clubSettings?.sigla?.trim() || clubSettings?.short_name?.trim() || 'ClubOS';
    const clubLogoUrl = clubSettings?.logo_url || null;
    const unreadNotifications = communicationAlerts?.unreadCount ?? 0;
    const recentAlert = communicationAlerts?.recent?.find((item) => !item.is_read && item.link) ?? communicationAlerts?.recent?.[0] ?? null;
    const [isEditing, setIsEditing] = useState(false);
    const photoInputRef = useRef<HTMLInputElement | null>(null);
    const form = useForm<EditableProfileFields & { photo: File | null }>({
        ...profile.editable,
        photo: null,
    });

    useEffect(() => {
        setIsEditing(false);
        form.reset();
        form.setData({
            ...profile.editable,
            photo: null,
        });
        form.clearErrors();
    }, [profile.id]);

    const photoPreviewUrl = useMemo(() => {
        if (!form.data.photo) {
            return null;
        }

        return URL.createObjectURL(form.data.photo);
    }, [form.data.photo]);

    useEffect(() => {
        return () => {
            if (photoPreviewUrl) {
                URL.revokeObjectURL(photoPreviewUrl);
            }
        };
    }, [photoPreviewUrl]);

    const personalErrors = form.errors as Partial<Record<keyof (EditableProfileFields & { photo: File | null }), string>>;
    const quickActions = [
        {
            key: 'upload-document',
            title: 'Carregar documento',
            description: 'Acede rapidamente ao bloco de documentos e validacoes.',
            icon: FileUp,
            href: '#documents',
            accentClass: 'bg-blue-50 text-blue-700',
        },
        {
            key: 'trainings',
            title: 'Ver treinos',
            description: 'Consulta o resumo desportivo ou abre o modulo de treinos.',
            icon: CalendarClock,
            href: '/portal/treinos',
            accentClass: 'bg-cyan-50 text-cyan-700',
        },
        {
            key: 'payments',
            title: 'Ver pagamentos',
            description: 'Segue para pagamentos se o modulo estiver disponivel.',
            icon: Receipt,
            href: portalRoutes.payments,
            accentClass: 'bg-emerald-50 text-emerald-700',
        },
        {
            key: 'communications',
            title: 'Ver comunicados',
            description: 'Abre a area de comunicacao ou regressa ao dashboard.',
            icon: ScrollText,
            href: portalRoutes.communications,
            accentClass: 'bg-orange-50 text-orange-700',
        },
    ];

    const handleStartEdit = () => {
        if (!profile.can_edit) {
            return;
        }

        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        form.reset();
        form.clearErrors();
        setIsEditing(false);
    };

    const handleSubmit = () => {
        const targetRoute = profile.viewing_self
            ? route('portal.profile.update')
            : route('portal.profile.update', { member: profile.id });

        form.transform((data) => ({
            ...data,
            _method: 'patch',
        }));

        form.post(targetRoute, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                form.reset('photo');
            },
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    const currentPhotoUrl = photoPreviewUrl || profile.photo_url;

    return (
        <>
            <Head title={profile.viewing_self ? 'Os meus dados' : profile.name} />

            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="profile"
                hasFamily={has_family}
            >
                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#1d5db6_0%,#184b91_100%)] px-4 py-4 text-white shadow-[0_16px_34px_rgba(24,75,145,0.22)] sm:px-5">
                            <div className="relative">
                                <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-24 w-24 rounded-full bg-white/10" />
                                <div className="relative flex flex-col gap-4">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
                                            {currentPhotoUrl ? (
                                                <img src={currentPhotoUrl || undefined} alt={profile.name} className="h-16 w-16 rounded-2xl border border-white/20 object-cover sm:h-18 sm:w-18" />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 text-lg font-bold text-[#184b91] sm:h-18 sm:w-18">
                                                    {getInitials(profile.name)}
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Portal pessoal</p>
                                                <h1 className="mt-2 truncate text-xl font-semibold leading-tight sm:text-2xl">{profile.name}</h1>
                                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-blue-100">
                                                    <span>{profile.member_number ? `Socio #${profile.member_number}` : 'Sem numero de socio'}</span>
                                                    <span>{profile.type}</span>
                                                    <span>{profile.state}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {!profile.viewing_self ? (
                                            <button
                                                type="button"
                                                onClick={() => navigate(route('portal.profile'))}
                                                className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                                            >
                                                Voltar ao meu perfil
                                            </button>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {profile.summary_badges.map((badge) => (
                                            <span key={`${badge.label}-${badge.tone}`} className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(badge.tone)}`}>
                                                {badge.label}
                                            </span>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => photoInputRef.current?.click()}
                                            disabled={!profile.can_edit || form.processing}
                                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Camera className="h-3.5 w-3.5" />
                                            Nova foto
                                        </button>

                                        <input
                                            ref={photoInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={!profile.can_edit || form.processing}
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                form.setData('photo', file);
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={!profile.can_edit || form.processing}
                                                    className="rounded-2xl bg-white px-3.5 py-2 text-xs font-semibold text-[#184b91] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {form.processing ? 'A guardar...' : 'Guardar alteracoes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    disabled={form.processing}
                                                    className="rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleStartEdit}
                                                disabled={!profile.can_edit}
                                                className="rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {profile.can_edit ? 'Editar campos' : 'Edicao indisponivel'}
                                            </button>
                                        )}
                                    </div>

                                    {!profile.can_edit ? (
                                        <p className="text-xs text-blue-100">As opcoes de edicao estao visiveis mas desativadas porque este perfil nao tem permissao de edicao.</p>
                                    ) : null}

                                    <FieldError message={personalErrors.photo} />

                                    {allowed_profiles.length > 1 ? (
                                        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">Perfis permitidos</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {allowed_profiles.map((allowedProfile) => {
                                                    const isActive = allowedProfile.id === profile.id;

                                                    return (
                                                        <button
                                                            key={allowedProfile.id}
                                                            type="button"
                                                            onClick={() => navigate(allowedProfile.portal_href)}
                                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                                                isActive
                                                                    ? 'bg-white text-[#184b91]'
                                                                    : 'border border-white/15 bg-white/10 text-white hover:bg-white/20'
                                                            }`}
                                                        >
                                                            {allowedProfile.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        <PortalSection title="Dados pessoais" description="Informacao essencial da tua ficha pessoal.">
                            {isEditing ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Nome completo</p>
                                        <input value={form.data.nome_completo || ''} onChange={(event) => form.setData('nome_completo', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.nome_completo))} />
                                        <FieldError message={personalErrors.nome_completo} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Data de nascimento</p>
                                        <input type="date" value={form.data.data_nascimento || ''} onChange={(event) => form.setData('data_nascimento', event.target.value || null)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.data_nascimento))} />
                                        <FieldError message={personalErrors.data_nascimento} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Sexo</p>
                                        <select value={form.data.sexo || ''} onChange={(event) => form.setData('sexo', (event.target.value || null) as EditableProfileFields['sexo'])} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.sexo))}>
                                            <option value="">Selecionar</option>
                                            <option value="masculino">Masculino</option>
                                            <option value="feminino">Feminino</option>
                                        </select>
                                        <FieldError message={personalErrors.sexo} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Contacto</p>
                                        <input value={form.data.contacto || ''} onChange={(event) => form.setData('contacto', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.contacto))} />
                                        <FieldError message={personalErrors.contacto} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Email secundario</p>
                                        <input type="email" value={form.data.email_secundario || ''} onChange={(event) => form.setData('email_secundario', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.email_secundario))} />
                                        <FieldError message={personalErrors.email_secundario} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">NIF</p>
                                        <input value={form.data.nif || ''} onChange={(event) => form.setData('nif', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.nif))} />
                                        <FieldError message={personalErrors.nif} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">CC</p>
                                        <input value={form.data.cc || ''} onChange={(event) => form.setData('cc', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.cc))} />
                                        <FieldError message={personalErrors.cc} />
                                    </div>

                                    <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Morada</p>
                                        <textarea value={form.data.morada || ''} onChange={(event) => form.setData('morada', event.target.value)} disabled={!profile.can_edit || form.processing} className={`${inputClass(Boolean(personalErrors.morada))} min-h-[96px] resize-y`} />
                                        <FieldError message={personalErrors.morada} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Codigo postal</p>
                                        <input value={form.data.codigo_postal || ''} onChange={(event) => form.setData('codigo_postal', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.codigo_postal))} />
                                        <FieldError message={personalErrors.codigo_postal} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Localidade</p>
                                        <input value={form.data.localidade || ''} onChange={(event) => form.setData('localidade', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.localidade))} />
                                        <FieldError message={personalErrors.localidade} />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Nacionalidade</p>
                                        <input value={form.data.nacionalidade || ''} onChange={(event) => form.setData('nacionalidade', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.nacionalidade))} />
                                        <FieldError message={personalErrors.nacionalidade} />
                                    </div>
                                </div>
                            ) : (
                                <InfoGrid items={profile.personal} />
                            )}
                        </PortalSection>

                        <PortalSection title="Encarregado de educacao / Educandos" description="Relacoes pessoais disponiveis neste portal.">
                            <div className="space-y-4">
                                {profile.flags.show_guardians ? (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Encarregado(s)</p>
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            {profile.guardians.length > 0 ? (
                                                profile.guardians.map((guardian) => <RelatedCard key={guardian.id} member={guardian} onOpen={navigate} />)
                                            ) : (
                                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                                    Nenhum encarregado associado.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                {viewer_dependents.length > 0 ? (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Educandos</p>
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            {viewer_dependents.map((dependent) => <RelatedCard key={dependent.id} member={dependent} onOpen={navigate} />)}
                                        </div>
                                    </div>
                                ) : null}

                                {!profile.flags.show_guardians && viewer_dependents.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                        Sem relacoes associadas a mostrar.
                                    </div>
                                ) : null}
                            </div>
                        </PortalSection>

                        <PortalSection title="Acoes rapidas" description="Atalhos para as tarefas mais frequentes.">
                            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                                {quickActions.map((action) => (
                                    <PortalCard
                                        key={action.key}
                                        title={action.title}
                                        description={action.description}
                                        icon={action.icon}
                                        accentClass={action.accentClass}
                                        onClick={() => navigate(action.href)}
                                    />
                                ))}
                            </div>
                        </PortalSection>
                    </div>

                    <div className="space-y-5">
                        <section id="status" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1">
                            <PortalKpiCard label="Estado" value={profile.state} helper={profile.type} icon={ShieldCheck} />
                            <PortalKpiCard label="Conta corrente" value={profile.financial.current_balance} helper="saldo atual" icon={Wallet} />
                        </section>

                        <PortalSection title="Estado e permissoes" description="Resumo simplificado do estado do membro.">
                            <InfoGrid items={profile.status} />
                        </PortalSection>

                        <PortalSection title="Documentos e validacoes" description="Situacao documental atual.">
                            <div id="documents" className="space-y-3">
                                {profile.documents.map((document) => (
                                    <div key={document.label} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{document.label}</p>
                                                <p className="mt-1 text-xs text-slate-500">{document.helper}</p>
                                            </div>
                                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${documentClasses(document.status)}`}>
                                                {document.state_label}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                            <FileText className="h-3.5 w-3.5" />
                                            <span>{document.meta}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PortalSection>

                        <PortalSection title="Dados desportivos resumidos" description="Informacao desportiva essencial deste perfil.">
                            <div id="sports" className="space-y-3">
                                {isEditing ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">N.º federacao</p>
                                            <input value={form.data.num_federacao || ''} onChange={(event) => form.setData('num_federacao', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.num_federacao))} />
                                            <FieldError message={personalErrors.num_federacao} />
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Numero PMB</p>
                                            <input value={form.data.numero_pmb || ''} onChange={(event) => form.setData('numero_pmb', event.target.value)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.numero_pmb))} />
                                            <FieldError message={personalErrors.numero_pmb} />
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Data de inscricao</p>
                                            <input type="date" value={form.data.data_inscricao || ''} onChange={(event) => form.setData('data_inscricao', event.target.value || null)} disabled={!profile.can_edit || form.processing} className={inputClass(Boolean(personalErrors.data_inscricao))} />
                                            <FieldError message={personalErrors.data_inscricao} />
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Escalao</p>
                                            <p className="mt-2 text-sm font-medium text-slate-900">{profile.sports.find((item) => item.label === 'Escalão')?.value || 'Sem informacao'}</p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 sm:col-span-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Estado desportivo</p>
                                            <p className="mt-2 text-sm font-medium text-slate-900">{profile.sports.find((item) => item.label === 'Estado desportivo')?.value || 'Sem informacao'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <InfoGrid items={profile.sports} />
                                )}
                            </div>
                        </PortalSection>

                        <PortalSection title="Resumo financeiro" description="Visao compacta da situacao financeira atual.">
                            <div id="finance" className="space-y-3">
                                <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Conta corrente</p>
                                            <p className="mt-2 text-xl font-semibold text-slate-900">{profile.financial.current_balance}</p>
                                        </div>
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Proximo pagamento</p>
                                        {profile.financial.next_payment ? (
                                            <>
                                                <p className="mt-2 text-sm font-semibold text-slate-900">{profile.financial.next_payment.label}</p>
                                                <p className="mt-1 text-xs text-slate-500">{profile.financial.next_payment.due_date || 'Sem data'} · {profile.financial.next_payment.amount}</p>
                                                <p className="mt-2 text-xs font-semibold text-slate-600">{profile.financial.next_payment.state}</p>
                                            </>
                                        ) : (
                                            <p className="mt-2 text-sm text-slate-500">Sem pagamentos pendentes.</p>
                                        )}
                                    </div>

                                    <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Mensalidade / plano</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900">{profile.financial.plan}</p>
                                    </div>
                                </div>
                            </div>
                        </PortalSection>
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}