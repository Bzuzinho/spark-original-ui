import { useState, FormEventHandler } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import { Plus, PencilSimple, Trash, FloppyDisk } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface AgeGroup {
    id: string;
    nome: string;
    descricao?: string;
    idade_minima: number;
    idade_maxima: number;
    ativo: boolean;
}

interface UserType {
    id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
}

interface EventType {
    id: string;
    nome: string;
    descricao?: string;
    categoria?: string;
    cor?: string;
    ativo: boolean;
}

interface ClubSettings {
    id?: number;
    nome_clube: string;
    sigla?: string;
    morada?: string;
    codigo_postal?: string;
    localidade?: string;
    telefone?: string;
    email?: string;
    website?: string;
    nif?: string;
    iban?: string;
}

interface Props {
    userTypes: UserType[];
    ageGroups: AgeGroup[];
    eventTypes: EventType[];
    clubSettings?: ClubSettings;
}

export default function SettingsIndex({ userTypes, ageGroups, eventTypes, clubSettings }: Props) {
    const [currentTab, setCurrentTab] = useState('geral');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [notificationPrefs, setNotificationPrefs] = useState({
        emailNotifications: true,
        paymentAlerts: true,
        activityAlerts: true,
    });

    // Club settings form
    const clubForm = useForm({
        nome_clube: clubSettings?.nome_clube || '',
        sigla: clubSettings?.sigla || '',
        morada: clubSettings?.morada || '',
        codigo_postal: clubSettings?.codigo_postal || '',
        localidade: clubSettings?.localidade || '',
        telefone: clubSettings?.telefone || '',
        email: clubSettings?.email || '',
        website: clubSettings?.website || '',
        nif: clubSettings?.nif || '',
        iban: clubSettings?.iban || '',
    });

    // Generic form for CRUD operations
    const { data, setData, post, put, delete: destroy, reset, processing } = useForm<any>({});

    const openAddDialog = (type: string) => {
        reset();
        setEditingItem({ type });
        setDialogOpen(true);
    };

    const openEditDialog = (item: any, type: string) => {
        setData(item);
        setEditingItem({ ...item, type });
        setDialogOpen(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!editingItem) return;

        const type = editingItem.type;
        const isEditing = !!editingItem.id;

        const routes: Record<string, string> = {
            'age-group': isEditing 
                ? route('configuracoes.escaloes.update', editingItem.id)
                : route('configuracoes.escaloes.store'),
            'user-type': isEditing 
                ? route('configuracoes.tipos-utilizador.update', editingItem.id)
                : route('configuracoes.tipos-utilizador.store'),
            'event-type': isEditing 
                ? route('configuracoes.tipos-evento.update', editingItem.id)
                : route('configuracoes.tipos-evento.store'),
        };

        const options = {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
                setEditingItem(null);
                toast.success(isEditing ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
            },
            onError: () => {
                toast.error('Erro ao processar a operação.');
            },
        };

        if (isEditing) {
            put(routes[type], options);
        } else {
            post(routes[type], options);
        }
    };

    const handleDelete = (id: string, type: string) => {
        if (!confirm('Tem certeza que deseja eliminar este item?')) return;

        const routes: Record<string, string> = {
            'age-group': route('configuracoes.escaloes.destroy', id),
            'user-type': route('configuracoes.tipos-utilizador.destroy', id),
            'event-type': route('configuracoes.tipos-evento.destroy', id),
        };

        router.delete(routes[type], {
            onSuccess: () => toast.success('Eliminado com sucesso!'),
            onError: () => toast.error('Erro ao eliminar.'),
        });
    };

    const handleSaveClubSettings: FormEventHandler = (e) => {
        e.preventDefault();
        clubForm.put(route('configuracoes.club.update'), {
            onSuccess: () => toast.success('Configurações do clube atualizadas com sucesso!'),
            onError: () => toast.error('Erro ao atualizar configurações.'),
        });
    };

    const handleNotificationToggle = (field: keyof typeof notificationPrefs) => {
        setNotificationPrefs(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
        // Note: Notification preferences are stored locally for demo purposes
        // In a real implementation, these would be saved to the backend
        toast.info('Preferência atualizada (apenas localmente)');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
                        <p className="text-muted-foreground text-sm mt-1">Gerir definições do sistema</p>
                    </div>
                    {currentTab === 'clube' && (
                        <Button onClick={handleSaveClubSettings} disabled={clubForm.processing} size="sm">
                            <FloppyDisk className="mr-2" size={16} />
                            Guardar Alterações
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Configurações" />

            <div className="py-6">
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                        <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-3 h-9 text-sm min-w-full sm:min-w-0">
                            <TabsTrigger value="geral" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Geral
                            </TabsTrigger>
                            <TabsTrigger value="clube" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Clube
                            </TabsTrigger>
                            <TabsTrigger value="notificacoes" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Notificações
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab: Geral */}
                    <TabsContent value="geral" className="mt-4 space-y-4">
                        {/* Age Groups */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Escalões</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir os escalões etários do clube
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('age-group')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Escalão
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Idade Mínima</TableHead>
                                            <TableHead>Idade Máxima</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ageGroups.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Nenhum escalão cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            ageGroups.map((group) => (
                                                <TableRow key={group.id}>
                                                    <TableCell className="font-medium">{group.nome}</TableCell>
                                                    <TableCell>{group.idade_minima} anos</TableCell>
                                                    <TableCell>{group.idade_maxima} anos</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(group, 'age-group')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(group.id, 'age-group')}
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* User Types */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Tipos de Utilizador</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir os tipos de utilizadores do sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('user-type')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Tipo
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userTypes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    Nenhum tipo de utilizador cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            userTypes.map((type) => (
                                                <TableRow key={type.id}>
                                                    <TableCell className="font-medium">{type.nome}</TableCell>
                                                    <TableCell>{type.descricao || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(type, 'user-type')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(type.id, 'user-type')}
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Event Types */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Tipos de Evento</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir os tipos de eventos do sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('event-type')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Tipo
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {eventTypes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Nenhum tipo de evento cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            eventTypes.map((type) => (
                                                <TableRow key={type.id}>
                                                    <TableCell className="font-medium">{type.nome}</TableCell>
                                                    <TableCell>{type.categoria || '-'}</TableCell>
                                                    <TableCell>{type.category || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(type, 'event-type')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(type.id, 'event-type')}
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Clube */}
                    <TabsContent value="clube" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Clube</CardTitle>
                                <CardDescription>
                                    Configure as informações básicas do clube
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveClubSettings} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nome_clube">Nome do Clube *</Label>
                                            <Input
                                                id="nome_clube"
                                                value={clubForm.data.nome_clube}
                                                onChange={e => clubForm.setData('nome_clube', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sigla">Sigla</Label>
                                            <Input
                                                id="sigla"
                                                value={clubForm.data.sigla}
                                                onChange={e => clubForm.setData('sigla', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nif">NIF</Label>
                                            <Input
                                                id="nif"
                                                value={clubForm.data.nif}
                                                onChange={e => clubForm.setData('nif', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="telefone">Telefone</Label>
                                            <Input
                                                id="telefone"
                                                value={clubForm.data.telefone}
                                                onChange={e => clubForm.setData('telefone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={clubForm.data.email}
                                                onChange={e => clubForm.setData('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                value={clubForm.data.website}
                                                onChange={e => clubForm.setData('website', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="morada">Morada</Label>
                                            <Input
                                                id="morada"
                                                value={clubForm.data.morada}
                                                onChange={e => clubForm.setData('morada', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="codigo_postal">Código Postal</Label>
                                            <Input
                                                id="codigo_postal"
                                                value={clubForm.data.codigo_postal}
                                                onChange={e => clubForm.setData('codigo_postal', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="localidade">Localidade</Label>
                                            <Input
                                                id="localidade"
                                                value={clubForm.data.localidade}
                                                onChange={e => clubForm.setData('localidade', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="iban">IBAN</Label>
                                            <Input
                                                id="iban"
                                                value={clubForm.data.iban}
                                                onChange={e => clubForm.setData('iban', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Notificações */}
                    <TabsContent value="notificacoes" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferências de Notificações</CardTitle>
                                <CardDescription>
                                    Configure as preferências de notificações do sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="email-notifications">Notificações por Email</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receber notificações gerais por email
                                        </p>
                                    </div>
                                    <Switch
                                        id="email-notifications"
                                        checked={notificationPrefs.emailNotifications}
                                        onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="payment-alerts">Alertas de Pagamento</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receber alertas sobre pagamentos pendentes
                                        </p>
                                    </div>
                                    <Switch
                                        id="payment-alerts"
                                        checked={notificationPrefs.paymentAlerts}
                                        onCheckedChange={() => handleNotificationToggle('paymentAlerts')}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="activity-alerts">Alertas de Atividade</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receber alertas sobre eventos e atividades
                                        </p>
                                    </div>
                                    <Switch
                                        id="activity-alerts"
                                        checked={notificationPrefs.activityAlerts}
                                        onCheckedChange={() => handleNotificationToggle('activityAlerts')}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit/Add Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem?.id ? 'Editar' : 'Adicionar'}{' '}
                            {editingItem?.type === 'age-group' && 'Escalão'}
                            {editingItem?.type === 'user-type' && 'Tipo de Utilizador'}
                            {editingItem?.type === 'event-type' && 'Tipo de Evento'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            {editingItem?.type === 'age-group' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome *</Label>
                                        <Input
                                            id="nome"
                                            value={data.nome || ''}
                                            onChange={e => setData('nome', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="idade_minima">Idade Mínima *</Label>
                                            <Input
                                                id="idade_minima"
                                                type="number"
                                                min="0"
                                                value={data.idade_minima || ''}
                                                onChange={e => setData('idade_minima', e.target.value ? parseInt(e.target.value, 10) : '')}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="idade_maxima">Idade Máxima *</Label>
                                            <Input
                                                id="idade_maxima"
                                                type="number"
                                                min="0"
                                                value={data.idade_maxima || ''}
                                                onChange={e => setData('idade_maxima', e.target.value ? parseInt(e.target.value, 10) : '')}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="descricao">Descrição</Label>
                                        <Textarea
                                            id="descricao"
                                            value={data.descricao || ''}
                                            onChange={e => setData('descricao', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {editingItem?.type === 'user-type' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome *</Label>
                                        <Input
                                            id="nome"
                                            value={data.nome || ''}
                                            onChange={e => setData('nome', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="descricao">Descrição</Label>
                                        <Textarea
                                            id="descricao"
                                            value={data.descricao || ''}
                                            onChange={e => setData('descricao', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="ativo"
                                            checked={data.ativo ?? true}
                                            onCheckedChange={checked => setData('ativo', checked)}
                                        />
                                        <Label htmlFor="ativo">Ativo</Label>
                                    </div>
                                </>
                            )}

                            {editingItem?.type === 'event-type' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome *</Label>
                                        <Input
                                            id="nome"
                                            value={data.nome || ''}
                                            onChange={e => setData('nome', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="descricao">Descrição</Label>
                                        <Textarea
                                            id="descricao"
                                            value={data.descricao || ''}
                                            onChange={e => setData('descricao', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="categoria">Categoria</Label>
                                        <Input
                                            id="categoria"
                                            value={data.categoria || ''}
                                            onChange={e => setData('categoria', e.target.value)}
                                            placeholder="ex: treino, competição, evento"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cor">Cor (Hex)</Label>
                                        <Input
                                            id="cor"
                                            value={data.cor || ''}
                                            onChange={e => setData('cor', e.target.value)}
                                            placeholder="#000000"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="ativo"
                                            checked={data.ativo ?? true}
                                            onCheckedChange={checked => setData('ativo', checked)}
                                        />
                                        <Label htmlFor="ativo">Ativo</Label>
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'A guardar...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
