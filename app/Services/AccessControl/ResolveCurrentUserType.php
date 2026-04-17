<?php

namespace App\Services\AccessControl;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Support\Str;

class ResolveCurrentUserType
{
    public function __invoke(?User $user): ?UserType
    {
        if ($user === null) {
            return null;
        }

        $assignedType = $user->userTypes()
            ->where('ativo', true)
            ->orderBy('nome')
            ->first();

        if ($assignedType !== null) {
            return $assignedType;
        }

        $perfil = trim((string) $user->perfil);

        if ($perfil === '') {
            return null;
        }

        $normalized = Str::of($perfil)->lower()->ascii()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->value();
        $aliases = array_values(array_unique(array_filter([
            $normalized,
            match ($normalized) {
                'admin', 'administrador' => 'administrador',
                'dirigente', 'direcao' => 'direcao',
                'encarregado', 'encarregado_educacao' => 'encarregado_educacao',
                default => null,
            },
        ])));

        if ($aliases === []) {
            return null;
        }

        return UserType::query()
            ->where('ativo', true)
            ->where(function ($query) use ($aliases) {
                $query->whereIn('codigo', $aliases)
                    ->orWhereIn('nome', $aliases);
            })
            ->orderBy('nome')
            ->first();
    }
}