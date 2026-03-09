<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AuditarTrainingSessions extends Command
{
    protected $signature = 'desportivo:auditar-training-sessions 
                            {--export= : Exportar resultados para ficheiro JSON}';

    protected $description = 'Audita a tabela training_sessions para verificar se contém dados e decidir se pode ser descontinuada';

    public function handle(): int
    {
        $this->info('🔍 AUDITORIA: training_sessions');
        $this->newLine();

        // 1. Verificar se tabela existe
        if (!Schema::hasTable('training_sessions')) {
            $this->warn('⚠️  Tabela training_sessions NÃO EXISTE.');
            $this->info('✅ Pode prosseguir sem preocupações - tabela já foi removida ou nunca existiu.');
            return self::SUCCESS;
        }

        $this->info('✅ Tabela training_sessions EXISTE.');
        $this->newLine();

        // 2. Contar registos
        $totalRecords = DB::table('training_sessions')->count();
        $this->info("📊 Total de registos: {$totalRecords}");

        if ($totalRecords === 0) {
            $this->info('✅ Tabela está VAZIA.');
            $this->warn('💡 Recomendação: Marcar como DEPRECATED mas NÃO REMOVER ainda (segurança).');
            $this->newLine();
            return self::SUCCESS;
        }

        // 3. Analisar dados
        $this->warn("⚠️  Tabela contém {$totalRecords} registos!");
        $this->newLine();

        // Sample de 5 registos
        $sampleRecords = DB::table('training_sessions')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $this->info('📋 Sample de registos (últimos 5):');
        $this->table(
            ['ID', 'Created At', 'Colunas Adicionais'],
            $sampleRecords->map(function ($record) {
                return [
                    substr($record->id ?? 'N/A', 0, 8) . '...',
                    $record->created_at ?? 'N/A',
                    json_encode((array)$record, JSON_UNESCAPED_UNICODE),
                ];
            })
        );

        $this->newLine();

        // 4. Verificar se há relações com trainings
        $recordsWithTrainingId = DB::table('training_sessions')
            ->whereNotNull('treino_id')
            ->count();

        if ($recordsWithTrainingId > 0) {
            $this->warn("⚠️  {$recordsWithTrainingId} registos têm treino_id (possível relação com trainings).");
            $this->info('💡 Pode ser necessário migrar estes dados para a tabela trainings antes de descontinuar.');
        }

        // 5. Estatísticas por data
        $oldestRecord = DB::table('training_sessions')
            ->orderBy('created_at', 'asc')
            ->first();
        $newestRecord = DB::table('training_sessions')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($oldestRecord && $newestRecord) {
            $this->info("📅 Registo mais antigo: " . ($oldestRecord->created_at ?? 'N/A'));
            $this->info("📅 Registo mais recente: " . ($newestRecord->created_at ?? 'N/A'));
        }

        $this->newLine();

        // 6. Recomendações
        $this->info('📌 RECOMENDAÇÕES:');
        if ($totalRecords < 10) {
            $this->line('  1. Poucos registos → Analisar manualmente se são dados de teste');
            $this->line('  2. Se forem teste → Limpar e marcar tabela como DEPRECATED');
            $this->line('  3. Se forem reais → Migrar para trainings antes de descontinuar');
        } else {
            $this->line('  1. Tabela com dados significativos');
            $this->line('  2. Criar comando de migração: php artisan desportivo:migrar-training-sessions');
            $this->line('  3. Apenas após migração com sucesso, marcar como DEPRECATED');
        }

        $this->newLine();
        $this->line('  4. NUNCA remover dados sem backup completo');
        $this->line('  5. Manter tabela por pelo menos 6 meses após deprecation');

        // 7. Exportar resultados (se flag --export)
        if ($exportPath = $this->option('export')) {
            $auditData = [
                'timestamp' => now()->toIso8601String(),
                'table_exists' => true,
                'total_records' => $totalRecords,
                'records_with_training_id' => $recordsWithTrainingId,
                'oldest_record' => $oldestRecord->created_at ?? null,
                'newest_record' => $newestRecord->created_at ?? null,
                'sample_records' => $sampleRecords->toArray(),
                'recommendation' => $totalRecords === 0 ? 'SAFE_TO_DEPRECATE' : 'MIGRATION_REQUIRED',
            ];

            file_put_contents($exportPath, json_encode($auditData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $this->info("✅ Resultados exportados para: {$exportPath}");
        }

        $this->newLine();

        return self::SUCCESS;
    }
}
