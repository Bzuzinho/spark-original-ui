import type { ComponentProps } from 'react';
import { Desportivo2PerformanceTab } from '@/Components/Desportivo2/Desportivo2PerformanceTab';

type PerformanceTabProps = ComponentProps<typeof Desportivo2PerformanceTab>;

export function PerformanceTab(props: PerformanceTabProps) {
  return <Desportivo2PerformanceTab {...props} />;
}
