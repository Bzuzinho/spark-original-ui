<?php

namespace App\Services\Communication;

use App\Models\InAppAlert;
use Illuminate\Support\Collection;

class InAppAlertService
{
    public function createAlerts(array $payload, Collection $recipients): int
    {
        $created = 0;

        foreach ($recipients as $recipient) {
            if (empty($recipient['user_id'])) {
                continue;
            }

            InAppAlert::create([
                'campaign_id' => $payload['campaign_id'] ?? null,
                'delivery_id' => $payload['delivery_id'] ?? null,
                'user_id' => $recipient['user_id'],
                'title' => $payload['title'],
                'message' => $payload['message'],
                'link' => $payload['link'] ?? null,
                'type' => $payload['type'] ?? 'info',
                'visible_from' => $payload['visible_from'] ?? now(),
                'visible_until' => $payload['visible_until'] ?? null,
            ]);

            $created++;
        }

        return $created;
    }

    public function markAsRead(string $alertId, string $userId): void
    {
        InAppAlert::where('id', $alertId)
            ->where('user_id', $userId)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public function markAllAsRead(string $userId): void
    {
        InAppAlert::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public function unreadCount(string $userId): int
    {
        return InAppAlert::where('user_id', $userId)
            ->where('is_read', false)
            ->where(function ($query) {
                $query->whereNull('visible_from')->orWhere('visible_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('visible_until')->orWhere('visible_until', '>=', now());
            })
            ->count();
    }

    public function userFeed(string $userId, int $limit = 15): Collection
    {
        return InAppAlert::where('user_id', $userId)
            ->where(function ($query) {
                $query->whereNull('visible_from')->orWhere('visible_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('visible_until')->orWhere('visible_until', '>=', now());
            })
            ->latest()
            ->limit($limit)
            ->get();
    }
}
