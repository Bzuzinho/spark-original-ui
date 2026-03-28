import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

interface Props {
  alerts: AlertItem[];
  unreadCount: number;
}

export default function UnreadAlertsList({ alerts, unreadCount }: Props) {
  const markRead = (alertId: string, link?: string | null) => {
    router.post(
      route('comunicacao.alerts.markRead'),
      { alert_id: alertId },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (link) {
            router.visit(link);
          }
        },
      },
    );
  };

  return (
    <Card className="p-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Alertas por Ler</span>
          <Badge variant={unreadCount > 0 ? 'destructive' : 'secondary'}>{unreadCount}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 && <p className="text-xs text-muted-foreground">Sem alertas por ler.</p>}
        {alerts.map((alert) => (
          <div key={alert.id} className="border rounded-md p-2 text-xs">
            <p className="font-medium">{alert.title}</p>
            <p className="text-muted-foreground mt-0.5">{alert.message}</p>
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => markRead(alert.id, alert.link)}>
                Marcar como lido
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
