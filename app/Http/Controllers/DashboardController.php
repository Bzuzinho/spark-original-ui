<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\Event;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Verificar se existem dados antes de fazer queries complexas
        $totalMembers = User::count();
        
        // Stats básicos com fallback para evitar erros
        $stats = [
            'totalMembers' => $totalMembers,
            'activeAthletes' => 0,
            'guardians' => 0,
            'upcomingEvents' => 0,
            'monthlyRevenue' => 0,
            'totalUserTypes' => UserType::count(),
            'totalAgeGroups' => AgeGroup::count(),
        ];

        // Só faz queries avançadas se houver dados
        if ($totalMembers > 0) {
            // Contar atletas ativos (tipo_membro é JSON)
            try {
                $stats['activeAthletes'] = User::whereRaw("tipo_membro::jsonb @> ?", [json_encode('atleta')])
                    ->where('estado', 'ativo')
                    ->count();
            } catch (\Exception $e) {
                // Fallback se coluna não existir ou query falhar
                $stats['activeAthletes'] = 0;
            }

            // Contar encarregados de educação
            try {
                $stats['guardians'] = User::whereRaw("tipo_membro::jsonb @> ?", [json_encode('encarregado_educacao')])
                    ->count();
            } catch (\Exception $e) {
                $stats['guardians'] = 0;
            }
        }

        // Eventos futuros (usar nome de colunas em português)
        try {
            $stats['upcomingEvents'] = Event::where('data_inicio', '>=', now())
                ->where('estado', 'agendado')
                ->count();
        } catch (\Exception $e) {
            $stats['upcomingEvents'] = 0;
        }

        // Revenue mensal (usar nomes de colunas em português)
        try {
            $stats['monthlyRevenue'] = Invoice::whereMonth('data_emissao', now()->month)
                ->whereYear('data_emissao', now()->year)
                ->where('estado_pagamento', 'pago')
                ->sum('valor_total') ?? 0;
        } catch (\Exception $e) {
            $stats['monthlyRevenue'] = 0;
        }

        // Recent events (com try/catch para evitar erros)
        $recentEvents = [];
        try {
            $recentEvents = Event::with(['creator'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($event) {
                    // Mapear para formato esperado pelo frontend
                    return [
                        'id' => $event->id,
                        'titulo' => $event->titulo,
                        'data_inicio' => $event->data_inicio,
                        'hora_inicio' => $event->hora_inicio,
                        'tipo' => $event->tipo,
                        'local' => $event->local,
                        'estado' => $event->estado,
                        'created_at' => $event->created_at,
                        'creator' => $event->creator ? [
                            'id' => $event->creator->id,
                            'name' => $event->creator->nome_completo ?? $event->creator->name,
                        ] : null,
                    ];
                });
        } catch (\Exception $e) {
            // Se falhar, retorna array vazio
            $recentEvents = [];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentEvents' => $recentEvents,
            'recentActivity' => $this->getRecentActivity(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    private function getRecentActivity(): array
    {
        $activities = [];

        try {
            // Recent user registrations
            $recentUsers = User::latest()->take(3)->get();
            foreach ($recentUsers as $user) {
                $activities[] = [
                    'type' => 'user_registered',
                    'description' => "Novo membro: " . ($user->nome_completo ?? $user->name),
                    'created_at' => $user->created_at,
                ];
            }
        } catch (\Exception $e) {
            // Ignorar erro e continuar
        }

        try {
            // Recent events
            $recentEvents = Event::latest()->take(3)->get();
            foreach ($recentEvents as $event) {
                $activities[] = [
                    'type' => 'event_created',
                    'description' => "Evento criado: {$event->titulo}",
                    'created_at' => $event->created_at,
                ];
            }
        } catch (\Exception $e) {
            // Ignorar erro e continuar
        }

        // Sort by date and limit
        if (!empty($activities)) {
            usort($activities, fn($a, $b) => $b['created_at'] <=> $a['created_at']);
            return array_slice($activities, 0, 10);
        }

        return [];
    }
}
