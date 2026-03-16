import type { ComponentProps } from 'react';
import { CaisTab } from '@/Components/Desportivo/CaisTab';

type PoolDeckTabProps = ComponentProps<typeof CaisTab>;

export function PoolDeckTab(props: PoolDeckTabProps) {
  return <CaisTab {...props} />;
}
