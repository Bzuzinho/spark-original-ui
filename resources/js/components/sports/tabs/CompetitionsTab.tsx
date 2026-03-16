import type { ComponentProps } from 'react';
import { DesportivoCompeticoesTab } from '@/Components/Desportivo/DesportivoCompeticoesTab';

type CompetitionsTabProps = ComponentProps<typeof DesportivoCompeticoesTab>;

export function CompetitionsTab(props: CompetitionsTabProps) {
  return <DesportivoCompeticoesTab {...props} />;
}
