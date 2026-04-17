<?php

namespace Database\Seeders;

use App\Models\UserType;
use Illuminate\Database\Seeder;

class UserTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'codigo' => 'administrador',
                'nome' => 'Administrador',
                'descricao' => 'Administrador',
                'ativo' => true,
            ],
            [
                'codigo' => 'direcao',
                'nome' => 'Direção',
                'descricao' => 'Direção',
                'ativo' => true,
            ],
            [
                'codigo' => 'tesouraria',
                'nome' => 'Tesouraria',
                'descricao' => 'Tesouraria',
                'ativo' => true,
            ],
            [
                'codigo' => 'atleta',
                'nome' => 'Atleta',
                'descricao' => 'Atleta',
                'ativo' => true,
            ],
            [
                'codigo' => 'treinador',
                'nome' => 'Treinador',
                'descricao' => 'Treinador',
                'ativo' => true,
            ],
            [
                'codigo' => 'encarregado_educacao',
                'nome' => 'Encarregado de Educação',
                'descricao' => 'Encarregado de Educação',
                'ativo' => true,
            ],
            [
                'codigo' => 'socio',
                'nome' => 'Sócio',
                'descricao' => 'Sócio',
                'ativo' => true,
            ],
        ];

        foreach ($types as $type) {
            $existing = UserType::query()
                ->where('codigo', $type['codigo'])
                ->orWhere('nome', $type['nome'])
                ->first();

            if ($existing) {
                $existing->update($type);
                continue;
            }

            UserType::create($type);
        }
    }
}
