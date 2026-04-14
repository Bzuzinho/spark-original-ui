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
        Schema::create('communication_dynamic_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('strategy', 80);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('strategy');
            $table->index('is_active');
            $table->index('sort_order');
        });

        $now = now();

        DB::table('communication_dynamic_sources')->insert([
            [
                'id' => (string) Str::uuid(),
                'name' => 'Todos os membros',
                'description' => 'Inclui todos os membros ativos do sistema.',
                'strategy' => 'all_members',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Atletas por escalão',
                'description' => 'Seleciona utilizadores com perfil de atleta.',
                'strategy' => 'athletes',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Pais/Encarregados',
                'description' => 'Seleciona encarregados de educação ativos.',
                'strategy' => 'guardians',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Treinadores',
                'description' => 'Seleciona utilizadores com perfil de treinador.',
                'strategy' => 'coaches',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Pagamentos em atraso',
                'description' => 'Membros com faturas vencidas por regularizar.',
                'strategy' => 'overdue_payments',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Participantes de evento',
                'description' => 'Membros ligados a participações em eventos.',
                'strategy' => 'event_participants',
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Utilizadores com alertas por ler',
                'description' => 'Utilizadores com alertas internos pendentes de leitura.',
                'strategy' => 'users_with_unread_alerts',
                'sort_order' => 7,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_dynamic_sources');
    }
};