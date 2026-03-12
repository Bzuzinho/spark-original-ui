import type { ReactNode } from 'react';
import { Card } from '@/Components/ui/card';

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}

export function MetricCard({ label, value, hint, icon }: Props) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold leading-tight">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
        {icon}
      </div>
    </Card>
  );
}
