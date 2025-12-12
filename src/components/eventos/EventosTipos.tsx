import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { EventoTipoConfig, EventoVisibilidade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash, Tag } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconOptions = [
  { value: 'flag', label: 'Bandeira' },
  { value: 'trophy', label: 'Troféu' },
  { value: 'users', label: 'Pessoas' },
  { value: 'calendar', label: 'Calendário' },
  { value: 'target', label: 'Alvo' },
  { value: 'lightning', label: 'Relâmpago' },
  { value: 'star', label: 'Estrela' },
  { value: 'heart', label: 'Coração' },
];

export function EventosTipos() {
  const [tiposEvento, setTiposEvento] = useKV<EventoTipoConfig[]>('club-eventos-tipos', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<EventoTipoConfig | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    cor: '#3b82f6',
    icon: 'flag',
    gera_taxa: false,
    requer_convocatoria: true,
    requer_transporte: false,
    visibilidade_default: 'restrito' as EventoVisibilidade,
  });

  const activeTipos = useMemo(() => {
    return (tiposEvento || []).filter(t => t.ativo);
  }, [tiposEvento]);

  const handleCreate = () => {
    if (!formData.nome.trim()) {
      toast.error('Preencha o nome do tipo de evento');
      return;
    }

    const newTipo: EventoTipoConfig = {
      id: crypto.randomUUID(),
      nome: formData.nome,
      cor: formData.cor,
      icon: formData.icon,
      ativo: true,
      gera_taxa: formData.gera_taxa,
      requer_convocatoria: formData.requer_convocatoria,
      requer_transporte: formData.requer_transporte,
      visibilidade_default: formData.visibilidade_default,
      created_at: new Date().toISOString(),
    };

    setTiposEvento(current => [...(current || []), newTipo]);
    toast.success('Tipo de evento criado com sucesso!');
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingTipo) return;

    setTiposEvento(current =>
      (current || []).map(t =>
        t.id === editingTipo.id
          ? {
              ...t,
              nome: formData.nome,
              cor: formData.cor,
              icon: formData.icon,
              gera_taxa: formData.gera_taxa,
              requer_convocatoria: formData.requer_convocatoria,
              requer_transporte: formData.requer_transporte,
              visibilidade_default: formData.visibilidade_default,
            }
          : t
      )
    );
    toast.success('Tipo de evento atualizado!');
    setEditingTipo(null);
    setDialogOpen(false);
    resetForm();
  };

  const handleToggleStatus = (tipoId: string, ativo: boolean) => {
    setTiposEvento(current =>
      (current || []).map(t =>
        t.id === tipoId ? { ...t, ativo } : t
      )
    );
    toast.success(ativo ? 'Tipo ativado' : 'Tipo desativado');
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cor: '#3b82f6',
      icon: 'flag',
      gera_taxa: false,
      requer_convocatoria: true,
      requer_transporte: false,
      visibilidade_default: 'restrito',
    });
  };

  const openEditDialog = (tipo: EventoTipoConfig) => {
    setEditingTipo(tipo);
    setFormData({
      nome: tipo.nome,
      cor: tipo.cor,
      icon: tipo.icon,
      gera_taxa: tipo.gera_taxa,
      requer_convocatoria: tipo.requer_convocatoria,
      requer_transporte: tipo.requer_transporte,
      visibilidade_default: tipo.visibilidade_default,
    });
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {activeTipos.length} tipo(s) de evento ativo(s)
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingTipo(null); }} className="h-8 text-xs">
              <Plus className="mr-1.5 sm:mr-2" size={16} />
              <span className="hidden sm:inline">Novo Tipo</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingTipo ? 'Editar Tipo de Evento' : 'Novo Tipo de Evento'}</DialogTitle>
              <DialogDescription>
                {editingTipo ? 'Altere as configurações do tipo de evento' : 'Configure um novo tipo de evento para categorizar os seus eventos'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Prova, Reunião, Treino Especial"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cor">Cor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cor"
                        type="color"
                        value={formData.cor}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.cor}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Ícone</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                      <SelectTrigger id="icon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibilidade">Visibilidade Padrão</Label>
                  <Select
                    value={formData.visibilidade_default}
                    onValueChange={(value) => setFormData({ ...formData, visibilidade_default: value as EventoVisibilidade })}
                  >
                    <SelectTrigger id="visibilidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="privado">Privado</SelectItem>
                      <SelectItem value="restrito">Restrito</SelectItem>
                      <SelectItem value="publico">Público</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-semibold">Configurações</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gera_taxa"
                      checked={formData.gera_taxa}
                      onCheckedChange={(checked) => setFormData({ ...formData, gera_taxa: !!checked })}
                    />
                    <label htmlFor="gera_taxa" className="text-sm cursor-pointer">
                      Gera taxa / inscrição
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requer_convocatoria"
                      checked={formData.requer_convocatoria}
                      onCheckedChange={(checked) => setFormData({ ...formData, requer_convocatoria: !!checked })}
                    />
                    <label htmlFor="requer_convocatoria" className="text-sm cursor-pointer">
                      Requer convocatória
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requer_transporte"
                      checked={formData.requer_transporte}
                      onCheckedChange={(checked) => setFormData({ ...formData, requer_transporte: !!checked })}
                    />
                    <label htmlFor="requer_transporte" className="text-sm cursor-pointer">
                      Requer transporte
                    </label>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); setEditingTipo(null); }}>
                Cancelar
              </Button>
              <Button onClick={editingTipo ? handleUpdate : handleCreate}>
                {editingTipo ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {(tiposEvento || []).map(tipo => (
          <Card
            key={tipo.id}
            className={`p-3 transition-all ${tipo.ativo ? 'hover:shadow-md hover:border-primary/50' : 'opacity-60'}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tipo.cor }}
                  />
                  <h3 className="font-semibold text-sm">{tipo.nome}</h3>
                </div>
                <Badge variant={tipo.ativo ? 'default' : 'secondary'} className="text-xs">
                  {tipo.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tipo.gera_taxa && (
                  <Badge variant="outline" className="text-xs">
                    Gera Taxa
                  </Badge>
                )}
                {tipo.requer_convocatoria && (
                  <Badge variant="outline" className="text-xs">
                    Convocatória
                  </Badge>
                )}
                {tipo.requer_transporte && (
                  <Badge variant="outline" className="text-xs">
                    Transporte
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {tipo.visibilidade_default}
                </Badge>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(tipo)}
                  className="text-xs h-7 flex-1"
                >
                  <Pencil className="mr-1" size={14} />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant={tipo.ativo ? 'outline' : 'default'}
                  onClick={() => handleToggleStatus(tipo.id, !tipo.ativo)}
                  className="text-xs h-7"
                >
                  {tipo.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(tiposEvento || []).length === 0 && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <Tag className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhum tipo de evento configurado</h3>
            <p className="text-muted-foreground text-xs">
              Crie tipos de evento para categorizar os seus eventos.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
