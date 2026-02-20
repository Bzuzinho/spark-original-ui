import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
  Plus,
  Eye,
  Trash,
  Users,
  PencilSimple,
  FilePdf,
  Printer,
  X,
} from '@phosphor-icons/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Checkbox } from '@/Components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import axios from 'axios';

interface Convocation {
  id: string;
  evento_id: string;
  user_id: string;
  data_convocatoria: string;
  estado_confirmacao: string;
  transporte_clube?: boolean;
  event?: {
    id: string;
    titulo: string;
    data_inicio: string;
    tipo: string;
  };
  user?: {
    id: string;
    nome_completo: string;
  };
}

interface ConvocationGroup {
  evento_id: string;
  evento_titulo: string;
  evento_data: string;
  evento_tipo: string;
  convocations: Convocation[];
}

interface ConvocationProps {
  events: any[];
  convocations?: Convocation[];
  users?: any[];
}

export function ConvocatoriasList({
  events = [],
  convocations: initialConvocations = [],
  users = [],
}: ConvocationProps) {
  const [convocations, setConvocations] = useState<Convocation[]>(initialConvocations);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ConvocationGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ConvocationGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Agrupar convocatórias por evento
  const convocationGroups: ConvocationGroup[] = events
    .filter((e) =>
      convocations.some((c) => c.evento_id === e.id)
    )
    .map((event) => {
      const eventConvocations = convocations.filter((c) => c.evento_id === event.id);
      return {
        evento_id: event.id,
        evento_titulo: event.titulo,
        evento_data: event.data_inicio,
        evento_tipo: event.tipo,
        convocations: eventConvocations,
      };
    })
    .filter((group) => {
      const matchesTipo = tipoFilter === 'todos' || group.evento_tipo === tipoFilter;
      const matchesSearch = group.evento_titulo
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesTipo && matchesSearch;
    });

  const handleView = (group: ConvocationGroup) => {
    setSelectedGroup(group);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (group: ConvocationGroup) => {
    setDeletingGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingGroup) return;

    setIsLoading(true);
    try {
      // Eliminar todas as convocatórias do grupo
      const promises = deletingGroup.convocations.map((conv) =>
        axios.delete(`/api/event-convocations/${conv.id}`)
      );
      await Promise.all(promises);

      toast.success('Convocatórias eliminadas com sucesso!');
      setIsDeleteDialogOpen(false);
      setDeletingGroup(null);

      // Recarregar convocatórias
      const response = await axios.get('/api/event-convocations');
      setConvocations(response.data);
    } catch (error: any) {
      console.error('Erro ao eliminar convocatórias:', error);
      toast.error(error.response?.data?.message || 'Erro ao eliminar convocatórias');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (group: ConvocationGroup) => {
    // Criar HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Convocatória - ${group.evento_titulo}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: Arial, sans-serif; font-size: 12pt; }
          h1 { color: #1e40af; text-align: center; margin-bottom: 20px; }
          h2 { color: #475569; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
          .info { margin: 20px 0; }
          .info-row { margin: 10px 0; }
          .info-label { font-weight: bold; display: inline-block; width: 120px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #1e40af; color: white; }
          .status-confirmado { color: #16a34a; font-weight: bold; }
          .status-pendente { color: #eab308; font-weight: bold; }
          .status-recusado { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 10pt; color: #666; }
        </style>
      </head>
      <body>
        <h1>CONVOCATÓRIA</h1>
        
        <div class="info">
          <div class="info-row">
            <span class="info-label">Evento:</span>
            ${group.evento_titulo}
          </div>
          <div class="info-row">
            <span class="info-label">Tipo:</span>
            ${group.evento_tipo}
          </div>
          <div class="info-row">
            <span class="info-label">Data:</span>
            ${format(new Date(group.evento_data), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </div>
          <div class="info-row">
            <span class="info-label">Total Convocados:</span>
            ${group.convocations.length}
          </div>
        </div>

        <h2>Atletas Convocados</h2>
        <table>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Nome</th>
              <th>Estado</th>
              <th>Data Convocatória</th>
            </tr>
          </thead>
          <tbody>
            ${group.convocations
              .map(
                (conv, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${conv.user?.nome_completo || 'N/A'}</td>
                <td class="status-${conv.estado_confirmacao}">
                  ${conv.estado_confirmacao.toUpperCase()}
                </td>
                <td>${format(new Date(conv.data_convocatoria), 'dd/MM/yyyy')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Documento gerado automaticamente em ${format(
            new Date(),
            "dd/MM/yyyy 'às' HH:mm"
          )}</p>
        </div>
      </body>
      </html>
    `;

    // Abrir em nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    toast.success('PDF gerado! Use Ctrl+P para salvar ou imprimir.');
  };

  const getEstadoStats = (group: ConvocationGroup) => {
    const confirmados = group.convocations.filter(
      (c) => c.estado_confirmacao === 'confirmado'
    ).length;
    const pendentes = group.convocations.filter(
      (c) => c.estado_confirmacao === 'pendente'
    ).length;
    const recusados = group.convocations.filter(
      (c) => c.estado_confirmacao === 'recusado'
    ).length;

    return { confirmados, pendentes, recusados };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTipoFilter('todos');
  };

  const hasActiveFilters = searchTerm || tipoFilter !== 'todos';

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Convocatórias</h3>
            <p className="text-sm text-muted-foreground">
              {convocationGroups.length} evento(s) com convocatórias
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 items-center flex-wrap mb-4">
          <Input
            placeholder="Pesquisar evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64"
          />
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="treino">Treino</SelectItem>
              <SelectItem value="prova">Prova</SelectItem>
              <SelectItem value="competicao">Competição</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X size={14} className="mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Tabela de Convocatórias */}
        <div className="space-y-3">
          {convocationGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma convocatória encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-center">Atletas</TableHead>
                  <TableHead className="text-center">Confirmados</TableHead>
                  <TableHead className="text-center">Pendentes</TableHead>
                  <TableHead className="text-center">Recusados</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {convocationGroups.map((group) => {
                  const stats = getEstadoStats(group);
                  return (
                    <TableRow key={group.evento_id}>
                      <TableCell className="font-medium">{group.evento_titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {group.evento_tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(group.evento_data), "dd 'de' MMM", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          <Users size={14} className="mr-1" />
                          {group.convocations.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{stats.confirmados}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-yellow-600 font-medium">{stats.pendentes}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-medium">{stats.recusados}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(group)}
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => generatePDF(group)}
                            title="Gerar PDF"
                          >
                            <FilePdf size={16} className="text-red-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(group)}
                            title="Eliminar"
                            className="text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Dialog - Ver Detalhes */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Convocatória</DialogTitle>
            <DialogDescription>
              {selectedGroup && (
                <>
                  {selectedGroup.evento_titulo} -{' '}
                  {format(new Date(selectedGroup.evento_data), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedGroup && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-3">
                  <div className="text-sm text-muted-foreground">Confirmados</div>
                  <div className="text-2xl font-bold text-green-600">
                    {getEstadoStats(selectedGroup).confirmados}
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {getEstadoStats(selectedGroup).pendentes}
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-sm text-muted-foreground">Recusados</div>
                  <div className="text-2xl font-bold text-red-600">
                    {getEstadoStats(selectedGroup).recusados}
                  </div>
                </Card>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atleta</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data Convocatória</TableHead>
                      <TableHead>Transporte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGroup.convocations.map((conv) => (
                      <TableRow key={conv.id}>
                        <TableCell>{conv.user?.nome_completo || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              conv.estado_confirmacao === 'confirmado'
                                ? 'default'
                                : conv.estado_confirmacao === 'recusado'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {conv.estado_confirmacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(conv.data_convocatoria), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {conv.transporte_clube ? (
                            <Badge variant="outline" className="text-blue-600">
                              Sim
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Não
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedGroup && (
              <Button onClick={() => generatePDF(selectedGroup)}>
                <FilePdf size={16} className="mr-2" />
                Gerar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog - Confirmação de Eliminação */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar todas as convocatórias deste evento? Esta
              ação não pode ser desfeita.
              {deletingGroup && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Evento:</strong> {deletingGroup.evento_titulo}
                  <br />
                  <strong>Convocatórias:</strong> {deletingGroup.convocations.length}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

