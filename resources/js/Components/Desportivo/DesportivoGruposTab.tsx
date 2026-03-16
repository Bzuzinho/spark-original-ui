import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import type { AgeGroup, User } from './types';

interface Props {
  ageGroups: AgeGroup[];
  users: User[];
}

export function DesportivoGruposTab({ ageGroups, users }: Props) {
  const activeAthletes = users.filter((user) => {
    const tipo = user.tipo_membro ?? [];
    return user.estado === 'ativo' && tipo.includes('atleta');
  });

  const groupRows = ageGroups.map((group) => {
    const athletes = activeAthletes.filter((user) => (user.escalao ?? []).includes(group.id));
    const aptos = athletes.filter((user) => Boolean(user.data_atestado_medico)).length;
    return {
      ...group,
      total: athletes.length,
      aptos,
    };
  });

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {groupRows.map((group) => (
        <Card key={group.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{group.nome}</span>
              <Badge variant="secondary" className="text-[10px]">{group.total} atletas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <p className="text-muted-foreground">Atletas ativos: {group.total}</p>
            <p className="text-muted-foreground">Aptidão médica registada: {group.aptos}</p>
            <p className="text-muted-foreground">Pendentes: {Math.max(group.total - group.aptos, 0)}</p>
          </CardContent>
        </Card>
      ))}
      {groupRows.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-xs text-muted-foreground">
            Sem escalões configurados.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
