import type { ComponentProps } from 'react';
import { DesportivoPerformanceTab } from '@/Components/Desportivo/DesportivoPerformanceTab';

type PerformanceTabProps = ComponentProps<typeof DesportivoPerformanceTab>;

export function PerformanceTab(props: PerformanceTabProps) {
  return <DesportivoPerformanceTab {...props} />;
}
