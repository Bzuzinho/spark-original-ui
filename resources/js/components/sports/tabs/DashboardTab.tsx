import type { ComponentProps } from 'react';
import { Desportivo2DashboardTab } from '@/Components/Desportivo2/Desportivo2DashboardTab';

type DashboardTabProps = ComponentProps<typeof Desportivo2DashboardTab>;

export function DashboardTab(props: DashboardTabProps) {
  return <Desportivo2DashboardTab {...props} />;
}
