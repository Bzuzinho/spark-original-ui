<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('user_type_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_type_id')->constrained('user_types')->onDelete('cascade');
            $table->string('modulo');
            $table->boolean('pode_ver')->default(true);
            $table->boolean('pode_editar')->default(false);
            $table->boolean('pode_eliminar')->default(false);
            $table->timestamps();

            $table->index(['user_type_id', 'modulo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_type_permissions');
    }
};
