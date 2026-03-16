import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import type { CaisPerformanceRow, Training, User } from '@/Components/Desportivo/types';

interface Props {
  open: boolean;
  athlete: User | null;
  training: Training | null;
  initialRows: CaisPerformanceRow[];
  onClose: () => void;
  onSave: (rows: CaisPerformanceRow[]) => void;
}

function emptyRow(): CaisPerformanceRow {
  return {
    id: crypto.randomUUID(),
    metrica: '',
    valor: '',
    tempo: '',
    observacao: '',
  };
}

export function CaisAthletePerformanceModal({
  open,
  athlete,
  training,
  initialRows,
  onClose,
  onSave,
}: Props) {
  const [rows, setRows] = useState<CaisPerformanceRow[]>([]);

  useEffect(() => {
    setRows(initialRows.length > 0 ? initialRows : [emptyRow()]);
  }, [initialRows, athlete?.id, training?.id, open]);

  const contextLabel = useMemo(() => {
    if (!training) return 'Sem treino selecionado';
    return `${training.numero_treino || 'Treino'} · ${training.data} ${training.hora_inicio || ''}`.trim();
  }, [training]);

  const updateRow = (id: string, patch: Partial<CaisPerformanceRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length > 0 ? next : [emptyRow()];
    });
  };

  const handleSave = () => {
    onSave(rows);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cais - registo do atleta</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-xs">
            <p className="font-semibold">{athlete?.nome_completo || 'Atleta'}</p>
            <p className="text-muted-foreground">{contextLabel}</p>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left p-2 font-medium">Métrica</th>
                  <th className="text-left p-2 font-medium">Valor</th>
                  <th className="text-left p-2 font-medium">Tempo</th>
                  <th className="text-left p-2 font-medium">Observação</th>
                  <th className="text-left p-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2"><Input value={row.metrica} onChange={(e) => updateRow(row.id, { metrica: e.target.value })} placeholder="6x100" className="h-8 text-xs" /></td>
                    <td className="p-2"><Input value={row.valor} onChange={(e) => updateRow(row.id, { valor: e.target.value })} placeholder="1:12 méd." className="h-8 text-xs" /></td>
                    <td className="p-2"><Input value={row.tempo} onChange={(e) => updateRow(row.id, { tempo: e.target.value })} placeholder="07:22" className="h-8 text-xs" /></td>
                    <td className="p-2"><Input value={row.observacao} onChange={(e) => updateRow(row.id, { observacao: e.target.value })} placeholder="técnica estável" className="h-8 text-xs" /></td>
                    <td className="p-2"><Button type="button" size="sm" variant="outline" className="h-8" onClick={() => removeRow(row.id)}>Remover</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Registos guardados por treino e atleta, com fallback local em caso de falha de rede.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={addRow}>Adicionar linha</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleSave}>Guardar registo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
