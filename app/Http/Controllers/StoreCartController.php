<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartRequest;
use App\Models\StoreCartItem;
use App\Services\Loja\AddToStoreCartAction;
use App\Services\Loja\RemoveStoreCartItemAction;
use App\Services\Loja\UpdateStoreCartItemAction;
use Illuminate\Http\RedirectResponse;

class StoreCartController extends Controller
{
    public function store(AddToCartRequest $request, AddToStoreCartAction $action): RedirectResponse
    {
        $action->execute($request->validated(), $request->user());

        return redirect()
            ->route('loja.carrinho', ['target_user_id' => $request->validated('target_user_id')])
            ->with('success', 'Artigo adicionado ao carrinho.');
    }

    public function update(UpdateCartRequest $request, StoreCartItem $storeCartItem, UpdateStoreCartItemAction $action): RedirectResponse
    {
        $action->execute($storeCartItem, $request->validated(), $request->user());

        return redirect()
            ->route('loja.carrinho', ['target_user_id' => $storeCartItem->target_user_id])
            ->with('success', 'Carrinho atualizado com sucesso.');
    }

    public function destroy(StoreCartItem $storeCartItem, RemoveStoreCartItemAction $action): RedirectResponse
    {
        $targetUserId = $storeCartItem->target_user_id;
        $action->execute($storeCartItem, request()->user());

        return redirect()
            ->route('loja.carrinho', ['target_user_id' => $targetUserId])
            ->with('success', 'Artigo removido do carrinho.');
    }
}
