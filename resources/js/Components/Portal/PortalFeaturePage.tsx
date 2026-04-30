import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import PortalCard from '@/Components/Portal/PortalCard';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PortalNavKey } from '@/lib/portalRoutes';
import type { ClubSettingsProps, User } from '@/types';

interface PortalFeatureAction {
    key: string;
    title: string;
    description: string;
    icon: LucideIcon;
    accentClass: string;
    href: string;
}

interface PortalFeaturePageProps {
    title: string;
    eyebrow: string;
    description: string;
    activeNav: PortalNavKey;
    user: User;
    clubSettings?: ClubSettingsProps;
    isAlsoAdmin: boolean;
    hasFamily: boolean;
    actions?: PortalFeatureAction[];
    children?: ReactNode;
}

export default function PortalFeaturePage({
    title,
    eyebrow,
    description,
    activeNav,
    user,
    clubSettings,
    isAlsoAdmin,
    hasFamily,
    actions = [],
    children,
}: PortalFeaturePageProps) {
    return (
        <PortalLayout
            user={user}
            clubSettings={clubSettings}
            isAlsoAdmin={isAlsoAdmin}
            activeNav={activeNav}
            hasFamily={hasFamily}
        >
            <section className="overflow-hidden rounded-[20px] border border-blue-900/10 bg-[linear-gradient(180deg,rgba(15,87,179,0.96)_0%,rgba(17,76,152,0.94)_100%)] px-3.5 py-4 text-white shadow-[0_14px_28px_rgba(15,76,152,0.16)] sm:px-4 lg:px-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">{eyebrow}</p>
                <h2 className="mt-1.5 text-xl font-semibold">{title}</h2>
            </section>

            {actions.length > 0 ? (
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {actions.map((action) => (
                        <PortalCard
                            key={action.key}
                            title={action.title}
                            description={action.description}
                            icon={action.icon}
                            accentClass={action.accentClass}
                            onClick={() => router.visit(action.href)}
                        />
                    ))}
                </section>
            ) : null}

            {children ? (
                children
            ) : (
                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <p className="text-sm text-slate-600">
                        Esta área está pronta para conteúdo específico.
                    </p>
                </section>
            )}
        </PortalLayout>
    );
}