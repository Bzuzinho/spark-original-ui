<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\FinancialEntry;

class CompetitionRegistration extends Model
{
    use HasUuids;

    protected $table = 'competition_registrations';

    protected $fillable = [
        'prova_id',
        'user_id',
        'estado',
        'valor_inscricao',
        'fatura_id',
        'movimento_id',
    ];

    protected $casts = [
        'valor_inscricao' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::created(function (CompetitionRegistration $registration) {
            if ($registration->fatura_id) {
                return;
            }

            $prova = $registration->prova()->with('competition.evento')->first();
            if (!$prova || !$registration->user_id) {
                return;
            }

            $competition = $prova->competition;
            $event = $competition?->evento;

            $valor = $registration->valor_inscricao;
            if ($valor === null) {
                $valor = $event?->taxa_inscricao ?? 0;
            }

            $emissao = Carbon::now();
            $vencimento = self::addBusinessDays($emissao->copy(), 8);

            $invoice = Invoice::create([
                'user_id' => $registration->user_id,
                'data_fatura' => $emissao->toDateString(),
                'mes' => $emissao->format('Y-m'),
                'data_emissao' => $emissao->toDateString(),
                'data_vencimento' => $vencimento->toDateString(),
                'valor_total' => $valor,
                'oculta' => false,
                'estado_pagamento' => 'pendente',
                'centro_custo_id' => $event?->centro_custo_id,
                'tipo' => 'inscricao',
                'origem_tipo' => 'evento',
                'origem_id' => $prova->id,
                'observacoes' => $event?->titulo ? "Inscricao evento: {$event->titulo}" : 'Inscricao em prova',
            ]);

            InvoiceItem::create([
                'fatura_id' => $invoice->id,
                'descricao' => $event?->titulo
                    ? "Inscricao prova - {$event->titulo}"
                    : 'Inscricao prova',
                'valor_unitario' => $valor,
                'quantidade' => 1,
                'imposto_percentual' => 0,
                'total_linha' => $valor,
                'centro_custo_id' => $event?->centro_custo_id,
            ]);

            FinancialEntry::create([
                'data' => $emissao->toDateString(),
                'tipo' => 'receita',
                'categoria' => 'Inscricao',
                'descricao' => $event?->titulo
                    ? "Inscricao prova - {$event->titulo}"
                    : 'Inscricao prova',
                'valor' => $valor,
                'centro_custo_id' => $event?->centro_custo_id,
                'user_id' => $registration->user_id,
                'fatura_id' => $invoice->id,
                'origem_tipo' => 'evento',
                'origem_id' => $prova->id,
                'metodo_pagamento' => 'manual',
            ]);

            $registration->update(['fatura_id' => $invoice->id]);
        });
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

    public function prova(): BelongsTo
    {
        return $this->belongsTo(Prova::class, 'prova_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
