import { Bell, LogOut, Shield } from 'lucide-react';
import { ClubMark } from '@/Components/ClubMark';

interface PortalHeaderProps {
    clubName: string;
    clubShortName: string;
    clubLogoUrl: string | null;
    unreadNotifications: number;
    canAccessAdmin: boolean;
    currentUserName?: string;
    currentUserSubtitle?: string | null;
    currentUserAvatarUrl?: string | null;
    onNotifications: () => void;
    onAdmin: () => void;
    onLogout?: () => void;
}

function getInitials(name?: string | null): string {
    const parts = (name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return (parts[0]?.slice(0, 2) || 'U').toUpperCase();
}

export default function PortalHeader({
    clubName,
    clubShortName,
    clubLogoUrl,
    unreadNotifications,
    canAccessAdmin,
    currentUserName,
    currentUserSubtitle,
    currentUserAvatarUrl,
    onNotifications,
    onAdmin,
    onLogout,
}: PortalHeaderProps) {
    const resolvedClubName = clubName?.trim() || 'ClubOS';
    const resolvedClubShortName = clubShortName?.trim() || 'BSCN';
    const resolvedClubLogoUrl = clubLogoUrl || null;

    return (
        <header className="rounded-[24px] border border-slate-200/80 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] md:px-4 md:py-3.5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    <ClubMark
                        logoUrl={resolvedClubLogoUrl}
                        clubName={resolvedClubName}
                        clubShortName={resolvedClubShortName}
                        className="h-11 w-11 shrink-0 border border-slate-200 bg-white text-[11px] md:h-12 md:w-12"
                        imageClassName="h-11 w-11 shrink-0 object-contain md:h-12 md:w-12"
                    />

                    <div className="min-w-0">
                        <h1 className="truncate text-[1.2rem] font-bold leading-tight text-slate-900 md:text-[1.35rem]">{resolvedClubShortName}</h1>
                        <p className="truncate text-[11px] text-slate-500 md:text-xs">{resolvedClubName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {currentUserName ? (
                        <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-right sm:flex">
                            {currentUserAvatarUrl ? (
                                <img src={currentUserAvatarUrl} alt={currentUserName} className="h-9 w-9 rounded-full border border-slate-200 object-cover" />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-700">
                                    {getInitials(currentUserName)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold text-slate-800">{currentUserName}</p>
                                <p className="truncate text-[10px] text-slate-500">{currentUserSubtitle || 'Portal pessoal'}</p>
                            </div>
                        </div>
                    ) : null}

                    {canAccessAdmin ? (
                        <button
                            type="button"
                            onClick={onAdmin}
                            className="hidden rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-left text-[10px] font-semibold text-orange-600 shadow-sm transition hover:bg-orange-100 sm:block"
                        >
                            <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" /> Administração</span>
                            <span className="block text-[9px] font-medium text-orange-400">apenas admins</span>
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={onNotifications}
                        className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 md:h-9 md:w-9"
                        aria-label="Abrir notificações"
                    >
                        <Bell className="h-[11px] w-[11px] md:h-[12px] md:w-[12px]" />
                        {unreadNotifications > 0 ? (
                            <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                                {unreadNotifications}
                            </span>
                        ) : null}
                    </button>

                    {onLogout ? (
                        <button
                            type="button"
                            onClick={onLogout}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-rose-200 hover:text-rose-600 md:h-9 md:px-3"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    ) : null}
                </div>
            </div>
        </header>
    );
}