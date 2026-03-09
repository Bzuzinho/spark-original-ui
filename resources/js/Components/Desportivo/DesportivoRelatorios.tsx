import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CurrencyCircleDollar, TrendUp, Users, Trophy } from '@phosphor-icons/react';

interface VolumeByAthlete {
  nome_completo: string;
  total_m: number;
}

interface AttendanceByGroup {
  nome?: string;
  percentagem?: number;
  presentes: number;
  ausentes: number;
  total: number;
}

interface CompetitionStat {
  id: string;
  titulo: string;
  data_inicio: string;
  participants_count: number;
}

interface FinanceVsSport {
  totalFinancialWeight: number;
  totalSportDistanceKm: number;
  costPerKm: number | null;
}

interface DesportivoRelatoriosProps {
  financeVsSport?: FinanceVsSport;
  volumeByAthlete?: VolumeByAthlete[];
  reportAttendanceByGroup?: AttendanceByGroup[];
  competitionStats?: CompetitionStat[];
}

export function DesportivoRelatorios({
  financeVsSport,
  volumeByAthlete = [],
  reportAttendanceByGroup = [],
  competitionStats = [],
}: DesportivoRelatoriosProps) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <CurrencyCircleDollar size={20} weight="duotone" className="text-emerald-600" />
            Peso Financeiro vs Peso Desportivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="grid gap-2.5 md:grid-cols-3">
            <div className="border rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground mb-1">Peso financeiro</p>
              <p className="text-xl font-bold">
                {(financeVsSport?.totalFinancialWeight ?? 0).toFixed(2)} €
              </p>
            </div>
            <div className="border rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground mb-1">Volume desportivo</p>
              <p className="text-xl font-bold">
                {(financeVsSport?.totalSportDistanceKm ?? 0).toFixed(2)} km
              </p>
            </div>
            <div className="border rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground mb-1">Custo por km</p>
              <p className="text-xl font-bold">
                {financeVsSport?.costPerKm !== null && financeVsSport?.costPerKm !== undefined
                  ? `${financeVsSport.costPerKm.toFixed(2)} €/km`
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <TrendUp size={20} weight="duotone" className="text-blue-600" />
            Volume por Atleta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {volumeByAthlete.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Sem dados disponíveis
              </p>
            ) : (
              volumeByAthlete.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors px-2 rounded"
                >
                  <span className="text-xs font-medium">{v.nome_completo}</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {(v.total_m / 1000).toFixed(2)} km
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Users size={20} weight="duotone" className="text-purple-600" />
            Assiduidade por Escalão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reportAttendanceByGroup.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Sem dados disponíveis
              </p>
            ) : (
              reportAttendanceByGroup.map((g, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-2.5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{g.nome ?? 'Sem escalão'}</span>
                    <span className="text-sm font-bold text-purple-600">
                      {g.percentagem ?? 0}%
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Presentes: {g.presentes}</span>
                    <span>Ausentes: {g.ausentes}</span>
                    <span>Total: {g.total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Trophy size={20} weight="duotone" className="text-yellow-600" />
            Competições da Época
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {competitionStats.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Sem dados disponíveis
              </p>
            ) : (
              competitionStats.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors px-2 rounded"
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium">{c.titulo}</p>
                    <p className="text-xs text-muted-foreground">{c.data_inicio}</p>
                  </div>
                  <span className="text-xs font-semibold text-yellow-600">
                    {c.participants_count} inscritos
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
