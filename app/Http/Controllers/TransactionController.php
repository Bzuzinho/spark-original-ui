<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use App\Models\FinancialCategory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['user', 'category'])
            ->orderBy('date', 'desc')
            ->paginate(15);

        return response()->json($transactions);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('receipt')) {
            $data['receipt'] = $request->file('receipt')->store('comprovatives', 'public');
        }

        Transaction::create($data);

        return redirect()->back()->with('success', 'Transação criada com sucesso!');
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('receipt')) {
            // Delete old file if exists
            if ($transaction->receipt) {
                Storage::disk('public')->delete($transaction->receipt);
            }
            $data['receipt'] = $request->file('receipt')->store('comprovatives', 'public');
        }

        $transaction->update($data);

        return redirect()->back()->with('success', 'Transação atualizada com sucesso!');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        // Delete file if exists
        if ($transaction->receipt) {
            Storage::disk('public')->delete($transaction->receipt);
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Transação eliminada com sucesso!');
    }
}
