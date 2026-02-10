<?php

namespace App\Console\Commands;

use App\Models\CompetitionRegistration;
use App\Models\ConvocationAthlete;
use App\Models\ConvocationGroup;
use App\Models\Event;
use App\Models\FinancialEntry;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\Sale;
use App\Models\Sponsor;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class BackfillFinanceiroIntegracoes extends Command
{
    protected $signature = 'financeiro:backfill-integracoes {--dry-run : Simula sem criar registos} {--limit=0 : Limita registos por secao}';
    protected $description = 'Backfill de integracoes financeiras (eventos, stock, patrocinios) para registos existentes';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $this->info('Iniciando backfill de integracoes financeiras...');
        $this->newLine();

        $this->backfillCompetitionRegistrations($dryRun, $limit);
        $this->backfillSales($dryRun, $limit);
        $this->backfillSponsors($dryRun, $limit);
        $this->backfillConvocationGroups($dryRun, $limit);

        $this->newLine();
        $this->info('Backfill concluido.');

        return Command::SUCCESS;
    }

    private function backfillCompetitionRegistrations(bool $dryRun, int $limit): void
    {
        $query = CompetitionRegistration::whereNull('fatura_id')->orderBy('created_at');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $registrations = $query->get();
        $created = 0;
        $skipped = 0;

        foreach ($registrations as $registration) {
            if ($dryRun) {
                $created += 1;
                continue;
            }

            if (!$this->createInvoiceForRegistration($registration)) {
                $skipped += 1;
                continue;
            }

            $created += 1;
        }

        $this->line("Inscricoes em provas: {$created} criadas, {$skipped} ignoradas");
    }

    private function createInvoiceForRegistration(CompetitionRegistration $registration): bool
    {
        $prova = $registration->prova()->with('competition.evento')->first();
        if (!$prova || !$registration->user_id) {
            return false;
        }

        $event = $prova->competition?->evento;
        $valor = $registration->valor_inscricao ?? ($event?->taxa_inscricao ?? 0);

        $emissao = Carbon::now();
        $vencimento = $this->addBusinessDays($emissao->copy(), 8);

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

        if ($valor > 0) {
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
        }

        $registration->update(['fatura_id' => $invoice->id]);

        return true;
    }

    private function backfillSales(bool $dryRun, int $limit): void
    {
        $query = Sale::orderBy('created_at');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $sales = $query->get();
        $created = 0;
        $skipped = 0;

        foreach ($sales as $sale) {
            if (!$sale->cliente_id) {
                $skipped += 1;
                continue;
            }

            $alreadyLinked = Invoice::where('origem_tipo', 'stock')
                ->where('origem_id', $sale->id)
                ->exists();

            if ($alreadyLinked) {
                $skipped += 1;
                continue;
            }

            if ($dryRun) {
                $created += 1;
                continue;
            }

            if (!$this->createInvoiceForSale($sale)) {
                $skipped += 1;
                continue;
            }

            $created += 1;
        }

        $this->line("Vendas de stock: {$created} criadas, {$skipped} ignoradas");
    }

    private function createInvoiceForSale(Sale $sale): bool
    {
        $product = $sale->product()->first();
        $valor = $sale->total ?? ($sale->preco_unitario * $sale->quantidade);
        $emissao = $sale->data ? Carbon::parse($sale->data) : Carbon::now();
        $vencimento = $this->addBusinessDays($emissao->copy(), 8);

        $invoice = Invoice::create([
            'user_id' => $sale->cliente_id,
            'data_fatura' => $emissao->toDateString(),
            'mes' => $emissao->format('Y-m'),
            'data_emissao' => $emissao->toDateString(),
            'data_vencimento' => $vencimento->toDateString(),
            'valor_total' => $valor,
            'oculta' => false,
            'estado_pagamento' => 'pendente',
            'centro_custo_id' => null,
            'tipo' => 'material',
            'origem_tipo' => 'stock',
            'origem_id' => $sale->id,
            'observacoes' => $product?->nome ? "Venda de material: {$product->nome}" : 'Venda de material',
        ]);

        InvoiceItem::create([
            'fatura_id' => $invoice->id,
            'descricao' => $product?->nome ? "Venda de material: {$product->nome}" : 'Venda de material',
            'valor_unitario' => $sale->preco_unitario,
            'quantidade' => $sale->quantidade,
            'imposto_percentual' => 0,
            'total_linha' => $valor,
            'produto_id' => $sale->produto_id,
        ]);

        if ($valor > 0) {
            FinancialEntry::create([
                'data' => $emissao->toDateString(),
                'tipo' => 'receita',
                'categoria' => 'Venda de material',
                'descricao' => $product?->nome ? "Venda de material: {$product->nome}" : 'Venda de material',
                'valor' => $valor,
                'centro_custo_id' => null,
                'user_id' => $sale->cliente_id,
                'fatura_id' => $invoice->id,
                'origem_tipo' => 'stock',
                'origem_id' => $sale->id,
                'metodo_pagamento' => $sale->metodo_pagamento,
            ]);
        }

        return true;
    }

    private function backfillSponsors(bool $dryRun, int $limit): void
    {
        $query = Sponsor::orderBy('created_at');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $sponsors = $query->get();
        $created = 0;
        $skipped = 0;

        foreach ($sponsors as $sponsor) {
            $alreadyLinked = Movement::where('origem_tipo', 'patrocinio')
                ->where('origem_id', $sponsor->id)
                ->exists();

            if ($alreadyLinked) {
                $skipped += 1;
                continue;
            }

            if ($dryRun) {
                $created += 1;
                continue;
            }

            $this->createMovementForSponsor($sponsor);
            $created += 1;
        }

        $this->line("Patrocinios: {$created} criados, {$skipped} ignorados");
    }

    private function createMovementForSponsor(Sponsor $sponsor): void
    {
        $valor = $sponsor->valor_anual ?? 0;
        $emissao = $sponsor->data_inicio ? Carbon::parse($sponsor->data_inicio) : Carbon::now();

        $movement = Movement::create([
            'user_id' => null,
            'nome_manual' => $sponsor->nome,
            'nif_manual' => null,
            'morada_manual' => null,
            'classificacao' => 'receita',
            'data_emissao' => $emissao->toDateString(),
            'data_vencimento' => $emissao->toDateString(),
            'valor_total' => $valor,
            'estado_pagamento' => 'pago',
            'centro_custo_id' => null,
            'tipo' => 'patrocinio',
            'origem_tipo' => 'patrocinio',
            'origem_id' => $sponsor->id,
            'observacoes' => $sponsor->descricao ? "Patrocinio: {$sponsor->descricao}" : 'Patrocinio',
        ]);

        MovementItem::create([
            'movimento_id' => $movement->id,
            'descricao' => "Patrocinio - {$sponsor->nome}",
            'valor_unitario' => $valor,
            'quantidade' => 1,
            'imposto_percentual' => 0,
            'total_linha' => $valor,
        ]);

        if ($valor > 0) {
            FinancialEntry::create([
                'data' => $emissao->toDateString(),
                'tipo' => 'receita',
                'categoria' => 'Patrocinio',
                'descricao' => "Patrocinio - {$sponsor->nome}",
                'valor' => $valor,
                'centro_custo_id' => null,
                'user_id' => null,
                'fatura_id' => null,
                'origem_tipo' => 'patrocinio',
                'origem_id' => $sponsor->id,
                'metodo_pagamento' => 'transferencia',
            ]);
        }
    }

    private function backfillConvocationGroups(bool $dryRun, int $limit): void
    {
        $query = ConvocationGroup::whereNull('movimento_id')->orderBy('created_at');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $groups = $query->get();
        $created = 0;
        $skipped = 0;

        foreach ($groups as $group) {
            if ($dryRun) {
                $created += 1;
                continue;
            }

            if (!$this->createMovementsForConvocationGroup($group)) {
                $skipped += 1;
                continue;
            }

            $created += 1;
        }

        $this->line("Convocatorias: {$created} criadas, {$skipped} ignoradas");
    }

    private function createMovementsForConvocationGroup(ConvocationGroup $group): bool
    {
        $event = Event::find($group->evento_id);
        if (!$event) {
            return false;
        }

        $athletes = $group->atletas_ids ?? [];
        if (!is_array($athletes) || count($athletes) === 0) {
            return false;
        }

        $emissao = $group->data_criacao ? Carbon::parse($group->data_criacao) : Carbon::now();
        $vencimento = $this->addBusinessDays($emissao->copy(), 8);

        $totalAggregate = 0;
        $athleteCount = 0;

        foreach ($athletes as $athleteId) {
            $provaCount = $this->getProvasCount($group->id, $athleteId);
            $valor = $this->calcularCustoConvocatoria($group, $event, $provaCount);
            if ($valor <= 0) {
                continue;
            }

            $movement = Movement::create([
                'user_id' => $athleteId,
                'classificacao' => 'despesa',
                'data_emissao' => $emissao->toDateString(),
                'data_vencimento' => $vencimento->toDateString(),
                'valor_total' => -abs($valor),
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
            return false;
        }

        $aggregateMovement = Movement::create([
            'user_id' => null,
            'nome_manual' => "Convocatoria {$event->titulo}",
            'classificacao' => 'despesa',
            'data_emissao' => $emissao->toDateString(),
            'data_vencimento' => $vencimento->toDateString(),
            'valor_total' => -abs($totalAggregate),
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

        return true;
    }

    private function getProvasCount(string $groupId, string $athleteId): int
    {
        $athlete = ConvocationAthlete::where('convocatoria_grupo_id', $groupId)
            ->where('atleta_id', $athleteId)
            ->first();

        if (!$athlete || !is_array($athlete->provas)) {
            return 0;
        }

        return count($athlete->provas);
    }

    private function calcularCustoConvocatoria(ConvocationGroup $group, Event $event, int $provaCount): float
    {
        $tipo = $group->tipo_custo;

        if ($tipo === 'por_prova') {
            $unit = $group->valor_inscricao_unitaria ?? $event->custo_inscricao_por_prova ?? $event->taxa_inscricao ?? 0;
            $count = $provaCount > 0 ? $provaCount : 1;
            return (float) $unit * $count;
        }

        if ($tipo === 'por_salto') {
            return (float) ($group->valor_por_salto ?? $event->custo_inscricao_por_salto ?? 0);
        }

        if ($tipo === 'por_estafeta') {
            return (float) ($group->valor_por_estafeta ?? $event->custo_inscricao_estafeta ?? 0);
        }

        return (float) ($group->valor_inscricao_unitaria ?? $event->taxa_inscricao ?? 0);
    }

    private function addBusinessDays(Carbon $date, int $days): Carbon
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
}
