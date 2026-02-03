import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SwimmingPool, 
  TrendUp, 
  Calendar, 
  Warning, 
  Trophy, 
  Users,
  ChartBar
} from '@phosphor-icons/react';
import type { 
  User, 
  DadosDesportivos, 
  Treino,
  Competicao
} from '@/lib/types';

interface EscalaoMetrics {
  escalaoId: string;
  escalaoName: string;
  metrosSemana: number;
  metrosMes: number;
}

export function DashboardTab() {
  const [users] = useKV<User[]>('club-users', []);
  const [dadosDesportivos] = useKV<DadosDesportivos[]>('dados-desportivos', []);
  const [treinos] = useKV<Treino[]>('treinos', []);
  const [competicoes] = useKV<Competicao[]>('competicoes', []);
  const [escaloes] = useKV<Array<{ id: string; name: string }>>('settings-age-groups', []);

  const [stats, setStats] = useState({
    atletasAtivos: 0,
    proximasCompeticoes: 0,
    atestadosACaducar: 0,
    treinos7Dias: 0,
    treinos30Dias: 0,
  });

  const [escaloesMetrics, setEscaloesMetrics] = useState<EscalaoMetrics[]>([]);

  useEffect(() => {
    const calcularStats = () => {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      const umaSemanaAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      umaSemanaAtras.setHours(0, 0, 0, 0);
      const umMesAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      umMesAtras.setHours(0, 0, 0, 0);
      const trintaDiasFrente = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const atletasAtivos = (dadosDesportivos || []).filter(d => d.ativo).length;

      const proximasComps = (competicoes || []).filter(c => {
        if (!c.data_inicio) return false;
        const dataInicio = new Date(c.data_inicio);
        return dataInicio >= now && dataInicio <= trintaDiasFrente;
      }).length;

      const atestadosCaducar = (dadosDesportivos || []).filter(d => {
        if (!d.data_atestado_medico) return false;
        const dataAtestado = new Date(d.data_atestado_medico);
        const umAnoDepois = new Date(dataAtestado.getTime() + 365 * 24 * 60 * 60 * 1000);
        const trintaDiasAntes = new Date(umAnoDepois.getTime() - 30 * 24 * 60 * 60 * 1000);
        return now >= trintaDiasAntes && now <= umAnoDepois;
      }).length;

      const treinosArray = treinos || [];
      const treinosValidos = treinosArray.filter(t => t.data);
      console.log('=== DASHBOARD DESPORTIVO DEBUG ===');
      console.log('Total de treinos na base de dados:', treinosArray.length);
      console.log('Treinos válidos (com data):', treinosValidos.length);
      
      if (treinosArray.length > 0) {
        console.log('Exemplo de treino completo:', JSON.stringify(treinosArray[0], null, 2));
        console.log('Campos do treino:', Object.keys(treinosArray[0]));
      }
      
      const treinos7Dias = treinosValidos.filter(t => {
        const dataTreino = new Date(t.data);
        dataTreino.setHours(0, 0, 0, 0);
        return dataTreino >= umaSemanaAtras && dataTreino <= now;
      }).length;

      const treinos30Dias = treinosValidos.filter(t => {
        const dataTreino = new Date(t.data);
        dataTreino.setHours(0, 0, 0, 0);
        return dataTreino >= umMesAtras && dataTreino <= now;
      }).length;

      console.log('Treinos últimos 7 dias:', treinos7Dias);
      console.log('Treinos últimos 30 dias:', treinos30Dias);

      setStats({
        atletasAtivos,
        proximasCompeticoes: proximasComps,
        atestadosACaducar: atestadosCaducar,
        treinos7Dias,
        treinos30Dias,
      });

      const metricsMap = new Map<string, { semana: number; mes: number }>();
      const escaloesArray = escaloes || [];

      console.log('Escalões configurados:', escaloesArray.length);
      if (escaloesArray.length > 0) {
        console.log('Exemplo de escalão:', JSON.stringify(escaloesArray[0], null, 2));
      }

      escaloesArray.forEach(escalao => {
        metricsMap.set(escalao.id, { semana: 0, mes: 0 });
      });

      let treinosProcessados = 0;
      let treinosSemEscaloes = 0;
      let treinosSemMetros = 0;

      treinosValidos.forEach(treino => {
        if (!treino.data) return;
        
        const dataTreino = new Date(treino.data);
        dataTreino.setHours(0, 0, 0, 0);
        const metros = Number(treino.volume_planeado_m) || 0;

        const escaloesDoTreino = treino.escaloes || [];
        
        console.log(`Treino ${treino.numero_treino || treino.id}:`, {
          data: treino.data,
          escaloes: escaloesDoTreino,
          metros: metros,
          dentroSemana: dataTreino >= umaSemanaAtras && dataTreino <= now,
          dentroMes: dataTreino >= umMesAtras && dataTreino <= now
        });
        
        if (escaloesDoTreino.length === 0) {
          treinosSemEscaloes++;
          console.log(`  ⚠ Treino sem escalões`);
          return;
        }

        if (metros === 0) {
          treinosSemMetros++;
          console.log(`  ⚠ Treino sem metros`);
          return;
        }

        treinosProcessados++;

        escaloesDoTreino.forEach(escalaoId => {
          if (!escalaoId) return;
          
          const current = metricsMap.get(escalaoId) || { semana: 0, mes: 0 };

          if (dataTreino >= umaSemanaAtras && dataTreino <= now) {
            current.semana += metros;
            console.log(`  ✓ Adicionados ${metros}m ao escalão ${escalaoId} (semana)`);
          }

          if (dataTreino >= umMesAtras && dataTreino <= now) {
            current.mes += metros;
            console.log(`  ✓ Adicionados ${metros}m ao escalão ${escalaoId} (mês)`);
          }

          metricsMap.set(escalaoId, current);
        });
      });

      console.log('Treinos processados com sucesso:', treinosProcessados);
      console.log('Treinos sem escalões:', treinosSemEscaloes);
      console.log('Treinos sem metros:', treinosSemMetros);
      console.log('Mapa de métricas:', Array.from(metricsMap.entries()));

      const metricsArray: EscalaoMetrics[] = Array.from(metricsMap.entries())
        .map(([escalaoId, metrics]) => {
          const escalao = escaloesArray.find(e => e.id === escalaoId);
          return {
            escalaoId,
            escalaoName: escalao?.name || 'Desconhecido',
            metrosSemana: metrics.semana,
            metrosMes: metrics.mes,
          };
        })
        .filter(m => m.metrosSemana > 0 || m.metrosMes > 0)
        .sort((a, b) => b.metrosMes - a.metrosMes);

      console.log('Métricas finais calculadas:', metricsArray.length, 'escalões com dados');
      console.log('Métricas detalhadas:', JSON.stringify(metricsArray, null, 2));
      console.log('=== FIM DEBUG ===');

      setEscaloesMetrics(metricsArray);
    };

    calcularStats();
  }, [treinos, dadosDesportivos, competicoes, escaloes]);

  const alertasAtivos = stats.atestadosACaducar > 0;

  const formatMetros = (metros: number) => {
    if (metros >= 1000) {
      return `${(metros / 1000).toFixed(1)} km`;
    }
    return `${metros} m`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Atletas Ativos</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{stats.atletasAtivos}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50">
              <Users className="text-purple-600" size={20} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Treinos (7 dias)</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{stats.treinos7Dias}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <SwimmingPool className="text-blue-600" size={20} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Treinos (30 dias)</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{stats.treinos30Dias}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50">
              <TrendUp className="text-green-600" size={20} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Próximas Competições</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{stats.proximasCompeticoes}</p>
            </div>
            <div className="p-2 rounded-lg bg-orange-50">
              <Trophy className="text-orange-600" size={20} weight="bold" />
            </div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <ChartBar size={20} className="text-primary" weight="bold" />
          <h3 className="text-sm font-semibold">Metros por Escalão</h3>
        </div>
        
        {escaloesMetrics.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Nenhum treino com metros registado nos últimos 30 dias
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mt-3">
              <p><strong>Total de treinos:</strong> {(treinos || []).length}</p>
              <p><strong>Escalões configurados:</strong> {(escaloes || []).length}</p>
              <p className="mt-2 text-blue-600 font-medium">
                Para ver dados aqui, crie treinos com:
              </p>
              <ul className="text-left max-w-xs mx-auto mt-2 space-y-1">
                <li>✓ Data de realização</li>
                <li>✓ Escalão(ões) selecionado(s)</li>
                <li>✓ Metros totais preenchidos</li>
              </ul>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {escaloesMetrics.map((metric) => (
              <Card key={metric.escalaoId} className="p-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">{metric.escalaoName}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Última semana:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatMetros(metric.metrosSemana)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Último mês:</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatMetros(metric.metrosMes)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {alertasAtivos && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Alertas</h3>
          
          {stats.atestadosACaducar > 0 && (
            <Alert variant="destructive" className="py-2">
              <Warning className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {stats.atestadosACaducar} atestado(s) médico(s) a caducar nos próximos 30 dias
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
