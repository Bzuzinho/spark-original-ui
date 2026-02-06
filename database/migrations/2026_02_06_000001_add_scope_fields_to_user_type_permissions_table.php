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
        if (!Schema::hasColumn('user_type_permissions', 'submodulo')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->string('submodulo', 100)->nullable();
            });
        }

        if (!Schema::hasColumn('user_type_permissions', 'separador')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->string('separador', 100)->nullable();
            });
        }

        if (!Schema::hasColumn('user_type_permissions', 'campo')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->string('campo', 100)->nullable();
            });
        }

        if (!Schema::hasColumn('user_type_permissions', 'pode_criar')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->boolean('pode_criar')->default(false);
            });
        }

        DB::statement("CREATE INDEX IF NOT EXISTS user_type_permissions_scope_idx ON user_type_permissions (user_type_id, modulo, submodulo, separador, campo)");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS user_type_permissions_scope_idx');

        if (Schema::hasColumn('user_type_permissions', 'submodulo')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->dropColumn('submodulo');
            });
        }

        if (Schema::hasColumn('user_type_permissions', 'separador')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->dropColumn('separador');
            });
        }

        if (Schema::hasColumn('user_type_permissions', 'campo')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->dropColumn('campo');
            });
        }

        if (Schema::hasColumn('user_type_permissions', 'pode_criar')) {
            Schema::table('user_type_permissions', function (Blueprint $table) {
                $table->dropColumn('pode_criar');
            });
        }
    }
};
