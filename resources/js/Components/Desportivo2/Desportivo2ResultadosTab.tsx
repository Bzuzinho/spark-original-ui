/**
 * Desportivo2ResultadosTab
 *
 * Reutiliza dados canónicos de `results` via prop `results`.
 * Liga-se à competição através da prova associada.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { MagnifyingGlass, Medal, Timer } from '@phosphor-icons/react';
import { CompetitionResultsTable } from '@/components/sports/CompetitionResultsTable';
import { TeamResultsTable } from '@/components/sports/TeamResultsTable';
import type { EventResult, TeamResult } from './types';

interface Props {
  results: EventResult[];
  teamResults?: TeamResult[];
}

function formatTime(t: string | null | undefined): string {
  if (!t) return '—';
  return t;
}

function toSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length === 2) {
    const min = Number(parts[0]);
    const sec = Number(parts[1]);
    if (!Number.isNaN(min) && !Number.isNaN(sec)) return min * 60 + sec;
  }
  const sec = Number(value);
  return Number.isNaN(sec) ? null : sec;
}

function formatDelta(seconds: number | null): string {
  if (seconds == null) return '—';
  return `${seconds > 0 ? '+' : ''}${seconds.toFixed(2)}s`;
}

// Cor da medalha por classificação
function medalColor(pos?: number | null): string {
  if (pos === 1) return 'text-yellow-500';
  if (pos === 2) return 'text-slate-400';
  if (pos === 3) return 'text-amber-600';
  return 'text-muted-foreground';
}

export function Desportivo2ResultadosTab({ results, teamResults = [] }: Props) {
  const [search, setSearch] = useState('');

  const filtered = results.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.athlete?.nome_completo ?? '').toLowerCase().includes(q) ||
      (r.event?.titulo ?? '').toLowerCase().includes(q) ||
      r.prova.toLowerCase().includes(q)
    );
  });

  // Agrupar por evento
  const byEvent = filtered.reduce<Record<string, EventResult[]>>((acc, r) => {
    const key = r.event?.id ?? 'sem-evento';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const bestByProva = results.reduce<Record<string, number>>((acc, r) => {
    const t = toSeconds(r.tempo);
    if (t == null) return acc;
    if (acc[r.prova] == null || t < acc[r.prova]) acc[r.prova] = t;
    return acc;
  }, {});

  // Melhores resultados por atleta (menor classificação)
  const podiumAthletes = [...results]
    .filter((r) => r.classificacao !== null && r.classificacao !== undefined)
    .sort((a, b) => (a.classificacao ?? 999) - (b.classificacao ?? 999))
    .reduce<Record<string, EventResult>>((acc, r) => {
      const key = r.athlete?.nome_completo ?? r.id;
      if (!acc[key] || (r.classificacao ?? 999) < (acc[key].classificacao ?? 999)) {
        acc[key] = r;
      }
      return acc;
    }, {});

  const topAthletes = Object.values(podiumAthletes).slice(0, 5);

  return (
    <div className="space-y-3">

      {/* ── Pesquisa ── */}
      <div className="relative">
        <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Atleta, prova ou evento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-7 h-8 text-xs"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">

        {/* ── Pódio rápido ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Medal size={14} className="text-yellow-500" />
              Melhores classificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {topAthletes.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem classificações registadas.</p>
            )}
            {topAthletes.map((r) => (
              <div key={r.id} className="flex items-center gap-2 border rounded-md px-2 py-1.5">
                <Medal size={13} className={medalColor(r.classificacao)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {r.athlete?.nome_completo ?? '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {r.prova} · {r.event?.titulo ?? ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.classificacao && (
                    <Badge variant="outline" className="text-[10px]">
                      #{r.classificacao}
                    </Badge>
                  )}
                  {r.tempo && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {formatTime(r.tempo)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Resumo global ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Timer size={14} />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded-md p-2">
                <p className="text-muted-foreground text-[11px]">Total resultados</p>
                <p className="font-semibold text-base">{results.length}</p>
              </div>
              <div className="border rounded-md p-2">
                <p className="text-muted-foreground text-[11px]">Atletas distintos</p>
                <p className="font-semibold text-base">
                  {new Set(results.map((r) => r.athlete?.nome_completo)).size}
                </p>
              </div>
              <div className="border rounded-md p-2">
                <p className="text-muted-foreground text-[11px]">Provas distintas</p>
                <p className="font-semibold text-base">
                  {new Set(results.map((r) => r.prova)).size}
                </p>
              </div>
              <div className="border rounded-md p-2">
                <p className="text-muted-foreground text-[11px]">Com classificação</p>
                <p className="font-semibold text-base">
                  {results.filter((r) => r.classificacao != null).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Resultados por evento ── */}
      {Object.entries(byEvent).map(([eventId, eventResults]) => {
        const eventTitle = eventResults[0]?.event?.titulo ?? 'Sem evento';
        return (
          <Card key={eventId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{eventTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <CompetitionResultsTable eventTitle={eventTitle} results={eventResults} bestByProva={bestByProva} />
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Classificação Coletiva</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamResultsTable teamResults={teamResults} />
          {teamResults.length === 0 && (
            <p className="text-xs text-muted-foreground">Sem classificação coletiva disponível.</p>
          )}
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-xs text-muted-foreground">
            Sem resultados para os critérios de pesquisa.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
