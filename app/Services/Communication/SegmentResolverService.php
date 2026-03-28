<?php

namespace App\Services\Communication;

use App\Models\CommunicationSegment;
use App\Models\EventAttendance;
use App\Models\InAppAlert;
use App\Models\Invoice;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Support\Collection;

class SegmentResolverService
{
    public function resolveRecipients(CommunicationSegment $segment, ?string $channel = null): Collection
    {
        $users = $this->resolveUsers($segment);

        $recipients = $users
            ->unique('id')
            ->values()
            ->map(function (User $user) {
                return [
                    'user_id' => $user->id,
                    'member_id' => $user->id,
                    'name' => $user->nome_completo ?: $user->name,
                    'email' => $user->email,
                    'phone' => $user->telemovel ?: $user->contacto_telefonico ?: $user->contacto,
                    'push_token' => null,
                ];
            });

        if ($channel === null) {
            return $recipients;
        }

        return $recipients->filter(function (array $recipient) use ($channel) {
            return match ($channel) {
                'email' => !empty($recipient['email']),
                'sms' => !empty($recipient['phone']),
                'push' => !empty($recipient['push_token']),
                'interno', 'alert_app' => !empty($recipient['user_id']),
                default => true,
            };
        })->values();
    }

    private function resolveUsers(CommunicationSegment $segment): Collection
    {
        $rules = $segment->rules_json ?? [];

        if ($segment->type === 'manual') {
            $userIds = collect($rules['user_ids'] ?? [])->filter()->values();
            if ($userIds->isEmpty()) {
                return collect();
            }

            return User::whereIn('id', $userIds)->get();
        }

        $source = $rules['source'] ?? 'all_members';

        return match ($source) {
            'athletes' => User::whereJsonContains('tipo_membro', 'atleta')->get(),
            'guardians' => User::whereJsonContains('tipo_membro', 'encarregado_educacao')->get(),
            'coaches' => User::whereJsonContains('tipo_membro', 'treinador')->get(),
            'team_members' => $this->usersFromTeam($rules),
            'age_group_members' => $this->usersFromAgeGroup($rules),
            'overdue_payments' => $this->usersWithOverduePayments(),
            'event_participants' => $this->usersFromEvent($rules),
            'users_with_unread_alerts' => $this->usersWithUnreadAlerts(),
            default => User::query()->where('estado', 'ativo')->orWhereNull('estado')->get(),
        };
    }

    private function usersFromTeam(array $rules): Collection
    {
        $teamId = $rules['team_id'] ?? null;

        if (!$teamId) {
            return collect();
        }

        $userIds = TeamMember::where('team_id', $teamId)->pluck('user_id');

        return User::whereIn('id', $userIds)->get();
    }

    private function usersFromAgeGroup(array $rules): Collection
    {
        $ageGroupId = $rules['age_group_id'] ?? null;

        if (!$ageGroupId) {
            return collect();
        }

        return User::where('age_group_id', $ageGroupId)->get();
    }

    private function usersWithOverduePayments(): Collection
    {
        $userIds = Invoice::where('estado_pagamento', '!=', 'pago')
            ->whereDate('data_vencimento', '<', now())
            ->distinct()
            ->pluck('user_id');

        return User::whereIn('id', $userIds)->get();
    }

    private function usersFromEvent(array $rules): Collection
    {
        $eventId = $rules['event_id'] ?? null;

        if (!$eventId) {
            return collect();
        }

        $userIds = EventAttendance::where('evento_id', $eventId)->distinct()->pluck('user_id');

        return User::whereIn('id', $userIds)->get();
    }

    private function usersWithUnreadAlerts(): Collection
    {
        $userIds = InAppAlert::where('is_read', false)
            ->distinct()
            ->pluck('user_id');

        return User::whereIn('id', $userIds)->get();
    }
}
