<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\Event;
use App\Models\Invoice;
use App\Models\Result;
use App\Models\Presence;
use App\Services\Performance\AuthenticatedModuleWarmupService;
use App\Services\AccessControl\UserTypeAccessControlService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    /**
     * Normalized codes that identify admin/staff user types.
     * Applied after ->lower()->ascii() normalization, so accented variants need not be listed.
     *
     * @var array<string>
     */
    private const ADMIN_TYPE_CODES = [
        'admin', 'administrador', 'direcao', 'gestor', 'staff', 'tecnico',
    ];

    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();
        $accessControl = app(UserTypeAccessControlService::class)->getCurrentUserAccess($user);

        $forceAdmin = request()->query('mode') === 'admin';

        if (! $forceAdmin && $this->isSimpleUser($user, $accessControl)) {
            return $this->renderAthleteView($user, $accessControl);
        }

        app(AuthenticatedModuleWarmupService::class)->scheduleForUser($user);

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

    private function isSimpleUser(User $user, array $accessControl): bool
    {
        $currentUserType = $accessControl['currentUserType'] ?? null;

        if ($currentUserType !== null) {
            $codigo = Str::of((string) ($currentUserType['codigo'] ?? ''))->lower()->ascii()->value();
            $nome   = Str::of((string) ($currentUserType['nome']   ?? ''))->lower()->ascii()->value();
            if (in_array($codigo, self::ADMIN_TYPE_CODES, true) || in_array($nome, self::ADMIN_TYPE_CODES, true)) {
                return false;
            }
            return true;
        }

        $perfil = Str::lower(trim((string) $user->perfil));
        return in_array($perfil, ['atleta', 'user'], true);
    }

    private function userHasAdminType(User $user): bool
    {
        return $user->userTypes()
            ->where('ativo', true)
            ->get()
            ->contains(function (UserType $ut) {
                $codigo = Str::of((string) $ut->codigo)->lower()->ascii()->value();
                $nome   = Str::of((string) $ut->nome)->lower()->ascii()->value();
                return in_array($codigo, self::ADMIN_TYPE_CODES, true) || in_array($nome, self::ADMIN_TYPE_CODES, true);
            });
    }

    private function formatSwimTime(float $centiseconds): string
    {
        $total = (int) round($centiseconds);
        $cs    = $total % 100;
        $total = intdiv($total, 100);
        $s     = $total % 60;
        $total = intdiv($total, 60);
        $m     = $total % 60;
        $h     = intdiv($total, 60);

        if ($h > 0) {
            return sprintf('%d:%02d:%02d.%02d', $h, $m, $s, $cs);
        }
        return sprintf('%d:%02d.%02d', $m, $s, $cs);
    }

    private function renderAthleteView(User $user, array $accessControl): Response
    {
        $uid = $user->id;

        $proximos_eventos = Cache::remember("athlete_dashboard:{$uid}:events", 60, function () use ($user) {
            $attendedEventIds = \App\Models\EventAttendance::where('user_id', $user->id)
                ->pluck('evento_id');

            return Event::whereIn('id', $attendedEventIds)
                ->where('data_inicio', '>=', now()->toDateString())
                ->where('estado', '!=', 'cancelado')
                ->orderBy('data_inicio')
                ->take(5)
                ->get(['id', 'titulo', 'data_inicio', 'hora_inicio', 'local', 'estado', 'tipo'])
                ->map(fn ($e) => [
                    'id'          => $e->id,
                    'titulo'      => $e->titulo,
                    'data_inicio' => $e->data_inicio?->toDateString(),
                    'hora_inicio' => $e->hora_inicio,
                    'local'       => $e->local,
                    'estado'      => $e->estado,
                    'tipo'        => $e->tipo,
                ])
                ->values()
                ->all();
        });

        $ultimos_resultados = Cache::remember("athlete_dashboard:{$uid}:results", 120, function () use ($user) {
            return Result::where('user_id', $user->id)
                ->with(['prova.competition'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function (Result $r) {
                    $prova = $r->prova;
                    $comp  = $prova?->competition;
                    return [
                        'id'              => $r->id,
                        'competicao'      => $comp?->nome,
                        'data'            => $comp?->data_inicio?->toDateString(),
                        'estilo'          => $prova?->estilo,
                        'distancia_m'     => $prova?->distancia_m,
                        'tempo_formatado' => $r->tempo_oficial !== null
                            ? $this->formatSwimTime((float) $r->tempo_oficial)
                            : null,
                        'posicao'         => $r->posicao,
                        'desclassificado' => $r->desclassificado,
                    ];
                })
                ->values()
                ->all();
        });

        $treinos_mes = Cache::remember("athlete_dashboard:{$uid}:presences", 60, function () use ($user) {
            return Presence::where('user_id', $user->id)
                ->whereMonth('data', now()->month)
                ->whereYear('data', now()->year)
                ->where('is_legacy', false)
                ->count();
        });

        $mensalidades = Cache::remember("athlete_dashboard:{$uid}:invoices", 60, function () use ($user) {
            return Invoice::where('user_id', $user->id)
                ->where('oculta', false)
                ->latest('data_emissao')
                ->take(6)
                ->get()
                ->map(fn (Invoice $inv) => [
                    'id'     => $inv->id,
                    'mes'    => $inv->mes,
                    'valor'  => $inv->valor_total,
                    'estado' => $inv->estado_pagamento,
                ])
                ->values()
                ->all();
        });

        $escaloes = $user->escalao ?? [];
        $escalao  = $escaloes[0] ?? null;

        $athlete = [
            'name'          => $user->name,
            'escalao'       => $escalao,
            'numero_socio'  => $user->numero_socio,
            'foto_perfil'   => $user->foto_perfil,
            'estado'        => $user->estado,
            'conta_corrente' => $user->conta_corrente,
        ];

        return Inertia::render('Dashboard/Atleta', [
            'athlete'            => $athlete,
            'proximos_eventos'   => $proximos_eventos,
            'ultimos_resultados' => $ultimos_resultados,
            'treinos_mes'        => $treinos_mes,
            'mensalidades'       => $mensalidades,
            'modulos_visiveis'   => $accessControl['visibleMenuModules'] ?? [],
            'is_also_admin'      => $this->userHasAdminType($user),
        ]);
    }
}