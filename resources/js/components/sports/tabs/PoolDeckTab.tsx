import type { ComponentProps } from 'react';
import { CaisTab } from '@/Components/Desportivo2/CaisTab';

type PoolDeckTabProps = ComponentProps<typeof CaisTab>;

export function PoolDeckTab(props: PoolDeckTabProps) {
  return <CaisTab {...props} />;
}
