import { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    userTypes: any[];
    ageGroups: any[];
    guardians: any[];
}

export default function MembrosCreate({ userTypes = [], ageGroups = [], guardians = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        numero_socio: '',
        nome_completo: '',
        data_nascimento: '',
        sexo: 'masculino',
        menor: false,
        tipo_membro: [] as string[],
        estado: 'ativo',
        nif: '',
        morada: '',
        codigo_postal: '',
        localidade: '',
        telefone: '',
        telemovel: '',
        contacto_emergencia_nome: '',
        contacto_emergencia_telefone: '',
        email_utilizador: '',
        perfil: 'user',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('membros.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Will redirect to membros.index on success
            },
        });
    };

    const toggleTipoMembro = (tipo: string) => {
        const current = [...data.tipo_membro];
        const index = current.indexOf(tipo);
        
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(tipo);
        }
        
        setData('tipo_membro', current);
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
                                Novo Membro
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Preencha os dados do novo membro
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={processing}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                    </Button>
                </div>
            }
        >
            <Head title="Novo Membro" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Dados Básicos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados Básicos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome_completo">
                                            Nome Completo <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="nome_completo"
                                            value={data.nome_completo}
                                            onChange={(e) => setData('nome_completo', e.target.value)}
                                            placeholder="Nome completo do membro"
                                            required
                                        />
                                        {errors.nome_completo && (
                                            <p className="text-sm text-red-500">{errors.nome_completo}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="numero_socio">Número de Sócio</Label>
                                        <Input
                                            id="numero_socio"
                                            value={data.numero_socio}
                                            onChange={(e) => setData('numero_socio', e.target.value)}
                                            placeholder="Ex: 001"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="data_nascimento">
                                            Data de Nascimento <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="data_nascimento"
                                            type="date"
                                            value={data.data_nascimento}
                                            onChange={(e) => setData('data_nascimento', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sexo">Sexo</Label>
                                        <Select value={data.sexo} onValueChange={(value) => setData('sexo', value)}>
                                            <SelectTrigger id="sexo">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="masculino">Masculino</SelectItem>
                                                <SelectItem value="feminino">Feminino</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nif">NIF</Label>
                                        <Input
                                            id="nif"
                                            value={data.nif}
                                            onChange={(e) => setData('nif', e.target.value)}
                                            placeholder="Número de Identificação Fiscal"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 pt-8">
                                        <Switch
                                            id="menor"
                                            checked={data.menor}
                                            onCheckedChange={(checked) => setData('menor', checked)}
                                        />
                                        <Label htmlFor="menor">É menor de idade</Label>
                                    </div>
                                </div>

                                {/* Tipo de Membro */}
                                <div className="space-y-2 pt-4 border-t">
                                    <Label>Tipo de Membro <span className="text-red-500">*</span></Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['atleta', 'encarregado_educacao', 'socio', 'staff', 'treinador', 'dirigente'].map((tipo) => (
                                            <Button
                                                key={tipo}
                                                type="button"
                                                variant={data.tipo_membro.includes(tipo) ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => toggleTipoMembro(tipo)}
                                            >
                                                {tipo === 'encarregado_educacao' ? 'Encarregado' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                    {errors.tipo_membro && (
                                        <p className="text-sm text-red-500">{errors.tipo_membro}</p>
                                    )}
                                </div>

                                {/* Estado */}
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select value={data.estado} onValueChange={(value) => setData('estado', value)}>
                                        <SelectTrigger id="estado">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="suspenso">Suspenso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contactos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contactos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="email@exemplo.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefone">Telefone</Label>
                                        <Input
                                            id="telefone"
                                            value={data.telefone}
                                            onChange={(e) => setData('telefone', e.target.value)}
                                            placeholder="912 345 678"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telemovel">Telemóvel</Label>
                                        <Input
                                            id="telemovel"
                                            value={data.telemovel}
                                            onChange={(e) => setData('telemovel', e.target.value)}
                                            placeholder="912 345 678"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="morada">Morada</Label>
                                    <Textarea
                                        id="morada"
                                        value={data.morada}
                                        onChange={(e) => setData('morada', e.target.value)}
                                        placeholder="Rua, número, andar..."
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo_postal">Código Postal</Label>
                                        <Input
                                            id="codigo_postal"
                                            value={data.codigo_postal}
                                            onChange={(e) => setData('codigo_postal', e.target.value)}
                                            placeholder="0000-000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="localidade">Localidade</Label>
                                        <Input
                                            id="localidade"
                                            value={data.localidade}
                                            onChange={(e) => setData('localidade', e.target.value)}
                                            placeholder="Cidade"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contacto de Emergência */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contacto de Emergência</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contacto_emergencia_nome">Nome</Label>
                                        <Input
                                            id="contacto_emergencia_nome"
                                            value={data.contacto_emergencia_nome}
                                            onChange={(e) => setData('contacto_emergencia_nome', e.target.value)}
                                            placeholder="Nome do contacto"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contacto_emergencia_telefone">Telefone</Label>
                                        <Input
                                            id="contacto_emergencia_telefone"
                                            value={data.contacto_emergencia_telefone}
                                            onChange={(e) => setData('contacto_emergencia_telefone', e.target.value)}
                                            placeholder="912 345 678"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acesso à Plataforma */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Acesso à Plataforma</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email_utilizador">
                                            Email de Autenticação <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email_utilizador"
                                            type="email"
                                            value={data.email_utilizador}
                                            onChange={(e) => setData('email_utilizador', e.target.value)}
                                            placeholder="login@exemplo.com"
                                            required
                                        />
                                        {errors.email_utilizador && (
                                            <p className="text-sm text-red-500">{errors.email_utilizador}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password (opcional)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Deixe em branco para gerar automaticamente"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Se não preencher, será gerada uma password padrão
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="perfil">Perfil de Autorizações</Label>
                                        <Select value={data.perfil} onValueChange={(value) => setData('perfil', value)}>
                                            <SelectTrigger id="perfil">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Administrador</SelectItem>
                                                <SelectItem value="encarregado">Encarregado de Educação</SelectItem>
                                                <SelectItem value="atleta">Atleta</SelectItem>
                                                <SelectItem value="staff">Staff</SelectItem>
                                                <SelectItem value="user">Utilizador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4">
                            <Link href={route('membros.index')}>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'A guardar...' : 'Criar Membro'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
