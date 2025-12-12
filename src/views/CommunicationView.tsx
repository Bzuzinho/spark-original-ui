import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { PaperPlaneRight, Clock, CheckCircle, XCircle, Plus, Trash, Eye, Users, Envelope, CalendarBlank, Bell, GearSix, Warning } from '@phosphor-icons/react';
import type { User } from '@/lib/types';
import { emailService } from '@/lib/email-service';
import { EmailConfigComponent } from '@/components/EmailConfig';

interface Comunicacao {
  id: string;
  tipo: 'manual' | 'automatica';
  assunto: string;
  mensagem: string;
  destinatarios: string[];
  destinatarios_nomes?: string[];
  filtro_tipo?: string;
  filtro_escalao?: string[];
  filtro_estado?: string;
  data_envio: string;
  estado: 'rascunho' | 'agendada' | 'enviada' | 'falhada';
  agendamento?: {
    data: string;
    hora: string;
  };
  criado_por: string;
  created_at: string;
}

interface ComunicacaoAutomatica {
  id: string;
  nome: string;
  tipo: 'mensalidade_vencida' | 'atestado_medico' | 'aniversario' | 'customizado';
  ativa: boolean;
  condicao: {
    tipo: string;
    dias_antes?: number;
    dias_atraso?: number;
  };
  template: {
    assunto: string;
    mensagem: string;
  };
  destinatarios_filtro: {
    tipo_membro?: string[];
    escalao?: string[];
    estado?: string;
  };
  ultima_execucao?: string;
  created_at: string;
}

export function CommunicationView() {
  const [comunicacoes, setComunicacoes] = useKV<Comunicacao[]>('club-comunicacoes', []);
  const [comunicacoesAutomaticas, setComunicacoesAutomaticas] = useKV<ComunicacaoAutomatica[]>('club-comunicacoes-automaticas', []);
  const [users] = useKV<User[]>('club-users', []);
  const [escaloes] = useKV<any[]>('settings-age-groups', []);
  const [userTypes] = useKV<any[]>('settings-user-types', []);
  const [currentUser] = useKV<User | null>('authenticated-user', null);

  const [showNovaManual, setShowNovaManual] = useState(false);
  const [showNovaAutomatica, setShowNovaAutomatica] = useState(false);
  const [showVisualizacao, setShowVisualizacao] = useState(false);
  const [comunicacaoSelecionada, setComunicacaoSelecionada] = useState<Comunicacao | null>(null);

  const [formManual, setFormManual] = useState({
    assunto: '',
    mensagem: '',
    destinatarios: [] as string[],
    filtro_tipo: '',
    filtro_escalao: [] as string[],
    filtro_estado: '',
    agendar: false,
    data_agendamento: '',
    hora_agendamento: '',
  });

  const [formAutomatica, setFormAutomatica] = useState({
    nome: '',
    tipo: 'mensalidade_vencida' as ComunicacaoAutomatica['tipo'],
    ativa: true,
    dias_antes: 0,
    dias_atraso: 3,
    assunto: '',
    mensagem: '',
    filtro_tipo: [] as string[],
    filtro_escalao: [] as string[],
    filtro_estado: 'ativo',
  });

  const [destinatariosSelecionados, setDestinatariosSelecionados] = useState<Set<string>>(new Set());
  const [isEmailConfigured, setIsEmailConfigured] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0, isActive: false });

  useEffect(() => {
    checkEmailConfiguration();
  }, []);

  useEffect(() => {
    if (formManual.filtro_tipo || formManual.filtro_escalao.length > 0 || formManual.filtro_estado) {
      aplicarFiltrosAutomaticos();
    }
  }, [formManual.filtro_tipo, formManual.filtro_escalao, formManual.filtro_estado]);

  const checkEmailConfiguration = async () => {
    const configured = await emailService.isConfigured();
    setIsEmailConfigured(configured);
  };

  const aplicarFiltrosAutomaticos = () => {
    if (!users) return;
    
    let usersFiltrados = users.filter(u => u.email_utilizador);

    if (formManual.filtro_tipo) {
      usersFiltrados = usersFiltrados.filter(u => 
        u.tipo_membro?.includes(formManual.filtro_tipo as any)
      );
    }

    if (formManual.filtro_escalao.length > 0) {
      usersFiltrados = usersFiltrados.filter(u => 
        u.escalao?.some(e => formManual.filtro_escalao.includes(e))
      );
    }

    if (formManual.filtro_estado) {
      usersFiltrados = usersFiltrados.filter(u => u.estado === formManual.filtro_estado);
    }

    const novosDestinatarios = new Set(usersFiltrados.map(u => u.id));
    setDestinatariosSelecionados(novosDestinatarios);
    setFormManual(prev => ({ ...prev, destinatarios: Array.from(novosDestinatarios) }));
  };

  const handleEnviarManual = async () => {
    if (!formManual.assunto || !formManual.mensagem) {
      toast.error('Preencha o assunto e a mensagem');
      return;
    }

    if (formManual.destinatarios.length === 0) {
      toast.error('Selecione pelo menos um destinatário');
      return;
    }

    if (!isEmailConfigured && !formManual.agendar) {
      toast.error('Configure o serviço de email nas definições antes de enviar');
      return;
    }

    const destinatariosData = (users || [])
      .filter(u => formManual.destinatarios.includes(u.id));
    
    const destinatariosNomes = destinatariosData.map(u => u.nome_completo);

    const novaComunicacao: Comunicacao = {
      id: crypto.randomUUID(),
      tipo: 'manual',
      assunto: formManual.assunto,
      mensagem: formManual.mensagem,
      destinatarios: formManual.destinatarios,
      destinatarios_nomes: destinatariosNomes,
      filtro_tipo: formManual.filtro_tipo,
      filtro_escalao: formManual.filtro_escalao,
      filtro_estado: formManual.filtro_estado,
      data_envio: formManual.agendar && formManual.data_agendamento 
        ? `${formManual.data_agendamento}T${formManual.hora_agendamento || '09:00'}`
        : new Date().toISOString(),
      estado: formManual.agendar ? 'agendada' : 'enviada',
      agendamento: formManual.agendar ? {
        data: formManual.data_agendamento,
        hora: formManual.hora_agendamento || '09:00'
      } : undefined,
      criado_por: currentUser?.nome_completo || 'Sistema',
      created_at: new Date().toISOString(),
    };

    if (!formManual.agendar) {
      setSendingProgress({ current: 0, total: destinatariosData.length, isActive: true });
      
      const htmlContent = emailService.convertTextToHtml(formManual.mensagem);
      const finalHtml = emailService.generateHtmlFromTemplate(htmlContent, {
        NOME_CLUBE: 'BSCN - Benedita Sport Clube Natação'
      });

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < destinatariosData.length; i++) {
        const destinatario = destinatariosData[i];
        setSendingProgress({ current: i + 1, total: destinatariosData.length, isActive: true });

        try {
          const result = await emailService.sendEmail({
            to: [destinatario.email_utilizador],
            subject: formManual.assunto,
            html: finalHtml,
            text: formManual.mensagem,
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
            const errorMsg = `${destinatario.nome_completo}: ${result.error || 'Erro desconhecido'}`;
            errors.push(errorMsg);
            console.error(`Erro ao enviar email para ${destinatario.nome_completo}:`, result.error);
          }
        } catch (error) {
          failCount++;
          const errorMsg = `${destinatario.nome_completo}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
          errors.push(errorMsg);
          console.error(`Exceção ao enviar email para ${destinatario.nome_completo}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setSendingProgress({ current: 0, total: 0, isActive: false });

      if (failCount > 0) {
        novaComunicacao.estado = 'falhada';
        
        console.error('Falhas no envio de emails:', {
          total: destinatariosData.length,
          success: successCount,
          failed: failCount,
          errors: errors
        });
        
        if (successCount === 0) {
          const firstError = errors[0] || 'Erro desconhecido';
          toast.error(
            `Falha ao enviar todos os emails. ${firstError}`,
            { 
              duration: 8000,
              description: 'Verifique a configuração de email nas definições.'
            }
          );
        } else {
          toast.error(
            `${failCount} de ${destinatariosData.length} emails falharam`,
            { 
              duration: 6000,
              description: `${successCount} foram enviados com sucesso. Verifique os detalhes no console.`
            }
          );
        }
      } else {
        toast.success(`Comunicação enviada com sucesso para ${successCount} destinatário(s)`);
      }
    }

    setComunicacoes(prev => [novaComunicacao, ...(prev || [])]);
    
    if (formManual.agendar) {
      toast.success('Comunicação agendada com sucesso');
    }
    
    resetFormManual();
    setShowNovaManual(false);
  };

  const handleCriarAutomatica = () => {
    if (!formAutomatica.nome || !formAutomatica.assunto || !formAutomatica.mensagem) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const novaComunicacaoAuto: ComunicacaoAutomatica = {
      id: crypto.randomUUID(),
      nome: formAutomatica.nome,
      tipo: formAutomatica.tipo,
      ativa: formAutomatica.ativa,
      condicao: {
        tipo: formAutomatica.tipo,
        dias_antes: formAutomatica.dias_antes,
        dias_atraso: formAutomatica.dias_atraso,
      },
      template: {
        assunto: formAutomatica.assunto,
        mensagem: formAutomatica.mensagem,
      },
      destinatarios_filtro: {
        tipo_membro: formAutomatica.filtro_tipo.length > 0 ? formAutomatica.filtro_tipo : undefined,
        escalao: formAutomatica.filtro_escalao.length > 0 ? formAutomatica.filtro_escalao : undefined,
        estado: formAutomatica.filtro_estado,
      },
      created_at: new Date().toISOString(),
    };

    setComunicacoesAutomaticas(prev => [novaComunicacaoAuto, ...(prev || [])]);
    toast.success('Comunicação automática criada com sucesso');
    
    resetFormAutomatica();
    setShowNovaAutomatica(false);
  };

  const handleToggleAutomatica = (id: string) => {
    setComunicacoesAutomaticas(prev => 
      (prev || []).map(c => c.id === id ? { ...c, ativa: !c.ativa } : c)
    );
    toast.success('Estado atualizado');
  };

  const handleDeleteComunicacao = (id: string) => {
    setComunicacoes(prev => (prev || []).filter(c => c.id !== id));
    toast.success('Comunicação removida');
  };

  const handleDeleteAutomatica = (id: string) => {
    setComunicacoesAutomaticas(prev => (prev || []).filter(c => c.id !== id));
    toast.success('Comunicação automática removida');
  };

  const resetFormManual = () => {
    setFormManual({
      assunto: '',
      mensagem: '',
      destinatarios: [],
      filtro_tipo: '',
      filtro_escalao: [],
      filtro_estado: '',
      agendar: false,
      data_agendamento: '',
      hora_agendamento: '',
    });
    setDestinatariosSelecionados(new Set());
  };

  const resetFormAutomatica = () => {
    setFormAutomatica({
      nome: '',
      tipo: 'mensalidade_vencida',
      ativa: true,
      dias_antes: 0,
      dias_atraso: 3,
      assunto: '',
      mensagem: '',
      filtro_tipo: [],
      filtro_escalao: [],
      filtro_estado: 'ativo',
    });
  };

  const toggleDestinatario = (userId: string) => {
    const novosDestinatarios = new Set(destinatariosSelecionados);
    if (novosDestinatarios.has(userId)) {
      novosDestinatarios.delete(userId);
    } else {
      novosDestinatarios.add(userId);
    }
    setDestinatariosSelecionados(novosDestinatarios);
    setFormManual(prev => ({ ...prev, destinatarios: Array.from(novosDestinatarios) }));
  };

  const selecionarTodos = () => {
    const todosUsers = new Set((users || []).filter(u => u.email_utilizador).map(u => u.id));
    setDestinatariosSelecionados(todosUsers);
    setFormManual(prev => ({ ...prev, destinatarios: Array.from(todosUsers) }));
  };

  const limparSelecao = () => {
    setDestinatariosSelecionados(new Set());
    setFormManual(prev => ({ ...prev, destinatarios: [] }));
  };

  const getEstadoBadge = (estado: Comunicacao['estado']) => {
    const badges = {
      rascunho: <Badge variant="outline">Rascunho</Badge>,
      agendada: <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>,
      enviada: <Badge className="bg-green-100 text-green-800">Enviada</Badge>,
      falhada: <Badge variant="destructive">Falhada</Badge>,
    };
    return badges[estado];
  };

  const getTipoLabel = (tipo: ComunicacaoAutomatica['tipo']) => {
    const labels = {
      mensalidade_vencida: 'Mensalidade Vencida',
      atestado_medico: 'Atestado Médico',
      aniversario: 'Aniversário',
      customizado: 'Customizado',
    };
    return labels[tipo];
  };

  const aplicarTemplateMensalidade = () => {
    setFormAutomatica(prev => ({
      ...prev,
      nome: 'Alerta de Mensalidade Vencida',
      tipo: 'mensalidade_vencida',
      dias_atraso: 3,
      assunto: 'Mensalidade em Atraso - {{NOME_CLUBE}}',
      mensagem: `Caro/a {{NOME_ATLETA}},

Informamos que a sua mensalidade do mês {{MES_VENCIMENTO}} encontra-se em atraso há {{DIAS_ATRASO}} dias.

Valor em atraso: {{VALOR_DEVIDO}}€

Por favor, regularize a sua situação o mais brevemente possível para continuar a usufruir de todos os serviços do clube.

Para qualquer esclarecimento, contacte-nos.

Cumprimentos,
{{NOME_CLUBE}}`,
      filtro_estado: 'ativo',
    }));
  };

  const aplicarTemplateAtestado = () => {
    setFormAutomatica(prev => ({
      ...prev,
      nome: 'Lembrete de Atestado Médico',
      tipo: 'atestado_medico',
      dias_antes: 30,
      assunto: 'Atestado Médico a Expirar - {{NOME_CLUBE}}',
      mensagem: `Caro/a {{NOME_ATLETA}},

O seu atestado médico irá expirar em {{DIAS_RESTANTES}} dias ({{DATA_EXPIRACAO}}).

Por favor, providencie a renovação do seu atestado médico para continuar a treinar.

Cumprimentos,
{{NOME_CLUBE}}`,
      filtro_estado: 'ativo',
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Comunicação</h1>
        <p className="text-muted-foreground mt-1">
          Envie comunicações manuais ou configure alertas automáticos
        </p>
      </div>

      {!isEmailConfigured && (
        <Alert variant="destructive">
          <Warning className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>O serviço de email não está configurado. Configure nas definições para enviar emails.</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">
            <Envelope className="mr-2" />
            Envios Manuais
          </TabsTrigger>
          <TabsTrigger value="automaticas">
            <Clock className="mr-2" />
            Automáticas
          </TabsTrigger>
          <TabsTrigger value="historico">
            <CalendarBlank className="mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="configuracao">
            <GearSix className="mr-2" />
            Configuração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Comunicações Manuais</h2>
            <Button onClick={() => setShowNovaManual(true)}>
              <Plus className="mr-2" />
              Nova Comunicação
            </Button>
          </div>

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
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(comunicacoes || []).filter(c => c.estado === 'agendada').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhuma comunicação agendada
                      </TableCell>
                    </TableRow>
                  ) : (
                    (comunicacoes || [])
                      .filter(c => c.estado === 'agendada')
                      .map((com) => (
                        <TableRow key={com.id}>
                          <TableCell className="font-medium">{com.assunto}</TableCell>
                          <TableCell>{com.destinatarios.length} pessoas</TableCell>
                          <TableCell>
                            {new Date(com.data_envio).toLocaleString('pt-PT')}
                          </TableCell>
                          <TableCell>{getEstadoBadge(com.estado)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setComunicacaoSelecionada(com);
                                  setShowVisualizacao(true);
                                }}
                              >
                                <Eye />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComunicacao(com.id)}
                              >
                                <Trash />
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

        <TabsContent value="automaticas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Comunicações Automáticas</h2>
            <Button onClick={() => setShowNovaAutomatica(true)}>
              <Plus className="mr-2" />
              Nova Automática
            </Button>
          </div>

          <div className="grid gap-4">
            {(comunicacoesAutomaticas || []).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  Nenhuma comunicação automática configurada
                </CardContent>
              </Card>
            ) : (
              (comunicacoesAutomaticas || []).map((auto) => (
                <Card key={auto.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {auto.nome}
                          {auto.ativa ? (
                            <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                          ) : (
                            <Badge variant="outline">Inativa</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{getTipoLabel(auto.tipo)}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Switch
                          checked={auto.ativa}
                          onCheckedChange={() => handleToggleAutomatica(auto.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAutomatica(auto.id)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Assunto:</span> {auto.template.assunto}
                      </div>
                      <div>
                        <span className="font-medium">Condição:</span>{' '}
                        {auto.condicao.dias_atraso && `${auto.condicao.dias_atraso} dias de atraso`}
                        {auto.condicao.dias_antes && `${auto.condicao.dias_antes} dias antes`}
                      </div>
                      {auto.ultima_execucao && (
                        <div>
                          <span className="font-medium">Última execução:</span>{' '}
                          {new Date(auto.ultima_execucao).toLocaleString('pt-PT')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico de Envios</h2>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(comunicacoes || []).filter(c => c.estado === 'enviada' || c.estado === 'falhada').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma comunicação enviada
                      </TableCell>
                    </TableRow>
                  ) : (
                    (comunicacoes || [])
                      .filter(c => c.estado === 'enviada' || c.estado === 'falhada')
                      .sort((a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime())
                      .map((com) => (
                        <TableRow key={com.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {com.tipo === 'manual' ? 'Manual' : 'Automática'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{com.assunto}</TableCell>
                          <TableCell>{com.destinatarios.length} pessoas</TableCell>
                          <TableCell>
                            {new Date(com.data_envio).toLocaleString('pt-PT')}
                          </TableCell>
                          <TableCell>{getEstadoBadge(com.estado)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setComunicacaoSelecionada(com);
                                setShowVisualizacao(true);
                              }}
                            >
                              <Eye />
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

        <TabsContent value="configuracao" className="space-y-4">
          <EmailConfigComponent />
        </TabsContent>
      </Tabs>

      <Dialog open={showNovaManual} onOpenChange={setShowNovaManual}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Comunicação Manual</DialogTitle>
            <DialogDescription>
              Envie uma comunicação para membros selecionados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {sendingProgress.isActive && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>A enviar emails...</span>
                      <span>{sendingProgress.current} / {sendingProgress.total}</span>
                    </div>
                    <Progress 
                      value={(sendingProgress.current / sendingProgress.total) * 100} 
                    />
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div>
                <Label htmlFor="assunto">Assunto *</Label>
                <Input
                  id="assunto"
                  value={formManual.assunto}
                  onChange={(e) => setFormManual(prev => ({ ...prev, assunto: e.target.value }))}
                  placeholder="Assunto da comunicação"
                />
              </div>

              <div>
                <Label htmlFor="mensagem">Mensagem *</Label>
                <Textarea
                  id="mensagem"
                  value={formManual.mensagem}
                  onChange={(e) => setFormManual(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Escreva a sua mensagem aqui..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O email será formatado automaticamente com o template do clube
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="agendar"
                    checked={formManual.agendar}
                    onCheckedChange={(checked) => setFormManual(prev => ({ ...prev, agendar: checked }))}
                  />
                  <Label htmlFor="agendar">Agendar envio</Label>
                </div>

                {formManual.agendar && (
                  <>
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={formManual.data_agendamento}
                        onChange={(e) => setFormManual(prev => ({ ...prev, data_agendamento: e.target.value }))}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={formManual.hora_agendamento}
                        onChange={(e) => setFormManual(prev => ({ ...prev, hora_agendamento: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold">Filtros de Destinatários</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Use os filtros para selecionar automaticamente os destinatários
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="filtro_tipo">Tipo de Membro</Label>
                    <Select
                      value={formManual.filtro_tipo || undefined}
                      onValueChange={(value) => setFormManual(prev => ({ ...prev, filtro_tipo: value }))}
                    >
                      <SelectTrigger id="filtro_tipo">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        {(userTypes || []).map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filtro_estado">Estado</Label>
                    <Select
                      value={formManual.filtro_estado || undefined}
                      onValueChange={(value) => setFormManual(prev => ({ ...prev, filtro_estado: value }))}
                    >
                      <SelectTrigger id="filtro_estado">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="suspenso">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm" onClick={selecionarTodos}>
                      Selecionar Todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={limparSelecao}>
                      Limpar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                <Label className="text-base font-semibold mb-2 block">
                  Destinatários ({destinatariosSelecionados.size})
                </Label>
                <div className="space-y-2">
                  {(users || []).filter(u => u.email_utilizador).map((user) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={destinatariosSelecionados.has(user.id)}
                        onCheckedChange={() => toggleDestinatario(user.id)}
                      />
                      <span className="text-sm">{user.nome_completo}</span>
                      <span className="text-xs text-muted-foreground">({user.email_utilizador})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNovaManual(false)}
              disabled={sendingProgress.isActive}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEnviarManual}
              disabled={sendingProgress.isActive || (!formManual.agendar && !isEmailConfigured)}
            >
              <PaperPlaneRight className="mr-2" />
              {formManual.agendar ? 'Agendar' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNovaAutomatica} onOpenChange={setShowNovaAutomatica}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Comunicação Automática</DialogTitle>
            <DialogDescription>
              Configure uma comunicação que será enviada automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={aplicarTemplateMensalidade}
              >
                <Bell className="mr-2" />
                Template: Mensalidade
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={aplicarTemplateAtestado}
              >
                <Bell className="mr-2" />
                Template: Atestado
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome_auto">Nome da Regra *</Label>
                <Input
                  id="nome_auto"
                  value={formAutomatica.nome}
                  onChange={(e) => setFormAutomatica(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Alerta de Mensalidade Vencida"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_auto">Tipo de Alerta</Label>
                  <Select
                    value={formAutomatica.tipo}
                    onValueChange={(value: any) => setFormAutomatica(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger id="tipo_auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensalidade_vencida">Mensalidade Vencida</SelectItem>
                      <SelectItem value="atestado_medico">Atestado Médico</SelectItem>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="customizado">Customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dias_auto">
                    {formAutomatica.tipo === 'mensalidade_vencida' ? 'Dias de Atraso' : 'Dias Antes'}
                  </Label>
                  <Input
                    id="dias_auto"
                    type="number"
                    value={formAutomatica.tipo === 'mensalidade_vencida' ? formAutomatica.dias_atraso : formAutomatica.dias_antes}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (formAutomatica.tipo === 'mensalidade_vencida') {
                        setFormAutomatica(prev => ({ ...prev, dias_atraso: value }));
                      } else {
                        setFormAutomatica(prev => ({ ...prev, dias_antes: value }));
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="assunto_auto">Assunto *</Label>
                <Input
                  id="assunto_auto"
                  value={formAutomatica.assunto}
                  onChange={(e) => setFormAutomatica(prev => ({ ...prev, assunto: e.target.value }))}
                  placeholder="Assunto da comunicação"
                />
              </div>

              <div>
                <Label htmlFor="mensagem_auto">Mensagem *</Label>
                <Textarea
                  id="mensagem_auto"
                  value={formAutomatica.mensagem}
                  onChange={(e) => setFormAutomatica(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Use variáveis: {{NOME_ATLETA}}, {{MES_VENCIMENTO}}, {{DIAS_ATRASO}}, {{VALOR_DEVIDO}}, {{DATA_EXPIRACAO}}, {{DIAS_RESTANTES}}, {{NOME_CLUBE}}"
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variáveis disponíveis: {'{{'} NOME_ATLETA {'}}'}, {'{{'} MES_VENCIMENTO {'}}'}, {'{{'} DIAS_ATRASO {'}}'}, {'{{'} VALOR_DEVIDO {'}}'}, {'{{'} NOME_CLUBE {'}}'}
                </p>
              </div>

              <div>
                <Label>Filtros de Destinatários</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="filtro_estado_auto">Estado</Label>
                    <Select
                      value={formAutomatica.filtro_estado || undefined}
                      onValueChange={(value) => setFormAutomatica(prev => ({ ...prev, filtro_estado: value }))}
                    >
                      <SelectTrigger id="filtro_estado_auto">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="ativa_auto"
                      checked={formAutomatica.ativa}
                      onCheckedChange={(checked) => setFormAutomatica(prev => ({ ...prev, ativa: checked }))}
                    />
                    <Label htmlFor="ativa_auto">Ativar imediatamente</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaAutomatica(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarAutomatica}>
              <Plus className="mr-2" />
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVisualizacao} onOpenChange={setShowVisualizacao}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Comunicação</DialogTitle>
          </DialogHeader>

          {comunicacaoSelecionada && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Assunto</Label>
                <p className="mt-1">{comunicacaoSelecionada.assunto}</p>
              </div>

              <div>
                <Label className="font-semibold">Mensagem</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                  {comunicacaoSelecionada.mensagem}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Destinatários ({comunicacaoSelecionada.destinatarios.length})</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  <div className="space-y-1">
                    {comunicacaoSelecionada.destinatarios_nomes?.map((nome, idx) => (
                      <div key={idx} className="text-sm">{nome}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Data de Envio</Label>
                  <p className="mt-1">{new Date(comunicacaoSelecionada.data_envio).toLocaleString('pt-PT')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Estado</Label>
                  <div className="mt-1">{getEstadoBadge(comunicacaoSelecionada.estado)}</div>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Criado por</Label>
                <p className="mt-1">{comunicacaoSelecionada.criado_por}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisualizacao(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
