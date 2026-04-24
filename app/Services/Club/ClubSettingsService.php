<?php

namespace App\Services\Club;

use App\Models\ClubSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ClubSettingsService
{
    public const CACHE_KEY = 'club_settings:current';

    /**
     * @return array<string, mixed>
     */
    public function get(): array
    {
        $settings = $this->model();

        if (! $settings) {
            return $this->buildPayload(null);
        }

        $cacheKey = sprintf(
            '%s:%s:%s',
            self::CACHE_KEY,
            (string) $settings->getKey(),
            (string) optional($settings->updated_at)->timestamp
        );

        return Cache::remember($cacheKey, now()->addMinutes(30), fn (): array => $this->buildPayload($settings));
    }

    public function model(): ?ClubSetting
    {
        return ClubSetting::query()->first();
    }

    public function name(): string
    {
        return $this->normalizeText($this->model()?->nome_clube);
    }

    public function shortName(): string
    {
        return $this->normalizeShortName($this->model()?->sigla);
    }

    public function logoUrl(): ?string
    {
        return $this->normalizeLogoUrl($this->model()?->logo_url);
    }

    public function institutionalName(): string
    {
        return $this->name();
    }

    public function defaultFinancialEntityName(string $classificacao = null): string
    {
        $baseName = $this->name();

        return match ($classificacao) {
            'receita' => $baseName . ' Receita',
            'despesa' => $baseName . ' Despesa',
            default => $baseName,
        };
    }

    public function defaultMeetingPoint(): string
    {
        return $this->resolveMeetingPoint($this->model());
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);

        $settings = $this->model();

        if ($settings) {
            Cache::forget(sprintf(
                '%s:%s:%s',
                self::CACHE_KEY,
                (string) $settings->getKey(),
                (string) optional($settings->updated_at)->timestamp
            ));
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPayload(?ClubSetting $settings): array
    {
        $clubName = $this->normalizeText($settings?->nome_clube);
        $clubShortName = $this->normalizeShortName($settings?->sigla);
        $logoUrl = $this->normalizeLogoUrl($settings?->logo_url);
        $defaultMeetingPoint = $this->resolveMeetingPoint($settings);

        return [
            'nome_clube' => $clubName,
            'sigla' => $clubShortName,
            'morada' => $this->nullableText($settings?->morada),
            'codigo_postal' => $this->nullableText($settings?->codigo_postal),
            'localidade' => $this->nullableText($settings?->localidade),
            'telefone' => $this->nullableText($settings?->telefone),
            'email' => $this->nullableText($settings?->email),
            'website' => $this->nullableText($settings?->website),
            'nif' => $this->nullableText($settings?->nif),
            'iban' => $this->nullableText($settings?->iban),
            'logo_url' => $logoUrl,
            'horario_funcionamento' => $settings?->horario_funcionamento ?? [],
            'redes_sociais' => $settings?->redes_sociais ?? [],
            'display_name' => $clubName,
            'short_name' => $clubShortName,
            'default_financial_entity_name' => $clubName,
            'default_meeting_point' => $defaultMeetingPoint,
        ];
    }

    private function normalizeText(?string $value): string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : 'Clube';
    }

    private function normalizeShortName(?string $value): string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : 'CLUBE';
    }

    private function nullableText(?string $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }

    private function normalizeLogoUrl(?string $value): ?string
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return null;
        }

        if (str_starts_with($normalized, 'http://') || str_starts_with($normalized, 'https://') || str_starts_with($normalized, '/')) {
            return $normalized;
        }

        return Storage::disk('public')->url($normalized);
    }

    private function resolveMeetingPoint(?ClubSetting $settings): string
    {
        $addressParts = array_filter([
            $this->nullableText($settings?->morada),
            $this->nullableText($settings?->codigo_postal),
            $this->nullableText($settings?->localidade),
        ]);

        if ($addressParts !== []) {
            return implode(', ', $addressParts);
        }

        return 'Sede do Clube';
    }
}