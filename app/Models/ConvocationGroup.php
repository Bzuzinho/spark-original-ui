<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use App\Models\Event;
use App\Models\User;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\ConvocationAthlete;

class ConvocationGroup extends Model
{
    use HasUuids;

    protected $table = 'convocation_groups';

    protected $fillable = [
        'evento_id',
        'data_criacao',
        'criado_por',
        'atletas_ids',
        'hora_encontro',
        'local_encontro',
        'observacoes',
        'tipo_custo',
        'valor_por_salto',
        'valor_por_estafeta',
        'valor_inscricao_unitaria',
        'valor_inscricao_calculado',
        'movimento_id',
    ];

    protected $casts = [
        'atletas_ids' => 'array',
        'data_criacao' => 'datetime',
        'valor_por_salto' => 'decimal:2',
        'valor_por_estafeta' => 'decimal:2',
        'valor_inscricao_unitaria' => 'decimal:2',
        'valor_inscricao_calculado' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::created(function (ConvocationGroup $group) {
            if ($group->movimento_id) {
                return;
            }

            $event = Event::find($group->evento_id);
            if (!$event) {
                return;
            }

            $athletes = $group->atletas_ids ?? [];
            if (!is_array($athletes) || count($athletes) === 0) {
                return;
            }

            $emissao = $group->data_criacao ? Carbon::parse($group->data_criacao) : Carbon::now();
            $vencimento = self::addBusinessDays($emissao->copy(), 8);

            $totalAggregate = 0;
            $athleteCount = 0;

            foreach ($athletes as $athleteId) {
                $user = User::find($athleteId);
                if (!$user) {
                    continue;
                }

                $provaCount = self::getProvasCount($group->id, $athleteId);
                $estafetaCount = self::getEstafetasCount($group->id, $athleteId);
                $valor = self::calcularCusto($group, $event, $provaCount, $estafetaCount);
                if ($valor <= 0) {
                    continue;
                }

                $movement = Movement::create([
                    'user_id' => $athleteId,
                    'classificacao' => 'receita',
                    'data_emissao' => $emissao->toDateString(),
                    'data_vencimento' => $vencimento->toDateString(),
                    'valor_total' => abs($valor),
                    'estado_pagamento' => 'pendente',
                    'centro_custo_id' => $event->centro_custo_id,
                    'tipo' => 'inscricao',
                    'origem_tipo' => 'evento',
                    'origem_id' => $event->id,
                    'observacoes' => "Convocatoria {$event->titulo}",
                ]);

                MovementItem::create([
                    'movimento_id' => $movement->id,
                    'descricao' => "Convocatoria - {$event->titulo}",
                    'valor_unitario' => $valor,
                    'quantidade' => 1,
                    'imposto_percentual' => 0,
                    'total_linha' => $valor,
                    'centro_custo_id' => $event->centro_custo_id,
                ]);

                $totalAggregate += $valor;
                $athleteCount += 1;
            }

            if ($totalAggregate <= 0) {
                return;
            }

            $aggregateMovement = Movement::create([
                'user_id' => null,
                'nome_manual' => "Convocatoria {$event->titulo}",
                'classificacao' => 'receita',
                'data_emissao' => $emissao->toDateString(),
                'data_vencimento' => $vencimento->toDateString(),
                'valor_total' => abs($totalAggregate),
                'estado_pagamento' => 'pendente',
                'centro_custo_id' => $event->centro_custo_id,
                'tipo' => 'inscricao',
                'origem_tipo' => 'evento',
                'origem_id' => $event->id,
                'observacoes' => "Convocatoria agregada ({$athleteCount} atletas)",
            ]);

            MovementItem::create([
                'movimento_id' => $aggregateMovement->id,
                'descricao' => "Convocatoria agregada - {$event->titulo}",
                'valor_unitario' => $totalAggregate,
                'quantidade' => 1,
                'imposto_percentual' => 0,
                'total_linha' => $totalAggregate,
                'centro_custo_id' => $event->centro_custo_id,
            ]);

            $group->update(['movimento_id' => $aggregateMovement->id]);
        });
    }

    private static function getProvasCount(string $groupId, string $athleteId): int
    {
        $athlete = ConvocationAthlete::where('convocatoria_grupo_id', $groupId)
            ->where('atleta_id', $athleteId)
            ->first();

        if (!$athlete || !is_array($athlete->provas)) {
            return 0;
        }

        return count($athlete->provas);
    }

    private static function getEstafetasCount(string $groupId, string $athleteId): int
    {
        $athlete = ConvocationAthlete::where('convocatoria_grupo_id', $groupId)
            ->where('atleta_id', $athleteId)
            ->first();

        if (!$athlete) {
            return 0;
        }

        return (int) ($athlete->estafetas ?? 0);
    }

    private static function calcularCusto(
        ConvocationGroup $group,
        Event $event,
        int $provaCount,
        int $estafetaCount
    ): float
    {
        $base = (float) ($group->valor_inscricao_unitaria ?? $event->taxa_inscricao ?? 0);
        $porProva = (float) ($event->custo_inscricao_por_prova ?? 0);
        $porSalto = (float) ($group->valor_por_salto ?? $event->custo_inscricao_por_salto ?? 0);
        $porEstafeta = (float) ($group->valor_por_estafeta ?? $event->custo_inscricao_estafeta ?? 0);

        return $base + ($porProva * $provaCount) + ($porSalto * $provaCount) + ($porEstafeta * $estafetaCount);
    }

    private static function addBusinessDays(Carbon $date, int $days): Carbon
    {
        $added = 0;
        while ($added < $days) {
            $date->addDay();
            if ($date->isWeekend()) {
                continue;
            }
            $added += 1;
        }

        return $date;
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por');
    }

    public function convocationAthletes(): HasMany
    {
        return $this->hasMany(ConvocationAthlete::class, 'convocatoria_grupo_id');
    }

    public function convocationMovements(): HasMany
    {
        return $this->hasMany(ConvocationMovement::class, 'convocatoria_grupo_id');
    }
}
