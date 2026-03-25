<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmStoreOrderRequest;
use App\Services\Loja\ConfirmStoreOrderAction;
use Illuminate\Http\RedirectResponse;

class StoreOrderController extends Controller
{
    public function store(ConfirmStoreOrderRequest $request, ConfirmStoreOrderAction $action): RedirectResponse
    {
        $order = $action->execute($request->validated(), $request->user());

        return redirect()
            ->route('loja.pedidos', ['target_user_id' => $order->target_user_id])
            ->with('success', 'Pedido criado com sucesso e fatura gerada no financeiro.');
    }
}
