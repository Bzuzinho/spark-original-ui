import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Label } from '@/Components/ui/label';
import { 
    getStatusColor, 
    getStatusLabel, 
    getMemberTypeLabel,
    calculateAge,
    formatPhoneNumber,
    getInitials
} from '@/lib/user-helpers';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

interface User {
    id: string;
    numero_socio?: string | null;
    nome_completo?: string | null;
    name?: string;
    email?: string;
    email_utilizador?: string | null;
    foto_perfil?: string | null;
    estado?: string;
    tipo_membro?: string[] | null;
    data_nascimento?: string | null;
    menor?: boolean;
    sexo?: string | null;
    nif?: string | null;
    morada?: string | null;
    codigo_postal?: string | null;
    localidade?: string | null;
    telefone?: string | null;
    telemovel?: string | null;
    contacto_emergencia_nome?: string | null;
    contacto_emergencia_telefone?: string | null;
    perfil?: string;
    rgpd?: boolean;
    consentimento?: boolean;
    afiliacao?: boolean;
    declaracao_de_transporte?: boolean;
    tipo_mensalidade?: string | null;
    conta_corrente?: number | null;
    num_federacao?: string | null;
    cartao_federacao?: string | null;
    numero_pmb?: string | null;
    data_inscricao?: string | null;
    escalao?: any;
    data_atestado_medico?: string | null;
    informacoes_medicas?: string | null;
    ativo_desportivo?: boolean;
    user_types?: any[] | null;
    age_group?: any | null;
    encarregados?: User[] | null;
    educandos?: User[] | null;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    member: User;
    allUsers?: User[];
    userTypes?: any[];
    ageGroups?: any[];
}

export default function MembrosShow({ member, allUsers = [], userTypes = [], ageGroups = [] }: Props) {
    const displayName = member.nome_completo || member.name || 'Sem nome';
    const memberNumber = member.numero_socio || 'N/A';
    const status = member.estado || 'ativo';
    const memberTypes = Array.isArray(member.tipo_membro) ? member.tipo_membro : [];
    const age = calculateAge(member.data_nascimento);
    const guardians = Array.isArray(member.encarregados) ? member.encarregados : [];
    const dependents = Array.isArray(member.educandos) ? member.educandos : [];
    const isAtleta = memberTypes.includes('atleta');

    // ✅ SAFE formatting for conta_corrente
    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) {
            return '€0.00';
        }
        return `€${Number(value).toFixed(2)}`;
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja eliminar este membro?')) {
            router.delete(route('membros.destroy', member.id), {
                onSuccess: () => {
                    router.visit(route('membros.index'));
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('membros.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {displayName}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Membro #{memberNumber}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('membros.edit', member.id)}>
                            <Button variant="outline">
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`${displayName}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={member.foto_perfil || undefined} />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold">{displayName}</h2>
                                            <p className="text-muted-foreground">
                                                #{memberNumber}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusColor(status)} className="ml-4">
                                            {getStatusLabel(status)}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {memberTypes.length > 0 ? (
                                            memberTypes.map((type, idx) => (
                                                <Badge key={idx} variant="outline">
                                                    {getMemberTypeLabel(type)}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge variant="outline">Sem tipo atribuído</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <Tabs defaultValue="pessoal" className="w-full">
                        <TabsList>
                            <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                            {isAtleta && <TabsTrigger value="desportivo">Desportivo</TabsTrigger>}
                            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
                        </TabsList>

                        {/* TAB: Dados Pessoais */}
                        <TabsContent value="pessoal" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Pessoais</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Nome Completo</Label>
                                            <p className="font-medium">{member.nome_completo || '-'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Data de Nascimento</Label>
                                            <p className="font-medium">
                                                {member.data_nascimento || '-'}
                                                {age && <span className="text-muted-foreground ml-2">({age} anos)</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Sexo</Label>
                                            <p className="font-medium capitalize">{member.sexo || '-'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Menor</Label>
                                            <p className="font-medium">{member.menor ? 'Sim' : 'Não'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">NIF</Label>
                                            <p className="font-medium">{member.nif || '-'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Número de Sócio</Label>
                                            <p className="font-medium">{memberNumber}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <Label className="text-sm text-muted-foreground">Morada</Label>
                                        <p className="font-medium">{member.morada || '-'}</p>
                                        {(member.codigo_postal || member.localidade) && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {member.codigo_postal} {member.localidade}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t">
                                        <Label className="text-sm font-semibold mb-2 block">Contactos</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Email</Label>
                                                <p className="font-medium text-sm">{member.email || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Telefone</Label>
                                                <p className="font-medium text-sm">
                                                    {formatPhoneNumber(member.telefone || member.telemovel) || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {member.contacto_emergencia_nome && (
                                        <div className="pt-4 border-t">
                                            <Label className="text-sm font-semibold mb-2 block">Contacto de Emergência</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Nome</Label>
                                                    <p className="font-medium text-sm">{member.contacto_emergencia_nome}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Telefone</Label>
                                                    <p className="font-medium text-sm">
                                                        {formatPhoneNumber(member.contacto_emergencia_telefone) || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(guardians.length > 0 || dependents.length > 0) && (
                                        <div className="pt-4 border-t">
                                            <Label className="text-sm font-semibold mb-2 block">Relações Familiares</Label>
                                            
                                            {guardians.length > 0 && (
                                                <div className="mb-4">
                                                    <Label className="text-xs text-muted-foreground mb-2 block">
                                                        Encarregados de Educação
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {guardians.map((guardian) => (
                                                            <Link
                                                                key={guardian.id}
                                                                href={route('membros.show', guardian.id)}
                                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                                            >
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={guardian.foto_perfil || undefined} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {getInitials(guardian.nome_completo || guardian.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {guardian.nome_completo || guardian.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        #{guardian.numero_socio || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {dependents.length > 0 && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground mb-2 block">
                                                        Educandos
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {dependents.map((dependent) => (
                                                            <Link
                                                                key={dependent.id}
                                                                href={route('membros.show', dependent.id)}
                                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                                            >
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={dependent.foto_perfil || undefined} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {getInitials(dependent.nome_completo || dependent.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {dependent.nome_completo || dependent.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        #{dependent.numero_socio || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB: Financeiro */}
                        <TabsContent value="financeiro" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Financeiras</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Tipo de Mensalidade</Label>
                                            <p className="font-medium">{member.tipo_mensalidade || 'Não definido'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Conta Corrente</Label>
                                            <p className="font-medium">{formatCurrency(member.conta_corrente)}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 text-center text-muted-foreground">
                                        <p>Histórico de faturas e pagamentos estará disponível em breve</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB: Desportivo */}
                        {isAtleta && (
                            <TabsContent value="desportivo" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dados Desportivos</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Nº Federação</Label>
                                                <p className="font-medium">{member.num_federacao || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Cartão Federação</Label>
                                                <p className="font-medium">{member.cartao_federacao || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Nº PMB</Label>
                                                <p className="font-medium">{member.numero_pmb || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Data de Inscrição</Label>
                                                <p className="font-medium">{member.data_inscricao || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Atestado Médico</Label>
                                                <p className="font-medium">{member.data_atestado_medico || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Ativo Desportivo</Label>
                                                <p className="font-medium">{member.ativo_desportivo ? 'Sim' : 'Não'}</p>
                                            </div>
                                        </div>
                                        {member.informacoes_medicas && (
                                            <div className="pt-4 border-t">
                                                <Label className="text-sm text-muted-foreground">Informações Médicas</Label>
                                                <p className="text-sm mt-2">{member.informacoes_medicas}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {/* TAB: Configuração */}
                        <TabsContent value="configuracao" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Acesso à Plataforma</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Email de Autenticação</Label>
                                            <p className="font-medium">{member.email_utilizador || member.email || '-'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Perfil</Label>
                                            <p className="font-medium capitalize">{member.perfil || 'user'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>RGPD e Consentimentos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="font-medium">RGPD</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Consentimento para tratamento de dados pessoais
                                            </p>
                                        </div>
                                        <Badge variant={member.rgpd ? 'default' : 'secondary'}>
                                            {member.rgpd ? 'Sim' : 'Não'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="font-medium">Consentimento</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Autorização de utilização de imagem
                                            </p>
                                        </div>
                                        <Badge variant={member.consentimento ? 'default' : 'secondary'}>
                                            {member.consentimento ? 'Sim' : 'Não'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="font-medium">Afiliação</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Afiliação ao clube
                                            </p>
                                        </div>
                                        <Badge variant={member.afiliacao ? 'default' : 'secondary'}>
                                            {member.afiliacao ? 'Sim' : 'Não'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="font-medium">Declaração de Transporte</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Autorização de transporte
                                            </p>
                                        </div>
                                        <Badge variant={member.declaracao_de_transporte ? 'default' : 'secondary'}>
                                            {member.declaracao_de_transporte ? 'Sim' : 'Não'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
