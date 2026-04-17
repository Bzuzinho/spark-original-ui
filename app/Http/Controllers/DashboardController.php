<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\Event;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
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
            ],
            'recentEvents' => Event::select('id', 'titulo', 'data_inicio', 'tipo', 'estado')
                ->latest()
                ->take(5)
                ->get(),
            'recentActivity' => $this->getRecentActivity(),
        ]);
    }

    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent user registrations
        $recentUsers = User::select('id', 'nome_completo', 'created_at')->latest()->take(3)->get();
        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user_registered',
                'description' => "Novo membro: {$user->nome_completo}",
                'created_at' => $user->created_at,
            ];
        }

        // Recent events
        $recentEvents = Event::select('id', 'titulo', 'created_at')->latest()->take(3)->get();
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