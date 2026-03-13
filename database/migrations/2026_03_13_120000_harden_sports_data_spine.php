<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->ensureTrainingMetricsColumns();

        // Foreign keys (canonical model hardening).
        $this->addForeignIfPossible('athlete_sports_data', 'user_id', 'users', 'id', 'fk_asd_user_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('athlete_sports_data', 'escalao_id', 'age_groups', 'id', 'fk_asd_escalao_id', 'set null', 'cascade');

        $this->addForeignIfPossible('macrocycles', 'epoca_id', 'seasons', 'id', 'fk_macrocycles_epoca_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('mesocycles', 'macrociclo_id', 'macrocycles', 'id', 'fk_mesocycles_macrociclo_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('microcycles', 'mesociclo_id', 'mesocycles', 'id', 'fk_microcycles_mesociclo_id', 'cascade', 'cascade');

        $this->addForeignIfPossible('trainings', 'epoca_id', 'seasons', 'id', 'fk_trainings_epoca_id', 'set null', 'cascade');
        $this->addForeignIfPossible('trainings', 'macrocycle_id', 'macrocycles', 'id', 'fk_trainings_macrocycle_id', 'set null', 'cascade');
        $this->addForeignIfPossible('trainings', 'mesocycle_id', 'mesocycles', 'id', 'fk_trainings_mesocycle_id', 'set null', 'cascade');
        $this->addForeignIfPossible('trainings', 'microciclo_id', 'microcycles', 'id', 'fk_trainings_microciclo_id', 'set null', 'cascade');
        $this->addForeignIfPossible('trainings', 'microcycle_id', 'microcycles', 'id', 'fk_trainings_microcycle_id', 'set null', 'cascade');

        $this->addForeignIfPossible('training_series', 'treino_id', 'trainings', 'id', 'fk_training_series_treino_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_series', 'training_id', 'trainings', 'id', 'fk_training_series_training_id', 'cascade', 'cascade');

        $this->addForeignIfPossible('training_athletes', 'treino_id', 'trainings', 'id', 'fk_training_athletes_treino_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_athletes', 'training_id', 'trainings', 'id', 'fk_training_athletes_training_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_athletes', 'user_id', 'users', 'id', 'fk_training_athletes_user_id', 'cascade', 'cascade');

        $this->addForeignIfPossible('training_metrics', 'treino_id', 'trainings', 'id', 'fk_training_metrics_treino_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_metrics', 'training_id', 'trainings', 'id', 'fk_training_metrics_training_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_metrics', 'training_athlete_id', 'training_athletes', 'id', 'fk_training_metrics_training_athlete_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_metrics', 'user_id', 'users', 'id', 'fk_training_metrics_user_id', 'cascade', 'cascade');

        $this->addForeignIfPossible('training_age_group', 'treino_id', 'trainings', 'id', 'fk_training_age_group_treino_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_age_group', 'training_id', 'trainings', 'id', 'fk_training_age_group_training_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('training_age_group', 'age_group_id', 'age_groups', 'id', 'fk_training_age_group_age_group_id', 'cascade', 'cascade');

        $this->addForeignIfPossible('provas', 'competicao_id', 'competitions', 'id', 'fk_provas_competicao_id', 'set null', 'cascade');
        $this->addForeignIfPossible('provas', 'competition_id', 'competitions', 'id', 'fk_provas_competition_id', 'set null', 'cascade');

        $this->addForeignIfPossible('competition_registrations', 'prova_id', 'provas', 'id', 'fk_competition_registrations_prova_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('competition_registrations', 'user_id', 'users', 'id', 'fk_competition_registrations_user_id', 'cascade', 'cascade');

        $this->addForeignIfPossible('results', 'prova_id', 'provas', 'id', 'fk_results_prova_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('results', 'user_id', 'users', 'id', 'fk_results_user_id', 'restrict', 'cascade');

        $this->addForeignIfPossible('team_results', 'competicao_id', 'competitions', 'id', 'fk_team_results_competicao_id', 'cascade', 'cascade');
        $this->addForeignIfPossible('team_results', 'competition_id', 'competitions', 'id', 'fk_team_results_competition_id', 'cascade', 'cascade');

        // Indexes.
        $this->addIndexIfPossible('trainings', ['epoca_id', 'data'], 'idx_trainings_epoca_data');
        $this->addIndexIfPossible('trainings', ['season_id', 'date'], 'idx_trainings_season_date');
        $this->addIndexIfPossible('trainings', ['date'], 'idx_trainings_date');

        $this->addIndexIfPossible('training_athletes', ['treino_id'], 'idx_training_athletes_treino_id');
        $this->addIndexIfPossible('training_athletes', ['training_id'], 'idx_training_athletes_training_id');
        $this->addIndexIfPossible('training_athletes', ['user_id'], 'idx_training_athletes_user_id');
        $this->addUniqueIfPossible('training_athletes', ['treino_id', 'user_id'], 'uq_training_athletes_treino_user');
        $this->addUniqueIfPossible('training_athletes', ['training_id', 'user_id'], 'uq_training_athletes_training_user');

        $this->addIndexIfPossible('training_metrics', ['treino_id'], 'idx_training_metrics_treino_id');
        $this->addIndexIfPossible('training_metrics', ['training_id'], 'idx_training_metrics_training_id');
        $this->addIndexIfPossible('training_metrics', ['training_athlete_id'], 'idx_training_metrics_training_athlete_id');
        $this->addIndexIfPossible('training_metrics', ['user_id'], 'idx_training_metrics_user_id');
        $this->addIndexIfPossible('training_metrics', ['recorded_at'], 'idx_training_metrics_recorded_at');

        $this->addUniqueIfPossible('athlete_sports_data', ['user_id'], 'uq_athlete_sports_data_user_id');
        $this->addIndexIfPossible('athlete_sports_data', ['escalao_id'], 'idx_athlete_sports_data_escalao_id');

        $this->addIndexIfPossible('competitions', ['date', 'status'], 'idx_competitions_date_status');
        $this->addIndexIfPossible('competitions', ['data_inicio', 'tipo'], 'idx_competitions_data_inicio_tipo');

        $this->addIndexIfPossible('provas', ['competicao_id'], 'idx_provas_competicao_id');
        $this->addIndexIfPossible('provas', ['competition_id'], 'idx_provas_competition_id');

        $this->addIndexIfPossible('competition_registrations', ['prova_id'], 'idx_competition_registrations_prova_id');
        $this->addIndexIfPossible('competition_registrations', ['user_id'], 'idx_competition_registrations_user_id');
        $this->addUniqueIfPossible('competition_registrations', ['prova_id', 'user_id'], 'uq_competition_registrations_prova_user');

        $this->addIndexIfPossible('results', ['prova_id'], 'idx_results_prova_id');
        $this->addIndexIfPossible('results', ['user_id'], 'idx_results_user_id');
        $this->addIndexIfPossible('results', ['user_id', 'prova_id'], 'idx_results_user_prova');

        $this->addIndexIfPossible('team_results', ['competicao_id'], 'idx_team_results_competicao_id');
        $this->addIndexIfPossible('team_results', ['competition_id'], 'idx_team_results_competition_id');
    }

    public function down(): void
    {
        $foreigns = [
            ['athlete_sports_data', 'fk_asd_user_id'],
            ['athlete_sports_data', 'fk_asd_escalao_id'],
            ['macrocycles', 'fk_macrocycles_epoca_id'],
            ['mesocycles', 'fk_mesocycles_macrociclo_id'],
            ['microcycles', 'fk_microcycles_mesociclo_id'],
            ['trainings', 'fk_trainings_epoca_id'],
            ['trainings', 'fk_trainings_macrocycle_id'],
            ['trainings', 'fk_trainings_mesocycle_id'],
            ['trainings', 'fk_trainings_microciclo_id'],
            ['trainings', 'fk_trainings_microcycle_id'],
            ['training_series', 'fk_training_series_treino_id'],
            ['training_series', 'fk_training_series_training_id'],
            ['training_athletes', 'fk_training_athletes_treino_id'],
            ['training_athletes', 'fk_training_athletes_training_id'],
            ['training_athletes', 'fk_training_athletes_user_id'],
            ['training_metrics', 'fk_training_metrics_treino_id'],
            ['training_metrics', 'fk_training_metrics_training_id'],
            ['training_metrics', 'fk_training_metrics_training_athlete_id'],
            ['training_metrics', 'fk_training_metrics_user_id'],
            ['training_age_group', 'fk_training_age_group_treino_id'],
            ['training_age_group', 'fk_training_age_group_training_id'],
            ['training_age_group', 'fk_training_age_group_age_group_id'],
            ['provas', 'fk_provas_competicao_id'],
            ['provas', 'fk_provas_competition_id'],
            ['competition_registrations', 'fk_competition_registrations_prova_id'],
            ['competition_registrations', 'fk_competition_registrations_user_id'],
            ['results', 'fk_results_prova_id'],
            ['results', 'fk_results_user_id'],
            ['team_results', 'fk_team_results_competicao_id'],
            ['team_results', 'fk_team_results_competition_id'],
        ];

        foreach ($foreigns as [$table, $name]) {
            $this->dropForeignIfPossible($table, $name);
        }

        $indexes = [
            ['trainings', 'idx_trainings_epoca_data'],
            ['trainings', 'idx_trainings_season_date'],
            ['trainings', 'idx_trainings_date'],
            ['training_athletes', 'idx_training_athletes_treino_id'],
            ['training_athletes', 'idx_training_athletes_training_id'],
            ['training_athletes', 'idx_training_athletes_user_id'],
            ['training_athletes', 'uq_training_athletes_treino_user'],
            ['training_athletes', 'uq_training_athletes_training_user'],
            ['training_metrics', 'idx_training_metrics_treino_id'],
            ['training_metrics', 'idx_training_metrics_training_id'],
            ['training_metrics', 'idx_training_metrics_training_athlete_id'],
            ['training_metrics', 'idx_training_metrics_user_id'],
            ['training_metrics', 'idx_training_metrics_recorded_at'],
            ['athlete_sports_data', 'uq_athlete_sports_data_user_id'],
            ['athlete_sports_data', 'idx_athlete_sports_data_escalao_id'],
            ['competitions', 'idx_competitions_date_status'],
            ['competitions', 'idx_competitions_data_inicio_tipo'],
            ['provas', 'idx_provas_competicao_id'],
            ['provas', 'idx_provas_competition_id'],
            ['competition_registrations', 'idx_competition_registrations_prova_id'],
            ['competition_registrations', 'idx_competition_registrations_user_id'],
            ['competition_registrations', 'uq_competition_registrations_prova_user'],
            ['results', 'idx_results_prova_id'],
            ['results', 'idx_results_user_id'],
            ['results', 'idx_results_user_prova'],
            ['team_results', 'idx_team_results_competicao_id'],
            ['team_results', 'idx_team_results_competition_id'],
        ];

        foreach ($indexes as [$table, $index]) {
            $this->dropIndexIfPossible($table, $index);
        }
    }

    private function ensureTrainingMetricsColumns(): void
    {
        if (!Schema::hasTable('training_metrics')) {
            return;
        }

        Schema::table('training_metrics', function (Blueprint $table) {
            if (!Schema::hasColumn('training_metrics', 'training_athlete_id')) {
                $table->uuid('training_athlete_id')->nullable()->after('user_id');
            }

            if (!Schema::hasColumn('training_metrics', 'recorded_at')) {
                $table->timestamp('recorded_at')->nullable()->after('tempo');
            }
        });

        DB::table('training_metrics')
            ->whereNull('recorded_at')
            ->update(['recorded_at' => DB::raw('created_at')]);

        if (Schema::hasTable('training_athletes')) {
            DB::table('training_metrics')
                ->whereNull('training_athlete_id')
                ->orderBy('id')
                ->chunk(200, function ($metricsRows): void {
                    foreach ($metricsRows as $metricRow) {
                        $trainingAthleteId = DB::table('training_athletes')
                            ->where('treino_id', $metricRow->treino_id)
                            ->where('user_id', $metricRow->user_id)
                            ->value('id');

                        if ($trainingAthleteId) {
                            DB::table('training_metrics')
                                ->where('id', $metricRow->id)
                                ->update(['training_athlete_id' => $trainingAthleteId]);
                        }
                    }
                });
        }
    }

    private function addForeignIfPossible(
        string $table,
        string $column,
        string $referencesTable,
        string $referencesColumn,
        string $constraintName,
        string $onDelete,
        string $onUpdate
    ): void {
        if (!Schema::hasTable($table) || !Schema::hasColumn($table, $column)) {
            return;
        }

        if ($this->isSqlite() || $this->hasForeignConstraint($constraintName)) {
            return;
        }

        Schema::table($table, function (Blueprint $tableBlueprint) use ($column, $referencesTable, $referencesColumn, $constraintName, $onDelete, $onUpdate) {
            $tableBlueprint->foreign($column, $constraintName)
                ->references($referencesColumn)
                ->on($referencesTable)
                ->onDelete($onDelete)
                ->onUpdate($onUpdate);
        });
    }

    private function addIndexIfPossible(string $table, array $columns, string $indexName): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                return;
            }
        }

        try {
            Schema::table($table, function (Blueprint $tableBlueprint) use ($columns, $indexName) {
                $tableBlueprint->index($columns, $indexName);
            });
        } catch (\Throwable) {
            // Ignore duplicate index errors for idempotence across environments.
        }
    }

    private function addUniqueIfPossible(string $table, array $columns, string $indexName): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                return;
            }
        }

        try {
            Schema::table($table, function (Blueprint $tableBlueprint) use ($columns, $indexName) {
                $tableBlueprint->unique($columns, $indexName);
            });
        } catch (\Throwable) {
            // Ignore duplicate unique errors for idempotence across environments.
        }
    }

    private function dropForeignIfPossible(string $table, string $foreignName): void
    {
        if (!Schema::hasTable($table) || $this->isSqlite()) {
            return;
        }

        try {
            Schema::table($table, function (Blueprint $tableBlueprint) use ($foreignName) {
                $tableBlueprint->dropForeign($foreignName);
            });
        } catch (\Throwable) {
            // Ignore when the constraint does not exist.
        }
    }

    private function dropIndexIfPossible(string $table, string $indexName): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        try {
            Schema::table($table, function (Blueprint $tableBlueprint) use ($indexName) {
                $tableBlueprint->dropIndex($indexName);
            });
        } catch (\Throwable) {
            try {
                Schema::table($table, function (Blueprint $tableBlueprint) use ($indexName) {
                    $tableBlueprint->dropUnique($indexName);
                });
            } catch (\Throwable) {
                // Ignore when the index does not exist.
            }
        }
    }

    private function hasForeignConstraint(string $constraintName): bool
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            $result = DB::selectOne(
                'SELECT 1 FROM information_schema.table_constraints WHERE constraint_type = ? AND constraint_name = ? LIMIT 1',
                ['FOREIGN KEY', $constraintName]
            );

            return $result !== null;
        }

        if ($driver === 'mysql') {
            $schema = DB::getDatabaseName();
            $result = DB::selectOne(
                'SELECT 1 FROM information_schema.table_constraints WHERE constraint_type = ? AND constraint_name = ? AND table_schema = ? LIMIT 1',
                ['FOREIGN KEY', $constraintName, $schema]
            );

            return $result !== null;
        }

        return false;
    }

    private function isSqlite(): bool
    {
        return DB::getDriverName() === 'sqlite';
    }
};
