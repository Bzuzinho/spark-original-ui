import { useState, useMemo } from 'react';
import { Movimento, MovimentoItem, User, CentroCusto, Product, LancamentoFinanceiro, Fatura } from './types';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Plus, X, Check, Trash, PencilSimple } from '@phosphor-icons/react';
import { format, addMonths, isBefore } from 'date-fns';
import { toast } from 'sonner';

interface MovimentosTabProps {
  movimentos: Movimento[];
  setMovimentos: React.Dispatch<React.SetStateAction<Movimento[]>>;
  movimentoItens: MovimentoItem[];
  setMovimentoItens: React.Dispatch<React.SetStateAction<MovimentoItem[]>>;
  lancamentos: LancamentoFinanceiro[];
  setLancamentos: React.Dispatch<React.SetStateAction<LancamentoFinanceiro[]>>;
  users: User[];
  centrosCusto: CentroCusto[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  faturas: Fatura[];
}

export function MovimentosTab({
  movimentos,
  setMovimentos,
  movimentoItens,
  setMovimentoItens,
  lancamentos,
  setLancamentos,
  users,
  centrosCusto,
  products,
  setProducts,
  faturas,
}: MovimentosTabProps) {
  const allMovimentos = movimentos || [];
  const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };
  const getCsrfToken = () => {
    const token = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return token?.content || '';
  };
  const sendMovimento = async (url: string, method: 'POST' | 'PUT', payload: Record<string, unknown>, documentoOriginal?: File | null) => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': getCsrfToken(),
    };

    let body: BodyInit;
    if (documentoOriginal) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === 'items') {
          form.append('items', JSON.stringify(value));
          return;
        }
        form.append(key, String(value));
      });
      form.append('documento_original', documentoOriginal);
      body = form;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: 'same-origin',
      body,
    });

    if (!response.ok) {
      let message = 'Erro ao gravar movimento';
      try {
        const data = await response.json();
        if (data?.message) message = data.message;
        if (data?.errors) {
          const errors = Object.values(data.errors).flat().join(' ');
          if (errors) message = errors;
        }
      } catch (error) {
        const fallback = await response.text();
        if (fallback) message = fallback;
      }
      throw new Error(message);
    }

    return response.json() as Promise<{ movimento: Movimento; items: MovimentoItem[] }>;
  };

  const liquidarMovimento = async (movimentoId: string, numeroReciboLocal: string, metodoPagamentoLocal: string, comprovativo?: File | null) => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': getCsrfToken(),
    };

    let body: BodyInit;
    if (comprovativo) {
      const form = new FormData();
      form.append('numero_recibo', numeroReciboLocal);
      form.append('metodo_pagamento', metodoPagamentoLocal);
      form.append('comprovativo', comprovativo);
      body = form;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ numero_recibo: numeroReciboLocal, metodo_pagamento: metodoPagamentoLocal });
    }

    const response = await fetch(route('financeiro.movimentos.liquidar', movimentoId), {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body,
    });

    if (!response.ok) {
      let message = 'Erro ao liquidar movimento';
      try {
        const data = await response.json();
        if (data?.message) message = data.message;
        if (data?.errors) {
          const errors = Object.values(data.errors).flat().join(' ');
          if (errors) message = errors;
        }
      } catch (error) {
        const fallback = await response.text();
        if (fallback) message = fallback;
      }
      throw new Error(message);
    }

    return response.json() as Promise<{ movimento: Movimento; lancamento?: LancamentoFinanceiro }>;
  };

  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [classificacaoFilter, setClassificacaoFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogReciboOpen, setDialogReciboOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [selectedMovimentoId, setSelectedMovimentoId] = useState<string | null>(null);
  const [selectedMovimentos, setSelectedMovimentos] = useState<Set<string>>(new Set());
  const [numeroRecibo, setNumeroRecibo] = useState<string>('');
  const [metodoPagamento, setMetodoPagamento] = useState<string>('transferencia');
  const [comprovativoFile, setComprovativoFile] = useState<File | null>(null);
  const [editingMovimentoId, setEditingMovimentoId] = useState<string | null>(null);
  const [usarDadosUtilizador, setUsarDadosUtilizador] = useState(false);
  const [documentoOriginalFile, setDocumentoOriginalFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    user_id: '',
    nome_manual: 'BSCN',
    nif_manual: '',
    morada_manual: '',
    classificacao: 'receita' as 'receita' | 'despesa',
    tipo: 'outro' as Movimento['tipo'],
    valor_total: 0,
    data_emissao: format(new Date(), 'yyyy-MM-dd'),
    data_vencimento: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
    centro_custo_id: '',
    origem_tipo: null as Movimento['origem_tipo'],
    origem_id: '',
    observacoes: '',
  });

  const [linhas, setLinhas] = useState<
    Array<{
      descricao: string;
      valor_unitario: number;
      quantidade: number;
      imposto_percentual: number;
      produto_id?: string;
      fatura_id?: string;
      tipo_fatura?: 'mensalidade' | 'movimento';
    }>
  >([{ descricao: '', valor_unitario: 0, quantidade: 1, imposto_percentual: 0 }]);

  const filteredMovimentos = useMemo(() => {
    const now = new Date();
    return (movimentos || [])
      .filter((movimento) => {
        const estadoMatch =
          estadoFilter === 'all' ||
          (() => {
            if (estadoFilter === 'vencido') {
              return (
                (movimento.estado_pagamento === 'pendente' || movimento.estado_pagamento === 'vencido') &&
                isBefore(new Date(movimento.data_vencimento), now)
              );
            }
            return movimento.estado_pagamento === estadoFilter;
          })();

        const classificacaoMatch = classificacaoFilter === 'all' || movimento.classificacao === classificacaoFilter;

        return estadoMatch && classificacaoMatch;
      })
      .map((movimento) => {
        const now = new Date();
        if (
          (movimento.estado_pagamento === 'pendente' || movimento.estado_pagamento === 'vencido') &&
          isBefore(new Date(movimento.data_vencimento), now)
        ) {
          return { ...movimento, estado_pagamento: 'vencido' as const };
        }
        return movimento;
      });
  }, [movimentos, estadoFilter, classificacaoFilter]);

  const handleAbrirDialogoRecibo = (movimentoId?: string, reciboAtual?: string | null, metodoAtual?: string | null) => {
    if (movimentoId) {
      setSelectedMovimentoId(movimentoId);
      setSelectedMovimentos(new Set());
    } else {
      setSelectedMovimentoId(null);
    }
    setNumeroRecibo(reciboAtual || '');
    setMetodoPagamento(metodoAtual || 'transferencia');
    setDialogReciboOpen(true);
  };

  const handleConfirmarLiquidacao = async () => {
    const movimentosParaLiquidar = selectedMovimentoId ? [selectedMovimentoId] : Array.from(selectedMovimentos);

    if (movimentosParaLiquidar.length === 0) return;

    if (!numeroRecibo.trim()) {
      toast.error('Por favor, insira o numero do recibo');
      return;
    }

    try {
      const updatedMovimentos: Movimento[] = [];
      const novosLancamentos: LancamentoFinanceiro[] = [];

      for (const movimentoId of movimentosParaLiquidar) {
        const result = await liquidarMovimento(movimentoId, numeroRecibo.trim(), metodoPagamento, comprovativoFile);
        updatedMovimentos.push(result.movimento);
        if (result.lancamento) {
          novosLancamentos.push(result.lancamento);
        }
      }

      setMovimentos((current) =>
        (current || []).map((m) => updatedMovimentos.find((u) => u.id === m.id) || m)
      );

      if (novosLancamentos.length > 0) {
        setLancamentos((current) => [...(current || []), ...novosLancamentos]);
      }

      toast.success(`${movimentosParaLiquidar.length} movimento(s) liquidado(s) com recibo ${numeroRecibo.trim()}`);
      setDialogReciboOpen(false);
      setSelectedMovimentoId(null);
      setSelectedMovimentos(new Set());
      setNumeroRecibo('');
      setComprovativoFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao liquidar movimento';
      toast.error(message);
    }
  };

  const handleToggleMovimentoSelection = (movimentoId: string) => {
    setSelectedMovimentos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movimentoId)) {
        newSet.delete(movimentoId);
      } else {
        newSet.add(movimentoId);
      }
      return newSet;
    });
  };

  const handleToggleAllMovimentos = () => {
    if (selectedMovimentos.size === filteredMovimentos.length) {
      setSelectedMovimentos(new Set());
    } else {
      setSelectedMovimentos(new Set(filteredMovimentos.map((m) => m.id)));
    }
  };

  const handleAbrirDialogoDelete = () => {
    if (selectedMovimentos.size === 0) {
      toast.error('Selecione pelo menos um movimento para apagar');
      return;
    }
    setDialogDeleteOpen(true);
  };

  const handleConfirmarDelete = async () => {
    const movimentosParaApagar = Array.from(selectedMovimentos);
    try {
      for (const movimentoId of movimentosParaApagar) {
        await fetch(route('financeiro.movimentos.destroy', movimentoId), {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
          },
          credentials: 'same-origin',
        });
      }

      setMovimentos((current) => (current || []).filter((m) => !movimentosParaApagar.includes(m.id)));
      setMovimentoItens((current) =>
        (current || []).filter((item) => !movimentosParaApagar.includes(item.movimento_id))
      );

      toast.success(`${movimentosParaApagar.length} movimento(s) apagado(s) com sucesso`);
      setDialogDeleteOpen(false);
      setSelectedMovimentos(new Set());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao apagar movimentos';
      toast.error(message);
    }
  };

  const handleDeleteSingleMovimento = async (movimentoId: string) => {
    try {
      await fetch(route('financeiro.movimentos.destroy', movimentoId), {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
      });
      setMovimentos((current) => (current || []).filter((m) => m.id !== movimentoId));
      setMovimentoItens((current) => (current || []).filter((item) => item.movimento_id !== movimentoId));
      toast.success('Movimento apagado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao apagar movimento';
      toast.error(message);
    }
  };

  const handleCriarMovimento = async () => {
    if (usarDadosUtilizador && !formData.user_id) {
      toast.error('Selecione um utilizador');
      return;
    }

    if (!formData.centro_custo_id) {
      toast.error('Selecione um centro de custo');
      return;
    }

    if (linhas.every((l) => !l.descricao || l.valor_unitario <= 0)) {
      toast.error('Adicione pelo menos uma linha valida');
      return;
    }

    if (editingMovimentoId) {
      const linhasValidas = linhas.filter((l) => l.descricao && l.valor_unitario > 0);
      const totalAbsoluto = linhasValidas.reduce(
        (sum, l) => sum + l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100),
        0
      );
      const total = formData.classificacao === 'despesa' ? -Math.abs(totalAbsoluto) : Math.abs(totalAbsoluto);
      const payload = {
        user_id: usarDadosUtilizador ? formData.user_id : null,
        nome_manual: usarDadosUtilizador ? undefined : formData.nome_manual,
        nif_manual: usarDadosUtilizador ? undefined : formData.nif_manual,
        morada_manual: usarDadosUtilizador ? undefined : formData.morada_manual,
        classificacao: formData.classificacao,
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        valor_total: total,
        centro_custo_id: formData.centro_custo_id,
        tipo: formData.tipo,
        origem_tipo: formData.origem_tipo || null,
        origem_id: formData.origem_id || null,
        observacoes: formData.observacoes || undefined,
        items: linhasValidas.map((linha) => ({
          descricao: linha.descricao,
          quantidade: linha.quantidade,
          valor_unitario: linha.valor_unitario,
          imposto_percentual: linha.imposto_percentual,
          total_linha: linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100),
          produto_id: linha.produto_id || undefined,
          centro_custo_id: formData.centro_custo_id,
          fatura_id: linha.fatura_id || undefined,
        })),
      };

      try {
        const result = await sendMovimento(route('financeiro.movimentos.update', editingMovimentoId), 'PUT', payload, documentoOriginalFile);
        setMovimentos((current) =>
          (current || []).map((m) => (m.id === editingMovimentoId ? result.movimento : m))
        );
        setMovimentoItens((current) => {
          const filtered = (current || []).filter((item) => item.movimento_id !== editingMovimentoId);
          return [...filtered, ...result.items];
        });
        toast.success('Movimento atualizado com sucesso');
        setEditingMovimentoId(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar movimento';
        toast.error(message);
        return;
      }
    } else {
      const linhasValidas = linhas.filter((l) => l.descricao && l.valor_unitario > 0);
      const totalAbsoluto = linhasValidas.reduce(
        (sum, l) => sum + l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100),
        0
      );
      const total = formData.classificacao === 'despesa' ? -Math.abs(totalAbsoluto) : Math.abs(totalAbsoluto);
      const payload = {
        user_id: usarDadosUtilizador ? formData.user_id : null,
        nome_manual: usarDadosUtilizador ? undefined : formData.nome_manual,
        nif_manual: usarDadosUtilizador ? undefined : formData.nif_manual,
        morada_manual: usarDadosUtilizador ? undefined : formData.morada_manual,
        classificacao: formData.classificacao,
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        valor_total: total,
        estado_pagamento: 'pendente',
        centro_custo_id: formData.centro_custo_id,
        tipo: formData.tipo,
        origem_tipo: formData.origem_tipo || null,
        origem_id: formData.origem_id || null,
        observacoes: formData.observacoes || undefined,
        items: linhasValidas.map((linha) => ({
          descricao: linha.descricao,
          quantidade: linha.quantidade,
          valor_unitario: linha.valor_unitario,
          imposto_percentual: linha.imposto_percentual,
          total_linha: linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100),
          produto_id: linha.produto_id || undefined,
          centro_custo_id: formData.centro_custo_id,
          fatura_id: linha.fatura_id || undefined,
        })),
      };

      try {
        const result = await sendMovimento(route('financeiro.movimentos.store'), 'POST', payload, documentoOriginalFile);
        setMovimentos((current) => [...(current || []), result.movimento]);
        setMovimentoItens((current) => [...(current || []), ...result.items]);
        toast.success('Movimento criado com sucesso');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao criar movimento';
        toast.error(message);
        return;
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      nome_manual: 'BSCN',
      nif_manual: '',
      morada_manual: '',
      classificacao: 'receita',
      tipo: 'outro',
      valor_total: 0,
      data_emissao: format(new Date(), 'yyyy-MM-dd'),
      data_vencimento: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
      centro_custo_id: '',
      origem_tipo: null,
      origem_id: '',
      observacoes: '',
    });
    setLinhas([{ descricao: '', valor_unitario: 0, quantidade: 1, imposto_percentual: 0 }]);
    setEditingMovimentoId(null);
    setUsarDadosUtilizador(false);
    setDocumentoOriginalFile(null);
  };

  const handleEditarMovimento = (movimentoId: string) => {
    const movimento = (movimentos || []).find((m) => m.id === movimentoId);
    if (!movimento) return;

    const itens = (movimentoItens || []).filter((item) => item.movimento_id === movimentoId);

    const utilizaUtilizador = !!movimento.user_id;
    setUsarDadosUtilizador(utilizaUtilizador);

    setFormData({
      user_id: movimento.user_id || '',
      nome_manual: movimento.nome_manual || '',
      nif_manual: movimento.nif_manual || '',
      morada_manual: movimento.morada_manual || '',
      classificacao: movimento.classificacao,
      tipo: movimento.tipo,
      valor_total: movimento.valor_total,
      data_emissao: movimento.data_emissao,
      data_vencimento: movimento.data_vencimento,
      centro_custo_id: movimento.centro_custo_id || '',
      origem_tipo: movimento.origem_tipo || null,
      origem_id: movimento.origem_id || '',
      observacoes: movimento.observacoes || '',
    });

    if (itens.length > 0) {
      setLinhas(
        itens.map((item) => ({
          descricao: item.descricao,
          valor_unitario: item.valor_unitario,
          quantidade: item.quantidade,
          imposto_percentual: item.imposto_percentual,
          produto_id: item.produto_id || undefined,
          fatura_id: item.fatura_id || undefined,
        }))
      );
    }

    setEditingMovimentoId(movimentoId);
    setDialogOpen(true);
  };

  const handleUserChange = (userId: string) => {
    setFormData({ ...formData, user_id: userId });

    if (userId && usarDadosUtilizador) {
      const user = (users || []).find((u) => u.id === userId);
      if (user) {
        setFormData((prev) => ({
          ...prev,
          user_id: userId,
          nome_manual: user.nome_completo,
          nif_manual: user.nif || '',
          morada_manual: user.morada || '',
        }));
      }
    }
  };

  const addLinha = () => {
    setLinhas([...linhas, { descricao: '', valor_unitario: 0, quantidade: 1, imposto_percentual: 0 }]);
  };

  const removeLinha = (index: number) => {
    setLinhas(linhas.filter((_, i) => i !== index));
  };

  const updateLinha = (index: number, field: string, value: any) => {
    const newLinhas = [...linhas];
    newLinhas[index] = { ...newLinhas[index], [field]: value };
    setLinhas(newLinhas);
  };

  const getNomeDisplay = (movimento: Movimento) => {
    if (movimento.user_id) {
      const user = (users || []).find((u) => u.id === movimento.user_id);
      return user ? user.nome_completo : 'Utilizador desconhecido';
    }
    return movimento.nome_manual || 'BSCN';
  };

  const getCentroCustoName = (id?: string) => {
    if (!id) return '-';
    const cc = (centrosCusto || []).find((c) => c.id === id);
    return cc ? cc.nome : '-';
  };

  const getFaturasAssociadas = (movimentoId: string) => {
    const itens = (movimentoItens || []).filter((item) => item.movimento_id === movimentoId);
    const faturasIds = itens.map((item) => item.fatura_id).filter(Boolean);

    if (faturasIds.length === 0) return null;

    const faturasAssociadas = faturasIds
      .map((faturaId) => {
        const fatura = (faturas || []).find((f) => f.id === faturaId);
        const movimento = (allMovimentos || []).find((m) => m.id === faturaId);

        if (fatura) {
          const user = (users || []).find((u) => u.id === fatura.user_id);
          return `${fatura.tipo} - ${user?.nome_completo || 'Cliente'}`;
        }
        if (movimento) {
          const nomeDisplay = movimento.user_id
            ? (users || []).find((u) => u.id === movimento.user_id)?.nome_completo
            : movimento.nome_manual;
          return `${movimento.tipo} - ${nomeDisplay || 'Cliente'}`;
        }
        return null;
      })
      .filter(Boolean);

    return faturasAssociadas.length > 0 ? faturasAssociadas.join(', ') : null;
  };

  const getEstadoBadge = (estado: Movimento['estado_pagamento']) => {
    const variants = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      parcial: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={variants[estado]}>{estado.toUpperCase()}</Badge>;
  };

  const getClassificacaoBadge = (classificacao: 'receita' | 'despesa') => {
    const variants = {
      receita: 'bg-green-100 text-green-800',
      despesa: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[classificacao]}>{classificacao.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 items-center">
          <Select value={classificacaoFilter} onValueChange={setClassificacaoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Classificacao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Classificacoes</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedMovimentos.size > 0 && (
            <>
              <Button variant="outline" onClick={() => handleAbrirDialogoRecibo()}>
                <Check className="mr-2" size={18} />
                Liquidar Selecionados ({selectedMovimentos.size})
              </Button>
              <Button variant="destructive" onClick={handleAbrirDialogoDelete}>
                <Trash className="mr-2" size={18} />
                Apagar Selecionados ({selectedMovimentos.size})
              </Button>
            </>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" />
                Movimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMovimentoId ? 'Editar Movimento' : 'Criar Movimento'}</DialogTitle>
                <DialogDescription>
                  {editingMovimentoId ? 'Altere os dados do movimento financeiro' : 'Registe uma nova receita ou despesa'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="usar-dados-utilizador"
                    checked={usarDadosUtilizador}
                    onCheckedChange={(checked) => {
                      setUsarDadosUtilizador(checked === true);
                      if (!checked) {
                        setFormData((prev) => ({
                          ...prev,
                          user_id: '',
                          nome_manual: 'BSCN',
                          nif_manual: '',
                          morada_manual: '',
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          nome_manual: '',
                          nif_manual: '',
                          morada_manual: '',
                        }));
                      }
                    }}
                  />
                  <Label htmlFor="usar-dados-utilizador" className="cursor-pointer">
                    Usar dados de utilizador existente
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {usarDadosUtilizador ? (
                    <div className="space-y-2 col-span-2">
                      <Label>Utilizador *</Label>
                      <Select value={formData.user_id} onValueChange={handleUserChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar utilizador" />
                        </SelectTrigger>
                        <SelectContent>
                          {(users || []).map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nome_completo} - {user.numero_socio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 col-span-2">
                        <Label>Entidade</Label>
                        <Input
                          value={formData.nome_manual}
                          onChange={(e) => setFormData({ ...formData, nome_manual: e.target.value })}
                          placeholder="Nome do cliente/fornecedor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>NIF</Label>
                        <Input
                          value={formData.nif_manual}
                          onChange={(e) => setFormData({ ...formData, nif_manual: e.target.value })}
                          placeholder="Numero de contribuinte"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Morada</Label>
                        <Input
                          value={formData.morada_manual}
                          onChange={(e) => setFormData({ ...formData, morada_manual: e.target.value })}
                          placeholder="Morada completa"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Classificacao *</Label>
                    <Select
                      value={formData.classificacao}
                      onValueChange={(v) => setFormData({ ...formData, classificacao: v as 'receita' | 'despesa' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(v) =>
                        setFormData((current) => {
                          const tipo = v as Movimento['tipo'];
                          let origem = current.origem_tipo;

                          if (!origem || origem === 'manual') {
                            if (tipo === 'inscricao') origem = 'evento';
                            else if (tipo === 'material') origem = 'stock';
                            else if (tipo === 'patrocinio') origem = 'patrocinio';
                            else if (tipo === 'servico') origem = 'manual';
                            else origem = null;
                          }

                          return { ...current, tipo, origem_tipo: origem };
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inscricao">Inscricao</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="servico">Servico</SelectItem>
                        <SelectItem value="patrocinio">Patrocinio</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Origem</Label>
                    <Select
                      value={formData.origem_tipo || 'none'}
                      onValueChange={(v) =>
                        setFormData((current) => ({
                          ...current,
                          origem_tipo: v === 'none' ? null : (v as Movimento['origem_tipo']),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem origem</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="patrocinio">Patrocinio</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.origem_tipo && (
                    <div className="space-y-2">
                      <Label>Referencia</Label>
                      <Input
                        value={formData.origem_id}
                        onChange={(e) => setFormData({ ...formData, origem_id: e.target.value })}
                        placeholder="ID ou referencia externa"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Data Emissao</Label>
                    <Input type="date" value={formData.data_emissao} onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Vencimento</Label>
                    <Input type="date" value={formData.data_vencimento} onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })} />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Centro de Custo</Label>
                    <Select
                      value={formData.centro_custo_id}
                      onValueChange={(v) => setFormData({ ...formData, centro_custo_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {(centrosCusto || [])
                          .filter((cc) => cc.ativo)
                          .map((cc) => (
                            <SelectItem key={cc.id} value={cc.id}>
                              {cc.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Documento Original (opcional)</Label>
                    <Input
                      type="file"
                      onChange={(e) => setDocumentoOriginalFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Linhas do Movimento</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addLinha}>
                      <Plus size={16} className="mr-1" />
                      Adicionar Linha
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {linhas.map((linha, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-4 space-y-2">
                              <Label className="text-xs">Descricao</Label>
                              <Input
                                placeholder="Item"
                                value={linha.descricao}
                                onChange={(e) => updateLinha(index, 'descricao', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label className="text-xs">Valor Unit.</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={linha.valor_unitario}
                                onChange={(e) => updateLinha(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label className="text-xs">Qtd.</Label>
                              <Input
                                type="number"
                                min="1"
                                value={linha.quantidade}
                                onChange={(e) => updateLinha(index, 'quantidade', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label className="text-xs">IVA %</Label>
                              <Input
                                type="number"
                                min="0"
                                value={linha.imposto_percentual}
                                onChange={(e) => updateLinha(index, 'imposto_percentual', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-1 space-y-2">
                              <Label className="text-xs">Total</Label>
                              <div className="text-sm font-medium pt-2">
                                €{(linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100)).toFixed(2)}
                              </div>
                            </div>
                            <div className="col-span-1 flex items-end">
                              {linhas.length > 1 && (
                                <Button type="button" size="sm" variant="ghost" onClick={() => removeLinha(index)}>
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Associar Mensalidade (opcional)</Label>
                              <Select
                                value={linha.fatura_id && linha.tipo_fatura === 'mensalidade' ? linha.fatura_id : 'none'}
                                onValueChange={(v) => {
                                  if (v && v !== 'none') {
                                    updateLinha(index, 'fatura_id', v);
                                    updateLinha(index, 'tipo_fatura', 'mensalidade');
                                    const fatura = (faturas || []).find((f) => f.id === v);
                                    if (fatura) {
                                      const user = (users || []).find((u) => u.id === fatura.user_id);
                                      updateLinha(
                                        index,
                                        'descricao',
                                        `${fatura.tipo} - ${user?.nome_completo || 'Cliente'} - ${format(new Date(fatura.data_emissao), 'MM/yyyy')}`
                                      );
                                      updateLinha(index, 'valor_unitario', fatura.valor_total);
                                    }
                                  } else {
                                    if (linha.tipo_fatura === 'mensalidade') {
                                      updateLinha(index, 'fatura_id', undefined);
                                      updateLinha(index, 'tipo_fatura', undefined);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Nenhuma" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhuma</SelectItem>
                                  {(faturas || [])
                                    .filter((f) => f.estado_pagamento !== 'cancelado')
                                    .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime())
                                    .map((fatura) => {
                                      const user = (users || []).find((u) => u.id === fatura.user_id);
                                      return (
                                        <SelectItem key={fatura.id} value={fatura.id}>
                                          {user?.nome_completo} - {fatura.tipo} - €{toNumber(fatura.valor_total).toFixed(2)} ({format(new Date(fatura.data_emissao), 'dd/MM/yyyy')})
                                        </SelectItem>
                                      );
                                    })}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Associar Movimento (opcional)</Label>
                              <Select
                                value={linha.fatura_id && linha.tipo_fatura === 'movimento' ? linha.fatura_id : 'none'}
                                onValueChange={(v) => {
                                  if (v && v !== 'none') {
                                    updateLinha(index, 'fatura_id', v);
                                    updateLinha(index, 'tipo_fatura', 'movimento');
                                    const movimento = (allMovimentos || []).find((m) => m.id === v);
                                    if (movimento) {
                                      const nomeDisplay = movimento.user_id
                                        ? (users || []).find((u) => u.id === movimento.user_id)?.nome_completo
                                        : movimento.nome_manual;
                                      updateLinha(
                                        index,
                                        'descricao',
                                        `${movimento.tipo} - ${nomeDisplay || 'Cliente'} - ${format(new Date(movimento.data_emissao), 'dd/MM/yyyy')}`
                                      );
                                      updateLinha(index, 'valor_unitario', Math.abs(movimento.valor_total));
                                    }
                                  } else {
                                    if (linha.tipo_fatura === 'movimento') {
                                      updateLinha(index, 'fatura_id', undefined);
                                      updateLinha(index, 'tipo_fatura', undefined);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Nenhum" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum</SelectItem>
                                  {(allMovimentos || [])
                                    .filter((m) => m.id !== editingMovimentoId && m.estado_pagamento !== 'cancelado')
                                    .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime())
                                    .map((movimento) => {
                                      const nomeDisplay = movimento.user_id
                                        ? (users || []).find((u) => u.id === movimento.user_id)?.nome_completo
                                        : movimento.nome_manual;
                                      return (
                                        <SelectItem key={movimento.id} value={movimento.id}>
                                          {nomeDisplay} - {movimento.tipo} - €{toNumber(movimento.valor_total).toFixed(2)} ({format(new Date(movimento.data_emissao), 'dd/MM/yyyy')})
                                        </SelectItem>
                                      );
                                    })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observacoes</Label>
                  <Textarea
                    placeholder="Notas adicionais"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-semibold">Total do Movimento:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formData.classificacao === 'despesa' ? '-' : ''}€{linhas
                      .reduce((sum, l) => sum + l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCriarMovimento}>{editingMovimentoId ? 'Guardar Alteracoes' : 'Criar Movimento'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedMovimentos.size === filteredMovimentos.length && filteredMovimentos.length > 0}
                  onCheckedChange={handleToggleAllMovimentos}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Classificacao</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data Emissao</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Centro Custo</TableHead>
              <TableHead>Faturas Associadas</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovimentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  Nenhum movimento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredMovimentos
                .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime())
                .map((movimento) => {
                  const movimentoValor = toNumber(movimento.valor_total);
                  return (
                    <TableRow key={movimento.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMovimentos.has(movimento.id)}
                        onCheckedChange={() => handleToggleMovimentoSelection(movimento.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{getNomeDisplay(movimento)}</TableCell>
                    <TableCell>{getClassificacaoBadge(movimento.classificacao)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{movimento.tipo}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(movimento.data_emissao), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(movimento.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-semibold">
                      <span className={movimentoValor < 0 ? 'text-red-600' : 'text-green-600'}>
                        €{movimentoValor.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{getEstadoBadge(movimento.estado_pagamento)}</TableCell>
                    <TableCell className="text-sm">{getCentroCustoName(movimento.centro_custo_id)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {getFaturasAssociadas(movimento.id) || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditarMovimento(movimento.id)} title="Editar movimento">
                          <PencilSimple size={16} />
                        </Button>
                        {(movimento.estado_pagamento === 'pendente' || movimento.estado_pagamento === 'vencido') && (
                          <Button size="sm" variant="outline" onClick={() => handleAbrirDialogoRecibo(movimento.id)}>
                            <Check size={16} className="mr-1" />
                            Liquidar
                          </Button>
                        )}
                        {movimento.estado_pagamento === 'pago' && !movimento.numero_recibo && (
                          <Button size="sm" variant="outline" onClick={() => handleAbrirDialogoRecibo(movimento.id)}>
                            <Check size={16} className="mr-1" />
                            Recibo
                          </Button>
                        )}
                        {movimento.estado_pagamento === 'pago' && movimento.numero_recibo && (
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">Recibo: {movimento.numero_recibo}</div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAbrirDialogoRecibo(movimento.id, movimento.numero_recibo, movimento.metodo_pagamento)}
                            >
                              Editar Recibo
                            </Button>
                          </div>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteSingleMovimento(movimento.id)}>
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogReciboOpen} onOpenChange={setDialogReciboOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMovimentoId ? 'Liquidar Movimento' : `Liquidar ${selectedMovimentos.size} Movimento(s)`}
            </DialogTitle>
            <DialogDescription>
              {selectedMovimentoId
                ? 'Confirme o pagamento do movimento indicando o numero de recibo'
                : `Confirme o pagamento de ${selectedMovimentos.size} movimento(s) com o mesmo numero de recibo`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero-recibo">Numero do Recibo *</Label>
              <Input
                id="numero-recibo"
                placeholder="Ex: REC-2025-001"
                value={numeroRecibo}
                onChange={(e) => setNumeroRecibo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmarLiquidacao();
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {selectedMovimentoId
                  ? 'Insira o numero do recibo para confirmar o pagamento deste movimento.'
                  : 'Este numero de recibo sera usado para todos os movimentos selecionados.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Metodo de Pagamento</Label>
              <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="mbway">MB Way</SelectItem>
                  <SelectItem value="multibanco">Multibanco</SelectItem>
                  <SelectItem value="cartao">Cartao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comprovativo (opcional)</Label>
              <Input type="file" onChange={(e) => setComprovativoFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogReciboOpen(false);
                setSelectedMovimentoId(null);
                setNumeroRecibo('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmarLiquidacao}>
              <Check className="mr-2" size={16} />
              Confirmar Liquidacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminacao</DialogTitle>
            <DialogDescription>
              Esta acao e irreversivel. Os movimentos serao permanentemente removidos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem a certeza que deseja apagar {selectedMovimentos.size} movimento(s)? Esta acao nao pode ser revertida.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarDelete}>
              <Trash className="mr-2" size={16} />
              Confirmar Eliminacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
