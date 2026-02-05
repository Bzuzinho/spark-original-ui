import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card } from '@/Components/ui/card';
import { ListChecks, CalendarBlank, PaperPlaneTilt, ClipboardText, Gear, ChartBar, Trophy } from '@phosphor-icons/react';

interface Event {
    id: string;
    titulo: string;
    data_inicio: string;
    data_fim?: string;
    tipo: string;
    estado: string;
    local?: string;
    descricao?: string;
}

interface EventStats {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    activeConvocatorias: number;
}

interface User {
    id: string;
    nome: string;
    email: string;
}

interface Props {
    eventos: Event[];
    stats: EventStats;
    users: User[];
}

// Placeholder components for each tab
function CalendarioTab() {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Vista de Calendário</h2>
            <p className="text-muted-foreground text-sm">
                Calendário de eventos em desenvolvimento. Esta vista mostrará todos os eventos organizados por data.
            </p>
        </Card>
    );
}

function EventosTab({ eventos }: { eventos: Event[] }) {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Lista de Eventos</h2>
            <p className="text-muted-foreground text-sm mb-4">
                Gestão completa de eventos. {eventos.length} evento(s) registado(s).
            </p>
            <div className="space-y-2">
                {eventos.slice(0, 5).map(evento => (
                    <div key={evento.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="font-medium text-sm">{evento.titulo}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(evento.data_inicio).toLocaleDateString('pt-PT')}
                            </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {evento.tipo}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function ConvocatoriasTab() {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Convocatórias</h2>
            <p className="text-muted-foreground text-sm">
                Sistema de convocatórias para eventos. Gerir atletas convocados, notificações e confirmações.
            </p>
        </Card>
    );
}

function PresencasTab() {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Registo de Presenças</h2>
            <p className="text-muted-foreground text-sm">
                Controlo de presenças nos eventos. Marcar atletas presentes, ausentes ou justificados.
            </p>
        </Card>
    );
}

function ResultadosTab() {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Resultados</h2>
            <p className="text-muted-foreground text-sm">
                Registo de resultados de jogos e competições. Marcadores, estatísticas e classificações.
            </p>
        </Card>
    );
}

function RelatoriosTab() {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Relatórios</h2>
            <p className="text-muted-foreground text-sm">
                Relatórios e análises de eventos, presenças e resultados. Estatísticas detalhadas por atleta e equipa.
            </p>
        </Card>
    );
}

function ConfiguracaoTab() {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Configuração</h2>
            <p className="text-muted-foreground text-sm">
                Configurações do módulo de eventos. Tipos de eventos, locais, notificações e preferências.
            </p>
        </Card>
    );
}

export default function EventosIndex({ eventos = [], stats, users = [] }: Props) {
    const [activeTab, setActiveTab] = useState('calendario');

    const safeStats = {
        totalEvents: stats?.totalEvents ?? 0,
        upcomingEvents: stats?.upcomingEvents ?? 0,
        completedEvents: stats?.completedEvents ?? 0,
        activeConvocatorias: stats?.activeConvocatorias ?? 0,
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Eventos</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Sistema completo de gestão de eventos, convocatórias e presenças
                    </p>
                </div>
            }
        >
            <Head title="Gestão de Eventos" />

            <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
                    <TabsList className="grid grid-cols-7 w-full h-auto p-1">
                        <TabsTrigger value="calendario" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
                            <CalendarBlank size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Calendário</span>
                        </TabsTrigger>
                        <TabsTrigger value="eventos" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
                            <ListChecks size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Eventos</span>
                        </TabsTrigger>
                        <TabsTrigger value="convocatorias" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
                            <PaperPlaneTilt size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Convocatórias</span>
                        </TabsTrigger>
                        <TabsTrigger value="presencas" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
                            <ClipboardText size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Presenças</span>
                        </TabsTrigger>
                        <TabsTrigger value="resultados" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
                            <Trophy size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Resultados</span>
                        </TabsTrigger>
                        <TabsTrigger value="relatorios" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
                            <ChartBar size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Relatórios</span>
                        </TabsTrigger>
                        <TabsTrigger value="configuracao" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
                            <Gear size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Config</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calendario" className="space-y-3">
                        <CalendarioTab />
                    </TabsContent>

                    <TabsContent value="eventos" className="space-y-3">
                        <EventosTab eventos={eventos} />
                    </TabsContent>

                    <TabsContent value="convocatorias" className="space-y-3">
                        <ConvocatoriasTab />
                    </TabsContent>

                    <TabsContent value="presencas" className="space-y-3">
                        <PresencasTab />
                    </TabsContent>

                    <TabsContent value="resultados" className="space-y-3">
                        <ResultadosTab />
                    </TabsContent>

                    <TabsContent value="relatorios" className="space-y-3">
                        <RelatoriosTab />
                    </TabsContent>

                    <TabsContent value="configuracao" className="space-y-3">
                        <ConfiguracaoTab />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
