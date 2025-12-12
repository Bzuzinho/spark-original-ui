import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight, Plus, CalendarBlank } from '@phosphor-icons/react';
import type { Event, EventoResultado, User } from '@/lib/types';
import { format } from 'date-fns';

interface CompeticoesTabProps {
  onNavigate?: (view: string, context?: any) => void;
}

export function CompeticoesTab({ onNavigate }: CompeticoesTabProps) {
  const [events] = useKV<Event[]>('club-events', []);
  const [resultados] = useKV<EventoResultado[]>('club-resultados', []);
  const [users] = useKV<User[]>('club-users', []);

  const provas = (events || []).filter(e => e.tipo === 'prova');
  const sortedProvas = [...provas].sort((a, b) => {
    return new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime();
  });

  const getEstadoBadge = (estado: string) => {
    const colors = {
      rascunho: 'bg-gray-100 text-gray-700',
      agendado: 'bg-blue-100 text-blue-700',
      em_curso: 'bg-green-100 text-green-700',
      concluido: 'bg-slate-100 text-slate-600',
      cancelado: 'bg-red-100 text-red-700',
    };
    return colors[estado as keyof typeof colors] || colors.agendado;
  };

  const getTipoPiscina = (tipo?: string) => {
    if (!tipo) return '-';
    const tipos: Record<string, string> = {
      piscina_25m: '25m',
      piscina_50m: '50m',
      aguas_abertas: 'Águas Abertas',
    };
    return tipos[tipo] || tipo;
  };

  const getNumResultados = (eventoId: string) => {
    return (resultados || []).filter(r => r.evento_id === eventoId).length;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Competições & Provas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Eventos do tipo "prova" registados no sistema
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigate?.('events', { tab: 'eventos' })}
          >
            <Plus size={16} className="mr-1" />
            Nova Prova
          </Button>
        </div>

        {sortedProvas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Nenhuma prova registada</p>
            <p className="text-xs mt-1 mb-4">
              Crie eventos do tipo "Prova" no módulo Eventos
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('events', { tab: 'eventos' })}
            >
              Ir para Eventos
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Evento</TableHead>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Local</TableHead>
                  <TableHead className="text-xs">Piscina</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Resultados</TableHead>
                  <TableHead className="text-xs w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProvas.map((prova) => {
                  const numResultados = getNumResultados(prova.id);
                  
                  return (
                    <TableRow key={prova.id}>
                      <TableCell className="text-xs font-medium">
                        {prova.titulo}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(prova.data_inicio), 'dd/MM/yyyy')}
                        {prova.hora_inicio && ` às ${prova.hora_inicio}`}
                      </TableCell>
                      <TableCell className="text-xs">{prova.local || '-'}</TableCell>
                      <TableCell className="text-xs">
                        {getTipoPiscina(prova.tipo_piscina)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge className={`text-xs ${getEstadoBadge(prova.estado)}`}>
                          {prova.estado.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {numResultados > 0 ? (
                          <span className="font-medium">{numResultados}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onNavigate?.('events', { 
                            tab: 'eventos',
                            eventId: prova.id 
                          })}
                        >
                          <CalendarBlank size={16} className="mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Resultados de Provas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Todos os resultados registados
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate?.('events', { tab: 'resultados' })}
          >
            Gerir Resultados
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        {(resultados || []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-xs">Nenhum resultado registado</p>
            <p className="text-xs mt-1">
              Adicione resultados no módulo Eventos
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Total Resultados</p>
                <p className="text-2xl font-bold mt-1">{(resultados || []).length}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Provas com Resultados</p>
                <p className="text-2xl font-bold mt-1">
                  {new Set((resultados || []).map(r => r.evento_id)).size}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Atletas Participantes</p>
                <p className="text-2xl font-bold mt-1">
                  {new Set((resultados || []).map(r => r.user_id)).size}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                <p className="text-2xl font-bold mt-1">
                  {(resultados || []).filter(r => {
                    const dataResultado = new Date(r.registado_em);
                    const trintaDiasAtras = new Date();
                    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
                    return dataResultado >= trintaDiasAtras;
                  }).length}
                </p>
              </Card>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Atleta</TableHead>
                    <TableHead className="text-xs">Evento</TableHead>
                    <TableHead className="text-xs">Prova</TableHead>
                    <TableHead className="text-xs">Tempo</TableHead>
                    <TableHead className="text-xs">Classificação</TableHead>
                    <TableHead className="text-xs">Escalão</TableHead>
                    <TableHead className="text-xs">Piscina</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...(resultados || [])].sort((a, b) => 
                    new Date(b.registado_em).getTime() - new Date(a.registado_em).getTime()
                  ).map((resultado) => {
                    const atleta = users?.find(u => u.id === resultado.user_id);
                    const evento = events?.find(e => e.id === resultado.evento_id);
                    
                    if (!atleta || !evento) return null;
                    
                    return (
                      <TableRow key={resultado.id}>
                        <TableCell className="text-xs font-medium">
                          {atleta.nome_completo}
                        </TableCell>
                        <TableCell className="text-xs">
                          {evento.titulo}
                        </TableCell>
                        <TableCell className="text-xs">
                          {resultado.prova}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {resultado.tempo || '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {resultado.classificacao ? `${resultado.classificacao}º` : '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {resultado.escalao || '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {resultado.piscina || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <h4 className="text-xs font-semibold mb-2">Sobre Competições & Resultados</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• As provas são geridas no <strong>Módulo Eventos</strong> (tipo: Prova)</p>
          <p>• Use a convocatória para inscrever atletas nas provas</p>
          <p>• Os resultados são registados no separador Resultados do Módulo Eventos</p>
          <p>• Clique em "Ver" para abrir a prova no calendário de eventos</p>
        </div>
      </Card>
    </div>
  );
}
