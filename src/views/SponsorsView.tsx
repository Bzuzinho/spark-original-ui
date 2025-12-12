import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Sponsor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Handshake } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

export function SponsorsView() {
  const [sponsors, setSponsors] = useKV<Sponsor[]>('club-sponsors', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'secundario' as Sponsor['tipo'],
    contrato_inicio: format(new Date(), 'yyyy-MM-dd'),
    contrato_fim: '',
    valor_anual: 0,
    contacto_nome: '',
    contacto_email: '',
    contacto_telefone: '',
    ativo: true,
  });

  const handleCreate = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const newSponsor: Sponsor = {
      id: crypto.randomUUID(),
      ...formData,
      valor_anual: formData.valor_anual || undefined,
      contrato_fim: formData.contrato_fim || undefined,
      contacto_nome: formData.contacto_nome || undefined,
      contacto_email: formData.contacto_email || undefined,
      contacto_telefone: formData.contacto_telefone || undefined,
    };

    setSponsors(current => [...(current || []), newSponsor]);
    toast.success('Patrocinador adicionado!');
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'secundario',
      contrato_inicio: format(new Date(), 'yyyy-MM-dd'),
      contrato_fim: '',
      valor_anual: 0,
      contacto_nome: '',
      contacto_email: '',
      contacto_telefone: '',
      ativo: true,
    });
  };

  const getTipoColor = (tipo: Sponsor['tipo']) => {
    switch (tipo) {
      case 'principal': return 'bg-purple-100 text-purple-800';
      case 'secundario': return 'bg-blue-100 text-blue-800';
      case 'apoio': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Patrocínios</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {sponsors?.length || 0} patrocinadores
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-8 text-xs">
              <Plus className="mr-1.5 sm:mr-2" size={16} />
              <span className="hidden sm:inline">Novo Patrocinador</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Patrocinador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do patrocinador"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value as Sponsor['tipo'] })}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="secundario">Secundário</SelectItem>
                    <SelectItem value="apoio">Apoio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início do Contrato *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {format(new Date(formData.contrato_inicio), 'PPP', { locale: pt })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.contrato_inicio)}
                        onSelect={(date) => setFormData({ ...formData, contrato_inicio: date ? format(date, 'yyyy-MM-dd') : '' })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Fim do Contrato</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {formData.contrato_fim 
                          ? format(new Date(formData.contrato_fim), 'PPP', { locale: pt })
                          : 'Sem data definida'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.contrato_fim ? new Date(formData.contrato_fim) : undefined}
                        onSelect={(date) => setFormData({ ...formData, contrato_fim: date ? format(date, 'yyyy-MM-dd') : '' })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_anual">Valor Anual (€)</Label>
                <Input
                  id="valor_anual"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor_anual}
                  onChange={(e) => setFormData({ ...formData, valor_anual: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Dados de Contacto</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contacto_nome">Nome do Contacto</Label>
                    <Input
                      id="contacto_nome"
                      value={formData.contacto_nome}
                      onChange={(e) => setFormData({ ...formData, contacto_nome: e.target.value })}
                      placeholder="Nome"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contacto_email">Email</Label>
                    <Input
                      id="contacto_email"
                      type="email"
                      value={formData.contacto_email}
                      onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contacto_telefone">Telefone</Label>
                    <Input
                      id="contacto_telefone"
                      value={formData.contacto_telefone}
                      onChange={(e) => setFormData({ ...formData, contacto_telefone: e.target.value })}
                      placeholder="+351 000 000 000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="ativo">Patrocinador Ativo</Label>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>
                  Adicionar Patrocinador
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {(sponsors || []).map(sponsor => (
          <Card key={sponsor.id} className="p-2.5 sm:p-3 transition-all hover:shadow-md">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2 flex-1">{sponsor.nome}</h3>
                <Badge className={`${getTipoColor(sponsor.tipo)} text-xs flex-shrink-0`}>
                  {sponsor.tipo}
                </Badge>
              </div>

              {sponsor.valor_anual && (
                <div className="text-lg sm:text-xl font-bold text-primary">
                  €{sponsor.valor_anual.toFixed(2)}/ano
                </div>
              )}

              <div className="space-y-0.5 text-xs text-muted-foreground">
                <p className="truncate">Início: {format(new Date(sponsor.contrato_inicio), 'PPP', { locale: pt })}</p>
                {sponsor.contrato_fim && (
                  <p className="truncate">Fim: {format(new Date(sponsor.contrato_fim), 'PPP', { locale: pt })}</p>
                )}
              </div>

              {(sponsor.contacto_nome || sponsor.contacto_email || sponsor.contacto_telefone) && (
                <div className="border-t pt-1.5 space-y-0.5 text-xs">
                  {sponsor.contacto_nome && <p className="font-medium truncate">{sponsor.contacto_nome}</p>}
                  {sponsor.contacto_email && <p className="text-muted-foreground truncate">{sponsor.contacto_email}</p>}
                  {sponsor.contacto_telefone && <p className="text-muted-foreground truncate">{sponsor.contacto_telefone}</p>}
                </div>
              )}

              <Badge variant={sponsor.ativo ? 'default' : 'secondary'} className="text-xs">
                {sponsor.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {(!sponsors || sponsors.length === 0) && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <Handshake className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhum patrocinador registado</h3>
            <p className="text-muted-foreground text-xs">
              Adicione os seus patrocinadores e gerencie os contratos.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
