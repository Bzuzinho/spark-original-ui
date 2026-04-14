<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\EventType;
use App\Models\Prova;
use App\Models\ProvaTipo;
use App\Models\MonthlyFee;
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
        $this->call(UserTypeSeeder::class);

        // Create age groups (escalões)
        $this->call(AgeGroupSeeder::class);

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
        $this->call(CostCenterSeeder::class);

        // Create event types
        $this->call(EventTypeSeeder::class);

        // Create monthly fees (mensalidades)
        $this->call(MonthlyFeeSeeder::class);

        // Create swimming races (provas)
        $this->call(ProvaSeeder::class);

        // Create swimming race types for configs (prova tipos)
        $this->call(ProvaTipoSeeder::class);

        // Create default communication templates (mensalidade, presencas, comportamento)
        $this->call(CommunicationTemplateSeeder::class);
    }
}
