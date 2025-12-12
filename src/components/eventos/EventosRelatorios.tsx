import { useMemo, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Event, User, EventoConvocatoria, EventoPresenca, EventoResultado } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBar, Users, CalendarBlank, Trophy } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

export function EventosRelatorios() {
  const [events] = useKV<Event[]>('club-events', []);
  const [convocatorias] = useKV<EventoConvocatoria[]>('club-convocatorias', []);
  const [presencas] = useKV<EventoPresenca[]>('club-presencas', []);
  const [resultados] = useKV<EventoResultado[]>('club-resultados', []);
  const [users] = useKV<User[]>('club-users', []);
  const [selectedEvent, setSelectedEvent] = useState<string>('todos');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('todos');
  const [selectedEpoca, setSelectedEpoca] = useState<string>(new Date().getFullYear().toString());

  const atletasAtivos = useMemo(() => {
    return (users || []).filter(u => 
      u.tipo_membro.includes('atleta') && 
      u.estado === 'ativo'
    ).sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
  }, [users]);

  const eventStats = useMemo(() => {
    const completedEvents = (events || []).filter(e => e.estado === 'concluido');
    
    return completedEvents.map(event => {
      const eventConvocatorias = (convocatorias || []).filter(c => c.evento_id === event.id);
      const eventPresencas = (presencas || []).filter(p => p.evento_id === event.id);
      const eventResultados = (resultados || []).filter(r => r.evento_id === event.id);
      
      const confirmados = eventConvocatorias.filter(c => c.estado_confirmacao === 'confirmado').length;
      const presentes = eventPresencas.filter(p => p.estado === 'presente').length;
      const ausentes = eventPresencas.filter(p => p.estado === 'ausente').length;
      const justificados = eventPresencas.filter(p => p.estado === 'justificado').length;
      const taxa_presenca = eventPresencas.length > 0 
        ? (presentes / eventPresencas.length * 100).toFixed(0)
        : 0;

      return {
        event,
        total_convocatorias: eventConvocatorias.length,
        confirmados,
        presentes,
        ausentes,
        justificados,
        taxa_presenca,
        total_resultados: eventResultados.length,
      };
    });
  }, [events, convocatorias, presencas, resultados]);

  const athleteStats = useMemo(() => {
    return atletasAtivos.map(user => {
      const userConvocatorias = (convocatorias || []).filter(c => c.user_id === user.id);
      const userPresencas = (presencas || []).filter(p => p.user_id === user.id);
      const userResultados = (resultados || []).filter(r => r.user_id === user.id);

      const confirmadas = userConvocatorias.filter(c => c.estado_confirmacao === 'confirmado').length;
      const presentes = userPresencas.filter(p => p.estado === 'presente').length;
      const ausentes = userPresencas.filter(p => p.estado === 'ausente').length;
      const justificados = userPresencas.filter(p => p.estado === 'justificado').length;
      const taxa_presenca = userConvocatorias.length > 0
        ? (presentes / userConvocatorias.length * 100).toFixed(0)
        : 0;

      return {
        user,
        total_convocatorias: userConvocatorias.length,
        confirmadas,
        presentes,
        ausentes,
        justificados,
        taxa_presenca,
        total_resultados: userResultados.length,
      };
    }).filter(stat => stat.total_convocatorias > 0);
  }, [atletasAtivos, convocatorias, presencas, resultados]);

  const generalStats = useMemo(() => {
    const totalEvents = (events || []).length;
    const completedEvents = (events || []).filter(e => e.estado === 'concluido').length;
    const scheduledEvents = (events || []).filter(e => e.estado === 'agendado').length;
    const cancelledEvents = (events || []).filter(e => e.estado === 'cancelado').length;

    const totalConvocatorias = (convocatorias || []).length;
    const totalConfirmadas = (convocatorias || []).filter(c => c.estado_confirmacao === 'confirmado').length;
    const totalPresencas = (presencas || []).filter(p => p.estado === 'presente').length;
    const totalResultados = (resultados || []).length;

    const avgParticipantesPerEvento = completedEvents > 0
      ? ((presencas || []).filter(p => p.estado === 'presente').length / completedEvents).toFixed(1)
      : 0;

    return {
      totalEvents,
      completedEvents,
      scheduledEvents,
      cancelledEvents,
      totalConvocatorias,
      totalConfirmadas,
      totalPresencas,
      totalResultados,
      avgParticipantesPerEvento,
    };
  }, [events, convocatorias, presencas, resultados]);

  const filteredEventStats = useMemo(() => {
    return eventStats.filter(stat => 
      selectedEvent === 'todos' || stat.event.id === selectedEvent
    );
  }, [eventStats, selectedEvent]);

  const filteredAthleteStats = useMemo(() => {
    return athleteStats.filter(stat =>
      selectedAthlete === 'todos' || stat.user.id === selectedAthlete
    );
  }, [athleteStats, selectedAthlete]);

  return (
    <div className="space-y-3">
      <Tabs defaultValue="geral" className="space-y-3">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="eventos">Por Evento</TabsTrigger>
          <TabsTrigger value="atletas">Por Atleta</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold mt-1">{generalStats.totalEvents}</p>
                </div>
                <CalendarBlank className="text-muted-foreground" size={32} weight="thin" />
              </div>
              <div className="flex gap-2 mt-3 text-xs">
                <Badge variant="secondary">{generalStats.completedEvents} concluídos</Badge>
                <Badge variant="outline">{generalStats.scheduledEvents} agendados</Badge>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Convocatórias</p>
                  <p className="text-2xl font-bold mt-1">{generalStats.totalConvocatorias}</p>
                </div>
                <Users className="text-muted-foreground" size={32} weight="thin" />
              </div>
              <div className="mt-3 text-xs">
                <Badge variant="secondary">{generalStats.totalConfirmadas} confirmadas</Badge>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Presenças</p>
                  <p className="text-2xl font-bold mt-1">{generalStats.totalPresencas}</p>
                </div>
                <ChartBar className="text-muted-foreground" size={32} weight="thin" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Média: {generalStats.avgParticipantesPerEvento} por evento
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Resultados</p>
                  <p className="text-2xl font-bold mt-1">{generalStats.totalResultados}</p>
                </div>
                <Trophy className="text-muted-foreground" size={32} weight="thin" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Registos de competição
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Distribuição por Tipo de Evento</h3>
            <div className="space-y-2">
              {['prova', 'estagio', 'reuniao', 'evento_interno', 'treino', 'outro'].map(tipo => {
                const count = (events || []).filter(e => e.tipo === tipo).length;
                const percentage = generalStats.totalEvents > 0 
                  ? (count / generalStats.totalEvents * 100).toFixed(0)
                  : 0;

                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{tipo}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="eventos" className="space-y-3">
          <Card className="p-3">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Eventos</SelectItem>
                {eventStats.map(stat => (
                  <SelectItem key={stat.event.id} value={stat.event.id}>
                    {stat.event.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <ScrollArea className="h-[600px]">
            <div className="space-y-2 pr-4">
              {filteredEventStats.map(stat => (
                <Card key={stat.event.id} className="p-3">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm">{stat.event.titulo}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(stat.event.data_inicio), 'PPP', { locale: pt })}
                        {stat.event.local && ` • ${stat.event.local}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Convocados</p>
                        <p className="text-lg font-semibold">{stat.total_convocatorias}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Presentes</p>
                        <p className="text-lg font-semibold text-green-600">{stat.presentes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ausentes</p>
                        <p className="text-lg font-semibold text-red-600">{stat.ausentes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Justificados</p>
                        <p className="text-lg font-semibold text-amber-600">{stat.justificados}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Taxa</p>
                        <p className="text-lg font-semibold">{stat.taxa_presenca}%</p>
                      </div>
                    </div>

                    {stat.total_resultados > 0 && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Trophy size={14} className="text-primary" />
                        <span className="text-xs">{stat.total_resultados} resultados registados</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="atletas" className="space-y-3">
          <Card className="p-3">
            <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filtrar por atleta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Atletas</SelectItem>
                {athleteStats.map(stat => (
                  <SelectItem key={stat.user.id} value={stat.user.id}>
                    {stat.user.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <ScrollArea className="h-[600px]">
            <div className="space-y-2 pr-4">
              {filteredAthleteStats.map(stat => (
                <Card key={stat.user.id} className="p-3">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm">{stat.user.nome_completo}</h3>
                      <p className="text-xs text-muted-foreground">
                        {stat.user.numero_socio}
                        {stat.user.escalao && stat.user.escalao.length > 0 && (
                          <> • {stat.user.escalao.join(', ')}</>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Convocatórias</p>
                        <p className="text-lg font-semibold">{stat.total_convocatorias}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Presentes</p>
                        <p className="text-lg font-semibold text-green-600">{stat.presentes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ausentes</p>
                        <p className="text-lg font-semibold text-red-600">{stat.ausentes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Justificados</p>
                        <p className="text-lg font-semibold text-amber-600">{stat.justificados}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Participação</p>
                        <p className="text-lg font-semibold">{stat.taxa_presenca}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {stat.total_resultados > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Trophy size={12} className="mr-1" />
                          {stat.total_resultados} resultados
                        </Badge>
                      )}
                      {stat.ausentes > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {stat.ausentes} ausências
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {filteredAthleteStats.length === 0 && (
                <Card className="p-6 sm:p-8">
                  <div className="text-center">
                    <Users className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
                    <h3 className="font-semibold text-sm mb-0.5">Nenhum dado disponível</h3>
                    <p className="text-muted-foreground text-xs">
                      Não há atletas com convocatórias registadas.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
