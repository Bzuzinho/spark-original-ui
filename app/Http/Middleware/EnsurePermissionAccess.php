<?php

namespace App\Http\Middleware;

use App\Services\AccessControl\UserTypeAccessControlService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermissionAccess
{
    public function __construct(
        private readonly UserTypeAccessControlService $accessControlService,
    ) {
    }

    public function handle(Request $request, Closure $next, string $permissionKey, string $capability = 'view'): Response
    {
        abort_unless(
            $this->accessControlService->canAccessPermission($request->user(), $permissionKey, $capability)
                || $this->accessControlService->canBypassOwnMemberProfileView($request->user(), $request, null, $permissionKey, $capability),
            Response::HTTP_FORBIDDEN,
            'Sem permissão para executar esta ação.'
        );

        return $next($request);
    }
}