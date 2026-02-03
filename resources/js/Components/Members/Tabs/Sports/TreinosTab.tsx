import { User } from '@/types';
import { Construction } from 'lucide-react';

interface TreinosTabProps {
  user: User;
}

export function TreinosTab({ user }: TreinosTabProps) {
  return (
    <div className="p-12 border rounded-lg text-center">
      <Construction className="mx-auto text-muted-foreground mb-3" size={48} strokeWidth={1} />
      <h3 className="text-sm font-semibold mb-2">Em desenvolvimento</h3>
      <p className="text-xs text-muted-foreground">
        A funcionalidade de treinos estará disponível em breve.
      </p>
    </div>
  );
}
