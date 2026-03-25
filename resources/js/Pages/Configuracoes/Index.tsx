import { useState, useEffect, FormEventHandler } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Plus, PencilSimple, Trash, FloppyDisk } from '@phosphor-icons/react';
import { FileUpload } from '@/Components/FileUpload';
import ConfiguracoesDesportivoIndex from '@/Pages/Configuracoes/Desportivo/Index';
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
    icon?: string;
    visibilidade_default?: string;
    gera_taxa?: boolean;
    permite_convocatoria?: boolean;
    gera_presencas?: boolean;
    requer_transporte?: boolean;
    ativo: boolean;
}

interface BaseDesportivoConfig {
    id: string;
    codigo: string;
    nome: string;
    ativo: boolean;
    ordem: number;
}

interface TrainingZoneConfig extends BaseDesportivoConfig {
    percentagem_min?: number | null;
    percentagem_max?: number | null;
}

interface AbsenceReasonConfig extends BaseDesportivoConfig {
    requer_justificacao: boolean;
}

interface InjuryReasonConfig extends BaseDesportivoConfig {
    gravidade: string;
}

interface PoolTypeConfig extends BaseDesportivoConfig {
    comprimento_m?: number | null;
}

interface Permission {
    id: string;
    user_type_id: string;
    modulo: string;
    submodulo?: string | null;
    separador?: string | null;
    campo?: string | null;
    pode_ver: boolean;
    pode_criar: boolean;
    pode_editar: boolean;
    pode_eliminar: boolean;
}

interface MonthlyFee {
    id: string;
    designacao: string;
    valor: number;
    age_group_id?: string | null;
    ativo: boolean;
}

interface InvoiceType {
    id: string;
    codigo: string;
    nome: string;
    descricao?: string | null;
    ativo: boolean;
}

interface CostCenter {
    id: string;
    codigo: string;
    nome: string;
    tipo?: string | null;
    descricao?: string | null;
    orcamento?: number | null;
    ativo: boolean;
}

interface Product {
    id: string;
    codigo: string;
    nome: string;
    categoria?: string | null;
    preco: number;
    stock_minimo?: number;
    area_armazenamento?: string | null;
    descricao?: string | null;
    imagem?: string | null;
    ativo: boolean;
    visible_in_store?: boolean;
}

const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
};

interface ItemCategory {
    id: string;
    codigo: string;
    nome: string;
    ativo: boolean;
}

interface Supplier {
    id: string;
    nome: string;
    nif?: string | null;
    email?: string | null;
    telefone?: string | null;
    morada?: string | null;
    categoria?: string | null;
    ativo: boolean;
}

interface ProvaTipo {
    id: string;
    nome: string;
    distancia: number;
    unidade: string;
    modalidade: string;
    ativo: boolean;
}

interface NotificationPrefs {
    id?: string;
    email_notificacoes: boolean;
    alertas_pagamento: boolean;
    alertas_atividade: boolean;
}

interface DbUser {
    id: string;
    numero_socio?: string | null;
    nome_completo?: string | null;
    email_utilizador?: string | null;
    perfil?: string | null;
    estado?: string | null;
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
    logo_url?: string;
    iban?: string;
}

const permissionCatalog = [
    {
        value: 'dashboard',
        label: 'Dashboard',
        submodules: [],
    },
    {
        value: 'membros',
        label: 'Membros',
        submodules: [
            {
                value: 'lista',
                label: 'Lista',
                separators: [
                    { value: 'tabela', label: 'Tabela', fields: ['nome_completo', 'numero_socio', 'email_utilizador', 'estado'] },
                ],
            },
            {
                value: 'perfil',
                label: 'Perfil',
                separators: [
                    { value: 'dados_pessoais', label: 'Dados pessoais', fields: ['nome_completo', 'nif', 'cc', 'morada'] },
                    { value: 'contactos', label: 'Contactos', fields: ['telefone', 'email_utilizador'] },
                ],
            },
            {
                value: 'desportivo',
                label: 'Desportivo',
                separators: [
                    { value: 'treinos', label: 'Treinos', fields: ['frequencia', 'grupo'] },
                    { value: 'competicoes', label: 'Competições', fields: ['resultado', 'posicao'] },
                ],
            },
            {
                value: 'financeiro',
                label: 'Financeiro',
                separators: [
                    { value: 'mensalidades', label: 'Mensalidades', fields: ['tipo_mensalidade', 'valor'] },
                    { value: 'faturas', label: 'Faturas', fields: ['estado_pagamento', 'valor_total'] },
                ],
            },
        ],
    },
    {
        value: 'eventos',
        label: 'Eventos',
        submodules: [
            {
                value: 'calendario',
                label: 'Calendário',
                separators: [
                    { value: 'lista', label: 'Lista', fields: ['titulo', 'data', 'local'] },
                ],
            },
            {
                value: 'convocatorias',
                label: 'Convocatórias',
                separators: [
                    { value: 'atletas', label: 'Atletas', fields: ['presenca', 'estado'] },
                ],
            },
            {
                value: 'resultados',
                label: 'Resultados',
                separators: [
                    { value: 'provas', label: 'Provas', fields: ['tempo', 'posicao'] },
                ],
            },
        ],
    },
    {
        value: 'desportivo',
        label: 'Desportivo',
        submodules: [
            {
                value: 'treinos',
                label: 'Treinos',
                separators: [
                    { value: 'planeamento', label: 'Planeamento', fields: ['data', 'objetivo'] },
                ],
            },
            {
                value: 'competicoes',
                label: 'Competições',
                separators: [
                    { value: 'eventos', label: 'Eventos', fields: ['nome', 'data'] },
                ],
            },
        ],
    },
    {
        value: 'financeiro',
        label: 'Financeiro',
        submodules: [
            {
                value: 'faturas',
                label: 'Faturas',
                separators: [
                    { value: 'lista', label: 'Lista', fields: ['estado_pagamento', 'valor_total'] },
                ],
            },
            {
                value: 'movimentos',
                label: 'Movimentos',
                separators: [
                    { value: 'entradas', label: 'Entradas', fields: ['valor', 'descricao'] },
                    { value: 'saidas', label: 'Saídas', fields: ['valor', 'descricao'] },
                ],
            },
            {
                value: 'mensalidades',
                label: 'Mensalidades',
                separators: [
                    { value: 'config', label: 'Config', fields: ['designacao', 'valor'] },
                ],
            },
        ],
    },
    {
        value: 'loja',
        label: 'Loja',
        submodules: [
            {
                value: 'artigos',
                label: 'Artigos',
                separators: [
                    { value: 'catalogo', label: 'Catálogo', fields: ['codigo', 'nome', 'preco'] },
                ],
            },
            {
                value: 'vendas',
                label: 'Vendas',
                separators: [
                    { value: 'registos', label: 'Registos', fields: ['valor', 'data'] },
                ],
            },
        ],
    },
    {
        value: 'patrocinios',
        label: 'Patrocínios',
        submodules: [
            {
                value: 'sponsors',
                label: 'Patrocinadores',
                separators: [
                    { value: 'lista', label: 'Lista', fields: ['nome', 'valor'] },
                ],
            },
        ],
    },
    {
        value: 'comunicacao',
        label: 'Comunicação',
        submodules: [
            {
                value: 'mensagens',
                label: 'Mensagens',
                separators: [
                    { value: 'lista', label: 'Lista', fields: ['assunto', 'estado'] },
                ],
            },
        ],
    },
    {
        value: 'marketing',
        label: 'Marketing',
        submodules: [
            {
                value: 'campanhas',
                label: 'Campanhas',
                separators: [
                    { value: 'lista', label: 'Lista', fields: ['nome', 'estado'] },
                ],
            },
        ],
    },
    {
        value: 'configuracoes',
        label: 'Configurações',
        submodules: [
            {
                value: 'geral',
                label: 'Geral',
                separators: [
                    { value: 'escaloes', label: 'Escalões', fields: ['nome', 'idade_minima', 'idade_maxima'] },
                    { value: 'tipos_utilizador', label: 'Tipos de Utilizador', fields: ['nome', 'descricao'] },
                    { value: 'permissoes', label: 'Permissões', fields: ['modulo', 'submodulo'] },
                    { value: 'provas', label: 'Provas', fields: ['nome', 'distancia', 'modalidade'] },
                ],
            },
            {
                value: 'clube',
                label: 'Clube',
                separators: [
                    { value: 'info', label: 'Info', fields: ['nome_clube', 'nif', 'morada', 'telefone'] },
                ],
            },
            {
                value: 'financeiro',
                label: 'Financeiro',
                separators: [
                    { value: 'mensalidades', label: 'Mensalidades', fields: ['designacao', 'valor'] },
                    { value: 'tipos_fatura', label: 'Tipos de Fatura', fields: ['nome', 'codigo'] },
                    { value: 'centros_custo', label: 'Centros de Custo', fields: ['nome', 'orcamento'] },
                ],
            },
            {
                value: 'logistica',
                label: 'Logística',
                separators: [
                    { value: 'artigos', label: 'Artigos', fields: ['codigo', 'nome', 'preco'] },
                    { value: 'fornecedores', label: 'Fornecedores', fields: ['nome', 'nif'] },
                ],
            },
            {
                value: 'notificacoes',
                label: 'Notificações',
                separators: [
                    { value: 'preferencias', label: 'Preferências', fields: ['email_notificacoes', 'alertas_pagamento', 'alertas_atividade'] },
                ],
            },
            {
                value: 'base_dados',
                label: 'Base de Dados',
                separators: [
                    { value: 'utilizadores', label: 'Utilizadores', fields: ['nome_completo', 'email_utilizador', 'estado'] },
                ],
            },
        ],
    },
];

const customValue = '__custom__';

const buildOptions = (values: Array<{ value: string; label: string }>) => [
    ...values,
    { value: customValue, label: 'Personalizado' },
];

interface Props {
    userTypes: UserType[];
    ageGroups: AgeGroup[];
    eventTypes: EventType[];
    athleteStatuses: BaseDesportivoConfig[];
    trainingTypes: BaseDesportivoConfig[];
    trainingZones: TrainingZoneConfig[];
    absenceReasons: AbsenceReasonConfig[];
    injuryReasons: InjuryReasonConfig[];
    poolTypes: PoolTypeConfig[];
    permissions: Permission[];
    monthlyFees: MonthlyFee[];
    invoiceTypes: InvoiceType[];
    costCenters: CostCenter[];
    products: Product[];
    suppliers: Supplier[];
    itemCategories: ItemCategory[];
    provaTipos: ProvaTipo[];
    notificationPrefs?: NotificationPrefs | null;
    users: DbUser[];
    clubSettings?: ClubSettings;
}

export default function SettingsIndex({
    userTypes,
    ageGroups,
    eventTypes,
    athleteStatuses,
    trainingTypes,
    trainingZones,
    absenceReasons,
    injuryReasons,
    poolTypes,
    permissions,
    monthlyFees,
    invoiceTypes,
    costCenters,
    products,
    suppliers,
    itemCategories,
    provaTipos,
    notificationPrefs: initialNotificationPrefs,
    users,
    clubSettings,
}: Props) {
    const [currentTab, setCurrentTab] = useState('geral');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
        email_notificacoes: initialNotificationPrefs?.email_notificacoes ?? true,
        alertas_pagamento: initialNotificationPrefs?.alertas_pagamento ?? true,
        alertas_atividade: initialNotificationPrefs?.alertas_atividade ?? true,
    });

    // Generic form for CRUD operations
    const { data, setData, post, put, delete: destroy, reset, processing } = useForm<any>({});

    const moduleOptions = buildOptions(
        permissionCatalog.map((item) => ({ value: item.value, label: item.label }))
    );

    const selectedModule = permissionCatalog.find((item) => item.value === data.modulo);
    const submoduleOptions = buildOptions(
        (selectedModule?.submodules || []).map((item) => ({ value: item.value, label: item.label }))
    );

    const selectedSubmodule = selectedModule?.submodules.find((item) => item.value === data.submodulo);
    const separatorOptions = buildOptions(
        (selectedSubmodule?.separators || []).map((item) => ({ value: item.value, label: item.label }))
    );

    const selectedSeparator = selectedSubmodule?.separators.find((item) => item.value === data.separador);
    const fieldOptions = buildOptions(
        (selectedSeparator?.fields || []).map((item) => ({ value: item, label: item }))
    );

    const getSelectValue = (value: string | undefined | null, options: Array<{ value: string }>) => {
        if (!value) return '';
        return options.some((option) => option.value === value) ? value : customValue;
    };

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
        logo_url: clubSettings?.logo_url || '',
        iban: clubSettings?.iban || '',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(clubSettings?.logo_url || null);

    useEffect(() => {
        if (clubSettings?.logo_url) {
            setLogoPreview(clubSettings.logo_url);
        }
    }, [clubSettings?.logo_url]);

    const openAddDialog = (type: string) => {
        reset();
        if (type === 'product') {
            setData('ativo', true);
            setData('visible_in_store', false);
            setData('stock_minimo', 0);
            setData('area_armazenamento', '');
        }
        if (type === 'product') setProductImagePreview(null);
        if (type === 'item-category') {
            setData('ativo', true);
        }
        setEditingItem({ type });
        setDialogOpen(true);
    };

    const openEditDialog = (item: any, type: string) => {
        setData(item);
        setEditingItem({ ...item, type });
        if (type === 'product') {
            setProductImagePreview(item.imagem || null);
        }
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
            'permission': isEditing
                ? route('configuracoes.permissoes.update', editingItem.id)
                : route('configuracoes.permissoes.store'),
            'monthly-fee': isEditing
                ? route('configuracoes.mensalidades.update', editingItem.id)
                : route('configuracoes.mensalidades.store'),
            'invoice-type': isEditing
                ? route('configuracoes.tipos-fatura.update', editingItem.id)
                : route('configuracoes.tipos-fatura.store'),
            'cost-center': isEditing
                ? route('configuracoes.centros-custo.update', editingItem.id)
                : route('configuracoes.centros-custo.store'),
            'product': isEditing
                ? route('configuracoes.artigos.update', editingItem.id)
                : route('configuracoes.artigos.store'),
            'item-category': isEditing
                ? route('configuracoes.categorias-itens.update', editingItem.id)
                : route('configuracoes.categorias-itens.store'),
            'supplier': isEditing
                ? route('configuracoes.fornecedores.update', editingItem.id)
                : route('configuracoes.fornecedores.store'),
            'prova-tipo': isEditing
                ? route('configuracoes.provas.update', editingItem.id)
                : route('configuracoes.provas.store'),
            'athlete-status': isEditing
                ? route('configuracoes.desportivo.estados-atleta.update', editingItem.id)
                : route('configuracoes.desportivo.estados-atleta.store'),
            'absence-reason': isEditing
                ? route('configuracoes.desportivo.motivos-ausencia.update', editingItem.id)
                : route('configuracoes.desportivo.motivos-ausencia.store'),
        };

        const options = {
            ...(type === 'product' && { forceFormData: true }),
            onSuccess: () => {
                setDialogOpen(false);
                reset();
                setEditingItem(null);
                if (type === 'product') setProductImagePreview(null);
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
            'permission': route('configuracoes.permissoes.destroy', id),
            'monthly-fee': route('configuracoes.mensalidades.destroy', id),
            'invoice-type': route('configuracoes.tipos-fatura.destroy', id),
            'cost-center': route('configuracoes.centros-custo.destroy', id),
            'product': route('configuracoes.artigos.destroy', id),
            'item-category': route('configuracoes.categorias-itens.destroy', id),
            'supplier': route('configuracoes.fornecedores.destroy', id),
            'prova-tipo': route('configuracoes.provas.destroy', id),
            'athlete-status': route('configuracoes.desportivo.estados-atleta.destroy', id),
            'absence-reason': route('configuracoes.desportivo.motivos-ausencia.destroy', id),
        };

        router.delete(routes[type], {
            onSuccess: () => toast.success('Eliminado com sucesso!'),
            onError: () => toast.error('Erro ao eliminar.'),
        });
    };

    const handleSaveClubSettings: FormEventHandler = (e) => {
        e.preventDefault();
        clubForm.put('/configuracoes/clube', {
            forceFormData: true,
            onSuccess: () => toast.success('Configurações do clube atualizadas com sucesso!'),
            onError: () => toast.error('Erro ao atualizar configurações.'),
        });
    };

    const handleNotificationToggle = (field: keyof NotificationPrefs) => {
        const updated = {
            ...notificationPrefs,
            [field]: !notificationPrefs[field],
        };

        setNotificationPrefs(updated);

        router.put(route('configuracoes.notificacoes.update'), updated, {
            preserveScroll: true,
            onSuccess: () => toast.success('Preferência atualizada'),
            onError: () => toast.error('Erro ao atualizar preferências'),
        });
    };

    const handleExportUsers = () => {
        const dataStr = JSON.stringify(users, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users-export-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Dados exportados com sucesso');
    };

    return (
        <AuthenticatedLayout
            fullWidth
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Configurações</h1>
                        <p className="text-muted-foreground text-xs mt-0.5">Gerir definições do sistema</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentTab === 'clube' && (
                            <Button onClick={handleSaveClubSettings} disabled={clubForm.processing} size="sm">
                                <FloppyDisk className="mr-2" size={16} />
                                Guardar Alterações
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Configurações" />

            <div className="w-full space-y-2 sm:space-y-3">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-3">
                    <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                        <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-7 h-9 text-sm min-w-full sm:min-w-0">
                            <TabsTrigger value="geral" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Geral
                            </TabsTrigger>
                            <TabsTrigger value="clube" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Clube
                            </TabsTrigger>
                            <TabsTrigger value="desportivo" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Desportivo
                            </TabsTrigger>
                            <TabsTrigger value="financeiro" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Financeiro
                            </TabsTrigger>
                            <TabsTrigger value="logistica" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Logistica
                            </TabsTrigger>
                            <TabsTrigger value="notificacoes" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Notificações
                            </TabsTrigger>
                            <TabsTrigger value="base-dados" className="text-sm whitespace-nowrap px-3 sm:px-2">
                                Base de Dados
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab: Geral */}
                    <TabsContent value="geral" className="mt-4 space-y-4">
                        <Tabs defaultValue="geral-tipos-utilizador" className="space-y-4">
                            <TabsList className="w-full flex flex-wrap h-auto gap-1 justify-start">
                                <TabsTrigger value="geral-tipos-utilizador">Tipos de Utilizador</TabsTrigger>
                                <TabsTrigger value="geral-tipos-evento">Tipos de Evento</TabsTrigger>
                                <TabsTrigger value="geral-permissoes">Permissões</TabsTrigger>
                                <TabsTrigger value="geral-estados">Estados</TabsTrigger>
                                <TabsTrigger value="geral-motivos-ausencia">Motivos Ausência</TabsTrigger>
                            </TabsList>


                        <TabsContent value="geral-tipos-utilizador" className="space-y-4">
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
                        </TabsContent>

                        <TabsContent value="geral-tipos-evento" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Tipos de Evento</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir os tipos de eventos do sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-4">
                                    <Button onClick={() => openAddDialog('event-type')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Tipo
                                    </Button>
                                </div>
                                {eventTypes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Nenhum tipo de evento cadastrado
                                    </div>
                                ) : (
                                    <div className="grid gap-1.5 sm:gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {eventTypes.map((type) => (
                                            <Card key={type.id} className="flex flex-col p-0 border">
                                                <div className="flex items-center justify-between gap-0 px-2 py-0 text-xs">
                                                    <div className="flex items-center gap-0 flex-1 min-w-0">
                                                        {type.cor && (
                                                            <div
                                                                className="w-2 h-2 rounded-full shrink-0 mr-0.5"
                                                                style={{ backgroundColor: type.cor }}
                                                            />
                                                        )}
                                                        <span className="truncate font-medium text-sm leading-none">{type.nome}</span>
                                                    </div>
                                                    {type.ativo && (
                                                        <span className="shrink-0 text-xs font-medium py-0 px-1.5 bg-blue-100 text-blue-700 rounded text-nowrap leading-none ml-0.5">
                                                            Ativo
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="px-2 py-0 -mt-0.5" style={{ lineHeight: '1' }}>
                                                    <div className="flex flex-wrap gap-0" style={{ fontSize: '11px' }}>
                                                        {type.gera_taxa && (
                                                            <span className="bg-amber-100 text-amber-700 px-0.5 py-0 rounded text-xs leading-none h-4 flex items-center mr-0.5">
                                                                Gera Taxa
                                                            </span>
                                                        )}
                                                        {type.permite_convocatoria && (
                                                            <span className="bg-blue-100 text-blue-700 px-0.5 py-0 rounded text-xs leading-none h-4 flex items-center mr-0.5">
                                                                Permite Conv.
                                                            </span>
                                                        )}
                                                        {type.gera_presencas && (
                                                            <span className="bg-purple-100 text-purple-700 px-0.5 py-0 rounded text-xs leading-none h-4 flex items-center mr-0.5">
                                                                Presenças
                                                            </span>
                                                        )}
                                                        {type.requer_transporte && (
                                                            <span className="bg-green-100 text-green-700 px-0.5 py-0 rounded text-xs leading-none h-4 flex items-center mr-0.5">
                                                                Transporte
                                                            </span>
                                                        )}
                                                        {type.visibilidade_default && (
                                                            <span className="bg-gray-100 text-gray-700 px-0.5 py-0 rounded text-xs leading-none h-4 flex items-center">
                                                                {type.visibilidade_default}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="border-t flex gap-1 px-2 py-0 mt-0">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 h-5 text-xs py-0 px-1"
                                                        onClick={() => openEditDialog(type, 'event-type')}
                                                    >
                                                        <PencilSimple size={8} className="mr-0.5" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 py-0 px-0 flex items-center justify-center"
                                                        onClick={() => handleDelete(type.id, 'event-type')}
                                                    >
                                                        <Trash size={12} />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        </TabsContent>

                        <TabsContent value="geral-permissoes" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Permissões por Tipo de Utilizador</CardTitle>
                                <CardDescription className="text-sm">
                                    Definir permissões de acesso para cada tipo de utilizador
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('permission')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Permissão
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo de Utilizador</TableHead>
                                            <TableHead>Módulo</TableHead>
                                            <TableHead>Submódulo</TableHead>
                                            <TableHead>Separador</TableHead>
                                            <TableHead>Campo</TableHead>
                                            <TableHead>Ver</TableHead>
                                            <TableHead>Criar</TableHead>
                                            <TableHead>Editar</TableHead>
                                            <TableHead>Eliminar</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                                    Nenhuma permissão cadastrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            permissions.map((permission) => {
                                                const userType = userTypes.find((type) => type.id === permission.user_type_id);
                                                return (
                                                    <TableRow key={permission.id}>
                                                        <TableCell className="font-medium">{userType?.nome || '-'}</TableCell>
                                                        <TableCell>{permission.modulo}</TableCell>
                                                        <TableCell>{permission.submodulo || '-'}</TableCell>
                                                        <TableCell>{permission.separador || '-'}</TableCell>
                                                        <TableCell>{permission.campo || '-'}</TableCell>
                                                        <TableCell>{permission.pode_ver ? '✓' : '✗'}</TableCell>
                                                        <TableCell>{permission.pode_criar ? '✓' : '✗'}</TableCell>
                                                        <TableCell>{permission.pode_editar ? '✓' : '✗'}</TableCell>
                                                        <TableCell>{permission.pode_eliminar ? '✓' : '✗'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditDialog(permission, 'permission')}
                                                                >
                                                                    <PencilSimple size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(permission.id, 'permission')}
                                                                >
                                                                    <Trash size={16} />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        </TabsContent>

                        <TabsContent value="geral-estados" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Estados</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir os estados de atletas disponiveis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('athlete-status')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Estado
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Codigo</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Cor</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {athleteStatuses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                    Nenhum estado cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            athleteStatuses.map((status) => (
                                                <TableRow key={status.id}>
                                                    <TableCell className="font-medium">{status.codigo}</TableCell>
                                                    <TableCell>{status.nome}</TableCell>
                                                    <TableCell>
                                                        {status.cor && typeof status.cor === 'string' ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: status.cor }} />
                                                                {status.cor}
                                                            </span>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>{status.ativo ? 'Sim' : 'Nao'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(status, 'athlete-status')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(status.id, 'athlete-status')}
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

                        <TabsContent value="geral-motivos-ausencia" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Motivos de Ausência</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir os motivos de ausência disponiveis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('absence-reason')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Motivo
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Codigo</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Requer Justificação</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {absenceReasons.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                    Nenhum motivo cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            absenceReasons.map((reason) => (
                                                <TableRow key={reason.id}>
                                                    <TableCell className="font-medium">{reason.codigo}</TableCell>
                                                    <TableCell>{reason.nome}</TableCell>
                                                    <TableCell>{reason.requer_justificacao ? 'Sim' : 'Nao'}</TableCell>
                                                    <TableCell>{reason.ativo ? 'Sim' : 'Nao'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(reason, 'absence-reason')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(reason.id, 'absence-reason')}
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
                        </Tabs>
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
                                            <Label htmlFor="logo_url">Logotipo do Clube</Label>
                                            <input
                                                id="logo_url"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    clubForm.setData('logo', file);
                                                    if (file) {
                                                        setLogoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            {logoPreview && (
                                                <img
                                                    src={logoPreview}
                                                    alt="Logotipo do clube"
                                                    className="h-16 w-auto rounded-md border"
                                                />
                                            )}
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

                    {/* Tab: Financeiro */}
                    <TabsContent value="financeiro" className="mt-4 space-y-4">
                        <Tabs defaultValue="financeiro-mensalidades" className="space-y-4">
                            <TabsList className="w-full flex flex-wrap h-auto gap-1 justify-start">
                                <TabsTrigger value="financeiro-mensalidades">Mensalidades</TabsTrigger>
                                <TabsTrigger value="financeiro-tipos-fatura">Tipos de Fatura</TabsTrigger>
                                <TabsTrigger value="financeiro-centros-custos">Centros de Custos</TabsTrigger>
                            </TabsList>

                        <TabsContent value="financeiro-mensalidades" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Mensalidades</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir os valores das mensalidades por escalao
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('monthly-fee')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Mensalidade
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Escalao</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthlyFees.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Nenhuma mensalidade cadastrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            monthlyFees.map((fee) => {
                                                const ageGroup = ageGroups.find((group) => group.id === fee.age_group_id);
                                                return (
                                                    <TableRow key={fee.id}>
                                                        <TableCell className="font-medium">{fee.designacao}</TableCell>
                                                        <TableCell>{ageGroup?.nome || '-'}</TableCell>
                                                        <TableCell>€{toNumber(fee.valor).toFixed(2)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditDialog(fee, 'monthly-fee')}
                                                                >
                                                                    <PencilSimple size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(fee.id, 'monthly-fee')}
                                                                >
                                                                    <Trash size={16} />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        </TabsContent>

                        <TabsContent value="financeiro-tipos-fatura" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Tipos de Fatura</CardTitle>
                                <CardDescription className="text-sm">
                                    Definir os tipos disponiveis na criacao de faturas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('invoice-type')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Tipo
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Codigo</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoiceTypes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Nenhum tipo de fatura cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            invoiceTypes.map((type) => (
                                                <TableRow key={type.id}>
                                                    <TableCell className="font-medium">{type.nome}</TableCell>
                                                    <TableCell>{type.codigo}</TableCell>
                                                    <TableCell>{type.ativo ? 'Sim' : 'Nao'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(type, 'invoice-type')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(type.id, 'invoice-type')}
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

                        <TabsContent value="financeiro-centros-custos" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Centros de Custos</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir centros de custos para controlo financeiro
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('cost-center')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Centro de Custos
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Descricao</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {costCenters.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Nenhum centro de custos cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            costCenters.map((center) => (
                                                <TableRow key={center.id}>
                                                    <TableCell className="font-medium">{center.nome}</TableCell>
                                                    <TableCell>{center.tipo || '-'}</TableCell>
                                                    <TableCell>{center.descricao || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(center, 'cost-center')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(center.id, 'cost-center')}
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
                        </Tabs>
                    </TabsContent>

                    {/* Tab: Logistica */}
                    <TabsContent value="logistica" className="mt-4 space-y-4">
                        <Tabs defaultValue="logistica-artigos" className="space-y-4">
                            <TabsList className="w-full flex flex-wrap h-auto gap-1 justify-start">
                                <TabsTrigger value="logistica-artigos">Artigos</TabsTrigger>
                                <TabsTrigger value="logistica-categorias">Categorias de Itens</TabsTrigger>
                                <TabsTrigger value="logistica-fornecedores">Fornecedores</TabsTrigger>
                            </TabsList>

                        <TabsContent value="logistica-artigos" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Artigos</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir o catalogo de artigos do clube
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('product')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Artigo
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Codigo</TableHead>
                                            <TableHead>Imagem</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Preco</TableHead>
                                            <TableHead>Stock Mínimo</TableHead>
                                            <TableHead>Área de armazenamento</TableHead>
                                            <TableHead>Visível na Loja</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                                    Nenhum artigo cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.codigo}</TableCell>
                                                    <TableCell>
                                                        {product.imagem ? (
                                                            <img src={product.imagem} alt={product.nome} className="h-10 w-10 object-cover rounded" />
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{product.nome}</TableCell>
                                                    <TableCell>{product.categoria || '-'}</TableCell>
                                                    <TableCell>€{Number(product.preco).toFixed(2)}</TableCell>
                                                    <TableCell>{product.stock_minimo ?? 0}</TableCell>
                                                    <TableCell>{product.area_armazenamento || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.visible_in_store ? 'secondary' : 'outline'}>
                                                            {product.visible_in_store ? 'Sim' : 'Não'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.ativo ? 'secondary' : 'outline'}>
                                                            {product.ativo ? 'Sim' : 'Não'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(product, 'product')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(product.id, 'product')}
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

                        <TabsContent value="logistica-categorias" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Categorias de Itens</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir as categorias de itens do clube
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('item-category')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Categoria
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Codigo</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itemCategories.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Nenhuma categoria cadastrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            itemCategories.map((category) => (
                                                <TableRow key={category.id}>
                                                    <TableCell className="font-medium">{category.codigo}</TableCell>
                                                    <TableCell>{category.nome}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={category.ativo ? 'secondary' : 'outline'}>
                                                            {category.ativo ? 'Sim' : 'Não'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(category, 'item-category')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(category.id, 'item-category')}
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

                        <TabsContent value="logistica-fornecedores" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Fornecedores</CardTitle>
                                <CardDescription className="text-sm">
                                    Gerir fornecedores e parceiros do clube
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-3">
                                    <Button onClick={() => openAddDialog('supplier')} size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Fornecedor
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>NIF</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Telefone</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {suppliers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    Nenhum fornecedor cadastrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            suppliers.map((supplier) => (
                                                <TableRow key={supplier.id}>
                                                    <TableCell className="font-medium">{supplier.nome}</TableCell>
                                                    <TableCell>{supplier.nif || '-'}</TableCell>
                                                    <TableCell>{supplier.email || '-'}</TableCell>
                                                    <TableCell>{supplier.telefone || '-'}</TableCell>
                                                    <TableCell>{supplier.categoria || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(supplier, 'supplier')}
                                                            >
                                                                <PencilSimple size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(supplier.id, 'supplier')}
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
                        </Tabs>
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
                                        checked={notificationPrefs.email_notificacoes}
                                        onCheckedChange={() => handleNotificationToggle('email_notificacoes')}
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
                                        checked={notificationPrefs.alertas_pagamento}
                                        onCheckedChange={() => handleNotificationToggle('alertas_pagamento')}
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
                                        checked={notificationPrefs.alertas_atividade}
                                        onCheckedChange={() => handleNotificationToggle('alertas_atividade')}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Base de Dados */}
                    <TabsContent value="base-dados" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Utilizadores na Base de Dados</CardTitle>
                                <CardDescription>
                                    Verificação da persistência dos dados de utilizadores
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 mb-3">
                                    <Button onClick={handleExportUsers} variant="outline" size="sm">
                                        <FloppyDisk className="mr-2" size={16} />
                                        Exportar Utilizadores
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">
                                            Total de utilizadores: {users.length}
                                        </Label>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nº Sócio</TableHead>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Perfil</TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                        Nenhum utilizador encontrado na base de dados
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                users.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">{user.numero_socio || '-'}</TableCell>
                                                        <TableCell>{user.nome_completo || '-'}</TableCell>
                                                        <TableCell>{user.email_utilizador || '-'}</TableCell>
                                                        <TableCell>{user.perfil || '-'}</TableCell>
                                                        <TableCell>{user.estado || '-'}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="desportivo" className="mt-4 space-y-4">
                        <ConfiguracoesDesportivoIndex
                            athleteStatuses={athleteStatuses}
                            trainingTypes={trainingTypes}
                            trainingZones={trainingZones}
                            absenceReasons={absenceReasons}
                            injuryReasons={injuryReasons}
                            poolTypes={poolTypes}
                            ageGroups={ageGroups}
                            provaTipos={provaTipos}
                            embedded
                            showSummary={false}
                        />
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
                            {editingItem?.type === 'permission' && 'Permissão'}
                            {editingItem?.type === 'monthly-fee' && 'Mensalidade'}
                            {editingItem?.type === 'invoice-type' && 'Tipo de Fatura'}
                            {editingItem?.type === 'cost-center' && 'Centro de Custos'}
                            {editingItem?.type === 'product' && 'Artigo'}
                            {editingItem?.type === 'item-category' && 'Categoria de Item'}
                            {editingItem?.type === 'supplier' && 'Fornecedor'}
                            {editingItem?.type === 'prova-tipo' && 'Prova'}
                            {editingItem?.type === 'athlete-status' && 'Estado'}
                            {editingItem?.type === 'absence-reason' && 'Motivo de Ausência'}
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
                                        <Label htmlFor="nome">Nome do artigo *</Label>
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
                                        <Label>Cor</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={data.cor || '#000000'}
                                                onChange={e => setData('cor', e.target.value)}
                                                className="w-20 h-10 cursor-pointer"
                                            />
                                            <Input
                                                value={data.cor || ''}
                                                onChange={e => setData('cor', e.target.value)}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="icon">Ícone</Label>
                                        <Select
                                            value={data.icon || ''}
                                            onValueChange={(value) => setData('icon', value)}
                                        >
                                            <SelectTrigger id="icon">
                                                <SelectValue placeholder="Selecionar ícone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="medal">🏅 Medal</SelectItem>
                                                <SelectItem value="dumbbell">💪 Dumbbell</SelectItem>
                                                <SelectItem value="users">👥 Users</SelectItem>
                                                <SelectItem value="swimmer">🏊 Swimmer</SelectItem>
                                                <SelectItem value="target">🎯 Target</SelectItem>
                                                <SelectItem value="trophy">🏆 Trophy</SelectItem>
                                                <SelectItem value="star">⭐ Star</SelectItem>
                                                <SelectItem value="zap">⚡ Zap</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="visibilidade_default">Visibilidade Padrão</Label>
                                        <Select
                                            value={data.visibilidade_default || 'publico'}
                                            onValueChange={(value) => setData('visibilidade_default', value)}
                                        >
                                            <SelectTrigger id="visibilidade_default">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="publico">🌍 Público</SelectItem>
                                                <SelectItem value="restrito">🔒 Restrito</SelectItem>
                                                <SelectItem value="privado">🔐 Privado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-base font-semibold">Configurações</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="gera_taxa"
                                                    checked={data.gera_taxa ?? false}
                                                    onCheckedChange={checked => setData('gera_taxa', checked)}
                                                />
                                                <Label htmlFor="gera_taxa" className="font-normal cursor-pointer">Gera taxa de inscrição</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="permite_convocatoria"
                                                    checked={data.permite_convocatoria ?? false}
                                                    onCheckedChange={checked => setData('permite_convocatoria', checked)}
                                                />
                                                <Label htmlFor="permite_convocatoria" className="font-normal cursor-pointer">Permite convocatória</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="gera_presencas"
                                                    checked={data.gera_presencas ?? false}
                                                    onCheckedChange={checked => setData('gera_presencas', checked)}
                                                />
                                                <Label htmlFor="gera_presencas" className="font-normal cursor-pointer">Gera presenças</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="requer_transporte"
                                                    checked={data.requer_transporte ?? false}
                                                    onCheckedChange={checked => setData('requer_transporte', checked)}
                                                />
                                                <Label htmlFor="requer_transporte" className="font-normal cursor-pointer">Requer transporte</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-4 border-t">
                                        <Switch
                                            id="ativo"
                                            checked={data.ativo ?? true}
                                            onCheckedChange={checked => setData('ativo', checked)}
                                        />
                                        <Label htmlFor="ativo">Ativo</Label>
                                    </div>
                                </>
                            )}

                            {editingItem?.type === 'permission' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="user_type_id">Tipo de Utilizador *</Label>
                                        <Select
                                            value={data.user_type_id || ''}
                                            onValueChange={(value) => setData('user_type_id', value)}
                                        >
                                            <SelectTrigger id="user_type_id">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id}>
                                                        {type.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="modulo">Módulo *</Label>
                                        <Select
                                            value={getSelectValue(data.modulo, moduleOptions)}
                                            onValueChange={(value) => {
                                                if (value === customValue) {
                                                    setData('modulo', '');
                                                } else {
                                                    setData('modulo', value);
                                                }
                                                setData('submodulo', '');
                                                setData('separador', '');
                                                setData('campo', '');
                                            }}
                                        >
                                            <SelectTrigger id="modulo">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {moduleOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {getSelectValue(data.modulo, moduleOptions) === customValue && (
                                            <Input
                                                id="modulo_custom"
                                                value={data.modulo || ''}
                                                onChange={e => setData('modulo', e.target.value)}
                                                placeholder="Introduzir módulo"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="submodulo">Submódulo</Label>
                                        <Select
                                            value={getSelectValue(data.submodulo, submoduleOptions)}
                                            onValueChange={(value) => {
                                                if (value === customValue) {
                                                    setData('submodulo', '');
                                                } else {
                                                    setData('submodulo', value);
                                                }
                                                setData('separador', '');
                                                setData('campo', '');
                                            }}
                                            disabled={!data.modulo}
                                        >
                                            <SelectTrigger id="submodulo">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {submoduleOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {getSelectValue(data.submodulo, submoduleOptions) === customValue && (
                                            <Input
                                                id="submodulo_custom"
                                                value={data.submodulo || ''}
                                                onChange={e => setData('submodulo', e.target.value)}
                                                placeholder="ex: atletas, faturas"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="separador">Separador</Label>
                                        <Select
                                            value={getSelectValue(data.separador, separatorOptions)}
                                            onValueChange={(value) => {
                                                if (value === customValue) {
                                                    setData('separador', '');
                                                } else {
                                                    setData('separador', value);
                                                }
                                                setData('campo', '');
                                            }}
                                            disabled={!data.submodulo}
                                        >
                                            <SelectTrigger id="separador">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {separatorOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {getSelectValue(data.separador, separatorOptions) === customValue && (
                                            <Input
                                                id="separador_custom"
                                                value={data.separador || ''}
                                                onChange={e => setData('separador', e.target.value)}
                                                placeholder="ex: geral, financeiro"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="campo">Campo</Label>
                                        <Select
                                            value={getSelectValue(data.campo, fieldOptions)}
                                            onValueChange={(value) => {
                                                if (value === customValue) {
                                                    setData('campo', '');
                                                } else {
                                                    setData('campo', value);
                                                }
                                            }}
                                            disabled={!data.separador}
                                        >
                                            <SelectTrigger id="campo">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fieldOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {getSelectValue(data.campo, fieldOptions) === customValue && (
                                            <Input
                                                id="campo_custom"
                                                value={data.campo || ''}
                                                onChange={e => setData('campo', e.target.value)}
                                                placeholder="ex: email, valor"
                                            />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="pode_ver"
                                                checked={data.pode_ver ?? true}
                                                onCheckedChange={checked => setData('pode_ver', checked)}
                                            />
                                            <Label htmlFor="pode_ver">Ver</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="pode_criar"
                                                checked={data.pode_criar ?? false}
                                                onCheckedChange={checked => setData('pode_criar', checked)}
                                            />
                                            <Label htmlFor="pode_criar">Criar</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="pode_editar"
                                                checked={data.pode_editar ?? false}
                                                onCheckedChange={checked => setData('pode_editar', checked)}
                                            />
                                            <Label htmlFor="pode_editar">Editar</Label>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="pode_eliminar"
                                            checked={data.pode_eliminar ?? false}
                                            onCheckedChange={checked => setData('pode_eliminar', checked)}
                                        />
                                        <Label htmlFor="pode_eliminar">Eliminar</Label>
                                    </div>
                                </>
                            )}

                            {editingItem?.type === 'monthly-fee' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="designacao">Nome *</Label>
                                        <Input
                                            id="designacao"
                                            value={data.designacao || ''}
                                            onChange={e => setData('designacao', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="age_group_id">Escalão</Label>
                                        <Select
                                            value={data.age_group_id || ''}
                                            onValueChange={(value) => setData('age_group_id', value)}
                                        >
                                            <SelectTrigger id="age_group_id">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ageGroups.map((group) => (
                                                    <SelectItem key={group.id} value={group.id}>
                                                        {group.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="valor">Valor (€) *</Label>
                                        <Input
                                            id="valor"
                                            type="number"
                                            step="0.01"
                                            value={data.valor ?? ''}
                                            onChange={e => setData('valor', e.target.value ? parseFloat(e.target.value) : '')}
                                            required
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

                            {editingItem?.type === 'invoice-type' && (
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
                                        <Label htmlFor="codigo">Codigo</Label>
                                        <Input
                                            id="codigo"
                                            value={data.codigo || ''}
                                            onChange={e => setData('codigo', e.target.value)}
                                            placeholder="mensalidade"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="descricao">Descricao</Label>
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

                            {editingItem?.type === 'cost-center' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo">Codigo</Label>
                                        <Input
                                            id="codigo"
                                            value={data.codigo || ''}
                                            onChange={e => setData('codigo', e.target.value)}
                                            placeholder="CC-0001"
                                        />
                                    </div>
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
                                        <Label htmlFor="tipo">Tipo</Label>
                                        <Input
                                            id="tipo"
                                            value={data.tipo || ''}
                                            onChange={e => setData('tipo', e.target.value)}
                                            placeholder="departamento"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="descricao">Descricao</Label>
                                        <Textarea
                                            id="descricao"
                                            value={data.descricao || ''}
                                            onChange={e => setData('descricao', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="orcamento">Orcamento (€)</Label>
                                        <Input
                                            id="orcamento"
                                            type="number"
                                            step="0.01"
                                            value={data.orcamento ?? ''}
                                            onChange={e => setData('orcamento', e.target.value ? parseFloat(e.target.value) : '')}
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

                            {editingItem?.type === 'product' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo">Codigo *</Label>
                                        <Input
                                            id="codigo"
                                            value={data.codigo || ''}
                                            onChange={e => setData('codigo', e.target.value)}
                                            required
                                        />
                                    </div>
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
                                        <Label htmlFor="categoria">Categoria</Label>
                                        <Select
                                            value={data.categoria || ''}
                                            onValueChange={(value) => setData('categoria', value === '__none__' ? '' : value)}
                                        >
                                            <SelectTrigger id="categoria">
                                                <SelectValue placeholder="Selecionar categoria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__">— Sem categoria —</SelectItem>
                                                {itemCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.nome}>
                                                        {cat.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="preco">Preço de Venda (€) *</Label>
                                        <Input
                                            id="preco"
                                            type="number"
                                            step="0.01"
                                            value={data.preco ?? ''}
                                            onChange={e => setData('preco', e.target.value ? parseFloat(e.target.value) : '')}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                                        <Input
                                            id="stock_minimo"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={data.stock_minimo ?? 0}
                                            onChange={e => setData('stock_minimo', e.target.value ? parseInt(e.target.value, 10) : 0)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="area_armazenamento">Área de armazenamento</Label>
                                        <Input
                                            id="area_armazenamento"
                                            value={data.area_armazenamento || ''}
                                            onChange={e => setData('area_armazenamento', e.target.value)}
                                            placeholder="Ex: Prateleira A3"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="visible_in_store">Visível na Loja</Label>
                                        <Select
                                            value={(data.visible_in_store ?? false) ? 'sim' : 'nao'}
                                            onValueChange={(value) => setData('visible_in_store', value === 'sim')}
                                        >
                                            <SelectTrigger id="visible_in_store">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sim">Sim</SelectItem>
                                                <SelectItem value="nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ativo">Ativo</Label>
                                        <Select
                                            value={(data.ativo ?? true) ? 'sim' : 'nao'}
                                            onValueChange={(value) => setData('ativo', value === 'sim')}
                                        >
                                            <SelectTrigger id="ativo">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sim">Sim</SelectItem>
                                                <SelectItem value="nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                        <Label htmlFor="imagem_file">Imagem do Artigo</Label>
                                        <input
                                            id="imagem_file"
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setData('imagem_file', file);
                                                if (file) {
                                                    setProductImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                        {productImagePreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={productImagePreview}
                                                    alt="Preview"
                                                    className="h-24 w-24 object-cover rounded border"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {editingItem?.type === 'item-category' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo">Codigo *</Label>
                                        <Input
                                            id="codigo"
                                            value={data.codigo || ''}
                                            onChange={e => setData('codigo', e.target.value)}
                                            required
                                        />
                                    </div>
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
                                        <Label htmlFor="ativo">Ativo</Label>
                                        <Select
                                            value={(data.ativo ?? true) ? 'sim' : 'nao'}
                                            onValueChange={(value) => setData('ativo', value === 'sim')}
                                        >
                                            <SelectTrigger id="ativo">
                                                <SelectValue placeholder="Selecionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sim">Sim</SelectItem>
                                                <SelectItem value="nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {editingItem?.type === 'supplier' && (
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
                                        <Label htmlFor="nif">NIF</Label>
                                        <Input
                                            id="nif"
                                            value={data.nif || ''}
                                            onChange={e => setData('nif', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email || ''}
                                            onChange={e => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefone">Telefone</Label>
                                        <Input
                                            id="telefone"
                                            value={data.telefone || ''}
                                            onChange={e => setData('telefone', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="morada">Morada</Label>
                                        <Input
                                            id="morada"
                                            value={data.morada || ''}
                                            onChange={e => setData('morada', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="categoria">Categoria</Label>
                                        <Input
                                            id="categoria"
                                            value={data.categoria || ''}
                                            onChange={e => setData('categoria', e.target.value)}
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

                            {editingItem?.type === 'prova-tipo' && (
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
                                            <Label htmlFor="distancia">Distancia *</Label>
                                            <Input
                                                id="distancia"
                                                type="number"
                                                min="0"
                                                value={data.distancia ?? ''}
                                                onChange={e => setData('distancia', e.target.value ? parseInt(e.target.value, 10) : '')}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unidade">Unidade *</Label>
                                            <Select
                                                value={data.unidade || ''}
                                                onValueChange={(value) => setData('unidade', value)}
                                            >
                                                <SelectTrigger id="unidade">
                                                    <SelectValue placeholder="Selecionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="metros">Metros</SelectItem>
                                                    <SelectItem value="quilometros">Quilometros</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="modalidade">Modalidade *</Label>
                                        <Input
                                            id="modalidade"
                                            value={data.modalidade || ''}
                                            onChange={e => setData('modalidade', e.target.value)}
                                            required
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

                            {editingItem?.type === 'athlete-status' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo">Código *</Label>
                                        <Input
                                            id="codigo"
                                            value={data.codigo || ''}
                                            onChange={e => setData('codigo', e.target.value)}
                                            required
                                        />
                                    </div>
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
                                        <Label htmlFor="cor">Cor</Label>
                                        <Input
                                            id="cor"
                                            type="color"
                                            value={data.cor || '#6B7280'}
                                            onChange={e => setData('cor', e.target.value)}
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

                            {editingItem?.type === 'absence-reason' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo">Código *</Label>
                                        <Input
                                            id="codigo"
                                            value={data.codigo || ''}
                                            onChange={e => setData('codigo', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome *</Label>
                                        <Input
                                            id="nome"
                                            value={data.nome || ''}
                                            onChange={e => setData('nome', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="requer_justificacao"
                                            checked={data.requer_justificacao ?? false}
                                            onCheckedChange={checked => setData('requer_justificacao', checked)}
                                        />
                                        <Label htmlFor="requer_justificacao">Requer Justificação</Label>
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
