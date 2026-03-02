<?php

namespace Database\Seeders;

use App\Models\MonthlyFee;
use App\Models\AgeGroup;
use Illuminate\Database\Seeder;

class MonthlyFeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get age groups by name
        $ageGroups = AgeGroup::pluck('id', 'nome');

        $monthlyFees = [
            // Master
            ['designacao' => 'Master 3x', 'valor' => 30.00, 'age_group_id' => $ageGroups['Master'] ?? null, 'ativo' => true],
            ['designacao' => 'Master 2x', 'valor' => 25.00, 'age_group_id' => $ageGroups['Master'] ?? null, 'ativo' => true],
            ['designacao' => 'Master >3x', 'valor' => 35.00, 'age_group_id' => $ageGroups['Master'] ?? null, 'ativo' => true],

            // Cadetes
            ['designacao' => 'Cadetes', 'valor' => 30.00, 'age_group_id' => $ageGroups['Cadetes'] ?? null, 'ativo' => true],
            ['designacao' => 'Cadete 2x', 'valor' => 25.00, 'age_group_id' => $ageGroups['Cadetes'] ?? null, 'ativo' => true],

            // Infantis
            ['designacao' => 'Infantil', 'valor' => 35.00, 'age_group_id' => $ageGroups['Infantis'] ?? null, 'ativo' => true],

            // Juvenis - Note: Your data says "Juvenil" and "Juvenis"
            ['designacao' => 'Juvenil', 'valor' => 35.00, 'age_group_id' => $ageGroups['Juvenis'] ?? null, 'ativo' => true],

            // Juniores
            ['designacao' => 'Juniores', 'valor' => 35.00, 'age_group_id' => $ageGroups['Juniores'] ?? null, 'ativo' => true],

            // Senior
            ['designacao' => 'Senior', 'valor' => 35.00, 'age_group_id' => $ageGroups['Senior'] ?? null, 'ativo' => true],
        ];

        foreach ($monthlyFees as $fee) {
            MonthlyFee::updateOrCreate(
                ['designacao' => $fee['designacao']],
                $fee
            );
        }
    }
}
