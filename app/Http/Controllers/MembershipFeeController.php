<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMembershipFeeRequest;
use App\Http\Requests\UpdateMembershipFeeRequest;
use App\Models\MembershipFee;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MembershipFeeController extends Controller
{
    public function index()
    {
        $fees = MembershipFee::with(['user', 'transaction'])
            ->orderBy('ano', 'desc')
            ->orderBy('mes', 'desc')
            ->paginate(15);

        return response()->json($fees);
    }

    public function store(StoreMembershipFeeRequest $request): RedirectResponse
    {
        MembershipFee::create($request->validated());

        return redirect()->back()->with('success', 'Mensalidade criada com sucesso!');
    }

    public function update(UpdateMembershipFeeRequest $request, MembershipFee $membershipFee): RedirectResponse
    {
        $membershipFee->update($request->validated());

        return redirect()->back()->with('success', 'Mensalidade atualizada com sucesso!');
    }

    public function destroy(MembershipFee $membershipFee): RedirectResponse
    {
        $membershipFee->delete();

        return redirect()->back()->with('success', 'Mensalidade eliminada com sucesso!');
    }

    /**
     * Generate membership fees for all active users for a specific month/year
     */
    public function generate(Request $request): RedirectResponse
    {
        $request->validate([
            'mes' => 'required|integer|min:1|max:12',
            'ano' => 'required|integer|min:2000|max:2100',
            'valor' => 'required|numeric|min:0',
        ]);

        $mes = $request->input('mes');
        $ano = $request->input('ano');
        $valor = $request->input('valor');

        $activeUsers = User::where('estado', 'ativo')->get();

        $count = 0;
        foreach ($activeUsers as $user) {
            // Check if fee already exists
            $exists = MembershipFee::where('user_id', $user->id)
                ->where('mes', $mes)
                ->where('ano', $ano)
                ->exists();

            if (!$exists) {
                MembershipFee::create([
                    'user_id' => $user->id,
                    'mes' => $mes,
                    'ano' => $ano,
                    'valor' => $valor,
                    'estado' => 'pendente',
                ]);
                $count++;
            }
        }

        return redirect()->back()->with('success', "Geradas $count mensalidades com sucesso!");
    }

    /**
     * Mark membership fee as paid and create a transaction
     */
    public function markAsPaid(Request $request, MembershipFee $membershipFee): RedirectResponse
    {
        $request->validate([
            'data_pagamento' => 'required|date',
            'metodo_pagamento' => 'required|in:dinheiro,transferencia,mbway,multibanco,cartao',
        ]);

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $membershipFee->user_id,
            'descricao' => "Mensalidade {$membershipFee->mes}/{$membershipFee->ano}",
            'valor' => $membershipFee->valor,
            'tipo' => 'receita',
            'data' => $request->input('data_pagamento'),
            'metodo_pagamento' => $request->input('metodo_pagamento'),
            'estado' => 'paga',
        ]);

        // Update membership fee
        $membershipFee->update([
            'estado' => 'paga',
            'data_pagamento' => $request->input('data_pagamento'),
            'transaction_id' => $transaction->id,
        ]);

        return redirect()->back()->with('success', 'Mensalidade marcada como paga!');
    }
}
