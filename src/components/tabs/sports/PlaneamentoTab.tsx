import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Pencil, Trash } from '@phosphor-icons/react';
import type { Epoca, Macrociclo, TipoEpoca, EstadoEpoca, TipoPiscina, TipoMacrociclo } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function PlaneamentoTab() {
  const [epocas, setEpocas] = useKV<Epoca[]>('epocas', []);
  const [macrociclos, setMacrociclos] = useKV<Macrociclo[]>('macrociclos', []);
  const [escaloes] = useKV<any[]>('settings-age-groups', []);

  const [isEpocaDialogOpen, setIsEpocaDialogOpen] = useState(false);
  const [isMacrocicloDialogOpen, setIsMacrocicloDialogOpen] = useState(false);
  const [editingEpoca, setEditingEpoca] = useState<Epoca | null>(null);
  const [editingMacrociclo, setEditingMacrociclo] = useState<Macrociclo | null>(null);

  const [epocaForm, setEpocaForm] = useState<{
    nome: string;
    ano_temporada: string;
    data_inicio: string;
    data_fim: string;
    tipo: TipoEpoca;
    estado: EstadoEpoca;
    piscina_principal: TipoPiscina | '';
    escaloes_abrangidos: string[];
    descricao: string;
    volume_total_previsto: string;
    volume_medio_semanal: string;
    num_semanas_previsto: string;
    num_competicoes_previstas: string;
    objetivos_performance: string;
    objetivos_tecnicos: string;
  }>({
    nome: '',
    ano_temporada: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'principal',
    estado: 'planeada',
    piscina_principal: '',
    escaloes_abrangidos: [],
    descricao: '',
    volume_total_previsto: '',
    volume_medio_semanal: '',
    num_semanas_previsto: '',
    num_competicoes_previstas: '',
    objetivos_performance: '',
    objetivos_tecnicos: '',
  });

  const [macrocicloForm, setMacrocicloForm] = useState<{
    epoca_id: string;
    nome: string;
    tipo: TipoMacrociclo;
    data_inicio: string;
    data_fim: string;
    escalao: string;
  }>({
    epoca_id: '',
    nome: '',
    tipo: 'preparacao_geral',
    data_inicio: '',
    data_fim: '',
    escalao: '',
  });

  const handleSaveEpoca = async () => {
    if (!epocaForm.nome || !epocaForm.data_inicio || !epocaForm.data_fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingEpoca) {
      const updated: Epoca = {
        ...editingEpoca,
        nome: epocaForm.nome,
        ano_temporada: epocaForm.ano_temporada,
        data_inicio: epocaForm.data_inicio,
        data_fim: epocaForm.data_fim,
        tipo: epocaForm.tipo,
        estado: epocaForm.estado,
        piscina_principal: epocaForm.piscina_principal || undefined,
        escaloes_abrangidos: epocaForm.escaloes_abrangidos.length > 0 ? epocaForm.escaloes_abrangidos : undefined,
        descricao: epocaForm.descricao || undefined,
        volume_total_previsto: epocaForm.volume_total_previsto ? parseFloat(epocaForm.volume_total_previsto) : undefined,
        volume_medio_semanal: epocaForm.volume_medio_semanal ? parseFloat(epocaForm.volume_medio_semanal) : undefined,
        num_semanas_previsto: epocaForm.num_semanas_previsto ? parseInt(epocaForm.num_semanas_previsto) : undefined,
        num_competicoes_previstas: epocaForm.num_competicoes_previstas ? parseInt(epocaForm.num_competicoes_previstas) : undefined,
        objetivos_performance: epocaForm.objetivos_performance || undefined,
        objetivos_tecnicos: epocaForm.objetivos_tecnicos || undefined,
        updated_at: new Date().toISOString(),
      };

      await setEpocas((current = []) =>
        current.map(e => e.id === editingEpoca.id ? updated : e)
      );

      toast.success('Época atualizada com sucesso');
    } else {
      const newEpoca: Epoca = {
        id: crypto.randomUUID(),
        nome: epocaForm.nome,
        ano_temporada: epocaForm.ano_temporada,
        data_inicio: epocaForm.data_inicio,
        data_fim: epocaForm.data_fim,
        tipo: epocaForm.tipo,
        estado: epocaForm.estado,
        piscina_principal: epocaForm.piscina_principal || undefined,
        escaloes_abrangidos: epocaForm.escaloes_abrangidos.length > 0 ? epocaForm.escaloes_abrangidos : undefined,
        descricao: epocaForm.descricao || undefined,
        volume_total_previsto: epocaForm.volume_total_previsto ? parseFloat(epocaForm.volume_total_previsto) : undefined,
        volume_medio_semanal: epocaForm.volume_medio_semanal ? parseFloat(epocaForm.volume_medio_semanal) : undefined,
        num_semanas_previsto: epocaForm.num_semanas_previsto ? parseInt(epocaForm.num_semanas_previsto) : undefined,
        num_competicoes_previstas: epocaForm.num_competicoes_previstas ? parseInt(epocaForm.num_competicoes_previstas) : undefined,
        objetivos_performance: epocaForm.objetivos_performance || undefined,
        objetivos_tecnicos: epocaForm.objetivos_tecnicos || undefined,
        created_at: new Date().toISOString(),
      };

      await setEpocas((current = []) => [...current, newEpoca]);
      toast.success('Época criada com sucesso');
    }

    setIsEpocaDialogOpen(false);
    resetEpocaForm();
  };

  const handleSaveMacrociclo = async () => {
    if (!macrocicloForm.epoca_id || !macrocicloForm.nome || !macrocicloForm.data_inicio || !macrocicloForm.data_fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingMacrociclo) {
      const updated: Macrociclo = {
        ...editingMacrociclo,
        epoca_id: macrocicloForm.epoca_id,
        nome: macrocicloForm.nome,
        tipo: macrocicloForm.tipo,
        data_inicio: macrocicloForm.data_inicio,
        data_fim: macrocicloForm.data_fim,
        escalao: macrocicloForm.escalao || undefined,
        updated_at: new Date().toISOString(),
      };

      await setMacrociclos((current = []) =>
        current.map(m => m.id === editingMacrociclo.id ? updated : m)
      );

      toast.success('Macrociclo atualizado com sucesso');
    } else {
      const newMacrociclo: Macrociclo = {
        id: crypto.randomUUID(),
        epoca_id: macrocicloForm.epoca_id,
        nome: macrocicloForm.nome,
        tipo: macrocicloForm.tipo,
        data_inicio: macrocicloForm.data_inicio,
        data_fim: macrocicloForm.data_fim,
        escalao: macrocicloForm.escalao || undefined,
        created_at: new Date().toISOString(),
      };

      await setMacrociclos((current = []) => [...current, newMacrociclo]);
      toast.success('Macrociclo criado com sucesso');
    }

    setIsMacrocicloDialogOpen(false);
    resetMacrocicloForm();
  };

  const handleEditEpoca = (epoca: Epoca) => {
    setEditingEpoca(epoca);
    setEpocaForm({
      nome: epoca.nome,
      ano_temporada: epoca.ano_temporada,
      data_inicio: epoca.data_inicio,
      data_fim: epoca.data_fim,
      tipo: epoca.tipo,
      estado: epoca.estado,
      piscina_principal: epoca.piscina_principal || '',
      escaloes_abrangidos: epoca.escaloes_abrangidos || [],
      descricao: epoca.descricao || '',
      volume_total_previsto: epoca.volume_total_previsto?.toString() || '',
      volume_medio_semanal: epoca.volume_medio_semanal?.toString() || '',
      num_semanas_previsto: epoca.num_semanas_previsto?.toString() || '',
      num_competicoes_previstas: epoca.num_competicoes_previstas?.toString() || '',
      objetivos_performance: epoca.objetivos_performance || '',
      objetivos_tecnicos: epoca.objetivos_tecnicos || '',
    });
    setIsEpocaDialogOpen(true);
  };

  const handleEditMacrociclo = (macrociclo: Macrociclo) => {
    setEditingMacrociclo(macrociclo);
    setMacrocicloForm({
      epoca_id: macrociclo.epoca_id,
      nome: macrociclo.nome,
      tipo: macrociclo.tipo,
      data_inicio: macrociclo.data_inicio,
      data_fim: macrociclo.data_fim,
      escalao: macrociclo.escalao || '',
    });
    setIsMacrocicloDialogOpen(true);
  };

  const handleDeleteEpoca = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta época?')) return;

    await setEpocas((current = []) => current.filter(e => e.id !== id));
    await setMacrociclos((current = []) => current.filter(m => m.epoca_id !== id));
    toast.success('Época eliminada com sucesso');
  };

  const handleDeleteMacrociclo = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este macrociclo?')) return;

    await setMacrociclos((current = []) => current.filter(m => m.id !== id));
    toast.success('Macrociclo eliminado com sucesso');
  };

  const resetEpocaForm = () => {
    setEpocaForm({
      nome: '',
      ano_temporada: '',
      data_inicio: '',
      data_fim: '',
      tipo: 'principal',
      estado: 'planeada',
      piscina_principal: '',
      escaloes_abrangidos: [],
      descricao: '',
      volume_total_previsto: '',
      volume_medio_semanal: '',
      num_semanas_previsto: '',
      num_competicoes_previstas: '',
      objetivos_performance: '',
      objetivos_tecnicos: '',
    });
    setEditingEpoca(null);
  };

  const resetMacrocicloForm = () => {
    setMacrocicloForm({
      epoca_id: '',
      nome: '',
      tipo: 'preparacao_geral',
      data_inicio: '',
      data_fim: '',
      escalao: '',
    });
    setEditingMacrociclo(null);
  };

  const getEstadoBadge = (estado: EstadoEpoca) => {
    const colors = {
      planeada: 'bg-gray-100 text-gray-700',
      em_curso: 'bg-blue-100 text-blue-700',
      concluida: 'bg-green-100 text-green-700',
      arquivada: 'bg-slate-100 text-slate-500',
    };
    return colors[estado] || colors.planeada;
  };

  const getTipoLabel = (tipo: TipoEpoca) => {
    const labels: Record<TipoEpoca, string> = {
      principal: 'Principal',
      secundaria: 'Secundária',
      verao: 'Época de Verão',
      preparacao: 'Preparação',
      pre_epoca: 'Pré-Época',
    };
    return labels[tipo];
  };

  const getTipoMacrocicloLabel = (tipo: TipoMacrociclo) => {
    const labels: Record<TipoMacrociclo, string> = {
      preparacao_geral: 'Preparação Geral',
      preparacao_especifica: 'Preparação Específica',
      competicao: 'Competição',
      taper: 'Taper',
      transicao: 'Transição',
    };
    return labels[tipo];
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Épocas Desportivas</h3>
          <Dialog open={isEpocaDialogOpen} onOpenChange={(open) => {
            setIsEpocaDialogOpen(open);
            if (!open) resetEpocaForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus size={16} className="mr-1" />
                Nova Época
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEpoca ? 'Editar Época' : 'Nova Época'}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="nome">Nome da Época *</Label>
                    <Input
                      id="nome"
                      value={epocaForm.nome}
                      onChange={(e) => setEpocaForm({ ...epocaForm, nome: e.target.value })}
                      placeholder="Ex.: Época 2025/2026"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="ano_temporada">Ano / Temporada *</Label>
                    <Input
                      id="ano_temporada"
                      value={epocaForm.ano_temporada}
                      onChange={(e) => setEpocaForm({ ...epocaForm, ano_temporada: e.target.value })}
                      placeholder="Ex.: 2025/2026"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_inicio">Data de Início *</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={epocaForm.data_inicio}
                      onChange={(e) => setEpocaForm({ ...epocaForm, data_inicio: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_fim">Data de Fim *</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={epocaForm.data_fim}
                      onChange={(e) => setEpocaForm({ ...epocaForm, data_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Época *</Label>
                    <Select
                      value={epocaForm.tipo}
                      onValueChange={(value) => setEpocaForm({ ...epocaForm, tipo: value as TipoEpoca })}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="secundaria">Secundária</SelectItem>
                        <SelectItem value="verao">Época de Verão</SelectItem>
                        <SelectItem value="preparacao">Preparação</SelectItem>
                        <SelectItem value="pre_epoca">Pré-Época</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                      value={epocaForm.estado}
                      onValueChange={(value) => setEpocaForm({ ...epocaForm, estado: value as EstadoEpoca })}
                    >
                      <SelectTrigger id="estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planeada">Planeada</SelectItem>
                        <SelectItem value="em_curso">Em Curso</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="arquivada">Arquivada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="piscina_principal">Piscina / Contexto Principal</Label>
                  <Select
                    value={epocaForm.piscina_principal}
                    onValueChange={(value) => setEpocaForm({ ...epocaForm, piscina_principal: value as TipoPiscina })}
                  >
                    <SelectTrigger id="piscina_principal">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piscina_25m">Piscina 25m</SelectItem>
                      <SelectItem value="piscina_50m">Piscina 50m</SelectItem>
                      <SelectItem value="aguas_abertas">Águas Abertas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição / Notas da Época</Label>
                  <Textarea
                    id="descricao"
                    value={epocaForm.descricao}
                    onChange={(e) => setEpocaForm({ ...epocaForm, descricao: e.target.value })}
                    placeholder="Enquadramento geral da época..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Metas da Época (KPI Desportivos)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="volume_total_previsto">Volume Total Previsto (km)</Label>
                      <Input
                        id="volume_total_previsto"
                        type="number"
                        value={epocaForm.volume_total_previsto}
                        onChange={(e) => setEpocaForm({ ...epocaForm, volume_total_previsto: e.target.value })}
                        placeholder="Ex.: 500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="volume_medio_semanal">Volume Médio Semanal (km/semana)</Label>
                      <Input
                        id="volume_medio_semanal"
                        type="number"
                        value={epocaForm.volume_medio_semanal}
                        onChange={(e) => setEpocaForm({ ...epocaForm, volume_medio_semanal: e.target.value })}
                        placeholder="Ex.: 15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="num_semanas_previsto">Número de Semanas</Label>
                      <Input
                        id="num_semanas_previsto"
                        type="number"
                        value={epocaForm.num_semanas_previsto}
                        onChange={(e) => setEpocaForm({ ...epocaForm, num_semanas_previsto: e.target.value })}
                        placeholder="Ex.: 40"
                      />
                    </div>

                    <div>
                      <Label htmlFor="num_competicoes_previstas">Número de Competições</Label>
                      <Input
                        id="num_competicoes_previstas"
                        type="number"
                        value={epocaForm.num_competicoes_previstas}
                        onChange={(e) => setEpocaForm({ ...epocaForm, num_competicoes_previstas: e.target.value })}
                        placeholder="Ex.: 10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="objetivos_performance">Objetivos Gerais de Performance</Label>
                    <Textarea
                      id="objetivos_performance"
                      value={epocaForm.objetivos_performance}
                      onChange={(e) => setEpocaForm({ ...epocaForm, objetivos_performance: e.target.value })}
                      placeholder="Ex.: Melhorar tempos em 3-5%"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="objetivos_tecnicos">Objetivos Técnicos Globais</Label>
                    <Textarea
                      id="objetivos_tecnicos"
                      value={epocaForm.objetivos_tecnicos}
                      onChange={(e) => setEpocaForm({ ...epocaForm, objetivos_tecnicos: e.target.value })}
                      placeholder="Ex.: Melhorar viragens, eficiência a alta velocidade"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsEpocaDialogOpen(false);
                  resetEpocaForm();
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEpoca}>
                  {editingEpoca ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {(epocas || []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhuma época criada</p>
            <p className="text-xs mt-1">Comece por criar uma época desportiva</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Temporada</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs">Período</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(epocas || []).map((epoca) => (
                  <TableRow key={epoca.id}>
                    <TableCell className="text-xs font-medium">{epoca.nome}</TableCell>
                    <TableCell className="text-xs">{epoca.ano_temporada}</TableCell>
                    <TableCell className="text-xs">{getTipoLabel(epoca.tipo)}</TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(epoca.data_inicio), 'dd/MM/yy')} - {format(new Date(epoca.data_fim), 'dd/MM/yy')}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge className={`text-xs ${getEstadoBadge(epoca.estado)}`}>
                        {epoca.estado.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditEpoca(epoca)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEpoca(epoca.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Macrociclos</h3>
          <Dialog open={isMacrocicloDialogOpen} onOpenChange={(open) => {
            setIsMacrocicloDialogOpen(open);
            if (!open) resetMacrocicloForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={(epocas || []).length === 0}>
                <Plus size={16} className="mr-1" />
                Novo Macrociclo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingMacrociclo ? 'Editar Macrociclo' : 'Novo Macrociclo'}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="macro_epoca">Época *</Label>
                  <Select
                    value={macrocicloForm.epoca_id}
                    onValueChange={(value) => setMacrocicloForm({ ...macrocicloForm, epoca_id: value })}
                  >
                    <SelectTrigger id="macro_epoca">
                      <SelectValue placeholder="Selecione uma época..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(epocas || []).map((epoca) => (
                        <SelectItem key={epoca.id} value={epoca.id}>
                          {epoca.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="macro_nome">Nome *</Label>
                  <Input
                    id="macro_nome"
                    value={macrocicloForm.nome}
                    onChange={(e) => setMacrocicloForm({ ...macrocicloForm, nome: e.target.value })}
                    placeholder="Ex.: Macrociclo 1"
                  />
                </div>

                <div>
                  <Label htmlFor="macro_tipo">Tipo *</Label>
                  <Select
                    value={macrocicloForm.tipo}
                    onValueChange={(value) => setMacrocicloForm({ ...macrocicloForm, tipo: value as TipoMacrociclo })}
                  >
                    <SelectTrigger id="macro_tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparacao_geral">Preparação Geral</SelectItem>
                      <SelectItem value="preparacao_especifica">Preparação Específica</SelectItem>
                      <SelectItem value="competicao">Competição</SelectItem>
                      <SelectItem value="taper">Taper</SelectItem>
                      <SelectItem value="transicao">Transição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="macro_data_inicio">Data de Início *</Label>
                    <Input
                      id="macro_data_inicio"
                      type="date"
                      value={macrocicloForm.data_inicio}
                      onChange={(e) => setMacrocicloForm({ ...macrocicloForm, data_inicio: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="macro_data_fim">Data de Fim *</Label>
                    <Input
                      id="macro_data_fim"
                      type="date"
                      value={macrocicloForm.data_fim}
                      onChange={(e) => setMacrocicloForm({ ...macrocicloForm, data_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="macro_escalao">Escalão</Label>
                  <Select
                    value={macrocicloForm.escalao}
                    onValueChange={(value) => setMacrocicloForm({ ...macrocicloForm, escalao: value })}
                  >
                    <SelectTrigger id="macro_escalao">
                      <SelectValue placeholder="Selecione um escalão..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(escaloes || []).map((escalao) => (
                        <SelectItem key={escalao.id} value={escalao.id}>
                          {escalao.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsMacrocicloDialogOpen(false);
                  resetMacrocicloForm();
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveMacrociclo}>
                  {editingMacrociclo ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {(macrociclos || []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-xs">Nenhum macrociclo criado</p>
            <p className="text-xs mt-1">Crie uma época primeiro e depois adicione macrociclos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Época</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs">Período</TableHead>
                  <TableHead className="text-xs">Escalão</TableHead>
                  <TableHead className="text-xs w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(macrociclos || []).map((macro) => {
                  const epoca = (epocas || []).find(e => e.id === macro.epoca_id);
                  const escalao = (escaloes || []).find(e => e.id === macro.escalao);
                  
                  return (
                    <TableRow key={macro.id}>
                      <TableCell className="text-xs font-medium">{macro.nome}</TableCell>
                      <TableCell className="text-xs">{epoca?.nome || '-'}</TableCell>
                      <TableCell className="text-xs">{getTipoMacrocicloLabel(macro.tipo)}</TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(macro.data_inicio), 'dd/MM/yy')} - {format(new Date(macro.data_fim), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell className="text-xs">{escalao?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditMacrociclo(macro)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMacrociclo(macro.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
