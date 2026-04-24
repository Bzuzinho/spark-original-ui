<?php

namespace App\Services\Loja;

use App\Models\User;
use App\Services\Family\FamilyService;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class StoreProfileResolver
{
    public function __construct(
        private readonly FamilyService $familyService,
    ) {
    }

    public function allowedProfiles(User $user): Collection
    {
        return collect([$user])
            ->merge($this->familyService->portalMembers($user))
            ->unique('id')
            ->values();
    }

    public function normalizeTargetUserId(User $user, ?string $targetUserId): ?string
    {
        $targetUserId = $targetUserId ?: $user->id;

        $allowedIds = $this->allowedProfiles($user)->pluck('id')->all();

        if (! in_array($targetUserId, $allowedIds, true)) {
            throw ValidationException::withMessages([
                'target_user_id' => 'Perfil de compra inválido para este utilizador.',
            ]);
        }

        return $targetUserId === $user->id ? null : $targetUserId;
    }
}
