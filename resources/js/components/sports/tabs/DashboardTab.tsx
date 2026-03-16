import type { ComponentProps } from 'react';
import { DesportivoDashboardTab } from '@/Components/Desportivo/DesportivoDashboardTab';

type DashboardTabProps = ComponentProps<typeof DesportivoDashboardTab>;

export function DashboardTab(props: DashboardTabProps) {
  return <DesportivoDashboardTab {...props} />;
}
