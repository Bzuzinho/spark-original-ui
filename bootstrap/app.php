<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        \App\Providers\AppServiceProvider::class,
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        \App\Console\Commands\SetupCommand::class,
        \App\Console\Commands\BackfillFinanceiroIntegracoes::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies for Codespaces
        $middleware->trustProxies(at: '*');

        $middleware->validateCsrfTokens(except: [
            'financeiro/*/apagar',
        ]);
        
        $middleware->web(append: [
            \App\Http\Middleware\ForceAppUrl::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
