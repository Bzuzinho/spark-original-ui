import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Athlete {
    name: string;
    escalao: string | null;
    numero_socio: string | null;
    foto_perfil: string | null;
    estado: string | null;
    conta_corrente: string | number | null;
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
}

interface Props {
    athlete: Athlete;
    proximos_eventos: ProximoEvento[];
    ultimos_resultados: UltimoResultado[];
    treinos_mes: number;
    mensalidades: Mensalidade[];
    modulos_visiveis: string[];
    is_also_admin: boolean;
}

type Tab = 'inicio' | 'eventos' | 'resultados' | 'financeiro';

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(value: string | number | null): string {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    return num.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

function estadoBadge(estado: string | null): { label: string; className: string } {
    switch ((estado ?? '').toLowerCase()) {
        case 'pago':
            return { label: 'Pago', className: 'bg-emerald-100 text-emerald-700' };
        case 'pendente':
            return { label: 'Pendente', className: 'bg-amber-100 text-amber-700' };
        case 'em_atraso':
        case 'atraso':
            return { label: 'Em atraso', className: 'bg-rose-100 text-rose-700' };
        default:
            return { label: estado ?? '—', className: 'bg-gray-100 text-gray-600' };
    }
}

function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] ?? '?').toUpperCase();
}

export default function Atleta({
    athlete,
    proximos_eventos = [],
    ultimos_resultados = [],
    treinos_mes = 0,
    mensalidades = [],
    modulos_visiveis = [],
    is_also_admin = false,
}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('inicio');

    const handleLogout = () => {
        router.post('/logout');
    };

    const contaCorrente = (() => {
        if (athlete.conta_corrente === null || athlete.conta_corrente === undefined) return null;
        const num = typeof athlete.conta_corrente === 'string'
            ? parseFloat(athlete.conta_corrente)
            : athlete.conta_corrente;
        return isNaN(num) ? null : num;
    })();

    const tabs: { id: Tab; label: string; emoji: string }[] = [
        { id: 'inicio', label: 'Início', emoji: '🏠' },
        { id: 'eventos', label: 'Eventos', emoji: '📅' },
        { id: 'resultados', label: 'Resultados', emoji: '🏆' },
        { id: 'financeiro', label: 'Finanças', emoji: '💳' },
    ];

    return (
        <>
            <Head title="O Meu Painel" />

            {/* Full-screen shell — no AuthenticatedLayout */}
            <div
                className="min-h-screen w-full"
                style={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 50%, #fdf4ff 100%)',
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {/* Centered container: full width on mobile, max-width 480px on tablet/desktop */}
                <div className="mx-auto min-h-screen flex flex-col" style={{ maxWidth: 480 }}>

                    {/* ── Hero / Profile Section ─────────────────────────── */}
                    <div
                        className="relative px-5 pt-12 pb-6 text-white"
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a21caf 100%)',
                            borderRadius: '0 0 32px 32px',
                        }}
                    >
                        {/* Top actions row */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mb-1">
                                    Bem-vindo
                                </p>
                                <h1 className="text-xl font-bold leading-tight">
                                    {athlete.name}
                                </h1>
                                {athlete.escalao && (
                                    <span className="mt-1 inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        {athlete.escalao}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                {/* Avatar */}
                                {athlete.foto_perfil ? (
                                    <img
                                        src={athlete.foto_perfil}
                                        alt={athlete.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white/40"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-lg font-bold">
                                        {getInitials(athlete.name)}
                                    </div>
                                )}
                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="text-indigo-200 hover:text-white text-xs font-medium transition-colors"
                                >
                                    Sair
                                </button>
                            </div>
                        </div>

                        {/* Quick stats row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                                <p className="text-2xl font-extrabold">{treinos_mes}</p>
                                <p className="text-indigo-200 text-xs mt-0.5 leading-tight">treinos<br />este mês</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                                <p className="text-2xl font-extrabold">{proximos_eventos.length}</p>
                                <p className="text-indigo-200 text-xs mt-0.5 leading-tight">próximos<br />eventos</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                                <p
                                    className={`text-2xl font-extrabold ${
                                        contaCorrente !== null && contaCorrente < 0
                                            ? 'text-rose-300'
                                            : 'text-emerald-300'
                                    }`}
                                >
                                    {contaCorrente !== null
                                        ? `${contaCorrente >= 0 ? '+' : ''}${contaCorrente.toFixed(0)}€`
                                        : '—'
                                    }
                                </p>
                                <p className="text-indigo-200 text-xs mt-0.5 leading-tight">conta<br />corrente</p>
                            </div>
                        </div>

                        {/* Admin button — only for dual-profile users */}
                        {is_also_admin && (
                            <div className="mt-4">
                                <button
                                    onClick={() => router.visit('/dashboard?mode=admin')}
                                    className="w-full bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-semibold py-2 rounded-xl border border-white/20"
                                >
                                    ⚙️ Administração
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Tab Navigation ────────────────────────────────── */}
                    <div className="px-5 pt-5 pb-2">
                        <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 shadow-sm">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <span className="text-base leading-none mb-0.5">{tab.emoji}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Tab Content ───────────────────────────────────── */}
                    <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto pb-24">

                        {/* ── INÍCIO ── */}
                        {activeTab === 'inicio' && (
                            <>
                                {/* Member info card */}
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                                    <h2 className="text-sm font-bold text-gray-700 mb-3">Informação do Sócio</h2>
                                    <div className="space-y-2">
                                        {athlete.numero_socio && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Nº Sócio</span>
                                                <span className="font-semibold text-gray-800">{athlete.numero_socio}</span>
                                            </div>
                                        )}
                                        {athlete.estado && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Estado</span>
                                                <span
                                                    className={`font-semibold capitalize ${
                                                        athlete.estado === 'ativo'
                                                            ? 'text-emerald-600'
                                                            : 'text-rose-600'
                                                    }`}
                                                >
                                                    {athlete.estado}
                                                </span>
                                            </div>
                                        )}
                                        {contaCorrente !== null && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Conta corrente</span>
                                                <span
                                                    className={`font-semibold ${
                                                        contaCorrente >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}
                                                >
                                                    {formatCurrency(contaCorrente)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Next event preview */}
                                {proximos_eventos.length > 0 && (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-sm font-bold text-gray-700">Próximo Evento</h2>
                                            <button
                                                onClick={() => setActiveTab('eventos')}
                                                className="text-xs text-indigo-600 font-semibold"
                                            >
                                                Ver todos →
                                            </button>
                                        </div>
                                        {(() => {
                                            const ev = proximos_eventos[0];
                                            return (
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-lg">
                                                        📅
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{ev.titulo}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(ev.data_inicio)}</p>
                                                        {ev.local && <p className="text-xs text-gray-400 truncate">{ev.local}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Last result preview */}
                                {ultimos_resultados.length > 0 && (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-sm font-bold text-gray-700">Último Resultado</h2>
                                            <button
                                                onClick={() => setActiveTab('resultados')}
                                                className="text-xs text-indigo-600 font-semibold"
                                            >
                                                Ver todos →
                                            </button>
                                        </div>
                                        {(() => {
                                            const r = ultimos_resultados[0];
                                            return (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg">
                                                        🏆
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                                                            {r.estilo} {r.distancia_m ? `${r.distancia_m}m` : ''}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{r.competicao ?? '—'}</p>
                                                    </div>
                                                    {r.tempo_formatado && (
                                                        <span className="text-sm font-bold text-indigo-700 flex-shrink-0">
                                                            {r.tempo_formatado}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── EVENTOS ── */}
                        {activeTab === 'eventos' && (
                            <div className="space-y-3">
                                {proximos_eventos.length === 0 ? (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-sm">
                                        <p className="text-4xl mb-3">📅</p>
                                        <p className="text-gray-500 text-sm">Sem eventos próximos</p>
                                    </div>
                                ) : (
                                    proximos_eventos.map((ev) => (
                                        <div key={ev.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-lg">
                                                    📅
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-800 text-sm leading-tight">{ev.titulo}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(ev.data_inicio)}</p>
                                                    {ev.hora_inicio && (
                                                        <p className="text-xs text-gray-400">⏰ {ev.hora_inicio}</p>
                                                    )}
                                                    {ev.local && (
                                                        <p className="text-xs text-gray-400 truncate">📍 {ev.local}</p>
                                                    )}
                                                </div>
                                                {ev.estado && (
                                                    <span className="flex-shrink-0 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium capitalize">
                                                        {ev.estado}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── RESULTADOS ── */}
                        {activeTab === 'resultados' && (
                            <div className="space-y-3">
                                {ultimos_resultados.length === 0 ? (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-sm">
                                        <p className="text-4xl mb-3">🏊</p>
                                        <p className="text-gray-500 text-sm">Sem resultados registados</p>
                                    </div>
                                ) : (
                                    ultimos_resultados.map((r) => (
                                        <div key={r.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg">
                                                    🏆
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-800 text-sm leading-tight">
                                                        {[r.estilo, r.distancia_m ? `${r.distancia_m}m` : null]
                                                            .filter(Boolean)
                                                            .join(' ') || '—'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{r.competicao ?? '—'}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(r.data)}</p>
                                                </div>
                                                <div className="flex-shrink-0 text-right">
                                                    {r.desclassificado ? (
                                                        <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">DSQ</span>
                                                    ) : (
                                                        <>
                                                            {r.tempo_formatado && (
                                                                <p className="text-sm font-bold text-indigo-700">{r.tempo_formatado}</p>
                                                            )}
                                                            {r.posicao !== null && (
                                                                <p className="text-xs text-gray-400">{r.posicao}º lugar</p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── FINANCEIRO ── */}
                        {activeTab === 'financeiro' && (
                            <div className="space-y-3">
                                {/* Balance card */}
                                <div
                                    className="rounded-2xl p-5 text-white shadow-sm"
                                    style={{
                                        background: contaCorrente !== null && contaCorrente < 0
                                            ? 'linear-gradient(135deg, #dc2626, #9f1239)'
                                            : 'linear-gradient(135deg, #059669, #065f46)',
                                    }}
                                >
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Saldo Conta Corrente</p>
                                    <p className="text-3xl font-extrabold">
                                        {contaCorrente !== null ? formatCurrency(contaCorrente) : '—'}
                                    </p>
                                </div>

                                {/* Invoices list */}
                                {mensalidades.length === 0 ? (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-sm">
                                        <p className="text-4xl mb-3">💳</p>
                                        <p className="text-gray-500 text-sm">Sem mensalidades registadas</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-sm font-bold text-gray-700 px-1">Mensalidades recentes</h2>
                                        {mensalidades.map((inv) => {
                                            const badge = estadoBadge(inv.estado);
                                            return (
                                                <div key={inv.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-800 text-sm">
                                                                {inv.mes ?? '—'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatCurrency(inv.valor)}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.className}`}>
                                                            {badge.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Bottom Navigation ────────────────────────────── */}
                    <div
                        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white/90 backdrop-blur-md border-t border-white/50 shadow-lg"
                        style={{ maxWidth: 480 }}
                    >
                        <div className="flex">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors ${
                                        activeTab === tab.id
                                            ? 'text-indigo-600'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <span className="text-lg leading-none mb-0.5">{tab.emoji}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
