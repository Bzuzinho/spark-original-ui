<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\MembershipFee;
use Carbon\Carbon;

class FinancialReportController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // Saldo atual
        $receitas = Transaction::where('tipo', 'receita')
            ->where('estado', 'paga')
            ->sum('valor');
        
        $despesas = Transaction::where('tipo', 'despesa')
            ->where('estado', 'paga')
            ->sum('valor');
        
        $saldoAtual = $receitas - $despesas;

        // Receitas do mês
        $receitasMes = Transaction::where('tipo', 'receita')
            ->where('estado', 'paga')
            ->whereMonth('data', $currentMonth)
            ->whereYear('data', $currentYear)
            ->sum('valor');

        // Despesas do mês
        $despesasMes = Transaction::where('tipo', 'despesa')
            ->where('estado', 'paga')
            ->whereMonth('data', $currentMonth)
            ->whereYear('data', $currentYear)
            ->sum('valor');

        // Mensalidades atrasadas
        $mensalidadesAtrasadas = MembershipFee::where('estado', 'atrasada')
            ->orWhere(function($query) use ($now) {
                $query->where('estado', 'pendente')
                    ->where(function($q) use ($now) {
                        $q->where('ano', '<', $now->year)
                            ->orWhere(function($q2) use ($now) {
                                $q2->where('ano', '=', $now->year)
                                    ->where('mes', '<', $now->month);
                            });
                    });
            })
            ->count();

        // Evolução mensal (últimos 6 meses)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;

            $monthlyReceitas = Transaction::where('tipo', 'receita')
                ->where('estado', 'paga')
                ->whereMonth('data', $month)
                ->whereYear('data', $year)
                ->sum('valor');

            $monthlyDespesas = Transaction::where('tipo', 'despesa')
                ->where('estado', 'paga')
                ->whereMonth('data', $month)
                ->whereYear('data', $year)
                ->sum('valor');

            $monthlyData[] = [
                'mes' => $date->format('M'),
                'receitas' => (float) $monthlyReceitas,
                'despesas' => (float) $monthlyDespesas,
            ];
        }

        return response()->json([
            'saldoAtual' => (float) $saldoAtual,
            'receitasMes' => (float) $receitasMes,
            'despesasMes' => (float) $despesasMes,
            'mensalidadesAtrasadas' => $mensalidadesAtrasadas,
            'monthlyData' => $monthlyData,
            'totalReceitas' => (float) $receitas,
            'totalDespesas' => (float) $despesas,
        ]);
    }
}
