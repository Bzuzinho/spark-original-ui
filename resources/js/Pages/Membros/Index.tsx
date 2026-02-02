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

interface User {
    id: string;
    numero_socio: string;
    nome_completo: string;
    email_utilizador?: string;
    foto_perfil?: string;
    estado: string;
    tipo_membro: string[];
}

interface Props {
    members: User[];
    userTypes: any[];
    ageGroups: any[];
}

export default function MembrosIndex({ members, userTypes, ageGroups }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

    const filteredUsers = useMemo(() => {
        return members.filter(user => {
            const matchesSearch = 
                user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.numero_socio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email_utilizador?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || user.estado === statusFilter;
            const matchesType = typeFilter === 'all' || user.tipo_membro.includes(typeFilter as any);
            
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [members, searchTerm, statusFilter, typeFilter]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
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
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Gestão de Membros
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {filteredUsers.length} de {members.length} membros
                    </p>
                </div>
            }
        >
            <Head title="Membros" />

            <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'card' ? 'default' : 'outline'}
                            size="sm"
                            className="h-8"
                            onClick={() => setViewMode('card')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            className="h-8"
                            onClick={() => setViewMode('table')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </Button>
                    </div>

                    <Link href={route('membros.create')}>
                        <Button size="sm" className="h-8 text-xs">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">Novo Membro</span>
                            <span className="sm:hidden">Novo</span>
                        </Button>
                    </Link>
                </div>

                <Card className="p-2 sm:p-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <Input
                                placeholder="Pesquisar por nome, nº sócio ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 h-8 text-xs"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
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
                            <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Tipos</SelectItem>
                                {userTypes && userTypes.length > 0 ? (
                                    userTypes.map((tipo) => {
                                        const typeMapping: Record<string, string> = {
                                            'Atleta': 'atleta',
                                            'Encarregado de Educação': 'encarregado_educacao',
                                            'Treinador': 'treinador',
                                            'Dirigente': 'dirigente',
                                            'Sócio': 'socio',
                                            'Funcionário': 'funcionario',
                                        };
                                        const tipoValue = typeMapping[tipo.name] || tipo.name.toLowerCase().replace(/\s+/g, '_');
                                        return (
                                            <SelectItem key={tipo.id} value={tipoValue}>
                                                {tipo.name}
                                            </SelectItem>
                                        );
                                    })
                                ) : null}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                {viewMode === 'card' ? (
                    <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers.map(user => (
                            <Link key={user.id} href={route('membros.show', user.id)}>
                                <Card className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                            <AvatarImage src={user.foto_perfil} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                                                {getInitials(getUserDisplayName(user))}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate">{getUserDisplayName(user)}</h3>
                                            <p className="text-xs text-muted-foreground">Nº {user.numero_socio}</p>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                <Badge variant="outline" className={`${getStatusColor(user.estado)} text-xs px-1.5 py-0`}>
                                                    {getStatusLabel(user.estado)}
                                                </Badge>
                                                {user.tipo_membro.slice(0, 2).map(type => (
                                                    <Badge key={type} variant="secondary" className="text-xs px-1.5 py-0">
                                                        {getMemberTypeLabel(type)}
                                                    </Badge>
                                                ))}
                                                {user.tipo_membro.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                        +{user.tipo_membro.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={(e) => handleDeleteClick(user, e)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Nº Sócio</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Tipo de Membro</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(user => (
                                    <TableRow 
                                        key={user.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(route('membros.show', user.id))}
                                    >
                                        <TableCell>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.foto_perfil} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {getInitials(getUserDisplayName(user))}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{getUserDisplayName(user)}</TableCell>
                                        <TableCell>{user.numero_socio}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email_utilizador || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${getStatusColor(user.estado)} text-xs`}>
                                                {getStatusLabel(user.estado)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.tipo_membro.slice(0, 2).map(type => (
                                                    <Badge key={type} variant="secondary" className="text-xs">
                                                        {getMemberTypeLabel(type)}
                                                    </Badge>
                                                ))}
                                                {user.tipo_membro.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{user.tipo_membro.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={(e) => handleDeleteClick(user, e)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}

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

                {filteredUsers.length === 0 && (
                    <Card className="p-8 sm:p-12">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="text-base font-semibold mb-1.5">Nenhum membro encontrado</h3>
                            <p className="text-muted-foreground mb-3 text-sm">
                                Tente ajustar os filtros ou criar um novo membro.
                            </p>
                            <Link href={route('membros.create')}>
                                <Button size="sm" className="h-8 text-xs">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Criar Primeiro Membro
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
