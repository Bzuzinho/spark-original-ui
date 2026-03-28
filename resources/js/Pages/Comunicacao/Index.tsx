import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import {
  ChartLineUp,
  CalendarBlank,
  Clock,
  Copy,
  Files,
  MegaphoneSimple,
  PaperPlaneTilt,
  PaperPlaneRight,
  Plus,
  UsersThree,
} from '@phosphor-icons/react';

type Channel = 'email' | 'sms' | 'push' | 'interno' | 'alert_app';
type CampaignStatus = 'rascunho' | 'agendada' | 'em_processamento' | 'enviada' | 'falhada' | 'cancelada';

type Paginated<T> = {
  data: T[];
};

interface CampaignRow {
  id: string;
  codigo: string;
  title: string;
  description?: string | null;
  status: CampaignStatus;
  scheduled_at?: string | null;
  sent_at?: string | null;
  author?: { id: string; name?: string | null; nome_completo?: string | null } | null;
  segment?: { id: string; name: string } | null;
  channels: Array<{ id: string; channel: Channel; is_enabled: boolean; template_id?: string | null; subject?: string | null; message_body?: string | null }>;
  create_in_app_alert: boolean;
  alert_title?: string | null;
  alert_message?: string | null;
  alert_link?: string | null;
  alert_type?: 'info' | 'warning' | 'success' | 'error';
}

interface DeliveryRow {
  id: string;
  channel: Channel;
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';
  sent_at?: string | null;
  total_recipients: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  result_summary?: string | null;
  error_message?: string | null;
  campaign?: { id: string; codigo: string; title: string } | null;
  segment?: { id: string; name: string } | null;
}

interface TemplateRow {
  id: string;
  name: string;
  channel: Channel;
  category?: string | null;
  subject?: string | null;
  body: string;
  variables_json?: Record<string, string> | string[] | null;
  status: 'ativo' | 'em_revisao' | 'inativo';
}

interface SegmentRow {
  id: string;
  name: string;
  type: 'dynamic' | 'manual' | 'system';
  description?: string | null;
  rules_json?: Record<string, unknown> | null;
  is_active: boolean;
}

interface Props {
  stats: {
    scheduled_campaigns: number;
    completed_deliveries: number;
    failed_deliveries: number;
    active_templates: number;
    total_sent: number;
    total_failed: number;
    total_pending: number;
    alerts_unread: number;
  };
  campaigns: Paginated<CampaignRow>;
  deliveries: Paginated<DeliveryRow>;
  templates: Paginated<TemplateRow>;
  segments: Paginated<SegmentRow>;
  latestCampaigns: Array<{ id: string; codigo: string; title: string; status: CampaignStatus }>;
  channelSummary: Array<{ channel: Channel; total: number; success_count: number; failed_count: number }>;
  alertsSummary: { total: number; unread: number; read: number };
  filterOptions: {
    authors: Array<{ id: string; name?: string | null; nome_completo?: string | null }>;
    segments: Array<{ id: string; name: string }>;
    templates: Array<{ id: string; name: string; channel: Channel }>;
  };
  filters: Record<string, string | undefined>;
}

const CHANNELS: Array<{ value: Channel; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'interno', label: 'Interno' },
  { value: 'alert_app', label: 'Alerta App' },
];

const BASE_CHANNEL_CONFIG = CHANNELS.map((item) => ({
  channel: item.value,
  is_enabled: false,
  template_id: '',
  subject: '',
  message_body: '',
}));

export default function ComunicacaoIndex({
  stats,
  campaigns,
  deliveries,
  templates,
  segments,
  latestCampaigns,
  channelSummary,
  alertsSummary,
  filterOptions,
  filters,
}: Props) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignRow | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRow | null>(null);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentRow | null>(null);

  const [campaignFilters, setCampaignFilters] = useState({
    search: filters.search || '',
    channel: filters.channel || 'all',
    status: filters.status || 'all',
    author: filters.author || 'all',
  });

  const campaignForm = useForm({
    title: '',
    description: '',
    segment_id: '',
    status: 'rascunho' as CampaignStatus,
    scheduled_at: '',
    create_in_app_alert: false,
    alert_title: '',
    alert_message: '',
    alert_link: '',
    alert_type: 'info' as 'info' | 'warning' | 'success' | 'error',
    notes: '',
    channels: BASE_CHANNEL_CONFIG,
  });

  const templateForm = useForm({
    name: '',
    channel: 'email' as Channel,
    category: '',
    subject: '',
    body: '',
    status: 'ativo' as 'ativo' | 'em_revisao' | 'inativo',
  });

  const segmentForm = useForm({
    name: '',
    type: 'dynamic' as 'dynamic' | 'manual' | 'system',
    description: '',
    is_active: true,
    source: 'all_members',
    user_ids: '',
    team_id: '',
    age_group_id: '',
    event_id: '',
  });

  const resetCampaignForm = () => {
    campaignForm.setData({
      title: '',
      description: '',
      segment_id: '',
      status: 'rascunho',
      scheduled_at: '',
      create_in_app_alert: false,
      alert_title: '',
      alert_message: '',
      alert_link: '',
      alert_type: 'info',
      notes: '',
      channels: BASE_CHANNEL_CONFIG,
    });
    setEditingCampaign(null);
  };

  const openCreateCampaign = () => {
    resetCampaignForm();
    setShowCampaignModal(true);
  };

  const openEditCampaign = (campaign: CampaignRow) => {
    const mappedChannels = BASE_CHANNEL_CONFIG.map((base) => {
      const current = campaign.channels.find((item) => item.channel === base.channel);
      return {
        channel: base.channel,
        is_enabled: current?.is_enabled ?? false,
        template_id: current?.template_id ?? '',
        subject: current?.subject ?? '',
        message_body: current?.message_body ?? '',
      };
    });

    campaignForm.setData({
      title: campaign.title,
      description: campaign.description || '',
      segment_id: campaign.segment?.id || '',
      status: campaign.status,
      scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
      create_in_app_alert: campaign.create_in_app_alert,
      alert_title: campaign.alert_title || '',
      alert_message: campaign.alert_message || '',
      alert_link: campaign.alert_link || '',
      alert_type: campaign.alert_type || 'info',
      notes: '',
      channels: mappedChannels,
    });

    setEditingCampaign(campaign);
    setShowCampaignModal(true);
  };

  const saveCampaign = () => {
    if (editingCampaign) {
      campaignForm.put(route('comunicacao.campaigns.update', editingCampaign.id), {
        preserveScroll: true,
        onSuccess: () => setShowCampaignModal(false),
      });
      return;
    }

    campaignForm.post(route('comunicacao.campaigns.store'), {
      preserveScroll: true,
      onSuccess: () => setShowCampaignModal(false),
    });
  };

  const runCampaignAction = (campaignId: string, action: 'send' | 'schedule' | 'cancel' | 'duplicate') => {
    const routeMap = {
      send: 'comunicacao.campaigns.send',
      schedule: 'comunicacao.campaigns.schedule',
      cancel: 'comunicacao.campaigns.cancel',
      duplicate: 'comunicacao.campaigns.duplicate',
    } as const;

    const payload = action === 'schedule' ? { scheduled_at: new Date(Date.now() + 3600000).toISOString() } : {};

    router.post(route(routeMap[action], campaignId), payload, { preserveScroll: true });
  };

  const saveTemplate = () => {
    if (editingTemplate) {
      templateForm.put(route('comunicacao.templates.update', editingTemplate.id), {
        preserveScroll: true,
        onSuccess: () => setShowTemplateModal(false),
      });
      return;
    }

    templateForm.post(route('comunicacao.templates.store'), {
      preserveScroll: true,
      onSuccess: () => setShowTemplateModal(false),
    });
  };

  const saveSegment = () => {
    const userIds = segmentForm.data.user_ids
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const rulesJson = {
      source: segmentForm.data.source,
      user_ids: userIds,
      team_id: segmentForm.data.team_id || null,
      age_group_id: segmentForm.data.age_group_id || null,
      event_id: segmentForm.data.event_id || null,
    };

    if (editingSegment) {
      router.put(route('comunicacao.segments.update', editingSegment.id), {
        name: segmentForm.data.name,
        type: segmentForm.data.type,
        description: segmentForm.data.description,
        is_active: segmentForm.data.is_active,
        rules_json: rulesJson,
      }, {
        preserveScroll: true,
        onSuccess: () => setShowSegmentModal(false),
      });
      return;
    }

    router.post(route('comunicacao.segments.store'), {
      name: segmentForm.data.name,
      type: segmentForm.data.type,
      description: segmentForm.data.description,
      is_active: segmentForm.data.is_active,
      rules_json: rulesJson,
    }, {
      preserveScroll: true,
      onSuccess: () => setShowSegmentModal(false),
    });
  };

  const filteredTemplateOptions = (channel: Channel) => {
    return filterOptions.templates.filter((item) => item.channel === channel);
  };

  const applyFilters = () => {
    router.get(
      route('comunicacao.index'),
      {
        search: campaignFilters.search || undefined,
        channel: campaignFilters.channel === 'all' ? undefined : campaignFilters.channel,
        status: campaignFilters.status === 'all' ? undefined : campaignFilters.status,
        author: campaignFilters.author === 'all' ? undefined : campaignFilters.author,
      },
      { preserveState: true, preserveScroll: true },
    );
  };

  const statusBadge = useMemo(
    () =>
      ({
        rascunho: 'outline',
        agendada: 'secondary',
        em_processamento: 'secondary',
        enviada: 'default',
        falhada: 'destructive',
        cancelada: 'destructive',
      }) as Record<CampaignStatus, 'outline' | 'secondary' | 'default' | 'destructive'>,
    [],
  );

  return (
    <AuthenticatedLayout
      fullWidth
      header={
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Comunicação</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Campanhas, envios, templates, segmentos e alertas internos.</p>
        </div>
      }
    >
      <Head title="Comunicação" />

      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <div className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 text-[11px] sm:h-9 sm:grid-cols-5 sm:text-xs">
              <TabsTrigger value="dashboard" className="flex h-8 min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <ChartLineUp size={14} />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="campanhas" className="flex h-8 min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <MegaphoneSimple size={14} />
                <span>Campanhas</span>
              </TabsTrigger>
              <TabsTrigger value="envios" className="flex h-8 min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <PaperPlaneTilt size={14} />
                <span>Envios</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex h-8 min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <Files size={14} />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="segmentos" className="flex h-8 min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1 text-[11px] leading-none sm:h-7 sm:text-xs">
                <UsersThree size={14} />
                <span>Segmentos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-3">
            <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
              <Card className="p-3"><div className="text-xs text-muted-foreground">Campanhas agendadas</div><div className="text-xl font-semibold">{stats.scheduled_campaigns}</div></Card>
              <Card className="p-3"><div className="text-xs text-muted-foreground">Envios concluídos</div><div className="text-xl font-semibold">{stats.completed_deliveries}</div></Card>
              <Card className="p-3"><div className="text-xs text-muted-foreground">Falhas</div><div className="text-xl font-semibold">{stats.failed_deliveries}</div></Card>
              <Card className="p-3"><div className="text-xs text-muted-foreground">Templates ativos</div><div className="text-xl font-semibold">{stats.active_templates}</div></Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Últimas campanhas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {latestCampaigns.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs border rounded-md p-2">
                      <div>
                        <div className="font-medium">{item.codigo}</div>
                        <div className="text-muted-foreground">{item.title}</div>
                      </div>
                      <Badge variant={statusBadge[item.status]}>{item.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo por canal</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {channelSummary.map((item) => (
                    <div key={item.channel} className="text-xs border rounded-md p-2">
                      <div className="font-medium uppercase">{item.channel}</div>
                      <div className="text-muted-foreground">Total: {item.total} | Sucesso: {item.success_count} | Falhas: {item.failed_count}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas internos</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Total</span><span className="font-medium">{alertsSummary.total}</span></div>
                  <div className="flex justify-between"><span>Por ler</span><span className="font-medium">{alertsSummary.unread}</span></div>
                  <div className="flex justify-between"><span>Lidos</span><span className="font-medium">{alertsSummary.read}</span></div>
                  <div className="pt-2 border-t text-muted-foreground">Métricas: enviados {stats.total_sent}, falhados {stats.total_failed}, pendentes {stats.total_pending}.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campanhas" className="space-y-3">
            <Card>
              <CardContent className="pt-4">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-12">
                  <Input
                    className="sm:col-span-2 lg:col-span-3"
                    placeholder="Pesquisar código/título"
                    value={campaignFilters.search}
                    onChange={(e) => setCampaignFilters((prev) => ({ ...prev, search: e.target.value }))}
                  />
                  <div className="sm:col-span-1 lg:col-span-3">
                    <Select value={campaignFilters.channel} onValueChange={(value) => setCampaignFilters((prev) => ({ ...prev, channel: value }))}>
                      <SelectTrigger><SelectValue placeholder="Canal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os canais</SelectItem>
                        {CHANNELS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-1 lg:col-span-3">
                    <Select value={campaignFilters.status} onValueChange={(value) => setCampaignFilters((prev) => ({ ...prev, status: value }))}>
                      <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os estados</SelectItem>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="agendada">Agendada</SelectItem>
                        <SelectItem value="em_processamento">Em processamento</SelectItem>
                        <SelectItem value="enviada">Enviada</SelectItem>
                        <SelectItem value="falhada">Falhada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-1 lg:col-span-3">
                    <Select value={campaignFilters.author} onValueChange={(value) => setCampaignFilters((prev) => ({ ...prev, author: value }))}>
                      <SelectTrigger><SelectValue placeholder="Autor" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os autores</SelectItem>
                        {filterOptions.authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>{author.nome_completo || author.name || author.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-3 lg:flex lg:justify-end">
                    <Button variant="outline" size="sm" className="h-8 w-full text-xs lg:w-auto" onClick={applyFilters}>Filtrar</Button>
                    <Button size="sm" className="h-8 w-full text-xs lg:w-auto" onClick={openCreateCampaign}><Plus size={14} className="mr-1" />Nova campanha</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 lg:hidden">
                  {campaigns.data.map((campaign) => (
                    <div key={campaign.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{campaign.codigo}</p>
                          <p className="truncate text-sm font-medium">{campaign.title}</p>
                        </div>
                        <Badge variant={statusBadge[campaign.status]}>{campaign.status}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Canais: {campaign.channels.filter((item) => item.is_enabled).map((item) => item.channel).join(', ') || '-'}</p>
                        <p>Audiência: {campaign.segment?.name || '-'}</p>
                        <p>Agendamento: {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString('pt-PT') : '-'}</p>
                        <p>Autor: {campaign.author?.nome_completo || campaign.author?.name || '-'}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditCampaign(campaign)}>Editar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => runCampaignAction(campaign.id, 'duplicate')}>Duplicar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => runCampaignAction(campaign.id, 'schedule')}>Agendar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => runCampaignAction(campaign.id, 'send')}>Enviar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs col-span-2 sm:col-span-1" onClick={() => runCampaignAction(campaign.id, 'cancel')}>Cancelar</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Canais</TableHead>
                        <TableHead>Audiência</TableHead>
                        <TableHead>Agendamento</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.data.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.codigo}</TableCell>
                          <TableCell className="max-w-[240px] truncate">{campaign.title}</TableCell>
                          <TableCell className="text-xs">{campaign.channels.filter((item) => item.is_enabled).map((item) => item.channel).join(', ') || '-'}</TableCell>
                          <TableCell>{campaign.segment?.name || '-'}</TableCell>
                          <TableCell className="text-xs">{campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString('pt-PT') : '-'}</TableCell>
                          <TableCell>{campaign.author?.nome_completo || campaign.author?.name || '-'}</TableCell>
                          <TableCell><Badge variant={statusBadge[campaign.status]}>{campaign.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditCampaign(campaign)}>Editar</Button>
                              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => runCampaignAction(campaign.id, 'duplicate')}><Copy size={13} /></Button>
                              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => runCampaignAction(campaign.id, 'schedule')}><CalendarBlank size={13} /></Button>
                              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => runCampaignAction(campaign.id, 'send')}><PaperPlaneRight size={13} /></Button>
                              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => runCampaignAction(campaign.id, 'cancel')}><Clock size={13} /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="envios" className="space-y-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Histórico operacional de execução</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 lg:hidden">
                  {deliveries.data.map((delivery) => (
                    <div key={delivery.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{delivery.campaign?.codigo} - {delivery.campaign?.title}</p>
                          <p className="text-xs text-muted-foreground">{delivery.segment?.name || '-'}</p>
                        </div>
                        <Badge variant={delivery.status === 'failed' ? 'destructive' : 'secondary'}>{delivery.status}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Canal: <span className="uppercase">{delivery.channel}</span></p>
                        <p>Data/Hora: {delivery.sent_at ? new Date(delivery.sent_at).toLocaleString('pt-PT') : '-'}</p>
                        <p>Resultado: S:{delivery.success_count} F:{delivery.failed_count} P:{delivery.pending_count}</p>
                        <p>Erro/Log: {delivery.error_message || delivery.result_summary || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Canal</TableHead>
                        <TableHead>Audiência</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Logs/Erro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveries.data.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell>{delivery.campaign?.codigo} - {delivery.campaign?.title}</TableCell>
                          <TableCell className="uppercase">{delivery.channel}</TableCell>
                          <TableCell>{delivery.segment?.name || '-'}</TableCell>
                          <TableCell className="text-xs">{delivery.sent_at ? new Date(delivery.sent_at).toLocaleString('pt-PT') : '-'}</TableCell>
                          <TableCell><Badge variant={delivery.status === 'failed' ? 'destructive' : 'secondary'}>{delivery.status}</Badge></TableCell>
                          <TableCell className="text-xs">S:{delivery.success_count} F:{delivery.failed_count} P:{delivery.pending_count}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{delivery.error_message || delivery.result_summary || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" className="h-8 text-xs" onClick={() => { setEditingTemplate(null); templateForm.reset(); setShowTemplateModal(true); }}>
                <Plus size={14} className="mr-1" />Novo template
              </Button>
            </div>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 lg:hidden">
                  {templates.data.map((template) => (
                    <div key={template.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.category || '-'} | <span className="uppercase">{template.channel}</span></p>
                        </div>
                        <Badge variant={template.status === 'inativo' ? 'destructive' : 'secondary'}>{template.status}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Assunto: {template.subject || '-'}</p>
                        <p>Variáveis: {Array.isArray(template.variables_json) ? template.variables_json.join(', ') : Object.keys(template.variables_json || {}).join(', ') || '-'}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                          templateForm.setData({
                            name: template.name,
                            channel: template.channel,
                            category: template.category || '',
                            subject: template.subject || '',
                            body: template.body,
                            status: template.status,
                          });
                          setEditingTemplate(template);
                          setShowTemplateModal(true);
                        }}>Editar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => router.post(route('comunicacao.templates.duplicate', template.id), {}, { preserveScroll: true })}>Duplicar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs col-span-2 sm:col-span-1" onClick={() => router.post(route('comunicacao.templates.toggle', template.id), {}, { preserveScroll: true })}>Estado</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Canal</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Variáveis</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.data.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell className="uppercase">{template.channel}</TableCell>
                          <TableCell>{template.category || '-'}</TableCell>
                          <TableCell>{template.subject || '-'}</TableCell>
                          <TableCell className="text-xs">{Array.isArray(template.variables_json) ? template.variables_json.join(', ') : Object.keys(template.variables_json || {}).join(', ') || '-'}</TableCell>
                          <TableCell><Badge variant={template.status === 'inativo' ? 'destructive' : 'secondary'}>{template.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                                templateForm.setData({
                                  name: template.name,
                                  channel: template.channel,
                                  category: template.category || '',
                                  subject: template.subject || '',
                                  body: template.body,
                                  status: template.status,
                                });
                                setEditingTemplate(template);
                                setShowTemplateModal(true);
                              }}>Editar</Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => router.post(route('comunicacao.templates.duplicate', template.id), {}, { preserveScroll: true })}>Duplicar</Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => router.post(route('comunicacao.templates.toggle', template.id), {}, { preserveScroll: true })}>Estado</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segmentos" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" className="h-8 text-xs" onClick={() => { setEditingSegment(null); segmentForm.reset(); segmentForm.setData('is_active', true); setShowSegmentModal(true); }}>
                <Plus size={14} className="mr-1" />Novo segmento
              </Button>
            </div>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 lg:hidden">
                  {segments.data.map((segment) => (
                    <div key={segment.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{segment.name}</p>
                          <p className="text-xs text-muted-foreground">Tipo: {segment.type}</p>
                        </div>
                        <Badge variant={segment.is_active ? 'secondary' : 'destructive'}>{segment.is_active ? 'Sim' : 'Não'}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Descrição: {segment.description || '-'}</p>
                        <p className="break-all">Regras: {segment.rules_json ? JSON.stringify(segment.rules_json) : '-'}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
                        <Button variant="outline" size="sm" className="h-7 text-xs col-span-2 sm:col-span-1" onClick={() => {
                          const rules = (segment.rules_json || {}) as Record<string, string>;
                          segmentForm.setData({
                            name: segment.name,
                            type: segment.type,
                            description: segment.description || '',
                            is_active: segment.is_active,
                            source: rules.source || 'all_members',
                            user_ids: Array.isArray(rules.user_ids) ? rules.user_ids.join(', ') : '',
                            team_id: rules.team_id || '',
                            age_group_id: rules.age_group_id || '',
                            event_id: rules.event_id || '',
                          });
                          setEditingSegment(segment);
                          setShowSegmentModal(true);
                        }}>Editar</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Regras</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {segments.data.map((segment) => (
                        <TableRow key={segment.id}>
                          <TableCell className="font-medium">{segment.name}</TableCell>
                          <TableCell>{segment.type}</TableCell>
                          <TableCell className="text-xs">{segment.description || '-'}</TableCell>
                          <TableCell><Badge variant={segment.is_active ? 'secondary' : 'destructive'}>{segment.is_active ? 'Sim' : 'Não'}</Badge></TableCell>
                          <TableCell className="text-xs">{segment.rules_json ? JSON.stringify(segment.rules_json) : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                              const rules = (segment.rules_json || {}) as Record<string, string>;
                              segmentForm.setData({
                                name: segment.name,
                                type: segment.type,
                                description: segment.description || '',
                                is_active: segment.is_active,
                                source: rules.source || 'all_members',
                                user_ids: Array.isArray(rules.user_ids) ? rules.user_ids.join(', ') : '',
                                team_id: rules.team_id || '',
                                age_group_id: rules.age_group_id || '',
                                event_id: rules.event_id || '',
                              });
                              setEditingSegment(segment);
                              setShowSegmentModal(true);
                            }}>Editar</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader><DialogTitle>{editingCampaign ? 'Editar campanha' : 'Nova campanha'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Título</Label>
              <Input value={campaignForm.data.title} onChange={(e) => campaignForm.setData('title', e.target.value)} />
            </div>
            <div>
              <Label>Segmento</Label>
              <Select value={campaignForm.data.segment_id} onValueChange={(value) => campaignForm.setData('segment_id', value)}>
                <SelectTrigger><SelectValue placeholder="Selecionar segmento" /></SelectTrigger>
                <SelectContent>
                  {filterOptions.segments.map((segment) => <SelectItem key={segment.id} value={segment.id}>{segment.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea value={campaignForm.data.description} onChange={(e) => campaignForm.setData('description', e.target.value)} rows={2} />
            </div>
            <div className="sm:col-span-2 border rounded-md p-3 space-y-2">
              <div className="text-xs font-medium">Canais</div>
              {campaignForm.data.channels.map((channelRow, index) => (
                <div key={channelRow.channel} className="border rounded-md p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase font-medium">{channelRow.channel}</div>
                    <Switch checked={channelRow.is_enabled} onCheckedChange={(checked) => {
                      const updated = [...campaignForm.data.channels];
                      updated[index].is_enabled = checked;
                      campaignForm.setData('channels', updated);
                    }} />
                  </div>
                  {channelRow.is_enabled && (
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Select value={channelRow.template_id || 'none'} onValueChange={(value) => {
                        const updated = [...campaignForm.data.channels];
                        updated[index].template_id = value === 'none' ? '' : value;
                        campaignForm.setData('channels', updated);
                      }}>
                        <SelectTrigger><SelectValue placeholder="Template" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem template</SelectItem>
                          {filteredTemplateOptions(channelRow.channel).map((template) => (
                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Assunto" value={channelRow.subject || ''} onChange={(e) => {
                        const updated = [...campaignForm.data.channels];
                        updated[index].subject = e.target.value;
                        campaignForm.setData('channels', updated);
                      }} />
                      <Input placeholder="Mensagem" value={channelRow.message_body || ''} onChange={(e) => {
                        const updated = [...campaignForm.data.channels];
                        updated[index].message_body = e.target.value;
                        campaignForm.setData('channels', updated);
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 border rounded-md p-2">
              <Switch checked={campaignForm.data.create_in_app_alert} onCheckedChange={(checked) => campaignForm.setData('create_in_app_alert', checked)} />
              <span className="text-xs">Gerar alerta dentro da aplicação</span>
            </div>
            {campaignForm.data.create_in_app_alert && (
              <>
                <div>
                  <Label>Título do alerta</Label>
                  <Input value={campaignForm.data.alert_title} onChange={(e) => campaignForm.setData('alert_title', e.target.value)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={campaignForm.data.alert_type} onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => campaignForm.setData('alert_type', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Mensagem do alerta</Label>
                  <Textarea value={campaignForm.data.alert_message} onChange={(e) => campaignForm.setData('alert_message', e.target.value)} rows={2} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Link do alerta</Label>
                  <Input value={campaignForm.data.alert_link} onChange={(e) => campaignForm.setData('alert_link', e.target.value)} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>Cancelar</Button>
            <Button onClick={saveCampaign}>Guardar campanha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingTemplate ? 'Editar template' : 'Novo template'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={templateForm.data.name} onChange={(e) => templateForm.setData('name', e.target.value)} />
            <Label>Canal</Label>
            <Select value={templateForm.data.channel} onValueChange={(value: Channel) => templateForm.setData('channel', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CHANNELS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
            <Label>Categoria</Label>
            <Input value={templateForm.data.category} onChange={(e) => templateForm.setData('category', e.target.value)} />
            <Label>Assunto</Label>
            <Input value={templateForm.data.subject} onChange={(e) => templateForm.setData('subject', e.target.value)} />
            <Label>Corpo / Conteúdo</Label>
            <Textarea value={templateForm.data.body} onChange={(e) => templateForm.setData('body', e.target.value)} rows={5} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>Cancelar</Button>
            <Button onClick={saveTemplate}>Guardar template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSegmentModal} onOpenChange={setShowSegmentModal}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingSegment ? 'Editar segmento' : 'Novo segmento'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={segmentForm.data.name} onChange={(e) => segmentForm.setData('name', e.target.value)} />
            <Label>Tipo</Label>
            <Select value={segmentForm.data.type} onValueChange={(value: 'dynamic' | 'manual' | 'system') => segmentForm.setData('type', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dynamic">Dynamic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Label>Fonte dinâmica</Label>
            <Select value={segmentForm.data.source} onValueChange={(value) => segmentForm.setData('source', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_members">Todos os membros</SelectItem>
                <SelectItem value="athletes">Atletas por escalão</SelectItem>
                <SelectItem value="guardians">Pais/Encarregados</SelectItem>
                <SelectItem value="coaches">Treinadores</SelectItem>
                <SelectItem value="overdue_payments">Pagamentos em atraso</SelectItem>
                <SelectItem value="event_participants">Participantes de evento</SelectItem>
                <SelectItem value="users_with_unread_alerts">Utilizadores com alertas por ler</SelectItem>
              </SelectContent>
            </Select>
            <Label>IDs utilizadores (manual, separados por vírgula)</Label>
            <Input value={segmentForm.data.user_ids} onChange={(e) => segmentForm.setData('user_ids', e.target.value)} />
            <Label>Descrição</Label>
            <Textarea value={segmentForm.data.description} onChange={(e) => segmentForm.setData('description', e.target.value)} rows={3} />
            <div className="flex items-center gap-2">
              <Switch checked={segmentForm.data.is_active} onCheckedChange={(checked) => segmentForm.setData('is_active', checked)} />
              <span className="text-xs">Ativo</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSegmentModal(false)}>Cancelar</Button>
            <Button onClick={saveSegment}>Guardar segmento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
