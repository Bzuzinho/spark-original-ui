import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Download,
    Eye,
    FileText,
    FileUp,
    FolderOpen,
    Info,
    ShieldCheck,
    Upload,
} from 'lucide-react';
import PortalKpiCard from '@/Components/Portal/PortalKpiCard';
import PortalSection from '@/Components/Portal/PortalSection';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PageProps as SharedPageProps } from '@/types';

type DocumentStatusKey = 'valid' | 'pending' | 'expiring' | 'expired' | 'in_review';
type DocumentTone = 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface DocumentStatus {
    key: DocumentStatusKey;
    label: string;
    tone: DocumentTone;
}

interface DocumentActions {
    view_url: string | null;
    download_url: string | null;
    upload_type: string;
    can_upload: boolean;
    primary_upload_label: string;
}

interface DocumentCard {
    id: string;
    type: string;
    name: string;
    group: 'essential' | 'other';
    description: string;
    status: DocumentStatus;
    signed_at: string | null;
    valid_until: string | null;
    highlight: string;
    priority: 'high' | 'normal';
    actions: DocumentActions;
}

interface DocumentsHero {
    title: string;
    headline: string;
    subheadline: string;
    tone: DocumentTone;
    primary_upload_type: string;
}

interface DocumentsAlerts {
    items: Array<{
        id: string;
        name: string;
        status: string;
        message: string;
        valid_until: string | null;
        is_medical: boolean;
    }>;
    empty_message: string | null;
}

interface DocumentsUploadConfig {
    enabled: boolean;
    route: string | null;
    accept: string;
    max_size_mb: number;
}

interface DocumentsOverview {
    hero: DocumentsHero;
    kpis: {
        valid: number;
        expiring: number;
        pending: number;
        season: string;
    };
    documents: DocumentCard[];
    alerts: DocumentsAlerts;
    history: Array<{
        id: string;
        name: string;
        date: string | null;
        status: string;
    }>;
    notes: {
        family: string;
        settings: string;
    };
    upload: DocumentsUploadConfig;
}

interface PortalDocumentsProps {
    is_also_admin: boolean;
    has_family: boolean;
    documents_overview: DocumentsOverview;
}

type PageProps = SharedPageProps<PortalDocumentsProps>;

const heroToneClasses: Record<DocumentTone, string> = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    info: 'bg-sky-50 text-sky-700',
    muted: 'bg-slate-100 text-slate-700',
};

const statusToneClasses: Record<DocumentTone, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    muted: 'border-slate-200 bg-slate-100 text-slate-600',
};

function emptyValue(value: string | null | undefined, fallback: string): string {
    return value && value.trim() !== '' ? value : fallback;
}

function openDocument(url: string | null, target: '_self' | '_blank' = '_blank') {
    if (!url) {
        return;
    }

    window.open(url, target, target === '_blank' ? 'noopener,noreferrer' : undefined);
}

function DownloadButton({ url }: { url: string | null }) {
    return (
        <button
            type="button"
            onClick={() => openDocument(url, '_self')}
            disabled={!url}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <Download className="h-3.5 w-3.5" />
            Descarregar
        </button>
    );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Info; message: string }) {
    return (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            <Icon className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-2">{message}</p>
        </div>
    );
}

export default function Documents() {
    const { auth, clubSettings, is_also_admin, has_family, documents_overview } = usePage<PageProps>().props;
    const [selectedUploadType, setSelectedUploadType] = useState<string>(documents_overview.hero.primary_upload_type || 'outro');
    const uploadForm = useForm<{
        type: string;
        name: string;
        expiry_date: string;
        file: File | null;
    }>({
        type: documents_overview.hero.primary_upload_type || 'outro',
        name: '',
        expiry_date: '',
        file: null,
    });

    const essentialDocuments = useMemo(
        () => documents_overview.documents.filter((document) => document.group === 'essential'),
        [documents_overview.documents],
    );
    const additionalDocuments = useMemo(
        () => documents_overview.documents.filter((document) => document.group === 'other'),
        [documents_overview.documents],
    );

    const submitUpload = () => {
        if (!documents_overview.upload.enabled || !documents_overview.upload.route) {
            return;
        }

        uploadForm.setData('type', selectedUploadType);
        uploadForm.post(documents_overview.upload.route, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset();
                uploadForm.setData({
                    type: selectedUploadType,
                    name: '',
                    expiry_date: '',
                    file: null,
                });
            },
        });
    };

    return (
        <>
            <Head title="Documentos" />
            <PortalLayout
                user={auth.user}
                clubSettings={clubSettings}
                isAlsoAdmin={is_also_admin}
                activeNav="documents"
                hasFamily={has_family}
            >
                <section className="overflow-hidden rounded-[24px] border border-blue-900/10 bg-[linear-gradient(180deg,rgba(15,87,179,0.96)_0%,rgba(17,76,152,0.94)_100%)] px-4 py-5 text-white shadow-[0_16px_32px_rgba(15,76,152,0.18)] sm:px-5 lg:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Portal</p>
                            <h2 className="mt-2 text-2xl font-semibold">{documents_overview.hero.title}</h2>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${heroToneClasses[documents_overview.hero.tone]}`}>
                                    {documents_overview.hero.headline}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-blue-50">{documents_overview.hero.subheadline}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    <Upload className="h-4 w-4" />
                                    Carregar documento
                                </button>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('documentos-essenciais')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    <FolderOpen className="h-4 w-4" />
                                    Ver documentos
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur sm:min-w-[320px]">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">Destaque</p>
                                <p className="mt-2 text-base font-semibold text-white">{documents_overview.hero.headline}</p>
                                <p className="mt-1 text-sm text-blue-50">{documents_overview.hero.subheadline}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PortalKpiCard label="Documentos válidos" value={String(documents_overview.kpis.valid)} helper="em conformidade" icon={ShieldCheck} />
                    <PortalKpiCard label="A caducar" value={String(documents_overview.kpis.expiring)} helper="requer atenção" icon={CalendarClock} />
                    <PortalKpiCard label="Pendentes" value={String(documents_overview.kpis.pending)} helper="em falta ou validação" icon={AlertTriangle} />
                    <PortalKpiCard label="Época atual" value={documents_overview.kpis.season} helper="referência ativa" icon={CheckCircle2} />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] xl:items-start">
                    <div className="space-y-4">
                        <PortalSection id="documentos-essenciais" title="Documentos essenciais" description="Só vê os seus próprios documentos. Documentos de educandos continuam na área Família.">
                            {essentialDocuments.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {essentialDocuments.map((document) => (
                                        <article
                                            key={document.id}
                                            className={`rounded-[24px] border p-4 shadow-sm ${document.priority === 'high' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50/70'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-900">{document.name}</h3>
                                                    <p className="mt-1 text-sm text-slate-500">{document.description}</p>
                                                </div>
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusToneClasses[document.status.tone]}`}>
                                                    {document.status.label}
                                                </span>
                                            </div>

                                            <p className="mt-4 rounded-2xl bg-white px-3 py-2 text-sm text-slate-600">{document.highlight}</p>

                                            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Assinatura / upload</p>
                                                    <p className="mt-1 font-medium text-slate-800">{emptyValue(document.signed_at, 'Sem registo')}</p>
                                                </div>
                                                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Validade</p>
                                                    <p className="mt-1 font-medium text-slate-800">{emptyValue(document.valid_until, 'Sem validade')}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openDocument(document.actions.view_url)}
                                                    disabled={!document.actions.view_url}
                                                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Ver documento
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedUploadType(document.actions.upload_type);
                                                        uploadForm.setData('type', document.actions.upload_type);
                                                        document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }}
                                                    disabled={!document.actions.can_upload}
                                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                                >
                                                    <FileUp className="h-3.5 w-3.5" />
                                                    {document.actions.primary_upload_label}
                                                </button>
                                                <DownloadButton url={document.actions.download_url} />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={FileText} message="Ainda não existem documentos carregados." />
                            )}
                        </PortalSection>

                        <PortalSection title="Outros documentos configurados" description={documents_overview.notes.settings}>
                            {additionalDocuments.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {additionalDocuments.map((document) => (
                                        <article key={document.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-900">{document.name}</h3>
                                                    <p className="mt-1 text-sm text-slate-500">{document.description}</p>
                                                </div>
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusToneClasses[document.status.tone]}`}>
                                                    {document.status.label}
                                                </span>
                                            </div>
                                            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Upload</p>
                                                    <p className="mt-1 font-medium text-slate-800">{emptyValue(document.signed_at, 'Sem registo')}</p>
                                                </div>
                                                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Validade</p>
                                                    <p className="mt-1 font-medium text-slate-800">{emptyValue(document.valid_until, 'Sem validade')}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openDocument(document.actions.view_url)}
                                                    disabled={!document.actions.view_url}
                                                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Ver documento
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedUploadType(document.actions.upload_type);
                                                        uploadForm.setData('type', document.actions.upload_type);
                                                        document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }}
                                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                    <FileUp className="h-3.5 w-3.5" />
                                                    Substituir
                                                </button>
                                                <DownloadButton url={document.actions.download_url} />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={FolderOpen} message="Ainda não existem documentos carregados." />
                            )}
                        </PortalSection>
                    </div>

                    <div className="space-y-4">
                        <PortalSection id="upload-card" title="Carregar documento" description={documents_overview.upload.enabled ? 'Upload validado no backend por utilizador, tipo de ficheiro e tamanho.' : 'TODO: ativar upload apenas quando existir endpoint seguro.'}>
                            {documents_overview.upload.enabled && documents_overview.upload.route ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tipo de documento</label>
                                        <select
                                            value={selectedUploadType}
                                            onChange={(event) => {
                                                setSelectedUploadType(event.target.value);
                                                uploadForm.setData('type', event.target.value);
                                            }}
                                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
                                        >
                                            {essentialDocuments.map((document) => (
                                                <option key={document.type} value={document.type}>{document.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Nome opcional</label>
                                        <input
                                            value={uploadForm.data.name}
                                            onChange={(event) => uploadForm.setData('name', event.target.value)}
                                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
                                            placeholder="Ex.: Atestado 2026"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Validade (se aplicável)</label>
                                        <input
                                            type="date"
                                            value={uploadForm.data.expiry_date}
                                            onChange={(event) => uploadForm.setData('expiry_date', event.target.value)}
                                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Ficheiro</label>
                                        <input
                                            type="file"
                                            accept={documents_overview.upload.accept}
                                            onChange={(event) => uploadForm.setData('file', event.target.files?.[0] ?? null)}
                                            className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">Tipos permitidos: {documents_overview.upload.accept}. Máximo {documents_overview.upload.max_size_mb} MB.</p>
                                    </div>

                                    {Object.keys(uploadForm.errors).length > 0 ? (
                                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                            {Object.values(uploadForm.errors).map((error) => (
                                                <p key={error}>{error}</p>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={submitUpload}
                                            disabled={uploadForm.processing || !uploadForm.data.file}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {uploadForm.processing ? 'A carregar...' : 'Carregar documento'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => uploadForm.reset()}
                                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                    TODO: ligar o botão a um endpoint seguro antes de permitir upload real.
                                </div>
                            )}
                        </PortalSection>

                        <PortalSection title="Alertas" description="Prioridade a documentos expirados e ao atestado médico.">
                            {documents_overview.alerts.items.length > 0 ? (
                                <div className="space-y-3">
                                    {documents_overview.alerts.items.map((alert) => (
                                        <article key={alert.id} className={`rounded-[22px] border p-4 ${alert.is_medical ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50/70'}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`rounded-2xl p-2 ${alert.is_medical ? 'bg-white text-amber-600' : 'bg-white text-slate-500'}`}>
                                                    <AlertTriangle className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-900">{alert.name}</p>
                                                    <p className="mt-1 text-xs font-medium text-slate-500">{alert.status}</p>
                                                    <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
                                                    <p className="mt-2 text-xs text-slate-500">{emptyValue(alert.valid_until, 'Sem validade registada')}</p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={CheckCircle2} message={documents_overview.alerts.empty_message || 'Todos os documentos estão válidos.'} />
                            )}
                        </PortalSection>

                        <PortalSection title="Histórico" description="Últimos uploads e estados mais recentes.">
                            {documents_overview.history.length > 0 ? (
                                <div className="space-y-2.5">
                                    {documents_overview.history.map((entry) => (
                                        <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{emptyValue(entry.date, 'Sem data')}</p>
                                                </div>
                                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                    {entry.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={Clock3} message="Ainda não existem documentos carregados." />
                            )}
                        </PortalSection>

                        <PortalSection title="Notas" description="Âmbito funcional desta área do Portal.">
                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                    {documents_overview.notes.family}
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                    {documents_overview.notes.settings}
                                </div>
                                {documents_overview.kpis.pending === 0 ? (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                                        Não existem documentos pendentes.
                                    </div>
                                ) : null}
                            </div>
                        </PortalSection>
                    </div>
                </section>
            </PortalLayout>
        </>
    );
}