import type { ComponentProps } from 'react';
import { Desportivo2TreinosTab } from '@/Components/Desportivo2/Desportivo2TreinosTab';

type TrainingsTabProps = ComponentProps<typeof Desportivo2TreinosTab>;

export function TrainingsTab(props: TrainingsTabProps) {
  return <Desportivo2TreinosTab {...props} />;
}
