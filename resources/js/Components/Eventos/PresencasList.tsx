import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Plus, CheckCircle, XCircle, Question } from '@phosphor-icons/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { toast } from 'sonner';

interface Attendance {
  id: string;
  evento_id: string;
  user_id: string;
  estado: 'presente' | 'ausente' | 'justificado';
  hora_chegada?: string;
  observacoes?: string;
}

interface PresencasListProps {
  events: any[];
  attendances?: Attendance[];
  users?: any[];
  onAttendanceUpdate?: (attendance: Attendance) => void;
}

export function PresencasList({ events = [], attendances = [], users = [], onAttendanceUpdate }: PresencasListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('todos');
  const [presenceFilter, setPresenceFilter] = useState('todos');

  const filteredAttendances = attendances.filter((att: Attendance) => {
    const user = users.find((u: any) => u.id === att.user_id);
    const event = events.find((e: any) => e.id === att.evento_id);

    const matchesSearch =
      user?.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEvent = eventFilter === 'todos' || att.evento_id === eventFilter;
    const matchesPresence =
      presenceFilter === 'todos' ||
      (presenceFilter === 'presente' && att.estado === 'presente') ||
      (presenceFilter === 'ausente' && att.estado === 'ausente') ||
      (presenceFilter === 'justificado' && att.estado === 'justificado');

    return matchesSearch && matchesEvent && matchesPresence;
  });

  const getStateColor = (estado: string) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-700';
      case 'ausente':
        return 'bg-red-100 text-red-700';
      case 'justificado':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <Input
          placeholder="Pesquisar presenças..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64"
        />
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os eventos</SelectItem>
            {events.map((event: any) => (
              <SelectItem key={event.id} value={event.id}>
                {event.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={presenceFilter} onValueChange={setPresenceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="presente">Presente</SelectItem>
            <SelectItem value="ausente">Ausente</SelectItem>
            <SelectItem value="justificado">Justificado</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          Registar Presença
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atleta</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Hora de Chegada</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum registro de presença encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendances.map((att: Attendance) => {
                const user = users.find((u: any) => u.id === att.user_id);
                const event = events.find((e: any) => e.id === att.evento_id);

                return (
                  <TableRow key={att.id}>
                    <TableCell>{user?.nome_completo}</TableCell>
                    <TableCell>{event?.titulo}</TableCell>
                    <TableCell>
                      <Badge className={getStateColor(att.estado)}>
                        {att.estado === 'presente' && <CheckCircle size={14} className="mr-1" />}
                        {att.estado === 'ausente' && <XCircle size={14} className="mr-1" />}
                        {att.estado === 'justificado' && <Question size={14} className="mr-1" />}
                        {att.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{att.hora_chegada || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {att.observacoes || '-'}
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
