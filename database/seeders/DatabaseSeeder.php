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
            'password' => Hash::make('password'),
            'numero_socio' => '001',
            'nome_completo' => 'Administrador do Sistema',
            'perfil' => 'admin',
            'estado' => 'ativo',
        ]);

        // Create user types
        $userTypes = [
            ['name' => 'Atleta', 'description' => 'Atleta do clube', 'active' => true],
            ['name' => 'Treinador', 'description' => 'Treinador/Staff', 'active' => true],
            ['name' => 'Sócio', 'description' => 'Sócio do clube', 'active' => true],
            ['name' => 'Encarregado de Educação', 'description' => 'Encarregado de educação', 'active' => true],
        ];

        foreach ($userTypes as $type) {
            UserType::create($type);
        }

        // Create age groups
        $ageGroups = [
            ['name' => 'Sub-10', 'description' => 'Até 10 anos', 'min_age' => 0, 'max_age' => 10, 'active' => true],
            ['name' => 'Sub-12', 'description' => '11-12 anos', 'min_age' => 11, 'max_age' => 12, 'active' => true],
            ['name' => 'Infantis', 'description' => '13-14 anos', 'min_age' => 13, 'max_age' => 14, 'active' => true],
            ['name' => 'Juvenis', 'description' => '15-16 anos', 'min_age' => 15, 'max_age' => 16, 'active' => true],
            ['name' => 'Juniores', 'description' => '17-19 anos', 'min_age' => 17, 'max_age' => 19, 'active' => true],
            ['name' => 'Seniores', 'description' => '20+ anos', 'min_age' => 20, 'max_age' => null, 'active' => true],
        ];

        foreach ($ageGroups as $group) {
            AgeGroup::create($group);
        }

        // Create event types
        $eventTypes = [
            ['name' => 'Treino', 'description' => 'Sessão de treino', 'active' => true],
            ['name' => 'Competição', 'description' => 'Evento competitivo', 'active' => true],
            ['name' => 'Prova', 'description' => 'Prova desportiva', 'active' => true],
            ['name' => 'Estágio', 'description' => 'Estágio/concentração', 'active' => true],
            ['name' => 'Reunião', 'description' => 'Reunião geral', 'active' => true],
        ];

        foreach ($eventTypes as $type) {
            EventType::create($type);
        }

        // Create cost centers  
        $costCenters = [
            ['code' => 'FMD', 'name' => 'Formação Desportiva', 'description' => 'Custos de formação', 'active' => true],
            ['code' => 'ADM', 'name' => 'Administrativo', 'description' => 'Custos administrativos', 'active' => true],
            ['code' => 'EQP', 'name' => 'Equipamentos', 'description' => 'Material desportivo', 'active' => true],
            ['code' => 'EVT', 'name' => 'Eventos', 'description' => 'Organização de eventos', 'active' => true],
        ];

        foreach ($costCenters as $center) {
            CostCenter::create($center);
        }
    }
}
