import { useState, useMemo, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Event, User, ConvocatoriaGrupo, ConvocatoriaAtleta, EventoResultado, ResultadoProva } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, MagnifyingGlass, Eye, FileArrowDown, Trash, Users, PencilSimple } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreateConvocatoriaDialog } from './CreateConvocatoriaDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Prova {
  id: string;
  name: string;
  distancia: number;
  unidade: 'metros' | 'quilometros';
  modalidade: string;
}

interface ConvocatoriasListProps {
  selectedConvocatoriaId?: string;
}

export function ConvocatoriasList({ selectedConvocatoriaId }: ConvocatoriasListProps) {
  const [events] = useKV<Event[]>('club-events', []);
  const [convocatoriasGrupo, setConvocatoriasGrupo] = useKV<ConvocatoriaGrupo[]>('club-convocatorias-grupo', []);
  const [convocatoriasAtleta] = useKV<ConvocatoriaAtleta[]>('club-convocatorias-atleta', []);
  const [resultados, setResultados] = useKV<EventoResultado[]>('club-resultados', []);
  const [resultadosProvas, setResultadosProvas] = useKV<ResultadoProva[]>('club-resultados-provas', []);
  const [users] = useKV<User[]>('club-users', []);
  const [provas] = useKV<Prova[]>('settings-provas', []);
  const [clubInfo] = useKV<any>('settings-club-info', null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<ConvocatoriaGrupo | null>(null);
  const [editingConvocatoria, setEditingConvocatoria] = useState<ConvocatoriaGrupo | null>(null);

  useEffect(() => {
    if (selectedConvocatoriaId) {
      const conv = (convocatoriasGrupo || []).find(c => c.id === selectedConvocatoriaId);
      if (conv) {
        setSelectedConvocatoria(conv);
        setDetailsDialogOpen(true);
      }
    }
  }, [selectedConvocatoriaId, convocatoriasGrupo]);

  const filteredConvocatorias = useMemo(() => {
    return (convocatoriasGrupo || []).filter(conv => {
      const event = events?.find(e => e.id === conv.evento_id);
      
      const matchesSearch = 
        event?.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = eventFilter === 'todos' || conv.evento_id === eventFilter;
      
      return matchesSearch && matchesEvent;
    }).sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());
  }, [convocatoriasGrupo, events, searchTerm, eventFilter]);

  const activeEvents = useMemo(() => {
    return (events || [])
      .filter(e => e.estado === 'agendado' && e.tipo === 'prova')
      .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
  }, [events]);

  const handleDeleteConvocatoria = async (convId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta convocatória?')) return;

    const convocatoria = convocatoriasGrupo?.find(c => c.id === convId);
    if (!convocatoria) return;

    setConvocatoriasGrupo(current => (current || []).filter(c => c.id !== convId));
    
    const atletasAtletaRef = await window.spark.kv.get<ConvocatoriaAtleta[]>('club-convocatorias-atleta');
    const updated = (atletasAtletaRef || []).filter(ca => ca.convocatoria_grupo_id !== convId);
    await window.spark.kv.set('club-convocatorias-atleta', updated);

    const currentResultados = await window.spark.kv.get<EventoResultado[]>('club-resultados');
    const updatedResultados = (currentResultados || []).filter(r => r.evento_id !== convocatoria.evento_id);
    setResultados(() => updatedResultados);

    const currentResultadosProvas = await window.spark.kv.get<ResultadoProva[]>('club-resultados-provas');
    const updatedResultadosProvas = (currentResultadosProvas || []).filter(r => r.evento_id !== convocatoria.evento_id);
    setResultadosProvas(() => updatedResultadosProvas);

    toast.success('Convocatória eliminada com sucesso!');
    setDetailsDialogOpen(false);
  };

  const exportToPDF = (conv: ConvocatoriaGrupo) => {
    const event = events?.find(e => e.id === conv.evento_id);
    const atletasConv = (convocatoriasAtleta || []).filter(
      ca => ca.convocatoria_grupo_id === conv.id
    );

    if (!event) {
      toast.error('Evento não encontrado');
      return;
    }

    const clubName = clubInfo?.name || 'Clube';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const atletasHTML = atletasConv.map(ca => {
      const atleta = users?.find(u => u.id === ca.atleta_id);
      const atletaProvasList = ca.provas
        .map(provaId => provas?.find(p => p.id === provaId)?.name)
        .filter(Boolean);
      
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${atleta?.nome_completo || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${atletaProvasList.join(', ') || '-'}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Convocatória - ${event.titulo}</title>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header h2 {
              margin: 10px 0 0 0;
              font-size: 18px;
              color: #666;
              font-weight: normal;
            }
            .info-section {
              margin: 20px 0;
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
            }
            .info-row {
              margin: 8px 0;
            }
            .info-label {
              font-weight: 600;
              display: inline-block;
              width: 150px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #333;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${clubName}</h1>
            <h2>Convocatória</h2>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Evento:</span>
              <span>${event.titulo}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data:</span>
              <span>${new Date(event.data_inicio).toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            ${event.hora_inicio ? `
              <div class="info-row">
                <span class="info-label">Hora:</span>
                <span>${event.hora_inicio}</span>
              </div>
            ` : ''}
            ${event.local ? `
              <div class="info-row">
                <span class="info-label">Local:</span>
                <span>${event.local}</span>
              </div>
            ` : ''}
            ${conv.hora_encontro ? `
              <div class="info-row">
                <span class="info-label">Hora de Encontro:</span>
                <span>${conv.hora_encontro}</span>
              </div>
            ` : ''}
            ${conv.local_encontro ? `
              <div class="info-row">
                <span class="info-label">Local de Encontro:</span>
                <span>${conv.local_encontro}</span>
              </div>
            ` : ''}
          </div>

          ${conv.observacoes ? `
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Observações:</span>
              </div>
              <div style="margin-top: 8px;">${conv.observacoes}</div>
            </div>
          ` : ''}

          <h3>Lista de Atletas Convocados</h3>
          <table>
            <thead>
              <tr>
                <th>Atleta</th>
                <th>Provas</th>
              </tr>
            </thead>
            <tbody>
              ${atletasHTML}
            </tbody>
          </table>

          <div class="footer">
            <p>Gerado em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredConvocatorias.length} de {convocatoriasGrupo?.length || 0} convocatórias
        </div>
        
        <Button onClick={() => setDialogOpen(true)} className="h-8 text-xs">
          <Plus className="mr-1.5 sm:mr-2" size={16} />
          <span className="hidden sm:inline">Nova Convocatória</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      <CreateConvocatoriaDialog 
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingConvocatoria(null);
          }
        }}
        onSuccess={() => {
          toast.success(editingConvocatoria ? 'Convocatória atualizada com sucesso!' : 'Convocatória criada com sucesso!');
          setEditingConvocatoria(null);
        }}
        editingConvocatoria={editingConvocatoria}
      />

      <Card className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Pesquisar convocatórias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 h-8 text-xs"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-8 text-xs">
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Eventos</SelectItem>
              {activeEvents.slice(0, 10).map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="space-y-2">
        {filteredConvocatorias.map(conv => {
          const event = events?.find(e => e.id === conv.evento_id);
          const atletasConvocados = (convocatoriasAtleta || []).filter(
            ca => ca.convocatoria_grupo_id === conv.id
          );
          
          if (!event) return null;

          return (
            <Card
              key={conv.id}
              className="p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => {
                setSelectedConvocatoria(conv);
                setDetailsDialogOpen(true);
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{event.titulo}</h3>
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Users size={14} />
                      {atletasConvocados.length} atletas
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Data: {format(new Date(event.data_inicio), 'PPP', { locale: pt })}</span>
                    {conv.hora_encontro && (
                      <>
                        <span>•</span>
                        <span>Encontro: {conv.hora_encontro}</span>
                      </>
                    )}
                  </div>
                  {conv.tipo_custo === 'por_salto' && conv.valor_inscricao_calculado && (
                    <div className="mt-1">
                      <Badge className="text-xs bg-primary/10 text-primary">
                        Taxa: €{conv.valor_inscricao_calculado.toFixed(2)}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingConvocatoria(conv);
                      setDialogOpen(true);
                    }}
                  >
                    <PencilSimple className="mr-1" size={14} />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportToPDF(conv);
                    }}
                  >
                    <FileArrowDown className="mr-1" size={14} />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConvocatoria(conv.id);
                    }}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredConvocatorias.length === 0 && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <Users className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhuma convocatória encontrada</h3>
            <p className="text-muted-foreground text-xs">
              Crie convocatórias para gerir a participação dos atletas em provas.
            </p>
          </div>
        </Card>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedConvocatoria && (() => {
            const event = events?.find(e => e.id === selectedConvocatoria.evento_id);
            const atletasConv = (convocatoriasAtleta || []).filter(
              ca => ca.convocatoria_grupo_id === selectedConvocatoria.id
            );
            
            if (!event) return null;

            return (
              <>
                <DialogHeader>
                  <DialogTitle>Detalhes da Convocatória</DialogTitle>
                  <DialogDescription>Visualização completa da convocatória e dos atletas convocados</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">{event.titulo}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Data:</span>
                          <p className="font-medium">
                            {format(new Date(event.data_inicio), 'PPP', { locale: pt })}
                          </p>
                        </div>
                        {event.hora_inicio && (
                          <div>
                            <span className="text-muted-foreground">Hora:</span>
                            <p className="font-medium">{event.hora_inicio}</p>
                          </div>
                        )}
                        {selectedConvocatoria.hora_encontro && (
                          <div>
                            <span className="text-muted-foreground">Hora Encontro:</span>
                            <p className="font-medium">{selectedConvocatoria.hora_encontro}</p>
                          </div>
                        )}
                        {selectedConvocatoria.local_encontro && (
                          <div>
                            <span className="text-muted-foreground">Local Encontro:</span>
                            <p className="font-medium">{selectedConvocatoria.local_encontro}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedConvocatoria.tipo_custo === 'por_salto' && (
                      <Card className="p-4 bg-primary/5">
                        <h4 className="font-semibold text-sm mb-3">Informação Financeira</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tipo de Custo:</span>
                            <span className="font-medium">Por Salto</span>
                          </div>
                          {selectedConvocatoria.valor_por_salto && (
                            <div className="flex justify-between">
                              <span>Valor por Salto:</span>
                              <span className="font-medium">€{selectedConvocatoria.valor_por_salto.toFixed(2)}</span>
                            </div>
                          )}
                          {selectedConvocatoria.valor_por_estafeta && (
                            <div className="flex justify-between">
                              <span>Valor por Estafeta:</span>
                              <span className="font-medium">€{selectedConvocatoria.valor_por_estafeta.toFixed(2)}</span>
                            </div>
                          )}
                          {selectedConvocatoria.valor_inscricao_calculado && (
                            <div className="flex justify-between pt-2 border-t font-semibold">
                              <span>Taxa Total:</span>
                              <span className="text-primary">€{selectedConvocatoria.valor_inscricao_calculado.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    {selectedConvocatoria.observacoes && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Observações</Label>
                        <p className="text-sm mt-1">{selectedConvocatoria.observacoes}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-sm mb-3">
                        Atletas Convocados ({atletasConv.length})
                      </h4>
                      <ScrollArea className="h-[300px] border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Atleta</TableHead>
                              <TableHead>Provas</TableHead>
                              <TableHead className="text-center">N° Provas</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {atletasConv.map(ca => {
                              const atleta = users?.find(u => u.id === ca.atleta_id);
                              if (!atleta) return null;

                              const atletaProvasList = ca.provas
                                .map(provaId => provas?.find(p => p.id === provaId)?.name)
                                .filter(Boolean);

                              return (
                                <TableRow key={ca.atleta_id}>
                                  <TableCell className="font-medium">
                                    {atleta.nome_completo}
                                    <div className="text-xs text-muted-foreground">
                                      {atleta.numero_socio}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {atletaProvasList.map((provaName, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {provaName}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {atletaProvasList.length}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="flex justify-between">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteConvocatoria(selectedConvocatoria.id)}
                  >
                    <Trash className="mr-2" size={16} />
                    Eliminar
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingConvocatoria(selectedConvocatoria);
                        setDetailsDialogOpen(false);
                        setDialogOpen(true);
                      }}
                    >
                      <PencilSimple className="mr-2" size={16} />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF(selectedConvocatoria)}
                    >
                      <FileArrowDown className="mr-2" size={16} />
                      Exportar PDF
                    </Button>
                    <Button size="sm" onClick={() => setDetailsDialogOpen(false)}>
                      Fechar
                    </Button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
