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
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
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
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
            'amount' => 'required|numeric|min:0',
        ]);

        $month = $request->input('month');
        $year = $request->input('year');
        $amount = $request->input('amount');

        $activeUsers = User::where('status', 'ativo')->get();

        $count = 0;
        foreach ($activeUsers as $user) {
            // Check if fee already exists
            $exists = MembershipFee::where('user_id', $user->id)
                ->where('month', $month)
                ->where('year', $year)
                ->exists();

            if (!$exists) {
                MembershipFee::create([
                    'user_id' => $user->id,
                    'month' => $month,
                    'year' => $year,
                    'amount' => $amount,
                    'status' => 'pendente',
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
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:dinheiro,transferencia,mbway,multibanco,cartao',
        ]);

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $membershipFee->user_id,
            'description' => "Mensalidade {$membershipFee->month}/{$membershipFee->year}",
            'amount' => $membershipFee->amount,
            'type' => 'receita',
            'date' => $request->input('payment_date'),
            'payment_method' => $request->input('payment_method'),
            'status' => 'paga',
        ]);

        // Update membership fee
        $membershipFee->update([
            'status' => 'paga',
            'payment_date' => $request->input('payment_date'),
            'transaction_id' => $transaction->id,
        ]);

        return redirect()->back()->with('success', 'Mensalidade marcada como paga!');
    }
}
