<?php

namespace App\Services\Logistica;

use App\Models\LogisticsRequest;
use App\Models\LogisticsRequestItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateLogisticsRequestAction
{
    public function execute(LogisticsRequest $logisticsRequest, array $data): LogisticsRequest
    {
        if (!in_array($logisticsRequest->status, ['draft', 'pending'])) {
            throw ValidationException::withMessages([
                'status' => 'Só é possível editar requisições em estado rascunho ou pendente.',
            ]);
        }

        return DB::transaction(function () use ($logisticsRequest, $data) {
            $items = $data['items'] ?? [];
            $total = 0.0;

            LogisticsRequestItem::query()
                ->where('logistics_request_id', $logisticsRequest->id)
                ->delete();

            foreach ($items as $item) {
                $product = Product::query()->findOrFail($item['article_id']);
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $lineTotal = $quantity * $unitPrice;

                LogisticsRequestItem::create([
                    'logistics_request_id' => $logisticsRequest->id,
                    'article_id' => $product->id,
                    'article_name_snapshot' => $product->nome,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ]);

                $total += $lineTotal;
            }

            $logisticsRequest->update([
                'requester_user_id' => $data['requester_user_id'] ?? null,
                'requester_name_snapshot' => $data['requester_name_snapshot'],
                'requester_area' => $data['requester_area'] ?? null,
                'requester_type' => $data['requester_type'] ?? 'department',
                'notes' => $data['notes'] ?? null,
                'total_amount' => $total,
            ]);

            return $logisticsRequest->fresh(['items']);
        });
    }
}
