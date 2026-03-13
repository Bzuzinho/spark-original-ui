import type { ComponentProps } from 'react';
import { Desportivo2PlaneamentoTab } from '@/Components/Desportivo2/Desportivo2PlaneamentoTab';

type PlanningTabProps = ComponentProps<typeof Desportivo2PlaneamentoTab>;

export function PlanningTab(props: PlanningTabProps) {
  return <Desportivo2PlaneamentoTab {...props} />;
}
