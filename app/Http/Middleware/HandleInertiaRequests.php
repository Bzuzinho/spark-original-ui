<?php

namespace App\Http\Middleware;

use App\Models\ClubSetting;
use App\Models\InAppAlert;
use App\Services\AccessControl\UserTypeAccessControlService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'accessControl' => app(UserTypeAccessControlService::class)->getCurrentUserAccess($request->user()),
            'clubSettings' => Cache::remember('club_settings_shared', now()->addMinutes(5), function () {
                return ClubSetting::select('nome_clube', 'sigla', 'logo_url')->first();
            }),
            'communicationAlerts' => $request->user() && Schema::hasTable('in_app_alerts')
                ? [
                    'unreadCount' => InAppAlert::where('user_id', $request->user()->id)
                        ->where('is_read', false)
                        ->where(function ($query) {
                            $query->whereNull('visible_from')->orWhere('visible_from', '<=', now());
                        })
                        ->where(function ($query) {
                            $query->whereNull('visible_until')->orWhere('visible_until', '>=', now());
                        })
                        ->count(),
                    'recent' => InAppAlert::where('user_id', $request->user()->id)
                        ->where(function ($query) {
                            $query->whereNull('visible_from')->orWhere('visible_from', '<=', now());
                        })
                        ->where(function ($query) {
                            $query->whereNull('visible_until')->orWhere('visible_until', '>=', now());
                        })
                        ->latest()
                        ->limit(8)
                        ->get(['id', 'title', 'message', 'type', 'link', 'is_read', 'created_at']),
                ]
                : [
                    'unreadCount' => 0,
                    'recent' => [],
                ],
        ];
    }
}
