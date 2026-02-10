import { useState, FormEventHandler } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { toast } from 'sonner';
import { PersonalTab } from '@/Components/Members/Tabs/PersonalTab';
import { FinancialTab } from '@/Components/Members/Tabs/FinancialTab';
import { SportsTab } from '@/Components/Members/Tabs/SportsTab';
import { ConfigurationTab } from '@/Components/Members/Tabs/ConfigurationTab';

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
    userTypes: any[];
    ageGroups: any[];
    faturas: any[];
    movimentos: any[];
    monthlyFees: any[];
    costCenters: any[];
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

export default function Show({ member, allUsers, userTypes, ageGroups, faturas, movimentos, monthlyFees, costCenters }: Props) {
    const [user, setUser] = useState<User>(() => normalizeMember(member));
    const [hasChanges, setHasChanges] = useState(false);

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

            <Card className="p-2 sm:p-3">
                <Tabs defaultValue="personal" className="space-y-2">
                    <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-1">
                        <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-9 sm:h-8">
                            <TabsTrigger value="personal" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">
                                Pessoal
                            </TabsTrigger>
                            <TabsTrigger value="financial" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">
                                Financeiro
                            </TabsTrigger>
                            {showSportsTab && (
                                <TabsTrigger value="sports" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">
                                    Desportivo
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="configuration" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">
                                Configuração
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="personal" className="space-y-2 mt-2">
                        <PersonalTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
                            allUsers={allUsers}
                            userTypes={userTypes}
                            onNavigateToUser={(userId) => router.visit(route('membros.show', userId))}
                        />
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-2 mt-2">
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
                        <TabsContent value="sports" className="space-y-2 mt-2">
                            <SportsTab 
                                user={user}
                                onChange={handleChange}
                                isAdmin={true}
                            />
                        </TabsContent>
                    )}

                    <TabsContent value="configuration" className="space-y-2 mt-2">
                        <ConfigurationTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
                        />
                    </TabsContent>
                </Tabs>
            </Card>

            {hasChanges && (
                <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-accent text-accent-foreground p-2 rounded-lg shadow-lg border">
                    <p className="text-xs font-medium">Alterações não guardadas</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
