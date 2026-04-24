<?php

namespace Database\Seeders;

use App\Models\CostCenter;
use App\Services\Club\ClubSettingsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CostCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clubSettings = app(ClubSettingsService::class);
        $generalCenterName = sprintf('%s - Geral', $clubSettings->shortName() ?: $clubSettings->name());

        $costCenters = [
            // Equipas (Teams)
            ['nome' => 'Master', 'tipo' => 'equipa', 'descricao' => 'Masters', 'ativo' => true],
            ['nome' => 'Cadetes', 'tipo' => 'equipa', 'descricao' => 'Cadetes', 'ativo' => true],
            ['nome' => 'Infantis', 'tipo' => 'equipa', 'descricao' => 'Infantis', 'ativo' => true],
            ['nome' => 'Juvenis', 'tipo' => 'equipa', 'descricao' => 'Juvenis', 'ativo' => true],
            ['nome' => 'Seniores', 'tipo' => 'equipa', 'descricao' => 'Seniores', 'ativo' => true],

            // Departamento
            ['nome' => $generalCenterName, 'tipo' => 'departamento', 'descricao' => 'Geral', 'ativo' => true],
        ];

        foreach ($costCenters as $center) {
            // Generate code if not provided
            $codigo = 'CC-' . strtoupper(Str::slug($center['nome'], ''));
            
            CostCenter::updateOrCreate(
                ['nome' => $center['nome']],
                array_merge($center, ['codigo' => $codigo])
            );
        }
    }
}
