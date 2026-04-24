import type { ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import PortalBottomNav from '@/Components/Portal/PortalBottomNav';
import PortalHeader from '@/Components/Portal/PortalHeader';
import { getPortalBottomNavItems, portalNavLabels, portalRoutes, type PortalNavKey } from '@/lib/portalRoutes';
import type { ClubSettingsProps, PageProps, User } from '@/types';

interface PortalLayoutProps {
    children: ReactNode;
    header?: ReactNode;
    bottomNav?: ReactNode;
    user?: User;
    clubSettings?: ClubSettingsProps;
    isAlsoAdmin?: boolean;
    activeNav?: PortalNavKey;
    hasFamily?: boolean;
}

function resolveUserName(user?: User): string {
    return [user?.nome_completo, user?.full_name, user?.name]
        .map((value) => value?.trim())
        .find(Boolean) || 'Utilizador';
}

function resolveUserPhoto(user?: User): string | null {
    return user?.foto_perfil || user?.photo || null;
}

export default function PortalLayout({
    header,
    children,
    bottomNav,
    user,
    clubSettings,
    isAlsoAdmin = false,
    activeNav = 'dashboard',
    hasFamily = false,
}: PortalLayoutProps) {
    const { props } = usePage<PageProps>();
    const clubName = clubSettings?.nome_clube?.trim() || 'ClubOS';
    const clubShortName = clubSettings?.sigla?.trim() || 'BSCN';
    const clubLogoUrl = clubSettings?.logo_url || null;
    const userName = resolveUserName(user);
    const unreadNotifications = props.communicationAlerts?.unreadCount ?? 0;
    const resolvedHeader = header ?? (
        <PortalHeader
            clubName={clubName}
            clubShortName={clubShortName}
            clubLogoUrl={clubLogoUrl}
            unreadNotifications={unreadNotifications}
            canAccessAdmin={isAlsoAdmin}
            currentUserName={userName}
            currentUserSubtitle={portalNavLabels[activeNav]}
            currentUserAvatarUrl={resolveUserPhoto(user)}
            onNotifications={() => router.visit(portalRoutes.communications)}
            onAdmin={() => router.visit(portalRoutes.admin)}
            onLogout={() => router.post('/logout')}
        />
    );
    const resolvedBottomNav = bottomNav ?? (
        <PortalBottomNav
            items={getPortalBottomNavItems(hasFamily)}
            activeKey={hasFamily && activeNav === 'family' ? 'family' : activeNav}
            onNavigate={(href) => router.visit(href)}
        />
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto w-full max-w-screen-2xl px-4 pb-28 pt-4 sm:px-6 lg:px-8 xl:px-10">
                {resolvedHeader}
                <main className="mt-5 space-y-5">{children}</main>
            </div>

            {resolvedBottomNav}
        </div>
    );
}