import { Button } from '@/Components/ui/button';

interface Props {
  title: string;
  subtitle: string;
  onOpen?: () => void;
  onSchedule?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SessionCard({ title, subtitle, onOpen, onSchedule, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-md p-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium break-words">{title}</p>
        <p className="text-xs text-muted-foreground break-words">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-1 sm:shrink-0">
        {onOpen && <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onOpen}>Abrir</Button>}
        {onSchedule && <Button size="sm" className="h-8 text-xs" onClick={onSchedule}>Agendar treino</Button>}
        {onEdit && <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onEdit}>Editar</Button>}
        {onDelete && <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={onDelete}>Apagar</Button>}
      </div>
    </div>
  );
}
