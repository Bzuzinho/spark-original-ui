import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

interface Result {
  id: string;
  evento_id: string;
  user_id: string;
  posicao?: number;
  tempo?: string;
  pontos?: number;
  estado: string;
}

interface EventosResultadosProps {
  events: any[];
  results?: Result[];
  users?: any[];
}

export function EventosResultados({ events = [], results = [], users = [] }: EventosResultadosProps) {
  const eventosComResultados = events.filter((e: any) =>
    results.some((r) => r.evento_id === e.id)
  );

  return (
    <div className="space-y-4">
      {eventosComResultados.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Nenhum resultado registado
        </Card>
      ) : (
        eventosComResultados.map((event: any) => {
          const eventResults = results.filter((r) => r.evento_id === event.id);

          return (
            <Card key={event.id} className="p-4">
              <h3 className="font-semibold mb-4">{event.titulo}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventResults.map((result: Result) => {
                    const user = users.find((u: any) => u.id === result.user_id);
                    return (
                      <TableRow key={result.id}>
                        <TableCell>{user?.nome_completo}</TableCell>
                        <TableCell>{result.posicao}º</TableCell>
                        <TableCell>{result.tempo || '-'}</TableCell>
                        <TableCell>{result.pontos || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          );
        })
      )}
    </div>
  );
}
