import type { ComponentProps } from 'react';
import { DesportivoAtletasTab } from '@/Components/Desportivo/DesportivoAtletasTab';

type AthletesTabProps = ComponentProps<typeof DesportivoAtletasTab>;

export function AthletesTab(props: AthletesTabProps) {
  return <DesportivoAtletasTab {...props} />;
}
