import type { ComponentProps } from 'react';
import { Desportivo2CompeticoesTab } from '@/Components/Desportivo2/Desportivo2CompeticoesTab';

type CompetitionsTabProps = ComponentProps<typeof Desportivo2CompeticoesTab>;

export function CompetitionsTab(props: CompetitionsTabProps) {
  return <Desportivo2CompeticoesTab {...props} />;
}
