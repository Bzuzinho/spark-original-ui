import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { Loader, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Competition {
  id: string;
  titulo: string;
  data_inicio: string;
}

interface Prova {
  id: string;
  nome: string;
  distancia?: number;
  unidade?: string;
  modalidade?: string;
}

interface Athlete {
  id: string;
  nome_completo: string;
}

interface ConvocationAthleteItem {
  atleta_id: string;
  atleta_nome?: string;
  provas?: string[];
}

interface ConvocationGroupItem {
  id: string;
  evento_id: string;
  evento_titulo?: string;
  evento_data?: string;
  athletes?: ConvocationAthleteItem[];
}

interface ProvaTipoItem {
  id: string;
  nome: string;
  distancia?: number;
  unidade?: string;
  modalidade?: string;
}

interface ResultItem {
  id: string;
  prova_id: string;
  user_id: string;
  tempo_oficial: string;
  posicao: string;
  pontos_fina: string;
  desclassificado: boolean;
  observacoes: string;
  distance_label: string;
  athlete_name: string;
}

interface ExpectedRow {
  key: string;
  athleteId: string;
  athleteName: string;
  provaId: string;
  provaLabel: string;
  result?: ResultItem;
}

interface ResultFormData {
  competition_id: string;
  prova_id: string;
  user_id: string;
  tempo_oficial: string;
  posicao: string;
  pontos_fina: string;
  desclassificado: boolean;
  observacoes: string;
}

interface Props {
  athletes: Athlete[];
  competitions: Competition[];
  convocationGroups: ConvocationGroupItem[];
  provaTipos?: ProvaTipoItem[];
  selectedCompetitionId?: string;
  openAddTrigger?: number;
}

const INITIAL_FORM: ResultFormData = {
  competition_id: '',
  prova_id: '',
  user_id: '',
  tempo_oficial: '',
  posicao: '',
  pontos_fina: '',
  desclassificado: false,
  observacoes: '',
};

const normalize = (value: string | null | undefined): string =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const provaLabel = (prova: Prova): string => {
  const dist = prova.distancia ?? 0;
  const unidade = prova.unidade || 'm';
  const nome = prova.nome || 'Prova';
  return `${dist}${unidade} ${nome}`.trim();
};

export function ResultadosCompeticoesForm({
  athletes,
  competitions,
  convocationGroups,
  provaTipos = [],
  selectedCompetitionId = '',
  openAddTrigger = 0,
}: Props) {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResultFormData>(INITIAL_FORM);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const lastOpenAddTriggerRef = useRef(openAddTrigger);
  const resultsCacheRef = useRef<Record<string, ResultItem[]>>({});

  const selectedCompetition = useMemo(
    () => competitions.find((competition) => competition.id === selectedCompetitionId) ?? null,
    [competitions, selectedCompetitionId]
  );

  const competitionProvas = useMemo(() => provas, [provas]);

  const formProvas = useMemo(() => {
    return provas;
  }, [provas]);

  const provaTipoIds = useMemo(() => new Set(provas.map((item) => item.id)), [provas]);

  const provaTipoMap = useMemo(() => {
    const map = new Map<string, string>();
    provaTipos.forEach((item) => {
      const dist = item.distancia ?? 0;
      const unidade = item.unidade || 'm';
      map.set(item.id, `${dist}${unidade} ${item.nome}`.trim());
    });
    provas.forEach((item) => map.set(item.id, provaLabel(item)));
    return map;
  }, [provaTipos, provas]);

  const linkedGroups = useMemo(() => {
    if (!selectedCompetition) return [] as ConvocationGroupItem[];

    const title = normalize(selectedCompetition.titulo);
    const day = (selectedCompetition.data_inicio || '').slice(0, 10);

    return convocationGroups.filter((group) => {
      if (group.evento_id === selectedCompetition.id) return true;
      const gTitle = normalize(group.evento_titulo);
      const gDay = (group.evento_data || '').slice(0, 10);
      return Boolean(gTitle && gTitle === title && gDay === day);
    });
  }, [selectedCompetition, convocationGroups]);

  const loadProvas = useCallback(async () => {
    try {
      const response = await axios.get('/api/prova-tipos');
      setProvas(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error('Erro ao carregar provas');
    }
  }, []);

  const loadResults = useCallback(async () => {
    if (!selectedCompetitionId) {
      setResults([]);
      return;
    }

    const cached = resultsCacheRef.current[selectedCompetitionId];
    if (Array.isArray(cached)) {
      setResults(cached);
    } else {
      setResults([]);
    }

    try {
      setResultsLoading(true);
      const response = await axios.get('/api/desportivo/competition-results', {
        params: { competition_id: selectedCompetitionId },
      });

      const payload = Array.isArray(response.data) ? response.data : [];
      const mapped = payload.map((result: any) => ({
        id: result.id,
        prova_id: result.prova_id || '',
        user_id: result.user_id || '',
        tempo_oficial: (result.tempo_oficial ?? '').toString(),
        posicao: (result.posicao ?? '').toString(),
        pontos_fina: (result.pontos_fina ?? '').toString(),
        desclassificado: Boolean(result.desqualificado || result.desclassificado),
        observacoes: result.observacoes || '',
        distance_label: result.prova || '',
        athlete_name: result.user_nome || '',
      }));

      resultsCacheRef.current[selectedCompetitionId] = mapped;
      setResults(mapped);
    } catch {
      toast.error('Erro ao carregar resultados');
    } finally {
      setResultsLoading(false);
    }
  }, [selectedCompetitionId]);

  useEffect(() => {
    loadProvas();
  }, [loadProvas]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    if (openAddTrigger > lastOpenAddTriggerRef.current) {
      openManualDialog();
    }
    lastOpenAddTriggerRef.current = openAddTrigger;
  }, [openAddTrigger]);

  useEffect(() => {
    if (!selectedCompetitionId) return;
    resultsCacheRef.current[selectedCompetitionId] = results;
  }, [results, selectedCompetitionId]);

  const resolveConvocatoriaProva = useCallback((value: string): Prova | null => {
    if (!value) return null;

    const byId = competitionProvas.find((prova) => prova.id === value);
    if (byId) return byId;

    const normValue = normalize(value);
    return competitionProvas.find((prova) => {
      const label = normalize(provaLabel(prova));
      const nome = normalize(prova.nome);
      return label === normValue || nome === normValue;
    }) || null;
  }, [competitionProvas]);

  const resolveConvocatoriaProvaLabel = useCallback((value: string): string => {
    const mappedTipo = provaTipoMap.get(value);
    if (mappedTipo) return mappedTipo;
    return value;
  }, [provaTipoMap]);

  const expectedRows = useMemo(() => {
    const rows = new Map<string, ExpectedRow>();

    linkedGroups.forEach((group) => {
      (group.athletes || []).forEach((athlete) => {
        const athleteId = athlete.atleta_id;
        if (!athleteId) return;

        const athleteName = athlete.atleta_nome || athletes.find((a) => a.id === athleteId)?.nome_completo || athleteId;
        const rawProvas = athlete.provas && athlete.provas.length > 0
          ? athlete.provas
          : [];

        rawProvas.forEach((rawProva) => {
          const mapped = resolveConvocatoriaProva(rawProva);
          const pId = mapped?.id || rawProva;
          const pLabel = mapped ? provaLabel(mapped) : resolveConvocatoriaProvaLabel(rawProva);
          const key = `${athleteId}::${pId}`;

          rows.set(key, {
            key,
            athleteId,
            athleteName,
            provaId: pId,
            provaLabel: pLabel,
          });
        });
      });
    });

    const byAthleteAndProva = new Map<string, ResultItem>();
    const byAthleteAndLabel = new Map<string, ResultItem>();
    results.forEach((result) => {
      byAthleteAndProva.set(`${result.user_id}::${result.prova_id}`, result);
      byAthleteAndLabel.set(`${result.user_id}::${normalize(result.distance_label)}`, result);
    });

    return Array.from(rows.values()).map((row) => ({
      ...row,
      result:
        byAthleteAndProva.get(`${row.athleteId}::${row.provaId}`) ||
        byAthleteAndLabel.get(`${row.athleteId}::${normalize(row.provaLabel)}`),
    }));
  }, [linkedGroups, athletes, competitionProvas, resolveConvocatoriaProva, resolveConvocatoriaProvaLabel, results]);

  const expectedResultIds = useMemo(
    () => new Set(expectedRows.map((row) => row.result?.id).filter(Boolean) as string[]),
    [expectedRows]
  );

  const extraResults = useMemo(
    () => results.filter((result) => !expectedResultIds.has(result.id)),
    [results, expectedResultIds]
  );

  const handleFieldChange = (field: keyof ResultFormData, value: string | boolean) => {
    setFormData((current) => {
      const next = { ...current, [field]: value };

      if (field === 'competition_id' && current.competition_id !== value) {
        next.prova_id = '';
      }

      return next;
    });

    if (validationErrors[field]) {
      setValidationErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.competition_id) errors.competition_id = 'Competição é obrigatória';
    if (!formData.prova_id) errors.prova_id = 'Prova é obrigatória';
    if (!formData.user_id) errors.user_id = 'Atleta é obrigatório';
    if (!formData.tempo_oficial || Number(formData.tempo_oficial) < 0) {
      errors.tempo_oficial = 'Tempo final é obrigatório';
    }
    if (formData.posicao && Number(formData.posicao) < 1) {
      errors.posicao = 'Posição deve ser maior que 0';
    }
    if (formData.pontos_fina && Number(formData.pontos_fina) < 0) {
      errors.pontos_fina = 'Pontos não podem ser negativos';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openManualDialog = () => {
    setEditingId(null);
    setValidationErrors({});
    setFormData({ ...INITIAL_FORM, competition_id: selectedCompetitionId || '' });
    setDialogOpen(true);
  };

  const openRowDialog = (row: ExpectedRow) => {
    setValidationErrors({});

    if (row.result) {
      setEditingId(row.result.id);
      setFormData({
        competition_id: selectedCompetitionId,
        prova_id: row.provaId,
        user_id: row.result.user_id,
        tempo_oficial: row.result.tempo_oficial,
        posicao: row.result.posicao,
        pontos_fina: row.result.pontos_fina,
        desclassificado: row.result.desclassificado,
        observacoes: row.result.observacoes,
      });
      setDialogOpen(true);
      return;
    }

    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      competition_id: selectedCompetitionId,
      prova_id: row.provaId,
      user_id: row.athleteId,
    });
    setDialogOpen(true);
  };

  const openEditExisting = (result: ResultItem) => {
    setEditingId(result.id);
    setValidationErrors({});
    setFormData({
      competition_id: selectedCompetitionId,
      prova_id: result.prova_id,
      user_id: result.user_id,
      tempo_oficial: result.tempo_oficial,
      posicao: result.posicao,
      pontos_fina: result.pontos_fina,
      desclassificado: result.desclassificado,
      observacoes: result.observacoes,
    });
    setDialogOpen(true);
  };

  const deleteResult = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este resultado?')) return;

    try {
      await axios.delete(`/api/desportivo/competition-results/${id}`);
      setResults((current) => current.filter((row) => row.id !== id));
      toast.success('Resultado eliminado com sucesso');
    } catch {
      toast.error('Erro ao eliminar resultado');
    }
  };

  const saveResult = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const selectedProvaId = formData.prova_id;
      const createPayloadProvaFields = provaTipoIds.has(selectedProvaId)
        ? { prova_tipo_id: selectedProvaId }
        : { prova_id: selectedProvaId };

      const payload = {
        competition_id: formData.competition_id,
        ...createPayloadProvaFields,
        user_id: formData.user_id,
        tempo_oficial: Number(formData.tempo_oficial),
        posicao: formData.posicao ? Number(formData.posicao) : null,
        pontos_fina: formData.pontos_fina ? Number(formData.pontos_fina) : null,
        desclassificado: formData.desclassificado,
        observacoes: formData.observacoes || null,
      };

      if (editingId) {
        const response = await axios.put(`/api/desportivo/competition-results/${editingId}`, payload);
        const updated = response.data;

        setResults((current) => current.map((row) => {
          if (row.id !== editingId) return row;
          return {
            ...row,
            prova_id: (updated?.prova_id || row.prova_id || formData.prova_id),
            user_id: formData.user_id,
            tempo_oficial: (updated?.tempo_oficial ?? formData.tempo_oficial ?? '').toString(),
            posicao: (updated?.posicao ?? formData.posicao ?? '').toString(),
            pontos_fina: (updated?.pontos_fina ?? formData.pontos_fina ?? '').toString(),
            desclassificado: Boolean(updated?.desclassificado ?? formData.desclassificado),
            observacoes: updated?.observacoes ?? formData.observacoes,
            athlete_name: athletes.find((a) => a.id === formData.user_id)?.nome_completo || row.athlete_name,
            distance_label: provas.find((p) => p.id === formData.prova_id)?.id
              ? provaLabel(provas.find((p) => p.id === formData.prova_id) as Prova)
              : row.distance_label,
          };
        }));

        toast.success('Resultado atualizado com sucesso');
      } else {
        const response = await axios.post('/api/desportivo/competition-results', payload);
        const created = response.data;

        const prova = provas.find((item) => item.id === formData.prova_id);
        setResults((current) => [
          ...current,
          {
            id: created.id,
            prova_id: created?.prova_id || formData.prova_id,
            user_id: formData.user_id,
            tempo_oficial: (created?.tempo_oficial ?? formData.tempo_oficial ?? '').toString(),
            posicao: (created?.posicao ?? formData.posicao ?? '').toString(),
            pontos_fina: (created?.pontos_fina ?? formData.pontos_fina ?? '').toString(),
            desclassificado: Boolean(created?.desclassificado ?? formData.desclassificado),
            observacoes: created?.observacoes ?? formData.observacoes,
            athlete_name: athletes.find((a) => a.id === formData.user_id)?.nome_completo || '',
            distance_label: prova ? provaLabel(prova) : '',
          },
        ]);

        toast.success('Resultado criado com sucesso');
      }

      setDialogOpen(false);
    } catch (error: any) {
      const validationErrors = error?.response?.data?.errors;
      const firstValidationMessage = validationErrors && typeof validationErrors === 'object'
        ? Object.values(validationErrors).flat().find(Boolean)
        : null;
      const message = (typeof firstValidationMessage === 'string' && firstValidationMessage)
        || error?.response?.data?.message
        || 'Erro ao guardar resultado';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">

      {!selectedCompetitionId && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Selecione uma competição para carregar as linhas de resultados por convocatória.
          </CardContent>
        </Card>
      )}

      {selectedCompetitionId && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="sm:hidden p-2 space-y-2">
              {resultsLoading && (
                <p className="text-center text-xs text-muted-foreground py-4">A carregar resultados...</p>
              )}

              {!resultsLoading && expectedRows.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">Sem linhas de convocatória para esta competição.</p>
              )}

              {!resultsLoading && expectedRows.map((row) => {
                const hasResult = Boolean(row.result?.id);
                return (
                  <div key={row.key} className="rounded-md border bg-white p-2 space-y-2">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Atleta</span>
                      <span className="text-right font-medium break-words">{row.athleteName}</span>
                      <span className="text-muted-foreground">Prova</span>
                      <span className="text-right break-words">{row.provaLabel}</span>
                      <span className="text-muted-foreground">Estado</span>
                      <span className="text-right">
                        {hasResult ? (
                          <Badge variant="secondary" className="text-[10px]">Preenchido</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Não preenchido</Badge>
                        )}
                      </span>
                      <span className="text-muted-foreground">Tempo</span>
                      <span className="text-right font-mono">{row.result?.tempo_oficial || '—'}</span>
                    </div>

                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant={hasResult ? 'outline' : 'default'} className="h-7 text-xs" onClick={() => openRowDialog(row)}>
                        {hasResult ? 'Editar' : 'Preencher'}
                      </Button>
                      {row.result?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteResult(row.result!.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Atleta</TableHead>
                    <TableHead className="text-xs">Prova</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Tempo</TableHead>
                    <TableHead className="text-xs text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultsLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                        A carregar resultados...
                      </TableCell>
                    </TableRow>
                  )}

                  {!resultsLoading && expectedRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                        Sem linhas de convocatória para esta competição.
                      </TableCell>
                    </TableRow>
                  )}

                  {!resultsLoading && expectedRows.map((row) => {
                    const hasResult = Boolean(row.result?.id);
                    return (
                      <TableRow key={row.key}>
                        <TableCell className="text-xs font-medium">{row.athleteName}</TableCell>
                        <TableCell className="text-xs">{row.provaLabel}</TableCell>
                        <TableCell className="text-xs">
                          {hasResult ? (
                            <Badge variant="secondary" className="text-[10px]">Preenchido</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Não preenchido</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {row.result?.tempo_oficial || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant={hasResult ? 'outline' : 'default'} className="h-7 text-xs" onClick={() => openRowDialog(row)}>
                              {hasResult ? 'Editar' : 'Preencher'}
                            </Button>
                            {row.result?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteResult(row.result!.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {extraResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Resultados fora da convocatória</p>
              <div className="border rounded-lg overflow-hidden">
                <div className="sm:hidden p-2 space-y-2">
                  {extraResults.map((result) => (
                    <div key={result.id} className="rounded-md border bg-white p-2 space-y-2">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Atleta</span>
                        <span className="text-right break-words">{result.athlete_name}</span>
                        <span className="text-muted-foreground">Prova</span>
                        <span className="text-right break-words">{result.distance_label}</span>
                        <span className="text-muted-foreground">Tempo</span>
                        <span className="text-right font-mono">{result.tempo_oficial || '—'}</span>
                        <span className="text-muted-foreground">Posição</span>
                        <span className="text-right">{result.posicao || '—'}</span>
                      </div>

                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEditExisting(result)}>
                          <Pencil size={12} className="mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteResult(result.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Atleta</TableHead>
                        <TableHead className="text-xs">Prova</TableHead>
                        <TableHead className="text-xs">Tempo</TableHead>
                        <TableHead className="text-xs">Posição</TableHead>
                        <TableHead className="text-xs text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extraResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="text-xs">{result.athlete_name}</TableCell>
                          <TableCell className="text-xs">{result.distance_label}</TableCell>
                          <TableCell className="text-xs font-mono">{result.tempo_oficial || '—'}</TableCell>
                          <TableCell className="text-xs">{result.posicao || '—'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEditExisting(result)}>
                                <Pencil size={12} className="mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteResult(result.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Resultado' : 'Novo Resultado'}</DialogTitle>
            <DialogDescription>
              Preencha competição, prova, atleta, tempo final, posição, pontos, desqualificado e observações.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Competição *</Label>
              <select
                value={formData.competition_id}
                onChange={(e) => handleFieldChange('competition_id', e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-xs"
              >
                <option value="">Selecione uma competição</option>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.titulo}
                  </option>
                ))}
              </select>
              {validationErrors.competition_id && <p className="text-xs text-red-500 mt-1">{validationErrors.competition_id}</p>}
            </div>

            <div>
              <Label className="text-xs mb-1 block">Prova *</Label>
              <select
                value={formData.prova_id}
                onChange={(e) => handleFieldChange('prova_id', e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-xs"
              >
                <option value="">Selecione uma prova</option>
                {formProvas.map((prova) => (
                  <option key={prova.id} value={prova.id}>
                    {provaLabel(prova)}
                  </option>
                ))}
              </select>
              {validationErrors.prova_id && <p className="text-xs text-red-500 mt-1">{validationErrors.prova_id}</p>}
            </div>

            <div>
              <Label className="text-xs mb-1 block">Atleta *</Label>
              <select
                value={formData.user_id}
                onChange={(e) => handleFieldChange('user_id', e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-xs"
              >
                <option value="">Selecione um atleta</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.nome_completo}
                  </option>
                ))}
              </select>
              {validationErrors.user_id && <p className="text-xs text-red-500 mt-1">{validationErrors.user_id}</p>}
            </div>

            <div>
              <Label className="text-xs mb-1 block">Tempo final *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="ex: 65.32"
                value={formData.tempo_oficial}
                onChange={(e) => handleFieldChange('tempo_oficial', e.target.value)}
                className="h-8 text-xs"
              />
              {validationErrors.tempo_oficial && <p className="text-xs text-red-500 mt-1">{validationErrors.tempo_oficial}</p>}
            </div>

            <div>
              <Label className="text-xs mb-1 block">Posição</Label>
              <Input
                type="number"
                placeholder="ex: 1"
                value={formData.posicao}
                onChange={(e) => handleFieldChange('posicao', e.target.value)}
                className="h-8 text-xs"
              />
              {validationErrors.posicao && <p className="text-xs text-red-500 mt-1">{validationErrors.posicao}</p>}
            </div>

            <div>
              <Label className="text-xs mb-1 block">Pontos</Label>
              <Input
                type="number"
                placeholder="ex: 100"
                value={formData.pontos_fina}
                onChange={(e) => handleFieldChange('pontos_fina', e.target.value)}
                className="h-8 text-xs"
              />
              {validationErrors.pontos_fina && <p className="text-xs text-red-500 mt-1">{validationErrors.pontos_fina}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="desq_checkbox"
                checked={formData.desclassificado}
                onChange={(e) => handleFieldChange('desclassificado', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="desq_checkbox" className="text-xs cursor-pointer">Desqualificado</Label>
            </div>

            <div>
              <Label className="text-xs mb-1 block">Observações</Label>
              <Textarea
                placeholder="Notas adicionais..."
                value={formData.observacoes}
                onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                className="text-xs min-h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={saveResult} disabled={saving}>
              {saving && <Loader className="mr-1 animate-spin" size={14} />}
              {editingId ? 'Atualizar' : 'Criar'} Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
