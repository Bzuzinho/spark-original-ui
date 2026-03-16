import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import type { Macrocycle } from '@/Components/Desportivo/types';

interface Props {
  macrocycles: Macrocycle[];
}

const MONTHS = ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];

function monthIndexFromDate(date: string): number {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 0;
  const m = d.getMonth();
  return m >= 8 ? m - 8 : m + 4;
}

function barColor(type: string): string {
  if (type.toLowerCase().includes('compet')) return 'bg-rose-500/70';
  if (type.toLowerCase().includes('taper')) return 'bg-amber-500/70';
  if (type.toLowerCase().includes('espec')) return 'bg-indigo-500/70';
  if (type.toLowerCase().includes('transi')) return 'bg-slate-500/70';
  return 'bg-emerald-500/70';
}

export function AnnualCycleCalendar({ macrocycles }: Props) {
  const safeMacrocycles = Array.isArray(macrocycles) ? macrocycles : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Calendário anual (Set → Ago)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-12 gap-1">
          {MONTHS.map((m) => (
            <div key={m} className="text-[10px] text-muted-foreground text-center">{m}</div>
          ))}
        </div>
        <div className="space-y-2">
          {safeMacrocycles.length === 0 && (
            <p className="text-xs text-muted-foreground">Sem macrociclos para mostrar.</p>
          )}
          {safeMacrocycles.map((m) => {
            const start = monthIndexFromDate(m.data_inicio);
            const end = monthIndexFromDate(m.data_fim);
            const span = Math.max((end - start + 1) || 1, 1);
            return (
              <div key={m.id} className="space-y-1">
                <div className="text-[11px] font-medium truncate">{m.nome}</div>
                <div className="grid grid-cols-12 gap-1 h-3 items-center">
                  <div className="h-2 rounded col-span-12 bg-muted relative overflow-hidden">
                    <div
                      className={`h-2 rounded absolute top-0 ${barColor(m.tipo)}`}
                      style={{
                        left: `${(start / 12) * 100}%`,
                        width: `${Math.min((span / 12) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
