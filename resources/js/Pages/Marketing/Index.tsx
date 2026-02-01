import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { MegaphoneSimple, ShareNetwork, EnvelopeSimple, ChartLine, Plus, Pencil, Trash } from '@phosphor-icons/react';

interface Campaign {
    id: string;
    nome: string;
    descricao?: string;
    tipo: 'email' | 'redes_sociais' | 'evento' | 'outro';
    data_inicio: string;
    data_fim?: string;
    estado: 'planeada' | 'ativa' | 'concluida' | 'cancelada';
    orcamento?: number;
    alcance_estimado?: number;
    notas?: string;
}

interface Stats {
    total_campaigns: number;
    active_campaigns: number;
    budget_total: number;
    planned_campaigns: number;
    completed_campaigns: number;
}

interface Props {
    campaigns: {
        data: Campaign[];
    };
    stats: Stats;
    filters?: {
        tipo?: string;
        estado?: string;
        search?: string;
    };
}

export default function MarketingIndex({ campaigns, stats, filters }: Props) {
    const [showDialog, setShowDialog] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        tipo: 'email' as const,
        data_inicio: '',
        data_fim: '',
        estado: 'planeada' as const,
        orcamento: '',
        alcance_estimado: '',
        notas: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingCampaign) {
            router.put(`/marketing/${editingCampaign.id}`, formData, {
                onSuccess: () => {
                    setShowDialog(false);
                    setEditingCampaign(null);
                    resetForm();
                }
            });
        } else {
            router.post('/marketing', formData, {
                onSuccess: () => {
                    setShowDialog(false);
                    resetForm();
                }
            });
        }
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            nome: campaign.nome,
            descricao: campaign.descricao || '',
            tipo: campaign.tipo,
            data_inicio: campaign.data_inicio,
            data_fim: campaign.data_fim || '',
            estado: campaign.estado,
            orcamento: campaign.orcamento?.toString() || '',
            alcance_estimado: campaign.alcance_estimado?.toString() || '',
            notas: campaign.notas || '',
        });
        setShowDialog(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem a certeza que deseja eliminar esta campanha?')) {
            router.delete(`/marketing/${id}`);
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            tipo: 'email',
            data_inicio: '',
            data_fim: '',
            estado: 'planeada',
            orcamento: '',
            alcance_estimado: '',
            notas: '',
        });
    };

    const getTypeIcon = (tipo: string) => {
        switch (tipo) {
            case 'email': return <EnvelopeSimple className="text-purple-600" size={18} weight="bold" />;
            case 'redes_sociais': return <ShareNetwork className="text-green-600" size={18} weight="bold" />;
            case 'evento': return <MegaphoneSimple className="text-blue-600" size={18} weight="bold" />;
            default: return <ChartLine className="text-orange-600" size={18} weight="bold" />;
        }
    };

    const getTypeBgColor = (tipo: string) => {
        switch (tipo) {
            case 'email': return 'bg-purple-50';
            case 'redes_sociais': return 'bg-green-50';
            case 'evento': return 'bg-blue-50';
            default: return 'bg-orange-50';
        }
    };

    const getStatusBadge = (estado: string) => {
        const colors = {
            planeada: 'bg-gray-100 text-gray-800',
            ativa: 'bg-green-100 text-green-800',
            concluida: 'bg-blue-100 text-blue-800',
            cancelada: 'bg-red-100 text-red-800',
        };
        return colors[estado as keyof typeof colors] || colors.planeada;
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Comunicação</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Campanhas, redes sociais e comunicação com membros
                    </p>
                </div>
            }
        >
            <Head title="Marketing" />

            <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
                {/* Stats Cards */}
                <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                    <Card className="p-2.5 sm:p-3">
                        <div className="flex flex-col items-center text-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-blue-50">
                                <MegaphoneSimple className="text-blue-600" size={18} weight="bold" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xs sm:text-sm">Total Campanhas</h3>
                                <p className="text-lg font-bold mt-0.5">{stats.total_campaigns}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-2.5 sm:p-3">
                        <div className="flex flex-col items-center text-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-green-50">
                                <ShareNetwork className="text-green-600" size={18} weight="bold" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xs sm:text-sm">Campanhas Ativas</h3>
                                <p className="text-lg font-bold mt-0.5">{stats.active_campaigns}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-2.5 sm:p-3">
                        <div className="flex flex-col items-center text-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-purple-50">
                                <EnvelopeSimple className="text-purple-600" size={18} weight="bold" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xs sm:text-sm">Orçamento Total</h3>
                                <p className="text-lg font-bold mt-0.5">€{stats.budget_total.toFixed(2)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-2.5 sm:p-3">
                        <div className="flex flex-col items-center text-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-orange-50">
                                <ChartLine className="text-orange-600" size={18} weight="bold" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xs sm:text-sm">Concluídas</h3>
                                <p className="text-lg font-bold mt-0.5">{stats.completed_campaigns}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex justify-between items-center">
                    <h2 className="text-base sm:text-lg font-semibold">Campanhas</h2>
                    <Button onClick={() => {
                        setEditingCampaign(null);
                        resetForm();
                        setShowDialog(true);
                    }} size="sm">
                        <Plus size={16} className="mr-1" />
                        Nova Campanha
                    </Button>
                </div>

                {/* Campaigns List */}
                <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.data && campaigns.data.length > 0 ? (
                        campaigns.data.map((campaign) => (
                            <Card key={campaign.id} className="p-3 sm:p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`p-1.5 rounded-lg ${getTypeBgColor(campaign.tipo)}`}>
                                        {getTypeIcon(campaign.tipo)}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(campaign)}
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(campaign.id)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{campaign.nome}</h3>
                                {campaign.descricao && (
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                        {campaign.descricao}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`px-2 py-0.5 rounded-full ${getStatusBadge(campaign.estado)}`}>
                                        {campaign.estado}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {new Date(campaign.data_inicio).toLocaleDateString('pt-PT')}
                                    </span>
                                </div>
                                {campaign.orcamento && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Orçamento: €{campaign.orcamento.toFixed(2)}
                                    </p>
                                )}
                            </Card>
                        ))
                    ) : (
                        <Card className="p-4 sm:p-5 col-span-full">
                            <div className="text-center text-muted-foreground">
                                <MegaphoneSimple className="mx-auto mb-2" size={36} weight="thin" />
                                <p className="font-medium text-sm">Nenhuma campanha encontrada</p>
                                <p className="mt-0.5 text-xs">Crie a sua primeira campanha de marketing</p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Create/Edit Dialog */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="nome">Nome da Campanha</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="descricao">Descrição</Label>
                                <textarea
                                    id="descricao"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <select
                                        id="tipo"
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'email' | 'redes_sociais' | 'evento' | 'outro' })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="email">Email</option>
                                        <option value="redes_sociais">Redes Sociais</option>
                                        <option value="evento">Evento</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="estado">Estado</Label>
                                    <select
                                        id="estado"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'planeada' | 'ativa' | 'concluida' | 'cancelada' })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="planeada">Planeada</option>
                                        <option value="ativa">Ativa</option>
                                        <option value="concluida">Concluída</option>
                                        <option value="cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="data_inicio">Data Início</Label>
                                    <Input
                                        id="data_inicio"
                                        type="date"
                                        value={formData.data_inicio}
                                        onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="data_fim">Data Fim</Label>
                                    <Input
                                        id="data_fim"
                                        type="date"
                                        value={formData.data_fim}
                                        onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="orcamento">Orçamento (€)</Label>
                                    <Input
                                        id="orcamento"
                                        type="number"
                                        step="0.01"
                                        value={formData.orcamento}
                                        onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="alcance_estimado">Alcance Estimado</Label>
                                    <Input
                                        id="alcance_estimado"
                                        type="number"
                                        value={formData.alcance_estimado}
                                        onChange={(e) => setFormData({ ...formData, alcance_estimado: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notas">Notas</Label>
                                <textarea
                                    id="notas"
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={2}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingCampaign ? 'Atualizar' : 'Criar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
