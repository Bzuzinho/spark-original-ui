<?php

namespace App\Console\Commands;

use App\Services\Desportivo\MigrateLegacyPresencesAction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrarPresencasLegacy extends Command
{
    protected $signature = 'desportivo:migrar-presencas-legacy 
                            {--dry-run : Executar em modo simulação sem alterar dados}
                            {--export= : Exportar relatório para ficheiro}';

    protected $description = 'Migra dados legacy de presences para training_athletes';

    public function __construct(
        private MigrateLegacyPresencesAction $migrateLegacyAction
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $this->info('🔄 MIGRAÇÃO: Presences Legacy → TrainingAthletes');
        $this->newLine();

        if ($dryRun) {
            $this->warn('⚠️  Modo DRY RUN - Nenhum dado será alterado');
        } else {
            $this->warn('⚠️  Modo PRODUCTION - Dados serão alterados permanentemente!');
            
            if (!$this->confirm('Tem certeza que deseja prosseguir?')) {
                $this->info('Operação cancelada pelo utilizador.');
                return self::SUCCESS;
            }
        }

        $this->newLine();
        $this->info('Iniciando migração...');
        $this->newLine();

        // Progress bar
        $this->output->progressStart();

        // Executar migração
        $report = $this->migrateLegacyAction->execute($dryRun);

        $this->output->progressFinish();
        $this->newLine();

        // Mostrar resultados
        $this->displayResults($report);

        // Exportar relatório se solicitado
        if ($exportPath = $this->option('export')) {
            $this->exportReport($report, $exportPath);
        }

        // Return code baseado em erros
        return $report['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Exibe resultados da migração
     */
    private function displayResults(array $report): void
    {
        $this->info('✅ MIGRAÇÃO CONCLUÍDA');
        $this->newLine();

        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Total de presences legacy', $report['total_presences']],
                ['✅ Migrados com sucesso', $report['migrated']],
                ['⚠️  Conflitos (mantido existente)', $report['conflicts']],
                ['❌ Erros', $report['errors']],
                ['⏭️  Skipped', $report['skipped']],
                ['⏱️  Duração', "{$report['duration_seconds']} segundos"],
            ]
        );

        $this->newLine();

        if ($report['conflicts'] > 0) {
            $this->warn("⚠️  {$report['conflicts']} conflitos encontrados:");
            $this->line('   Training Athletes já existiam para esses registos.');
            $this->line('   Dados existentes foram mantidos (source of truth).');
            $this->newLine();
        }

        if ($report['errors'] > 0) {
            $this->error("❌ {$report['errors']} erros ocorreram:");
            
            foreach ($report['error_details'] as $idx => $error) {
                $this->line("   Erro #" . ($idx + 1) . ": {$error['error']}");
            }
            
            $this->newLine();
            $this->warn('   Verifique os logs para mais detalhes.');
        }

        if ($report['dry_run']) {
            $this->newLine();
            $this->info('💡 Modo DRY RUN ativo - Nenhum dado foi alterado.');
            $this->info('   Execute sem --dry-run para aplicar as mudanças.');
        }
    }

    /**
     * Exporta relatório para ficheiro
     */
    private function exportReport(array $report, string $path): void
    {
        // Gerar texto do relatório
        $reportText = $this->migrateLegacyAction->generateReportText($report);

        // Salvar ficheiro
        file_put_contents($path, $reportText);

        // Também salvar JSON
        $jsonPath = str_replace('.txt', '', $path) . '.json';
        file_put_contents($jsonPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->newLine();
        $this->info("📄 Relatório exportado:");
        $this->line("   Texto: {$path}");
        $this->line("   JSON: {$jsonPath}");
    }
}
