<?php

namespace App\Http\Controllers;

use App\Models\EventAttendance;
use App\Models\Familia;
use App\Models\Invoice;
use App\Models\TrainingAthlete;
use App\Models\User;
use App\Models\UserDocument;
use App\Services\AccessControl\UserTypeAccessControlService;
use App\Services\Family\FamilyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class FamilyPortalController extends Controller
{
    /**
     * @var array<string>
     */
    private const ALLOWED_FAMILY_ROLES = [
        'educando',
        'familiar',
        'encarregado_educacao',
    ];

    public function show(FamilyService $familyService, UserTypeAccessControlService $accessControlService): Response
    {
        /** @var User $user */
        $user = auth()->user();
        $accessControl = $accessControlService->getCurrentUserAccess($user);
        $families = $familyService->familiesForPortal($user);

        abort_if($families->isEmpty(), 403);

        $educandos = $families
            ->flatMap(fn (array $family) => collect($family['members'] ?? []))
            ->filter(function (array $member) use ($user) {
                return ($member['id'] ?? null) !== $user->id
                    && ($member['can_view'] ?? false)
                    && $this->normalizeRole($member['papel_na_familia'] ?? null) === 'educando';
            })
            ->unique('id')
            ->values();

        $educandoIds = $educandos->pluck('id')->filter()->values();

        $pagamentos = $educandoIds->isEmpty()
            ? collect()
            : Invoice::query()
                ->with(['user:id,name,nome_completo'])
                ->whereIn('user_id', $educandoIds)
                ->where('oculta', false)
                ->where('estado_pagamento', '!=', 'pago')
                ->orderByRaw('CASE WHEN data_vencimento IS NULL THEN 1 ELSE 0 END')
                ->orderBy('data_vencimento')
                ->take(6)
                ->get();

        $proximosTreinos = $educandoIds->isEmpty()
            ? collect()
            : TrainingAthlete::query()
                ->with([
                    'user:id,name,nome_completo',
                    'training:id,numero_treino,data,hora_inicio,local,tipo_treino',
                ])
                ->whereIn('user_id', $educandoIds)
                ->whereHas('training', function ($query) {
                    $query->whereDate('data', '>=', now()->toDateString());
                })
                ->get()
                ->filter(fn (TrainingAthlete $record) => $record->training !== null)
                ->sortBy(fn (TrainingAthlete $record) => sprintf(
                    '%s %s',
                    $record->training?->data?->toDateString() ?? '9999-12-31',
                    $record->training?->hora_inicio ?? '23:59'
                ))
                ->values()
                ->take(6);

        $convocatoriasPendentes = $educandoIds->isEmpty()
            ? collect()
            : EventAttendance::query()
                ->with([
                    'user:id,name,nome_completo',
                    'event:id,titulo,data_inicio,hora_inicio,local,tipo,estado',
                ])
                ->whereIn('user_id', $educandoIds)
                ->whereHas('event', function ($query) {
                    $query->whereDate('data_inicio', '>=', now()->toDateString())
                        ->where('estado', '!=', 'cancelado');
                })
                ->get()
                ->filter(fn (EventAttendance $attendance) => $attendance->event !== null)
                ->sortBy(fn (EventAttendance $attendance) => sprintf(
                    '%s %s',
                    $attendance->event?->data_inicio?->toDateString() ?? '9999-12-31',
                    $attendance->event?->hora_inicio ?? '23:59'
                ))
                ->values()
                ->take(6);

        $documentosAlerta = $educandoIds->isEmpty()
            ? collect()
            : UserDocument::query()
                ->with(['user:id,name,nome_completo'])
                ->whereIn('user_id', $educandoIds)
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '<=', now()->addDays(30)->toDateString())
                ->orderBy('expiry_date')
                ->take(6)
                ->get();

        $pagamentosPorEducando = $pagamentos->groupBy('user_id');
        $treinosPorEducando = $proximosTreinos->groupBy('user_id');
        $convocatoriasPorEducando = $convocatoriasPendentes->groupBy('user_id');
        $documentosPorEducando = $documentosAlerta->groupBy('user_id');

        $educandosPayload = $educandos->map(function (array $educando) use (
            $pagamentosPorEducando,
            $treinosPorEducando,
            $convocatoriasPorEducando,
            $documentosPorEducando
        ) {
            $nextTraining = $treinosPorEducando->get($educando['id'])?->first()?->training;

            return [
                'id' => $educando['id'],
                'name' => $educando['name'],
                'email' => $educando['email'] ?? null,
                'numero_socio' => $educando['numero_socio'] ?? null,
                'escalao' => collect($educando['escalao'] ?? [])->filter()->first(),
                'estado' => $educando['estado'] ?? null,
                'foto_perfil' => $educando['foto_perfil'] ?? null,
                'member_url' => route('portal.profile', ['member' => $educando['id']]),
                'pending_payments' => $pagamentosPorEducando->get($educando['id'], collect())->count(),
                'pending_documents' => $documentosPorEducando->get($educando['id'], collect())->count(),
                'pending_convocations' => $convocatoriasPorEducando->get($educando['id'], collect())->count(),
                'next_training' => $nextTraining ? [
                    'title' => $nextTraining->numero_treino ?: 'Treino agendado',
                    'date' => $nextTraining->data?->toDateString(),
                    'time' => $nextTraining->hora_inicio,
                    'location' => $nextTraining->local,
                ] : null,
            ];
        })->values()->all();

        return Inertia::render('Portal/Family', [
            'user' => [
                'id' => $user->id,
                'name' => $this->displayName($user),
                'email' => $user->email,
            ],
            'familyMember' => [
                'id' => $user->id,
                'name' => $this->displayName($user),
                'email' => $user->email,
                'numero_socio' => $user->numero_socio,
                'foto_perfil' => $user->foto_perfil,
                'estado' => $user->estado,
            ],
            'families' => $families->values()->all(),
            'is_also_admin' => $familyService->userHasAdministratorProfile($user),
            'is_encarregado_educacao' => $familyService->userHasEducandos($user),
            'is_also_athlete' => $this->userIsAtleta($user, $accessControl),
            'educandos' => $educandosPayload,
            'familySummary' => [
                'total_educandos' => (int) $familyService->familySummary($user)['educandos'],
                'pagamentos_pendentes' => $pagamentos->count(),
                'pagamentos_pendentes_valor' => (float) $pagamentos->sum('valor_total'),
                'convocatorias_pendentes' => $convocatoriasPendentes->count(),
                'proximos_treinos' => $proximosTreinos->count(),
                'documentos_alerta' => $documentosAlerta->count(),
            ],
            'pagamentos' => $pagamentos->map(fn (Invoice $invoice) => [
                'id' => $invoice->id,
                'user_id' => $invoice->user_id,
                'user_name' => $this->displayName($invoice->user),
                'mes' => $invoice->mes,
                'valor' => $invoice->valor_total,
                'estado' => $invoice->estado_pagamento,
                'data_vencimento' => $invoice->data_vencimento?->toDateString(),
            ])->values()->all(),
            'convocatorias_pendentes' => $convocatoriasPendentes->map(fn (EventAttendance $attendance) => [
                'id' => $attendance->id,
                'user_id' => $attendance->user_id,
                'user_name' => $this->displayName($attendance->user),
                'title' => $attendance->event?->titulo,
                'date' => $attendance->event?->data_inicio?->toDateString(),
                'time' => $attendance->event?->hora_inicio,
                'location' => $attendance->event?->local,
                'type' => $attendance->event?->tipo,
            ])->values()->all(),
            'proximos_treinos' => $proximosTreinos->map(fn (TrainingAthlete $record) => [
                'id' => $record->id,
                'user_id' => $record->user_id,
                'user_name' => $this->displayName($record->user),
                'title' => $record->training?->numero_treino,
                'date' => $record->training?->data?->toDateString(),
                'time' => $record->training?->hora_inicio,
                'location' => $record->training?->local,
                'type' => $record->training?->tipo_treino,
            ])->values()->all(),
            'documentos_alerta' => $documentosAlerta->map(fn (UserDocument $document) => [
                'id' => $document->id,
                'user_id' => $document->user_id,
                'user_name' => $this->displayName($document->user),
                'name' => $document->name,
                'type' => $document->type,
                'expiry_date' => $document->expiry_date?->toDateString(),
            ])->values()->all(),
            'comunicados_relevantes' => [],
            'perfil_tipos' => $this->resolveProfileTypes($user, $accessControl),
            'athlete_portal_url' => $this->userIsAtleta($user, $accessControl) ? route('dashboard') : null,
            'has_family' => $familyService->userHasFamily($user),
            'modulos_visiveis' => $accessControl['visibleMenuModules'] ?? [],
        ]);
    }

    public function searchMembers(Request $request, FamilyService $familyService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($this->canManagePortalFamily($user, $familyService), 403);

        $search = trim((string) $request->string('search')->value());

        if (mb_strlen($search) < 2) {
            return response()->json([
                'results' => [],
            ]);
        }

        $excludedIds = $familyService->portalMembers($user)
            ->pluck('id')
            ->push($user->id)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $results = User::query()
            ->whereNotIn('id', $excludedIds)
            ->where(function ($query) use ($search) {
                $query->where('nome_completo', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('numero_socio', 'like', "%{$search}%");
            })
            ->orderByRaw('COALESCE(nome_completo, name) asc')
            ->limit(8)
            ->get(['id', 'nome_completo', 'name', 'email', 'numero_socio', 'foto_perfil', 'estado', 'tipo_membro'])
            ->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $this->displayName($member),
                'email' => $member->email,
                'numero_socio' => $member->numero_socio,
                'foto_perfil' => $member->foto_perfil,
                'estado' => $member->estado,
                'tipo_membro' => is_array($member->tipo_membro) ? $member->tipo_membro : (array) $member->tipo_membro,
            ])
            ->values()
            ->all();

        return response()->json([
            'results' => $results,
        ]);
    }

    public function storeMember(Request $request, FamilyService $familyService): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($this->canManagePortalFamily($user, $familyService), 403);

        $validated = $request->validate([
            'member_id' => ['required', 'exists:users,id'],
            'papel_na_familia' => ['required', Rule::in(self::ALLOWED_FAMILY_ROLES)],
        ]);

        $family = $familyService->ensureFamilyForManager($user);
        abort_unless($familyService->userCanManageFamily($user, $family), 403);

        if ($family->members()->whereKey($validated['member_id'])->exists()) {
            return back()->withErrors([
                'member_id' => 'Este membro já está associado à família.',
            ]);
        }

        $role = $this->normalizeRole($validated['papel_na_familia']);

        $family->members()->attach($validated['member_id'], [
            'id' => (string) Str::uuid(),
            'papel_na_familia' => $role,
            'pode_editar' => in_array($role, ['responsavel', 'encarregado_educacao'], true),
            'pode_ver_financeiro' => true,
            'pode_ver_desportivo' => true,
            'pode_ver_documentos' => true,
            'pode_ver_comunicacoes' => true,
        ]);

        $this->syncLegacyGuardianLinks($family->fresh('members'), $user, $validated['member_id'], $role);

        return redirect()->route('portal.family');
    }

    private function displayName(User $user): string
    {
        return trim((string) ($user->nome_completo ?: $user->name)) ?: 'Utilizador';
    }

    private function canManagePortalFamily(User $user, FamilyService $familyService): bool
    {
        return $familyService->userCanAccessAdmin($user)
            || $familyService->userHasFamily($user)
            || $familyService->userHasEducandos($user);
    }

    private function normalizeRole(?string $value): string
    {
        return (string) str($value)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', '_')
            ->trim('_')
            ->value();
    }

    private function syncLegacyGuardianLinks(Familia $family, User $manager, string $memberId, string $role): void
    {
        if (! in_array($role, ['educando', 'encarregado_educacao'], true)) {
            return;
        }

        $educandoIds = $family->members
            ->filter(fn (User $member) => $this->normalizeRole($member->pivot?->papel_na_familia) === 'educando')
            ->pluck('id')
            ->filter()
            ->unique()
            ->values();

        if ($role === 'educando') {
            DB::table('user_guardian')->updateOrInsert([
                'user_id' => $memberId,
                'guardian_id' => $manager->id,
            ], [
                'id' => (string) Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return;
        }

        $educandoIds->each(function (string $educandoId) use ($memberId) {
            DB::table('user_guardian')->updateOrInsert([
                'user_id' => $educandoId,
                'guardian_id' => $memberId,
            ], [
                'id' => (string) Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }

    private function resolveProfileTypes(User $user, array $accessControl): array
    {
        $currentUserType = $accessControl['currentUserType'] ?? [];
        $activeUserTypes = $user->relationLoaded('userTypes')
            ? $user->userTypes
            : $user->userTypes()->where('ativo', true)->get();

        return collect([
            $currentUserType['nome'] ?? null,
            $user->perfil,
        ])
            ->merge(is_array($user->tipo_membro) ? $user->tipo_membro : (array) $user->tipo_membro)
            ->merge($activeUserTypes->pluck('nome'))
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function userIsAtleta(User $user, array $accessControl): bool
    {
        $aliases = collect(['atleta'])
            ->map(fn (string $alias) => $this->normalizeRole($alias))
            ->filter()
            ->unique()
            ->values();

        $currentUserType = $accessControl['currentUserType'] ?? [];
        $activeUserTypes = $user->relationLoaded('userTypes')
            ? $user->userTypes
            : $user->userTypes()->where('ativo', true)->get();

        $candidates = collect([
            $currentUserType['codigo'] ?? null,
            $currentUserType['nome'] ?? null,
            $user->perfil,
        ])
            ->merge(is_array($user->tipo_membro) ? $user->tipo_membro : (array) $user->tipo_membro)
            ->merge($activeUserTypes->pluck('codigo'))
            ->merge($activeUserTypes->pluck('nome'))
            ->map(fn ($value) => $this->normalizeRole((string) $value))
            ->filter()
            ->unique();

        return $candidates->intersect($aliases)->isNotEmpty();
    }
}