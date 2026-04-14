<?php

namespace App\Support\Communication;

use App\Models\CommunicationAlertCategory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class AlertCategoryRegistry
{
    public static function all(bool $onlyActive = true): Collection
    {
        if (!Schema::hasTable('communication_alert_categories')) {
            return collect(self::defaults())->when(
                $onlyActive,
                fn (Collection $items) => $items->where('is_active', true)->values(),
            );
        }

        $query = CommunicationAlertCategory::query()->orderBy('sort_order')->orderBy('name');

        if ($onlyActive) {
            $query->where('is_active', true);
        }

        return $query->get()->map(fn (CommunicationAlertCategory $category) => [
            'id' => $category->id,
            'code' => $category->code,
            'name' => $category->name,
            'description' => $category->description,
            'channels' => array_values(array_unique($category->channels ?? [])),
            'sort_order' => $category->sort_order,
            'is_active' => $category->is_active,
        ]);
    }

    public static function codes(bool $onlyActive = true): array
    {
        return self::all($onlyActive)->pluck('code')->filter()->values()->all();
    }

    public static function exists(?string $code, bool $onlyActive = false): bool
    {
        if (!$code) {
            return false;
        }

        return self::all($onlyActive)->contains(fn (array $category) => $category['code'] === $code);
    }

    public static function find(?string $code, bool $onlyActive = false): ?array
    {
        if (!$code) {
            return null;
        }

        return self::all($onlyActive)->first(fn (array $category) => $category['code'] === $code);
    }

    public static function defaults(): array
    {
        return [
            [
                'id' => '',
                'code' => 'mensalidade',
                'name' => 'Mensalidade',
                'description' => 'Alertas relacionados com pagamentos e quotas.',
                'channels' => ['email', 'sms', 'alert_app'],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'id' => '',
                'code' => 'presencas',
                'name' => 'Presenças',
                'description' => 'Alertas de faltas, presenças e assiduidade.',
                'channels' => ['email', 'sms', 'alert_app'],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'id' => '',
                'code' => 'comportamento',
                'name' => 'Comportamento',
                'description' => 'Alertas sobre comportamento e acompanhamento.',
                'channels' => ['email', 'alert_app'],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'id' => '',
                'code' => 'geral',
                'name' => 'Geral',
                'description' => 'Comunicações gerais do clube.',
                'channels' => ['email', 'sms', 'alert_app'],
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];
    }
}