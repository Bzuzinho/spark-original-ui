<?php

namespace App\Services\AccessControl;

use App\Models\PermissionNode;
use App\Models\User;
use App\Models\UserType;
use App\Models\UserTypeLandingPage;
use App\Models\UserTypeMenuModule;
use App\Models\UserTypePermission;
use App\Support\AccessControl\AccessControlCatalog;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserTypeAccessControlService
{
    private ?bool $accessControlReady = null;

    /**
     * @var array<string, bool>
     */
    private array $tableExists = [];

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
            UserTypePermission::query()->updateOrCreate(
                [
                    'user_type_id' => $userType->id,
                    'permission_node_id' => $permission['permission_node_id'],
                ],
                [
                    'can_view' => $permission['can_view'],
                    'can_edit' => $permission['can_edit'],
                    'can_delete' => $permission['can_delete'],
                ]
            );
        }

        return $this->getUserTypeSettings($userType);
    }

    public function getCurrentUserAccess(?User $user): array
    {
        $defaultLanding = AccessControlCatalog::defaultLandingPage();
        $defaultModules = AccessControlCatalog::allMenuModuleKeys();

        if ($user === null || ! $this->isReady()) {
            return [
                'currentUserType' => null,
                'visibleMenuModules' => $defaultModules,
                'landingPage' => $defaultLanding,
            ];
        }

        $userType = ($this->resolveCurrentUserType)($user);

        if ($userType === null) {
            return [
                'currentUserType' => null,
                'visibleMenuModules' => $defaultModules,
                'landingPage' => $defaultLanding,
            ];
        }

        $settings = $this->getUserTypeSettings($userType);
        $settings['landingPage']['route'] = $this->resolveLandingRoute($settings['landingPage'], $user);

        return [
            'currentUserType' => $settings['userType'],
            'visibleMenuModules' => $settings['menuModuleKeys'],
            'landingPage' => $settings['landingPage'],
        ];
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

        if (! $this->isReady()) {
            return true;
        }

        $userType = ($this->resolveCurrentUserType)($user);

        if ($userType === null) {
            return true;
        }

        return in_array($moduleKey, $this->menuModulesForUserType($userType), true);
    }

    public function canAccessPermission(?User $user, string $permissionKey, string $capability = 'view'): bool
    {
        if ($user === null) {
            return false;
        }

        if (! $this->isReady() || ! $this->tableExists('permission_nodes') || ! $this->tableExists('user_type_permissions')) {
            return true;
        }

        $userType = ($this->resolveCurrentUserType)($user);

        if ($userType === null) {
            return true;
        }

        $permissionNode = PermissionNode::query()->where('key', $permissionKey)->first();

        if ($permissionNode === null) {
            return false;
        }

        if (! $this->canAccessModule($user, $permissionNode->module_key)) {
            return false;
        }

        if (! in_array($capability, ['view', 'edit', 'delete'], true)) {
            return false;
        }

        if (! $this->userTypeHasExplicitPermissions($userType)) {
            return true;
        }

        $column = match ($capability) {
            'view' => 'can_view',
            'edit' => 'can_edit',
            'delete' => 'can_delete',
        };

        return UserTypePermission::query()
            ->where('user_type_id', $userType->id)
            ->whereIn('permission_node_id', $this->permissionNodeAndAncestorIds($permissionNode))
            ->where($column, true)
            ->exists();
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
        return $this->accessControlReady ??= $this->tableExists('user_types');
    }

    private function tableExists(string $table): bool
    {
        return $this->tableExists[$table] ??= Schema::hasTable($table);
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
            $parent = PermissionNode::query()->find($parentId, ['id', 'parent_id']);

            if ($parent === null) {
                break;
            }

            $ids[] = $parent->id;
            $parentId = $parent->parent_id;
        }

        return $ids;
    }
}