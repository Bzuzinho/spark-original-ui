<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AccessControl\SyncUserTypeLandingPageRequest;
use App\Http\Requests\AccessControl\SyncUserTypeMenuModulesRequest;
use App\Http\Requests\AccessControl\SyncUserTypePermissionsRequest;
use App\Models\UserType;
use App\Services\AccessControl\UserTypeAccessControlService;

class UserTypeAccessControlController extends Controller
{
    public function __construct(
        private readonly UserTypeAccessControlService $accessControlService,
    ) {
    }

    public function catalog(): array
    {
        return $this->accessControlService->getBootstrap();
    }

    public function userTypes(): array
    {
        return UserType::query()
            ->where('ativo', true)
            ->orderBy('nome')
            ->get(['id', 'nome', 'codigo', 'descricao', 'ativo'])
            ->toArray();
    }

    public function show(UserType $userType): array
    {
        return $this->accessControlService->getUserTypeSettings($userType);
    }

    public function updateMenuModules(SyncUserTypeMenuModulesRequest $request, UserType $userType): array
    {
        return $this->accessControlService->syncMenuModules($userType, $request->validated('module_keys'));
    }

    public function updateLandingPage(SyncUserTypeLandingPageRequest $request, UserType $userType): array
    {
        return $this->accessControlService->syncLandingPage(
            $userType,
            $request->validated('landing_module_key'),
            $request->validated('base_page_key')
        );
    }

    public function updatePermissions(SyncUserTypePermissionsRequest $request, UserType $userType): array
    {
        return $this->accessControlService->syncPermissions($userType, $request->validated('permissions'));
    }
}