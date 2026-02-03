<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\EventType;
use App\Models\CostCenter;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventConvocation;
use App\Models\Training;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\MonthlyFee;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Sponsor;
use App\Models\Movement;
use App\Models\MovementItem;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create User Types
        $userTypes = [
            ['name' => 'Atleta', 'description' => 'Atleta do clube', 'active' => true],
            ['name' => 'Treinador', 'description' => 'Treinador/Staff', 'active' => true],
            ['name' => 'Sócio', 'description' => 'Sócio do clube', 'active' => true],
            ['name' => 'Encarregado de Educação', 'description' => 'Encarregado de educação', 'active' => true],
        ];

        foreach ($userTypes as $type) {
            UserType::firstOrCreate(['name' => $type['name']], $type);
        }

        // Create Age Groups
        $ageGroups = [
            ['name' => 'Sub-10', 'description' => 'Até 10 anos', 'min_age' => 0, 'max_age' => 10, 'active' => true],
            ['name' => 'Sub-12', 'description' => '11-12 anos', 'min_age' => 11, 'max_age' => 12, 'active' => true],
            ['name' => 'Infantis', 'description' => '13-14 anos', 'min_age' => 13, 'max_age' => 14, 'active' => true],
            ['name' => 'Juvenis', 'description' => '15-16 anos', 'min_age' => 15, 'max_age' => 16, 'active' => true],
            ['name' => 'Juniores', 'description' => '17-19 anos', 'min_age' => 17, 'max_age' => 19, 'active' => true],
            ['name' => 'Seniores', 'description' => '20+ anos', 'min_age' => 20, 'max_age' => null, 'active' => true],
        ];

        foreach ($ageGroups as $group) {
            AgeGroup::firstOrCreate(['name' => $group['name']], $group);
        }

        // Create Event Types
        $eventTypes = [
            ['name' => 'Treino', 'description' => 'Sessão de treino', 'active' => true],
            ['name' => 'Competição', 'description' => 'Evento competitivo', 'active' => true],
            ['name' => 'Prova', 'description' => 'Prova desportiva', 'active' => true],
            ['name' => 'Estágio', 'description' => 'Estágio/concentração', 'active' => true],
            ['name' => 'Reunião', 'description' => 'Reunião geral', 'active' => true],
        ];

        foreach ($eventTypes as $type) {
            EventType::firstOrCreate(['name' => $type['name']], $type);
        }

        // Create Cost Centers
        $costCenters = [
            ['code' => 'FMD', 'name' => 'Formação Desportiva', 'description' => 'Custos de formação', 'active' => true],
            ['code' => 'ADM', 'name' => 'Administrativo', 'description' => 'Custos administrativos', 'active' => true],
            ['code' => 'EQP', 'name' => 'Equipamentos', 'description' => 'Material desportivo', 'active' => true],
            ['code' => 'EVT', 'name' => 'Eventos', 'description' => 'Organização de eventos', 'active' => true],
        ];

        foreach ($costCenters as $center) {
            CostCenter::firstOrCreate(['code' => $center['code']], $center);
        }

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin User',
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
            ]
        );

        // Create 100 Members (mix of athletes, members, coaches)
        $this->command->info('Creating 100 members...');
        for ($i = 2; $i <= 101; $i++) {
            $isAthlete = $i <= 75; // 75 athletes, 25 others
            $age = $isAthlete ? rand(8, 25) : rand(25, 65);
            $birthYear = now()->year - $age;
            $sexo = rand(0, 1) ? 'masculino' : 'feminino';
            $firstName = $sexo === 'masculino' 
                ? ['João', 'Pedro', 'Miguel', 'Tiago', 'André', 'Carlos', 'Ricardo'][rand(0, 6)]
                : ['Maria', 'Ana', 'Joana', 'Sofia', 'Beatriz', 'Carolina', 'Rita'][rand(0, 6)];
            $lastName = ['Silva', 'Santos', 'Ferreira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins'][rand(0, 6)];
            
            User::create([
                'name' => "$firstName $lastName",
                'email' => "user{$i}@test.com",
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'numero_socio' => str_pad($i, 3, '0', STR_PAD_LEFT),
                'nome_completo' => "$firstName $lastName",
                'perfil' => $isAthlete ? 'atleta' : ($i <= 80 ? 'user' : 'admin'),
                'estado' => 'ativo',
                'data_nascimento' => "{$birthYear}-" . rand(1, 12) . "-" . rand(1, 28),
                'menor' => $age < 18,
                'sexo' => $sexo,
                'tipo_membro' => [$isAthlete ? 'Atleta' : 'Sócio'],
                'rgpd' => true,
                'consentimento' => true,
                'afiliacao' => $isAthlete,
                'declaracao_de_transporte' => $isAthlete && $age < 18,
                'ativo_desportivo' => $isAthlete,
            ]);
        }

        $this->command->info('Creating events...');
        $athletes = User::where('perfil', 'atleta')->limit(20)->get();
        $eventTypeIds = EventType::pluck('id')->toArray();
        
        // Create 30 Events (past and future)
        for ($i = 0; $i < 30; $i++) {
            $isPast = $i < 15;
            $daysOffset = $isPast ? -rand(1, 90) : rand(1, 60);
            $date = Carbon::now()->addDays($daysOffset);
            
            $event = Event::create([
                'titulo' => $isPast ? "Treino Passado #{$i}" : "Evento Futuro #{$i}",
                'tipo' => $eventTypeIds[array_rand($eventTypeIds)],
                'data_inicio' => $date->format('Y-m-d H:i:s'),
                'data_fim' => $date->addHours(2)->format('Y-m-d H:i:s'),
                'local' => ['Pavilhão Municipal', 'Piscina Olímpica', 'Campo de Futebol'][rand(0, 2)],
                'descricao' => 'Evento de demonstração criado pelo seeder',
                'escaloes_elegiveis' => [['Juvenis', 'Juniores', 'Seniores'][rand(0, 2)]],
                'criado_por' => User::first()->id,
            ]);

            // Add attendances for past events
            if ($isPast) {
                foreach ($athletes->random(rand(10, 15)) as $athlete) {
                    EventConvocation::create([
                        'evento_id' => $event->id,
                        'user_id' => $athlete->id,
                        'data_convocatoria' => $date->subDays(2)->format('Y-m-d'),
                        'estado_confirmacao' => 'confirmado',
                    ]);

                    EventAttendance::create([
                        'evento_id' => $event->id,
                        'user_id' => $athlete->id,
                        'estado' => rand(0, 10) > 2 ? 'presente' : 'ausente', // 80% presence rate
                        'registado_por' => User::first()->id,
                        'registado_em' => $date->format('Y-m-d H:i:s'),
                    ]);
                }
            }
        }

        $this->command->info('Creating trainings...');
        // Create some trainings
        for ($i = 0; $i < 20; $i++) {
            $date = Carbon::now()->subDays(rand(1, 90));
            Training::create([
                'data' => $date->format('Y-m-d'),
                'hora_inicio' => '18:00:00',
                'hora_fim' => '20:00:00',
                'tipo_treino' => ['tecnico', 'fisico', 'tatico'][rand(0, 2)],
                'escaloes' => [['Juvenis', 'Juniores', 'Seniores'][rand(0, 2)]],
                'local' => 'Piscina Municipal',
                'descricao_treino' => 'Treino técnico de natação',
            ]);
        }

        $this->command->info('Creating sponsors...');
        // Create 10 Sponsors
        $sponsors = [
            ['Empresa ABC', 'principal', 5000],
            ['Banco XYZ', 'principal', 4000],
            ['Loja Desportiva', 'secundario', 2000],
            ['Restaurante Local', 'secundario', 1500],
            ['Farmácia Central', 'apoio', 800],
            ['Padaria São João', 'apoio', 500],
            ['Ginásio Fitness', 'apoio', 600],
            ['Clínica Médica', 'secundario', 1200],
            ['Supermercado', 'principal', 3000],
            ['Hotel Turismo', 'secundario', 1800],
        ];

        foreach ($sponsors as $index => $sponsorData) {
            Sponsor::create([
                'nome' => $sponsorData[0],
                'tipo' => $sponsorData[1],
                'valor_anual' => $sponsorData[2],
                'data_inicio' => Carbon::now()->subMonths(rand(1, 12))->format('Y-m-d'),
                'data_fim' => Carbon::now()->addYear()->format('Y-m-d'),
                'contacto_email' => strtolower(str_replace(' ', '', $sponsorData[0])) . '@example.com',
                'estado' => 'ativo',
            ]);
        }

        $this->command->info('Creating products...');
        // Create 15 Products
        $products = [
            ['T-shirt Clube', 'vestuario', 15.00, 50],
            ['Calções Treino', 'vestuario', 12.00, 40],
            ['Casaco', 'vestuario', 35.00, 20],
            ['Meias', 'vestuario', 5.00, 100],
            ['Boné', 'vestuario', 8.00, 30],
            ['Mochila', 'acessorios', 25.00, 15],
            ['Toalha', 'acessorios', 10.00, 25],
            ['Garrafa Água', 'acessorios', 7.00, 40],
            ['Fato de Banho', 'vestuario', 30.00, 25],
            ['Óculos Natação', 'equipamento', 12.00, 35],
            ['Touca', 'equipamento', 6.00, 50],
            ['Chinelos', 'vestuario', 10.00, 30],
            ['Agasalho', 'vestuario', 40.00, 15],
            ['Leggings', 'vestuario', 20.00, 20],
            ['Porta-chaves', 'acessorios', 3.00, 100],
        ];

        foreach ($products as $productData) {
            Product::create([
                'nome' => $productData[0],
                'categoria' => $productData[1],
                'descricao' => 'Artigo oficial do clube - ' . $productData[0],
                'preco' => $productData[2],
                'stock' => $productData[3],
                'ativo' => true,
            ]);
        }

        $this->command->info('Creating sales...');
        // Create some sales
        $allProducts = Product::all();
        $members = User::limit(30)->get();
        
        for ($i = 0; $i < 25; $i++) {
            $sale = Sale::create([
                'user_id' => $members->random()->id,
                'data' => Carbon::now()->subDays(rand(1, 60))->format('Y-m-d'),
                'total' => 0,
                'metodo_pagamento' => ['dinheiro', 'multibanco', 'mbway'][rand(0, 2)],
            ]);

            $total = 0;
            $numItems = rand(1, 4);
            foreach ($allProducts->random($numItems) as $product) {
                $quantidade = rand(1, 3);
                $subtotal = $product->preco * $quantidade;
                $total += $subtotal;
            }
            
            $sale->update(['total' => $total]);
        }

        $this->command->info('Creating invoices and monthly fees...');
        // Create invoices and monthly fees
        $feeMembers = User::where('perfil', '!=', 'admin')->limit(50)->get();
        
        foreach ($feeMembers as $member) {
            // Create monthly fees for last 3 months
            for ($month = 0; $month < 3; $month++) {
                $dueDate = Carbon::now()->subMonths($month)->day(10);
                $isPaid = $month > 0 || rand(0, 10) > 3; // Most old ones are paid
                
                MonthlyFee::create([
                    'user_id' => $member->id,
                    'mes' => $dueDate->month,
                    'ano' => $dueDate->year,
                    'valor' => 50.00,
                    'estado' => $isPaid ? 'pago' : 'pendente',
                    'data_vencimento' => $dueDate->format('Y-m-d'),
                    'data_pagamento' => $isPaid ? $dueDate->addDays(rand(1, 10))->format('Y-m-d') : null,
                ]);

                // Create corresponding invoice
                $invoice = Invoice::create([
                    'socio_id' => $member->id,
                    'data_fatura' => $dueDate->subDays(5)->format('Y-m-d'),
                    'mes' => $dueDate->month,
                    'ano' => $dueDate->year,
                    'valor_total' => 50.00,
                    'valor_pago' => $isPaid ? 50.00 : 0,
                    'estado_pagamento' => $isPaid ? 'pago' : 'pendente',
                    'data_pagamento' => $isPaid ? $dueDate->addDays(rand(1, 10))->format('Y-m-d') : null,
                    'observacoes' => 'Mensalidade ' . $dueDate->format('F Y'),
                ]);

                InvoiceItem::create([
                    'fatura_id' => $invoice->id,
                    'descricao' => 'Mensalidade - ' . $dueDate->format('F Y'),
                    'quantidade' => 1,
                    'valor_unitario' => 50.00,
                    'total_linha' => 50.00,
                ]);
            }
        }

        $this->command->info('Creating financial movements...');
        // Create 50 financial movements (transactions)
        $costCenterIds = CostCenter::pluck('id')->toArray();
        
        for ($i = 0; $i < 50; $i++) {
            $isReceita = rand(0, 1);
            $valor = rand(50, 2000);
            
            $movement = Movement::create([
                'user_id' => User::where('perfil', '!=', 'admin')->inRandomOrder()->first()->id ?? null,
                'classificacao' => $isReceita ? 'receita' : 'despesa',
                'data_emissao' => Carbon::now()->subDays(rand(1, 90))->format('Y-m-d'),
                'data_vencimento' => Carbon::now()->subDays(rand(1, 90))->addDays(15)->format('Y-m-d'),
                'tipo' => $isReceita 
                    ? ['mensalidade', 'patrocinio', 'venda'][rand(0, 2)]
                    : ['material', 'transporte', 'taxa'][rand(0, 2)],
                'valor_total' => $valor,
                'estado_pagamento' => $isReceita && rand(0, 10) > 3 ? 'pago' : 'pendente',
                'centro_custo_id' => $costCenterIds[array_rand($costCenterIds)],
                'observacoes' => $isReceita ? 'Recebimento' : 'Pagamento a fornecedor',
            ]);

            MovementItem::create([
                'movimento_id' => $movement->id,
                'descricao' => 'Item de movimento financeiro',
                'quantidade' => 1,
                'valor_unitario' => $valor,
                'total_linha' => $valor,
            ]);
        }

        $this->command->info('Demo data created successfully!');
        $this->command->info('');
        $this->command->info('Summary:');
        $this->command->info('- Users: ' . User::count());
        $this->command->info('- Athletes: ' . User::where('perfil', 'atleta')->count());
        $this->command->info('- Events: ' . Event::count());
        $this->command->info('- Trainings: ' . Training::count());
        $this->command->info('- Sponsors: ' . Sponsor::count());
        $this->command->info('- Products: ' . Product::count());
        $this->command->info('- Sales: ' . Sale::count());
        $this->command->info('- Invoices: ' . Invoice::count());
        $this->command->info('- Movements: ' . Movement::count());
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('Email: admin@test.com');
        $this->command->info('Password: password');
    }
}
