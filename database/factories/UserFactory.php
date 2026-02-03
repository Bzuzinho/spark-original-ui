<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password = null;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sexo = $this->faker->randomElement(['masculino', 'female']);
        $age = $this->faker->numberBetween(10, 50);
        $birthYear = now()->year - $age;
        
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'numero_socio' => $this->faker->unique()->numberBetween(100, 9999),
            'full_name' => fake()->name(),
            'perfil' => $this->faker->randomElement(['user', 'atleta', 'admin']),
            'estado' => 'ativo',
            'birth_date' => $birthYear . '-' . $this->faker->numberBetween(1, 12) . '-' . $this->faker->numberBetween(1, 28),
            'menor' => $age < 18,
            'gender' => $sexo,
            'tipo_membro' => [$this->faker->randomElement(['Atleta', 'Sócio', 'Treinador'])],
            'rgpd' => true,
            'consent' => true,
            'afiliacao' => $this->faker->boolean(70),
            'declaracao_de_transporte' => $age < 18,
            'sports_active' => $this->faker->boolean(60),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is an athlete.
     */
    public function athlete(): static
    {
        return $this->state(fn (array $attributes) => [
            'perfil' => 'atleta',
            'tipo_membro' => ['Atleta'],
            'sports_active' => true,
            'afiliacao' => true,
        ]);
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'perfil' => 'admin',
        ]);
    }
}
