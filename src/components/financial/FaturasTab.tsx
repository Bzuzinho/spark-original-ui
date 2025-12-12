import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Fatura, FaturaItem, User, Mensalidade, CentroCusto, Product, LancamentoFinanceiro } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Receipt, MagicWand, X, Check, Trash, PencilSimple } from '@phosphor-icons/react';
import { format, addMonths, isBefore, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

interface MonthlyFee {
  id: string;
  name: string;
  amount: number;
  ageGroupId: string;
}

export function FaturasTab() {
  const [faturas, setFaturas] = useKV<Fatura[]>('club-faturas', []);
  const [faturaItens, setFaturaItens] = useKV<FaturaItem[]>('club-fatura-itens', []);
  const [lancamentos, setLancamentos] = useKV<LancamentoFinanceiro[]>('club-lancamentos', []);
  const [users] = useKV<User[]>('club-users', []);
  const [mensalidadesLegacy] = useKV<Mensalidade[]>('club-mensalidades', []);
  const [mensalidadesConfig] = useKV<MonthlyFee[]>('settings-monthly-fees', []);
  const [centrosCusto] = useKV<CentroCusto[]>('club-centros-custo', []);
  const [products] = useKV<Product[]>('club-products', []);
  
  const mensalidades = mensalidadesConfig && mensalidadesConfig.length > 0 ? mensalidadesConfig : [];
  
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
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

  const [formData, setFormData] = useState({
    user_id: '',
    tipo: 'outro' as Fatura['tipo'],
    valor_total: 0,
    data_emissao: format(new Date(), 'yyyy-MM-dd'),
    data_vencimento: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
    centro_custo_id: '',
    observacoes: '',
  });

  const [linhas, setLinhas] = useState<Array<{
    descricao: string;
    valor_unitario: number;
    quantidade: number;
    imposto_percentual: number;
    produto_id?: string;
  }>>([{ descricao: '', valor_unitario: 0, quantidade: 1, imposto_percentual: 0 }]);

  const filteredFaturas = useMemo(() => {
    const now = new Date();
    return (faturas || []).filter(fatura => {
      if (fatura.tipo === 'mensalidade' && fatura.mes) {
        const [ano, mes] = fatura.mes.split('-').map(Number);
        const primeiroDiaMes = new Date(ano, mes - 1, 1);
        
        if (isAfter(primeiroDiaMes, now)) {
          return false;
        }
      }
      
      if (estadoFilter === 'all') return true;
      
      if (estadoFilter === 'vencido') {
        return (fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') && 
               isBefore(new Date(fatura.data_vencimento), now);
      }
      
      return fatura.estado_pagamento === estadoFilter;
    }).map(fatura => {
      const now = new Date();
      if ((fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') && 
          isBefore(new Date(fatura.data_vencimento), now)) {
        return { ...fatura, estado_pagamento: 'vencido' as const };
      }
      return fatura;
    });
  }, [faturas, estadoFilter]);

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
    const faturasParaLiquidar = selectedFaturaId 
      ? [selectedFaturaId] 
      : Array.from(selectedFaturas);

    if (faturasParaLiquidar.length === 0) return;

    if (!numeroRecibo.trim()) {
      toast.error('Por favor, insira o número do recibo');
      return;
    }

    setFaturas(current => 
      (current || []).map(f => {
        if (faturasParaLiquidar.includes(f.id)) {
          return { ...f, estado_pagamento: 'pago' as const, numero_recibo: numeroRecibo.trim() };
        }
        return f;
      })
    );

    const novosLancamentos: LancamentoFinanceiro[] = faturasParaLiquidar.map(faturaId => {
      const fatura = (faturas || []).find(f => f.id === faturaId);
      if (!fatura) return null;

      return {
        id: crypto.randomUUID(),
        data: new Date().toISOString().split('T')[0],
        tipo: 'receita' as const,
        categoria: 'Pagamento de Fatura',
        descricao: `Pagamento de fatura ${fatura.tipo} - ${getUserName(fatura.user_id)} - Recibo: ${numeroRecibo.trim()}`,
        valor: fatura.valor_total,
        centro_custo_id: fatura.centro_custo_id,
        user_id: fatura.user_id,
        fatura_id: faturaId,
        metodo_pagamento: 'dinheiro',
        created_at: new Date().toISOString(),
      };
    }).filter(Boolean) as LancamentoFinanceiro[];

    setLancamentos(current => [...(current || []), ...novosLancamentos]);
    
    toast.success(`${faturasParaLiquidar.length} fatura(s) liquidada(s) com recibo ${numeroRecibo.trim()}`);
    setDialogReciboOpen(false);
    setSelectedFaturaId(null);
    setSelectedFaturas(new Set());
    setNumeroRecibo('');
  };

  const handleToggleFaturaSelection = (faturaId: string) => {
    setSelectedFaturas(prev => {
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
      setSelectedFaturas(new Set(filteredFaturas.map(f => f.id)));
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
    
    setFaturas(current => (current || []).filter(f => !faturasParaApagar.includes(f.id)));
    setFaturaItens(current => (current || []).filter(item => !faturasParaApagar.includes(item.fatura_id)));
    
    toast.success(`${faturasParaApagar.length} fatura(s) apagada(s) com sucesso`);
    setDialogDeleteOpen(false);
    setSelectedFaturas(new Set());
  };

  const handleDeleteSingleFatura = (faturaId: string) => {
    setFaturas(current => (current || []).filter(f => f.id !== faturaId));
    setFaturaItens(current => (current || []).filter(item => item.fatura_id !== faturaId));
    toast.success('Fatura apagada com sucesso');
  };

  const gerarFaturasParaUtilizador = (userId: string) => {
    const user = (users || []).find(u => u.id === userId);
    if (!user || !user.tipo_mensalidade) {
      return { faturas: [], itens: [] };
    }

    const mensalidade = (mensalidades || []).find(m => m.id === user.tipo_mensalidade);
    if (!mensalidade) {
      return { faturas: [], itens: [] };
    }

    const hoje = new Date();
    const mesAtual = startOfMonth(hoje);
    const setembroProximoAno = new Date(hoje.getFullYear() + 1, 8, 1);

    let dataAtual = mesAtual;
    const novasFaturas: Fatura[] = [];
    const novosItens: FaturaItem[] = [];

    while (isBefore(dataAtual, setembroProximoAno) || dataAtual.getTime() === setembroProximoAno.getTime()) {
      const mesKey = format(dataAtual, 'yyyy-MM');
      const faturaExistente = (faturas || []).find(f => 
        f.user_id === userId && f.mes === mesKey
      );

      if (!faturaExistente) {
        const faturaId = crypto.randomUUID();
        const primeiroDiaMes = startOfMonth(dataAtual);
        const dataVencimento = addMonths(primeiroDiaMes, 0);
        dataVencimento.setDate(primeiroDiaMes.getDate() + 8);

        const novaFatura: Fatura = {
          id: faturaId,
          user_id: userId,
          data_fatura: format(primeiroDiaMes, 'yyyy-MM-dd'),
          mes: mesKey,
          data_emissao: format(hoje, 'yyyy-MM-dd'),
          data_vencimento: format(dataVencimento, 'yyyy-MM-dd'),
          valor_total: mensalidade.amount,
          estado_pagamento: 'pendente',
          centro_custo_id: user.centro_custo?.[0],
          tipo: 'mensalidade',
          created_at: new Date().toISOString(),
        };

        const novoItem: FaturaItem = {
          id: crypto.randomUUID(),
          fatura_id: faturaId,
          descricao: mensalidade.name,
          valor_unitario: mensalidade.amount,
          quantidade: 1,
          imposto_percentual: 0,
          total_linha: mensalidade.amount,
          centro_custo_id: user.centro_custo?.[0],
        };

        novasFaturas.push(novaFatura);
        novosItens.push(novoItem);
      }

      dataAtual = addMonths(dataAtual, 1);
    }

    return { faturas: novasFaturas, itens: novosItens };
  };

  const handleGerarFaturasMensais = async () => {
    if (!gerarParaTodos && !selectedUserId) {
      toast.error('Selecione um utilizador ou escolha gerar para todos');
      return;
    }

    let totalNovasFaturas = 0;
    const todasNovasFaturas: Fatura[] = [];
    const todosNovosItens: FaturaItem[] = [];

    if (gerarParaTodos) {
      const usuariosComMensalidade = (users || []).filter(u => u.tipo_mensalidade);
      
      if (usuariosComMensalidade.length === 0) {
        toast.error('Nenhum utilizador tem mensalidade configurada');
        return;
      }

      for (const user of usuariosComMensalidade) {
        const { faturas: novasFaturas, itens: novosItens } = gerarFaturasParaUtilizador(user.id);
        todasNovasFaturas.push(...novasFaturas);
        todosNovosItens.push(...novosItens);
      }

      totalNovasFaturas = todasNovasFaturas.length;
    } else {
      const { faturas: novasFaturas, itens: novosItens } = gerarFaturasParaUtilizador(selectedUserId);
      
      if (novasFaturas.length === 0) {
        const user = (users || []).find(u => u.id === selectedUserId);
        if (!user || !user.tipo_mensalidade) {
          toast.error('Utilizador não tem mensalidade configurada');
        } else {
          toast.info('Nenhuma fatura nova foi criada (todas já existem)');
        }
        return;
      }

      todasNovasFaturas.push(...novasFaturas);
      todosNovosItens.push(...novosItens);
      totalNovasFaturas = novasFaturas.length;
    }

    if (totalNovasFaturas > 0) {
      setFaturas(current => [...(current || []), ...todasNovasFaturas]);
      setFaturaItens(current => [...(current || []), ...todosNovosItens]);
      toast.success(`${totalNovasFaturas} fatura(s) gerada(s) com sucesso`);
      setDialogAutoOpen(false);
      setSelectedUserId('');
      setGerarParaTodos(false);
    } else {
      toast.info('Nenhuma fatura nova foi criada (todas já existem)');
    }
  };

  const handleCriarFaturaManual = () => {
    if (!formData.user_id) {
      toast.error('Selecione um utilizador');
      return;
    }

    if (linhas.every(l => !l.descricao || l.valor_unitario <= 0)) {
      toast.error('Adicione pelo menos uma linha válida');
      return;
    }

    if (editingFaturaId) {
      const linhasValidas = linhas.filter(l => l.descricao && l.valor_unitario > 0);
      const total = linhasValidas.reduce((sum, l) => sum + (l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100)), 0);

      const faturaAtualizada: Fatura = {
        ...(faturas || []).find(f => f.id === editingFaturaId)!,
        user_id: formData.user_id,
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        valor_total: total,
        centro_custo_id: formData.centro_custo_id || undefined,
        tipo: formData.tipo,
        observacoes: formData.observacoes || undefined,
      };

      setFaturas(current => 
        (current || []).map(f => f.id === editingFaturaId ? faturaAtualizada : f)
      );

      setFaturaItens(current => 
        (current || []).filter(item => item.fatura_id !== editingFaturaId)
      );

      const novosItens: FaturaItem[] = linhasValidas.map(linha => {
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

      setFaturaItens(current => [...(current || []), ...novosItens]);
      toast.success('Fatura atualizada com sucesso');
      setEditingFaturaId(null);
    } else {
      const faturaId = crypto.randomUUID();
      const linhasValidas = linhas.filter(l => l.descricao && l.valor_unitario > 0);
      const total = linhasValidas.reduce((sum, l) => sum + (l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100)), 0);

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
        observacoes: formData.observacoes || undefined,
        created_at: new Date().toISOString(),
      };

      const novosItens: FaturaItem[] = linhasValidas.map(linha => {
        const totalLinha = linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100);
        
        if (linha.produto_id) {
          const product = (products || []).find(p => p.id === linha.produto_id);
          if (product) {
            const novoStock = product.stock - linha.quantidade;
            const updatedProducts = (products || []).map(p => 
              p.id === linha.produto_id ? { ...p, stock: novoStock } : p
            );
            window.spark.kv.set('club-products', updatedProducts);
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

      setFaturas(current => [...(current || []), novaFatura]);
      setFaturaItens(current => [...(current || []), ...novosItens]);
      toast.success('Fatura criada com sucesso');
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
      observacoes: '',
    });
    setLinhas([{ descricao: '', valor_unitario: 0, quantidade: 1, imposto_percentual: 0 }]);
    setEditingFaturaId(null);
  };

  const handleEditarFatura = (faturaId: string) => {
    const fatura = (faturas || []).find(f => f.id === faturaId);
    if (!fatura) return;

    const itens = (faturaItens || []).filter(item => item.fatura_id === faturaId);

    setFormData({
      user_id: fatura.user_id,
      tipo: fatura.tipo,
      valor_total: fatura.valor_total,
      data_emissao: fatura.data_emissao,
      data_vencimento: fatura.data_vencimento,
      centro_custo_id: fatura.centro_custo_id || '',
      observacoes: fatura.observacoes || '',
    });

    if (itens.length > 0) {
      setLinhas(itens.map(item => ({
        descricao: item.descricao,
        valor_unitario: item.valor_unitario,
        quantidade: item.quantidade,
        imposto_percentual: item.imposto_percentual,
        produto_id: item.produto_id,
      })));
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
    const user = (users || []).find(u => u.id === userId);
    return user ? user.nome_completo : 'Utilizador desconhecido';
  };

  const getCentroCustoName = (id?: string) => {
    if (!id) return '-';
    const cc = (centrosCusto || []).find(c => c.id === id);
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
                <DialogTitle className="text-base sm:text-lg">Gerar Faturas Automáticas (Mensalidades)</DialogTitle>
                <DialogDescription>Crie faturas de mensalidade automaticamente para os atletas do clube</DialogDescription>
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
                            Nenhum utilizador disponível
                          </div>
                        ) : (
                          (users || []).map(user => {
                            const temMensalidade = !!user.tipo_mensalidade;
                            const mensalidade = temMensalidade 
                              ? (mensalidades || []).find(m => m.id === user.tipo_mensalidade)
                              : null;
                            
                            return (
                              <SelectItem 
                                key={user.id} 
                                value={user.id}
                                disabled={!temMensalidade}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm">{user.nome_completo} - {user.numero_socio}</span>
                                  {temMensalidade && mensalidade && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (€{mensalidade.amount})
                                    </span>
                                  )}
                                  {!temMensalidade && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (sem mensalidade)
                                    </span>
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
                    ? 'Serão geradas faturas para todos os utilizadores desde o mês atual até setembro do próximo ano.'
                    : 'Serão geradas faturas desde o mês atual até setembro do próximo ano.'}
                </p>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => {
                  setDialogAutoOpen(false);
                  setGerarParaTodos(false);
                  setSelectedUserId('');
                }} className="w-full sm:w-auto">
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
                <DialogTitle className="text-base sm:text-lg">{editingFaturaId ? 'Editar Fatura' : 'Criar Fatura Manual'}</DialogTitle>
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
                        {(users || []).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nome_completo} - {user.numero_socio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v as Fatura['tipo'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inscricao">Inscrição</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Data Emissão</Label>
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
                    <Select value={formData.centro_custo_id} onValueChange={(v) => setFormData({ ...formData, centro_custo_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {(centrosCusto || []).filter(cc => cc.ativo).map(cc => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                            <Label className="text-xs">Descrição</Label>
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
                              €{(linha.valor_unitario * linha.quantidade * (1 + linha.imposto_percentual / 100)).toFixed(2)}
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
                  <Label className="text-sm">Observações</Label>
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
                    €{linhas.reduce((sum, l) => sum + (l.valor_unitario * l.quantidade * (1 + l.imposto_percentual / 100)), 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleCriarFaturaManual} className="w-full sm:w-auto">
                  {editingFaturaId ? 'Guardar Alterações' : 'Criar Fatura'}
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
                <TableHead>Data Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Centro Custo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                  .map(fatura => (
                    <TableRow key={fatura.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedFaturas.has(fatura.id)}
                          onCheckedChange={() => handleToggleFaturaSelection(fatura.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{getUserName(fatura.user_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fatura.tipo}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(fatura.data_emissao), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(fatura.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-semibold">€{fatura.valor_total.toFixed(2)}</TableCell>
                      <TableCell>{getEstadoBadge(fatura.estado_pagamento)}</TableCell>
                      <TableCell className="text-sm">{getCentroCustoName(fatura.centro_custo_id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditarFatura(fatura.id)}
                            title="Editar fatura"
                          >
                            <PencilSimple size={16} />
                          </Button>
                          {(fatura.estado_pagamento === 'pendente' || fatura.estado_pagamento === 'vencido') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAbrirDialogoRecibo(fatura.id)}
                            >
                              <Check size={16} className="mr-1" />
                              Liquidar
                            </Button>
                          )}
                          {fatura.estado_pagamento === 'pago' && fatura.numero_recibo && (
                            <div className="text-xs text-muted-foreground">
                              Recibo: {fatura.numero_recibo}
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteSingleFatura(fatura.id)}
                          >
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
            <div className="text-center text-muted-foreground py-12 px-4">
              Nenhuma fatura encontrada
            </div>
          ) : (
            filteredFaturas
              .sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime())
              .map(fatura => {
                const userName = getUserName(fatura.user_id);
                const nameParts = userName.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                const shortName = lastName ? `${firstName} ${lastName}` : firstName;
                
                return (
                  <div key={fatura.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedFaturas.has(fatura.id)}
                        onCheckedChange={() => handleToggleFaturaSelection(fatura.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{shortName}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {getEstadoBadge(fatura.estado_pagamento)}
                          <Badge variant="outline" className="text-xs">{fatura.tipo}</Badge>
                        </div>
                        <div className="text-sm font-semibold text-primary mt-1">
                          €{fatura.valor_total.toFixed(2)}
                        </div>
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
              {selectedFaturaId 
                ? 'Liquidar Fatura' 
                : `Liquidar ${selectedFaturas.size} Fatura(s)`}
            </DialogTitle>
            <DialogDescription>
              {selectedFaturaId 
                ? 'Confirme o pagamento da fatura com o número de recibo' 
                : `Confirme o pagamento de ${selectedFaturas.size} fatura(s) com o mesmo número de recibo`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero-recibo" className="text-sm">Número do Recibo *</Label>
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
                  ? 'Insira o número do recibo para confirmar o pagamento desta fatura.'
                  : 'Este número de recibo será usado para todas as faturas selecionadas.'}
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
              Confirmar Liquidação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Confirmar Eliminação</DialogTitle>
            <DialogDescription>Esta ação é irreversível. As faturas serão permanentemente removidas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem a certeza que deseja apagar {selectedFaturas.size} fatura(s)? Esta ação não pode ser revertida.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDialogDeleteOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmarDelete}
              className="w-full sm:w-auto"
            >
              <Trash className="mr-2" size={16} />
              Confirmar Eliminação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
