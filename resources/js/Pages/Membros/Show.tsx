import { useState, FormEventHandler } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
// ADICIONA ESTAS IMPORTAÇÕES:
import { PersonalTab } from '@/Components/Members/Tabs/PersonalTab';
import { FinancialTab } from '@/Components/Members/Tabs/FinancialTab';
import { SportsTab } from '@/Components/Members/Tabs/SportsTab';
import { ConfigurationTab } from '@/Components/Members/Tabs/ConfigurationTab';

interface User {
    id: string;
    member_number: string;
    full_name: string;
    email_utilizador?: string;
    foto_perfil?: string;
    estado: string;
    member_type: string[]; // ARRAY de tipos
    data_nascimento: string;
    perfil: string;
    sexo?: string;
    menor?: boolean;
    nif?: string;
    morada?: string;
    codigo_postal?: string;
    localidade?: string;
    contacto?: string;
    telemovel?: string;
    // ... adiciona todos os outros campos necessários
    tipo_mensalidade?: string;
    centro_custo?: string[];
    num_federacao?: string;
    numero_pmb?: string;
    data_inscricao?: string;
    escalao?: string[];
    data_atestado_medico?: string;
    arquivo_atestado_medico?: string[];
    informacoes_medicas?: string;
    ativo_desportivo?: boolean;
    rgpd?: boolean;
    data_rgpd?: string;
    arquivo_rgpd?: string;
    consentimento?: boolean;
    data_consentimento?: string;
    arquivo_consentimento?: string;
    afiliacao?: boolean;
    data_afiliacao?: string;
    arquivo_afiliacao?: string;
    declaracao_de_transporte?: boolean;
    declaracao_transporte?: string;
    encarregado_educacao?: string[];
    educandos?: string[];
}

interface Props {
    member: User;
    allUsers: User[];
    userTypes: any[];
    ageGroups: any[];
}

export default function Show({ member, allUsers, userTypes, ageGroups }: Props) {
    const [user, setUser] = useState<User>(member);
    const [hasChanges, setHasChanges] = useState(false);

    const handleChange = (field: keyof User, value: any) => {
        console.log(`🔄 Mudança no campo '${field}':`, value); // DEBUG
        setUser(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave: FormEventHandler = (e) => {
        e.preventDefault();
        
        console.log('💾 A guardar dados:', user); // DEBUG
        
        // Validação client-side
        if (!user.full_name?.trim()) {
            alert('Nome é obrigatório');
            return;
        }
        if (!user.email_utilizador?.trim()) {
            alert('Email de utilizador é obrigatório');
            return;
        }
        if (user.member_type.length === 0) {
            alert('Selecione pelo menos um tipo de membro');
            return;
        }
        
        router.put(route('members.update', user.id), user, {
            onSuccess: () => {
                console.log('✅ Guardado com sucesso!');
                setHasChanges(false);
            },
            onError: (errors) => {
                console.error('❌ Erros de validação:', errors);
            }
        });
    };

    const handleBack = () => {
        if (hasChanges) {
            if (window.confirm('Tem alterações não guardadas. Deseja sair sem guardar?')) {
                router.visit(route('members.index'));
            }
        } else {
            router.visit(route('members.index'));
        }
    };

    const showSportsTab = user.member_type.includes('atleta');

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
                                {user.full_name || 'Novo Membro'}
                            </h1>
                            <p className="text-muted-foreground text-xs">
                                Nº de Sócio: {user.member_number}
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
                            A guardar...
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Editar ${user.full_name}`} />

            <div className="space-y-2 sm:space-y-3 p-2 sm:p-4">
                <Tabs defaultValue="personal" className="space-y-2">
                    <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-1">
                        <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-9">
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

                    {/* TAB PESSOAL - AGORA COM COMPONENTE COMPLETO */}
                    <TabsContent value="personal" className="space-y-2 mt-2">
                        <PersonalTab 
                            user={user}
                            allUsers={allUsers}
                            onChange={handleChange}
                            isAdmin={true} // ou passar auth.user.perfil === 'admin'
                            userTypes={userTypes}
                        />
                    </TabsContent>

                    {/* TAB FINANCEIRO */}
                    <TabsContent value="financial" className="space-y-2 mt-2">
                        <FinancialTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
                        />
                    </TabsContent>

                    {/* TAB DESPORTIVO (só se atleta) */}
                    {showSportsTab && (
                        <TabsContent value="sports" className="space-y-2 mt-2">
                            <SportsTab 
                                user={user}
                                onChange={handleChange}
                                isAdmin={true}
                                ageGroups={ageGroups}
                            />
                        </TabsContent>
                    )}

                    {/* TAB CONFIGURAÇÃO */}
                    <TabsContent value="configuration" className="space-y-2 mt-2">
                        <ConfigurationTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}