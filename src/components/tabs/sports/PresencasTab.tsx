import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Question, Trash, CaretDown, CaretUp, Plus, ClipboardText, MagnifyingGlass } from '@phosphor-icons/react';
import type { Treino, TreinoAtleta, User, EstadoPresenca } from '@/lib/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { getEscalaoName, getEscaloesNames } from '@/lib/user-helpers';

interface PresencasTabProps {
  onNavigate?: (view: string, context?: any) => void;
}

export function PresencasTab({ onNavigate }: PresencasTabProps) {
  const [treinos] = useKV<Treino[]>('treinos', []);
  const [presencas, setPresencas] = useKV<TreinoAtleta[]>('treino-atletas', []);
  const [users] = useKV<User[]>('club-users', []);
  const [escaloes] = useKV<any[]>('settings-age-groups', []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [treinoFilter, setTreinoFilter] = useState<string>('todos');
  const [presenceFilter, setPresenceFilter] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTreino, setSelectedTreino] = useState<string>('');
  const [presencaData, setPresencaData] = useState<{
    [userId: string]: { estado: EstadoPresenca | ''; hora_chegada?: string; observacoes?: string };
  }>({});
  const [expandedCards, setExpandedCards] = useState<{ [treinoId: string]: boolean }>({});
  const [hiddenEmptyTreinos, setHiddenEmptyTreinos] = useState<string[]>([]);

  const activeTreinos = useMemo(() => {
    return (treinos || []).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [treinos]);

  const filteredPresencas = useMemo(() => {
    return (presencas || []).filter(pres => {
      const user = users?.find(u => u.id === pres.user_id);
      const treino = treinos?.find(t => t.id === pres.treino_id);
      
      const matchesSearch = 
        user?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treino?.local?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTreino = treinoFilter === 'todos' || pres.treino_id === treinoFilter;
      const matchesPresence = 
        presenceFilter === 'todos' || 
        (presenceFilter === 'presente' && pres.estado === 'presente') ||
        (presenceFilter === 'ausente' && pres.estado === 'ausente') ||
        (presenceFilter === 'justificado' && pres.estado === 'justificado');
      
      return matchesSearch && matchesTreino && matchesPresence;
    }).sort((a, b) => new Date(b.registado_em || 0).getTime() - new Date(a.registado_em || 0).getTime());
  }, [presencas, users, treinos, searchTerm, treinoFilter, presenceFilter]);

  const getEscaloesNomes = (ids: string[] = []) => {
    return getEscaloesNames(ids, escaloes || []);
  };

  const getAtletasForTreino = (treinoId: string) => {
    const treino = treinos?.find(t => t.id === treinoId);
    if (!treino) return [];
    
    const existingPresencas = (presencas || []).filter(p => p.treino_id === treinoId);
    const userIdsInPresencas = existingPresencas.map(p => p.user_id);
    
    const eligibleUsers = (users || []).filter(u => {
      if (userIdsInPresencas.includes(u.id)) return true;
      
      if (u.estado !== 'ativo') return false;
      if (!u.tipo_membro.includes('atleta')) return false;
      
      if (!treino.escaloes || treino.escaloes.length === 0) return false;
      if (!u.escalao || u.escalao.length === 0) return false;
      
      return u.escalao.some(userEscalao => 
        treino.escaloes?.includes(userEscalao)
      );
    });
    
    return eligibleUsers;
  };

  const handleOpenDialog = (treinoId?: string) => {
    if (treinoId) {
      setSelectedTreino(treinoId);
      const atletas = getAtletasForTreino(treinoId);
      const existingPresencas = (presencas || []).filter(p => p.treino_id === treinoId);
      
      const initialData: typeof presencaData = {};
      atletas.forEach(user => {
        const existing = existingPresencas.find(p => p.user_id === user.id);
        if (existing) {
          initialData[user.id] = {
            estado: existing.estado || '',
            hora_chegada: existing.volume_real_m?.toString(),
            observacoes: existing.observacoes_tecnicas,
          };
        } else {
          initialData[user.id] = { estado: '' as EstadoPresenca };
        }
      });
      
      setPresencaData(initialData);
    } else {
      setSelectedTreino('');
      setPresencaData({});
    }
    setDialogOpen(true);
  };

  const handleSavePresencas = () => {
    if (!selectedTreino) {
      toast.error('Selecione um treino');
      return;
    }

    const treino = treinos?.find(t => t.id === selectedTreino);
    if (!treino) return;

    const existingPresencas = (presencas || []).filter(p => p.treino_id === selectedTreino);
    const updatedPresencas = [...(presencas || []).filter(p => p.treino_id !== selectedTreino)];

    let atletasSemClassificacao = 0;
    let presentesCount = 0;
    let justificadosCount = 0;
    let ausentesCount = 0;

    Object.entries(presencaData).forEach(([userId, data]) => {
      if (!data.estado) {
        atletasSemClassificacao++;
        return;
      }
      
      if (data.estado === 'presente') {
        presentesCount++;
      } else if (data.estado === 'justificado') {
        justificadosCount++;
      } else if (data.estado === 'ausente') {
        ausentesCount++;
      }
      
      updatedPresencas.push({
        id: crypto.randomUUID(),
        treino_id: selectedTreino,
        user_id: userId,
        estado: data.estado as EstadoPresenca,
        presente: data.estado === 'presente',
        observacoes_tecnicas: data.observacoes,
        registado_por: 'admin',
        registado_em: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    });

    setPresencas(() => updatedPresencas);
    
    let message = `Presenças registadas: ${presentesCount} presentes`;
    if (ausentesCount > 0) {
      message += `, ${ausentesCount} ausentes`;
    }
    if (justificadosCount > 0) {
      message += `, ${justificadosCount} justificados`;
    }
    if (atletasSemClassificacao > 0) {
      message += ` | ${atletasSemClassificacao} atleta(s) sem classificação removidos da lista`;
    }
    
    toast.success(message);
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTreino('');
    setPresencaData({});
  };

  const updatePresenca = (userId: string, field: string, value: any) => {
    setPresencaData(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      }
    }));
  };

  const handleDeleteTreinoPresencas = (treinoId: string) => {
    const treino = treinos?.find(t => t.id === treinoId);
    const treinoPresencas = (presencas || []).filter(p => p.treino_id === treinoId);
    
    if (!treino) {
      toast.error('Treino não encontrado');
      return;
    }
    
    if (treinoPresencas.length === 0) {
      setHiddenEmptyTreinos(prev => [...prev, treinoId]);
      toast.success(`Registo de presença vazio do treino foi removido da visualização`);
      return;
    }
    
    if (window.confirm(`Tem a certeza que pretende apagar TODOS os ${treinoPresencas.length} registos de presença deste treino?\n\nEsta ação não pode ser revertida.`)) {
      const updatedPresencas = (presencas || []).filter(p => p.treino_id !== treinoId);
      setPresencas(() => updatedPresencas);
      toast.success(`Todos os registos de presença do treino foram apagados (${treinoPresencas.length} registos)`);
    }
  };

  const getPresencaStats = (treinoId: string) => {
    const treinoPresencas = (presencas || []).filter(p => p.treino_id === treinoId);
    const presentes = treinoPresencas.filter(p => p.estado === 'presente').length;
    const ausentes = treinoPresencas.filter(p => p.estado === 'ausente').length;
    const justificados = treinoPresencas.filter(p => p.estado === 'justificado').length;
    const total = treinoPresencas.length;
    
    return { presentes, ausentes, justificados, total };
  };

  const toggleCardExpansion = (treinoId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [treinoId]: !prev[treinoId]
    }));
  };

  const getEstadoBadge = (estado: EstadoPresenca) => {
    switch (estado) {
      case 'presente':
        return <Badge variant="default" className="bg-green-600 text-xs">Presente</Badge>;
      case 'ausente':
        return <Badge variant="destructive" className="text-xs">Ausente</Badge>;
      case 'justificado':
        return <Badge variant="secondary" className="bg-amber-500 text-white text-xs">Justificado</Badge>;
    }
  };

  const getEstadoIcon = (estado: EstadoPresenca) => {
    switch (estado) {
      case 'presente':
        return <CheckCircle size={16} className="text-green-600" weight="fill" />;
      case 'ausente':
        return <XCircle size={16} className="text-red-600" weight="fill" />;
      case 'justificado':
        return <Question size={16} className="text-amber-500" weight="fill" />;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredPresencas.length} de {presencas?.length || 0} registos de presença
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="h-8 text-xs">
              <Plus className="mr-1.5 sm:mr-2" size={16} />
              <span className="hidden sm:inline">Registar Presenças</span>
              <span className="sm:hidden">Registar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Registar Presenças</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="treino">Treino *</Label>
                  <Select 
                    value={selectedTreino} 
                    onValueChange={(value) => handleOpenDialog(value)}
                  >
                    <SelectTrigger id="treino">
                      <SelectValue placeholder="Selecionar treino..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTreinos.map(treino => {
                        const stats = getPresencaStats(treino.id);
                        return (
                          <SelectItem key={treino.id} value={treino.id}>
                            {format(new Date(treino.data), 'dd/MM/yyyy')} - {treino.hora_inicio || 'Sem hora'} ({treino.tipo_treino})
                            {stats.total > 0 && ` (${stats.presentes}/${stats.total})`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTreino && (() => {
                  const atletas = getAtletasForTreino(selectedTreino);
                  const atletasNaLista = atletas.filter(a => presencaData[a.id] !== undefined);
                  const atletasDisponiveis = (users || []).filter(u => 
                    u.tipo_membro.includes('atleta') && !presencaData[u.id]
                  );
                  
                  if (atletasNaLista.length === 0 && atletasDisponiveis.length === 0) {
                    return (
                      <Card className="p-4">
                        <p className="text-sm text-muted-foreground text-center">
                          Nenhum atleta disponível para este treino.
                        </p>
                      </Card>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Atletas na lista ({atletasNaLista.length})</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newData = { ...presencaData };
                              atletasNaLista.forEach(u => {
                                newData[u.id] = { ...newData[u.id], estado: 'presente' };
                              });
                              setPresencaData(newData);
                            }}
                            className="text-xs"
                          >
                            Todos Presentes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newData = { ...presencaData };
                              atletasNaLista.forEach(u => {
                                newData[u.id] = { ...newData[u.id], estado: 'ausente' };
                              });
                              setPresencaData(newData);
                            }}
                            className="text-xs"
                          >
                            Todos Ausentes
                          </Button>
                        </div>
                      </div>

                      {atletasDisponiveis.length > 0 && (
                        <div className="space-y-1 border-t pt-2">
                          <Label htmlFor="add-atleta" className="text-xs">Adicionar Atleta Manualmente</Label>
                          <Select
                            onValueChange={(userId) => {
                              if (userId) {
                                setPresencaData(prev => ({
                                  ...prev,
                                  [userId]: { estado: '' }
                                }));
                                toast.success('Atleta adicionado à lista');
                              }
                            }}
                          >
                            <SelectTrigger id="add-atleta" className="h-8 text-xs">
                              <SelectValue placeholder="Selecionar atleta..." />
                            </SelectTrigger>
                            <SelectContent>
                              {atletasDisponiveis.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.nome_completo} - {user.numero_socio}
                                  {user.escalao && user.escalao.length > 0 && ` (${getEscaloesNames(user.escalao, escaloes || [])})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        {atletasNaLista.map(user => {
                          const userData = presencaData[user.id] || { estado: '' as EstadoPresenca | '' };
                          
                          return (
                            <Card key={user.id} className="p-3">
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {user.nome_completo}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {user.numero_socio}
                                      {user.escalao && user.escalao.length > 0 && (
                                        <> • {getEscaloesNames(user.escalao, escaloes || [])}</>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={userData.estado || undefined}
                                      onValueChange={(value: EstadoPresenca | '') => 
                                        updatePresenca(user.id, 'estado', value)
                                      }
                                    >
                                      <SelectTrigger className="h-7 w-[130px] text-xs">
                                        <SelectValue placeholder="Classificar..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="presente">Presente</SelectItem>
                                        <SelectItem value="ausente">Ausente</SelectItem>
                                        <SelectItem value="justificado">Justificado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newData = { ...presencaData };
                                        delete newData[user.id];
                                        setPresencaData(newData);
                                        toast.success('Atleta removido da lista');
                                      }}
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash size={14} />
                                    </Button>
                                  </div>
                                </div>

                                {(userData.estado === 'justificado') && (
                                  <div className="grid grid-cols-1 gap-3 pl-0 border-t pt-3">
                                    <div className="space-y-1">
                                      <Label htmlFor={`obs-${user.id}`} className="text-xs">
                                        Justificação/Observações *
                                      </Label>
                                      <Textarea
                                        id={`obs-${user.id}`}
                                        value={userData.observacoes || ''}
                                        onChange={(e) => 
                                          updatePresenca(user.id, 'observacoes', e.target.value)
                                        }
                                        placeholder="Ex: Doença, consulta médica, motivo familiar..."
                                        rows={2}
                                        className="text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleSavePresencas} disabled={!selectedTreino}>
                <ClipboardText className="mr-2" size={16} />
                Guardar Presenças
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Pesquisar presenças..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 h-8 text-xs"
            />
          </div>
          <Select value={treinoFilter} onValueChange={setTreinoFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-8 text-xs">
              <SelectValue placeholder="Treino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Treinos</SelectItem>
              {activeTreinos.slice(0, 10).map(treino => (
                <SelectItem key={treino.id} value={treino.id}>
                  {format(new Date(treino.data), 'dd/MM/yyyy')} - {treino.tipo_treino}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={presenceFilter} onValueChange={setPresenceFilter}>
            <SelectTrigger className="w-full md:w-[160px] h-8 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="presente">Presentes</SelectItem>
              <SelectItem value="ausente">Ausentes</SelectItem>
              <SelectItem value="justificado">Justificados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid gap-2 sm:gap-3">
        {activeTreinos
          .filter(treino => {
            if (hiddenEmptyTreinos.includes(treino.id)) {
              return false;
            }
            const treinoPresencas = (presencas || []).filter(p => p.treino_id === treino.id);
            return treinoPresencas.length > 0 || true;
          })
          .map(treino => {
            const treinoPresencas = (presencas || []).filter(p => p.treino_id === treino.id);
            const stats = getPresencaStats(treino.id);
            const percentage = stats.total > 0 ? (stats.presentes / stats.total * 100).toFixed(0) : 0;
            const isExpanded = expandedCards[treino.id] ?? false;

            return (
              <Card key={treino.id} className="p-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">
                          {format(new Date(treino.data), 'dd/MM/yyyy')}
                          {treino.hora_inicio && ` - ${treino.hora_inicio}`}
                        </h3>
                        <Badge variant="outline" className="text-xs bg-green-50">
                          {treino.tipo_treino}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {treino.local && `📍 ${treino.local}`}
                        {treino.escaloes && treino.escaloes.length > 0 && ` • ${getEscaloesNomes(treino.escaloes)}`}
                      </p>
                      {treinoPresencas.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Registo vazio - Adicione atletas para registar presenças
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(treino.id)}
                        className="text-xs h-7 px-2 sm:px-3"
                      >
                        <ClipboardText className="sm:mr-1" size={14} />
                        <span className="hidden sm:inline">Registar</span>
                      </Button>
                      {stats.total > 0 && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleCardExpansion(treino.id)}
                            className="text-xs h-7 px-2"
                            title={isExpanded ? "Minimizar lista" : "Expandir lista"}
                          >
                            {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTreinoPresencas(treino.id)}
                            className="text-xs h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                            title="Apagar todos os registos de presença deste treino"
                          >
                            <Trash size={14} />
                          </Button>
                        </>
                      )}
                      {treinoPresencas.length === 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTreinoPresencas(treino.id)}
                          className="text-xs h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                          title="Remover registo de presença vazio da visualização"
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {stats.total > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Total: {stats.presentes} presentes de {stats.total} atletas ({percentage}%)
                        </span>
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <CheckCircle size={14} className="text-green-600" />
                            {stats.presentes}
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle size={14} className="text-red-600" />
                            {stats.ausentes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Question size={14} className="text-amber-500" />
                            {stats.justificados}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {treinoPresencas.length > 0 && isExpanded && (
                    <div className="border-t pt-2">
                      <ScrollArea className="max-h-[200px]">
                        <div className="space-y-1.5">
                          {treinoPresencas
                            .filter(p => 
                              presenceFilter === 'todos' ||
                              (presenceFilter === 'presente' && p.estado === 'presente') ||
                              (presenceFilter === 'ausente' && p.estado === 'ausente') ||
                              (presenceFilter === 'justificado' && p.estado === 'justificado')
                            )
                            .map(p => {
                              const user = users?.find(u => u.id === p.user_id);
                              if (!user) return null;

                              return (
                                <div key={p.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{user.nome_completo}</p>
                                    {p.observacoes_tecnicas && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {p.observacoes_tecnicas}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex-shrink-0">
                                    {p.estado && getEstadoIcon(p.estado)}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
      </div>

      {activeTreinos.length === 0 && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <ClipboardText className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhum treino criado</h3>
            <p className="text-muted-foreground text-xs">
              Crie treinos na tab Treinos para registar presenças.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
