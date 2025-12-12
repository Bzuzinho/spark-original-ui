import { User, Treino, TreinoAtleta } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { SwimmingPool, CalendarBlank, CheckCircle, Clock, Eye } from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TreinosTabProps {
  user: User;
}

interface EscalaoInfo {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export function TreinosTab({ user }: TreinosTabProps) {
  const [treinos] = useKV<Treino[]>('treinos', []);
  const [treinosAtleta, setTreinosAtleta] = useKV<TreinoAtleta[]>('treinos-atleta', []);
  const [escaloes] = useKV<EscalaoInfo[]>('settings-age-groups', []);
  
  const [selectedTreino, setSelectedTreino] = useState<Treino | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTreinoAtleta, setEditingTreinoAtleta] = useState<TreinoAtleta | null>(null);
  const [volumeReal, setVolumeReal] = useState('');

  const atletaEscaloes = user.escalao || [];

  const treinosDoAtleta = useMemo(() => {
    const treinosFiltrados = (treinos || [])
      .filter(treino => {
        const treinoEscaloes = treino.escaloes || [];
        return treinoEscaloes.some(escalaoId => atletaEscaloes.includes(escalaoId));
      })
      .sort((a, b) => {
        const dateA = new Date(a.data + (a.hora_inicio ? 'T' + a.hora_inicio : '')).getTime();
        const dateB = new Date(b.data + (b.hora_inicio ? 'T' + b.hora_inicio : '')).getTime();
        return dateB - dateA;
      });

    return treinosFiltrados;
  }, [treinos, atletaEscaloes]);

  const getTreinoAtletaInfo = (treinoId: string) => {
    return (treinosAtleta || []).find(ta => ta.treino_id === treinoId && ta.user_id === user.id);
  };

  const getEscalaoNome = (escalaoId: string) => {
    const escalao = escaloes?.find(e => e.id === escalaoId);
    return escalao?.name || escalaoId;
  };

  const handleMarkAsComplete = (treino: Treino) => {
    const treinoAtletaExistente = getTreinoAtletaInfo(treino.id);
    
    if (treinoAtletaExistente) {
      setEditingTreinoAtleta(treinoAtletaExistente);
      setVolumeReal(treinoAtletaExistente.volume_real_m?.toString() || treino.volume_planeado_m?.toString() || '');
    } else {
      setEditingTreinoAtleta(null);
      setVolumeReal(treino.volume_planeado_m?.toString() || '');
    }
    setSelectedTreino(treino);
    setEditDialogOpen(true);
  };

  const handleSaveCompletion = async () => {
    if (!selectedTreino) return;

    const volumeRealNum = volumeReal ? parseInt(volumeReal) : undefined;

    if (editingTreinoAtleta) {
      setTreinosAtleta(current =>
        (current || []).map(ta =>
          ta.id === editingTreinoAtleta.id
            ? {
                ...ta,
                volume_real_m: volumeRealNum,
                registado_em: new Date().toISOString(),
              }
            : ta
        )
      );
      toast.success('Treino atualizado');
    } else {
      const novoTreinoAtleta: TreinoAtleta = {
        id: crypto.randomUUID(),
        treino_id: selectedTreino.id,
        user_id: user.id,
        presente: true,
        volume_real_m: volumeRealNum,
        registado_por: user.id,
        registado_em: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      setTreinosAtleta(current => [...(current || []), novoTreinoAtleta]);
      toast.success('Treino marcado como concluído');
    }

    setEditDialogOpen(false);
  };

  const handleViewDetails = (treino: Treino) => {
    setSelectedTreino(treino);
    setDetailsDialogOpen(true);
  };

  const getTipoTreinoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      aerobio: 'Aeróbio',
      sprint: 'Sprint',
      tecnica: 'Técnica',
      forca: 'Força',
      recuperacao: 'Recuperação',
      misto: 'Misto',
    };
    return tipos[tipo] || tipo;
  };

  const getTipoTreinoColor = (tipo: string) => {
    const cores: Record<string, string> = {
      aerobio: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      sprint: 'bg-red-500/10 text-red-700 dark:text-red-300',
      tecnica: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
      forca: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      recuperacao: 'bg-green-500/10 text-green-700 dark:text-green-300',
      misto: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
    };
    return cores[tipo] || cores.misto;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Treinos agendados para os seus escalões
        </p>
        <Badge variant="outline" className="text-xs">
          {treinosDoAtleta.length} treino{treinosDoAtleta.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {treinosDoAtleta.length === 0 ? (
        <div className="p-8 border rounded-lg text-center">
          <SwimmingPool className="mx-auto text-muted-foreground mb-2" size={32} weight="thin" />
          <p className="text-sm text-muted-foreground">Nenhum treino agendado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Os treinos criados para o seu escalão aparecerão aqui
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {treinosDoAtleta.map(treino => {
              const treinoAtletaInfo = getTreinoAtletaInfo(treino.id);
              const isConcluido = !!treinoAtletaInfo;
              const dataFormatada = format(parseISO(treino.data), 'dd/MM/yyyy', { locale: pt });
              const horaFormatada = treino.hora_inicio || '-';

              return (
                <Collapsible key={treino.id}>
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {treino.numero_treino && (
                            <Badge variant="outline" className="text-xs font-mono">
                              #{treino.numero_treino}
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getTipoTreinoColor(treino.tipo_treino)}`}>
                            {getTipoTreinoLabel(treino.tipo_treino)}
                          </Badge>
                          {isConcluido && (
                            <Badge className="text-xs bg-green-500/10 text-green-700 dark:text-green-300">
                              <CheckCircle size={12} className="mr-1" weight="fill" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <CalendarBlank size={14} />
                            {dataFormatada}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {horaFormatada}
                          </span>
                          {treino.escaloes && treino.escaloes.length > 0 && (
                            <span className="text-xs">
                              {treino.escaloes.map(getEscalaoNome).join(', ')}
                            </span>
                          )}
                        </div>
                        {treino.volume_planeado_m && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Volume: {treino.volume_planeado_m}m
                            {treinoAtletaInfo?.volume_real_m && treinoAtletaInfo.volume_real_m !== treino.volume_planeado_m && (
                              <span className="ml-2 text-primary">
                                (Real: {treinoAtletaInfo.volume_real_m}m)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2"
                          onClick={() => handleViewDetails(treino)}
                        >
                          <Eye size={14} className="mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant={isConcluido ? 'outline' : 'default'}
                          className="h-7 text-xs px-2"
                          onClick={() => handleMarkAsComplete(treino)}
                        >
                          {isConcluido ? (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Editar
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Concluir
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Detalhes do Treino</DialogTitle>
            <DialogDescription>
              Informações completas sobre o treino
            </DialogDescription>
          </DialogHeader>
          {selectedTreino && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Número do Treino</Label>
                  <p className="text-sm font-medium">{selectedTreino.numero_treino || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <p className="text-sm font-medium">{getTipoTreinoLabel(selectedTreino.tipo_treino)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Data</Label>
                  <p className="text-sm font-medium">
                    {format(parseISO(selectedTreino.data), 'dd/MM/yyyy', { locale: pt })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hora Início</Label>
                  <p className="text-sm font-medium">{selectedTreino.hora_inicio || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hora Fim</Label>
                  <p className="text-sm font-medium">{selectedTreino.hora_fim || '-'}</p>
                </div>
              </div>
              {selectedTreino.local && (
                <div>
                  <Label className="text-xs text-muted-foreground">Local</Label>
                  <p className="text-sm font-medium">{selectedTreino.local}</p>
                </div>
              )}
              {selectedTreino.volume_planeado_m && (
                <div>
                  <Label className="text-xs text-muted-foreground">Volume Planeado</Label>
                  <p className="text-sm font-medium">{selectedTreino.volume_planeado_m} metros</p>
                </div>
              )}
              {selectedTreino.escaloes && selectedTreino.escaloes.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Escalões</Label>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedTreino.escaloes.map(escalaoId => (
                      <Badge key={escalaoId} variant="secondary" className="text-xs">
                        {getEscalaoNome(escalaoId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedTreino.descricao_treino && (
                <div>
                  <Label className="text-xs text-muted-foreground">Descrição do Treino</Label>
                  <ScrollArea className="h-[200px] mt-1 border rounded-lg p-3">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {selectedTreino.descricao_treino}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button size="sm" onClick={() => setDetailsDialogOpen(false)} className="h-7 text-xs">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingTreinoAtleta ? 'Editar Treino Concluído' : 'Marcar Treino como Concluído'}
            </DialogTitle>
            <DialogDescription>
              {editingTreinoAtleta 
                ? 'Atualize os metros reais do treino'
                : 'Confirme os metros realizados no treino'}
            </DialogDescription>
          </DialogHeader>
          {selectedTreino && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Treino</Label>
                <p className="text-sm font-medium">
                  {selectedTreino.numero_treino ? `#${selectedTreino.numero_treino}` : ''} - {' '}
                  {format(parseISO(selectedTreino.data), 'dd/MM/yyyy', { locale: pt })}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="volume-real" className="text-xs">
                  Volume Real (metros) *
                </Label>
                <Input
                  id="volume-real"
                  type="number"
                  value={volumeReal}
                  onChange={(e) => setVolumeReal(e.target.value)}
                  placeholder="Ex: 3000"
                  className="h-7 text-xs"
                />
                {selectedTreino.volume_planeado_m && (
                  <p className="text-xs text-muted-foreground">
                    Volume planeado: {selectedTreino.volume_planeado_m}m
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(false)}
              className="h-7 text-xs"
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveCompletion} className="h-7 text-xs">
              {editingTreinoAtleta ? 'Atualizar' : 'Concluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
