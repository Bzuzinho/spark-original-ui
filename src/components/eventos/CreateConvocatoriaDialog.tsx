import { useState, useMemo, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Event, User, ConvocatoriaGrupo, ConvocatoriaAtleta, Movimento, MovimentoItem, EventoResultado, ResultadoProva, MovimentoConvocatoria, MovimentoConvocatoriaItem, EventoTipoConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, X, FileArrowDown, Users } from '@phosphor-icons/react';

interface Prova {
  id: string;
  name: string;
  distancia: number;
  unidade: 'metros' | 'quilometros';
  modalidade: string;
}

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

interface CreateConvocatoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingConvocatoria?: ConvocatoriaGrupo | null;
}

export function CreateConvocatoriaDialog({ open, onOpenChange, onSuccess, editingConvocatoria }: CreateConvocatoriaDialogProps) {
  const [events] = useKV<Event[]>('club-events', []);
  const [tiposEvento] = useKV<EventoTipoConfig[]>('club-eventos-tipos', []);
  const [convocatoriasGrupo, setConvocatoriasGrupo] = useKV<ConvocatoriaGrupo[]>('club-convocatorias-grupo', []);
  const [convocatoriasAtleta, setConvocatoriasAtleta] = useKV<ConvocatoriaAtleta[]>('club-convocatorias-atleta', []);
  const [movimentos, setMovimentos] = useKV<Movimento[]>('club-movimentos', []);
  const [movimentoItems, setMovimentoItems] = useKV<MovimentoItem[]>('club-movimento-itens', []);
  const [movimentosConvocatoria, setMovimentosConvocatoria] = useKV<MovimentoConvocatoria[]>('movimentos-convocatoria', []);
  const [resultados, setResultados] = useKV<EventoResultado[]>('club-resultados', []);
  const [resultadosProvas, setResultadosProvas] = useKV<ResultadoProva[]>('club-resultados-provas', []);
  const [currentUser] = useKV<User | null>('authenticated-user', null);
  const [clubInfo] = useKV<any>('settings-club-info', null);

  // Users disabled: club-users returns 500
  const users: any[] = [];
  
  // Provas disabled: settings-provas returns 500
  const provas: any[] = [];
  
  // Age groups disabled: settings-age-groups returns 500
  const ageGroups: any[] = [];

  const getEscalaoName = (escalaoId: string): string => {
    // Age group lookup disabled: settings-age-groups returns 500
    return escalaoId;
  };

  const [step, setStep] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEscalao, setSelectedEscalao] = useState<string>('todos');
  const [selectedAtletas, setSelectedAtletas] = useState<string[]>([]);
  const [atletasProvas, setAtletasProvas] = useState<Record<string, string[]>>({});
  const [horaEncontro, setHoraEncontro] = useState('');
  const [localEncontro, setLocalEncontro] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [centroCustoId, setCentroCustoId] = useState('');
  const [tipoCusto, setTipoCusto] = useState<'por_salto' | 'por_atleta'>('por_salto');
  const [valorPorSalto, setValorPorSalto] = useState('');
  const [valorPorEstafeta, setValorPorEstafeta] = useState('');
  const [valorInscricaoUnitaria, setValorInscricaoUnitaria] = useState('');

  const activeEvents = useMemo(() => {
    return (events || [])
      .filter(e => e.estado === 'agendado' && e.tipo === 'prova')
      .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
  }, [events]);

  const atletasAtivos = useMemo(() => {
    return (users || []).filter(u => 
      u.tipo_membro.includes('atleta') && 
      u.estado === 'ativo' &&
      u.ativo_desportivo
    );
  }, [users]);

  const escaloes = useMemo(() => {
    const escaloesSet = new Set<string>();
    atletasAtivos.forEach(atleta => {
      atleta.escalao?.forEach(e => escaloesSet.add(e));
    });
    return Array.from(escaloesSet).sort();
  }, [atletasAtivos]);

  const atletasFiltrados = useMemo(() => {
    if (selectedEscalao === 'todos') {
      return atletasAtivos;
    }
    return atletasAtivos.filter(atleta => 
      atleta.escalao?.includes(selectedEscalao)
    );
  }, [atletasAtivos, selectedEscalao]);

  const selectedEvent = useMemo(() => {
    const event = events?.find(e => e.id === selectedEventId);
    if (!event) return undefined;
    
    // Enrich event with tipoConfig info for gera_taxa detection
    const tipoConfig = tiposEvento?.find(t => t.nome === event.tipo);
    return {
      ...event,
      tipoConfig: tipoConfig,
    };
  }, [events, selectedEventId, tiposEvento]);

    const valorInscricaoCalculado = useMemo(() => {
    if (!selectedEvent) return 0;

    if (tipoCusto === 'por_atleta') {
      const valorUnitario = parseFloat(valorInscricaoUnitaria) || 0;
      return selectedAtletas.length * valorUnitario;
    }

    let totalCusto = 0;
      const taxaInscricao = selectedEvent.taxa_inscricao || 0;
      const custoProva = selectedEvent.custo_inscricao_por_prova || 0;
      const custoSalto = selectedEvent.custo_inscricao_por_salto || 0;
      const custoEstafeta = selectedEvent.custo_inscricao_estafeta || 0;

    selectedAtletas.forEach(atletaId => {
      const provasAtleta = atletasProvas[atletaId] || [];
      
      const provasNaoEstafetas = provasAtleta.filter(provaId => {
        const prova = provas?.find(p => p.id === provaId);
        return prova && !prova.name.toLowerCase().includes('estafeta');
      });
      
      const provasEstafetas = provasAtleta.filter(provaId => {
        const prova = provas?.find(p => p.id === provaId);
        return prova && prova.name.toLowerCase().includes('estafeta');
      });

      const numProvasNaoEstafetas = provasNaoEstafetas.length;
      const numEstafetas = provasEstafetas.length;

      const custoEstafetaPorAtleta = custoEstafeta * numEstafetas;
      const custoAtleta = taxaInscricao +
        (custoProva * numProvasNaoEstafetas) +
        (custoSalto * numProvasNaoEstafetas) +
        custoEstafetaPorAtleta;
      
      console.log(`[Cálculo Atleta ${atletaId}]`, {
        taxaInscricao,
        custoProva,
        custoSalto,
        numProvasNaoEstafetas,
        custoEstafeta,
        numEstafetas,
        custoEstafetaPorAtleta,
        custoAtleta
      });
      
      totalCusto += custoAtleta;
    });

    console.log('[Valor Total Calculado]', totalCusto);
    return totalCusto;
  }, [tipoCusto, atletasProvas, selectedAtletas, valorInscricaoUnitaria, selectedEvent, provas]);

  const loadConvocatoriaData = async (convocatoria: ConvocatoriaGrupo) => {
    setSelectedEventId(convocatoria.evento_id);
    setSelectedAtletas(convocatoria.atletas_ids);
    setHoraEncontro(convocatoria.hora_encontro || '');
    setLocalEncontro(convocatoria.local_encontro || '');
    setObservacoes(convocatoria.observacoes || '');
    setCentroCustoId(convocatoria.centro_custo_id || '');
    setTipoCusto(convocatoria.tipo_custo || 'por_salto');
    setValorPorSalto(convocatoria.valor_por_salto?.toString() || '');
    setValorPorEstafeta(convocatoria.valor_por_estafeta?.toString() || '');
    setValorInscricaoUnitaria(convocatoria.valor_inscricao_unitaria?.toString() || '');

    const atletasConvocados = (convocatoriasAtleta || []).filter(
      ca => ca.convocatoria_grupo_id === convocatoria.id
    );

    const provasMap: Record<string, string[]> = {};
    atletasConvocados.forEach(ca => {
      provasMap[ca.atleta_id] = ca.provas;
    });
    setAtletasProvas(provasMap);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    } else if (editingConvocatoria && open) {
      loadConvocatoriaData(editingConvocatoria);
    }
  }, [open, editingConvocatoria]);

  const resetForm = () => {
    setStep(1);
    setSelectedEventId('');
    setSelectedEscalao('todos');
    setSelectedAtletas([]);
    setAtletasProvas({});
    setHoraEncontro('');
    setLocalEncontro('');
    setObservacoes('');
    setCentroCustoId('');
    setTipoCusto('por_salto');
    setValorPorSalto('');
    setValorPorEstafeta('');
    setValorInscricaoUnitaria('');
  };

  const handleSelectAllAtletas = () => {
    setSelectedAtletas(atletasFiltrados.map(a => a.id));
  };

  const handleDeselectAllAtletas = () => {
    setSelectedAtletas([]);
  };

  const handleToggleAtleta = (atletaId: string) => {
    setSelectedAtletas(prev => 
      prev.includes(atletaId) 
        ? prev.filter(id => id !== atletaId)
        : [...prev, atletaId]
    );
  };

  const handleToggleProvaForAtleta = (atletaId: string, provaId: string) => {
    setAtletasProvas(prev => {
      const current = prev[atletaId] || [];
      const updated = current.includes(provaId)
        ? current.filter(id => id !== provaId)
        : [...current, provaId];
      return { ...prev, [atletaId]: updated };
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedEventId) {
        toast.error('Selecione um evento');
        return;
      }
      if (selectedAtletas.length === 0) {
        toast.error('Selecione pelo menos um atleta');
        return;
      }
    }

    if (step === 2) {
      const hasAtleastOneProva = selectedAtletas.some(id => 
        atletasProvas[id] && atletasProvas[id].length > 0
      );
      if (!hasAtleastOneProva) {
        toast.error('Atribua pelo menos uma prova a um atleta');
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const createMovimentosFinanceiros = async (
    convocatoriaId: string,
    atletasIds: string[],
    existingMovimentoId?: string
  ): Promise<string | undefined> => {
    if (!selectedEvent || !currentUser) {
      return undefined;
    }

    const taxaInscricao = selectedEvent.taxa_inscricao || 0;
    const custoProva = selectedEvent.custo_inscricao_por_prova || 0;
    const custoSalto = selectedEvent.custo_inscricao_por_salto || 0;
    const custoEstafeta = selectedEvent.custo_inscricao_estafeta || 0;

    const atletasParaProcessar = Array.from(new Set((atletasIds || []).filter(Boolean)));
    const movimentoItemsList: MovimentoItem[] = [];
    const movimentosConvocatoriaList: MovimentoConvocatoria[] = [];

    let valorTotalMovimento = 0;

    for (const atletaId of atletasParaProcessar) {
      const atleta = users?.find(u => u.id === atletaId);
      if (!atleta) continue;

      const provasAtleta = atletasProvas[atletaId] || [];
      if (provasAtleta.length === 0) continue;

      const provasNaoEstafetas = provasAtleta.filter(provaId => {
        const prova = provas?.find(p => p.id === provaId);
        return prova && !prova.name.toLowerCase().includes('estafeta');
      });

      const provasEstafetas = provasAtleta.filter(provaId => {
        const prova = provas?.find(p => p.id === provaId);
        return prova && prova.name.toLowerCase().includes('estafeta');
      });

      const numProvasNaoEstafetas = provasNaoEstafetas.length;
      const numEstafetas = provasEstafetas.length;

      const custoEstafetaPorAtleta = custoEstafeta * numEstafetas;
      const custoAtleta = taxaInscricao +
        (custoProva * numProvasNaoEstafetas) +
        (custoSalto * numProvasNaoEstafetas) +
        custoEstafetaPorAtleta;

      if (custoAtleta <= 0) continue;

      const detalhes: string[] = [];

      if (taxaInscricao > 0) {
        detalhes.push(`Taxa: €${taxaInscricao.toFixed(2)}`);
      }
      if (custoProva > 0 && numProvasNaoEstafetas > 0) {
        detalhes.push(`${numProvasNaoEstafetas}p × €${custoProva.toFixed(2)}`);
      }
      if (custoSalto > 0 && numProvasNaoEstafetas > 0) {
        detalhes.push(`${numProvasNaoEstafetas}s × €${custoSalto.toFixed(2)}`);
      }
      if (custoEstafeta > 0 && numEstafetas > 0) {
        detalhes.push(`${numEstafetas}e × €${custoEstafeta.toFixed(2)}`);
      }

      movimentoItemsList.push({
        id: crypto.randomUUID(),
        movimento_id: '',
        descricao: `${atleta.nome_completo} - ${selectedEvent.titulo}${detalhes.length > 0 ? ` (${detalhes.join(' + ')})` : ''}`,
        valor_unitario: custoAtleta,
        quantidade: 1,
        imposto_percentual: 0,
        total_linha: custoAtleta,
        centro_custo_id: centroCustoId || selectedEvent.centro_custo_id,
        created_at: new Date().toISOString(),
      });

      valorTotalMovimento += custoAtleta;

      const movimentoConvocatoriaItens: MovimentoConvocatoriaItem[] = [];
      if (taxaInscricao > 0) {
        movimentoConvocatoriaItens.push({
          id: crypto.randomUUID(),
          movimento_convocatoria_id: convocatoriaId,
          descricao: 'Taxa base de inscrição',
          valor: taxaInscricao,
        });
      }
      if (custoProva > 0 && numProvasNaoEstafetas > 0) {
        movimentoConvocatoriaItens.push({
          id: crypto.randomUUID(),
          movimento_convocatoria_id: convocatoriaId,
          descricao: `Inscrição em ${numProvasNaoEstafetas} prova${numProvasNaoEstafetas !== 1 ? 's' : ''} (€${custoProva.toFixed(2)} × ${numProvasNaoEstafetas})`,
          valor: custoProva * numProvasNaoEstafetas,
        });
      }
      if (custoSalto > 0 && numProvasNaoEstafetas > 0) {
        movimentoConvocatoriaItens.push({
          id: crypto.randomUUID(),
          movimento_convocatoria_id: convocatoriaId,
          descricao: `Inscrição em ${numProvasNaoEstafetas} salto${numProvasNaoEstafetas !== 1 ? 's' : ''} (€${custoSalto.toFixed(2)} × ${numProvasNaoEstafetas})`,
          valor: custoSalto * numProvasNaoEstafetas,
        });
      }
      if (custoEstafeta > 0 && numEstafetas > 0) {
        movimentoConvocatoriaItens.push({
          id: crypto.randomUUID(),
          movimento_convocatoria_id: convocatoriaId,
          descricao: `Inscrição em ${numEstafetas} estafeta${numEstafetas !== 1 ? 's' : ''} (€${custoEstafeta.toFixed(2)} × ${numEstafetas})`,
          valor: custoEstafetaPorAtleta,
        });
      }

      movimentosConvocatoriaList.push({
        id: crypto.randomUUID(),
        user_id: atletaId,
        convocatoria_grupo_id: convocatoriaId,
        evento_id: selectedEventId,
        evento_nome: selectedEvent.titulo,
        tipo: 'convocatoria',
        data_emissao: selectedEvent.data_inicio,
        valor: custoAtleta,
        itens: movimentoConvocatoriaItens,
        created_at: new Date().toISOString(),
      });
    }

    const movimentoId = existingMovimentoId || crypto.randomUUID();

    if (movimentoItemsList.length === 0) {
      if (existingMovimentoId) {
        await Promise.all([
          setMovimentos(current => (current || []).filter(m => m.id !== existingMovimentoId)),
          setMovimentoItems(current => (current || []).filter(item => item.movimento_id !== existingMovimentoId)),
          setMovimentosConvocatoria(current => (current || []).filter(mc => mc.convocatoria_grupo_id !== convocatoriaId)),
        ]);
      }

      return undefined;
    }

    // Determine movimento type based on event's gera_taxa
    const geraTexa = selectedEvent.tipoConfig?.gera_taxa ?? false;
    const movementType = geraTexa ? 'inscricao' : 'outro';

    const movimento: Movimento = {
      id: movimentoId,
      user_id: undefined,
      nome_manual: `Convocatória ${selectedEvent.titulo}`,
      classificacao: 'despesa',
      data_emissao: selectedEvent.data_inicio,
      data_vencimento: selectedEvent.data_inicio,
      valor_total: -Math.abs(valorTotalMovimento),
      estado_pagamento: 'pendente',
      centro_custo_id: centroCustoId || selectedEvent.centro_custo_id,
      tipo: movementType,
      observacoes: `Custos de inscrição - ${selectedEvent.titulo} (${movimentoItemsList.length} atleta${movimentoItemsList.length !== 1 ? 's' : ''})`,
      created_at: new Date().toISOString(),
    };

    movimentoItemsList.forEach(item => {
      item.movimento_id = movimentoId;
    });

    await Promise.all([
      setMovimentos(current => {
        const list = current || [];
        const exists = list.some(m => m.id === movimentoId);
        return exists
          ? list.map(m => (m.id === movimentoId ? movimento : m))
          : [...list, movimento];
      }),
      setMovimentoItems(current => [
        ...((current || []).filter(item => item.movimento_id !== movimentoId)),
        ...movimentoItemsList,
      ]),
      setMovimentosConvocatoria(current => [
        ...((current || []).filter(mc => mc.convocatoria_grupo_id !== convocatoriaId)),
        ...movimentosConvocatoriaList,
      ]),
    ]);

    return movimentoId;
  };

  const handleFinalize = async () => {
    if (!selectedEventId || !currentUser) {
      toast.error('Dados insuficientes');
      return;
    }

    const isEditing = !!editingConvocatoria;
    const convocatoriaId = isEditing ? editingConvocatoria.id : crypto.randomUUID();
    const oldAtletasIds = isEditing
      ? (convocatoriasAtleta || [])
          .filter(ca => ca.convocatoria_grupo_id === convocatoriaId)
          .map(ca => ca.atleta_id)
      : [];

    const movimentoId = await createMovimentosFinanceiros(
      convocatoriaId,
      selectedAtletas,
      editingConvocatoria?.movimento_id
    );
    const convocatoriaGrupo: ConvocatoriaGrupo = {
      id: convocatoriaId,
      evento_id: selectedEventId,
      data_criacao: isEditing ? editingConvocatoria.data_criacao : new Date().toISOString(),
      criado_por: isEditing ? editingConvocatoria.criado_por : currentUser.id,
      atletas_ids: selectedAtletas,
      hora_encontro: horaEncontro || undefined,
      local_encontro: localEncontro || undefined,
      observacoes: observacoes || undefined,
      centro_custo_id: centroCustoId || undefined,
      tipo_custo: tipoCusto,
      valor_por_salto: tipoCusto === 'por_salto' ? parseFloat(valorPorSalto) : undefined,
      valor_por_estafeta: tipoCusto === 'por_salto' ? parseFloat(valorPorEstafeta) : undefined,
      valor_inscricao_unitaria: tipoCusto === 'por_atleta' ? parseFloat(valorInscricaoUnitaria) : undefined,
      valor_inscricao_calculado: valorInscricaoCalculado,
      movimento_id: movimentoId,
    };

    const convocatoriasAtletaList: ConvocatoriaAtleta[] = selectedAtletas.map(atletaId => ({
      estafetas: (atletasProvas[atletaId] || []).filter(provaId => {
        const prova = provas?.find(p => p.id === provaId);
        return prova && prova.name.toLowerCase().includes('estafeta');
      }).length,
      convocatoria_grupo_id: convocatoriaId,
      atleta_id: atletaId,
      provas: atletasProvas[atletaId] || [],
      presente: true,
      confirmado: true,
    }));

    if (isEditing) {
      setConvocatoriasGrupo(current => 
        (current || []).map(c => c.id === convocatoriaId ? convocatoriaGrupo : c)
      );
      
      setConvocatoriasAtleta(current => [
        ...(current || []).filter(ca => ca.convocatoria_grupo_id !== convocatoriaId),
        ...convocatoriasAtletaList
      ]);
    } else {
      await Promise.all([
        setConvocatoriasGrupo(current => [...(current || []), convocatoriaGrupo]),
        setConvocatoriasAtleta(current => [...(current || []), ...convocatoriasAtletaList]),
      ]);
    }

    const resultadosList: EventoResultado[] = [];
    const resultadosProvasList: ResultadoProva[] = [];
    const currentYear = new Date().getFullYear();
    
    if (isEditing) {
      const atletasRemovidos = oldAtletasIds.filter(id => !selectedAtletas.includes(id));
      if (atletasRemovidos.length > 0) {
        setResultados(current =>
          (current || []).filter(
            r => !(r.evento_id === selectedEventId && atletasRemovidos.includes(r.user_id))
          )
        );
        setResultadosProvas(current =>
          (current || []).filter(
            r => !(r.evento_id === selectedEventId && atletasRemovidos.includes(r.atleta_id))
          )
        );
      }
    }
    
    selectedAtletas.forEach(atletaId => {
      const atletaProvasList = atletasProvas[atletaId] || [];
      const atleta = users?.find(u => u.id === atletaId);
      
      atletaProvasList.forEach(provaId => {
        const prova = provas?.find(p => p.id === provaId);
        if (prova) {
          const resultado: EventoResultado = {
            id: crypto.randomUUID(),
            evento_id: selectedEventId,
            user_id: atletaId,
            prova: prova.name,
            piscina: selectedEvent?.tipo_piscina === 'piscina_25m' ? '25m' : 
                     selectedEvent?.tipo_piscina === 'piscina_50m' ? '50m' : undefined,
            escalao: atleta?.escalao?.[0],
            epoca: `${currentYear}/${currentYear + 1}`,
            registado_por: currentUser.id,
            registado_em: new Date().toISOString(),
          };
          resultadosList.push(resultado);

          const resultadoProva: ResultadoProva = {
            id: crypto.randomUUID(),
            atleta_id: atletaId,
            evento_id: selectedEventId,
            prova: prova.name,
            local: selectedEvent?.local || '',
            data: selectedEvent?.data_inicio || new Date().toISOString(),
            piscina: selectedEvent?.tipo_piscina || 'piscina_25m',
            tempo_final: '',
            created_at: new Date().toISOString(),
          };
          resultadosProvasList.push(resultadoProva);
        }
      });
    });

    await Promise.all([
      setResultados(current => [...(current || []), ...resultadosList]),
      setResultadosProvas(current => [...(current || []), ...resultadosProvasList]),
    ]);

    // Garantir persistência explícita no KV
    const updatedConvocatoriasGrupo = isEditing 
      ? (convocatoriasGrupo || []).map(c => c.id === convocatoriaId ? convocatoriaGrupo : c)
      : [...(convocatoriasGrupo || []), convocatoriaGrupo];
    
    const updatedConvocatoriasAtleta = isEditing 
      ? [...(convocatoriasAtleta || []).filter(ca => ca.convocatoria_grupo_id !== convocatoriaId), ...convocatoriasAtletaList]
      : [...(convocatoriasAtleta || []), ...convocatoriasAtletaList];

    await Promise.all([
      window.spark.kv.set('club-convocatorias-grupo', updatedConvocatoriasGrupo),
      window.spark.kv.set('club-convocatorias-atleta', updatedConvocatoriasAtleta),
    ]);

    toast.success(isEditing 
      ? `Convocatória atualizada! ${resultadosList.length} provas atualizadas.`
      : `Convocatória criada! ${resultadosList.length} provas adicionadas aos atletas.`
    );
    onOpenChange(false);
    onSuccess();
  };

  const exportToPDF = () => {
    if (!selectedEvent || selectedAtletas.length === 0) {
      toast.error('Dados insuficientes para gerar PDF');
      return;
    }

    const clubName = clubInfo?.name || 'Clube';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const atletasHTML = selectedAtletas.map(atletaId => {
      const atleta = users?.find(u => u.id === atletaId);
      const atletaProvasList = (atletasProvas[atletaId] || [])
        .map(provaId => provas?.find(p => p.id === provaId)?.name)
        .filter(Boolean);
      
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${atleta?.nome_completo || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${atletaProvasList.join(', ') || '-'}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Convocatória - ${selectedEvent.titulo}</title>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header h2 {
              margin: 10px 0 0 0;
              font-size: 18px;
              color: #666;
              font-weight: normal;
            }
            .info-section {
              margin: 20px 0;
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
            }
            .info-row {
              margin: 8px 0;
            }
            .info-label {
              font-weight: 600;
              display: inline-block;
              width: 150px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #333;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${clubName}</h1>
            <h2>Convocatória</h2>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Evento:</span>
              <span>${selectedEvent.titulo}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data:</span>
              <span>${new Date(selectedEvent.data_inicio).toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            ${selectedEvent.hora_inicio ? `
              <div class="info-row">
                <span class="info-label">Hora:</span>
                <span>${selectedEvent.hora_inicio}</span>
              </div>
            ` : ''}
            ${selectedEvent.local ? `
              <div class="info-row">
                <span class="info-label">Local:</span>
                <span>${selectedEvent.local}</span>
              </div>
            ` : ''}
            ${horaEncontro ? `
              <div class="info-row">
                <span class="info-label">Hora de Encontro:</span>
                <span>${horaEncontro}</span>
              </div>
            ` : ''}
            ${localEncontro ? `
              <div class="info-row">
                <span class="info-label">Local de Encontro:</span>
                <span>${localEncontro}</span>
              </div>
            ` : ''}
          </div>

          ${observacoes ? `
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Observações:</span>
              </div>
              <div style="margin-top: 8px;">${observacoes}</div>
            </div>
          ` : ''}

          <h3>Lista de Atletas Convocados</h3>
          <table>
            <thead>
              <tr>
                <th>Atleta</th>
                <th>Provas</th>
              </tr>
            </thead>
            <tbody>
              ${atletasHTML}
            </tbody>
          </table>

          <div class="footer">
            <p>Gerado em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingConvocatoria ? 'Editar Convocatória' : 'Nova Convocatória'} - Passo {step} de 4
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Selecione o evento e os atletas a convocar'}
            {step === 2 && 'Atribua as provas a cada atleta'}
            {step === 3 && 'Defina os custos e informações logísticas'}
            {step === 4 && 'Reveja e confirme a convocatória'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evento">Evento *</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger id="evento">
                    <SelectValue placeholder="Selecionar evento agendado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEvents.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.titulo} - {new Date(event.data_inicio).toLocaleDateString('pt-PT')}
                        {event.tipo_piscina && ` - ${event.tipo_piscina.replace(/_/g, ' ')}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Filtrar por Escalão</Label>
                <Select value={selectedEscalao} onValueChange={setSelectedEscalao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os escalões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os escalões</SelectItem>
                    {escaloes.map(escalaoId => (
                      <SelectItem key={escalaoId} value={escalaoId}>
                        {getEscalaoName(escalaoId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="centro-custo">Centro de Custos</Label>
                <Input
                  id="centro-custo"
                  value={centroCustoId}
                  onChange={(e) => setCentroCustoId(e.target.value)}
                  placeholder="Digite o centro de custos (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label>Selecionar Atletas ({selectedAtletas.length} selecionados)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllAtletas}
                  >
                    Selecionar Todos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAllAtletas}
                  >
                    Desseleccionar Todos
                  </Button>
                </div>

                <ScrollArea className="h-[400px] border rounded-lg p-3">
                  <div className="space-y-1">
                    {atletasFiltrados.map(atleta => (
                      <div
                        key={atleta.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                        onClick={() => handleToggleAtleta(atleta.id)}
                      >
                        <Checkbox
                          checked={selectedAtletas.includes(atleta.id)}
                          onCheckedChange={() => handleToggleAtleta(atleta.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{atleta.nome_completo}</span>
                            <div className="flex gap-1">
                              {atleta.escalao?.map(escalaoId => (
                                <Badge key={escalaoId} variant="outline" className="text-xs">
                                  {getEscalaoName(escalaoId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{atleta.numero_socio}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">
                  <Users className="inline mr-2" size={16} />
                  {selectedAtletas.length} atletas selecionados
                </p>
                <p className="text-xs text-muted-foreground">
                  Selecione as provas que cada atleta irá realizar
                </p>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {selectedAtletas.map(atletaId => {
                    const atleta = users?.find(u => u.id === atletaId);
                    if (!atleta) return null;

                    return (
                      <Card key={atletaId} className="p-4">
                        <h4 className="font-semibold text-sm mb-3">{atleta.nome_completo}</h4>
                        <div className="space-y-2">
                          {(provas || []).map(prova => (
                            <div
                              key={prova.id}
                              className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                              onClick={() => handleToggleProvaForAtleta(atletaId, prova.id)}
                            >
                              <Checkbox
                                checked={(atletasProvas[atletaId] || []).includes(prova.id)}
                                onCheckedChange={() => handleToggleProvaForAtleta(atletaId, prova.id)}
                              />
                              <Label className="flex-1 cursor-pointer">
                                {prova.name} - {prova.distancia} {prova.unidade}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            {(atletasProvas[atletaId] || []).length} prova(s) selecionada(s)
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Card className="p-3 bg-primary/5">
                <h4 className="font-semibold text-xs mb-2">Custos do Evento</h4>
                <div className="space-y-1 text-xs">
                  {selectedEvent?.custo_inscricao_por_prova && selectedEvent.custo_inscricao_por_prova > 0 && (
                    <div className="flex justify-between">
                      <span>Custo por Prova:</span>
                      <span className="font-medium">€{selectedEvent.custo_inscricao_por_prova.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedEvent?.custo_inscricao_por_salto && selectedEvent.custo_inscricao_por_salto > 0 && (
                    <div className="flex justify-between">
                      <span>Custo por Salto:</span>
                      <span className="font-medium">€{selectedEvent.custo_inscricao_por_salto.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedEvent?.custo_inscricao_estafeta && selectedEvent.custo_inscricao_estafeta > 0 && (
                    <div className="flex justify-between">
                      <span>Custo de Estafeta:</span>
                      <span className="font-medium">€{selectedEvent.custo_inscricao_estafeta.toFixed(2)}</span>
                    </div>
                  )}
                  {(!selectedEvent?.custo_inscricao_por_prova && !selectedEvent?.custo_inscricao_por_salto && !selectedEvent?.custo_inscricao_estafeta) && (
                    <p className="text-muted-foreground text-center py-1">
                      Nenhum custo definido
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-3 bg-primary/5">
                <h4 className="font-semibold text-xs mb-2">Cálculo das Taxas de Inscrição</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Total de Atletas:</span>
                    <span className="font-medium">{selectedAtletas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Provas:</span>
                    <span className="font-medium">
                      {Object.values(atletasProvas).reduce((acc, provas) => acc + provas.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nº de Estafetas:</span>
                    <span className="font-medium">
                      {selectedAtletas.reduce((total, atletaId) => {
                        const provasAtleta = atletasProvas[atletaId] || [];
                        const numEstafetas = provasAtleta.filter(provaId => {
                          const prova = provas?.find(p => p.id === provaId);
                          return prova && prova.name.toLowerCase().includes('estafeta');
                        }).length;
                        return total + numEstafetas;
                      }, 0)}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold text-sm">
                    <span>Valor Total:</span>
                    <span className="text-primary">€{valorInscricaoCalculado.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Movimentos individuais serão criados para cada atleta
                  </p>
                </div>
              </Card>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="hora-encontro" className="text-sm">Hora de Encontro</Label>
                <Input
                  id="hora-encontro"
                  type="time"
                  value={horaEncontro}
                  onChange={(e) => setHoraEncontro(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="local-encontro" className="text-sm">Local de Encontro</Label>
                <Input
                  id="local-encontro"
                  value={localEncontro}
                  onChange={(e) => setLocalEncontro(e.target.value)}
                  placeholder="Ex: Sede do Clube"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Resumo da Convocatória</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Evento:</span>
                    <p className="font-medium">{selectedEvent?.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedEvent && new Date(selectedEvent.data_inicio).toLocaleDateString('pt-PT')}
                      {selectedEvent?.hora_inicio && ` às ${selectedEvent.hora_inicio}`}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-muted-foreground">Atletas Convocados:</span>
                    <p className="font-medium">{selectedAtletas.length} atletas</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Total de Provas:</span>
                    <p className="font-medium">
                      {Object.values(atletasProvas).reduce((acc, provas) => acc + provas.length, 0)} provas
                    </p>
                  </div>

                  {horaEncontro && (
                    <div>
                      <span className="text-muted-foreground">Hora de Encontro:</span>
                      <p className="font-medium">{horaEncontro}</p>
                    </div>
                  )}

                  {localEncontro && (
                    <div>
                      <span className="text-muted-foreground">Local de Encontro:</span>
                      <p className="font-medium">{localEncontro}</p>
                    </div>
                  )}

                  {tipoCusto === 'por_salto' && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground">Custos do Evento:</span>
                        {selectedEvent?.custo_inscricao_por_prova && selectedEvent.custo_inscricao_por_prova > 0 && (
                          <p className="text-sm">Custo por Prova: €{selectedEvent.custo_inscricao_por_prova.toFixed(2)}</p>
                        )}
                        {selectedEvent?.custo_inscricao_por_salto && selectedEvent.custo_inscricao_por_salto > 0 && (
                          <p className="text-sm">Custo por Salto: €{selectedEvent.custo_inscricao_por_salto.toFixed(2)}</p>
                        )}
                        {selectedEvent?.custo_inscricao_estafeta && selectedEvent.custo_inscricao_estafeta > 0 && (
                          <p className="text-sm">Custo de Estafeta: €{selectedEvent.custo_inscricao_estafeta.toFixed(2)}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taxa de Inscrição Total:</span>
                        <p className="font-semibold text-lg text-primary">€{valorInscricaoCalculado.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Movimentos individuais serão criados para cada atleta</p>
                      </div>
                    </>
                  )}

                  {tipoCusto === 'por_atleta' && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground">Custos do Evento:</span>
                        {selectedEvent?.custo_inscricao_por_prova && selectedEvent.custo_inscricao_por_prova > 0 && (
                          <p className="text-sm">Custo por Prova: €{selectedEvent.custo_inscricao_por_prova.toFixed(2)}</p>
                        )}
                        {selectedEvent?.custo_inscricao_por_salto && selectedEvent.custo_inscricao_por_salto > 0 && (
                          <p className="text-sm">Custo por Salto: €{selectedEvent.custo_inscricao_por_salto.toFixed(2)}</p>
                        )}
                        {selectedEvent?.custo_inscricao_estafeta && selectedEvent.custo_inscricao_estafeta > 0 && (
                          <p className="text-sm">Custo de Estafeta: €{selectedEvent.custo_inscricao_estafeta.toFixed(2)}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taxa de Inscrição Total:</span>
                        <p className="font-semibold text-lg text-primary">€{valorInscricaoCalculado.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Movimentos individuais serão criados para cada atleta</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-3">Lista de Atletas e Provas</h4>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Atleta</TableHead>
                        <TableHead>Provas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedAtletas.map(atletaId => {
                        const atleta = users?.find(u => u.id === atletaId);
                        if (!atleta) return null;

                        const atletaProvasList = (atletasProvas[atletaId] || [])
                          .map(provaId => provas?.find(p => p.id === provaId)?.name)
                          .filter(Boolean);

                        return (
                          <TableRow key={atletaId}>
                            <TableCell className="font-medium">{atleta.nome_completo}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {atletaProvasList.map((provaName, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {provaName}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevStep}>
                Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 ? (
              <Button onClick={handleNextStep}>
                Próximo
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={exportToPDF}>
                  <FileArrowDown className="mr-2" size={16} />
                  Exportar PDF
                </Button>
                <Button onClick={handleFinalize}>
                  {editingConvocatoria ? 'Atualizar Convocatória' : 'Criar Convocatória'}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
