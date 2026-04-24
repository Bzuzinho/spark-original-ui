<?php

namespace App\Http\Middleware;

use App\Models\InAppAlert;
use App\Services\AccessControl\UserTypeAccessControlService;
use App\Services\Club\ClubSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    private ?bool $hasInAppAlertsTable = null;

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'accessControl' => $user
                ? Cache::remember(
                    'shared:access_control:' . $user->id,
                    now()->addMinutes(5),
                    fn () => app(UserTypeAccessControlService::class)->getCurrentUserAccess($user)
                )
                : app(UserTypeAccessControlService::class)->getCurrentUserAccess(null),
            'clubSettings' => app(ClubSettingsService::class)->get(),
            'communicationAlerts' => $this->sharedCommunicationAlerts($user),
        ];
    }

    private function sharedCommunicationAlerts($user): array
    {
        if (! $user || ! $this->hasInAppAlertsTable()) {
            return [
                'unreadCount' => 0,
                'recent' => [],
            ];
        }

        return Cache::remember(
            'shared:communication_alerts:' . $user->id,
            now()->addSeconds(30),
            function () use ($user) {
                return [
                    'unreadCount' => InAppAlert::where('user_id', $user->id)
                        ->where('is_read', false)
                        ->where(function ($query) {
                            $query->whereNull('visible_from')->orWhere('visible_from', '<=', now());
                        })
                        ->where(function ($query) {
                            $query->whereNull('visible_until')->orWhere('visible_until', '>=', now());
                        })
                        ->count(),
                    'recent' => InAppAlert::where('user_id', $user->id)
                        ->where(function ($query) {
                            $query->whereNull('visible_from')->orWhere('visible_from', '<=', now());
                        })
                        ->where(function ($query) {
                            $query->whereNull('visible_until')->orWhere('visible_until', '>=', now());
                        })
                        ->latest()
                        ->limit(8)
                        ->get(['id', 'title', 'message', 'type', 'link', 'is_read', 'created_at']),
                ];
            }
        );
    }

    private function hasInAppAlertsTable(): bool
    {
        return $this->hasInAppAlertsTable ??= Schema::hasTable('in_app_alerts');
    }
}
