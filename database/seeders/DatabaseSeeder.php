<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\EventType;
use App\Models\CostCenter;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'numero_socio' => '001',
            'nome_completo' => 'Administrador do Sistema',
            'perfil' => 'admin',
            'estado' => 'ativo',
            'data_nascimento' => '1990-01-01',
            'menor' => false,
            'sexo' => 'masculino',
            'rgpd' => true,
            'consentimento' => true,
            'afiliacao' => true,
            'declaracao_de_transporte' => false,
        ]);

        // Create user types
        $userTypes = [
            ['nome' => 'Atleta', 'descricao' => 'Atleta do clube', 'ativo' => true],
            ['nome' => 'Treinador', 'descricao' => 'Treinador/Staff', 'ativo' => true],
            ['nome' => 'Sócio', 'descricao' => 'Sócio do clube', 'ativo' => true],
            ['nome' => 'Encarregado de Educação', 'descricao' => 'Encarregado de educação', 'ativo' => true],
        ];

        foreach ($userTypes as $type) {
            UserType::create($type);
        }

        // Create age groups
        $ageGroups = [
            ['nome' => 'Sub-10', 'descricao' => 'Até 10 anos', 'idade_minima' => 0, 'idade_maxima' => 10, 'ativo' => true],
            ['nome' => 'Sub-12', 'descricao' => '11-12 anos', 'idade_minima' => 11, 'idade_maxima' => 12, 'ativo' => true],
            ['nome' => 'Infantis', 'descricao' => '13-14 anos', 'idade_minima' => 13, 'idade_maxima' => 14, 'ativo' => true],
            ['nome' => 'Juvenis', 'descricao' => '15-16 anos', 'idade_minima' => 15, 'idade_maxima' => 16, 'ativo' => true],
            ['nome' => 'Juniores', 'descricao' => '17-19 anos', 'idade_minima' => 17, 'idade_maxima' => 19, 'ativo' => true],
            ['nome' => 'Seniores', 'descricao' => '20+ anos', 'idade_minima' => 20, 'idade_maxima' => null, 'ativo' => true],
        ];

        foreach ($ageGroups as $group) {
            AgeGroup::create($group);
        }

        // Create event types
        $eventTypes = [
            ['nome' => 'Treino', 'descricao' => 'Sessão de treino', 'ativo' => true],
            ['nome' => 'Competição', 'descricao' => 'Evento competitivo', 'ativo' => true],
            ['nome' => 'Prova', 'descricao' => 'Prova desportiva', 'ativo' => true],
            ['nome' => 'Estágio', 'descricao' => 'Estágio/concentração', 'ativo' => true],
            ['nome' => 'Reunião', 'descricao' => 'Reunião geral', 'ativo' => true],
        ];

        foreach ($eventTypes as $type) {
            EventType::create($type);
        }

        // Create cost centers  
        $costCenters = [
            ['codigo' => 'FMD', 'nome' => 'Formação Desportiva', 'descricao' => 'Custos de formação', 'ativo' => true],
            ['codigo' => 'ADM', 'nome' => 'Administrativo', 'descricao' => 'Custos administrativos', 'ativo' => true],
            ['codigo' => 'EQP', 'nome' => 'Equipamentos', 'descricao' => 'Material desportivo', 'ativo' => true],
            ['codigo' => 'EVT', 'nome' => 'Eventos', 'descricao' => 'Organização de eventos', 'ativo' => true],
        ];

        foreach ($costCenters as $center) {
            CostCenter::create($center);
        }
    }
}
