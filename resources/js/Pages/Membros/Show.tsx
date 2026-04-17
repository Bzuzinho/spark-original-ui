import { useState, FormEventHandler } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { moduleTabbedContentClass, moduleTabsClass, moduleViewportClass } from '@/lib/module-layout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { DashboardTab } from '@/Components/Members/Tabs/DashboardTab';
import { PersonalTab } from '@/Components/Members/Tabs/PersonalTab';
import { FinancialTab } from '@/Components/Members/Tabs/FinancialTab';
import { SportsTab } from '@/Components/Members/Tabs/SportsTab';
import { ConfigurationTab } from '@/Components/Members/Tabs/ConfigurationTab';
import CommunicationsTab from './CommunicationsTab';

interface User {
    id: string;
    numero_socio?: string;
    nome_completo?: string;
    email_utilizador?: string;
    foto_perfil?: string;
    estado?: string;
    tipo_membro?: string[];
    data_nascimento?: string;
    perfil?: string;
    // ... other fields
    [key: string]: any;
}

interface Props {
    member: User;
    allUsers: User[];
    internalCommunications: {
        received: any[];
        sent: any[];
    };
    userTypes: any[];
    ageGroups: any[];
    faturas: any[];
    movimentos: any[];
    monthlyFees: any[];
    costCenters: any[];
}

interface PageProps {
    ziggy?: {
        query?: {
            tab?: string;
            folder?: 'received' | 'sent';
            message?: string;
        };
    };
}

const extractDateString = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (value?.date && typeof value.date === 'string') return value.date;
    if (value instanceof Date) return value.toISOString();
    return '';
};

const formatDateForInput = (value?: any): string => {
    const raw = extractDateString(value);
    if (!raw) return '';
    if (raw.includes('T')) return raw.split('T')[0];
    if (raw.includes(' ')) return raw.split(' ')[0];
    return raw;
};

const normalizeMember = (member: User): User => {
    const guardiansFromRelation = Array.isArray((member as any).encarregados) && (member as any).encarregados.length > 0
        ? (member as any).encarregados.map((g: any) => g.id)
        : (member.encarregado_educacao || []);
    const educandosFromRelation = Array.isArray((member as any).educandos) && (member as any).educandos.length > 0
        ? (member as any).educandos.map((e: any) => e.id)
        : (member.educandos || []);

    const normalizedBirthDate = formatDateForInput(
        member.data_nascimento ?? (member as any).birth_date ?? (member as any).data_nascimento
    );

    return {
        ...member,
        nome_completo: member.nome_completo ?? member.full_name ?? member.name ?? '',
        numero_socio: member.numero_socio ?? member.member_number ?? '',
        email_utilizador: member.email_utilizador ?? member.email ?? '',
        data_nascimento: normalizedBirthDate,
        encarregado_educacao: guardiansFromRelation,
        educandos: educandosFromRelation,
    };
};

export default function Show({ member, allUsers, internalCommunications, userTypes, ageGroups, faturas, movimentos, monthlyFees, costCenters }: Props) {
    const page = usePage<PageProps>();
    const [user, setUser] = useState<User>(() => normalizeMember(member));
    const [hasChanges, setHasChanges] = useState(false);
    const query = page.props.ziggy?.query;
    const initialTab = query?.tab === 'communications' ? 'communications' : 'dashboard';

    const handleChange = (field: keyof User, value: any) => {
        setUser(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave: FormEventHandler = (e) => {
        e.preventDefault();
        router.put(route('membros.update', user.id), user, {
            onSuccess: () => {
                setHasChanges(false);
                toast.success('Membro atualizado com sucesso!');
            },
            onError: () => {
                toast.error('Erro ao atualizar membro');
            }
        });
    };

    const handleBack = () => {
        if (hasChanges) {
            if (window.confirm('Tem alterações não guardadas. Deseja sair sem guardar?')) {
                router.visit(route('membros.index'));
            }
        } else {
            router.visit(route('membros.index'));
        }
    };

    const showSportsTab = user.tipo_membro?.includes('atleta') || false;

    return (
        <AuthenticatedLayout
            fullWidth
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Button>
                        <div>
                            <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                                {user.nome_completo || 'Novo Membro'}
                            </h1>
                            <p className="text-muted-foreground text-xs">
                                Nº de Sócio: {user.numero_socio || '-'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleBack} className="h-8 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="h-8 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardar
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Membro - ${user.nome_completo || 'Novo Membro'}`} />

            <div className={moduleViewportClass}>
            <Card className="flex min-h-0 flex-1 flex-col p-2 sm:p-3 bg-white border-0">
                <Tabs defaultValue={initialTab} className={moduleTabsClass}>
                    <TabsList className={`grid w-full shrink-0 h-auto gap-1 p-1 ${showSportsTab ? 'grid-cols-2 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-5'}`}>
                            <TabsTrigger value="dashboard" className="text-xs px-2 py-1.5 whitespace-normal leading-tight text-center min-h-8">
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="personal" className="text-xs px-2 py-1.5 whitespace-normal leading-tight text-center min-h-8">
                                Pessoal
                            </TabsTrigger>
                            <TabsTrigger value="financial" className="text-xs px-2 py-1.5 whitespace-normal leading-tight text-center min-h-8">
                                Financeiro
                            </TabsTrigger>
                            {showSportsTab && (
                                <TabsTrigger value="sports" className="text-xs px-2 py-1.5 whitespace-normal leading-tight text-center min-h-8">
                                    Desportivo
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="configuration" className="text-xs px-2 py-1.5 whitespace-normal leading-tight text-center min-h-8">
                                Configuração
                            </TabsTrigger>
                            <TabsTrigger value="communications" className="text-xs px-2 py-1.5 whitespace-normal leading-tight text-center min-h-8 inline-flex items-center justify-center gap-1">
                                <EnvelopeSimple size={14} weight="duotone" />
                                Comunicações
                            </TabsTrigger>
                        </TabsList>

                    <TabsContent value="dashboard" className={`${moduleTabbedContentClass} space-y-2 bg-white p-0 rounded-lg`}>
                        <DashboardTab user={user as any} faturas={faturas} />
                    </TabsContent>

                    <TabsContent value="personal" className={`${moduleTabbedContentClass} space-y-2 bg-white p-0 rounded-lg`}>
                        <PersonalTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
                            allUsers={allUsers}
                            userTypes={userTypes}
                            onNavigateToUser={(userId) => router.visit(route('membros.show', userId))}
                        />
                    </TabsContent>

                    <TabsContent value="financial" className={`${moduleTabbedContentClass} space-y-2 bg-white p-0 rounded-lg`}>
                        <FinancialTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
                            faturas={faturas}
                            movimentos={movimentos}
                            monthlyFees={monthlyFees}
                            costCenters={costCenters}
                        />
                    </TabsContent>

                    {showSportsTab && (
                        <TabsContent value="sports" className={`${moduleTabbedContentClass} space-y-2 bg-white p-0 rounded-lg`}>
                            <SportsTab 
                                user={user as any}
                                onChange={handleChange}
                                isAdmin={true}
                            />
                        </TabsContent>
                    )}

                    <TabsContent value="configuration" className={`${moduleTabbedContentClass} space-y-2 bg-white p-0 rounded-lg`}>
                        <ConfigurationTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
                        />
                    </TabsContent>

                    <TabsContent value="communications" className={`${moduleTabbedContentClass} space-y-2 bg-white p-0 rounded-lg`}>
                        <CommunicationsTab
                            members={allUsers}
                            communications={internalCommunications}
                            initialFolder={query?.folder || 'received'}
                            initialMessageId={query?.message || null}
                            ownerLabel={user.nome_completo || 'este membro'}
                        />
                    </TabsContent>
                </Tabs>
            </Card>
            </div>

            {hasChanges && (
                <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-accent text-accent-foreground p-2 rounded-lg shadow-lg border">
                    <p className="text-xs font-medium">Alterações não guardadas</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
