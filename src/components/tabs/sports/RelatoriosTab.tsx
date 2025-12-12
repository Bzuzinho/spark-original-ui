import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ChartBar, 
  Trophy, 
  TrendUp, 
  Users,
  Calendar,
  SwimmingPool 
} from '@phosphor-icons/react';
import type { User, TreinoAtleta, ResultadoProva, Fatura, MovimentoConvocatoria, ConvocatoriaAtleta } from '@/lib/types';

export function RelatoriosTab() {
  const [users] = useKV<User[]>('club-users', []);
  const [treinosAtleta] = useKV<TreinoAtleta[]>('treino-atletas', []);
  const [resultados] = useKV<ResultadoProva[]>('evento-resultados', []);
  const [faturas] = useKV<Fatura[]>('club-faturas', []);
  const [movimentosConvocatoria] = useKV<MovimentoConvocatoria[]>('movimentos-convocatoria', []);
  const [convocatoriasAtletas] = useKV<ConvocatoriaAtleta[]>('convocatorias-atletas', []);

  const [atletasStats, setAtletasStats] = useState<{
    id: string;
    nome: string;
    numeroSocio: string;
    totalPresencas: number;
    percentagemPresenca: number;
    totalProvas: number;
    valorPago: number;
    valorGasto: number;
    balanco: number;
  }[]>([]);

  useEffect(() => {
    const calcularStats = () => {
      const atletas = (users || []).filter(u => 
        u.tipo_membro.includes('atleta') && u.estado === 'ativo'
      );

      const stats = atletas.map(atleta => {
        const presencas = (treinosAtleta || []).filter(t => 
          t.user_id === atleta.id && t.estado
        );
        const presentes = presencas.filter(p => p.estado === 'presente').length;
        const percentagem = presencas.length > 0 
          ? Math.round((presentes / presencas.length) * 100) 
          : 0;

        const convocatoriasDoAtleta = (convocatoriasAtletas || []).filter(c => c.atleta_id === atleta.id);
        const totalProvasNasConvocatorias = convocatoriasDoAtleta.reduce((sum, conv) => {
          return sum + (conv.provas?.length || 0);
        }, 0);
        const provas = totalProvasNasConvocatorias;

        const faturasAtleta = (faturas || []).filter(f => f.user_id === atleta.id);
        const valorPago = faturasAtleta
          .filter(f => f.estado_pagamento === 'pago')
          .reduce((sum, f) => sum + f.valor_total, 0);

        const movimentosConvocatoriaAtleta = (movimentosConvocatoria || []).filter(m => m.user_id === atleta.id);
        const valorGasto = movimentosConvocatoriaAtleta
          .reduce((sum, m) => sum + m.valor, 0);

        const balanco = valorPago - valorGasto;

        return {
          id: atleta.id,
          nome: atleta.nome_completo,
          numeroSocio: atleta.numero_socio,
          totalPresencas: presentes,
          percentagemPresenca: percentagem,
          totalProvas: provas,
          valorPago,
          valorGasto,
          balanco,
        };
      });

      setAtletasStats(stats);
    };

    calcularStats();
  }, [users, treinosAtleta, resultados, faturas, movimentosConvocatoria, convocatoriasAtletas]);

  const atletasOrdenadosPorPresenca = [...atletasStats].sort(
    (a, b) => b.percentagemPresenca - a.percentagemPresenca
  );

  const atletasOrdenadosPorProvas = [...atletasStats].sort(
    (a, b) => b.totalProvas - a.totalProvas
  );

  const estatisticasGerais = {
    totalAtletas: atletasStats.length,
    presencaMedia: atletasStats.length > 0
      ? Math.round(
          atletasStats.reduce((sum, a) => sum + a.percentagemPresenca, 0) / atletasStats.length
        )
      : 0,
    totalProvas: atletasStats.reduce((sum, a) => sum + a.totalProvas, 0),
    valorTotalPago: atletasStats.reduce((sum, a) => sum + a.valorPago, 0),
    valorTotalGasto: atletasStats.reduce((sum, a) => sum + a.valorGasto, 0),
  };

  const balancoTotal = estatisticasGerais.valorTotalPago - estatisticasGerais.valorTotalGasto;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-semibold">Relatórios e Estatísticas</h2>
        <p className="text-xs text-muted-foreground">
          Análise de desempenho desportivo e financeiro
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Atletas Ativos</p>
              <p className="text-2xl font-bold mt-1">{estatisticasGerais.totalAtletas}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="text-blue-600" size={20} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Presença Média</p>
              <p className="text-2xl font-bold mt-1">{estatisticasGerais.presencaMedia}%</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50">
              <ChartBar className="text-green-600" size={20} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Provas</p>
              <p className="text-2xl font-bold mt-1">{estatisticasGerais.totalProvas}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50">
              <Trophy className="text-purple-600" size={20} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Balanço Total</p>
              <p className={`text-2xl font-bold mt-1 ${balancoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{Math.abs(balancoTotal).toFixed(2)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${balancoTotal >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <TrendUp className={balancoTotal >= 0 ? 'text-green-600' : 'text-red-600'} size={20} weight="bold" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Top 10 - Assiduidade nos Treinos</h3>
        {atletasOrdenadosPorPresenca.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Sem dados de presenças</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[50px]">#</TableHead>
                  <TableHead className="text-xs">Atleta</TableHead>
                  <TableHead className="text-xs">Nº Sócio</TableHead>
                  <TableHead className="text-xs text-right">Presenças</TableHead>
                  <TableHead className="text-xs text-right">Taxa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atletasOrdenadosPorPresenca.slice(0, 10).map((atleta, index) => (
                  <TableRow key={atleta.id}>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{atleta.nome}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {atleta.numeroSocio}
                    </TableCell>
                    <TableCell className="text-xs text-right">{atleta.totalPresencas}</TableCell>
                    <TableCell className="text-xs text-right">
                      <span className={`font-semibold ${
                        atleta.percentagemPresenca >= 80 ? 'text-green-600' :
                        atleta.percentagemPresenca >= 60 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {atleta.percentagemPresenca}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Top 10 - Participação em Provas</h3>
        {atletasOrdenadosPorProvas.filter(a => a.totalProvas > 0).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Sem resultados de provas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[50px]">#</TableHead>
                  <TableHead className="text-xs">Atleta</TableHead>
                  <TableHead className="text-xs">Nº Sócio</TableHead>
                  <TableHead className="text-xs text-right">Nº Provas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atletasOrdenadosPorProvas
                  .filter(a => a.totalProvas > 0)
                  .slice(0, 10)
                  .map((atleta, index) => (
                    <TableRow key={atleta.id}>
                      <TableCell className="text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{atleta.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {atleta.numeroSocio}
                      </TableCell>
                      <TableCell className="text-xs text-right font-semibold">
                        {atleta.totalProvas}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Análise Financeira vs Desportiva</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Comparação entre investimento financeiro e retorno desportivo por atleta
        </p>
        {atletasStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <SwimmingPool size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Sem dados disponíveis</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Atleta</TableHead>
                  <TableHead className="text-xs">Nº Sócio</TableHead>
                  <TableHead className="text-xs text-right">Valor Pago</TableHead>
                  <TableHead className="text-xs text-right">Valor Gasto</TableHead>
                  <TableHead className="text-xs text-right">Balanço</TableHead>
                  <TableHead className="text-xs text-right">Presença</TableHead>
                  <TableHead className="text-xs text-right">Provas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atletasStats
                  .filter(a => a.valorPago > 0 || a.valorGasto > 0)
                  .map((atleta) => (
                    <TableRow key={atleta.id}>
                      <TableCell className="text-xs font-medium">{atleta.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {atleta.numeroSocio}
                      </TableCell>
                      <TableCell className="text-xs text-right text-green-600 font-medium">
                        €{atleta.valorPago.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right text-red-600 font-medium">
                        €{atleta.valorGasto.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <span className={`font-semibold ${atleta.balanco >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {atleta.balanco >= 0 ? '+' : ''}€{atleta.balanco.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <span className={
                          atleta.percentagemPresenca >= 80 ? 'text-green-600' :
                          atleta.percentagemPresenca >= 60 ? 'text-orange-600' :
                          'text-red-600'
                        }>
                          {atleta.percentagemPresenca}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {atleta.totalProvas}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-green-50/50 border-green-200">
        <h4 className="text-xs font-semibold mb-2">Sobre os Relatórios</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Presença Média:</strong> Taxa de assiduidade nos treinos registados</p>
          <p>• <strong>Valor Pago:</strong> Total de faturas pagas pelo atleta</p>
          <p>• <strong>Valor Gasto:</strong> Soma dos movimentos de custos internos afetos ao atleta (custos de inscrição em provas)</p>
          <p>• <strong>Balanço:</strong> Diferença entre valor pago e valor gasto (positivo = clube lucra, negativo = clube investe)</p>
          <p>• <strong>Provas:</strong> Número total de provas em que o atleta foi convocado (soma de todas as provas nas convocatórias)</p>
          <p>• Use esta análise para avaliar o investimento do clube por atleta e identificar oportunidades de otimização</p>
        </div>
      </Card>
    </div>
  );
}
