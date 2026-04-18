<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\Event;
use App\Models\Invoice;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = Cache::remember('dashboard:stats', 60, function () {
            return [
                'totalMembers' => User::count(),
                'activeAthletes' => User::whereJsonContains('tipo_membro', 'atleta')
                    ->where('estado', 'ativo')
                    ->count(),
                'guardians' => User::whereJsonContains('tipo_membro', 'encarregado_educacao')->count(),
                'upcomingEvents' => Event::where('data_inicio', '>=', now())
                    ->where('estado', 'agendado')
                    ->count(),
                'monthlyRevenue' => Invoice::whereMonth('data_emissao', now()->month)
                    ->whereYear('data_emissao', now()->year)
                    ->where('estado_pagamento', 'pago')
                    ->sum('valor_total'),
                'totalUserTypes' => UserType::count(),
                'totalAgeGroups' => AgeGroup::count(),
            ];
        });

        $recentEvents = Cache::remember('dashboard:recent_events', 60, fn () =>
            Event::with(['creator:id,name'])
                ->select('id', 'titulo', 'data_inicio', 'estado', 'created_at', 'criado_por')
                ->latest()
                ->take(5)
                ->get()
        );

        $recentActivity = Cache::remember('dashboard:recent_activity', 60, fn () =>
            $this->getRecentActivity()
        );

        $userTypes = Cache::remember('dashboard:user_types', 300, fn () =>
            UserType::where('ativo', true)->get()
        );

        $ageGroups = Cache::remember('dashboard:age_groups', 300, fn () =>
            AgeGroup::all()
        );

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentEvents' => $recentEvents,
            'recentActivity' => $recentActivity,
            'userTypes' => $userTypes,
            'ageGroups' => $ageGroups,
        ]);
    }

    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent user registrations — select only needed columns
        $recentUsers = User::latest()->take(3)->select('id', 'name', 'created_at')->get();
        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user_registered',
                'description' => "Novo membro: {$user->name}",
                'created_at' => $user->created_at,
            ];
        }

        // Recent events — select only needed columns
        $recentEvents = Event::latest()->take(3)->select('id', 'titulo', 'created_at')->get();
        foreach ($recentEvents as $event) {
            $activities[] = [
                'type' => 'event_created',
                'description' => "Evento criado: {$event->titulo}",
                'created_at' => $event->created_at,
            ];
        }

        // Sort by date and limit
        usort($activities, fn($a, $b) => $b['created_at'] <=> $a['created_at']);

        return array_slice($activities, 0, 10);
    }
}