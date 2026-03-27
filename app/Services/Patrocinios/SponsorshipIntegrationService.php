<?php

namespace App\Services\Patrocinios;

use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\Sponsorship;
use App\Models\SponsorshipGoodsItem;
use App\Models\SponsorshipIntegration;
use App\Models\SponsorshipMoneyItem;
use App\Models\User;
use App\Services\Logistica\RegisterStockMovementAction;
use Illuminate\Support\Facades\Log;
use Throwable;

class SponsorshipIntegrationService
{
    public function __construct(
        private RegisterStockMovementAction $registerStockMovementAction
    ) {
    }

    public function syncForSponsorship(Sponsorship $sponsorship, ?User $actor = null): array
    {
        $summary = [
            'generated' => 0,
            'failed' => 0,
            'skipped' => 0,
        ];

        $sponsorship->loadMissing(['moneyItems', 'goodsItems']);

        foreach ($sponsorship->moneyItems as $item) {
            $result = $this->syncMoneyItem($sponsorship, $item);
            $summary[$result] += 1;
        }

        foreach ($sponsorship->goodsItems as $item) {
            $result = $this->syncGoodsItem($sponsorship, $item, $actor);
            $summary[$result] += 1;
        }

        return $summary;
    }

    public function getConsolidatedStatus(Sponsorship $sponsorship): string
    {
        $statuses = collect($sponsorship->moneyItems)
            ->pluck('integration_status')
            ->merge(collect($sponsorship->goodsItems)->pluck('integration_status'))
            ->filter()
            ->values();

        if ($statuses->contains('failed')) {
            return 'failed';
        }

        if ($statuses->contains('pending') || $statuses->isEmpty()) {
            return 'pending';
        }

        return 'generated';
    }

    private function syncMoneyItem(Sponsorship $sponsorship, SponsorshipMoneyItem $item): string
    {
        if ($item->financial_movement_id && $item->integration_status === 'generated') {
            return 'skipped';
        }

        $existingIntegration = SponsorshipIntegration::query()
            ->where('sponsorship_id', $sponsorship->id)
            ->where('integration_type', 'financial')
            ->where('source_type', 'money_item')
            ->where('source_id', $item->id)
            ->where('status', 'generated')
            ->latest('executed_at')
            ->first();

        if ($existingIntegration?->target_record_id && !$item->financial_movement_id) {
            $item->update([
                'financial_movement_id' => $existingIntegration->target_record_id,
                'integration_status' => 'generated',
                'integration_message' => 'Movimento financeiro reconciliado a partir do histórico.',
            ]);

            return 'skipped';
        }

        $integration = SponsorshipIntegration::create([
            'sponsorship_id' => $sponsorship->id,
            'integration_type' => 'financial',
            'source_type' => 'money_item',
            'source_id' => $item->id,
            'target_module' => 'financeiro',
            'target_table' => 'movements',
            'status' => 'pending',
        ]);

        try {
            $movementDate = $item->expected_date?->toDateString() ?? $sponsorship->start_date?->toDateString() ?? now()->toDateString();

            $movement = Movement::create([
                'user_id' => null,
                'nome_manual' => $sponsorship->sponsor_name,
                'classificacao' => 'receita',
                'data_emissao' => $movementDate,
                'data_vencimento' => $movementDate,
                'valor_total' => $item->amount,
                'estado_pagamento' => 'pendente',
                'centro_custo_id' => $sponsorship->cost_center_id,
                'tipo' => 'patrocinio',
                'origem_tipo' => 'patrocinio',
                'origem_id' => $sponsorship->id,
                'observacoes' => $sponsorship->codigo.' - '.$item->description,
            ]);

            MovementItem::create([
                'movimento_id' => $movement->id,
                'descricao' => $item->description,
                'quantidade' => 1,
                'valor_unitario' => $item->amount,
                'imposto_percentual' => 0,
                'total_linha' => $item->amount,
                'centro_custo_id' => $sponsorship->cost_center_id,
            ]);

            $item->update([
                'financial_movement_id' => $movement->id,
                'integration_status' => 'generated',
                'integration_message' => 'Movimento financeiro criado com sucesso.',
            ]);

            $integration->update([
                'target_record_id' => $movement->id,
                'status' => 'generated',
                'message' => 'Movimento financeiro criado automaticamente.',
                'executed_at' => now(),
            ]);

            return 'generated';
        } catch (Throwable $exception) {
            Log::error('Falha ao integrar item monetário de patrocínio.', [
                'sponsorship_id' => $sponsorship->id,
                'money_item_id' => $item->id,
                'message' => $exception->getMessage(),
            ]);

            $message = $exception->getMessage();

            $item->update([
                'integration_status' => 'failed',
                'integration_message' => $message,
            ]);

            $integration->update([
                'status' => 'failed',
                'message' => $message,
                'executed_at' => now(),
            ]);

            return 'failed';
        }
    }

    private function syncGoodsItem(Sponsorship $sponsorship, SponsorshipGoodsItem $item, ?User $actor = null): string
    {
        if ($item->stock_entry_id && $item->integration_status === 'generated') {
            return 'skipped';
        }

        $existingIntegration = SponsorshipIntegration::query()
            ->where('sponsorship_id', $sponsorship->id)
            ->where('integration_type', 'stock')
            ->where('source_type', 'goods_item')
            ->where('source_id', $item->id)
            ->where('status', 'generated')
            ->latest('executed_at')
            ->first();

        if ($existingIntegration?->target_record_id && !$item->stock_entry_id) {
            $item->update([
                'stock_entry_id' => $existingIntegration->target_record_id,
                'integration_status' => 'generated',
                'integration_message' => 'Entrada de stock reconciliada a partir do histórico.',
            ]);

            return 'skipped';
        }

        $integration = SponsorshipIntegration::create([
            'sponsorship_id' => $sponsorship->id,
            'integration_type' => 'stock',
            'source_type' => 'goods_item',
            'source_id' => $item->id,
            'target_module' => 'logistica',
            'target_table' => 'stock_movements',
            'status' => 'pending',
        ]);

        try {
            if (!$item->item_id) {
                throw new \RuntimeException('O artigo tem de estar associado a um registo existente de inventário para gerar entrada de stock.');
            }

            if ((float) $item->quantity !== (float) (int) $item->quantity) {
                throw new \RuntimeException('A quantidade para integração em stock tem de ser inteira no modelo atual de logística.');
            }

            $stockMovement = $this->registerStockMovementAction->execute([
                'article_id' => $item->item_id,
                'movement_type' => 'entry',
                'quantity' => (int) $item->quantity,
                'reference_type' => 'sponsorship_goods_item',
                'reference_id' => $item->id,
                'unit_cost' => $item->unit_value,
                'notes' => 'Entrada de stock gerada automaticamente por patrocínio '.$sponsorship->codigo,
            ], $actor);

            $item->update([
                'stock_entry_id' => $stockMovement->id,
                'integration_status' => 'generated',
                'integration_message' => 'Entrada de stock criada com sucesso.',
            ]);

            $integration->update([
                'target_record_id' => $stockMovement->id,
                'status' => 'generated',
                'message' => 'Entrada de stock criada automaticamente.',
                'executed_at' => now(),
            ]);

            return 'generated';
        } catch (Throwable $exception) {
            Log::error('Falha ao integrar item em géneros de patrocínio.', [
                'sponsorship_id' => $sponsorship->id,
                'goods_item_id' => $item->id,
                'message' => $exception->getMessage(),
            ]);

            $message = $exception->getMessage();

            $item->update([
                'integration_status' => 'failed',
                'integration_message' => $message,
            ]);

            $integration->update([
                'status' => 'failed',
                'message' => $message,
                'executed_at' => now(),
            ]);

            return 'failed';
        }
    }
}