<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Performance\AuthenticatedModuleWarmupService;
use Illuminate\Console\Command;

class WarmModuleCaches extends Command
{
    protected $signature = 'cache:warm-modules {userId? : Optional user id to use while warming authenticated module caches}';

    protected $description = 'Warm the shared and authenticated module caches used by the first post-login navigation';

    public function handle(AuthenticatedModuleWarmupService $warmupService): int
    {
        $user = $this->argument('userId')
            ? User::query()->find($this->argument('userId'))
            : User::query()->orderBy('created_at')->first();

        if (! $user) {
            $this->error('No user found to warm authenticated module caches.');

            return self::FAILURE;
        }

        $this->info('Warming module caches with user: ' . ($user->email_utilizador ?: $user->email ?: $user->id));

        $warmupService->warmForUserId($user->id);

        $this->info('Module warmup complete.');

        return self::SUCCESS;
    }
}