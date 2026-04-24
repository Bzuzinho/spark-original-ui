<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;

class SetupCommand extends Command
{
    protected $signature = 'app:setup {--force : Force setup even if already configured}';
    protected $description = 'Setup Laravel application (storage, keys, database, assets)';

    public function handle()
    {
        $this->info('🚀 Setting up Laravel application...');
        
        // 1. Create storage structure
        $this->info('📁 Creating storage structure...');
        $this->createStorageStructure();
        
        // 2. Generate APP_KEY if missing
        if (!env('APP_KEY') || $this->option('force')) {
            $this->info('🔑 Generating application key...');
            Artisan::call('key:generate', ['--force' => true]);
            $this->info('✅ Key generated');
        }
        
        // 3. Create SQLite database
        $dbPath = database_path('database.sqlite');
        if (!file_exists($dbPath) || $this->option('force')) {
            $this->info('💾 Creating SQLite database...');
            touch($dbPath);
            chmod($dbPath, 0664);
            $this->info('✅ Database created');
        }
        
        // 4. Run migrations
        $this->info('🗄️  Running migrations...');
        Artisan::call('migrate', ['--force' => true]);
        $this->info('✅ Migrations completed');
        
        // 5. Build assets
        $this->info('🎨 Building frontend assets...');
        $buildResult = $this->buildAssets();
        if ($buildResult === 0) {
            $this->info('✅ Assets built successfully');
        } else {
            $this->warn('⚠️  Asset build had warnings (check npm output)');
        }
        
        // 6. Clear caches
        $this->info('🧹 Clearing caches...');
        Artisan::call('optimize:clear');
        
        $this->newLine();
        $this->info('✅ Setup complete! Run: php artisan serve');
        
        return Command::SUCCESS;
    }
    
    private function createStorageStructure()
    {
        $dirs = [
            'storage/app/public',
            'storage/framework/cache/data',
            'storage/framework/sessions',
            'storage/framework/testing',
            'storage/framework/views',
            'storage/logs',
            'bootstrap/cache',
        ];
        
        foreach ($dirs as $dir) {
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0775, true);
                File::put($dir . '/.gitkeep', '');
            }
        }
        
        chmod('storage', 0775);
        chmod('bootstrap/cache', 0775);
    }
    
    private function buildAssets(): int
    {
        if (!file_exists(base_path('package.json'))) {
            $this->warn('⚠️  package.json not found, skipping asset build');
            return 1;
        }
        
        $this->info('   Running: npm run build');
        
        return $this->executeCommand('npm run build');
    }
    
    private function executeCommand(string $command): int
    {
        $process = proc_open(
            $command,
            [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ],
            $pipes,
            base_path()
        );
        
        if (!is_resource($process)) {
            return 1;
        }
        
        fclose($pipes[0]);
        
        $output = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        
        $errors = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        
        $returnCode = proc_close($process);
        
        if ($returnCode !== 0 && $errors) {
            $this->error($errors);
        }
        
        return $returnCode;
    }
}
