<?php

namespace App\Services\Logistica;

use App\Models\LogisticsRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteLogisticsRequestAction
{
    public function execute(LogisticsRequest $logisticsRequest): void
    {
        if (!in_array($logisticsRequest->status, ['draft', 'pending'])) {
            throw ValidationException::withMessages([
                'status' => 'Só é possível apagar requisições em estado rascunho ou pendente.',
            ]);
        }

        DB::transaction(function () use ($logisticsRequest) {
            $logisticsRequest->items()->delete();
            $logisticsRequest->delete();
        });
    }
}
