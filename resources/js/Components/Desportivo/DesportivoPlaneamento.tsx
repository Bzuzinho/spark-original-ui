import { FormEvent } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface Season {
  id: string;
  nome: string;
  ano_temporada: string;
  estado: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
}

interface Macrocycle {
  id: string;
  nome: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  escalao?: string | null;
}

interface DesportivoPlaneamentoProps {
  seasons?: Season[];
  selectedSeason?: Season | null;
  macrocycles?: Macrocycle[];
}

export function DesportivoPlaneamento({
  seasons = [],
  selectedSeason = null,
  macrocycles = [],
}: DesportivoPlaneamentoProps) {
  const seasonForm = useForm({
    nome: '',
    ano_temporada: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'Principal',
    estado: 'Planeada',
    piscina_principal: '',
    descricao: '',
  });

  const macrocycleForm = useForm({
    epoca_id: selectedSeason?.id ?? '',
    nome: '',
    tipo: 'Preparação geral',
    data_inicio: '',
    data_fim: '',
    escalao: '',
  });

  const onSeasonSubmit = (e: FormEvent) => {
    e.preventDefault();
    seasonForm.post(route('desportivo.epoca.store'));
  };

  const onMacrocycleSubmit = (e: FormEvent) => {
    e.preventDefault();
    macrocycleForm.setData('epoca_id', selectedSeason?.id ?? '');
    macrocycleForm.post(route('desportivo.macrociclo.store'));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nova Época</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSeasonSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={seasonForm.data.nome}
                  onChange={(e) => seasonForm.setData('nome', e.target.value)}
                  placeholder="Nome da época"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano_temporada">Ano/Temporada</Label>
                <Input
                  id="ano_temporada"
                  value={seasonForm.data.ano_temporada}
                  onChange={(e) => seasonForm.setData('ano_temporada', e.target.value)}
                  placeholder="2024/2025"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={seasonForm.data.data_inicio}
                  onChange={(e) => seasonForm.setData('data_inicio', e.target.value)}
                  placeholder="dd/mm/aaaa"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={seasonForm.data.data_fim}
                  onChange={(e) => seasonForm.setData('data_fim', e.target.value)}
                  placeholder="dd/mm/aaaa"
                  className="bg-white"
                />
              </div>
            </div>

            <Button type="submit" size="sm">
              Criar Época
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Épocas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {seasons.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma época criada</p>
          ) : (
            seasons.map((season) => (
              <div
                key={season.id}
                className="border rounded-lg p-3 flex items-center justify-between hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">
                    {season.nome} ({season.ano_temporada})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {season.tipo} | {season.estado}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.get(route('desportivo.planeamento'), { season_id: season.id })
                  }
                >
                  Selecionar
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {selectedSeason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Novo Macrociclo - {selectedSeason.nome}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onMacrocycleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="macro_nome">Nome</Label>
                  <Input
                    id="macro_nome"
                    value={macrocycleForm.data.nome}
                    onChange={(e) => macrocycleForm.setData('nome', e.target.value)}
                    placeholder="Nome do macrociclo"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macro_tipo">Tipo</Label>
                  <Input
                    id="macro_tipo"
                    value={macrocycleForm.data.tipo}
                    onChange={(e) => macrocycleForm.setData('tipo', e.target.value)}
                    placeholder="Preparação geral, Específico..."
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="macro_data_inicio">Data Início</Label>
                  <Input
                    id="macro_data_inicio"
                    type="date"
                    value={macrocycleForm.data.data_inicio}
                    onChange={(e) => macrocycleForm.setData('data_inicio', e.target.value)}
                    placeholder="dd/mm/aaaa"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macro_data_fim">Data Fim</Label>
                  <Input
                    id="macro_data_fim"
                    type="date"
                    value={macrocycleForm.data.data_fim}
                    onChange={(e) => macrocycleForm.setData('data_fim', e.target.value)}
                    placeholder="dd/mm/aaaa"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalao">Escalão</Label>
                <Input
                  id="escalao"
                  value={macrocycleForm.data.escalao}
                  onChange={(e) => macrocycleForm.setData('escalao', e.target.value)}
                  placeholder="Escalão"
                  className="bg-white"
                />
              </div>

              <Button type="submit" size="sm">
                Criar Macrociclo
              </Button>
            </form>

            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold">Macrociclos Criados</h4>
              {macrocycles.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum macrociclo criado
                </p>
              ) : (
                macrocycles.map((m) => (
                  <div
                    key={m.id}
                    className="text-sm border rounded-lg p-3 hover:border-primary/50 transition-colors"
                  >
                    <p className="font-medium">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.tipo} | {m.data_inicio} a {m.data_fim}
                      {m.escalao && ` | ${m.escalao}`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
