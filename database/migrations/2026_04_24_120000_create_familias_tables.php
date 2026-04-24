<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('familias', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->foreignUuid('responsavel_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('observacoes')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->index('responsavel_user_id');
            $table->index('ativo');
        });

        Schema::create('familia_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('familia_id')->constrained('familias')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('papel_na_familia', 50)->default('familiar');
            $table->boolean('pode_editar')->default(false);
            $table->boolean('pode_ver_financeiro')->default(false);
            $table->boolean('pode_ver_desportivo')->default(false);
            $table->boolean('pode_ver_documentos')->default(false);
            $table->boolean('pode_ver_comunicacoes')->default(false);
            $table->timestamps();

            $table->unique(['familia_id', 'user_id']);
            $table->index('user_id');
            $table->index('papel_na_familia');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('familia_user');
        Schema::dropIfExists('familias');
    }
};