import type { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function SectionTitle({ title, subtitle, right }: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between gap-2 flex-wrap">
      <div>
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
