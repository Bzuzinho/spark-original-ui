import { useMemo } from 'react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { DownloadSimple, Printer } from '@phosphor-icons/react';

interface Report {
  title: string;
  description: string;
  data: { label: string; value: number | string }[];
}

interface EventosRelatoriosProps {
  events: any[];
  attendances?: any[];
  results?: any[];
}

export function EventosRelatorios({ events = [], attendances = [], results = [] }: EventosRelatoriosProps) {
  const reports = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;

    const eventsThisMonth = events.filter((e: any) => {
      const date = new Date(e.data_inicio);
      return date.getFullYear() === thisYear && date.getMonth() + 1 === thisMonth;
    });

    const completedEvents = events.filter((e: any) => e.estado === 'concluido');

    const attendanceRate = attendances.length > 0
      ? ((attendances.filter((a: any) => a.estado === 'presente').length / attendances.length) * 100)
      : 0;

    return [
      {
        title: 'Estatísticas de Eventos',
        description: 'Overview dos eventos no corrente mês',
        data: [
          { label: 'Total de Eventos', value: events.length },
          { label: 'Este Mês', value: eventsThisMonth.length },
          { label: 'Concluídos', value: completedEvents.length },
          { label: 'Taxa de Presença Média', value: `${attendanceRate.toFixed(1)}%` },
        ],
      },
      {
        title: 'Atividade por Tipo',
        description: 'Distribuição de tipos de evento',
        data: [
          { label: 'Treinos', value: events.filter((e: any) => e.tipo === 'treino').length },
          { label: 'Provas', value: events.filter((e: any) => e.tipo === 'prova').length },
          { label: 'Outros', value: events.filter((e: any) => !['treino', 'prova'].includes(e.tipo)).length },
        ],
      },
    ];
  }, [events, attendances, results]);

  const exportToCSV = () => {
    const csvContent = reports
      .map((report) =>
        [
          report.title,
          '',
          report.data.map((d) => `${d.label},${d.value}`).join('\n'),
          '',
        ].join('\n')
      )
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    );
    element.setAttribute('download', 'relatorio-eventos.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={exportToCSV}>
          <DownloadSimple size={16} className="mr-2" />
          Exportar CSV
        </Button>
        <Button size="sm" variant="outline">
          <Printer size={16} className="mr-2" />
          Imprimir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title} className="p-4">
            <h3 className="font-semibold mb-2">{report.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
            <div className="space-y-2">
              {report.data.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{item.label}</span>
                  <Badge variant="secondary">{item.value}</Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
