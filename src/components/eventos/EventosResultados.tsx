import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Event, User, EventoResultado } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MagnifyingGlass, Trophy, Trash, Pencil } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export function EventosResultados() {
  const [events] = useKV<Event[]>('club-events', []);
  const [resultados, setResultados] = useKV<EventoResultado[]>('club-resultados', []);
  const [users] = useKV<User[]>('club-users', []);
  const [ageGroups] = useKV<AgeGroup[]>('settings-age-groups', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResultado, setEditingResultado] = useState<EventoResultado | null>(null);

  const [formData, setFormData] = useState({
    evento_id: '',
    user_id: '',
    prova: '',
    tempo: '',
    classificacao: '',
    piscina: '',
    escalao: '',
    observacoes: '',
    epoca: new Date().getFullYear().toString(),
  });

  const availableEvents = useMemo(() => {
    return (events || []).filter(e => 
      e.estado !== 'rascunho' && e.estado !== 'cancelado'
    ).sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
  }, [events]);

  const atletasAtivos = useMemo(() => {
    return (users || []).filter(u => 
      u.tipo_membro.includes('atleta') && 
      u.estado === 'ativo'
    ).sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
  }, [users]);

  const filteredResultados = useMemo(() => {
    return (resultados || []).filter(res => {
      const user = users?.find(u => u.id === res.user_id);
      const event = events?.find(e => e.id === res.evento_id);
      
      const matchesSearch = 
        user?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.prova.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = eventFilter === 'todos' || res.evento_id === eventFilter;
      
      return matchesSearch && matchesEvent;
    }).sort((a, b) => new Date(b.registado_em).getTime() - new Date(a.registado_em).getTime());
  }, [resultados, users, events, searchTerm, eventFilter]);

  const handleCreate = () => {
    if (!formData.evento_id || !formData.user_id || !formData.prova.trim()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newResultado: EventoResultado = {
      id: crypto.randomUUID(),
      evento_id: formData.evento_id,
      user_id: formData.user_id,
      prova: formData.prova,
      tempo: formData.tempo || undefined,
      classificacao: formData.classificacao ? parseInt(formData.classificacao) : undefined,
      piscina: formData.piscina !== 'no-piscina' ? formData.piscina : undefined,
      escalao: formData.escalao !== 'no-escalao' ? formData.escalao : undefined,
      observacoes: formData.observacoes || undefined,
      epoca: formData.epoca,
      registado_por: 'admin',
      registado_em: new Date().toISOString(),
    };

    setResultados(current => [...(current || []), newResultado]);
    toast.success('Resultado registado com sucesso!');
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingResultado) return;

    setResultados(current =>
      (current || []).map(r =>
        r.id === editingResultado.id
          ? {
              ...r,
              prova: formData.prova,
              tempo: formData.tempo || undefined,
              classificacao: formData.classificacao ? parseInt(formData.classificacao) : undefined,
              piscina: formData.piscina !== 'no-piscina' ? formData.piscina : undefined,
              escalao: formData.escalao !== 'no-escalao' ? formData.escalao : undefined,
              observacoes: formData.observacoes || undefined,
              epoca: formData.epoca,
            }
          : r
      )
    );
    toast.success('Resultado atualizado!');
    setEditingResultado(null);
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (resultadoId: string) => {
    if (confirm('Tem certeza que deseja eliminar este resultado?')) {
      setResultados(current => (current || []).filter(r => r.id !== resultadoId));
      toast.success('Resultado eliminado!');
    }
  };

  const resetForm = () => {
    setFormData({
      evento_id: '',
      user_id: '',
      prova: '',
      tempo: '',
      classificacao: '',
      piscina: 'no-piscina',
      escalao: 'no-escalao',
      observacoes: '',
      epoca: new Date().getFullYear().toString(),
    });
  };

  const openEditDialog = (resultado: EventoResultado) => {
    setEditingResultado(resultado);
    setFormData({
      evento_id: resultado.evento_id,
      user_id: resultado.user_id,
      prova: resultado.prova,
      tempo: resultado.tempo || '',
      classificacao: resultado.classificacao?.toString() || '',
      piscina: resultado.piscina || 'no-piscina',
      escalao: resultado.escalao || 'no-escalao',
      observacoes: resultado.observacoes || '',
      epoca: resultado.epoca || new Date().getFullYear().toString(),
    });
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredResultados.length} de {resultados?.length || 0} resultados
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingResultado(null); }} className="h-8 text-xs">
              <Plus className="mr-1.5 sm:mr-2" size={16} />
              <span className="hidden sm:inline">Novo Resultado</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingResultado ? 'Editar Resultado' : 'Novo Resultado'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="evento">Evento *</Label>
                    <Select
                      value={formData.evento_id}
                      onValueChange={(value) => setFormData({ ...formData, evento_id: value })}
                      disabled={!!editingResultado}
                    >
                      <SelectTrigger id="evento">
                        <SelectValue placeholder="Selecionar evento..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEvents
                          .filter(event => event.id && event.id.trim() !== '')
                          .map(event => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.titulo} - {format(new Date(event.data_inicio), 'PPP', { locale: pt })}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="atleta">Atleta *</Label>
                    <Select
                      value={formData.user_id}
                      onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                      disabled={!!editingResultado}
                    >
                      <SelectTrigger id="atleta">
                        <SelectValue placeholder="Selecionar atleta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {atletasAtivos
                          .filter(user => user.id && user.id.trim() !== '')
                          .map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nome_completo} ({user.numero_socio})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="prova">Prova *</Label>
                    <Input
                      id="prova"
                      value={formData.prova}
                      onChange={(e) => setFormData({ ...formData, prova: e.target.value })}
                      placeholder="Ex: 100m Livres, 200m Costas"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempo">Tempo</Label>
                    <Input
                      id="tempo"
                      value={formData.tempo}
                      onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                      placeholder="Ex: 01:23.45"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classificacao">Classificação</Label>
                    <Input
                      id="classificacao"
                      type="number"
                      value={formData.classificacao}
                      onChange={(e) => setFormData({ ...formData, classificacao: e.target.value })}
                      placeholder="Ex: 1, 2, 3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="piscina">Piscina</Label>
                    <Select
                      value={formData.piscina}
                      onValueChange={(value) => setFormData({ ...formData, piscina: value })}
                    >
                      <SelectTrigger id="piscina">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-piscina">Nenhuma</SelectItem>
                        <SelectItem value="25m">25m</SelectItem>
                        <SelectItem value="50m">50m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalao">Escalão</Label>
                    <Select
                      value={formData.escalao}
                      onValueChange={(value) => setFormData({ ...formData, escalao: value })}
                    >
                      <SelectTrigger id="escalao">
                        <SelectValue placeholder="Selecionar escalão..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-escalao">Nenhum</SelectItem>
                        {(ageGroups || [])
                          .filter(escalao => escalao.name && escalao.name.trim() !== '')
                          .map(escalao => (
                            <SelectItem key={escalao.id} value={escalao.name}>
                              {escalao.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="epoca">Época</Label>
                    <Input
                      id="epoca"
                      value={formData.epoca}
                      onChange={(e) => setFormData({ ...formData, epoca: e.target.value })}
                      placeholder="Ex: 2024/2025"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Notas adicionais sobre o resultado"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); setEditingResultado(null); }}>
                Cancelar
              </Button>
              <Button onClick={editingResultado ? handleUpdate : handleCreate}>
                {editingResultado ? 'Atualizar' : 'Registar'}
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
              placeholder="Pesquisar resultados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 h-8 text-xs"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-8 text-xs">
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Eventos</SelectItem>
              {availableEvents
                .filter(event => event.id && event.id.trim() !== '')
                .map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.titulo}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="space-y-2">
        {filteredResultados.map(resultado => {
          const user = users?.find(u => u.id === resultado.user_id);
          const event = events?.find(e => e.id === resultado.evento_id);
          
          if (!user || !event) return null;

          return (
            <Card key={resultado.id} className="p-2.5 sm:p-3">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Trophy className="text-primary mt-0.5 flex-shrink-0" size={18} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{user.nome_completo}</h3>
                      <p className="text-xs text-muted-foreground">{event.titulo}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className="text-xs">
                      {resultado.prova}
                    </Badge>
                    {resultado.tempo && (
                      <Badge variant="secondary" className="text-xs">
                        {resultado.tempo}
                      </Badge>
                    )}
                    {resultado.classificacao && (
                      <Badge className="text-xs">
                        {resultado.classificacao}º lugar
                      </Badge>
                    )}
                    {resultado.piscina && (
                      <Badge variant="outline" className="text-xs">
                        {resultado.piscina}
                      </Badge>
                    )}
                  </div>

                  {resultado.observacoes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {resultado.observacoes}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Época: {resultado.epoca} • Registado: {format(new Date(resultado.registado_em), 'PPP', { locale: pt })}
                  </p>
                </div>

                <div className="flex gap-1.5 sm:flex-col">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(resultado)}
                    className="text-xs h-7"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(resultado.id)}
                    className="text-xs h-7"
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredResultados.length === 0 && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <Trophy className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground text-xs">
              Registe os resultados dos atletas nos eventos.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
