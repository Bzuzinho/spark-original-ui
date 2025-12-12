import { User } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useMemo } from 'react';

interface Mesociclo {
  id: string;
  macrociclo_id: string;
  nome: string;
  foco: string;
  data_inicio: string;
  data_fim: string;
  escaloes?: string[];
}

interface Microciclo {
  id: string;
  mesociclo_id: string;
  semana: string;
  volume_previsto: number;
  notas?: string;
}

interface PlaneamentoTabProps {
  user: User;
}

export function PlaneamentoTab({ user }: PlaneamentoTabProps) {
  const [mesociclos] = useKV<Mesociclo[]>('club-mesociclos', []);
  const [microciclos] = useKV<Microciclo[]>('club-microciclos', []);

  const atletaEscalao = user.escalao?.[0];

  const atletaMesociclos = useMemo(() => {
    if (!atletaEscalao) return [];
    return (mesociclos || []).filter(m => 
      m.escaloes && m.escaloes.includes(atletaEscalao)
    ).sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
  }, [mesociclos, atletaEscalao]);

  const atletaMicrociclos = useMemo(() => {
    const mesoIds = atletaMesociclos.map(m => m.id);
    return (microciclos || []).filter(mc => mesoIds.includes(mc.mesociclo_id));
  }, [microciclos, atletaMesociclos]);

  if (!atletaEscalao) {
    return (
      <div className="p-8 border rounded-lg text-center">
        <p className="text-sm text-muted-foreground">Atleta sem escalão definido</p>
        <p className="text-xs text-muted-foreground mt-2">Configure o escalão na aba Dados Desportivos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Mesociclos</h3>
        {atletaMesociclos.length === 0 ? (
          <div className="p-6 border rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Nenhum mesociclo configurado para este escalão</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Foco</TableHead>
                  <TableHead className="text-xs">Início</TableHead>
                  <TableHead className="text-xs">Fim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atletaMesociclos.map((meso) => (
                  <TableRow key={meso.id}>
                    <TableCell className="text-xs font-medium">{meso.nome}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="secondary" className="text-xs">{meso.foco}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(meso.data_inicio), 'dd/MM/yyyy', { locale: pt })}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(meso.data_fim), 'dd/MM/yyyy', { locale: pt })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Microciclos</h3>
        {atletaMicrociclos.length === 0 ? (
          <div className="p-6 border rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Nenhum microciclo configurado</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Semana</TableHead>
                  <TableHead className="text-xs">Volume Previsto</TableHead>
                  <TableHead className="text-xs">Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atletaMicrociclos.map((micro) => (
                  <TableRow key={micro.id}>
                    <TableCell className="text-xs font-medium">{micro.semana}</TableCell>
                    <TableCell className="text-xs">{micro.volume_previsto}m</TableCell>
                    <TableCell className="text-xs">{micro.notas || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
