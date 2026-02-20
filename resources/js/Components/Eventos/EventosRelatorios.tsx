import { useMemo, useState } from 'react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  DownloadSimple,
  Printer,
  ChartBar,
  Calendar,
  Users,
  Trophy,
  CheckCircle,
  ListChecks,
} from '@phosphor-icons/react';

interface EventosRelatoriosProps {
  events: any[];
  convocatorias?: any[];
  attendances?: any[];
  results?: any[];
  users?: any[];
}

export function EventosRelatorios({
  events = [],
  convocatorias = [],
  attendances = [],
  results = [],
  users = [],
}: EventosRelatoriosProps) {
  const [activeTab, setActiveTab] = useState('geral');

  // Relatório Geral
  const relatorioGeral = useMemo(() => {
    const totalEventos = events.length;
    const eventosAgendados = events.filter((e) => e.estado === 'agendado').length;
    const eventosEmCurso = events.filter((e) => e.estado === 'em_curso').length;
    const eventosConcluidos = events.filter((e) => e.estado === 'concluido').length;
    const eventosCancelados = events.filter((e) => e.estado === 'cancelado').length;

    const totalConvocatorias = convocatorias.length;
    const convocatoriasConfirmadas = convocatorias.filter(
      (c: any) => c.estado_confirmacao === 'confirmado'
    ).length;
    const convocatoriasPendentes = convocatorias.filter(
      (c: any) => c.estado_confirmacao === 'pendente'
    ).length;
    const convocatoriasRecusadas = convocatorias.filter(
      (c: any) => c.estado_confirmacao === 'recusado'
    ).length;

    const totalPresencas = attendances.length;
    const presentes = attendances.filter((a: any) => a.estado === 'presente').length;
    const ausentes = attendances.filter((a: any) => a.estado === 'ausente').length;
    const justificados = attendances.filter((a: any) => a.estado === 'justificado').length;
    const mediaPresencas =
      totalPresencas > 0 ? ((presentes / totalPresencas) * 100).toFixed(1) : 0;

    const totalResultados = results.length;
    const primeirosLugares = results.filter((r: any) => r.classificacao === 1).length;
    const segundosLugares = results.filter((r: any) => r.classificacao === 2).length;
    const terceirosLugares = results.filter((r: any) => r.classificacao === 3).length;

    // Distribuição por tipo
    const distribuicaoPorTipo = events.reduce((acc: any, event: any) => {
      const tipo = event.tipo || 'Outro';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    return {
      totalEventos,
      eventosAgendados,
      eventosEmCurso,
      eventosConcluidos,
      eventosCancelados,
      totalConvocatorias,
      convocatoriasConfirmadas,
      convocatoriasPendentes,
      convocatoriasRecusadas,
      totalPresencas,
      presentes,
      ausentes,
      justificados,
      mediaPresencas,
      totalResultados,
      primeirosLugares,
      segundosLugares,
      terceirosLugares,
      distribuicaoPorTipo,
    };
  }, [events, convocatorias, attendances, results]);

  // Relatório por Evento
  const relatorioPorEvento = useMemo(() => {
    return events.map((event: any) => {
      const eventConvocatorias = convocatorias.filter(
        (c: any) => c.evento_id === event.id
      );
      const eventAttendances = attendances.filter((a: any) => a.evento_id === event.id);
      const presentes = eventAttendances.filter((a: any) => a.estado === 'presente').length;
      const ausentes = eventAttendances.filter((a: any) => a.estado === 'ausente').length;
      const justificados = eventAttendances.filter(
        (a: any) => a.estado === 'justificado'
      ).length;
      const taxaPresenca =
        eventAttendances.length > 0
          ? ((presentes / eventAttendances.length) * 100).toFixed(1)
          : 0;

      return {
        id: event.id,
        titulo: event.titulo,
        tipo: event.tipo,
        data: event.data_inicio,
        estado: event.estado,
        convocatorias: eventConvocatorias.length,
        presentes,
        ausentes,
        justificados,
        taxaPresenca,
      };
    });
  }, [events, convocatorias, attendances]);

  // Relatório por Atleta
  const relatorioPorAtleta = useMemo(() => {
    return users.map((user: any) => {
      const userConvocatorias = convocatorias.filter((c: any) => c.user_id === user.id);
      const userAttendances = attendances.filter((a: any) => a.user_id === user.id);
      const presentes = userAttendances.filter((a: any) => a.estado === 'presente').length;
      const ausentes = userAttendances.filter((a: any) => a.estado === 'ausente').length;
      const justificados = userAttendances.filter(
        (a: any) => a.estado === 'justificado'
      ).length;
      const taxaPresenca =
        userAttendances.length > 0
          ? ((presentes / userAttendances.length) * 100).toFixed(1)
          : 0;

      const userResults = results.filter((r: any) => r.user_id === user.id);
      const podios = userResults.filter(
        (r: any) => r.classificacao && r.classificacao <= 3
      ).length;

      return {
        id: user.id,
        nome: user.nome_completo,
        escalao: Array.isArray(user.escalao) ? user.escalao.join(', ') : user.escalao || '-',
        convocatorias: userConvocatorias.length,
        presentes,
        ausentes,
        justificados,
        taxaPresenca,
        resultados: userResults.length,
        podios,
      };
    });
  }, [users, convocatorias, attendances, results]);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    const csvContent = headers + '\n' + rows;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="geral">
              <ChartBar size={16} className="mr-2" />
              Relatório Geral
            </TabsTrigger>
            <TabsTrigger value="evento">
              <Calendar size={16} className="mr-2" />
              Por Evento
            </TabsTrigger>
            <TabsTrigger value="atleta">
              <Users size={16} className="mr-2" />
              Por Atleta
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (activeTab === 'evento') {
                  exportToCSV(relatorioPorEvento, 'relatorio-eventos.csv');
                } else if (activeTab === 'atleta') {
                  exportToCSV(relatorioPorAtleta, 'relatorio-atletas.csv');
                }
              }}
            >
              <DownloadSimple size={16} className="mr-2" />
              Exportar CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer size={16} className="mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Relatório Geral */}
        <TabsContent value="geral" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Card: Total de Eventos */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total de Eventos</h3>
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold">{relatorioGeral.totalEventos}</div>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Agendados:</span>
                  <span className="font-medium">{relatorioGeral.eventosAgendados}</span>
                </div>
                <div className="flex justify-between">
                  <span>Em Curso:</span>
                  <span className="font-medium">{relatorioGeral.eventosEmCurso}</span>
                </div>
                <div className="flex justify-between">
                  <span>Concluídos:</span>
                  <span className="font-medium">{relatorioGeral.eventosConcluidos}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelados:</span>
                  <span className="font-medium">{relatorioGeral.eventosCancelados}</span>
                </div>
              </div>
            </Card>

            {/* Card: Total de Convocatórias */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total de Convocatórias
                </h3>
                <ListChecks size={20} className="text-purple-600" />
              </div>
              <div className="text-3xl font-bold">{relatorioGeral.totalConvocatorias}</div>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Confirmadas:</span>
                  <span className="font-medium text-green-600">
                    {relatorioGeral.convocatoriasConfirmadas}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pendentes:</span>
                  <span className="font-medium text-yellow-600">
                    {relatorioGeral.convocatoriasPendentes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Recusadas:</span>
                  <span className="font-medium text-red-600">
                    {relatorioGeral.convocatoriasRecusadas}
                  </span>
                </div>
              </div>
            </Card>

            {/* Card: Total de Presenças */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total de Presenças</h3>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="text-3xl font-bold">{relatorioGeral.totalPresencas}</div>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Presentes:</span>
                  <span className="font-medium text-green-600">
                    {relatorioGeral.presentes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ausentes:</span>
                  <span className="font-medium text-red-600">
                    {relatorioGeral.ausentes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Justificados:</span>
                  <span className="font-medium text-yellow-600">
                    {relatorioGeral.justificados}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span>Média:</span>
                  <span className="font-medium">{relatorioGeral.mediaPresencas}%</span>
                </div>
              </div>
            </Card>

            {/* Card: Total de Resultados */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total de Resultados
                </h3>
                <Trophy size={20} className="text-yellow-600" />
              </div>
              <div className="text-3xl font-bold">{relatorioGeral.totalResultados}</div>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>🥇 1º Lugares:</span>
                  <span className="font-medium text-yellow-600">
                    {relatorioGeral.primeirosLugares}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🥈 2º Lugares:</span>
                  <span className="font-medium text-gray-500">
                    {relatorioGeral.segundosLugares}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🥉 3º Lugares:</span>
                  <span className="font-medium text-amber-600">
                    {relatorioGeral.terceirosLugares}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Distribuição por Tipo */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo de Evento</h3>
            <div className="space-y-2">
              {Object.entries(relatorioGeral.distribuicaoPorTipo).map(([tipo, count]) => (
                <div key={tipo} className="flex items-center gap-4">
                  <div className="min-w-32">
                    <Badge variant="outline" className="capitalize">
                      {tipo}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(Number(count) / relatorioGeral.totalEventos) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="min-w-16 text-right font-semibold">{String(count)}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Relatório por Evento */}
        <TabsContent value="evento">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Resumo por Evento</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Convocatórias</TableHead>
                    <TableHead className="text-center">Presentes</TableHead>
                    <TableHead className="text-center">Ausentes</TableHead>
                    <TableHead className="text-center">Justificados</TableHead>
                    <TableHead className="text-center">Taxa Presença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorioPorEvento.map((evento) => (
                    <TableRow key={evento.id}>
                      <TableCell className="font-medium">{evento.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {evento.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{evento.data}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            evento.estado === 'concluido'
                              ? 'default'
                              : evento.estado === 'em_curso'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {evento.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{evento.convocatorias}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {evento.presentes}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {evento.ausentes}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">
                        {evento.justificados}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {evento.taxaPresenca}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Relatório por Atleta */}
        <TabsContent value="atleta">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Resumo por Atleta</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Escalão</TableHead>
                    <TableHead className="text-center">Convocatórias</TableHead>
                    <TableHead className="text-center">Presentes</TableHead>
                    <TableHead className="text-center">Ausentes</TableHead>
                    <TableHead className="text-center">Justificados</TableHead>
                    <TableHead className="text-center">Taxa Presença</TableHead>
                    <TableHead className="text-center">Resultados</TableHead>
                    <TableHead className="text-center">Pódios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorioPorAtleta.map((atleta) => (
                    <TableRow key={atleta.id}>
                      <TableCell className="font-medium">{atleta.nome}</TableCell>
                      <TableCell>{atleta.escalao}</TableCell>
                      <TableCell className="text-center">{atleta.convocatorias}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {atleta.presentes}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {atleta.ausentes}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">
                        {atleta.justificados}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {atleta.taxaPresenca}%
                      </TableCell>
                      <TableCell className="text-center">{atleta.resultados}</TableCell>
                      <TableCell className="text-center">
                        {atleta.podios > 0 ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            {atleta.podios}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

