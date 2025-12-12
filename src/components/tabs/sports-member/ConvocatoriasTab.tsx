import { User, ConvocatoriaAtleta, ConvocatoriaGrupo, Event } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface Prova {
  id: string;
  name: string;
}

interface NavigationContext {
  eventId?: string;
  convocatoriaId?: string;
  tab?: string;
}

interface ConvocatoriasTabProps {
  user: User;
  onNavigate?: (view: string, context?: NavigationContext) => void;
}

export function ConvocatoriasTab({ user, onNavigate }: ConvocatoriasTabProps) {
  const [convocatoriasAtleta] = useKV<ConvocatoriaAtleta[]>('club-convocatorias-atleta', []);
  const [convocatoriasGrupo] = useKV<ConvocatoriaGrupo[]>('club-convocatorias-grupo', []);
  const [events] = useKV<Event[]>('club-events', []);
  const [provas] = useKV<Prova[]>('settings-provas', []);

  const atletaConvocatorias = useMemo(() => {
    const atletaConvs = (convocatoriasAtleta || []).filter(ca => ca.atleta_id === user.id);
    return atletaConvs.map(ca => {
      const grupo = (convocatoriasGrupo || []).find(g => g.id === ca.convocatoria_grupo_id);
      const evento = (events || []).find(e => e.id === grupo?.evento_id);
      return { ...ca, grupo, evento };
    }).filter(ca => ca.evento && ca.grupo)
      .sort((a, b) => new Date(b.evento!.data_inicio).getTime() - new Date(a.evento!.data_inicio).getTime());
  }, [convocatoriasAtleta, convocatoriasGrupo, events, user.id]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'concluido':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case 'em_curso':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Em Curso</Badge>;
      case 'agendado':
        return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Agendado</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Rascunho</Badge>;
    }
  };

  if (atletaConvocatorias.length === 0) {
    return (
      <div className="p-8 border rounded-lg text-center">
        <p className="text-sm text-muted-foreground">Nenhuma convocatória registada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Lista de convocatórias onde o atleta foi incluído</p>
      <ScrollArea className="h-[400px] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Evento</TableHead>
              <TableHead className="text-xs">Data</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
              <TableHead className="text-xs">Provas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atletaConvocatorias.map((ca) => {
              const evento = ca.evento!;
              const provaNames = ca.provas
                .map(provaId => provas?.find(p => p.id === provaId)?.name)
                .filter(Boolean);

              return (
                <TableRow 
                  key={ca.convocatoria_grupo_id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('events', {
                        convocatoriaId: ca.convocatoria_grupo_id,
                        tab: 'convocatorias'
                      });
                    } else {
                      toast.error('Navegação não disponível');
                    }
                  }}
                >
                  <TableCell className="text-xs font-medium">{evento.titulo}</TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(evento.data_inicio), 'dd/MM/yyyy', { locale: pt })}
                  </TableCell>
                  <TableCell className="text-xs">{getEstadoBadge(evento.estado)}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1">
                      {provaNames.slice(0, 2).map((prova, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{prova}</Badge>
                      ))}
                      {provaNames.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{provaNames.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
