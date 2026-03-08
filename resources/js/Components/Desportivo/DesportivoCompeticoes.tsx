import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowSquareOut } from '@phosphor-icons/react';

interface Competition {
  id: string;
  titulo: string;
  data_inicio: string;
  local?: string;
  tipo: string;
}

interface EventResult {
  id: string;
  prova: string;
  tempo?: string | null;
  classificacao?: number | null;
  event?: { id: string; titulo: string };
  athlete?: { nome_completo: string };
}

interface DesportivoCompeticoesProps {
  competitions?: Competition[];
  results?: EventResult[];
}

export function DesportivoCompeticoes({
  competitions = [],
  results = [],
}: DesportivoCompeticoesProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {competitions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Nenhuma competição encontrada
              </p>
            ) : (
              competitions.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-3 flex items-center justify-between hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{c.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.data_inicio} | {c.local ?? 'Sem local'}
                    </p>
                  </div>
                  <Link href={route('eventos.show', c.id)} className="text-sm text-blue-600">
                    Abrir em Eventos
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Nenhum resultado encontrado
              </p>
            ) : (
              results.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-lg p-3 flex justify-between items-center hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {r.athlete?.nome_completo ?? 'Atleta'}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.prova}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{r.tempo ?? '-'}</p>
                    {r.classificacao && (
                      <p className="text-xs text-muted-foreground">#{r.classificacao}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link
              href={route('eventos.index')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Gerir provas e resultados no módulo Eventos
              <ArrowSquareOut size={14} weight="bold" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
