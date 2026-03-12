import type { ReactNode } from 'react';
import { Card, CardContent } from '@/Components/ui/card';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
}

export function MiniCard({ title, subtitle, right, children }: Props) {
  return (
    <Card>
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold leading-tight">{title}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {right}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
