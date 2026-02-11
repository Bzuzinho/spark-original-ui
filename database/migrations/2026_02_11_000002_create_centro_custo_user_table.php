<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('centro_custo_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('centro_custo_id');
            $table->decimal('peso', 6, 2)->default(1);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('centro_custo_id')->references('id')->on('cost_centers')->onDelete('cascade');
            $table->unique(['user_id', 'centro_custo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('centro_custo_user');
    }
};
