<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        if (!Schema::hasTable('invoice_types')) {
            Schema::create('invoice_types', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('codigo')->unique();
                $table->string('nome');
                $table->string('descricao')->nullable();
                $table->boolean('ativo')->default(true);
                $table->timestamps();
            });
        }

        try {
            DB::statement('alter table "invoice_types" add primary key ("id")');
        } catch (\Throwable $e) {
            // Ignore if constraint already exists.
        }

        try {
            DB::statement('alter table "invoice_types" add constraint "invoice_types_codigo_unique" unique ("codigo")');
        } catch (\Throwable $e) {
            // Ignore if constraint already exists.
        }

        $now = now();
        $defaults = [
            [
                'codigo' => 'mensalidade',
                'nome' => 'Mensalidade',
                'descricao' => 'Fatura mensal de inscricao',
                'ativo' => true,
            ],
            [
                'codigo' => 'inscricao',
                'nome' => 'Inscricao',
                'descricao' => 'Fatura de inscricao',
                'ativo' => true,
            ],
            [
                'codigo' => 'material',
                'nome' => 'Material',
                'descricao' => 'Venda de material',
                'ativo' => true,
            ],
            [
                'codigo' => 'servico',
                'nome' => 'Servico',
                'descricao' => 'Prestacao de servicos',
                'ativo' => true,
            ],
            [
                'codigo' => 'outro',
                'nome' => 'Outro',
                'descricao' => null,
                'ativo' => true,
            ],
        ];

        foreach ($defaults as $row) {
            $exists = DB::table('invoice_types')->where('codigo', $row['codigo'])->exists();
            if ($exists) {
                DB::table('invoice_types')->where('codigo', $row['codigo'])->update([
                    'nome' => $row['nome'],
                    'descricao' => $row['descricao'],
                    'ativo' => $row['ativo'],
                    'updated_at' => $now,
                ]);
                continue;
            }

            DB::table('invoice_types')->insert([
                'id' => (string) Str::uuid(),
                'codigo' => $row['codigo'],
                'nome' => $row['nome'],
                'descricao' => $row['descricao'],
                'ativo' => $row['ativo'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_types');
    }
};
