<?php

namespace App\Http\Middleware;

use App\Services\AccessControl\UserTypeAccessControlService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleAccess
{
    public function __construct(
        private readonly UserTypeAccessControlService $accessControlService,
    ) {
    }

    public function handle(Request $request, Closure $next, string $moduleKey): Response
    {
        abort_unless(
            $this->accessControlService->canAccessModule($request->user(), $moduleKey)
                || $this->accessControlService->canBypassOwnMemberProfileView($request->user(), $request, $moduleKey),
            Response::HTTP_FORBIDDEN,
            'Sem permissão para aceder a este módulo.'
        );

        return $next($request);
    }
}