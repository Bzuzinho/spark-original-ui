import { User, EventoPresenca, Event } from '@/types';
import { useKV } from '@/hooks/useKV';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useMemo } from 'react';

interface RegistoPresencasTabProps {
  user: User;
}

export function RegistoPresencasTab({ user }: RegistoPresencasTabProps) {
  const [presencas] = useKV<EventoPresenca[]>('club-presencas', []);
  const [events] = useKV<Event[]>('club-events', []);

  const atletaPresencas = useMemo(() => {
    return (presencas || [])
      .filter(p => p.user_id === user.id)
      .map(p => {
        const evento = (events || []).find(e => e.id === p.evento_id);
        return { ...p, evento };
      })
      .filter(p => p.evento)
      .sort((a, b) => new Date(b.evento!.data_inicio).getTime() - new Date(a.evento!.data_inicio).getTime());
  }, [presencas, events, user.id]);

  if (atletaPresencas.length === 0) {
    return (
      <div className="p-8 border rounded-lg text-center">
        <p className="text-sm text-muted-foreground">Nenhuma presença registada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Registo de presenças do atleta em treinos e eventos</p>
      <ScrollArea className="h-[400px] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Evento</TableHead>
              <TableHead className="text-xs">Data</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
              <TableHead className="text-xs">Hora Chegada</TableHead>
              <TableHead className="text-xs">Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atletaPresencas.map((p) => {
              const evento = p.evento!;
              
              return (
                <TableRow key={p.id}>
                  <TableCell className="text-xs font-medium">{evento.titulo}</TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(evento.data_inicio), 'dd/MM/yyyy', { locale: pt })}
                  </TableCell>
                  <TableCell className="text-xs">
                    {p.estado === 'presente' ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Presente
                      </Badge>
                    ) : p.estado === 'justificado' ? (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                        Justificado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        Ausente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{p.hora_chegada || '-'}</TableCell>
                  <TableCell className="text-xs">{p.observacoes || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
