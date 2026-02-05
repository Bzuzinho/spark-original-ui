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
                'descricao' => 'Membro praticante de atividades desportivas',
                'ativo' => true,
            ],
            [
                'nome' => 'Encarregado de Educação',
                'descricao' => 'Responsável legal por atleta menor',
                'ativo' => true,
            ],
            [
                'nome' => 'Treinador',
                'descricao' => 'Profissional responsável pelo treino de atletas',
                'ativo' => true,
            ],
            [
                'nome' => 'Dirigente',
                'descricao' => 'Membro da direção do clube',
                'ativo' => true,
            ],
            [
                'nome' => 'Funcionário',
                'descricao' => 'Colaborador do clube',
                'ativo' => true,
            ],
            [
                'nome' => 'Sócio',
                'descricao' => 'Membro não praticante',
                'ativo' => true,
            ],
        ];

        foreach ($types as $type) {
            UserType::firstOrCreate(
                ['nome' => $type['nome']],
                $type
            );
        }
    }
}
