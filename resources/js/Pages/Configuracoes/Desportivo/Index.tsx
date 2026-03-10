import { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

interface BaseConfig {
    id: string;
    codigo: string;
    nome: string;
    ativo: boolean;
    ordem: number;
}

interface AthleteStatusConfig extends BaseConfig {
    nome_en?: string | null;
    descricao?: string | null;
    cor?: string | null;
}

interface TrainingTypeConfig extends BaseConfig {
    nome_en?: string | null;
    descricao?: string | null;
    cor?: string | null;
}

interface TrainingZoneConfig extends BaseConfig {
    descricao?: string | null;
    percentagem_min?: number | null;
    percentagem_max?: number | null;
    cor?: string | null;
}

interface AbsenceReasonConfig extends BaseConfig {
    nome_en?: string | null;
    descricao?: string | null;
    requer_justificacao: boolean;
}

interface InjuryReasonConfig extends BaseConfig {
    nome_en?: string | null;
    descricao?: string | null;
    gravidade: string;
}

interface PoolTypeConfig extends BaseConfig {
    comprimento_m?: number | null;
}

interface Props {
    athleteStatuses: AthleteStatusConfig[];
    trainingTypes: TrainingTypeConfig[];
    trainingZones: TrainingZoneConfig[];
    absenceReasons: AbsenceReasonConfig[];
    injuryReasons: InjuryReasonConfig[];
    poolTypes: PoolTypeConfig[];
    ageGroups?: Array<{ id: string; nome: string; idade_minima: number; idade_maxima: number; ativo: boolean }>;
    provaTipos?: Array<{ id: string; nome: string; distancia: number; unidade: string; modalidade: string; ativo: boolean }>;
    embedded?: boolean;
    showSummary?: boolean;
}

interface AthleteStatusFormData {
    id: string;
    codigo: string;
    nome: string;
    nome_en: string;
    descricao: string;
    cor: string;
    ativo: boolean;
    ordem: number;
}

interface TrainingTypeFormData {
    id: string;
    codigo: string;
    nome: string;
    nome_en: string;
    descricao: string;
    cor: string;
    ativo: boolean;
    ordem: number;
}

interface TrainingZoneFormData {
    id: string;
    codigo: string;
    nome: string;
    percentagem_min: string;
    percentagem_max: string;
    cor: string;
    ativo: boolean;
    ordem: number;
}

interface AbsenceReasonFormData {
    id: string;
    codigo: string;
    nome: string;
    requer_justificacao: boolean;
    ativo: boolean;
    ordem: number;
}

interface InjuryReasonFormData {
    id: string;
    codigo: string;
    nome: string;
    gravidade: 'leve' | 'media' | 'grave';
    ativo: boolean;
    ordem: number;
}

interface PoolTypeFormData {
    id: string;
    codigo: string;
    nome: string;
    comprimento_m: string;
    ativo: boolean;
    ordem: number;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold leading-none mt-1">{value}</div>
        </div>
    );
}

function ActiveBadge({ active }: { active: boolean }) {
    return <Badge variant={active ? 'default' : 'secondary'}>{active ? 'Ativo' : 'Inativo'}</Badge>;
}

function SimpleTable({ rows }: { rows: BaseConfig[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ativo</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.codigo}</TableCell>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>
                            <ActiveBadge active={item.ativo} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function ConfiguracoesDesportivoIndex({
    athleteStatuses,
    trainingTypes,
    trainingZones,
    absenceReasons,
    injuryReasons,
    poolTypes,
    ageGroups = [],
    provaTipos = [],
    embedded = false,
    showSummary = true,
}: Props) {
    const [editOpen, setEditOpen] = useState(false);
    const [trainingTypeEditOpen, setTrainingTypeEditOpen] = useState(false);
    const [trainingZoneEditOpen, setTrainingZoneEditOpen] = useState(false);
    const [absenceReasonEditOpen, setAbsenceReasonEditOpen] = useState(false);
    const [injuryReasonEditOpen, setInjuryReasonEditOpen] = useState(false);
    const [poolTypeEditOpen, setPoolTypeEditOpen] = useState(false);

    const createForm = useForm<Omit<AthleteStatusFormData, 'id'>>({
        codigo: '',
        nome: '',
        nome_en: '',
        descricao: '',
        cor: '#6B7280',
        ativo: true,
        ordem: athleteStatuses.length + 1,
    });

    const editForm = useForm<AthleteStatusFormData>({
        id: '',
        codigo: '',
        nome: '',
        nome_en: '',
        descricao: '',
        cor: '#6B7280',
        ativo: true,
        ordem: 0,
    });

    const createTrainingTypeForm = useForm<Omit<TrainingTypeFormData, 'id'>>({
        codigo: '',
        nome: '',
        nome_en: '',
        descricao: '',
        cor: '#3B82F6',
        ativo: true,
        ordem: trainingTypes.length + 1,
    });

    const editTrainingTypeForm = useForm<TrainingTypeFormData>({
        id: '',
        codigo: '',
        nome: '',
        nome_en: '',
        descricao: '',
        cor: '#3B82F6',
        ativo: true,
        ordem: 0,
    });

    const createTrainingZoneForm = useForm<Omit<TrainingZoneFormData, 'id'>>({
        codigo: '',
        nome: '',
        percentagem_min: '',
        percentagem_max: '',
        cor: '#10B981',
        ativo: true,
        ordem: trainingZones.length + 1,
    });

    const editTrainingZoneForm = useForm<TrainingZoneFormData>({
        id: '',
        codigo: '',
        nome: '',
        percentagem_min: '',
        percentagem_max: '',
        cor: '#10B981',
        ativo: true,
        ordem: 0,
    });

    const createAbsenceReasonForm = useForm<Omit<AbsenceReasonFormData, 'id'>>({
        codigo: '',
        nome: '',
        requer_justificacao: false,
        ativo: true,
        ordem: absenceReasons.length + 1,
    });

    const editAbsenceReasonForm = useForm<AbsenceReasonFormData>({
        id: '',
        codigo: '',
        nome: '',
        requer_justificacao: false,
        ativo: true,
        ordem: 0,
    });

    const createInjuryReasonForm = useForm<Omit<InjuryReasonFormData, 'id'>>({
        codigo: '',
        nome: '',
        gravidade: 'media',
        ativo: true,
        ordem: injuryReasons.length + 1,
    });

    const editInjuryReasonForm = useForm<InjuryReasonFormData>({
        id: '',
        codigo: '',
        nome: '',
        gravidade: 'media',
        ativo: true,
        ordem: 0,
    });

    const createPoolTypeForm = useForm<Omit<PoolTypeFormData, 'id'>>({
        codigo: '',
        nome: '',
        comprimento_m: '',
        ativo: true,
        ordem: poolTypes.length + 1,
    });

    const editPoolTypeForm = useForm<PoolTypeFormData>({
        id: '',
        codigo: '',
        nome: '',
        comprimento_m: '',
        ativo: true,
        ordem: 0,
    });

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createForm.post(route('configuracoes.desportivo.estados-atleta.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                createForm.setData('cor', '#6B7280');
                createForm.setData('ativo', true);
                createForm.setData('ordem', athleteStatuses.length + 1);
            },
        });
    };

    const openEditModal = (item: AthleteStatusConfig) => {
        editForm.setData({
            id: item.id,
            codigo: item.codigo,
            nome: item.nome,
            nome_en: item.nome_en ?? '',
            descricao: item.descricao ?? '',
            cor: item.cor ?? '#6B7280',
            ativo: item.ativo,
            ordem: item.ordem,
        });
        setEditOpen(true);
    };

    const submitEdit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        editForm.put(
            route('configuracoes.desportivo.estados-atleta.update', { athleteStatus: editForm.data.id }),
            {
                preserveScroll: true,
                onSuccess: () => setEditOpen(false),
            }
        );
    };

    const deleteAthleteStatus = (id: string) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este estado de atleta?')) {
            return;
        }

        router.delete(route('configuracoes.desportivo.estados-atleta.destroy', { athleteStatus: id }), {
            preserveScroll: true,
        });
    };

    const submitCreateTrainingType = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createTrainingTypeForm.post(route('configuracoes.desportivo.tipos-treino.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createTrainingTypeForm.reset();
                createTrainingTypeForm.setData('cor', '#3B82F6');
                createTrainingTypeForm.setData('ativo', true);
                createTrainingTypeForm.setData('ordem', trainingTypes.length + 1);
            },
        });
    };

    const openTrainingTypeEditModal = (item: TrainingTypeConfig) => {
        editTrainingTypeForm.setData({
            id: item.id,
            codigo: item.codigo,
            nome: item.nome,
            nome_en: item.nome_en ?? '',
            descricao: item.descricao ?? '',
            cor: item.cor ?? '#3B82F6',
            ativo: item.ativo,
            ordem: item.ordem,
        });
        setTrainingTypeEditOpen(true);
    };

    const submitEditTrainingType = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        editTrainingTypeForm.put(
            route('configuracoes.desportivo.tipos-treino.update', { trainingType: editTrainingTypeForm.data.id }),
            {
                preserveScroll: true,
                onSuccess: () => setTrainingTypeEditOpen(false),
            }
        );
    };

    const deleteTrainingType = (id: string) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este tipo de treino?')) {
            return;
        }

        router.delete(route('configuracoes.desportivo.tipos-treino.destroy', { trainingType: id }), {
            preserveScroll: true,
        });
    };

    const submitCreateTrainingZone = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createTrainingZoneForm.post(route('configuracoes.desportivo.zonas-treino.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createTrainingZoneForm.reset();
                createTrainingZoneForm.setData('cor', '#10B981');
                createTrainingZoneForm.setData('ativo', true);
                createTrainingZoneForm.setData('ordem', trainingZones.length + 1);
            },
        });
    };

    const openTrainingZoneEditModal = (item: TrainingZoneConfig) => {
        editTrainingZoneForm.setData({
            id: item.id,
            codigo: item.codigo,
            nome: item.nome,
            percentagem_min: item.percentagem_min?.toString() ?? '',
            percentagem_max: item.percentagem_max?.toString() ?? '',
            cor: item.cor ?? '#10B981',
            ativo: item.ativo,
            ordem: item.ordem,
        });
        setTrainingZoneEditOpen(true);
    };

    const submitEditTrainingZone = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        editTrainingZoneForm.put(
            route('configuracoes.desportivo.zonas-treino.update', { trainingZone: editTrainingZoneForm.data.id }),
            {
                preserveScroll: true,
                onSuccess: () => setTrainingZoneEditOpen(false),
            }
        );
    };

    const deleteTrainingZone = (id: string) => {
        if (!window.confirm('Tem a certeza que deseja eliminar esta zona de treino?')) {
            return;
        }

        router.delete(route('configuracoes.desportivo.zonas-treino.destroy', { trainingZone: id }), {
            preserveScroll: true,
        });
    };

    const submitCreateAbsenceReason = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createAbsenceReasonForm.post(route('configuracoes.desportivo.motivos-ausencia.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createAbsenceReasonForm.reset();
                createAbsenceReasonForm.setData('requer_justificacao', false);
                createAbsenceReasonForm.setData('ativo', true);
                createAbsenceReasonForm.setData('ordem', absenceReasons.length + 1);
            },
        });
    };

    const openAbsenceReasonEditModal = (item: AbsenceReasonConfig) => {
        editAbsenceReasonForm.setData({
            id: item.id,
            codigo: item.codigo,
            nome: item.nome,
            requer_justificacao: item.requer_justificacao,
            ativo: item.ativo,
            ordem: item.ordem,
        });
        setAbsenceReasonEditOpen(true);
    };

    const submitEditAbsenceReason = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        editAbsenceReasonForm.put(
            route('configuracoes.desportivo.motivos-ausencia.update', { absenceReason: editAbsenceReasonForm.data.id }),
            {
                preserveScroll: true,
                onSuccess: () => setAbsenceReasonEditOpen(false),
            }
        );
    };

    const deleteAbsenceReason = (id: string) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este motivo de ausência?')) {
            return;
        }

        router.delete(route('configuracoes.desportivo.motivos-ausencia.destroy', { absenceReason: id }), {
            preserveScroll: true,
        });
    };

    const submitCreateInjuryReason = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createInjuryReasonForm.post(route('configuracoes.desportivo.motivos-lesao.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createInjuryReasonForm.reset();
                createInjuryReasonForm.setData('gravidade', 'media');
                createInjuryReasonForm.setData('ativo', true);
                createInjuryReasonForm.setData('ordem', injuryReasons.length + 1);
            },
        });
    };

    const openInjuryReasonEditModal = (item: InjuryReasonConfig) => {
        editInjuryReasonForm.setData({
            id: item.id,
            codigo: item.codigo,
            nome: item.nome,
            gravidade: (item.gravidade as 'leve' | 'media' | 'grave') ?? 'media',
            ativo: item.ativo,
            ordem: item.ordem,
        });
        setInjuryReasonEditOpen(true);
    };

    const submitEditInjuryReason = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        editInjuryReasonForm.put(
            route('configuracoes.desportivo.motivos-lesao.update', { injuryReason: editInjuryReasonForm.data.id }),
            {
                preserveScroll: true,
                onSuccess: () => setInjuryReasonEditOpen(false),
            }
        );
    };

    const deleteInjuryReason = (id: string) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este motivo de lesão?')) {
            return;
        }

        router.delete(route('configuracoes.desportivo.motivos-lesao.destroy', { injuryReason: id }), {
            preserveScroll: true,
        });
    };

    const submitCreatePoolType = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createPoolTypeForm.post(route('configuracoes.desportivo.tipos-piscina.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createPoolTypeForm.reset();
                createPoolTypeForm.setData('ativo', true);
                createPoolTypeForm.setData('ordem', poolTypes.length + 1);
            },
        });
    };

    const openPoolTypeEditModal = (item: PoolTypeConfig) => {
        editPoolTypeForm.setData({
            id: item.id,
            codigo: item.codigo,
            nome: item.nome,
            comprimento_m: item.comprimento_m?.toString() ?? '',
            ativo: item.ativo,
            ordem: item.ordem,
        });
        setPoolTypeEditOpen(true);
    };

    const submitEditPoolType = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        editPoolTypeForm.put(
            route('configuracoes.desportivo.tipos-piscina.update', { poolType: editPoolTypeForm.data.id }),
            {
                preserveScroll: true,
                onSuccess: () => setPoolTypeEditOpen(false),
            }
        );
    };

    const deletePoolType = (id: string) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este tipo de piscina?')) {
            return;
        }

        router.delete(route('configuracoes.desportivo.tipos-piscina.destroy', { poolType: id }), {
            preserveScroll: true,
        });
    };

    const content = (
        <>
            <div className={embedded ? 'space-y-4' : 'p-4 sm:p-6 space-y-4'}>
                {showSummary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
                            <SummaryCard label="Tipos Treino" value={trainingTypes.length} />
                            <SummaryCard label="Zonas" value={trainingZones.length} />
                            <SummaryCard label="Lesões" value={injuryReasons.length} />
                            <SummaryCard label="Piscinas" value={poolTypes.length} />
                            <SummaryCard label="Escalões" value={ageGroups.length} />
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="types" className="space-y-3">
                    <TabsList className="w-full flex flex-wrap h-auto gap-1 justify-start">
                        <TabsTrigger value="types">Tipos de Treino</TabsTrigger>
                        <TabsTrigger value="zones">Zonas</TabsTrigger>
                        <TabsTrigger value="injury">Motivos Lesão</TabsTrigger>
                        <TabsTrigger value="pool">Tipos Piscina</TabsTrigger>
                        <TabsTrigger value="age-groups">Escalões</TabsTrigger>
                        <TabsTrigger value="tests">Provas</TabsTrigger>
                    </TabsList>


                    <TabsContent value="types">
                        <Card>
                            <CardContent className="pt-4">
                                <form onSubmit={submitCreateTrainingType} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <Label htmlFor="novo-tipo-codigo">Código</Label>
                                        <Input
                                            id="novo-tipo-codigo"
                                            value={createTrainingTypeForm.data.codigo}
                                            onChange={(event) => createTrainingTypeForm.setData('codigo', event.target.value)}
                                            placeholder="ex: tecnico"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="novo-tipo-nome">Nome</Label>
                                        <Input
                                            id="novo-tipo-nome"
                                            value={createTrainingTypeForm.data.nome}
                                            onChange={(event) => createTrainingTypeForm.setData('nome', event.target.value)}
                                            placeholder="Nome"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="novo-tipo-cor">Cor</Label>
                                        <Input
                                            id="novo-tipo-cor"
                                            value={createTrainingTypeForm.data.cor}
                                            onChange={(event) => createTrainingTypeForm.setData('cor', event.target.value)}
                                            placeholder="#3B82F6"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" disabled={createTrainingTypeForm.processing} className="w-full">
                                            Criar tipo
                                        </Button>
                                    </div>
                                </form>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trainingTypes.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.codigo}</TableCell>
                                                <TableCell>{item.nome}</TableCell>
                                                <TableCell>
                                                    <ActiveBadge active={item.ativo} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openTrainingTypeEditModal(item)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => deleteTrainingType(item.id)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="zones">
                        <Card>
                            <CardContent className="pt-4">
                                <form onSubmit={submitCreateTrainingZone} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <Label htmlFor="nova-zona-codigo">Código</Label>
                                        <Input
                                            id="nova-zona-codigo"
                                            value={createTrainingZoneForm.data.codigo}
                                            onChange={(event) => createTrainingZoneForm.setData('codigo', event.target.value)}
                                            placeholder="ex: Z1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nova-zona-nome">Nome</Label>
                                        <Input
                                            id="nova-zona-nome"
                                            value={createTrainingZoneForm.data.nome}
                                            onChange={(event) => createTrainingZoneForm.setData('nome', event.target.value)}
                                            placeholder="Nome"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nova-zona-faixa">Faixa (%)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="nova-zona-faixa"
                                                value={createTrainingZoneForm.data.percentagem_min}
                                                onChange={(event) => createTrainingZoneForm.setData('percentagem_min', event.target.value)}
                                                placeholder="min"
                                            />
                                            <Input
                                                value={createTrainingZoneForm.data.percentagem_max}
                                                onChange={(event) => createTrainingZoneForm.setData('percentagem_max', event.target.value)}
                                                placeholder="max"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" disabled={createTrainingZoneForm.processing} className="w-full">
                                            Criar zona
                                        </Button>
                                    </div>
                                </form>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Faixa (%)</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trainingZones.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.codigo}</TableCell>
                                                <TableCell>{item.nome}</TableCell>
                                                <TableCell>
                                                    {item.percentagem_min ?? '-'} - {item.percentagem_max ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <ActiveBadge active={item.ativo} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openTrainingZoneEditModal(item)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => deleteTrainingZone(item.id)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    <TabsContent value="injury">
                        <Card>
                            <CardContent className="pt-4">
                                <form onSubmit={submitCreateInjuryReason} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <Label htmlFor="novo-motivo-lesao-codigo">Código</Label>
                                        <Input
                                            id="novo-motivo-lesao-codigo"
                                            value={createInjuryReasonForm.data.codigo}
                                            onChange={(event) => createInjuryReasonForm.setData('codigo', event.target.value)}
                                            placeholder="ex: muscular"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="novo-motivo-lesao-nome">Nome</Label>
                                        <Input
                                            id="novo-motivo-lesao-nome"
                                            value={createInjuryReasonForm.data.nome}
                                            onChange={(event) => createInjuryReasonForm.setData('nome', event.target.value)}
                                            placeholder="Nome"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="novo-motivo-lesao-gravidade">Gravidade</Label>
                                        <Input
                                            id="novo-motivo-lesao-gravidade"
                                            value={createInjuryReasonForm.data.gravidade}
                                            onChange={(event) =>
                                                createInjuryReasonForm.setData(
                                                    'gravidade',
                                                    (event.target.value || 'media') as 'leve' | 'media' | 'grave'
                                                )
                                            }
                                            placeholder="leve | media | grave"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" disabled={createInjuryReasonForm.processing} className="w-full">
                                            Criar motivo
                                        </Button>
                                    </div>
                                </form>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Gravidade</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {injuryReasons.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.codigo}</TableCell>
                                                <TableCell>{item.nome}</TableCell>
                                                <TableCell>{item.gravidade}</TableCell>
                                                <TableCell>
                                                    <ActiveBadge active={item.ativo} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openInjuryReasonEditModal(item)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => deleteInjuryReason(item.id)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pool">
                        <Card>
                            <CardContent className="pt-4">
                                <form onSubmit={submitCreatePoolType} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <Label htmlFor="novo-pool-codigo">Código</Label>
                                        <Input
                                            id="novo-pool-codigo"
                                            value={createPoolTypeForm.data.codigo}
                                            onChange={(event) => createPoolTypeForm.setData('codigo', event.target.value)}
                                            placeholder="ex: piscina_25m"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="novo-pool-nome">Nome</Label>
                                        <Input
                                            id="novo-pool-nome"
                                            value={createPoolTypeForm.data.nome}
                                            onChange={(event) => createPoolTypeForm.setData('nome', event.target.value)}
                                            placeholder="Nome"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="novo-pool-comprimento">Comprimento (m)</Label>
                                        <Input
                                            id="novo-pool-comprimento"
                                            value={createPoolTypeForm.data.comprimento_m}
                                            onChange={(event) => createPoolTypeForm.setData('comprimento_m', event.target.value)}
                                            placeholder="25"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" disabled={createPoolTypeForm.processing} className="w-full">
                                            Criar tipo
                                        </Button>
                                    </div>
                                </form>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Comprimento (m)</TableHead>
                                            <TableHead>Ativo</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {poolTypes.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.codigo}</TableCell>
                                                <TableCell>{item.nome}</TableCell>
                                                <TableCell>{item.comprimento_m ?? 'N/A'}</TableCell>
                                                <TableCell>
                                                    <ActiveBadge active={item.ativo} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openPoolTypeEditModal(item)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => deletePoolType(item.id)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="age-groups">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-sm text-muted-foreground mb-4">
                                    Gerir os escalões etários. Os escalões são configurados no separador Geral da página de Configurações.
                                </div>
                                <SimpleTable rows={ageGroups.map((g) => ({ id: g.id, codigo: `${g.idade_minima}-${g.idade_maxima}`, nome: g.nome, ativo: g.ativo, ordem: 0 }))} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tests">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-sm text-muted-foreground mb-4">
                                    Gerir as provas disponíveis. As provas são configuradas no separador Geral da página de Configurações.
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Distância</TableHead>
                                            <TableHead>Modalidade</TableHead>
                                            <TableHead>Ativo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {provaTipos && provaTipos.length > 0 ? (
                                            provaTipos.map((prova) => (
                                                <TableRow key={prova.id}>
                                                    <TableCell>{prova.nome}</TableCell>
                                                    <TableCell>
                                                        {prova.distancia} {prova.unidade === 'metros' ? 'm' : 'km'}
                                                    </TableCell>
                                                    <TableCell>{prova.modalidade}</TableCell>
                                                    <TableCell>
                                                        <ActiveBadge active={prova.ativo} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Nenhuma prova cadastrada
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Estado de Atleta</DialogTitle>
                        <DialogDescription>Atualize os dados do estado selecionado.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editar-codigo">Código</Label>
                                <Input
                                    id="editar-codigo"
                                    value={editForm.data.codigo}
                                    onChange={(event) => editForm.setData('codigo', event.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="editar-nome">Nome</Label>
                                <Input
                                    id="editar-nome"
                                    value={editForm.data.nome}
                                    onChange={(event) => editForm.setData('nome', event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="editar-cor">Cor</Label>
                            <Input
                                id="editar-cor"
                                value={editForm.data.cor}
                                onChange={(event) => editForm.setData('cor', event.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={trainingTypeEditOpen} onOpenChange={setTrainingTypeEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Tipo de Treino</DialogTitle>
                        <DialogDescription>Atualize os dados do tipo de treino selecionado.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEditTrainingType} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editar-tipo-codigo">Código</Label>
                                <Input
                                    id="editar-tipo-codigo"
                                    value={editTrainingTypeForm.data.codigo}
                                    onChange={(event) => editTrainingTypeForm.setData('codigo', event.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="editar-tipo-nome">Nome</Label>
                                <Input
                                    id="editar-tipo-nome"
                                    value={editTrainingTypeForm.data.nome}
                                    onChange={(event) => editTrainingTypeForm.setData('nome', event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="editar-tipo-cor">Cor</Label>
                            <Input
                                id="editar-tipo-cor"
                                value={editTrainingTypeForm.data.cor}
                                onChange={(event) => editTrainingTypeForm.setData('cor', event.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setTrainingTypeEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editTrainingTypeForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={trainingZoneEditOpen} onOpenChange={setTrainingZoneEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Zona de Treino</DialogTitle>
                        <DialogDescription>Atualize os dados da zona selecionada.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEditTrainingZone} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editar-zona-codigo">Código</Label>
                                <Input
                                    id="editar-zona-codigo"
                                    value={editTrainingZoneForm.data.codigo}
                                    onChange={(event) => editTrainingZoneForm.setData('codigo', event.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="editar-zona-nome">Nome</Label>
                                <Input
                                    id="editar-zona-nome"
                                    value={editTrainingZoneForm.data.nome}
                                    onChange={(event) => editTrainingZoneForm.setData('nome', event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editar-zona-min">Percentagem mínima</Label>
                                <Input
                                    id="editar-zona-min"
                                    value={editTrainingZoneForm.data.percentagem_min}
                                    onChange={(event) => editTrainingZoneForm.setData('percentagem_min', event.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editar-zona-max">Percentagem máxima</Label>
                                <Input
                                    id="editar-zona-max"
                                    value={editTrainingZoneForm.data.percentagem_max}
                                    onChange={(event) => editTrainingZoneForm.setData('percentagem_max', event.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setTrainingZoneEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editTrainingZoneForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={absenceReasonEditOpen} onOpenChange={setAbsenceReasonEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Motivo de Ausência</DialogTitle>
                        <DialogDescription>Atualize os dados do motivo selecionado.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEditAbsenceReason} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editar-ausencia-codigo">Código</Label>
                                <Input
                                    id="editar-ausencia-codigo"
                                    value={editAbsenceReasonForm.data.codigo}
                                    onChange={(event) => editAbsenceReasonForm.setData('codigo', event.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="editar-ausencia-nome">Nome</Label>
                                <Input
                                    id="editar-ausencia-nome"
                                    value={editAbsenceReasonForm.data.nome}
                                    onChange={(event) => editAbsenceReasonForm.setData('nome', event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="editar-ausencia-just"
                                type="checkbox"
                                checked={editAbsenceReasonForm.data.requer_justificacao}
                                onChange={(event) => editAbsenceReasonForm.setData('requer_justificacao', event.target.checked)}
                            />
                            <Label htmlFor="editar-ausencia-just">Requer justificação</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAbsenceReasonEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editAbsenceReasonForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={injuryReasonEditOpen} onOpenChange={setInjuryReasonEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Motivo de Lesão</DialogTitle>
                        <DialogDescription>Atualize os dados do motivo selecionado.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEditInjuryReason} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editar-lesao-codigo">Código</Label>
                                <Input
                                    id="editar-lesao-codigo"
                                    value={editInjuryReasonForm.data.codigo}
                                    onChange={(event) => editInjuryReasonForm.setData('codigo', event.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="editar-lesao-nome">Nome</Label>
                                <Input
                                    id="editar-lesao-nome"
                                    value={editInjuryReasonForm.data.nome}
                                    onChange={(event) => editInjuryReasonForm.setData('nome', event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="editar-lesao-gravidade">Gravidade</Label>
                            <Input
                                id="editar-lesao-gravidade"
                                value={editInjuryReasonForm.data.gravidade}
                                onChange={(event) =>
                                    editInjuryReasonForm.setData(
                                        'gravidade',
                                        (event.target.value || 'media') as 'leve' | 'media' | 'grave'
                                    )
                                }
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setInjuryReasonEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editInjuryReasonForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={poolTypeEditOpen} onOpenChange={setPoolTypeEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Tipo de Piscina</DialogTitle>
                        <DialogDescription>Atualize os dados do tipo selecionado.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEditPoolType} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editar-pool-codigo">Código</Label>
                                <Input
                                    id="editar-pool-codigo"
                                    value={editPoolTypeForm.data.codigo}
                                    onChange={(event) => editPoolTypeForm.setData('codigo', event.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="editar-pool-nome">Nome</Label>
                                <Input
                                    id="editar-pool-nome"
                                    value={editPoolTypeForm.data.nome}
                                    onChange={(event) => editPoolTypeForm.setData('nome', event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="editar-pool-comprimento">Comprimento (m)</Label>
                            <Input
                                id="editar-pool-comprimento"
                                value={editPoolTypeForm.data.comprimento_m}
                                onChange={(event) => editPoolTypeForm.setData('comprimento_m', event.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPoolTypeEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editPoolTypeForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );

    if (embedded) {
        return content;
    }

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Configurações Desportivo</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Catálogos técnicos usados no módulo Desportivo.
                    </p>
                </div>
            }
        >
            <Head title="Configurações Desportivo" />
            {content}
        </AuthenticatedLayout>
    );
}
