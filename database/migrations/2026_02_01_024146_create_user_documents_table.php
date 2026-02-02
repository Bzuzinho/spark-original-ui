<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->enum('tipo', ['cc', 'atestado', 'autorizacao', 'rgpd', 'consentimento', 'afiliacao', 'declaracao_transporte', 'outro']);
            $table->string('nome')->nullable();
            $table->string('ficheiro');
            $table->date('data_validade')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_documents');
    }
};
