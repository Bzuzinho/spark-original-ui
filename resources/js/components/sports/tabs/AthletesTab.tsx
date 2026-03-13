import type { ComponentProps } from 'react';
import { Desportivo2AtletasTab } from '@/Components/Desportivo2/Desportivo2AtletasTab';

type AthletesTabProps = ComponentProps<typeof Desportivo2AtletasTab>;

export function AthletesTab(props: AthletesTabProps) {
  return <Desportivo2AtletasTab {...props} />;
}
