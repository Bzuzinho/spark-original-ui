import type { ComponentProps } from 'react';
import { DesportivoPlaneamentoTab } from '@/Components/Desportivo/DesportivoPlaneamentoTab';

type PlanningTabProps = ComponentProps<typeof DesportivoPlaneamentoTab>;

export function PlanningTab(props: PlanningTabProps) {
  return <DesportivoPlaneamentoTab {...props} />;
}
