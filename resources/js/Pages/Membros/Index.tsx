import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { 
    getUserDisplayName, 
    getStatusColor, 
    getStatusLabel, 
    getMemberTypeLabel 
} from '@/lib/user-helpers';
import { PlusCircle, Search, Filter, Grid3x3, List, Trash2, Edit, Eye } from 'lucide-react';

interface User {
    id: string;
    numero_socio: string;
    nome_completo: string;
    email?: string;
    email_utilizador?: string;
    foto_perfil?: string;
    estado: string;
    tipo_membro: string[] | null;
    data_nascimento?: string;
    telefone?: string;
    telemovel?: string;
}

interface Props {
    members: User[];
    userTypes: any[];
    ageGroups: any[];
}

export default function MembrosIndex({ members = [], userTypes = [], ageGroups = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

    // ✅ CORRIGIDO: Safe navigation para evitar erro com null
    const filteredUsers = useMemo(() => {
        if (!Array.isArray(members)) return [];
        
        return members.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            
            // Safe string matching
            const matchesSearch = 
                (user.nome_completo?.toLowerCase() || '').includes(searchLower) ||
                (user.numero_socio?.toLowerCase() || '').includes(searchLower) ||
                (user.email_utilizador?.toLowerCase() || '').includes(searchLower) ||
                (user.email?.toLowerCase() || '').includes(searchLower);
            
            const matchesStatus = statusFilter === 'all' || user.estado === statusFilter;
            
            // Safe array check
            const userTypes = Array.isArray(user.tipo_membro) ? user.tipo_membro : [];
            const matchesType = typeFilter === 'all' || userTypes.includes(typeFilter);
            
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [members, searchTerm, statusFilter, typeFilter]);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const handleDeleteClick = (user: User, e: React.MouseEvent) => {
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
                },
                onError: (errors) => {
                    console.error('Erro ao deletar membro:', errors);
                }
            });
        }
    };

    const handleViewMember = (userId: string) => {
        router.get(route('membros.show', userId));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Gestão de Membros
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {filteredUsers.length} de {members.length} membros
                        </p>
                    </div>
                    <Link href={route('membros.create')}>
                        <Button className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Novo Membro
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Membros" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Filters */}
                    <Card className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, número de sócio ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os estados</SelectItem>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="suspenso">Suspenso</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type Filter */}
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os tipos</SelectItem>
                                    <SelectItem value="atleta">Atleta</SelectItem>
                                    <SelectItem value="encarregado_educacao">Encarregado</SelectItem>
                                    <SelectItem value="socio">Sócio</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex justify-end mt-4 gap-2">
                            <Button
                                variant={viewMode === 'card' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('card')}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>

                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="rounded-full bg-muted p-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Nenhum membro encontrado</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                            ? 'Tente ajustar os filtros de pesquisa'
                                            : 'Comece adicionando o primeiro membro'}
                                    </p>
                                </div>
                                {members.length === 0 && (
                                    <Link href={route('membros.create')}>
                                        <Button>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Adicionar Primeiro Membro
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Card View */}
                    {viewMode === 'card' && filteredUsers.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.map((user) => (
                                <Card
                                    key={user.id}
                                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => handleViewMember(user.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={user.foto_perfil} />
                                                <AvatarFallback>{getInitials(user.nome_completo)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{user.nome_completo || 'Sem nome'}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    #{user.numero_socio || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={getStatusColor(user.estado)}>
                                            {getStatusLabel(user.estado)}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {user.email_utilizador && (
                                            <p className="text-sm text-muted-foreground truncate">
                                                📧 {user.email_utilizador}
                                            </p>
                                        )}
                                        {Array.isArray(user.tipo_membro) && user.tipo_membro.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {user.tipo_membro.map((type, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {getMemberTypeLabel(type)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.get(route('membros.edit', user.id));
                                            }}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => handleDeleteClick(user, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Table View */}
                    {viewMode === 'table' && filteredUsers.length > 0 && (
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Membro</TableHead>
                                        <TableHead>Número Sócio</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleViewMember(user.id)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.foto_perfil} />
                                                        <AvatarFallback className="text-xs">
                                                            {getInitials(user.nome_completo)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">
                                                        {user.nome_completo || 'Sem nome'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.numero_socio || 'N/A'}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {user.email_utilizador || user.email || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(user.tipo_membro) && user.tipo_membro.slice(0, 2).map((type, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {getMemberTypeLabel(type)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusColor(user.estado)}>
                                                    {getStatusLabel(user.estado)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.get(route('membros.show', user.id));
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.get(route('membros.edit', user.id));
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => handleDeleteClick(user, e)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o membro <strong>{userToDelete?.nome_completo}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
