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
                'nome' => 'Atleta',
                'descricao' => 'Atleta',
                'ativo' => true,
            ],
            [
                'nome' => 'Treinador',
                'descricao' => 'Treinador',
                'ativo' => true,
            ],
            [
                'nome' => 'Encarregado de Educação',
                'descricao' => 'Encarregado de Educação',
                'ativo' => true,
            ],
            [
                'nome' => 'Dirigente',
                'descricao' => 'Dirigente',
                'ativo' => true,
            ],
            [
                'nome' => 'Sócio',
                'descricao' => 'Sócio',
                'ativo' => true,
            ],
        ];

        foreach ($types as $type) {
            UserType::updateOrCreate(
                ['nome' => $type['nome']],
                $type
            );
        }
    }
}
