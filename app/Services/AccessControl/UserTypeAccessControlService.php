<?php

namespace App\Services\AccessControl;

use App\Models\PermissionNode;
use App\Models\User;
use App\Models\UserType;
use App\Models\UserTypeLandingPage;
use App\Models\UserTypeMenuModule;
use App\Models\UserTypePermission;
use App\Support\AccessControl\AccessControlCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserTypeAccessControlService
{
    private static ?bool $accessControlReady = null;

    /**
     * @var array<string, bool>
     */
    private static array $tableExists = [];

    /**
     * @var array<string, UserType|null>
     */
    private static array $resolvedUserTypes = [];

    /**
     * @var array<string, array<string, mixed>>
     */
    private static array $currentUserAccess = [];

    /**
     * @var array<string, array<string, mixed>>
     */
    private static array $userTypeSettings = [];

    /**
     * @var array<string, PermissionNode|null>
     */
    private static array $permissionNodesByKey = [];

    /**
     * @var array<string, PermissionNode|null>
     */
    private static array $permissionNodesById = [];

    public function __construct(
        private readonly ResolveCurrentUserType $resolveCurrentUserType,
    ) {
    }

    public function getBootstrap(?UserType $selectedUserType = null): array
    {
        $selectedUserType ??= UserType::query()->where('ativo', true)->orderBy('nome')->first();

        return [
            'menuModules' => AccessControlCatalog::menuModules(),
            'landingPages' => AccessControlCatalog::landingPages(),
            'permissionTree' => $this->getPermissionTree(),
            'defaultSelectedUserTypeId' => $selectedUserType?->id,
            'initialSettingsByUserType' => $selectedUserType
                ? [$selectedUserType->id => $this->getUserTypeSettings($selectedUserType)]
                : [],
        ];
    }

    public function getPermissionTree(): array
    {
        if (! $this->isReady() || ! $this->tableExists('permission_nodes')) {
            return [];
        }

        $nodes = PermissionNode::query()
            ->where('active', true)
            ->orderBy('sort_order')
            ->get(['id', 'key', 'label', 'parent_id', 'module_key', 'node_type', 'sort_order']);

        $grouped = $nodes->groupBy('parent_id');

        $buildTree = function (?string $parentId) use (&$buildTree, $grouped): array {
            return $grouped->get($parentId, collect())
                ->map(function (PermissionNode $node) use ($buildTree) {
                    return [
                        'id' => $node->id,
                        'key' => $node->key,
                        'label' => $node->label,
                        'module_key' => $node->module_key,
                        'node_type' => $node->node_type,
                        'children' => $buildTree($node->id),
                    ];
                })
                ->values()
                ->all();
        };

        return $buildTree(null);
    }

    public function getUserTypeSettings(UserType $userType): array
    {
        if (isset(self::$userTypeSettings[$userType->id])) {
            return self::$userTypeSettings[$userType->id];
        }

        return self::$userTypeSettings[$userType->id] = Cache::remember(
            'access_control:user_type_settings:' . $userType->id,
            now()->addMinutes(5),
            function () use ($userType) {
                $defaultLanding = AccessControlCatalog::defaultLandingPage();
                $menuModules = $this->menuModulesForUserType($userType);
                $landing = $this->landingPageForUserType($userType) ?? $defaultLanding;

                $permissions = [];

                if ($this->isReady() && $this->tableExists('user_type_permissions')) {
                    $permissions = UserTypePermission::query()
                        ->where('user_type_id', $userType->id)
                        ->whereNotNull('permission_node_id')
                        ->get(['permission_node_id', 'can_view', 'can_edit', 'can_delete'])
                        ->map(static fn (UserTypePermission $permission) => [
                            'permission_node_id' => $permission->permission_node_id,
                            'can_view' => (bool) $permission->can_view,
                            'can_edit' => (bool) $permission->can_edit,
                            'can_delete' => (bool) $permission->can_delete,
                        ])
                        ->values()
                        ->all();
                }

                return [
                    'userType' => [
                        'id' => $userType->id,
                        'nome' => $userType->nome,
                        'codigo' => $userType->codigo,
                        'descricao' => $userType->descricao,
                    ],
                    'menuModuleKeys' => $menuModules,
                    'landingPage' => $landing,
                    'permissions' => $permissions,
                ];
            }
        );
    }

    public function syncMenuModules(UserType $userType, array $moduleKeys): array
    {
        $allowedKeys = AccessControlCatalog::allMenuModuleKeys();
        $normalizedKeys = array_values(array_unique(array_values(array_filter(
            $moduleKeys,
            static fn (mixed $key) => is_string($key) && in_array($key, $allowedKeys, true)
        ))));

        UserTypeMenuModule::query()->where('user_type_id', $userType->id)->delete();

        foreach ($normalizedKeys as $index => $moduleKey) {
            UserTypeMenuModule::query()->create([
                'user_type_id' => $userType->id,
                'module_key' => $moduleKey,
                'sort_order' => $index + 1,
            ]);
        }

        $userType->forceFill(['menu_visibility_configured' => true])->save();

        $this->forgetUserTypeAccessCaches($userType);

        return $this->getUserTypeSettings($userType);
    }

    public function syncLandingPage(UserType $userType, string $landingModuleKey, string $basePageKey): array
    {
        ['landing_module_key' => $landingModuleKey, 'base_page_key' => $basePageKey] = $this->normalizeLandingSelectionForUserType(
            $userType,
            $landingModuleKey,
            $basePageKey,
        );

        $basePage = AccessControlCatalog::findBasePage($landingModuleKey, $basePageKey);

        if ($basePage === null) {
            throw ValidationException::withMessages([
                'base_page_key' => 'A página base selecionada não pertence ao módulo escolhido.',
            ]);
        }

        UserTypeLandingPage::query()->updateOrCreate(
            ['user_type_id' => $userType->id],
            [
                'landing_module_key' => $landingModuleKey,
                'base_page_key' => $basePageKey,
            ]
        );

        $this->forgetUserTypeAccessCaches($userType);

        return $this->getUserTypeSettings($userType);
    }

    public function syncPermissions(UserType $userType, array $permissions): array
    {
        $permissionCollection = collect($permissions)
            ->map(static function (array $permission): array {
                return [
                    'permission_node_id' => $permission['permission_node_id'],
                    'can_view' => (bool) ($permission['can_view'] ?? false),
                    'can_edit' => (bool) ($permission['can_edit'] ?? false),
                    'can_delete' => (bool) ($permission['can_delete'] ?? false),
                ];
            })
            ->filter(static fn (array $permission) => $permission['can_view'] || $permission['can_edit'] || $permission['can_delete'])
            ->values();

        $permissionNodeIds = $permissionCollection->pluck('permission_node_id')->all();

        $query = UserTypePermission::query()
            ->where('user_type_id', $userType->id)
            ->whereNotNull('permission_node_id');

        if ($permissionNodeIds === []) {
            $query->delete();
        } else {
            $query->whereNotIn('permission_node_id', $permissionNodeIds)->delete();
        }

        foreach ($permissionCollection as $permission) {
            $legacyScope = $this->legacyScopeFromPermissionNodeId($permission['permission_node_id']);

            UserTypePermission::query()->updateOrCreate(
                [
                    'user_type_id' => $userType->id,
                    'permission_node_id' => $permission['permission_node_id'],
                ],
                [
                    'modulo' => $legacyScope['modulo'],
                    'submodulo' => $legacyScope['submodulo'],
                    'separador' => $legacyScope['separador'],
                    'campo' => $legacyScope['campo'],
                    'can_view' => $permission['can_view'],
                    'can_edit' => $permission['can_edit'],
                    'can_delete' => $permission['can_delete'],
                    'pode_ver' => $permission['can_view'],
                    'pode_criar' => $permission['can_edit'],
                    'pode_editar' => $permission['can_edit'],
                    'pode_eliminar' => $permission['can_delete'],
                ]
            );
        }

        $this->forgetUserTypeAccessCaches($userType);

        return $this->getUserTypeSettings($userType);
    }

    public function getCurrentUserAccess(?User $user): array
    {
        $defaultLanding = AccessControlCatalog::defaultLandingPage();
        $defaultModules = AccessControlCatalog::allMenuModuleKeys();
        $cacheKey = $user?->id ?? '__guest__';

        if (isset(self::$currentUserAccess[$cacheKey])) {
            return self::$currentUserAccess[$cacheKey];
        }

        if ($user === null || ! $this->isReady()) {
            return self::$currentUserAccess[$cacheKey] = [
                'currentUserType' => null,
                'visibleMenuModules' => $defaultModules,
                'landingPage' => $defaultLanding,
            ];
        }

        $cachedAccess = Cache::get('access_control:current_user_access:' . $user->id);

        if (is_array($cachedAccess)) {
            return self::$currentUserAccess[$cacheKey] = $cachedAccess;
        }

        $userType = $this->resolveUserType($user);

        if ($userType === null) {
            return self::$currentUserAccess[$cacheKey] = [
                'currentUserType' => null,
                'visibleMenuModules' => $defaultModules,
                'landingPage' => $defaultLanding,
            ];
        }

        $settings = $this->getUserTypeSettings($userType);
        $settings['landingPage']['route'] = $this->resolveLandingRoute($settings['landingPage'], $user);

        $access = [
            'currentUserType' => $settings['userType'],
            'visibleMenuModules' => $settings['menuModuleKeys'],
            'landingPage' => $settings['landingPage'],
        ];

        Cache::put('access_control:current_user_access:' . $user->id, $access, now()->addMinutes(5));

        return self::$currentUserAccess[$cacheKey] = $access;
    }

    public function resolveLandingRouteForUser(?User $user): string
    {
        return $this->getCurrentUserAccess($user)['landingPage']['route'] ?? '/dashboard';
    }

    public function canAccessModule(?User $user, string $moduleKey): bool
    {
        if ($user === null) {
            return false;
        }

        return in_array($moduleKey, $this->getCurrentUserAccess($user)['visibleMenuModules'] ?? [], true);
    }

    public function canAccessPermission(?User $user, string $permissionKey, string $capability = 'view'): bool
    {
        if ($user === null) {
            return false;
        }

        if (! $this->isReady() || ! $this->tableExists('permission_nodes') || ! $this->tableExists('user_type_permissions')) {
            return true;
        }

        $userType = $this->resolveUserType($user);

        if ($userType === null) {
            return true;
        }

        $permissionNode = $this->permissionNodeForKey($permissionKey);

        if ($permissionNode === null) {
            return false;
        }

        if (! $this->canAccessModule($user, $permissionNode->module_key)) {
            return false;
        }

        if (! in_array($capability, ['view', 'edit', 'delete'], true)) {
            return false;
        }

        $settings = $this->getUserTypeSettings($userType);

        if (($settings['permissions'] ?? []) === []) {
            return true;
        }

        $column = match ($capability) {
            'view' => 'can_view',
            'edit' => 'can_edit',
            'delete' => 'can_delete',
        };

        $allowedPermissionNodeIds = collect($settings['permissions'] ?? [])
            ->filter(static fn (array $permission) => (bool) ($permission[$column] ?? false))
            ->pluck('permission_node_id')
            ->all();

        return array_intersect($allowedPermissionNodeIds, $this->permissionNodeAndAncestorIds($permissionNode)) !== [];
    }

    public function canBypassOwnMemberProfileView(?User $user, Request $request, ?string $moduleKey = null, ?string $permissionKey = null, string $capability = 'view'): bool
    {
        if ($user === null || $capability !== 'view') {
            return false;
        }

        if ($moduleKey !== null && $moduleKey !== 'membros') {
            return false;
        }

        if ($permissionKey !== null && $permissionKey !== 'membros.ficha') {
            return false;
        }

        if (! $request->routeIs('membros.show')) {
            return false;
        }

        $member = $request->route('member');
        $targetMemberId = $member instanceof User ? $member->getKey() : (is_scalar($member) ? (string) $member : null);

        if ($targetMemberId === null) {
            return false;
        }

        $userType = $this->resolveUserType($user);

        if ($userType === null) {
            return false;
        }

        if ($targetMemberId === $user->getKey()) {
            return $this->isAthleteUserType($userType) || $this->isGuardianUserType($userType);
        }

        if (! $this->isGuardianUserType($userType)) {
            return false;
        }

        return $user->educandos()->whereKey($targetMemberId)->exists();
    }

    private function menuModulesForUserType(UserType $userType): array
    {
        if (! $this->isReady() || ! $this->tableExists('user_type_menu_modules')) {
            return AccessControlCatalog::allMenuModuleKeys();
        }

        $configured = (bool) $userType->menu_visibility_configured;
        $moduleKeys = UserTypeMenuModule::query()
            ->where('user_type_id', $userType->id)
            ->orderBy('sort_order')
            ->pluck('module_key')
            ->all();

        return $configured ? $moduleKeys : AccessControlCatalog::allMenuModuleKeys();
    }

    private function landingPageForUserType(UserType $userType): ?array
    {
        if (! $this->isReady() || ! $this->tableExists('user_type_landing_pages')) {
            return null;
        }

        $landing = UserTypeLandingPage::query()->where('user_type_id', $userType->id)->first();

        if ($landing === null) {
            return null;
        }

        $module = AccessControlCatalog::findLandingModule($landing->landing_module_key);
        $page = AccessControlCatalog::findBasePage($landing->landing_module_key, $landing->base_page_key);

        if ($module === null || $page === null) {
            return null;
        }

        ['landing_module_key' => $landingModuleKey, 'base_page_key' => $basePageKey] = $this->normalizeLandingSelectionForUserType(
            $userType,
            $landing->landing_module_key,
            $landing->base_page_key,
        );

        $module = AccessControlCatalog::findLandingModule($landingModuleKey);
        $page = AccessControlCatalog::findBasePage($landingModuleKey, $basePageKey);

        if ($module === null || $page === null) {
            return null;
        }

        return [
            'landing_module_key' => $landingModuleKey,
            'landing_module_label' => $module['module_label'],
            'base_page_key' => $basePageKey,
            'base_page_label' => $page['label'],
            'route' => $page['route'],
        ];
    }

    private function normalizeLandingSelectionForUserType(UserType $userType, string $landingModuleKey, string $basePageKey): array
    {
        if ($landingModuleKey === 'membros' && $this->isAthleteUserType($userType)) {
            return [
                'landing_module_key' => 'membros',
                'base_page_key' => 'membros_ficha_propria',
            ];
        }

        if ($landingModuleKey === 'membros' && $this->isGuardianUserType($userType)) {
            return [
                'landing_module_key' => 'membros',
                'base_page_key' => 'membros_educando_principal',
            ];
        }

        return [
            'landing_module_key' => $landingModuleKey,
            'base_page_key' => $basePageKey,
        ];
    }

    private function resolveLandingRoute(array $landingPage, ?User $user): string
    {
        if (($landingPage['base_page_key'] ?? null) === 'membros_ficha_propria' && $user !== null) {
            return route('membros.show', ['member' => $user->id]);
        }

        if (($landingPage['base_page_key'] ?? null) === 'membros_educando_principal' && $user !== null) {
            $primaryDependentId = $user->educandos()
                ->select('users.id')
                ->orderBy('users.nome_completo')
                ->value('users.id');

            return route('membros.show', ['member' => $primaryDependentId ?: $user->id]);
        }

        return $landingPage['route'] ?? '/dashboard';
    }

    private function isAthleteUserType(UserType $userType): bool
    {
        $codigo = $this->normalizeUserTypeIdentifier($userType->codigo);
        $nome = $this->normalizeUserTypeIdentifier($userType->nome);

        return $codigo === 'atleta' || $nome === 'atleta';
    }

    private function isGuardianUserType(UserType $userType): bool
    {
        $codigo = $this->normalizeUserTypeIdentifier($userType->codigo);
        $nome = $this->normalizeUserTypeIdentifier($userType->nome);

        return in_array($codigo, ['encarregado_educacao', 'encarregado'], true)
            || in_array($nome, ['encarregado_educacao', 'encarregado'], true);
    }

    private function normalizeUserTypeIdentifier(?string $value): string
    {
        return Str::of((string) $value)->lower()->ascii()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->value();
    }

    private function isReady(): bool
    {
        return self::$accessControlReady ??= $this->tableExists('user_types');
    }

    private function tableExists(string $table): bool
    {
        return self::$tableExists[$table] ??= Cache::rememberForever(
            'access_control:table_exists:' . $table,
            fn () => Schema::hasTable($table)
        );
    }

    private function resolveUserType(User $user): ?UserType
    {
        if (array_key_exists($user->id, self::$resolvedUserTypes)) {
            return self::$resolvedUserTypes[$user->id];
        }

        return self::$resolvedUserTypes[$user->id] = Cache::remember(
            'access_control:resolved_user_type:' . $user->id,
            now()->addMinutes(5),
            fn () => ($this->resolveCurrentUserType)($user)
        );
    }

    private function permissionNodeForKey(string $permissionKey): ?PermissionNode
    {
        if (array_key_exists($permissionKey, self::$permissionNodesByKey)) {
            return self::$permissionNodesByKey[$permissionKey];
        }

        $permissionNode = Cache::remember(
            'access_control:permission_node:key:' . $permissionKey,
            now()->addMinutes(10),
            fn () => PermissionNode::query()->where('key', $permissionKey)->first(['id', 'key', 'parent_id', 'module_key'])
        );

        if ($permissionNode !== null) {
            self::$permissionNodesById[$permissionNode->id] = $permissionNode;
        }

        return self::$permissionNodesByKey[$permissionKey] = $permissionNode;
    }

    private function permissionNodeById(string $nodeId): ?PermissionNode
    {
        if (array_key_exists($nodeId, self::$permissionNodesById)) {
            return self::$permissionNodesById[$nodeId];
        }

        return self::$permissionNodesById[$nodeId] = Cache::remember(
            'access_control:permission_node:id:' . $nodeId,
            now()->addMinutes(10),
            fn () => PermissionNode::query()->find($nodeId, ['id', 'key', 'parent_id', 'module_key'])
        );
    }

    private function userTypeHasExplicitPermissions(UserType $userType): bool
    {
        return UserTypePermission::query()
            ->where('user_type_id', $userType->id)
            ->whereNotNull('permission_node_id')
            ->exists();
    }

    private function permissionNodeAndAncestorIds(PermissionNode $node): array
    {
        $ids = [$node->id];
        $parentId = $node->parent_id;

        while ($parentId !== null) {
            $parent = $this->permissionNodeById($parentId);

            if ($parent === null) {
                break;
            }

            $ids[] = $parent->id;
            $parentId = $parent->parent_id;
        }

        return $ids;
    }

    private function legacyScopeFromPermissionNodeId(string $permissionNodeId): array
    {
        $permissionNode = $this->permissionNodeById($permissionNodeId);

        if ($permissionNode === null) {
            return [
                'modulo' => 'desconhecido',
                'submodulo' => null,
                'separador' => null,
                'campo' => null,
            ];
        }

        $segments = explode('.', $permissionNode->key);

        return [
            'modulo' => $segments[0] ?? 'desconhecido',
            'submodulo' => $segments[1] ?? null,
            'separador' => $segments[2] ?? null,
            'campo' => $segments[3] ?? null,
        ];
    }

    private function forgetUserTypeAccessCaches(UserType $userType): void
    {
        unset(self::$userTypeSettings[$userType->id]);
        Cache::forget('access_control:user_type_settings:' . $userType->id);

        foreach ($this->userIdsForUserType($userType) as $userId) {
            unset(self::$currentUserAccess[$userId], self::$resolvedUserTypes[$userId]);
            Cache::forget('access_control:current_user_access:' . $userId);
            Cache::forget('access_control:resolved_user_type:' . $userId);
        }
    }

    /**
     * @return array<string>
     */
    private function userIdsForUserType(UserType $userType): array
    {
        $normalizedAliases = array_values(array_unique(array_filter([
            $this->normalizeUserTypeIdentifier($userType->codigo),
            $this->normalizeUserTypeIdentifier($userType->nome),
        ])));

        return User::query()
            ->select(['id', 'perfil'])
            ->where(function ($query) use ($userType, $normalizedAliases) {
                $query->whereHas('userTypes', function ($userTypesQuery) use ($userType) {
                    $userTypesQuery->where('user_types.id', $userType->id);
                });

                if ($normalizedAliases !== []) {
                    $query->orWhereIn('perfil', $normalizedAliases);
                }
            })
            ->get()
            ->filter(function (User $user) use ($normalizedAliases, $userType): bool {
                if ($user->userTypes->contains('id', $userType->id)) {
                    return true;
                }

                return in_array($this->normalizeUserTypeIdentifier($user->perfil), $normalizedAliases, true);
            })
            ->pluck('id')
            ->map(static fn (mixed $id) => (string) $id)
            ->values()
            ->all();
    }
}