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
            <section className="overflow-hidden rounded-[24px] border border-blue-900/10 bg-[linear-gradient(180deg,rgba(15,87,179,0.96)_0%,rgba(17,76,152,0.94)_100%)] px-4 py-5 text-white shadow-[0_16px_32px_rgba(15,76,152,0.18)] sm:px-5 lg:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">{eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm text-blue-50">{description}</p>
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
                        Esta área já está ligada ao layout e navegação globais do Portal. Os conteúdos específicos podem agora evoluir sem voltar a perder a identidade do clube.
                    </p>
                </section>
            )}
        </PortalLayout>
    );
}