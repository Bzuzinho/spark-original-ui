import { useState, FormEventHandler } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { toast } from 'sonner';
import PersonalTab from '@/Components/Members/Tabs/PersonalTab';
import FinancialTab from '@/Components/Members/Tabs/FinancialTab';
import SportsTab from '@/Components/Members/Tabs/SportsTab';
import ConfigurationTab from '@/Components/Members/Tabs/ConfigurationTab';

interface User {
    id?: string;
    member_number?: string;
    full_name: string;
    email_utilizador?: string;
    foto_perfil?: string;
    estado: string;
    member_type: string[];
    data_nascimento: string;
    perfil: string;
    sexo: string;
    rgpd: boolean;
    consentimento: boolean;
    afiliacao: boolean;
    declaracao_de_transporte: boolean;
    password?: string;
    [key: string]: any;
}

interface Props {
    allUsers: User[];
    userTypes: any[];
    ageGroups: any[];
    guardians?: User[];
}

export default function Create({ allUsers, userTypes, ageGroups, guardians }: Props) {
    const [user, setUser] = useState<User>({
        full_name: '',
        email_utilizador: '',
        sexo: 'masculino',
        perfil: 'atleta',
        estado: 'ativo',
        member_type: [],
        data_nascimento: '',
        rgpd: false,
        consentimento: false,
        afiliacao: false,
        declaracao_de_transporte: false,
        password: '',
        contacto_telefonico: '',
        contacto_emergencia: '',
        numero_cartao_cidadao: '',
        numero_cartao_cidadao_validade: '',
        numero_utente_saude: '',
        numero_contribuinte: '',
        foto_perfil: '',
        observacoes_individuais: '',
        morada: '',
        codigo_postal: '',
        localidade: '',
        pais: 'Portugal',
        iban: '',
        banco: '',
        titular_conta: '',
        sepa_mandate: false,
        sepa_mandate_data: '',
        quota_mensal: 0,
        quota_estado: 'nao_paga',
        taxa_inscricao: 0,
        taxa_inscricao_estado: 'nao_paga',
        tipo_atleta: '',
        escalao: '',
        equipa: '',
        numero_camisola: '',
        posicao: '',
        data_entrada: '',
        data_saida: '',
        notas_desportivas: '',
    });
    const [hasChanges, setHasChanges] = useState(false);

    const handleChange = (field: keyof User, value: any) => {
        setUser(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('membros.store'), user, {
            onSuccess: () => {
                toast.success('Membro criado com sucesso!');
            },
            onError: (errors) => {
                toast.error('Erro ao criar membro');
                console.error(errors);
            }
        });
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (window.confirm('Tem alterações não guardadas. Deseja sair sem guardar?')) {
                router.visit(route('membros.index'));
            }
        } else {
            router.visit(route('membros.index'));
        }
    };

    const showSportsTab = user.member_type.includes('atleta');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Button>
                        <div>
                            <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                                Novo Membro
                            </h1>
                            <p className="text-muted-foreground text-xs">
                                Nº de Sócio: (Auto)
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel} className="h-8 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSave} className="h-8 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Criar Membro
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Novo Membro" />

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
                        />
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-2 mt-2">
                        <FinancialTab 
                            user={user}
                            onChange={handleChange}
                            isAdmin={true}
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
                            isCreating={true}
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
