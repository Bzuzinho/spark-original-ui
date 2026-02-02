import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import StatsCard from '@/Components/StatsCard';
import { 
    Envelope, 
    Clock, 
    CheckCircle, 
    Plus, 
    Eye, 
    Trash, 
    PaperPlaneRight,
    CalendarBlank
} from '@phosphor-icons/react';

interface Communication {
    id: string;
    assunto: string;
    mensagem: string;
    tipo: 'email' | 'sms' | 'notificacao' | 'aviso';
    destinatarios: string[];
    estado: 'rascunho' | 'agendada' | 'enviada' | 'falhou';
    agendado_para: string | null;
    enviado_em: string | null;
    total_enviados: number;
    total_falhados: number;
    created_at: string;
}

interface Props {
    communications: {
        data: Communication[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        totalCommunications: number;
        scheduledCount: number;
        sentToday: number;
        totalSent: number;
        successRate: number;
    };
}

export default function ComunicacaoIndex({ communications, stats }: Props) {
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
    const [isScheduled, setIsScheduled] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        assunto: '',
        mensagem: '',
        tipo: 'email' as 'email' | 'sms' | 'notificacao' | 'aviso',
        destinatarios: [] as string[],
        agendado_para: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('communication.store'), {
            onSuccess: () => {
                reset();
                setShowNewDialog(false);
                setIsScheduled(false);
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem a certeza que deseja eliminar esta comunicação?')) {
            router.delete(route('communication.destroy', id));
        }
    };

    const handleSend = (id: string) => {
        if (confirm('Tem a certeza que deseja enviar esta comunicação agora?')) {
            router.post(route('communication.send', id), {
                send_now: true
            });
        }
    };

    const getEstadoBadge = (estado: Communication['estado']) => {
        const badges = {
            rascunho: <Badge variant="outline">Rascunho</Badge>,
            agendada: <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>,
            enviada: <Badge className="bg-green-100 text-green-800">Enviada</Badge>,
            falhou: <Badge variant="destructive">Falhou</Badge>,
        };
        return badges[estado];
    };

    const getTipoLabel = (tipo: Communication['tipo']) => {
        const labels = {
            email: 'Email',
            sms: 'SMS',
            notificacao: 'Notificação',
            aviso: 'Aviso',
        };
        return labels[tipo];
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Comunicação
                </h1>
            }
        >
            <Head title="Comunicação" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Comunicações"
                        value={stats.totalCommunications}
                        icon={Envelope}
                        iconBgColor="#E3F2FD"
                        iconColor="#1976D2"
                    />
                    <StatsCard
                        title="Agendadas"
                        value={stats.scheduledCount}
                        icon={Clock}
                        iconBgColor="#FFF3E0"
                        iconColor="#F57C00"
                    />
                    <StatsCard
                        title="Enviadas Hoje"
                        value={stats.sentToday}
                        icon={PaperPlaneRight}
                        iconBgColor="#E8F5E9"
                        iconColor="#388E3C"
                    />
                    <StatsCard
                        title="Taxa Sucesso"
                        value={`${stats.successRate}%`}
                        icon={CheckCircle}
                        iconBgColor="#F3E5F5"
                        iconColor="#7B1FA2"
                    />
                </div>

                <Tabs defaultValue="all" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <TabsList>
                            <TabsTrigger value="all">
                                <Envelope className="mr-2" size={16} />
                                Todas
                            </TabsTrigger>
                            <TabsTrigger value="scheduled">
                                <Clock className="mr-2" size={16} />
                                Agendadas
                            </TabsTrigger>
                            <TabsTrigger value="sent">
                                <CheckCircle className="mr-2" size={16} />
                                Enviadas
                            </TabsTrigger>
                        </TabsList>
                        <Button onClick={() => setShowNewDialog(true)}>
                            <Plus className="mr-2" size={16} />
                            Nova Comunicação
                        </Button>
                    </div>

                    <TabsContent value="all">
                        <Card>
                            <CardHeader>
                                <CardTitle>Todas as Comunicações</CardTitle>
                                <CardDescription>
                                    Gestão de todas as comunicações do clube
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Assunto</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Destinatários</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {communications.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                    Nenhuma comunicação encontrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            communications.data.map((com) => (
                                                <TableRow key={com.id}>
                                                    <TableCell className="font-medium">{com.assunto}</TableCell>
                                                    <TableCell>{getTipoLabel(com.tipo)}</TableCell>
                                                    <TableCell>{com.destinatarios.length} pessoas</TableCell>
                                                    <TableCell>{getEstadoBadge(com.estado)}</TableCell>
                                                    <TableCell>
                                                        {com.enviado_em 
                                                            ? new Date(com.enviado_em).toLocaleDateString('pt-PT')
                                                            : com.agendado_para 
                                                            ? new Date(com.agendado_para).toLocaleDateString('pt-PT')
                                                            : new Date(com.created_at).toLocaleDateString('pt-PT')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCommunication(com);
                                                                    setShowViewDialog(true);
                                                                }}
                                                            >
                                                                <Eye size={16} />
                                                            </Button>
                                                            {com.estado === 'agendada' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleSend(com.id)}
                                                                >
                                                                    <PaperPlaneRight size={16} />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(com.id)}
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

                    <TabsContent value="scheduled">
                        <Card>
                            <CardHeader>
                                <CardTitle>Comunicações Agendadas</CardTitle>
                                <CardDescription>
                                    Comunicações que serão enviadas automaticamente na data programada
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Assunto</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Destinatários</TableHead>
                                            <TableHead>Data Agendada</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {communications.data.filter(c => c.estado === 'agendada').length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    Nenhuma comunicação agendada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            communications.data
                                                .filter(c => c.estado === 'agendada')
                                                .map((com) => (
                                                    <TableRow key={com.id}>
                                                        <TableCell className="font-medium">{com.assunto}</TableCell>
                                                        <TableCell>{getTipoLabel(com.tipo)}</TableCell>
                                                        <TableCell>{com.destinatarios.length} pessoas</TableCell>
                                                        <TableCell>
                                                            {com.agendado_para && new Date(com.agendado_para).toLocaleString('pt-PT')}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedCommunication(com);
                                                                        setShowViewDialog(true);
                                                                    }}
                                                                >
                                                                    <Eye size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleSend(com.id)}
                                                                >
                                                                    <PaperPlaneRight size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(com.id)}
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

                    <TabsContent value="sent">
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico de Envios</CardTitle>
                                <CardDescription>
                                    Comunicações enviadas e seu estado de entrega
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Assunto</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Enviados</TableHead>
                                            <TableHead>Falhados</TableHead>
                                            <TableHead>Data Envio</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {communications.data.filter(c => c.estado === 'enviada' || c.estado === 'falhou').length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                    Nenhuma comunicação enviada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            communications.data
                                                .filter(c => c.estado === 'enviada' || c.estado === 'falhou')
                                                .map((com) => (
                                                    <TableRow key={com.id}>
                                                        <TableCell className="font-medium">{com.assunto}</TableCell>
                                                        <TableCell>{getTipoLabel(com.tipo)}</TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-green-100 text-green-800">
                                                                {com.total_enviados}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {com.total_falhados > 0 && (
                                                                <Badge variant="destructive">
                                                                    {com.total_falhados}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {com.enviado_em && new Date(com.enviado_em).toLocaleString('pt-PT')}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCommunication(com);
                                                                    setShowViewDialog(true);
                                                                }}
                                                            >
                                                                <Eye size={16} />
                                                            </Button>
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
            </div>

            {/* Create New Communication Dialog */}
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nova Comunicação</DialogTitle>
                        <DialogDescription>
                            Crie uma nova comunicação para enviar aos membros do clube
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="assunto">Assunto *</Label>
                                <Input
                                    id="assunto"
                                    value={data.assunto}
                                    onChange={(e) => setData('assunto', e.target.value)}
                                    placeholder="Assunto da comunicação"
                                    required
                                />
                                {errors.assunto && (
                                    <p className="text-sm text-red-600 mt-1">{errors.assunto}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="mensagem">Mensagem *</Label>
                                <Textarea
                                    id="mensagem"
                                    value={data.mensagem}
                                    onChange={(e) => setData('mensagem', e.target.value)}
                                    placeholder="Escreva a sua mensagem aqui..."
                                    rows={6}
                                    required
                                />
                                {errors.mensagem && (
                                    <p className="text-sm text-red-600 mt-1">{errors.mensagem}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="tipo">Tipo *</Label>
                                <select
                                    id="tipo"
                                    value={data.tipo}
                                    onChange={(e) => setData('tipo', e.target.value as any)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="email">Email</option>
                                    <option value="sms">SMS</option>
                                    <option value="notificacao">Notificação</option>
                                    <option value="aviso">Aviso</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="destinatarios">Destinatários (IDs separados por vírgula) *</Label>
                                <Input
                                    id="destinatarios"
                                    value={data.destinatarios.join(',')}
                                    onChange={(e) => setData('destinatarios', e.target.value.split(',').filter(Boolean))}
                                    placeholder="user-id-1,user-id-2,user-id-3"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Nota: Na implementação final, isto será um seletor de membros
                                </p>
                                {errors.destinatarios && (
                                    <p className="text-sm text-red-600 mt-1">{errors.destinatarios}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="agendar"
                                        checked={isScheduled}
                                        onChange={(e) => setIsScheduled(e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="agendar">Agendar envio</Label>
                                </div>

                                {isScheduled && (
                                    <div className="flex-1">
                                        <Input
                                            type="datetime-local"
                                            value={data.agendado_para}
                                            onChange={(e) => setData('agendado_para', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setShowNewDialog(false);
                                    reset();
                                    setIsScheduled(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {isScheduled ? (
                                    <>
                                        <CalendarBlank className="mr-2" size={16} />
                                        Agendar
                                    </>
                                ) : (
                                    <>
                                        <PaperPlaneRight className="mr-2" size={16} />
                                        Enviar Agora
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Communication Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Comunicação</DialogTitle>
                    </DialogHeader>

                    {selectedCommunication && (
                        <div className="space-y-4">
                            <div>
                                <Label className="font-semibold">Assunto</Label>
                                <p className="mt-1">{selectedCommunication.assunto}</p>
                            </div>

                            <div>
                                <Label className="font-semibold">Mensagem</Label>
                                <div className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                                    {selectedCommunication.mensagem}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Tipo</Label>
                                    <p className="mt-1">{getTipoLabel(selectedCommunication.tipo)}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Estado</Label>
                                    <div className="mt-1">{getEstadoBadge(selectedCommunication.estado)}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="font-semibold">Destinatários</Label>
                                <p className="mt-1">{selectedCommunication.destinatarios.length} pessoas</p>
                            </div>

                            {selectedCommunication.estado === 'enviada' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="font-semibold">Total Enviados</Label>
                                        <p className="mt-1">{selectedCommunication.total_enviados}</p>
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Total Falhados</Label>
                                        <p className="mt-1">{selectedCommunication.total_falhados}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
