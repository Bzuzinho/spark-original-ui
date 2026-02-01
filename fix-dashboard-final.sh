#!/bin/bash

echo "=== FIX DASHBOARD - LARAVEL + SPARK HYBRID ==="
echo ""

# Verificar que estamos no projeto correto
if [ ! -f "artisan" ]; then
    echo "❌ ERRO: artisan não encontrado!"
    exit 1
fi

echo "✅ Projeto Laravel detectado"
echo ""

# 1. Backup
echo "1️⃣ Backup..."
cp resources/js/Pages/Dashboard.tsx resources/js/Pages/Dashboard.tsx.backup-$(date +%s)
echo "✅ Backup criado"

# 2. Aplicar código corrigido
echo ""
echo "2️⃣ Aplicando código corrigido..."
cat > resources/js/Pages/Dashboard.tsx << 'ENDOFCODE'
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Users, Trophy, CalendarBlank, CurrencyCircleDollar, Heartbeat, UserCircle } from '@phosphor-icons/react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { router } from '@inertiajs/react';

interface Event {
    id: string;
    titulo: string;
    data_inicio: string;
    tipo: string;
    estado: string;
}

interface FinancialEntry {
    id: string;
    descricao: string;
    data: string;
    valor: number;
    tipo: 'receita' | 'despesa';
}

interface Props {
    stats: {
        totalMembers: number;
        activeAthletes: number;
        guardians: number;
        upcomingEvents: number;
        monthlyRevenue: number;
    };
    recentEvents: Event[];
    recentActivity: FinancialEntry[];
}

export default function Dashboard({ stats, recentEvents = [], recentActivity = [] }: Props) {
    // ===== VALIDAÇÃO CRÍTICA =====
    const safeStats = {
        totalMembers: stats?.totalMembers ?? 0,
        activeAthletes: stats?.activeAthletes ?? 0,
        guardians: stats?.guardians ?? 0,
        upcomingEvents: stats?.upcomingEvents ?? 0,
        monthlyRevenue: stats?.monthlyRevenue ?? 0,
    };
    // ============================

    const handleNavigate = (view: string) => {
        const routes: Record<string, string> = {
            'members': '/membros',
            'sports': '/desportivo',
            'events': '/eventos',
            'financial': '/financeiro'
        };
        router.visit(routes[view] || '/dashboard');
    };

    const statsConfig = [
        {
            title: 'Membros Ativos',
            value: safeStats.totalMembers,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            view: 'members'
        },
        {
            title: 'Atletas Ativos',
            value: safeStats.activeAthletes,
            icon: Heartbeat,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            view: 'members'
        },
        {
            title: 'Encarregados de Educação',
            value: safeStats.guardians,
            icon: UserCircle,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
            view: 'members'
        },
        {
            title: 'Eventos Próximos',
            value: safeStats.upcomingEvents,
            icon: CalendarBlank,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            view: 'events'
        },
        {
            title: 'Receitas do Mês',
            value: `€${safeStats.monthlyRevenue.toFixed(2)}`,
            icon: CurrencyCircleDollar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            view: 'financial'
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">Visão geral do clube</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="w-full px-2 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
                <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {statsConfig.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={stat.title}
                                className="p-2 sm:p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                                onClick={() => handleNavigate(stat.view)}
                            >
                                <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-muted-foreground font-medium leading-tight truncate">{stat.title}</p>
                                        <p className="text-base sm:text-xl font-bold mt-0.5 truncate">{stat.value}</p>
                                    </div>
                                    <div className={`p-1.5 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                                        <Icon className={stat.color} size={16} weight="bold" />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
                    <Card className="p-2 sm:p-3 overflow-hidden">
                        <h2 className="text-sm sm:text-base font-semibold mb-2">Próximos Eventos</h2>
                        {recentEvents && recentEvents.length > 0 ? (
                            <div className="space-y-1.5 overflow-hidden">
                                {recentEvents.slice(0, 3).map(event => (
                                    <div key={event.id} className="flex items-center justify-between p-1.5 border rounded-lg gap-2 overflow-hidden">
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <p className="font-medium text-xs truncate">{event.titulo}</p>
                                            <p className="text-[10px] xs:text-xs text-muted-foreground truncate">
                                                {new Date(event.data_inicio).toLocaleDateString('pt-PT')}
                                            </p>
                                        </div>
                                        <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded whitespace-nowrap flex-shrink-0">
                                            {event.tipo}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-3 text-xs">Nenhum evento agendado</p>
                        )}
                        <Button variant="outline" className="w-full mt-2 h-7 text-xs" onClick={() => handleNavigate('events')}>
                            Ver Todos os Eventos
                        </Button>
                    </Card>

                    <Card className="p-2 sm:p-3 overflow-hidden">
                        <h2 className="text-sm sm:text-base font-semibold mb-2">Atividade Recente</h2>
                        {recentActivity && recentActivity.length > 0 ? (
                            <div className="space-y-1.5 overflow-hidden">
                                {recentActivity.slice(0, 3).map(entry => (
                                    <div key={entry.id} className="flex items-center justify-between p-1.5 border rounded-lg gap-2 overflow-hidden">
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <p className="font-medium truncate text-xs">{entry.descricao}</p>
                                            <p className="text-[10px] xs:text-xs text-muted-foreground truncate">
                                                {new Date(entry.data).toLocaleDateString('pt-PT')}
                                            </p>
                                        </div>
                                        <span className={`font-semibold text-xs whitespace-nowrap flex-shrink-0 ${entry.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                            {entry.tipo === 'receita' ? '+' : '-'}€{entry.valor.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-3 text-xs">Nenhuma transação registada</p>
                        )}
                        <Button variant="outline" className="w-full mt-2 h-7 text-xs" onClick={() => handleNavigate('financial')}>
                            Ver Financeiro
                        </Button>
                    </Card>
                </div>

                <Card className="p-2 sm:p-3">
                    <h2 className="text-sm sm:text-base font-semibold mb-2">Acesso Rápido</h2>
                    <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                        <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => handleNavigate('members')}>
                            <Users size={18} />
                            <span className="text-xs">Membros</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => handleNavigate('sports')}>
                            <Trophy size={18} />
                            <span className="text-xs">Desportiva</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => handleNavigate('events')}>
                            <CalendarBlank size={18} />
                            <span className="text-xs">Eventos</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-2 sm:py-2.5 flex-col gap-1" onClick={() => handleNavigate('financial')}>
                            <CurrencyCircleDollar size={18} />
                            <span className="text-xs">Financeiro</span>
                        </Button>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
ENDOFCODE

echo "✅ Código aplicado"

# 3. Verificar
echo ""
echo "3️⃣ Verificando..."
if grep -q "safeStats" resources/js/Pages/Dashboard.tsx; then
    echo "✅ safeStats confirmado"
else
    echo "❌ safeStats não encontrado!"
    exit 1
fi

# 4. Limpar cache Vite
echo ""
echo "4️⃣ Limpando cache..."
rm -rf public/build
rm -rf node_modules/.vite
echo "✅ Cache limpo"

# 5. Rebuild (SEM --force)
echo ""
echo "5️⃣ Rebuild..."
npm run build

# 6. Verificar
echo ""
echo "6️⃣ Resultado:"
if [ -d "public/build" ]; then
    echo "✅ Build criado"
    ls -lah public/build/assets/ | grep Dashboard
else
    echo "❌ Build falhou"
    exit 1
fi

echo ""
echo "✅✅✅ FIX COMPLETO! ✅✅✅"
echo ""
echo "AGORA:"
echo "1. php artisan serve --host=0.0.0.0 --port=8000"
echo "2. Browser: CTRL+SHIFT+DELETE → Clear cache"
echo "3. /dashboard → DEVE FUNCIONAR! 🎉"
