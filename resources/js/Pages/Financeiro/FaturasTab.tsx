import { useState, useMemo } from 'react';
import { Fatura, FaturaItem, User, CentroCusto, Product, LancamentoFinanceiro, MonthlyFee, InvoiceType } from './types';
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
import { Plus, MagicWand, X, Check, Trash, PencilSimple } from '@phosphor-icons/react';
import { format, addMonths, isBefore, isAfter, startOfMonth } from 'date-fns';
import { toast } from 'sonner';

interface FaturasTabProps {
  faturas: Fatura[];
  setFaturas: React.Dispatch<React.SetStateAction<Fatura[]>>;
  faturaItens: FaturaItem[];
  setFaturaItens: React.Dispatch<React.SetStateAction<FaturaItem[]>>;
  lancamentos: LancamentoFinanceiro[];
  setLancamentos: React.Dispatch<React.SetStateAction<LancamentoFinanceiro[]>>;
  users: User[];
  mensalidades: MonthlyFee[];
  centrosCusto: CentroCusto[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  invoiceTypes: InvoiceType[];
}

export function FaturasTab({
  faturas,
  setFaturas,
  faturaItens,
  setFaturaItens,
  lancamentos,
  setLancamentos,
  users,
  mensalidades,
  centrosCusto,
  products,
  setProducts,
  invoiceTypes,
}: FaturasTabProps) {
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
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
  const persistInvoice = async (payload: {
    user_id: string;
    data_emissao: string;
    data_vencimento: string;
    data_fatura?: string;
    mes?: string | null;
    tipo: Fatura['tipo'];
    valor_total: number;
    estado_pagamento?: Fatura['estado_pagamento'];
    centro_custo_id?: string | null;
    observacoes?: string | null;
    origem_tipo?: Fatura['origem_tipo'] | null;
    origem_id?: string | null;
    oculta?: boolean;
    items: Array<{
      descricao: string;
      quantidade: number;
      valor_unitario: number;
      imposto_percentual?: number;
      total_linha: number;
      produto_id?: string;
      centro_custo_id?: string | null;
    }>;
  }) => {
    const response = await fetch(route('financeiro.store'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = 'Erro ao criar fatura';
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

    const data = await response.json();
    return data.invoice as Fatura & { items?: FaturaItem[] };
  };
  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  const isFutureInvoice = (fatura: Fatura) => new Date(fatura.data_fatura) > getStartOfToday();
  const addBusinessDays = (startDate: Date, businessDays: number) => {
    const date = new Date(startDate);
    let added = 0;
    while (added < businessDays) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        added += 1;
      }
    }
    return date;
  };
  const getInscricaoDate = (user: User) => {
    if (!user.data_inscricao) return null;
    const parsed = new Date(user.data_inscricao);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const getFinalMes = (startDate: Date) => {
    const month = startDate.getMonth();
    const year = startDate.getFullYear();
    const finalYear = month <= 6 ? year : year + 1;
    return new Date(finalYear, 6, 1);
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAutoOpen, setDialogAutoOpen] = useState(false);
  const [dialogReciboOpen, setDialogReciboOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedFaturaId, setSelectedFaturaId] = useState<string | null>(null);
  const [selectedFaturas, setSelectedFaturas] = useState<Set<string>>(new Set());
  const [numeroRecibo, setNumeroRecibo] = useState<string>('');
  const [gerarParaTodos, setGerarParaTodos] = useState(false);
  const [editingFaturaId, setEditingFaturaId] = useState<string | null>(null);
  const [showFutureInvoices, setShowFutureInvoices] = useState(false);

  const invoiceTypeOptions = (invoiceTypes || []).filter((type) => type.ativo);
  const getInvoiceTypeLabel = (tipo: string) => {
    const match = (invoiceTypes || []).find((type) => type.codigo === tipo);
    return match ? match.nome : tipo;
  };

  const [formData, setFormData] = useState({
    user_id: '',
    tipo: 'outro' as Fatura['tipo'],
    valor_total: 0,
    data_emissao: format(new Date(), 'yyyy-MM-dd'),
    data_vencimento: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
    centro_custo_id: '',
    origem_tipo: null as Fatura['origem_tipo'],
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
    }>
  >([{ descricao: '', valor_unitario: 0, quantidade: 1, imposto_percentual: 0 }]);

  const filteredFaturas = useMemo(() => {
    const now = new Date();
    return (faturas || [])
      .filter((fatura) => {
        const futureInvoice = isFutureInvoice(fatura);
        if (!showFutureInvoices && futureInvoice) return false;

        if (estadoFilter === 'all') return true;

        if (estadoFilter === 'vencido') {
          return (
            (fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') &&
            isBefore(new Date(fatura.data_vencimento), now)
          );
        }

        return fatura.estado_pagamento === estadoFilter;
      })
      .map((fatura) => {
        const now = new Date();
        if (fatura.oculta && !isFutureInvoice(fatura)) {
          return { ...fatura, oculta: false };
        }
        if (
          (fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') &&
          isBefore(new Date(fatura.data_vencimento), now)
        ) {
          return { ...fatura, estado_pagamento: 'vencido' as const };
        }
        return fatura;
      });
  }, [faturas, estadoFilter, showFutureInvoices]);

  const handleAbrirDialogoRecibo = (faturaId?: string) => {
    if (faturaId) {
      setSelectedFaturaId(faturaId);
      setSelectedFaturas(new Set());
    } else {
      setSelectedFaturaId(null);
    }
    setNumeroRecibo('');
    setDialogReciboOpen(true);
  };

  const handleConfirmarLiquidacao = () => {
    const faturasParaLiquidar = selectedFaturaId ? [selectedFaturaId] : Array.from(selectedFaturas);

    if (faturasParaLiquidar.length === 0) return;

    if (!numeroRecibo.trim()) {
      toast.error('Por favor, insira o numero do recibo');
      return;
    }

    setFaturas((current) =>
      (current || []).map((f) => {
        if (faturasParaLiquidar.includes(f.id)) {
          return { ...f, estado_pagamento: 'pago' as const, numero_recibo: numeroRecibo.trim() };
        }
        return f;
      })
    );

    const faturasMap = new Map((faturas || []).map((f) => [f.id, f]));
    const novosLancamentos: LancamentoFinanceiro[] = [];

    faturasParaLiquidar.forEach((faturaId) => {
      const fatura = faturasMap.get(faturaId);
      if (!fatura) return;
      const jaExiste = (lancamentos || []).some((l) => l.fatura_id === faturaId);
      if (jaExiste) return;

      novosLancamentos.push({
        id: crypto.randomUUID(),
        data: new Date().toISOString().split('T')[0],
        tipo: 'receita' as const,
        categoria: 'Pagamento de Fatura',
        descricao: `Pagamento de fatura ${fatura.tipo} - ${getUserName(fatura.user_id)} - Recibo: ${numeroRecibo.trim()}`,
        valor: fatura.valor_total,
        centro_custo_id: fatura.centro_custo_id,
        user_id: fatura.user_id,
        fatura_id: faturaId,
        origem_tipo: fatura.origem_tipo || undefined,
        origem_id: fatura.origem_id || undefined,
        metodo_pagamento: 'dinheiro',
        created_at: new Date().toISOString(),
      });
    });

    setLancamentos((current) => {
      const updated = (current || []).map((l) => {
        if (!l.fatura_id || !faturasParaLiquidar.includes(l.fatura_id)) return l;
        const fatura = faturasMap.get(l.fatura_id);
        if (!fatura) return l;
        return {
          ...l,
          metodo_pagamento: l.metodo_pagamento || 'dinheiro',
          descricao: `Pagamento de fatura ${fatura.tipo} - ${getUserName(fatura.user_id)} - Recibo: ${numeroRecibo.trim()}`,
        };
      });
      return [...updated, ...novosLancamentos];
    });

    toast.success(`${faturasParaLiquidar.length} fatura(s) liquidada(s) com recibo ${numeroRecibo.trim()}`);
    setDialogReciboOpen(false);
    setSelectedFaturaId(null);
    setSelectedFaturas(new Set());
    setNumeroRecibo('');
  };

  const handleToggleFaturaSelection = (faturaId: string) => {
    setSelectedFaturas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faturaId)) {
        newSet.delete(faturaId);
      } else {
        newSet.add(faturaId);
      }
      return newSet;
    });
  };

  const handleToggleAllFaturas = () => {
    if (selectedFaturas.size === filteredFaturas.length) {
      setSelectedFaturas(new Set());
    } else {
      setSelectedFaturas(new Set(filteredFaturas.map((f) => f.id)));
    }
  };

  const handleAbrirDialogoDelete = () => {
    if (selectedFaturas.size === 0) {
      toast.error('Selecione pelo menos uma fatura para apagar');
      return;
    }
    setDialogDeleteOpen(true);
  };

  const handleConfirmarDelete = () => {
    const faturasParaApagar = Array.from(selectedFaturas);

    setFaturas((current) => (current || []).filter((f) => !faturasParaApagar.includes(f.id)));
    setFaturaItens((current) => (current || []).filter((item) => !faturasParaApagar.includes(item.fatura_id)));
    setLancamentos((current) => (current || []).filter((l) => !l.fatura_id || !faturasParaApagar.includes(l.fatura_id)));

    toast.success(`${faturasParaApagar.length} fatura(s) apagada(s) com sucesso`);
    setDialogDeleteOpen(false);
    setSelectedFaturas(new Set());
  };

  const handleDeleteSingleFatura = (faturaId: string) => {
    setFaturas((current) => (current || []).filter((f) => f.id !== faturaId));
    setFaturaItens((current) => (current || []).filter((item) => item.fatura_id !== faturaId));
    setLancamentos((current) => (current || []).filter((l) => l.fatura_id !== faturaId));
    toast.success('Fatura apagada com sucesso');
  };

  const gerarFaturasParaUtilizador = (userId: string) => {
    const user = (users || []).find((u) => u.id === userId);
    if (!user || !user.tipo_mensalidade) {
      return { faturas: [], itens: [], skipped: false };
    }

    const mensalidade = (mensalidades || []).find((m) => m.id === user.tipo_mensalidade);
    if (!mensalidade) {
      return { faturas: [], itens: [], skipped: false };
    }

    const inscricaoDate = getInscricaoDate(user);
    if (!inscricaoDate) {
      return { faturas: [], itens: [], skipped: true };
    }

    const mesInicial = startOfMonth(inscricaoDate);
    const julhoSeguinte = getFinalMes(inscricaoDate);

    let dataAtual = mesInicial;
    const novasFaturas: Fatura[] = [];
    const novosItens: FaturaItem[] = [];

    while (isBefore(dataAtual, julhoSeguinte) || dataAtual.getTime() === julhoSeguinte.getTime()) {
      const mesKey = format(dataAtual, 'yyyy-MM');
      const faturaExistente = (faturas || []).find((f) => f.user_id === userId && f.mes === mesKey);

      if (!faturaExistente) {
        const faturaId = crypto.randomUUID();
        const primeiroDiaMes = startOfMonth(dataAtual);
        const dataVencimento = addBusinessDays(primeiroDiaMes, 8);
        const ocultar = isAfter(primeiroDiaMes, getStartOfToday());

        const novaFatura: Fatura = {
          id: faturaId,
          user_id: userId,
          data_fatura: format(primeiroDiaMes, 'yyyy-MM-dd'),
          mes: mesKey,
          data_emissao: format(primeiroDiaMes, 'yyyy-MM-dd'),
          data_vencimento: format(dataVencimento, 'yyyy-MM-dd'),
          valor_total: mensalidade.valor,
          oculta: ocultar,
          estado_pagamento: 'pendente',
          centro_custo_id: user.centro_custo?.[0] || undefined,
          tipo: 'mensalidade',
          created_at: new Date().toISOString(),
        };

        const novoItem: FaturaItem = {
          id: crypto.randomUUID(),
          fatura_id: faturaId,
          descricao: mensalidade.designacao,
          valor_unitario: mensalidade.valor,
          quantidade: 1,
          imposto_percentual: 0,
          total_linha: mensalidade.valor,
          centro_custo_id: user.centro_custo?.[0] || undefined,
        };

        novasFaturas.push(novaFatura);
        novosItens.push(novoItem);
      }

      dataAtual = addMonths(dataAtual, 1);
    }

    return { faturas: novasFaturas, itens: novosItens, skipped: false };
  };

  const handleGerarFaturasMensais = async () => {
    if (!gerarParaTodos && !selectedUserId) {
      toast.error('Selecione um utilizador ou escolha gerar para todos');
      return;
    }

    let totalNovasFaturas = 0;
    const todasNovasFaturas: Fatura[] = [];
    const todosNovosItens: FaturaItem[] = [];
    const usersSemInscricao: string[] = [];

    if (gerarParaTodos) {
      const usuariosComMensalidade = (users || []).filter((u) => u.tipo_mensalidade);

      if (usuariosComMensalidade.length === 0) {
        toast.error('Nenhum utilizador tem mensalidade configurada');
        return;
      }

      for (const user of usuariosComMensalidade) {
        const { faturas: novasFaturas, itens: novosItens, skipped } = gerarFaturasParaUtilizador(user.id);
        if (skipped) {
          usersSemInscricao.push(user.nome_completo);
          continue;
        }
        todasNovasFaturas.push(...novasFaturas);
        todosNovosItens.push(...novosItens);
      }

      totalNovasFaturas = todasNovasFaturas.length;
    } else {
      const { faturas: novasFaturas, itens: novosItens, skipped } = gerarFaturasParaUtilizador(selectedUserId);

      if (skipped) {
        toast.error('Utilizador sem data de inscricao');
        return;
      }

      if (novasFaturas.length === 0) {
        const user = (users || []).find((u) => u.id === selectedUserId);
        if (!user || !user.tipo_mensalidade) {
          toast.error('Utilizador nao tem mensalidade configurada');
        } else {
          toast.info('Nenhuma fatura nova foi criada (todas ja existem)');
        }
        return;
      }

      todasNovasFaturas.push(...novasFaturas);
      todosNovosItens.push(...novosItens);
      totalNovasFaturas = novasFaturas.length;
    }

    if (totalNovasFaturas > 0) {
      try {
        const createdInvoices: Fatura[] = [];
        const createdItems: FaturaItem[] = [];

        for (const fatura of todasNovasFaturas) {
          const itens = todosNovosItens
            .filter((item) => item.fatura_id === fatura.id)
            .map((item) => ({
              descricao: item.descricao,
              quantidade: item.quantidade,
              valor_unitario: item.valor_unitario,
              imposto_percentual: item.imposto_percentual,
              total_linha: item.total_linha,
              produto_id: item.produto_id || undefined,
              centro_custo_id: item.centro_custo_id || undefined,
            }));

          const created = await persistInvoice({
            user_id: fatura.user_id,
            data_emissao: fatura.data_emissao,
            data_vencimento: fatura.data_vencimento,
            data_fatura: fatura.data_fatura,
            mes: fatura.mes || null,
            tipo: fatura.tipo,
            valor_total: fatura.valor_total,
            estado_pagamento: fatura.estado_pagamento,
            centro_custo_id: fatura.centro_custo_id || undefined,
            observacoes: fatura.observacoes || undefined,
            origem_tipo: fatura.origem_tipo || null,
            origem_id: fatura.origem_id || null,
            oculta: fatura.oculta || false,
            items: itens,
          });

          createdInvoices.push(created);
          if (created.items) {
            createdItems.push(...created.items);
          }
        }

        setFaturas((current) => [...(current || []), ...createdInvoices]);
        if (createdItems.length > 0) {
          setFaturaItens((current) => [...(current || []), ...createdItems]);
        }

        toast.success(`${createdInvoices.length} fatura(s) gerada(s) com sucesso`);
        if (usersSemInscricao.length > 0) {
          toast.warning(`${usersSemInscricao.length} utilizador(es) sem data de inscricao foram ignorados`);
        }
        setDialogAutoOpen(false);
        setSelectedUserId('');
        setGerarParaTodos(false);
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Erro ao gravar faturas na base de dados';
        toast.error(message);
      }
    } else {
      toast.info('Nenhuma fatura nova foi criada (todas ja existem)');
    }
  };

  const handleCriarFaturaManual = async () => {
    if (!formData.user_id) {
      toast.error('Selecione um utilizador');
      return;
    }

    if (linhas.every((l) => !l.descricao || l.valor_unitario <= 0)) {
      toast.error('Adicione pelo menos uma linha valida');
      return;
    }

    if (editingFaturaId) {
      const linhasValidas = linhas.filter((l) => l.descricao && l.valor_unitario > 0);
      const total = linhasValidas.reduce(
        (sum, l) => sum + l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100),
        0
      );

      const faturaAtualizada: Fatura = {
        ...(faturas || []).find((f) => f.id === editingFaturaId)!,
        user_id: formData.user_id,
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        valor_total: total,
        centro_custo_id: formData.centro_custo_id || undefined,
        tipo: formData.tipo,
        origem_tipo: formData.origem_tipo || null,
        origem_id: formData.origem_id || null,
        observacoes: formData.observacoes || undefined,
      };

      setFaturas((current) => (current || []).map((f) => (f.id === editingFaturaId ? faturaAtualizada : f)));

      setFaturaItens((current) => (current || []).filter((item) => item.fatura_id !== editingFaturaId));

      const novosItens: FaturaItem[] = linhasValidas.map((linha) => {
        const totalLinha = linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100);

        return {
          id: crypto.randomUUID(),
          fatura_id: editingFaturaId,
          descricao: linha.descricao,
          valor_unitario: linha.valor_unitario,
          quantidade: linha.quantidade,
          imposto_percentual: linha.imposto_percentual,
          total_linha: totalLinha,
          produto_id: linha.produto_id,
          centro_custo_id: formData.centro_custo_id || undefined,
        };
      });

      setFaturaItens((current) => [...(current || []), ...novosItens]);
      setLancamentos((current) => {
        const existing = (current || []).find((l) => l.fatura_id === editingFaturaId);
        const novoLancamento: LancamentoFinanceiro = {
          id: existing?.id || crypto.randomUUID(),
          data: formData.data_emissao,
          tipo: 'receita' as const,
          categoria: 'Fatura manual',
          descricao: `Fatura manual ${formData.tipo} - ${getUserName(formData.user_id)}`,
          valor: total,
          centro_custo_id: formData.centro_custo_id || undefined,
          user_id: formData.user_id,
          fatura_id: editingFaturaId,
          origem_tipo: formData.origem_tipo || 'manual',
          origem_id: formData.origem_id || undefined,
          metodo_pagamento: existing?.metodo_pagamento || 'manual',
          created_at: existing?.created_at || new Date().toISOString(),
        };

        if (existing) {
          return (current || []).map((l) => (l.id === existing.id ? novoLancamento : l));
        }
        return [...(current || []), novoLancamento];
      });
      toast.success('Fatura atualizada com sucesso');
      setEditingFaturaId(null);
    } else {
      const faturaId = crypto.randomUUID();
      const linhasValidas = linhas.filter((l) => l.descricao && l.valor_unitario > 0);
      const total = linhasValidas.reduce(
        (sum, l) => sum + l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100),
        0
      );

      const novaFatura: Fatura = {
        id: faturaId,
        user_id: formData.user_id,
        data_fatura: formData.data_emissao,
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        valor_total: total,
        estado_pagamento: 'pendente',
        centro_custo_id: formData.centro_custo_id || undefined,
        tipo: formData.tipo,
        origem_tipo: formData.origem_tipo || null,
        origem_id: formData.origem_id || null,
        observacoes: formData.observacoes || undefined,
        created_at: new Date().toISOString(),
      };

      const novosItens: FaturaItem[] = linhasValidas.map((linha) => {
        const totalLinha = linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100);

        if (linha.produto_id) {
          const product = (products || []).find((p) => p.id === linha.produto_id);
          if (product) {
            const novoStock = product.stock - linha.quantidade;
            const updatedProducts = (products || []).map((p) =>
              p.id === linha.produto_id ? { ...p, stock: novoStock } : p
            );
            setProducts(updatedProducts);
          }
        }

        return {
          id: crypto.randomUUID(),
          fatura_id: faturaId,
          descricao: linha.descricao,
          valor_unitario: linha.valor_unitario,
          quantidade: linha.quantidade,
          imposto_percentual: linha.imposto_percentual,
          total_linha: totalLinha,
          produto_id: linha.produto_id,
          centro_custo_id: formData.centro_custo_id || undefined,
        };
      });

      try {
        const created = await persistInvoice({
          user_id: novaFatura.user_id,
          data_emissao: novaFatura.data_emissao,
          data_vencimento: novaFatura.data_vencimento,
          data_fatura: novaFatura.data_fatura,
          mes: novaFatura.mes || null,
          tipo: novaFatura.tipo,
          valor_total: novaFatura.valor_total,
          estado_pagamento: novaFatura.estado_pagamento,
          centro_custo_id: novaFatura.centro_custo_id || undefined,
          observacoes: novaFatura.observacoes || undefined,
          origem_tipo: novaFatura.origem_tipo || null,
          origem_id: novaFatura.origem_id || null,
          oculta: novaFatura.oculta || false,
          items: novosItens.map((item) => ({
            descricao: item.descricao,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            imposto_percentual: item.imposto_percentual,
            total_linha: item.total_linha,
            produto_id: item.produto_id || undefined,
            centro_custo_id: item.centro_custo_id || undefined,
          })),
        });

        setFaturas((current) => [...(current || []), created]);
        if (created.items) {
          setFaturaItens((current) => [...(current || []), ...created.items!]);
        }
        setLancamentos((current) => [
          ...(current || []),
          {
            id: crypto.randomUUID(),
            data: formData.data_emissao,
            tipo: 'receita' as const,
            categoria: 'Fatura manual',
            descricao: `Fatura manual ${formData.tipo} - ${getUserName(formData.user_id)}`,
            valor: total,
            centro_custo_id: formData.centro_custo_id || undefined,
            user_id: formData.user_id,
            fatura_id: created.id,
            origem_tipo: formData.origem_tipo || 'manual',
            origem_id: formData.origem_id || undefined,
            metodo_pagamento: 'manual',
            created_at: new Date().toISOString(),
          },
        ]);

        toast.success('Fatura criada com sucesso');
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Erro ao gravar fatura na base de dados';
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
    setEditingFaturaId(null);
  };

  const handleEditarFatura = (faturaId: string) => {
    const fatura = (faturas || []).find((f) => f.id === faturaId);
    if (!fatura) return;

    const itens = (faturaItens || []).filter((item) => item.fatura_id === faturaId);

    setFormData({
      user_id: fatura.user_id,
      tipo: fatura.tipo,
      valor_total: fatura.valor_total,
      data_emissao: fatura.data_emissao,
      data_vencimento: fatura.data_vencimento,
      centro_custo_id: fatura.centro_custo_id || '',
      origem_tipo: fatura.origem_tipo || null,
      origem_id: fatura.origem_id || '',
      observacoes: fatura.observacoes || '',
    });

    if (itens.length > 0) {
      setLinhas(
        itens.map((item) => ({
          descricao: item.descricao,
          valor_unitario: item.valor_unitario,
          quantidade: item.quantidade,
          imposto_percentual: item.imposto_percentual,
          produto_id: item.produto_id || undefined,
        }))
      );
    }

    setEditingFaturaId(faturaId);
    setDialogOpen(true);
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

  const getUserName = (userId: string) => {
    const user = (users || []).find((u) => u.id === userId);
    return user ? user.nome_completo : 'Utilizador desconhecido';
  };

  const getCentroCustoName = (id?: string) => {
    if (!id) return '-';
    const cc = (centrosCusto || []).find((c) => c.id === id);
    return cc ? cc.nome : '-';
  };

  const getEstadoBadge = (estado: Fatura['estado_pagamento']) => {
    const variants = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      parcial: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={variants[estado]}>{estado.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="mostrar-futuras"
              checked={showFutureInvoices}
              onCheckedChange={(checked) => setShowFutureInvoices(checked === true)}
            />
            <Label htmlFor="mostrar-futuras" className="text-xs">
              Mostrar faturas futuras
            </Label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {selectedFaturas.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAbrirDialogoRecibo()}
                className="w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                <Check className="mr-1 sm:mr-2" size={16} />
                Liquidar ({selectedFaturas.size})
              </Button>
              <Button
                variant="destructive"
                onClick={handleAbrirDialogoDelete}
                className="w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                <Trash className="mr-1 sm:mr-2" size={16} />
                Apagar ({selectedFaturas.size})
              </Button>
            </>
          )}
          <Dialog open={dialogAutoOpen} onOpenChange={setDialogAutoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm" size="sm">
                <MagicWand className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Gerar Mensalidades</span>
                <span className="sm:hidden">Mensalidades</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Gerar Faturas Automaticas (Mensalidades)</DialogTitle>
                <DialogDescription>
                  Crie faturas de mensalidade automaticamente para os atletas do clube
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gerar-todos"
                    checked={gerarParaTodos}
                    onCheckedChange={(checked) => {
                      setGerarParaTodos(checked === true);
                      if (checked) {
                        setSelectedUserId('');
                      }
                    }}
                  />
                  <Label htmlFor="gerar-todos" className="cursor-pointer text-sm">
                    Gerar para todos os utilizadores com mensalidade
                  </Label>
                </div>

                {!gerarParaTodos && (
                  <div className="space-y-2">
                    <Label className="text-sm">Selecionar Utilizador</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolher utilizador" />
                      </SelectTrigger>
                      <SelectContent>
                        {(users || []).length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            Nenhum utilizador disponivel
                          </div>
                        ) : (
                          (users || []).map((user) => {
                            const temMensalidade = !!user.tipo_mensalidade;
                            const mensalidade = temMensalidade
                              ? (mensalidades || []).find((m) => m.id === user.tipo_mensalidade)
                              : null;

                            return (
                              <SelectItem key={user.id} value={user.id} disabled={!temMensalidade}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm">
                                    {user.nome_completo} - {user.numero_socio}
                                  </span>
                                  {temMensalidade && mensalidade && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (€{mensalidade.valor})
                                    </span>
                                  )}
                                  {!temMensalidade && (
                                    <span className="ml-2 text-xs text-muted-foreground">(sem mensalidade)</span>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {gerarParaTodos
                    ? 'Serao geradas faturas para todos os utilizadores desde o mes da inscricao ate julho seguinte.'
                    : 'Serao geradas faturas desde o mes da inscricao ate julho seguinte.'}
                </p>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogAutoOpen(false);
                    setGerarParaTodos(false);
                    setSelectedUserId('');
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button onClick={handleGerarFaturasMensais} className="w-full sm:w-auto">
                  Gerar Faturas
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto text-xs sm:text-sm" size="sm">
                <Plus className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Registo Manual</span>
                <span className="sm:hidden">Manual</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {editingFaturaId ? 'Editar Fatura' : 'Criar Fatura Manual'}
                </DialogTitle>
                <DialogDescription>
                  {editingFaturaId ? 'Altere os dados da fatura' : 'Registe manualmente uma fatura ou pagamento'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Utilizador *</Label>
                    <Select value={formData.user_id} onValueChange={(v) => setFormData({ ...formData, user_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
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

                  <div className="space-y-2">
                    <Label className="text-sm">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(v) =>
                        setFormData((current) => {
                          const tipo = v as Fatura['tipo'];
                          let origem = current.origem_tipo;

                          if (!origem || origem === 'manual') {
                            if (tipo === 'inscricao') origem = 'evento';
                            else if (tipo === 'material') origem = 'stock';
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
                        {invoiceTypeOptions.length === 0 ? (
                          <SelectItem value="outro">Outro</SelectItem>
                        ) : (
                          invoiceTypeOptions.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.codigo}>
                              {tipo.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Data Emissao</Label>
                    <Input
                      type="date"
                      value={formData.data_emissao}
                      onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Data Vencimento</Label>
                    <Input
                      type="date"
                      value={formData.data_vencimento}
                      onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm">Centro de Custo</Label>
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

                  <div className="space-y-2">
                    <Label className="text-sm">Origem</Label>
                    <Select
                      value={formData.origem_tipo || 'none'}
                      onValueChange={(v) =>
                        setFormData((current) => ({
                          ...current,
                          origem_tipo: v === 'none' ? null : (v as Fatura['origem_tipo']),
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
                      <Label className="text-sm">Referencia</Label>
                      <Input
                        value={formData.origem_id}
                        onChange={(e) => setFormData({ ...formData, origem_id: e.target.value })}
                        placeholder="ID ou referencia externa"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Linhas da Fatura</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addLinha} className="text-xs h-8">
                      <Plus size={14} className="mr-1" />
                      <span className="hidden sm:inline">Adicionar Linha</span>
                      <span className="sm:hidden">Adicionar</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {linhas.map((linha, index) => (
                      <Card key={index} className="p-3 sm:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-4 space-y-2">
                            <Label className="text-xs">Descricao</Label>
                            <Input
                              placeholder="Item"
                              value={linha.descricao}
                              onChange={(e) => updateLinha(index, 'descricao', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <Label className="text-xs">Valor Unit.</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={linha.valor_unitario}
                              onChange={(e) => updateLinha(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                              className="text-sm"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <Label className="text-xs">Qtd.</Label>
                            <Input
                              type="number"
                              min="1"
                              value={linha.quantidade}
                              onChange={(e) => updateLinha(index, 'quantidade', parseInt(e.target.value) || 1)}
                              className="text-sm"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <Label className="text-xs">IVA %</Label>
                            <Input
                              type="number"
                              min="0"
                              value={linha.imposto_percentual}
                              onChange={(e) => updateLinha(index, 'imposto_percentual', parseFloat(e.target.value) || 0)}
                              className="text-sm"
                            />
                          </div>
                          <div className="sm:col-span-1 space-y-2">
                            <Label className="text-xs">Total</Label>
                            <div className="text-sm font-medium pt-2">
                              €{(
                                linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100)
                              ).toFixed(2)}
                            </div>
                          </div>
                          <div className="sm:col-span-1 flex items-end sm:justify-end">
                            {linhas.length > 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeLinha(index)}
                                className="text-xs h-8"
                              >
                                <X size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Observacoes</Label>
                  <Textarea
                    placeholder="Notas adicionais"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
                  <span className="font-semibold text-sm sm:text-base">Total da Fatura:</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    €{linhas
                      .reduce(
                        (sum, l) => sum + l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleCriarFaturaManual} className="w-full sm:w-auto">
                  {editingFaturaId ? 'Guardar Alteracoes' : 'Criar Fatura'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedFaturas.size === filteredFaturas.length && filteredFaturas.length > 0}
                    onCheckedChange={handleToggleAllFaturas}
                  />
                </TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Emissao</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Centro Custo</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Nenhuma fatura encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredFaturas
                  .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime())
                  .map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFaturas.has(fatura.id)}
                          onCheckedChange={() => handleToggleFaturaSelection(fatura.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{getUserName(fatura.user_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getInvoiceTypeLabel(fatura.tipo)}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(fatura.data_emissao), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(fatura.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-semibold">€{toNumber(fatura.valor_total).toFixed(2)}</TableCell>
                      <TableCell>{getEstadoBadge(fatura.estado_pagamento)}</TableCell>
                      <TableCell className="text-sm">{getCentroCustoName(fatura.centro_custo_id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditarFatura(fatura.id)} title="Editar fatura">
                            <PencilSimple size={16} />
                          </Button>
                          {(fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') && (
                            <Button size="sm" variant="outline" onClick={() => handleAbrirDialogoRecibo(fatura.id)}>
                              <Check size={16} className="mr-1" />
                              Liquidar
                            </Button>
                          )}
                          {fatura.estado_pagamento === 'pago' && fatura.numero_recibo && (
                            <div className="text-xs text-muted-foreground">Recibo: {fatura.numero_recibo}</div>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteSingleFatura(fatura.id)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden divide-y">
          {filteredFaturas.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 px-4">Nenhuma fatura encontrada</div>
          ) : (
            filteredFaturas
              .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime())
              .map((fatura) => {
                const userName = getUserName(fatura.user_id);
                const nameParts = userName.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                const shortName = lastName ? `${firstName} ${lastName}` : firstName;

                return (
                  <div key={fatura.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedFaturas.has(fatura.id)} onCheckedChange={() => handleToggleFaturaSelection(fatura.id)} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{shortName}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {getEstadoBadge(fatura.estado_pagamento)}
                          <Badge variant="outline" className="text-xs">
                            {getInvoiceTypeLabel(fatura.tipo)}
                          </Badge>
                        </div>
                        <div className="text-sm font-semibold text-primary mt-1">€{toNumber(fatura.valor_total).toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditarFatura(fatura.id)}
                          className="h-8 w-8 p-0"
                        >
                          <PencilSimple size={16} />
                        </Button>
                        {(fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAbrirDialogoRecibo(fatura.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSingleFatura(fatura.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </Card>

      <Dialog open={dialogReciboOpen} onOpenChange={setDialogReciboOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {selectedFaturaId ? 'Liquidar Fatura' : `Liquidar ${selectedFaturas.size} Fatura(s)`}
            </DialogTitle>
            <DialogDescription>
              {selectedFaturaId
                ? 'Confirme o pagamento da fatura com o numero de recibo'
                : `Confirme o pagamento de ${selectedFaturas.size} fatura(s) com o mesmo numero de recibo`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero-recibo" className="text-sm">
                Numero do Recibo *
              </Label>
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
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {selectedFaturaId
                  ? 'Insira o numero do recibo para confirmar o pagamento desta fatura.'
                  : 'Este numero de recibo sera usado para todas as faturas selecionadas.'}
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogReciboOpen(false);
                setSelectedFaturaId(null);
                setNumeroRecibo('');
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmarLiquidacao} className="w-full sm:w-auto">
              <Check className="mr-2" size={16} />
              Confirmar Liquidacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Confirmar Eliminacao</DialogTitle>
            <DialogDescription>
              Esta acao e irreversivel. As faturas serao permanentemente removidas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem a certeza que deseja apagar {selectedFaturas.size} fatura(s)? Esta acao nao pode ser revertida.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogDeleteOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarDelete} className="w-full sm:w-auto">
              <Trash className="mr-2" size={16} />
              Confirmar Eliminacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
