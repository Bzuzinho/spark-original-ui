import { Button } from '@/Components/ui/button';

interface Props {
  title: string;
  subtitle: string;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SessionCard({ title, subtitle, onOpen, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-md p-2 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        {onOpen && <Button size="sm" variant="outline" onClick={onOpen}>Abrir</Button>}
        {onEdit && <Button size="sm" variant="outline" onClick={onEdit}>Editar</Button>}
        {onDelete && <Button size="sm" variant="ghost" onClick={onDelete}>Apagar</Button>}
      </div>
    </div>
  );
}
