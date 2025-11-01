<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\CashTransaction;
use App\Models\ProjectTarget;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $kasUtamaId = 1;

        $transactions = CashTransaction::where('cash_account_id', $kasUtamaId)->get();

        $totalSales = $transactions->where('type', 'in')
            ->where('reference_type', Sale::class)
            ->sum('amount');

        $totalPurchase = $transactions->where('type', 'out')
            ->where('reference_type', Purchase::class)
            ->sum('amount');

        $profit = $totalSales - $totalPurchase;

        $totalTransactions = $transactions->where('type', 'in')
            ->where('reference_type', Sale::class)
            ->count();

        // Total sales per bulan tahun ini
        $year = now()->year;
        $salesPerMonth = CashTransaction::where('cash_account_id', $kasUtamaId)
            ->where('type', 'in')
            ->where('reference_type', Sale::class)
            ->whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        // Ambil target proyek bulan ini
        $projectTargets = ProjectTarget::with('cashAccount')
            ->orderBy('target_date', 'asc')
            ->get()
            ->map(function ($p) {
                $saldo = $p->cashAccount?->balance ?? 0;
                $progress = $p->achievement;
                $status = $progress >= 100 ? 'success' : ($progress >= 75 ? 'info' : ($progress >= 50 ? 'warning' : 'danger'));

                return [
                    'name' => $p->name,
                    'progress' => $progress,
                    'status' => $status,
                    'target_amount' => number_format($p->target_amount, 0, ',', '.'),
                    'saldo' => number_format($saldo, 0, ',', '.'),
                    'target_date' => \Carbon\Carbon::parse($p->target_date)->translatedFormat('d F Y'),
                    'status_text' => $progress >= 100
                        ? "<i class='bx bx-trophy text-success'></i> Tercapai"
                        : "<i class='bx bx-time text-warning'></i> Belum Tercapai",

                ];
            });

        return view('dashboard', compact(
            'totalSales',
            'totalPurchase',
            'profit',
            'totalTransactions',
            'salesPerMonth',
            'projectTargets'
        ));
    }
}
