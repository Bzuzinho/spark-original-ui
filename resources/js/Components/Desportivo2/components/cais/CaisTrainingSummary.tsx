import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import type { Training } from '@/Components/Desportivo2/types';

interface TrainingWithEscaloes extends Training {
  escaloes?: string[] | null;
}

interface Props {
  training: TrainingWithEscaloes | null;
}

function inferBlocks(description: string | null | undefined): string[] {
  const text = (description || '').toLowerCase();
  if (!text) return [];
  const blocks: string[] = [];
  if (text.includes('aquec')) blocks.push('Aquecimento');
  if (text.includes('principal')) blocks.push('Bloco principal');
  if (text.includes('tecn')) blocks.push('Técnica');
  if (text.includes('soltar') || text.includes('arrefec')) blocks.push('Soltar');
  return blocks;
}

export function CaisTrainingSummary({ training }: Props) {
  if (!training) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Seleciona um treino para abrir o contexto do cais.
        </CardContent>
      </Card>
    );
  }

  const blocks = inferBlocks(training.descricao_treino);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Resumo operacional do treino</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-xs font-semibold">
            {training.numero_treino || 'Treino'} · {training.tipo_treino}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Hora: {training.hora_inicio || '--:--'}{training.hora_fim ? ` - ${training.hora_fim}` : ''} · Local: {training.local || 'N/D'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Grupo/Escalão: {(training.escaloes ?? []).join(', ') || 'N/D'} · Pista: N/D · Ciclo: N/D
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-medium">Estrutura principal</p>
          {blocks.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {blocks.map((b) => (
                <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">Sem blocos estruturados explícitos. A usar descrição técnica do treino.</p>
          )}
        </div>

        <div className="border rounded-md p-2 text-[11px] text-muted-foreground">
          {training.descricao_treino || 'Sem descrição operacional disponível.'}
        </div>
      </CardContent>
    </Card>
  );
}
