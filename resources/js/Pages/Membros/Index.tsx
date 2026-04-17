import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { moduleTabbedContentClass, moduleTabsClass, moduleViewportClass } from '@/lib/module-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ChartLineUp, Users as UsersIcon, Plus, SquaresFour, ListBullets, Trash } from '@phosphor-icons/react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import MembrosDashboard from './Dashboard';
import { 
    getStatusColor, 
    getStatusLabel, 
    getMemberTypeLabel 
} from '@/lib/user-helpers';

interface User {
    id: string;
    numero_socio: string;
    nome_completo: string;
    email_utilizador?: string;
    foto_perfil?: string;
    estado: string;
    tipo_membro: string[];
}

interface PaginatedMembers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Stats {
    totalMembros: number;
    membrosAtivos?: number;
    membrosInativos?: number;
    totalAtletas?: number;
    atletasAtivos?: number;
    encarregados?: number;
    treinadores?: number;
    novosUltimos30Dias?: number;
    atestadosACaducar?: number;
}

interface TipoStat {
    tipo: string;
    count: number;
}

interface EscalaoStat {
    escalao: string;
    count: number;
}

interface Props {
    members: PaginatedMembers | null;
    userTypes: any[];
    ageGroups: any[];
    stats: Stats;
    tipoMembrosStats: TipoStat[];
    escaloesStats: EscalaoStat[];
    communicationState?: {
        initialTab?: string;
    };
}

export default function MembrosIndex({ members, userTypes, ageGroups, stats, tipoMembrosStats, escaloesStats, communicationState }: Props) {
    const getUrlParam = (key: string) => {
        if (typeof window === 'undefined') return '';
        return new URLSearchParams(window.location.search).get(key) ?? '';
    };

    const [activeTab, setActiveTab] = useState(() => communicationState?.initialTab || 'dashboard');
    const [searchTerm, setSearchTerm] = useState(() => getUrlParam('q'));
    const [statusFilter, setStatusFilter] = useState<string>(() => getUrlParam('estado') || 'all');
    const [typeFilter, setTypeFilter] = useState<string>(() => getUrlParam('tipo') || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const isFirstListRender = useRef(true);

    // Debounced server-side filter for the list tab
    useEffect(() => {
        if (activeTab !== 'list') return;
        if (isFirstListRender.current) {
            isFirstListRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(
                route('membros.index'),
                {
                    tab: 'list',
                    q: searchTerm || undefined,
                    estado: statusFilter !== 'all' ? statusFilter : undefined,
                    tipo: typeFilter !== 'all' ? typeFilter : undefined,
                },
                { preserveState: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, typeFilter]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        isFirstListRender.current = true;
        setSearchTerm('');
        setStatusFilter('all');
        setTypeFilter('all');
        router.get(
            route('membros.index'),
            { tab: value },
            { preserveState: false, replace: true }
        );
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const handleDeleteClick = (user: User, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('membros.destroy', userToDelete.id), {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    const displayedMembers = members?.data ?? [];
    const totalFiltered = members?.total ?? 0;
    const totalMembros = stats?.totalMembros ?? 0;

    return (
        <AuthenticatedLayout
            fullWidth
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Membros</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Visão geral e gestão de todos os membros do clube
                    </p>
                </div>
            }
        >
            <Head title="Membros" />

            <div className={moduleViewportClass}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className={moduleTabsClass}>
                <TabsList className="grid w-full shrink-0 grid-cols-2 h-auto">
                    <TabsTrigger value="dashboard" className="flex items-center gap-1.5 py-1.5 text-xs">
                        <ChartLineUp size={14} weight="duotone" />
                        <span>Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-1.5 py-1.5 text-xs">
                        <UsersIcon size={14} weight="duotone" />
                        <span>Lista de Membros</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className={moduleTabbedContentClass}>
                    <MembrosDashboard 
                        stats={{
                            totalMembros: stats?.totalMembros ?? 0,
                            membrosAtivos: stats?.membrosAtivos ?? 0,
                            membrosInativos: stats?.membrosInativos ?? 0,
                            totalAtletas: stats?.totalAtletas ?? 0,
                            atletasAtivos: stats?.atletasAtivos ?? 0,
                            encarregados: stats?.encarregados ?? 0,
                            treinadores: stats?.treinadores ?? 0,
                            novosUltimos30Dias: stats?.novosUltimos30Dias ?? 0,
                            atestadosACaducar: stats?.atestadosACaducar ?? 0,
                        }}
                        tipoMembrosStats={tipoMembrosStats} 
                        escaloesStats={escaloesStats} 
                    />
                </TabsContent>

                <TabsContent value="list" className={`${moduleTabbedContentClass} space-y-2.5`}>
                    {/* Header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {members ? `${totalFiltered} de ${totalMembros} membros` : `${totalMembros} membros`}
                        </p>
                        
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant={viewMode === 'card' ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('card')}
                            >
                                <SquaresFour size={14} weight={viewMode === 'card' ? 'fill' : 'regular'} />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('table')}
                            >
                                <ListBullets size={14} weight={viewMode === 'table' ? 'fill' : 'regular'} />
                            </Button>
                            <Link href={route('membros.create')}>
                                <Button size="sm" className="h-8 text-xs">
                                    <Plus size={14} weight="bold" className="mr-1" />
                                    Novo Membro
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="p-2.5">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Pesquisar por nome, nº sócio ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-8 text-[11px]"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] h-8 text-[11px]">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Estados</SelectItem>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="suspenso">Suspenso</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] h-8 text-[11px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Tipos</SelectItem>
                                    {userTypes && userTypes.length > 0 ? (
                                        userTypes.map((tipo: any) => {
                                            const typeMapping: Record<string, string> = {
                                                'Atleta': 'atleta',
                                                'Encarregado de Educação': 'encarregado_educacao',
                                                'Treinador': 'treinador',
                                                'Dirigente': 'dirigente',
                                                'Sócio': 'socio',
                                                'Funcionário': 'funcionario',
                                            };
                                            const tipoNome = tipo?.nome || '';
                                            const tipoValue = tipo?.codigo || typeMapping[tipoNome] || tipoNome.toLowerCase().replace(/\s+/g, '_').replace(/ç/g, 'c').replace(/ã/g, 'a');
                                            return (
                                                <SelectItem key={tipo.id} value={tipoValue}>
                                                    {tipoNome}
                                                </SelectItem>
                                            );
                                        })
                                    ) : null}
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>

                    {/* Members View */}
                    {displayedMembers.length > 0 ? (
                        viewMode === 'card' ? (
                            <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                                {displayedMembers.map(user => (
                                    <Link key={user.id} href={route('membros.show', user.id)}>
                                        <Card className="p-2.5 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                                            <div className="flex items-start gap-2">
                                                <Avatar className="h-9 w-9 flex-shrink-0">
                                                    <AvatarImage src={user.foto_perfil} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                                                        {getInitials(user.nome_completo)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-[13px] truncate">{user.nome_completo || 'Sem nome'}</h3>
                                                    <p className="text-[10px] text-muted-foreground">Nº {user.numero_socio || '-'}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        <Badge variant="outline" className={`${getStatusColor(user.estado)} text-[10px] px-1.5 py-0`}>
                                                            {getStatusLabel(user.estado)}
                                                        </Badge>
                                                        {Array.isArray(user.tipo_membro) && user.tipo_membro.slice(0, 2).map((type, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                {getMemberTypeLabel(type)}
                                                            </Badge>
                                                        ))}
                                                        {Array.isArray(user.tipo_membro) && user.tipo_membro.length > 2 && (
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                +{user.tipo_membro.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={(e) => handleDeleteClick(user, e)}
                                                    >
                                                        <Trash size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-0 overflow-hidden">
                                <div className="w-full overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Nº Sócio</TableHead>
                                                <TableHead className="flex-1 min-w-[200px]">Nome</TableHead>
                                                <TableHead className="hidden md:table-cell min-w-[180px]">Email</TableHead>
                                                <TableHead className="hidden lg:table-cell w-24">Estado</TableHead>
                                                <TableHead className="hidden xl:table-cell flex-1 min-w-[180px]">Tipo</TableHead>
                                                <TableHead className="w-20 text-right">Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {displayedMembers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="text-xs font-medium">{user.numero_socio || '-'}</TableCell>
                                                    <TableCell className="max-w-[200px]">
                                                        <Link href={route('membros.show', user.id)} className="font-medium hover:underline truncate block">
                                                            {user.nome_completo || 'Sem nome'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[180px] truncate">{user.email_utilizador || '-'}</TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        <Badge variant="outline" className={`${getStatusColor(user.estado)} text-[10px] px-1.5 py-0`}>
                                                            {getStatusLabel(user.estado)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden xl:table-cell">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Array.isArray(user.tipo_membro) && user.tipo_membro.length > 0 ? (
                                                                user.tipo_membro.slice(0, 2).map((type, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                        {getMemberTypeLabel(type)}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            )}
                                                            {Array.isArray(user.tipo_membro) && user.tipo_membro.length > 2 && (
                                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                    +{user.tipo_membro.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={route('membros.show', user.id)}>
                                                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">Ver</Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={(e) => handleDeleteClick(user, e)}
                                                            >
                                                                <Trash size={14} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        )
                    ) : (
                        <Card className="p-8">
                            <div className="text-center">
                                <UsersIcon size={40} className="mx-auto text-muted-foreground mb-3" weight="duotone" />
                                <h3 className="text-base font-semibold mb-1.5">Nenhum membro encontrado</h3>
                                <p className="text-muted-foreground mb-3 text-xs">
                                    Tente ajustar os filtros ou criar um novo membro.
                                </p>
                                <Link href={route('membros.create')}>
                                    <Button size="sm" className="h-8 text-xs">
                                        <Plus size={14} weight="bold" className="mr-1.5" />
                                        Criar Primeiro Membro
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )}

                    {/* Pagination */}
                    {members && members.last_page > 1 && (
                        <div className="flex items-center justify-center gap-1 pt-1">
                            {members.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 min-w-[28px] px-2 text-xs"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url);
                                            const params = Object.fromEntries(url.searchParams.entries());
                                            router.get(route('membros.index'), params, { preserveState: true, replace: true });
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

            </Tabs>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que deseja apagar o membro <strong>{userToDelete?.nome_completo}</strong>?
                            Esta ação não pode ser revertida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Apagar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </AuthenticatedLayout>
    );
}
