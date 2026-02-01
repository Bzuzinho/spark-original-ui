import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Plus, Handshake, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

interface Sponsor {
    id: string;
    nome: string;
    descricao: string | null;
    logo: string | null;
    website: string | null;
    contacto: string | null;
    email: string | null;
    tipo: 'principal' | 'secundario' | 'apoio';
    valor_anual: number | null;
    data_inicio: string;
    data_fim: string | null;
    estado: 'ativo' | 'inativo' | 'expirado';
    created_at: string;
    updated_at: string;
}

interface Props {
    sponsors: Sponsor[];
    stats: {
        total: number;
        ativos: number;
        valorTotal: number;
    };
    filters: {
        search?: string;
        tipo?: string;
        estado?: string;
    };
}

export default function Index({ sponsors, stats }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        tipo: 'secundario' as Sponsor['tipo'],
        data_inicio: format(new Date(), 'yyyy-MM-dd'),
        data_fim: '',
        valor_anual: '',
        contacto: '',
        email: '',
        website: '',
        estado: 'ativo' as Sponsor['estado'],
    });

    const handleOpenDialog = (sponsor?: Sponsor) => {
        if (sponsor) {
            setEditingSponsor(sponsor);
            setFormData({
                nome: sponsor.nome,
                descricao: sponsor.descricao || '',
                tipo: sponsor.tipo,
                data_inicio: sponsor.data_inicio,
                data_fim: sponsor.data_fim || '',
                valor_anual: sponsor.valor_anual?.toString() || '',
                contacto: sponsor.contacto || '',
                email: sponsor.email || '',
                website: sponsor.website || '',
                estado: sponsor.estado,
            });
        } else {
            setEditingSponsor(null);
            resetForm();
        }
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.nome.trim()) {
            toast.error('Nome é obrigatório');
            return;
        }

        const data = {
            ...formData,
            valor_anual: formData.valor_anual ? parseFloat(formData.valor_anual) : null,
            data_fim: formData.data_fim || null,
            descricao: formData.descricao || null,
            contacto: formData.contacto || null,
            email: formData.email || null,
            website: formData.website || null,
        };

        if (editingSponsor) {
            router.put(`/patrocinios/${editingSponsor.id}`, data, {
                onSuccess: () => {
                    toast.success('Patrocinador atualizado com sucesso!');
                    setDialogOpen(false);
                    resetForm();
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Erro ao atualizar patrocinador');
                }
            });
        } else {
            router.post('/patrocinios', data, {
                onSuccess: () => {
                    toast.success('Patrocinador criado com sucesso!');
                    setDialogOpen(false);
                    resetForm();
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Erro ao criar patrocinador');
                }
            });
        }
    };

    const handleDelete = (sponsor: Sponsor) => {
        if (confirm(`Tem certeza que deseja eliminar ${sponsor.nome}?`)) {
            router.delete(`/patrocinios/${sponsor.id}`, {
                onSuccess: () => {
                    toast.success('Patrocinador eliminado com sucesso!');
                },
                onError: () => {
                    toast.error('Erro ao eliminar patrocinador');
                }
            });
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            tipo: 'secundario',
            data_inicio: format(new Date(), 'yyyy-MM-dd'),
            data_fim: '',
            valor_anual: '',
            contacto: '',
            email: '',
            website: '',
            estado: 'ativo',
        });
        setEditingSponsor(null);
    };

    const getTipoColor = (tipo: Sponsor['tipo']) => {
        switch (tipo) {
            case 'principal': return 'bg-purple-100 text-purple-800';
            case 'secundario': return 'bg-blue-100 text-blue-800';
            case 'apoio': return 'bg-green-100 text-green-800';
        }
    };

    const getEstadoBadge = (estado: Sponsor['estado']) => {
        switch (estado) {
            case 'ativo': return <Badge variant="default" className="text-xs">Ativo</Badge>;
            case 'inativo': return <Badge variant="secondary" className="text-xs">Inativo</Badge>;
            case 'expirado': return <Badge variant="destructive" className="text-xs">Expirado</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Patrocínios</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">Gestão de patrocinadores e parcerias</p>
                </div>
            }
        >
            <Head title="Patrocínios" />
            
            <div className="w-full px-2 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
                {/* Stats cards */}
                <div className="grid gap-2 grid-cols-2 lg:grid-cols-3">
                    <Card className="p-2 sm:p-3">
                        <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground font-medium leading-tight">Total Patrocinadores</p>
                                <p className="text-base sm:text-xl font-bold mt-0.5">{stats.total}</p>
                            </div>
                            <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                                <Handshake className="text-blue-600" size={16} weight="bold" />
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-2 sm:p-3">
                        <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground font-medium leading-tight">Ativos</p>
                                <p className="text-base sm:text-xl font-bold mt-0.5">{stats.ativos}</p>
                            </div>
                            <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
                                <Handshake className="text-green-600" size={16} weight="bold" />
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-2 sm:p-3 col-span-2 lg:col-span-1">
                        <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground font-medium leading-tight">Valor Total Anual</p>
                                <p className="text-base sm:text-xl font-bold mt-0.5">
                                    €{(stats.valorTotal || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="p-1.5 rounded-lg bg-purple-50 flex-shrink-0">
                                <Handshake className="text-purple-600" size={16} weight="bold" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Header with button */}
                <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                            {sponsors.length} patrocinador{sponsors.length !== 1 ? 'es' : ''}
                        </h2>
                    </div>
                    
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()} className="h-8 text-xs">
                                <Plus className="mr-1.5 sm:mr-2" size={16} />
                                <span className="hidden sm:inline">Novo Patrocinador</span>
                                <span className="sm:hidden">Novo</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingSponsor ? 'Editar Patrocinador' : 'Novo Patrocinador'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome *</Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        placeholder="Nome do patrocinador"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Input
                                        id="descricao"
                                        value={formData.descricao}
                                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                        placeholder="Descrição breve"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo *</Label>
                                    <Select
                                        value={formData.tipo}
                                        onValueChange={(value) => setFormData({ ...formData, tipo: value as Sponsor['tipo'] })}
                                    >
                                        <SelectTrigger id="tipo">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="principal">Principal</SelectItem>
                                            <SelectItem value="secundario">Secundário</SelectItem>
                                            <SelectItem value="apoio">Apoio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Início do Contrato *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    {format(new Date(formData.data_inicio), 'PPP', { locale: pt })}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={new Date(formData.data_inicio)}
                                                    onSelect={(date) => setFormData({ ...formData, data_inicio: date ? format(date, 'yyyy-MM-dd') : '' })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fim do Contrato</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    {formData.data_fim 
                                                        ? format(new Date(formData.data_fim), 'PPP', { locale: pt })
                                                        : 'Sem data definida'
                                                    }
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.data_fim ? new Date(formData.data_fim) : undefined}
                                                    onSelect={(date) => setFormData({ ...formData, data_fim: date ? format(date, 'yyyy-MM-dd') : '' })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="valor_anual">Valor Anual (€)</Label>
                                    <Input
                                        id="valor_anual"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.valor_anual}
                                        onChange={(e) => setFormData({ ...formData, valor_anual: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado *</Label>
                                    <Select
                                        value={formData.estado}
                                        onValueChange={(value) => setFormData({ ...formData, estado: value as Sponsor['estado'] })}
                                    >
                                        <SelectTrigger id="estado">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="expirado">Expirado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Dados de Contacto</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="email@exemplo.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contacto">Telefone</Label>
                                            <Input
                                                id="contacto"
                                                value={formData.contacto}
                                                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                                placeholder="+351 000 000 000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="https://exemplo.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                    <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSubmit}>
                                        {editingSponsor ? 'Atualizar' : 'Adicionar'} Patrocinador
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Sponsors grid */}
                <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {sponsors.map(sponsor => (
                        <Card key={sponsor.id} className="p-2.5 sm:p-3 transition-all hover:shadow-md relative group">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 flex-1">{sponsor.nome}</h3>
                                    <Badge className={`${getTipoColor(sponsor.tipo)} text-xs flex-shrink-0`}>
                                        {sponsor.tipo}
                                    </Badge>
                                </div>

                                {sponsor.descricao && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{sponsor.descricao}</p>
                                )}

                                {sponsor.valor_anual && (
                                    <div className="text-lg sm:text-xl font-bold text-primary">
                                        €{sponsor.valor_anual.toFixed(2)}/ano
                                    </div>
                                )}

                                <div className="space-y-0.5 text-xs text-muted-foreground">
                                    <p className="truncate">Início: {format(new Date(sponsor.data_inicio), 'PPP', { locale: pt })}</p>
                                    {sponsor.data_fim && (
                                        <p className="truncate">Fim: {format(new Date(sponsor.data_fim), 'PPP', { locale: pt })}</p>
                                    )}
                                </div>

                                {(sponsor.contacto || sponsor.email || sponsor.website) && (
                                    <div className="border-t pt-1.5 space-y-0.5 text-xs">
                                        {sponsor.email && <p className="text-muted-foreground truncate">{sponsor.email}</p>}
                                        {sponsor.contacto && <p className="text-muted-foreground truncate">{sponsor.contacto}</p>}
                                        {sponsor.website && (
                                            <a 
                                                href={sponsor.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline truncate block"
                                            >
                                                {sponsor.website}
                                            </a>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                    {getEstadoBadge(sponsor.estado)}
                                    
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => handleOpenDialog(sponsor)}
                                        >
                                            Editar
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-7 px-2 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(sponsor)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {sponsors.length === 0 && (
                    <Card className="p-6 sm:p-8">
                        <div className="text-center">
                            <Handshake className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
                            <h3 className="font-semibold text-sm mb-0.5">Nenhum patrocinador registado</h3>
                            <p className="text-muted-foreground text-xs">
                                Adicione os seus patrocinadores e gerencie os contratos.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
