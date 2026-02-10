import { useState, useMemo, type ChangeEvent } from 'react';
import { ExtratoBancario, LancamentoFinanceiro, Fatura, CentroCusto, User } from './types';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { Plus, ArrowsLeftRight, Check, Bank, PencilSimple, X, FileArrowUp, Gear, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ScrollArea } from '@/Components/ui/scroll-area';

interface BancoTabProps {
  extratos: ExtratoBancario[];
  setExtratos: React.Dispatch<React.SetStateAction<ExtratoBancario[]>>;
  lancamentos: LancamentoFinanceiro[];
  setLancamentos: React.Dispatch<React.SetStateAction<LancamentoFinanceiro[]>>;
  faturas: Fatura[];
  setFaturas: React.Dispatch<React.SetStateAction<Fatura[]>>;
  centrosCusto: CentroCusto[];
  users: User[];
}

export function BancoTab({
  extratos,
  setExtratos,
  lancamentos,
  setLancamentos,
  faturas,
  setFaturas,
  centrosCusto,
  users,
}: BancoTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCatalogOpen, setDialogCatalogOpen] = useState(false);
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [dialogImportOpen, setDialogImportOpen] = useState(false);
  const [dialogMappingOpen, setDialogMappingOpen] = useState(false);
  const [selectedExtrato, setSelectedExtrato] = useState<ExtratoBancario | null>(null);
  const [editingExtrato, setEditingExtrato] = useState<ExtratoBancario | null>(null);
  const [conciliadoFilter, setConciliadoFilter] = useState<string>('all');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importCentroCusto, setImportCentroCusto] = useState<string>('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{
    data: string;
    descricao: string;
    valor: string;
    saldo: string;
    conta: string;
    referencia: string;
  }>({
    data: '',
    descricao: '',
    valor: '',
    saldo: '',
    conta: '',
    referencia: '',
  });

  const [formData, setFormData] = useState({
    data_movimento: format(new Date(), 'yyyy-MM-dd'),
    descricao: '',
    valor: 0,
    saldo: 0,
    referencia: '',
    centro_custo_id: '',
  });

  const [catalogData, setCatalogData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    centro_custo_id: '',
    fatura_id: '',
    user_id: '',
  });

  const filteredExtratos = useMemo(() => {
    return (extratos || []).filter((extrato) => {
      if (conciliadoFilter === 'all') return true;
      if (conciliadoFilter === 'conciliado') return extrato.conciliado;
      if (conciliadoFilter === 'nao-conciliado') return !extrato.conciliado;
      return true;
    });
  }, [extratos, conciliadoFilter]);

  const sugestoesAutomaticas = useMemo(() => {
    if (!selectedExtrato) return [];

    const descricaoLower = selectedExtrato.descricao.toLowerCase();
    const sugestoes: Array<{ tipo: 'fatura' | 'user'; data: any; score: number }> = [];

    (faturas || []).forEach((fatura) => {
      const user = (users || []).find((u) => u.id === fatura.user_id);
      if (!user) return;

      const nomeLower = user.nome_completo.toLowerCase();
      let score = 0;

      if (descricaoLower.includes(nomeLower)) score += 50;
      if (descricaoLower.includes(user.numero_socio.toLowerCase())) score += 40;
      if (Math.abs(fatura.valor_total - Math.abs(selectedExtrato.valor)) < 0.01) score += 30;

      if (score > 0) {
        sugestoes.push({ tipo: 'fatura', data: { fatura, user }, score });
      }
    });

    (users || []).forEach((user) => {
      const nomeLower = user.nome_completo.toLowerCase();
      let score = 0;

      if (descricaoLower.includes(nomeLower)) score += 40;
      if (descricaoLower.includes(user.numero_socio.toLowerCase())) score += 35;

      if (score > 0) {
        sugestoes.push({ tipo: 'user', data: user, score });
      }
    });

    return sugestoes.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [selectedExtrato, faturas, users]);

  const handleAddExtrato = () => {
    if (!formData.descricao || formData.valor === 0) {
      toast.error('Preencha todos os campos obrigatorios');
      return;
    }

    if (!formData.centro_custo_id) {
      toast.error('Selecione um centro de custo');
      return;
    }

    const novoExtrato: ExtratoBancario = {
      id: crypto.randomUUID(),
      conta: '',
      data_movimento: formData.data_movimento,
      descricao: formData.descricao,
      valor: formData.valor,
      saldo: formData.saldo,
      referencia: formData.referencia || undefined,
      centro_custo_id: formData.centro_custo_id,
      conciliado: false,
      created_at: new Date().toISOString(),
    };

    setExtratos((current) => [...(current || []), novoExtrato]);
    toast.success('Movimento bancario adicionado');
    setDialogOpen(false);
    resetForm();
  };

  const handleCatalogar = () => {
    if (!selectedExtrato) return;

    if (!catalogData.centro_custo_id) {
      toast.error('Selecione um centro de custo');
      return;
    }

    const novoLancamento: LancamentoFinanceiro = {
      id: crypto.randomUUID(),
      data: selectedExtrato.data_movimento,
      descricao: selectedExtrato.descricao,
      tipo: catalogData.tipo,
      valor: Math.abs(selectedExtrato.valor),
      metodo_pagamento: 'transferencia',
      user_id: catalogData.user_id || undefined,
      centro_custo_id: catalogData.centro_custo_id,
      fatura_id: catalogData.fatura_id || undefined,
      created_at: new Date().toISOString(),
    };

    setLancamentos((current) => [...(current || []), novoLancamento]);

    setExtratos((current) =>
      (current || []).map((e) =>
        e.id === selectedExtrato.id ? { ...e, conciliado: true, lancamento_id: novoLancamento.id } : e
      )
    );

    if (catalogData.fatura_id) {
      setFaturas((current) =>
        (current || []).map((f) => (f.id === catalogData.fatura_id ? { ...f, estado_pagamento: 'pago' as const } : f))
      );
    }

    toast.success('Movimento catalogado e conciliado');
    setDialogCatalogOpen(false);
    setSelectedExtrato(null);
    resetCatalogData();
  };

  const resetForm = () => {
    setFormData({
      data_movimento: format(new Date(), 'yyyy-MM-dd'),
      descricao: '',
      valor: 0,
      saldo: 0,
      referencia: '',
      centro_custo_id: '',
    });
  };

  const resetCatalogData = () => {
    setCatalogData({
      tipo: 'receita',
      centro_custo_id: '',
      fatura_id: '',
      user_id: '',
    });
  };

  const handleEditExtrato = () => {
    if (!editingExtrato) return;

    if (!formData.descricao || formData.valor === 0) {
      toast.error('Preencha todos os campos obrigatorios');
      return;
    }

    if (!formData.centro_custo_id) {
      toast.error('Selecione um centro de custo');
      return;
    }

    setExtratos((current) =>
      (current || []).map((e) =>
        e.id === editingExtrato.id
          ? {
              ...e,
              conta: '',
              data_movimento: formData.data_movimento,
              descricao: formData.descricao,
              valor: formData.valor,
              saldo: formData.saldo,
              referencia: formData.referencia || undefined,
              centro_custo_id: formData.centro_custo_id,
            }
          : e
      )
    );

    toast.success('Movimento atualizado com sucesso');
    setDialogEditOpen(false);
    setEditingExtrato(null);
    resetForm();
  };

  const openEditDialog = (extrato: ExtratoBancario) => {
    setEditingExtrato(extrato);
    setFormData({
      data_movimento: extrato.data_movimento,
      descricao: extrato.descricao,
      valor: extrato.valor,
      saldo: extrato.saldo || 0,
      referencia: extrato.referencia || '',
      centro_custo_id: extrato.centro_custo_id || '',
    });
    setDialogEditOpen(true);
  };

  const handleDesconciliar = (extrato: ExtratoBancario) => {
    setExtratos((current) =>
      (current || []).map((e) => (e.id === extrato.id ? { ...e, conciliado: false, lancamento_id: undefined } : e))
    );

    if (extrato.lancamento_id) {
      setLancamentos((current) => (current || []).filter((l) => l.id !== extrato.lancamento_id));
    }

    toast.success('Movimento desconciliado com sucesso');
  };

  const handleDeleteExtrato = (extrato: ExtratoBancario) => {
    if (extrato.conciliado) {
      toast.error('Nao e possivel apagar um movimento conciliado. Desconcilie primeiro.');
      return;
    }

    setExtratos((current) => (current || []).filter((e) => e.id !== extrato.id));

    toast.success('Movimento apagado com sucesso');
  };

  const getCentroCustoName = (id?: string) => {
    if (!id) return '-';
    const cc = (centrosCusto || []).find((c) => c.id === id);
    return cc ? cc.nome : '-';
  };

  const totalConciliado = useMemo(() => {
    return (extratos || []).filter((e) => e.conciliado).reduce((sum, e) => sum + e.valor, 0);
  }, [extratos]);

  const totalNaoConciliado = useMemo(() => {
    return (extratos || []).filter((e) => !e.conciliado).reduce((sum, e) => sum + e.valor, 0);
  }, [extratos]);

  const saldoConta = useMemo(() => {
    const extratosOrdenados = [...(extratos || [])].sort(
      (a, b) => new Date(a.data_movimento).getTime() - new Date(b.data_movimento).getTime()
    );

    if (extratosOrdenados.length === 0) return 0;

    const ultimoExtrato = extratosOrdenados[extratosOrdenados.length - 1];
    if (ultimoExtrato.saldo !== undefined && ultimoExtrato.saldo !== 0) {
      return ultimoExtrato.saldo;
    }

    return (extratos || []).reduce((sum, e) => sum + e.valor, 0);
  }, [extratos]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/csv',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx|ods|csv)$/i)) {
      toast.error('Formato de ficheiro nao suportado. Use XLS, XLSX, ODS ou CSV');
      return;
    }

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const preview = jsonData.slice(0, 6);
        setImportPreview(preview);

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          setAvailableColumns(headers.filter((h) => h && h.toString().trim()));
        }
      } catch (error) {
        toast.error('Erro ao ler o ficheiro');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (!importFile) {
      toast.error('Selecione um ficheiro para importar');
      return;
    }

    if (!importCentroCusto) {
      toast.error('Selecione um centro de custo');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          toast.error('O ficheiro esta vazio');
          return;
        }

        const novosExtratos: ExtratoBancario[] = [];
        let importedCount = 0;
        let errorCount = 0;

        jsonData.forEach((row, index) => {
          try {
            const getColumnValue = (
              field: 'data' | 'descricao' | 'valor' | 'saldo' | 'conta' | 'referencia'
            ) => {
              const mappedColumn = columnMapping?.[field];
              if (mappedColumn && mappedColumn !== '__auto__' && mappedColumn !== '' && row[mappedColumn]) {
                return row[mappedColumn];
              }

              const defaultColumns: Record<string, string[]> = {
                data: ['Data', 'data', 'DATE', 'Data Movimento', 'Data Mov'],
                descricao: ['Descricao', 'descricao', 'DESCRIPTION', 'Descricao', 'Historico'],
                valor: ['Valor', 'valor', 'VALUE', 'Montante', 'montante', 'Debito/Credito'],
                saldo: ['Saldo', 'saldo', 'BALANCE'],
                conta: ['Conta', 'conta', 'NIB', 'nib'],
                referencia: ['Referencia', 'referencia', 'REFERENCE', 'Ref'],
              };

              const possibleColumns = defaultColumns[field] || [];
              for (const col of possibleColumns) {
                if (row[col] !== undefined) {
                  return row[col];
                }
              }
              return null;
            };

            const data_movimento = getColumnValue('data');
            const descricao = getColumnValue('descricao');
            const valor = getColumnValue('valor');
            const saldo = getColumnValue('saldo');
            const conta = getColumnValue('conta');
            const referencia = getColumnValue('referencia');

            if (!descricao) {
              errorCount++;
              return;
            }

            let parsedValor = 0;
            if (typeof valor === 'number') {
              parsedValor = valor;
            } else if (typeof valor === 'string') {
              parsedValor = parseFloat(valor.replace(/[^\d.,-]/g, '').replace(',', '.'));
            }

            let parsedSaldo = 0;
            if (typeof saldo === 'number') {
              parsedSaldo = saldo;
            } else if (typeof saldo === 'string') {
              parsedSaldo = parseFloat(saldo.replace(/[^\d.,-]/g, '').replace(',', '.'));
            }

            let parsedData = format(new Date(), 'yyyy-MM-dd');
            if (data_movimento) {
              try {
                if (typeof data_movimento === 'number') {
                  const excelDate = new Date((data_movimento - 25569) * 86400 * 1000);
                  parsedData = format(excelDate, 'yyyy-MM-dd');
                } else {
                  const dateObj = new Date(data_movimento);
                  if (!isNaN(dateObj.getTime())) {
                    parsedData = format(dateObj, 'yyyy-MM-dd');
                  }
                }
              } catch (e) {
                console.error('Error parsing date:', e);
              }
            }

            const novoExtrato: ExtratoBancario = {
              id: crypto.randomUUID(),
              conta: conta?.toString() || '',
              data_movimento: parsedData,
              descricao: descricao.toString(),
              valor: parsedValor,
              saldo: parsedSaldo,
              referencia: referencia?.toString(),
              centro_custo_id: importCentroCusto,
              conciliado: false,
              created_at: new Date().toISOString(),
            };

            novosExtratos.push(novoExtrato);
            importedCount++;
          } catch (error) {
            console.error(`Error processing row ${index}:`, error);
            errorCount++;
          }
        });

        if (novosExtratos.length > 0) {
          setExtratos((current) => [...(current || []), ...novosExtratos]);
          toast.success(
            `${importedCount} movimentos importados com sucesso${
              errorCount > 0 ? ` (${errorCount} erros)` : ''
            }`
          );
          setDialogImportOpen(false);
          resetImportData();
        } else {
          toast.error('Nenhum movimento valido encontrado no ficheiro');
        }
      } catch (error) {
        toast.error('Erro ao processar o ficheiro');
        console.error(error);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  const resetImportData = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportCentroCusto('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 items-center">
          <Select value={conciliadoFilter} onValueChange={setConciliadoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="conciliado">Conciliados</SelectItem>
              <SelectItem value="nao-conciliado">Nao Conciliados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Dialog open={dialogImportOpen} onOpenChange={setDialogImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetImportData}>
                <FileArrowUp className="mr-2" />
                Importar Extrato XLS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Importar Extrato Bancario</DialogTitle>
                <DialogDescription>
                  Importe movimentos bancarios a partir de um ficheiro Excel, ODS ou CSV
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ficheiro do Extrato (XLS, XLSX, CSV) *</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".xls,.xlsx,.ods,.csv" onChange={handleFileSelect} className="flex-1" />
                  </div>
                  {importFile && (
                    <p className="text-sm text-muted-foreground">Ficheiro selecionado: {importFile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Centro de Custo *</Label>
                  <Select value={importCentroCusto} onValueChange={setImportCentroCusto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(centrosCusto || [])
                        .filter((cc) => cc.ativo)
                        .map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.nome} ({cc.tipo})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {importPreview.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Pre-visualizacao (primeiras 5 linhas)</Label>
                      <Button variant="outline" size="sm" onClick={() => setDialogMappingOpen(true)}>
                        <Gear className="mr-2" size={14} />
                        Configurar Mapeamento
                      </Button>
                    </div>
                    <Card className="p-4 overflow-x-auto">
                      <Table>
                        <TableBody>
                          {importPreview.map((row: any[], idx) => (
                            <TableRow key={idx}>
                              {Array.isArray(row) &&
                                row.map((cell, cellIdx) => (
                                  <TableCell key={cellIdx} className="text-xs">
                                    {cell?.toString() || '-'}
                                  </TableCell>
                                ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                    <p className="text-xs text-muted-foreground">
                      Nota: O sistema ira procurar automaticamente as colunas ou usar o mapeamento configurado
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogImportOpen(false);
                    resetImportData();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleImport}>
                  <FileArrowUp className="mr-2" />
                  Importar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" />
                Adicionar Movimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Movimento Bancario</DialogTitle>
                <DialogDescription>Registe manualmente um movimento bancario</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Movimento *</Label>
                    <Input
                      type="date"
                      value={formData.data_movimento}
                      onChange={(e) => setFormData({ ...formData, data_movimento: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor * (+ receita / - despesa)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descricao *</Label>
                  <Textarea
                    placeholder="Descricao do movimento"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Centro de Custo *</Label>
                  <Select
                    value={formData.centro_custo_id}
                    onValueChange={(v) => setFormData({ ...formData, centro_custo_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(centrosCusto || [])
                        .filter((cc) => cc.ativo)
                        .map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.nome} ({cc.tipo})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Saldo Resultante</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.saldo}
                      onChange={(e) => setFormData({ ...formData, saldo: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Referencia</Label>
                    <Input
                      placeholder="Ref. do movimento"
                      value={formData.referencia}
                      onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddExtrato}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-3 md:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Total Movimentos</p>
              <p className="text-xl md:text-2xl font-bold mt-1">{(extratos || []).length}</p>
            </div>
            <div className="p-1.5 md:p-2 rounded-lg bg-blue-50">
              <Bank className="text-blue-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Conciliados</p>
              <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">€{totalConciliado.toFixed(2)}</p>
            </div>
            <div className="p-1.5 md:p-2 rounded-lg bg-green-50">
              <Check className="text-green-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Nao Conciliados</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600 mt-1">€{totalNaoConciliado.toFixed(2)}</p>
            </div>
            <div className="p-1.5 md:p-2 rounded-lg bg-orange-50">
              <ArrowsLeftRight className="text-orange-600" size={16} weight="bold" />
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Saldo da Conta</p>
              <p className={`text-xl md:text-2xl font-bold mt-1 ${saldoConta >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                €{saldoConta.toFixed(2)}
              </p>
            </div>
            <div className={`p-1.5 md:p-2 rounded-lg ${saldoConta >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
              <Bank className={saldoConta >= 0 ? 'text-blue-600' : 'text-red-600'} size={16} weight="bold" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-card z-10 text-xs md:text-sm whitespace-nowrap">Data</TableHead>
                  <TableHead className="sticky top-0 bg-card z-10 text-xs md:text-sm whitespace-nowrap">Descricao</TableHead>
                  <TableHead className="sticky top-0 bg-card z-10 text-xs md:text-sm whitespace-nowrap">Valor</TableHead>
                  <TableHead className="sticky top-0 bg-card z-10 text-xs md:text-sm whitespace-nowrap">Saldo</TableHead>
                  <TableHead className="sticky top-0 bg-card z-10 text-xs md:text-sm whitespace-nowrap">Centro Custo</TableHead>
                  <TableHead className="sticky top-0 bg-card z-10 text-xs md:text-sm whitespace-nowrap">Estado</TableHead>
                  <TableHead className="sticky top-0 bg-card z-10 text-xs md:text-sm text-right whitespace-nowrap">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExtratos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum movimento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExtratos
                    .sort((a, b) => new Date(b.data_movimento).getTime() - new Date(a.data_movimento).getTime())
                    .map((extrato) => (
                      <TableRow key={extrato.id}>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">
                          {format(new Date(extrato.data_movimento), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm max-w-[120px] md:max-w-xs truncate">{extrato.descricao}</TableCell>
                        <TableCell className={`text-xs md:text-sm font-semibold whitespace-nowrap ${extrato.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {extrato.valor >= 0 ? '+' : ''}€{extrato.valor.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">
                          {extrato.saldo !== undefined ? `€${extrato.saldo.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm max-w-[100px] md:max-w-none truncate">
                          {getCentroCustoName(extrato.centro_custo_id)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] md:text-xs whitespace-nowrap ${extrato.conciliado ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {extrato.conciliado ? 'Conciliado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 md:gap-2 justify-end whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(extrato)}
                              className="h-7 w-7 md:h-8 md:w-8 p-0"
                            >
                              <PencilSimple size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteExtrato(extrato)}
                              className="h-7 w-7 md:h-8 md:w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash size={14} />
                            </Button>
                            {extrato.conciliado ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDesconciliar(extrato)}
                                className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                              >
                                <X size={12} className="mr-0 md:mr-1" />
                                <span className="hidden md:inline">Desconciliar</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedExtrato(extrato);
                                  setCatalogData({
                                    tipo: extrato.valor >= 0 ? 'receita' : 'despesa',
                                    centro_custo_id: extrato.centro_custo_id || '',
                                    fatura_id: '',
                                    user_id: '',
                                  });
                                  setDialogCatalogOpen(true);
                                }}
                                className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                              >
                                <ArrowsLeftRight size={12} className="mr-0 md:mr-1" />
                                <span className="hidden md:inline">Catalogar</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </Card>

      <Dialog open={dialogCatalogOpen} onOpenChange={setDialogCatalogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Catalogar Movimento para Conciliacao</DialogTitle>
            <DialogDescription>Associe este movimento bancario a uma fatura ou utilizador do clube</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedExtrato && (
              <Card className="p-4 bg-muted/50">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data:</span>
                    <span className="font-medium">{format(new Date(selectedExtrato.data_movimento), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Descricao:</span>
                    <span className="font-medium max-w-xs truncate">{selectedExtrato.descricao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor:</span>
                    <span className={`font-bold ${selectedExtrato.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedExtrato.valor >= 0 ? '+' : ''}€{selectedExtrato.valor.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {sugestoesAutomaticas.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sugestoes Automaticas</Label>
                <div className="space-y-2">
                  {sugestoesAutomaticas.map((sugestao, idx) => (
                    <Card
                      key={idx}
                      className="p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        if (sugestao.tipo === 'fatura') {
                          setCatalogData({
                            ...catalogData,
                            fatura_id: sugestao.data.fatura.id,
                            user_id: sugestao.data.user.id,
                            centro_custo_id: sugestao.data.fatura.centro_custo_id || '',
                          });
                        } else {
                          setCatalogData({
                            ...catalogData,
                            user_id: sugestao.data.id,
                            centro_custo_id: sugestao.data.centro_custo?.[0] || '',
                          });
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          {sugestao.tipo === 'fatura' ? (
                            <>
                              <p className="font-medium text-sm">{sugestao.data.user.nome_completo}</p>
                              <p className="text-xs text-muted-foreground">
                                Fatura: €{sugestao.data.fatura.valor_total.toFixed(2)} - {sugestao.data.fatura.tipo}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-sm">{sugestao.data.nome_completo}</p>
                              <p className="text-xs text-muted-foreground">{sugestao.data.numero_socio}</p>
                            </>
                          )}
                        </div>
                        <Badge variant="outline">{sugestao.score}% match</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo de Movimento *</Label>
              <Select value={catalogData.tipo} onValueChange={(v) => setCatalogData({ ...catalogData, tipo: v as 'receita' | 'despesa' })}>
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
              <Label>Centro de Custo *</Label>
              <Select value={catalogData.centro_custo_id} onValueChange={(v) => setCatalogData({ ...catalogData, centro_custo_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {(centrosCusto || [])
                    .filter((cc) => cc.ativo)
                    .map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.nome} ({cc.tipo})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Utilizador (opcional)</Label>
              <Select value={catalogData.user_id} onValueChange={(v) => setCatalogData({ ...catalogData, user_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
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
              <Label>Fatura Relacionada (opcional)</Label>
              <Select value={catalogData.fatura_id} onValueChange={(v) => setCatalogData({ ...catalogData, fatura_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  {(faturas || [])
                    .filter((f) => f.estado_pagamento !== 'pago' && f.estado_pagamento !== 'cancelado')
                    .map((fatura) => {
                      const user = (users || []).find((u) => u.id === fatura.user_id);
                      return (
                        <SelectItem key={fatura.id} value={fatura.id}>
                          {user?.nome_completo} - €{fatura.valor_total.toFixed(2)} ({format(new Date(fatura.data_emissao), 'dd/MM/yyyy')})
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogCatalogOpen(false);
                setSelectedExtrato(null);
                resetCatalogData();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCatalogar}>
              <Check className="mr-2" />
              Catalogar e Conciliar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogEditOpen} onOpenChange={setDialogEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Movimento Bancario</DialogTitle>
            <DialogDescription>Altere os dados do movimento bancario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Movimento *</Label>
                <Input type="date" value={formData.data_movimento} onChange={(e) => setFormData({ ...formData, data_movimento: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Valor * (+ receita / - despesa)</Label>
                <Input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descricao *</Label>
              <Textarea placeholder="Descricao do movimento" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Centro de Custo *</Label>
              <Select value={formData.centro_custo_id} onValueChange={(v) => setFormData({ ...formData, centro_custo_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {(centrosCusto || [])
                    .filter((cc) => cc.ativo)
                    .map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.nome} ({cc.tipo})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Saldo Resultante</Label>
                <Input type="number" step="0.01" value={formData.saldo} onChange={(e) => setFormData({ ...formData, saldo: parseFloat(e.target.value) || 0 })} />
              </div>

              <div className="space-y-2">
                <Label>Referencia</Label>
                <Input placeholder="Ref. do movimento" value={formData.referencia} onChange={(e) => setFormData({ ...formData, referencia: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogEditOpen(false);
                setEditingExtrato(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditExtrato}>Guardar Alteracoes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMappingOpen} onOpenChange={setDialogMappingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Mapeamento de Colunas</DialogTitle>
            <DialogDescription>Defina como as colunas do ficheiro correspondem aos campos do sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure como as colunas do seu ficheiro Excel correspondem aos campos do sistema. Deixe em branco para usar a detecao automatica.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Select
                  value={columnMapping?.data || '__auto__'}
                  onValueChange={(v) => setColumnMapping((current) => ({ ...(current || {}), data: v === '__auto__' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar coluna para Data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-detetar</SelectItem>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descricao *</Label>
                <Select
                  value={columnMapping?.descricao || '__auto__'}
                  onValueChange={(v) => setColumnMapping((current) => ({ ...(current || {}), descricao: v === '__auto__' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar coluna para Descricao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-detetar</SelectItem>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor *</Label>
                <Select
                  value={columnMapping?.valor || '__auto__'}
                  onValueChange={(v) => setColumnMapping((current) => ({ ...(current || {}), valor: v === '__auto__' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar coluna para Valor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-detetar</SelectItem>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Saldo (opcional)</Label>
                <Select
                  value={columnMapping?.saldo || '__auto__'}
                  onValueChange={(v) => setColumnMapping((current) => ({ ...(current || {}), saldo: v === '__auto__' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar coluna para Saldo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-detetar</SelectItem>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta (opcional)</Label>
                <Select
                  value={columnMapping?.conta || '__auto__'}
                  onValueChange={(v) => setColumnMapping((current) => ({ ...(current || {}), conta: v === '__auto__' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar coluna para Conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-detetar</SelectItem>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Referencia (opcional)</Label>
                <Select
                  value={columnMapping?.referencia || '__auto__'}
                  onValueChange={(v) => setColumnMapping((current) => ({ ...(current || {}), referencia: v === '__auto__' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar coluna para Referencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-detetar</SelectItem>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="p-3 bg-blue-50">
              <p className="text-sm text-blue-900">
                <strong>Dica:</strong> Este mapeamento sera guardado e usado automaticamente nas proximas importacoes.
              </p>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMappingOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                toast.success('Mapeamento guardado com sucesso');
                setDialogMappingOpen(false);
              }}
            >
              <Check className="mr-2" />
              Guardar Mapeamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
