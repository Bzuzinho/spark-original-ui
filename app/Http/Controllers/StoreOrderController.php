<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmStoreOrderRequest;
use App\Http\Requests\UpdatePendingStoreOrderRequest;
use App\Models\StoreOrder;
use App\Services\Loja\ConfirmStoreOrderAction;
use App\Services\Loja\DeletePendingStoreOrderAction;
use App\Services\Loja\UpdatePendingStoreOrderAction;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class StoreOrderController extends Controller
{
    public function store(ConfirmStoreOrderRequest $request, ConfirmStoreOrderAction $action): RedirectResponse
    {
        $order = $action->execute($request->validated(), $request->user());

        return redirect()
            ->route('loja.pedidos', ['target_user_id' => $order->target_user_id])
            ->with('success', 'Pedido criado com sucesso e fatura gerada no financeiro.');
    }

    public function update(UpdatePendingStoreOrderRequest $request, StoreOrder $storeOrder, UpdatePendingStoreOrderAction $action): RedirectResponse
    {
        abort_unless($request->user()?->perfil === 'admin', HttpResponse::HTTP_FORBIDDEN);

        $order = $action->execute($storeOrder, $request->validated(), $request->user());

        return redirect()
            ->route('loja.pedidos', ['target_user_id' => $order->target_user_id])
            ->with('success', 'Pedido pendente atualizado com sucesso.');
    }

    public function destroy(StoreOrder $storeOrder, DeletePendingStoreOrderAction $action): RedirectResponse
    {
        abort_unless(request()->user()?->perfil === 'admin', HttpResponse::HTTP_FORBIDDEN);

        $targetUserId = $storeOrder->target_user_id;
        $action->execute($storeOrder, request()->user());

        return redirect()
            ->route('loja.pedidos', ['target_user_id' => $targetUserId])
            ->with('success', 'Pedido pendente removido com sucesso.');
    }
}
