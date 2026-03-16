/**
 * DesportivoPerformanceTab
 *
 * Gestão científica de performance:
 *   - Carga aguda / crónica / ACWR
 *   - RPE semanal
 *   - Volume semanal
 *   - Prontidão
 *
 * Estratégia de dados:
 *   - Se `volumeByAthlete` (fonte: training_athletes) existe, usa-o
 *     para mostrar volume real por atleta.
 *   - Métricas de carga (ACWR, RPE, prontidão) são persistidas no backend
 *     via API KeyValue (useKV('sports-v2-performance-metrics')).
 *   - Estrutura preparada para integração futura com tabela `performance_metrics`.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { useKV } from '@/hooks/useKV';
import { ChartLine, Lightning, Gauge } from '@phosphor-icons/react';
import type { PerformanceMetric, User } from './types';

interface VolumeRow {
  nome_completo: string;
  total_m: number;
}

interface Props {
  users: User[];
  volumeByAthlete: VolumeRow[];
}

// ── Cálculos de carga ────────────────────────────────────────────────────────

/** Razão ACWR: >= 1.5 = muito alto; < 0.8 = muito baixo; bom ≈ 0.8–1.3 */
function acwrColor(acwr: number): string {
  if (acwr >= 1.5) return 'text-red-600';
  if (acwr >= 1.3) return 'text-amber-500';
  if (acwr >= 0.8) return 'text-emerald-600';
  return 'text-blue-500';
}

function acwrLabel(acwr: number): string {
  if (acwr >= 1.5) return 'Alto risco';
  if (acwr >= 1.3) return 'Atenção';
  if (acwr >= 0.8) return 'Ótimo';
  return 'Carga baixa';
}

// ── Componente ───────────────────────────────────────────────────────────────

export function DesportivoPerformanceTab({ users, volumeByAthlete }: Props) {
  const [metrics, setMetrics] = useKV<PerformanceMetric[]>('sports-v2-performance-metrics', []);
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '');

  const [draft, setDraft] = useState({
    data: new Date().toISOString().slice(0, 10),
    carga_aguda: '',
    carga_cronica: '',
    rpe: '',
    volume_semanal_m: '',
    prontidao: '',
    observacoes: '',
  });

  const activeAthletes = users.filter((u) => {
    const tipos = u.tipo_membro ?? [];
    return u.estado === 'ativo' && tipos.includes('atleta');
  });

  const selectedAthleteMetrics = metrics
    .filter((m) => m.athlete_id === selectedUserId)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 12);

  const addMetric = () => {
    if (!selectedUserId || !draft.data) return;

    const aguda = Number(draft.carga_aguda) || 0;
    const cronica = Number(draft.carga_cronica) || 1; // evitar divisão por zero
    const acwr = cronica > 0 ? aguda / cronica : 0;

    const newMetric: PerformanceMetric = {
      id: crypto.randomUUID(),
      athlete_id: selectedUserId,
      data: draft.data,
      carga_aguda: aguda,
      carga_cronica: Number(draft.carga_cronica) || 0,
      acwr: Math.round(acwr * 100) / 100,
      rpe: Number(draft.rpe) || 0,
      volume_semanal_m: Number(draft.volume_semanal_m) || 0,
      prontidao: Number(draft.prontidao) || 0,
      observacoes: draft.observacoes,
    };

    setMetrics((prev) => [newMetric, ...prev].slice(0, 500));
    setDraft((d) => ({ ...d, carga_aguda: '', carga_cronica: '', rpe: '', volume_semanal_m: '', prontidao: '', observacoes: '' }));
  };

  const selectedAthleteName = activeAthletes.find((u) => u.id === selectedUserId)?.nome_completo ?? '—';
  const highRisk = metrics.filter((m) => m.acwr >= 1.5).slice(0, 5);
  const avgRpe = metrics.length > 0
    ? Math.round((metrics.reduce((sum, m) => sum + (m.rpe || 0), 0) / metrics.length) * 10) / 10
    : 0;
  const avgReadiness = metrics.length > 0
    ? Math.round((metrics.reduce((sum, m) => sum + (m.prontidao || 0), 0) / metrics.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-3">

      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Carga aguda (média)</p>
          <p className="text-lg font-semibold">
            {metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.carga_aguda, 0) / metrics.length) : 0}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Carga crónica (média)</p>
          <p className="text-lg font-semibold">
            {metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.carga_cronica, 0) / metrics.length) : 0}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">RPE médio</p>
          <p className="text-lg font-semibold">{avgRpe}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Prontidão média</p>
          <p className="text-lg font-semibold">{avgReadiness}</p>
        </Card>
      </div>

      {/* ── Volume por atleta (fonte: training_athletes) ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ChartLine size={14} />
            Volume acumulado na época (presenças reais)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {volumeByAthlete.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Sem dados de volume registados.
            </p>
          )}
          {volumeByAthlete.slice(0, 15).map((row) => {
            const km = (row.total_m / 1000).toFixed(1);
            const pct = volumeByAthlete[0]
              ? (row.total_m / volumeByAthlete[0].total_m) * 100
              : 0;
            return (
              <div key={row.nome_completo} className="flex items-center gap-2">
                <span className="text-xs flex-1 truncate">{row.nome_completo}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden max-w-32">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground w-12 text-right shrink-0">
                  {km} km
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">

        {/* ── Registo de métricas científicas ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge size={14} />
              Registar métricas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Selecionar atleta */}
            <div>
              <Label className="text-xs">Atleta</Label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {activeAthletes.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome_completo}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={draft.data}
                  onChange={(e) => setDraft((d) => ({ ...d, data: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">RPE (1–10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={draft.rpe}
                  onChange={(e) => setDraft((d) => ({ ...d, rpe: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Carga aguda (UA)</Label>
                <Input
                  type="number"
                  value={draft.carga_aguda}
                  onChange={(e) => setDraft((d) => ({ ...d, carga_aguda: e.target.value }))}
                  className="h-8 text-xs"
                  placeholder="semana atual"
                />
              </div>
              <div>
                <Label className="text-xs">Carga crónica (UA)</Label>
                <Input
                  type="number"
                  value={draft.carga_cronica}
                  onChange={(e) => setDraft((d) => ({ ...d, carga_cronica: e.target.value }))}
                  className="h-8 text-xs"
                  placeholder="média 4 semanas"
                />
              </div>
              <div>
                <Label className="text-xs">Volume semanal (m)</Label>
                <Input
                  type="number"
                  value={draft.volume_semanal_m}
                  onChange={(e) => setDraft((d) => ({ ...d, volume_semanal_m: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Prontidão (1–10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={draft.prontidao}
                  onChange={(e) => setDraft((d) => ({ ...d, prontidao: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <Input
              placeholder="Observações…"
              value={draft.observacoes}
              onChange={(e) => setDraft((d) => ({ ...d, observacoes: e.target.value }))}
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={addMetric} className="w-full">
              Guardar métrica
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Persistido no backend via API KeyValue (sports-v2-performance-metrics).
            </p>
          </CardContent>
        </Card>

        {/* ── Histórico do atleta selecionado ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightning size={14} />
              Histórico – {selectedAthleteName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {selectedAthleteMetrics.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Sem métricas registadas para este atleta.
              </p>
            )}
            {selectedAthleteMetrics.map((m) => (
              <div key={m.id} className="border rounded-md px-2 py-1.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium">{m.data}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      RPE {m.rpe}
                    </Badge>
                    {m.acwr > 0 && (
                      <span className={`text-[11px] font-semibold ${acwrColor(m.acwr)}`}>
                        ACWR {m.acwr} · {acwrLabel(m.acwr)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground flex-wrap">
                  {m.carga_aguda > 0 && <span>Aguda: {m.carga_aguda} UA</span>}
                  {m.carga_cronica > 0 && <span>Crónica: {m.carga_cronica} UA</span>}
                  {m.volume_semanal_m > 0 && (
                    <span>Vol: {(m.volume_semanal_m / 1000).toFixed(1)} km</span>
                  )}
                  {m.prontidao > 0 && <span>Prontidão: {m.prontidao}/10</span>}
                </div>
                {m.observacoes && (
                  <p className="text-[10px] text-muted-foreground italic">{m.observacoes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Atletas em destaque (risco ACWR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {highRisk.length === 0 && (
            <p className="text-xs text-muted-foreground">Sem alertas ACWR elevados.</p>
          )}
          {highRisk.map((m) => (
            <div key={m.id} className="border rounded-md p-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium truncate">
                {activeAthletes.find((u) => u.id === m.athlete_id)?.nome_completo ?? 'Atleta'}
              </p>
              <Badge variant="outline" className="text-[10px] text-red-600 border-red-300">
                ACWR {m.acwr}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
