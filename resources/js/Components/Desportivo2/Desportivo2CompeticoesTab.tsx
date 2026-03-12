/**
 * Desportivo2CompeticoesTab
 *
 * Reutiliza dados da tabela `events` (tipo='prova') e `event_attendances`.
 * Liga convocatórias com o fluxo de eventos existente.
 */

import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Trophy, MagnifyingGlass, CalendarBlank } from '@phosphor-icons/react';
import type { Competition, EventResult, User } from './types';

interface Props {
  competitions: Competition[];
  results: EventResult[];
  users: User[];
}

const TIPO_BADGE: Record<string, string> = {
  prova:   'bg-indigo-100 text-indigo-800 border-indigo-200',
  treino:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  reuniao: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Desportivo2CompeticoesTab({ competitions, results, users }: Props) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const filtered = competitions.filter((c) =>
    c.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (c.local ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  // Agrupar por mês
  const byMonth = filtered.reduce<Record<string, Competition[]>>((acc, comp) => {
    const month = comp.data_inicio.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(comp);
    return acc;
  }, {});

  const sortedMonths = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  const totalAthletes = new Set(users.map((u) => u.id)).size;

  const metricsByCompetition = filtered.reduce<Record<string, { athletes: number; provas: number }>>((acc, comp) => {
    const eventResults = results.filter((r) => r.event?.id === comp.id);
    acc[comp.id] = {
      athletes: new Set(eventResults.map((r) => r.athlete?.nome_completo).filter(Boolean)).size,
      provas: eventResults.length,
    };
    return acc;
  }, {});

  const getEstado = (dataInicio: string): string => {
    const day = dataInicio.slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    if (!day) return 'indefinido';
    if (day < today) return 'concluída';
    if (day === today) return 'hoje';
    return 'agendada';
  };

  return (
    <div className="space-y-3">

      {/* ── Barra de controlo ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar competição…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            Lista
          </Button>
          <Button
            size="sm"
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
          >
            <CalendarBlank size={13} className="mr-1" />
            Mês
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.get(route('eventos.index'))}
        >
          Gerir em Eventos →
        </Button>
      </div>

      {/* ── Contadores rápidos ── */}
      <div className="grid gap-2 grid-cols-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-semibold">{competitions.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Resultados registados</p>
          <p className="text-xl font-semibold">{results.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Atletas com resultados</p>
          <p className="text-xl font-semibold">
            {new Set(results.map((r) => r.athlete?.nome_completo).filter(Boolean)).size}
          </p>
          <p className="text-[11px] text-muted-foreground">plantel ativo {totalAthletes}</p>
        </Card>
      </div>

      {/* ── Vista lista/mês ── */}
      {view === 'list' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Competições ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem resultados para a pesquisa.</p>
            )}
            {filtered.map((comp) => (
              <div
                key={comp.id}
                className="grid grid-cols-12 items-center gap-2 border rounded-md px-3 py-2"
              >
                <div className="col-span-6 min-w-0">
                  <p className="text-xs font-medium truncate">{comp.titulo}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {comp.data_inicio}
                    {comp.local ? ` · ${comp.local}` : ''}
                  </p>
                </div>
                <div className="col-span-3 text-[11px] text-muted-foreground">
                  <p>Estado: {getEstado(comp.data_inicio)}</p>
                  <p>Atletas: {metricsByCompetition[comp.id]?.athletes ?? 0}</p>
                  <p>Resultados: {metricsByCompetition[comp.id]?.provas ?? 0}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 col-span-1 ${TIPO_BADGE[comp.tipo] ?? TIPO_BADGE['reuniao']}`}
                >
                  {comp.tipo}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[11px] shrink-0 col-span-2"
                  onClick={() => router.get(route('eventos.show', comp.id))}
                >
                  Ver
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {view === 'calendar' && (
        <div className="space-y-3">
          {sortedMonths.map((month) => (
            <Card key={month}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarBlank size={14} />
                  {month}
                  <Badge variant="secondary" className="text-[10px]">
                    {byMonth[month].length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {byMonth[month].map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center gap-3 border rounded-md px-3 py-1.5"
                  >
                    <Trophy size={12} className="text-amber-500 shrink-0" />
                    <p className="text-xs font-medium flex-1 truncate">{comp.titulo}</p>
                    <p className="text-[11px] text-muted-foreground shrink-0">
                      {comp.data_inicio.slice(8, 10)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          {sortedMonths.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-xs text-muted-foreground">
                Sem competições registadas.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
