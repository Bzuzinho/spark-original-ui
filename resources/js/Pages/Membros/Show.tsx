import { useState, FormEventHandler } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

interface User {
    id: string;
    numero_socio: string;
    nome_completo: string;
    email_utilizador?: string;
    foto_perfil?: string;
    estado: string;
    tipo_membro: string[];
    data_nascimento: string;
    perfil: string;
    // ... other fields
    [key: string]: any;
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
        setUser(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave: FormEventHandler = (e) => {
        e.preventDefault();
        router.put(route('membros.update', user.id), user, {
            onSuccess: () => {
                setHasChanges(false);
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

    const showSportsTab = user.tipo_membro.includes('atleta');

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
                                Nº de Sócio: {user.numero_socio}
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
            <Head title={`Membro - ${user.nome_completo}`} />

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
                            <TabsTrigger value="documents" className="whitespace-nowrap text-xs px-3 sm:px-2 py-1">
                                Documentos
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="personal" className="space-y-2 mt-2">
                        <Card className="p-3">
                            <h3 className="text-sm font-semibold mb-2">Tab Pessoal</h3>
                            <p className="text-xs text-muted-foreground">
                                Esta tab será implementada em breve com todos os campos do PersonalTab do Spark.
                            </p>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-2 mt-2">
                        <Card className="p-3">
                            <h3 className="text-sm font-semibold mb-2">Tab Financeiro</h3>
                            <p className="text-xs text-muted-foreground">
                                Esta tab será implementada em breve com todos os campos do FinancialTab do Spark.
                            </p>
                        </Card>
                    </TabsContent>

                    {showSportsTab && (
                        <TabsContent value="sports" className="space-y-2 mt-2">
                            <Card className="p-3">
                                <h3 className="text-sm font-semibold mb-2">Tab Desportivo</h3>
                                <p className="text-xs text-muted-foreground">
                                    Esta tab será implementada em breve com todos os campos do SportsTab do Spark.
                                </p>
                            </Card>
                        </TabsContent>
                    )}

                    <TabsContent value="configuration" className="space-y-2 mt-2">
                        <Card className="p-3">
                            <h3 className="text-sm font-semibold mb-2">Tab Configuração</h3>
                            <p className="text-xs text-muted-foreground">
                                Esta tab será implementada em breve com todos os campos do ConfigurationTab do Spark.
                            </p>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-2 mt-2">
                        <Card className="p-3">
                            <h3 className="text-sm font-semibold mb-2">Tab Documentos</h3>
                            <p className="text-xs text-muted-foreground">
                                Esta tab será implementada em breve para upload e gestão de documentos.
                            </p>
                        </Card>
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
