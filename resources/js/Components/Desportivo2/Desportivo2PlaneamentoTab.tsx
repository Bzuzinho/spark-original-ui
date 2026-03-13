import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useKV } from '@/hooks/useKV';
import { Badge } from '@/Components/ui/badge';
import { AnnualCycleCalendar } from '@/Components/Desportivo2/components/AnnualCycleCalendar';
import { SectionTitle } from '@/components/sports/shared';
import type { Macrocycle, Season, V2MicrocyclePlan, V2SeasonPlan } from './types';

interface Props {
  seasons: Season[];
  macrocycles: Macrocycle[];
}

export function Desportivo2PlaneamentoTab({ seasons, macrocycles }: Props) {
  const [seasonPlans, setSeasonPlans] = useKV<V2SeasonPlan[]>('sports-v2-seasons', []);
  const [microcycles, setMicrocycles] = useKV<V2MicrocyclePlan[]>('sports-v2-microcycles', []);
  const activeSeasonId = seasons.find((s) => s.estado === 'Em curso')?.id ?? seasons[0]?.id ?? '';
  const [seasonId, setSeasonId] = useState(activeSeasonId);
  const [expandedSeasonIds, setExpandedSeasonIds] = useState<string[]>(activeSeasonId ? [activeSeasonId] : []);

  const [seasonDraft, setSeasonDraft] = useState({
    nome: '',
    data_inicio: '',
    data_fim: '',
    fase: 'base',
    objetivo_fisiologico: '',
    objetivo_tecnico: '',
    carga_prevista: 0,
  });

  const [microDraft, setMicroDraft] = useState({
    semana_label: '',
    data_inicio: '',
    data_fim: '',
    carga_prevista: 0,
    foco: '',
  });

  const createSeasonPlan = () => {
    if (!seasonDraft.nome || !seasonDraft.data_inicio || !seasonDraft.data_fim) {
      return;
    }
    setSeasonPlans((prev) => [
      {
        id: crypto.randomUUID(),
        ...seasonDraft,
      },
      ...prev,
    ]);
    setSeasonDraft({
      nome: '',
      data_inicio: '',
      data_fim: '',
      fase: 'base',
      objetivo_fisiologico: '',
      objetivo_tecnico: '',
      carga_prevista: 0,
    });
  };

  const createMicrocycle = () => {
    if (!seasonId || !microDraft.semana_label) {
      return;
    }
    setMicrocycles((prev) => [
      {
        id: crypto.randomUUID(),
        season_id: seasonId,
        ...microDraft,
      },
      ...prev,
    ]);
    setMicroDraft({
      semana_label: '',
      data_inicio: '',
      data_fim: '',
      carga_prevista: 0,
      foco: '',
    });
  };

  const toggleSeason = (id: string) => {
    setExpandedSeasonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const seasonMicrocycles = microcycles.filter((m) => m.season_id === seasonId);

  return (
    <div className="space-y-3">
      <SectionTitle
        title="Planeamento por Épocas"
        subtitle="A época é a entidade principal. Macrociclos e microciclos organizam-se dentro de cada época."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Épocas desportivas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {seasons.map((season) => (
              <div key={season.id} className="border rounded-md p-2">
                <button
                  type="button"
                  onClick={() => toggleSeason(season.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{season.nome}</p>
                    <div className="flex gap-1">
                      <Badge variant={season.id === activeSeasonId ? 'default' : 'outline'} className="text-[10px]">
                        {season.id === activeSeasonId ? 'Ativa' : 'Arquivo'}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">{season.estado}</Badge>
                    </div>
                  </div>
                </button>
                {expandedSeasonIds.includes(season.id) && (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-muted-foreground">{season.data_inicio} até {season.data_fim}</p>
                    <p className="text-muted-foreground">Tipo: {season.tipo}</p>
                    <button
                      type="button"
                      onClick={() => setSeasonId(season.id)}
                      className="text-[11px] underline underline-offset-2 text-muted-foreground hover:text-foreground"
                    >
                      Definir como contexto de edição
                    </button>
                  </div>
                )}
              </div>
            ))}
            {seasons.length === 0 && <p className="text-muted-foreground">Sem épocas no backend.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Planeamento avançado V2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input value={seasonDraft.nome} onChange={(e) => setSeasonDraft((p) => ({ ...p, nome: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Fase</Label>
                <Input value={seasonDraft.fase} onChange={(e) => setSeasonDraft((p) => ({ ...p, fase: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Início</Label>
                <Input type="date" value={seasonDraft.data_inicio} onChange={(e) => setSeasonDraft((p) => ({ ...p, data_inicio: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Fim</Label>
                <Input type="date" value={seasonDraft.data_fim} onChange={(e) => setSeasonDraft((p) => ({ ...p, data_fim: e.target.value }))} />
              </div>
            </div>
            <Input placeholder="Objetivo fisiológico" value={seasonDraft.objetivo_fisiologico} onChange={(e) => setSeasonDraft((p) => ({ ...p, objetivo_fisiologico: e.target.value }))} />
            <Input placeholder="Objetivo técnico" value={seasonDraft.objetivo_tecnico} onChange={(e) => setSeasonDraft((p) => ({ ...p, objetivo_tecnico: e.target.value }))} />
            <Button size="sm" onClick={createSeasonPlan}>Criar plano de época V2</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Macrociclos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {macrocycles.map((macro) => (
              <div key={macro.id} className="border rounded-md p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{macro.nome}</p>
                  <Badge variant="outline" className="text-[10px]">{macro.tipo}</Badge>
                </div>
                <p className="text-muted-foreground">{macro.data_inicio} até {macro.data_fim}</p>
              </div>
            ))}
            {macrocycles.length === 0 && <p className="text-xs text-muted-foreground">Sem macrociclos neste contexto.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Microciclos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Contexto de época: {seasonId || 'não selecionada'}</p>
            <div className="space-y-1">
              {seasonMicrocycles.slice(0, 10).map((micro) => (
                <div key={micro.id} className="border rounded-md p-2 text-xs">
                  {micro.semana_label} · {micro.data_inicio} - {micro.data_fim} · {micro.foco}
                </div>
              ))}
              {seasonMicrocycles.length === 0 && <p className="text-xs text-muted-foreground">Sem microciclos para esta época.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Microciclos e mapa temporal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2 lg:grid-cols-5">
            <Input placeholder="ID época" value={seasonId} onChange={(e) => setSeasonId(e.target.value)} />
            <Input placeholder="Semana" value={microDraft.semana_label} onChange={(e) => setMicroDraft((p) => ({ ...p, semana_label: e.target.value }))} />
            <Input type="date" value={microDraft.data_inicio} onChange={(e) => setMicroDraft((p) => ({ ...p, data_inicio: e.target.value }))} />
            <Input type="date" value={microDraft.data_fim} onChange={(e) => setMicroDraft((p) => ({ ...p, data_fim: e.target.value }))} />
            <Input placeholder="Foco" value={microDraft.foco} onChange={(e) => setMicroDraft((p) => ({ ...p, foco: e.target.value }))} />
          </div>
          <Button size="sm" variant="outline" onClick={createMicrocycle}>Adicionar microciclo</Button>
          <div className="space-y-1">
            {microcycles.slice(0, 10).map((micro) => (
              <div key={micro.id} className="border rounded-md p-2 text-xs">
                {micro.semana_label} · {micro.data_inicio} - {micro.data_fim} · {micro.foco}
              </div>
            ))}
            {microcycles.length === 0 && <p className="text-xs text-muted-foreground">Sem microciclos V2.</p>}
          </div>
        </CardContent>
      </Card>

      <AnnualCycleCalendar macrocycles={macrocycles} />
    </div>
  );
}
