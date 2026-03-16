import type { ComponentProps } from 'react';
import { DesportivoTreinosTab } from '@/Components/Desportivo/DesportivoTreinosTab';

type TrainingsTabProps = ComponentProps<typeof DesportivoTreinosTab>;

export function TrainingsTab(props: TrainingsTabProps) {
  return <DesportivoTreinosTab {...props} />;
}
