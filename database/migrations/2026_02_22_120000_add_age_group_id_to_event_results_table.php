<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        if (!Schema::hasColumn('event_results', 'age_group_id')) {
            Schema::table('event_results', function (Blueprint $table) {
                $table->uuid('age_group_id')->nullable()->after('piscina');
            });
        }

        if (!$this->hasIndex('event_results', 'event_results_age_group_id_index')) {
            Schema::table('event_results', function (Blueprint $table) {
                $table->index('age_group_id');
            });
        }

        if (!$this->hasForeignKey('event_results', 'event_results_age_group_id_foreign')) {
            Schema::table('event_results', function (Blueprint $table) {
                $table->foreign('age_group_id')->references('id')->on('age_groups')->nullOnDelete();
            });
        }

        $ageGroups = DB::table('age_groups')->select('id', 'nome')->get();
        $nameToId = [];

        foreach ($ageGroups as $group) {
            if (!empty($group->nome)) {
                $nameToId[mb_strtolower(trim($group->nome))] = $group->id;
            }
        }

        DB::table('event_results')
            ->select('id', 'escalao')
            ->whereNull('age_group_id')
            ->whereNotNull('escalao')
            ->orderBy('created_at')
            ->chunk(200, function ($rows) use ($ageGroups, $nameToId) {
                foreach ($rows as $row) {
                    $rawValue = trim((string) $row->escalao);
                    if ($rawValue === '') {
                        continue;
                    }

                    $resolvedId = null;

                    foreach ($ageGroups as $group) {
                        if ($group->id === $rawValue) {
                            $resolvedId = $group->id;
                            break;
                        }
                    }

                    if ($resolvedId === null) {
                        $resolvedId = $nameToId[mb_strtolower($rawValue)] ?? null;
                    }

                    if ($resolvedId) {
                        DB::table('event_results')
                            ->where('id', $row->id)
                            ->update(['age_group_id' => $resolvedId]);
                    }
                }
            });
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        return DB::table('pg_indexes')
            ->where('schemaname', DB::raw('current_schema()'))
            ->where('tablename', $table)
            ->where('indexname', $indexName)
            ->exists();
    }

    private function hasForeignKey(string $table, string $constraintName): bool
    {
        return DB::table('pg_constraint')
            ->whereRaw('conrelid = ?::regclass', [$table])
            ->where('contype', 'f')
            ->where('conname', $constraintName)
            ->exists();
    }

    public function down(): void
    {
        if (!Schema::hasColumn('event_results', 'age_group_id')) {
            return;
        }

        Schema::table('event_results', function (Blueprint $table) {
            $table->dropForeign(['age_group_id']);
            $table->dropIndex(['age_group_id']);
            $table->dropColumn('age_group_id');
        });
    }
};
