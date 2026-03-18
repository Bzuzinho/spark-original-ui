import { useMemo, useState } from 'react';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Training } from '@/Components/Desportivo/types';

interface AgeGroupOption {
  id: string;
  nome: string;
}

interface Props {
  trainings: Training[];
  selectedTrainingIds: string[];
  onToggleTraining: (id: string) => void;
  ageGroups?: AgeGroupOption[];
}

function formatDate(date: string): string {
  try {
    const normalizedDate = date.includes('T') ? date.split('T')[0] : date.split(' ')[0];
    const parts = normalizedDate.split('-');

    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      const parsed = new Date(year, month - 1, day);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' });
      }
    }

    const fallback = new Date(date);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' });
    }

    return normalizedDate || date;
  } catch (e) {
    return date;
  }
}

function normalizeDate(date: string): string {
  if (!date) return '';
  return date.includes('T') ? date.split('T')[0] : date.split(' ')[0];
}

function isToday(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return normalizeDate(date) === today;
}

export function CaisTrainingList({
  trainings,
  selectedTrainingIds,
  onToggleTraining,
  ageGroups = [],
}: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState<string>('');
  const [escalaoFilter, setEscalaoFilter] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const ageGroupLabelById = useMemo(() => {
    return new Map(ageGroups.map((item) => [item.id, item.nome]));
  }, [ageGroups]);

  const availableEscaloes = useMemo(() => {
    const ids = new Set<string>();
    trainings.forEach((training) => {
      (training.escaloes ?? []).forEach((escalao) => {
        if (escalao) ids.add(escalao);
      });
    });

    return Array.from(ids)
      .map((id) => ({ id, nome: ageGroupLabelById.get(id) ?? id }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [trainings, ageGroupLabelById]);

  const scheduledTrainings = trainings.filter((t) => !!t.data);

  const filteredTrainings = scheduledTrainings.filter((training) => {
    if (dateFilter && normalizeDate(training.data || '') !== dateFilter) return false;
    if (escalaoFilter !== 'all' && !(training.escaloes ?? []).includes(escalaoFilter)) return false;
    return true;
  });

  const sortedTrainings = [...filteredTrainings].sort((a, b) => {
    const dateComparison = normalizeDate(a.data || '').localeCompare(normalizeDate(b.data || ''));
    if (dateComparison !== 0) return dateComparison;
    return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
  });

  const todayTrainings = sortedTrainings.filter((t) => isToday(t.data!));
  const futureTrainings = sortedTrainings.filter((t) => normalizeDate(t.data || '') > today);

  const clearFilters = () => {
    setDateFilter('');
    setEscalaoFilter('all');
  };

  return (
    <Card className="border h-fit sticky top-0 gap-0 py-1.5">
      <CardHeader className="px-1.5 py-1.5 gap-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs">Treinos Agendados</CardTitle>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded border border-border px-2 py-0 text-[10px] font-medium hover:bg-muted"
              onClick={() => setDateFilter(today)}
            >
              Hoje
            </button>

            <button
              type="button"
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-label={isCollapsed ? 'Expandir treinos agendados' : 'Minimizar treinos agendados'}
            >
              {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn('px-1.5 py-1', isCollapsed ? 'hidden' : 'block')}>
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-6 px-1 text-[10px] pr-1 [::-webkit-calendar-picker-indicator]:m-0 [::-webkit-calendar-picker-indicator]:p-0"
            />
          </div>

          <div className="min-w-0 flex-1">
            <Select value={escalaoFilter} onValueChange={setEscalaoFilter}>
              <SelectTrigger className="h-6 px-1 text-[10px]">
                <SelectValue placeholder="Escalão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos escalões</SelectItem>
                {availableEscaloes.map((escalao) => (
                  <SelectItem key={escalao.id} value={escalao.id}>{escalao.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border hover:bg-muted"
            onClick={clearFilters}
            aria-label="Limpar filtros"
            title="Limpar filtros"
          >
            <X size={12} />
          </button>
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <p className="text-[10px] font-semibold text-foreground">Hoje</p>
          <div className="h-[2px] flex-1 bg-border" />
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {todayTrainings.length > 0 && (
            <div className="space-y-0.5">
              {todayTrainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center gap-1 p-1 rounded border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onToggleTraining(training.id)}
                >
                  <Checkbox
                    checked={selectedTrainingIds.includes(training.id)}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => onToggleTraining(training.id)}
                    className="w-3 h-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">
                      {training.numero_treino || 'Treino'} · {training.tipo_treino}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {training.hora_inicio || '--:--'}
                      {training.hora_fim ? ` - ${training.hora_fim}` : ''}
                    </p>
                  </div>
                  {training.volume_planeado_m && (
                    <Badge variant="secondary" className="text-[8px] px-1 py-0">
                      {training.volume_planeado_m}m
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {todayTrainings.length === 0 && (
            <p className="text-[10px] text-muted-foreground py-0.5">Sem treinos agendados para hoje</p>
          )}

          <div className="pt-1.5 pb-2">
            <div className="h-[2px] w-full bg-border" />
          </div>

          {futureTrainings.length > 0 && (
            <div className="space-y-0.5">
              {futureTrainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center gap-1 p-1 rounded border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onToggleTraining(training.id)}
                >
                  <Checkbox
                    checked={selectedTrainingIds.includes(training.id)}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => onToggleTraining(training.id)}
                    className="w-3 h-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">
                      {training.numero_treino || 'Treino'} · {training.tipo_treino}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {formatDate(training.data!)} · {training.hora_inicio || '--:--'}
                    </p>
                  </div>
                  {training.volume_planeado_m && (
                    <Badge variant="secondary" className="text-[8px] px-1 py-0">
                      {training.volume_planeado_m}m
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {sortedTrainings.length === 0 && (
            <p className="text-[10px] text-muted-foreground py-2 text-center">
              Sem treinos para os filtros selecionados
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
