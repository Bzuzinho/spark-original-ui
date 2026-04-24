import { Head, router, usePage } from '@inertiajs/react';
import { Bell, CreditCard, FileText, IdCard, Megaphone, ShoppingBag, Trophy, Users } from 'lucide-react';
import PortalCard from '@/Components/Portal/PortalCard';
import PortalLayout from '@/Layouts/PortalLayout';
import { portalRoutes } from '@/lib/portalRoutes';
import type { ClubSettingsProps, PageProps as SharedPageProps } from '@/types';

interface AlertItem {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    link?: string | null;
    is_read: boolean;
    created_at: string;
}

interface BasePortalProps {
    user: {
        id: string | number;
        name: string;
        email?: string | null;
    };
    perfil_tipos: string[];
    is_also_admin: boolean;
    has_family?: boolean;
    clubSettings?: ClubSettingsProps;
    communicationAlerts?: {
        unreadCount: number;
        recent: AlertItem[];
    };
}

type PageProps = SharedPageProps<BasePortalProps>;

export default function Base() {
    const { props } = usePage<PageProps>();
    const { auth, clubSettings, is_also_admin, has_family = false, perfil_tipos = [] } = props;

    const cards = [
        {
            key: 'profile',
            title: 'Os meus dados',
            description: 'Consultar e atualizar a minha ficha.',
            icon: IdCard,
            accentClass: 'bg-blue-50 text-blue-600',
            href: portalRoutes.profile,
        },
        {
            key: 'events',
            title: 'Convocatórias / Eventos',
            description: 'Agenda e compromissos do clube.',
            icon: Megaphone,
            accentClass: 'bg-orange-50 text-orange-600',
            href: portalRoutes.events,
        },
        {
            key: 'payments',
            title: 'Pagamentos',
            description: 'Ver estado financeiro e mensalidades.',
            icon: CreditCard,
            accentClass: 'bg-emerald-50 text-emerald-600',
            href: portalRoutes.payments,
        },
        {
            key: 'results',
            title: 'Resultados',
            description: 'Consultar evolução e provas recentes.',
            icon: Trophy,
            accentClass: 'bg-violet-50 text-violet-600',
            href: portalRoutes.results,
        },
        {
            key: 'documents',
            title: 'Documentos',
            description: 'Licenças, anexos e comprovativos.',
            icon: FileText,
            accentClass: 'bg-indigo-50 text-indigo-600',
            href: portalRoutes.documents,
        },
        {
            key: 'alerts',
            title: 'Comunicados',
            description: 'Abrir alertas e mensagens do clube.',
            icon: Bell,
            accentClass: 'bg-violet-50 text-violet-600',
            href: portalRoutes.communications,
        },
        {
            key: 'store',
            title: 'Loja / Requisições',
            description: 'Aceder a artigos e requisições.',
            icon: ShoppingBag,
            accentClass: 'bg-amber-50 text-amber-600',
            href: portalRoutes.shop,
        },
        ...(has_family ? [{
            key: 'family',
            title: 'Família',
            description: 'Área familiar agregada.',
            icon: Users,
            accentClass: 'bg-rose-50 text-rose-600',
            href: portalRoutes.family,
        }] : []),
    ];

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
                <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#0f57b3_0%,#114c98_100%)] px-4 py-4 text-white shadow-[0_16px_32px_rgba(15,76,152,0.22)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Portal Base</p>
                    <h2 className="mt-2 text-2xl font-semibold">A Minha Área</h2>
                    <p className="mt-2 max-w-2xl text-sm text-blue-50">
                        Entrada simplificada para utilizadores sem perfil desportivo específico. A partir daqui pode aceder às rotas comuns do Portal mantendo sempre a identidade do clube.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <PortalCard
                            key={card.key}
                            title={card.title}
                            description={card.description}
                            icon={card.icon}
                            accentClass={card.accentClass}
                            onClick={() => router.visit(card.href)}
                        />
                    ))}
                </section>
            </PortalLayout>
        </>
    );
}