import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import StatsCard from '@/Components/StatsCard';
import { Users, Trophy, TrendingUp, CalendarDays } from 'lucide-react';

interface Stats {
    athletesCount: number;
    activeTeams: number;
    trainings7Days: number;
    trainings30Days: number;
    upcomingEvents: number;
}

interface Team {
    id: string;
    nome: string;
    escalao?: string;
    ativa: boolean;
    treinador?: {
        full_name: string;
    };
    members?: any[];
}

interface TrainingSession {
    id: string;
    data_hora: string;
    duracao_minutos: number;
    local?: string;
    estado: string;
    team?: {
        nome: string;
    };
}

interface DesportivoIndexProps {
    stats: Stats;
    teams: Team[];
    trainingSessions: TrainingSession[];
    athletes: any[];
    events: any[];
}

export default function DesportivoIndex({ 
    stats, 
    teams, 
    trainingSessions,
    athletes,
    events 
}: DesportivoIndexProps) {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Gestão Desportiva
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Planeamento de treinos, eventos e acompanhamento de atletas
                    </p>
                </div>
            }
        >
            <Head title="Gestão Desportiva" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6">
                            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                            <TabsTrigger value="equipas">Equipas</TabsTrigger>
                            <TabsTrigger value="treinos">Treinos</TabsTrigger>
                            <TabsTrigger value="competicoes">Competições</TabsTrigger>
                            <TabsTrigger value="convocatorias">Convocatórias</TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard" className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <StatsCard
                                    title="Atletas Ativos"
                                    value={stats.athletesCount}
                                    icon={Users}
                                    iconBgColor="#F3E8FF"
                                    iconColor="#9333EA"
                                />
                                <StatsCard
                                    title="Equipas Ativas"
                                    value={stats.activeTeams}
                                    icon={Trophy}
                                    iconBgColor="#DBEAFE"
                                    iconColor="#2563EB"
                                />
                                <StatsCard
                                    title="Treinos (7 dias)"
                                    value={stats.trainings7Days}
                                    icon={TrendingUp}
                                    iconBgColor="#D1FAE5"
                                    iconColor="#059669"
                                />
                                <StatsCard
                                    title="Próximas Competições"
                                    value={stats.upcomingEvents}
                                    icon={CalendarDays}
                                    iconBgColor="#FED7AA"
                                    iconColor="#EA580C"
                                />
                            </div>

                            {/* Additional Stats */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Resumo de Treinos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Últimos 7 dias:</span>
                                                <span className="font-semibold text-blue-600">{stats.trainings7Days} treinos</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Últimos 30 dias:</span>
                                                <span className="font-semibold text-green-600">{stats.trainings30Days} treinos</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Equipas Ativas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">
                                            {stats.activeTeams} equipa{stats.activeTeams !== 1 ? 's' : ''} em atividade
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {stats.athletesCount} atleta{stats.athletesCount !== 1 ? 's' : ''} registado{stats.athletesCount !== 1 ? 's' : ''}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="equipas" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Equipas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Gestão de equipas em desenvolvimento. Funcionalidade completa disponível em breve.
                                    </p>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">
                                            Total de equipas: {teams.length}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="treinos" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Treinos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Gestão de treinos em desenvolvimento. Funcionalidade completa disponível em breve.
                                    </p>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">
                                            Treinos recentes: {trainingSessions.length}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="competicoes" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Competições</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Gestão de competições em desenvolvimento. Funcionalidade completa disponível em breve.
                                    </p>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">
                                            Próximos eventos: {events.length}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="convocatorias" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Convocatórias</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Gestão de convocatórias em desenvolvimento. Funcionalidade completa disponível em breve.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
