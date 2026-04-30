<?php

namespace App\Policies;

use App\Models\LojaEncomenda;
use App\Models\User;
use App\Services\Loja\StoreProfileResolver;

class LojaEncomendaPolicy
{
    public function __construct(
        private readonly StoreProfileResolver $profileResolver,
    ) {
    }

    public function view(User $user, LojaEncomenda $encomenda): bool
    {
        if ($user->perfil === 'admin') {
            return true;
        }

        $allowedIds = $this->profileResolver->allowedProfiles($user)->pluck('id')->all();

        return $encomenda->user_id === $user->id
            || ($encomenda->target_user_id !== null && in_array($encomenda->target_user_id, $allowedIds, true));
    }

    public function updateEstado(User $user, LojaEncomenda $encomenda): bool
    {
        return $user->perfil === 'admin';
    }
}