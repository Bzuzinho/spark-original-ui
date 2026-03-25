<?php

namespace App\Services\Loja;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class StoreProfileResolver
{
    public function allowedProfiles(User $user): Collection
    {
        $educandos = $user->educandos()
            ->select('users.id', 'users.nome_completo')
            ->get();

        return collect([$user])
            ->merge($educandos)
            ->unique('id')
            ->values();
    }

    public function normalizeTargetUserId(User $user, ?string $targetUserId): ?string
    {
        $targetUserId = $targetUserId ?: $user->id;

        $allowedIds = $this->allowedProfiles($user)->pluck('id')->all();

        if (!in_array($targetUserId, $allowedIds, true)) {
            throw ValidationException::withMessages([
                'target_user_id' => 'Perfil de compra inválido para este utilizador.',
            ]);
        }

        return $targetUserId === $user->id ? null : $targetUserId;
    }
}
