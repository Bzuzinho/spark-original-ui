<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('user_types')) {
            return;
        }

        Schema::table('user_types', function (Blueprint $table) {
            if (! Schema::hasColumn('user_types', 'codigo')) {
                $table->string('codigo', 100)->nullable()->after('id');
            }

            if (! Schema::hasColumn('user_types', 'menu_visibility_configured')) {
                $table->boolean('menu_visibility_configured')->default(false)->after('ativo');
            }
        });

        $mappings = [
            'admin' => 'administrador',
            'administrador' => 'administrador',
            'dirigente' => 'direcao',
            'direcao' => 'direcao',
            'treinador' => 'treinador',
            'atleta' => 'atleta',
            'encarregado de educacao' => 'encarregado_educacao',
            'encarregado_educacao' => 'encarregado_educacao',
            'tesouraria' => 'tesouraria',
            'socio' => 'socio',
        ];

        $usedCodes = [];

        DB::table('user_types')->orderBy('created_at')->get()->each(function ($userType) use ($mappings, &$usedCodes) {
            $normalizedName = Str::of((string) $userType->nome)->lower()->ascii()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->value();
            $baseCodigo = $mappings[$normalizedName] ?? $normalizedName;

            if ($baseCodigo === '') {
                $baseCodigo = 'tipo_utilizador';
            }

            $codigo = $baseCodigo;
            $suffix = 2;

            while (in_array($codigo, $usedCodes, true)) {
                $codigo = $baseCodigo . '_' . $suffix;
                $suffix++;
            }

            $usedCodes[] = $codigo;

            DB::table('user_types')->where('id', $userType->id)->update([
                'codigo' => $codigo,
            ]);
        });

        Schema::table('user_types', function (Blueprint $table) {
            $table->unique('codigo', 'user_types_codigo_unique');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('user_types')) {
            return;
        }

        Schema::table('user_types', function (Blueprint $table) {
            if (Schema::hasColumn('user_types', 'codigo')) {
                $table->dropUnique('user_types_codigo_unique');
                $table->dropColumn('codigo');
            }

            if (Schema::hasColumn('user_types', 'menu_visibility_configured')) {
                $table->dropColumn('menu_visibility_configured');
            }
        });
    }
};