import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import type { Macrocycle, MesocyclePlan } from '@/Components/Desportivo/types';

interface Props {
  macrocycles: Macrocycle[];
  mesocycles?: MesocyclePlan[];
}

const MONTHS = ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(Math.floor(ms / (1000 * 60 * 60 * 24)), 0);
}

function buildSeasonWindow(reference: Date): { start: Date; end: Date } {
  const year = reference.getFullYear();
  const month = reference.getMonth();

  const startYear = month >= 8 ? year : year - 1;
  const start = new Date(startYear, 8, 1);
  const end = new Date(startYear + 1, 7, 31);

  return { start, end };
}

function barColor(type: string): string {
  if (type.toLowerCase().includes('compet')) return 'bg-rose-500/70';
  if (type.toLowerCase().includes('taper')) return 'bg-amber-500/70';
  if (type.toLowerCase().includes('espec')) return 'bg-indigo-500/70';
  if (type.toLowerCase().includes('transi')) return 'bg-slate-500/70';
  return 'bg-emerald-500/70';
}

export function AnnualCycleCalendar({ macrocycles, mesocycles = [] }: Props) {
  const safeMacrocycles = Array.isArray(macrocycles) ? macrocycles : [];
  const safeMesocycles = Array.isArray(mesocycles) ? mesocycles : [];
  const today = new Date();

  const dateBounds = safeMacrocycles.reduce<{ min: Date | null; max: Date | null }>((acc, macro) => {
    const start = toDate(macro.data_inicio);
    const end = toDate(macro.data_fim);

    if (start && (!acc.min || start < acc.min)) acc.min = start;
    if (end && (!acc.max || end > acc.max)) acc.max = end;

    return acc;
  }, { min: null, max: null });

  const referenceDate = dateBounds.min ?? new Date();
  const seasonWindow = buildSeasonWindow(referenceDate);
  const minDate = seasonWindow.start;
  const maxDate = seasonWindow.end;
  const totalDays = Math.max(daysBetween(minDate, maxDate), 1);

  const monthStarts = Array.from({ length: 12 }, (_, idx) => {
    const monthDate = new Date(minDate.getFullYear(), minDate.getMonth() + idx, 1);
    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      left: (daysBetween(minDate, monthDate) / totalDays) * 100,
    };
  });

  const weekSeparators = [] as Array<{ key: string; left: number }>;
  let cursor = new Date(minDate);
  let weekIdx = 0;
  while (cursor <= maxDate) {
    weekSeparators.push({
      key: `week-${weekIdx}`,
      left: (daysBetween(minDate, cursor) / totalDays) * 100,
    });
    cursor = addDays(cursor, 7);
    weekIdx += 1;
  }

  const todayInWindow = today >= minDate && today <= maxDate;
  const todayLeft = (daysBetween(minDate, today) / totalDays) * 100;

  const barPosition = (startDate?: string | null, endDate?: string | null) => {
    const startRaw = toDate(startDate) ?? minDate;
    const endRaw = toDate(endDate) ?? startRaw;

    const start = startRaw < minDate ? minDate : startRaw;
    const end = endRaw > maxDate ? maxDate : endRaw;

    if (end < minDate || start > maxDate) {
      return { left: -1, width: 0 };
    }

    const leftDays = daysBetween(minDate, start);
    const spanDays = Math.max(daysBetween(start, end) + 1, 1);

    return {
      left: Math.min((leftDays / totalDays) * 100, 100),
      width: Math.max((spanDays / totalDays) * 100, 1),
    };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Calendário Gantt de macrociclos e mesociclos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-12 gap-1 text-[10px] text-muted-foreground">
          {MONTHS.map((m) => (
            <div key={m} className="text-center">{m}</div>
          ))}
        </div>
        <div className="relative h-3 rounded bg-muted/40 overflow-hidden">
          {weekSeparators.map((week) => (
            <div
              key={week.key}
              className="absolute top-0 bottom-0 w-px bg-border/70"
              style={{ left: `${week.left}%` }}
            />
          ))}
          {monthStarts.map((month) => (
            <div
              key={month.key}
              className="absolute top-0 bottom-0 w-px bg-foreground/20"
              style={{ left: `${month.left}%` }}
            />
          ))}
          {todayInWindow && (
            <>
              <div
                className="absolute -top-5 -translate-x-1/2 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-medium text-white z-20"
                style={{ left: `${todayLeft}%` }}
              >
                Hoje
              </div>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: `${todayLeft}%` }}
              />
            </>
          )}
        </div>
        <div className="space-y-2">
          {safeMacrocycles.length === 0 && (
            <p className="text-xs text-muted-foreground">Sem macrociclos para mostrar.</p>
          )}
          {safeMacrocycles.map((m) => {
            const macroBar = barPosition(m.data_inicio, m.data_fim);
            const relatedMesocycles = safeMesocycles.filter((meso) => meso.macrociclo_id === m.id);

            if (macroBar.width <= 0) return null;

            return (
              <div key={m.id} className="space-y-1">
                <div className="text-[11px] font-medium truncate">{m.nome}</div>
                <div className="h-3 rounded bg-muted relative overflow-hidden">
                  {weekSeparators.map((week) => (
                    <div
                      key={`${m.id}-${week.key}`}
                      className="absolute top-0 bottom-0 w-px bg-border/60"
                      style={{ left: `${week.left}%` }}
                    />
                  ))}
                  {todayInWindow && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500/90 z-10"
                      style={{ left: `${todayLeft}%` }}
                    />
                  )}
                  <div
                    className={`h-3 rounded absolute top-0 ${barColor(m.tipo)}`}
                    style={{
                      left: `${macroBar.left}%`,
                      width: `${macroBar.width}%`,
                    }}
                  />
                </div>

                {relatedMesocycles.map((meso) => {
                  const mesoBar = barPosition(meso.data_inicio, meso.data_fim);
                  if (mesoBar.width <= 0) return null;
                  return (
                    <div key={meso.id} className="pl-3">
                      <div className="text-[10px] text-muted-foreground truncate">{meso.nome}</div>
                      <div className="h-2 rounded bg-muted/70 relative overflow-hidden">
                        {weekSeparators.map((week) => (
                          <div
                            key={`${meso.id}-${week.key}`}
                            className="absolute top-0 bottom-0 w-px bg-border/50"
                            style={{ left: `${week.left}%` }}
                          />
                        ))}
                        {todayInWindow && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500/90 z-10"
                            style={{ left: `${todayLeft}%` }}
                          />
                        )}
                        <div
                          className="h-2 rounded absolute top-0 bg-blue-500/70"
                          style={{
                            left: `${mesoBar.left}%`,
                            width: `${mesoBar.width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {relatedMesocycles.length === 0 && (
                  <p className="pl-3 text-[10px] text-muted-foreground">Sem mesociclos neste macrociclo.</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
