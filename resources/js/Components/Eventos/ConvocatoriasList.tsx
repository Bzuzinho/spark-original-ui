import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Plus, Eye, Trash, Users } from '@phosphor-icons/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ConvocationProps {
  events: any[];
  convocations?: any[];
  onDelete?: (id: string) => void;
}

export function ConvocatoriasList({ events = [], convocations = [],  onDelete }: ConvocationProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConvocations = convocations.filter((conv: any) => {
    const event = events.find((e: any) => e.id === conv.evento_id);
    return event?.titulo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Pesquisar convocatórias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          Nova Convocatória
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Atletas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConvocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma convocatória encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredConvocations.map((conv: any) => {
                const event = events.find((e: any) => e.id === conv.evento_id);
                return (
                  <TableRow key={conv.id}>
                    <TableCell>{event?.titulo}</TableCell>
                    <TableCell>
                      {format(
                        new Date(event?.data_inicio || ''),
                        "dd 'de' MMM",
                        { locale: ptBR }
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Users size={14} className="mr-1" />
                        {conv.atletas?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{conv.estado || 'Pendente'}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost">
                        <Eye size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onDelete?.(conv.id);
                          toast.success('Convocatória eliminada');
                        }}
                      >
                        <Trash size={16} className="text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
