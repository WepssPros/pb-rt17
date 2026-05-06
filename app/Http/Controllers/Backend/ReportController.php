<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\{Stock, StockMovement};
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function stock()
    {
        return view('reports.stock');
    }

    public function stockData(Request $request)
    {
        if ($request->ajax()) {
            $from = $request->from ? \Carbon\Carbon::parse($request->from)->startOfDay() : now()->startOfMonth();
            $to = $request->to ? \Carbon\Carbon::parse($request->to)->endOfDay() : now()->endOfMonth();

            $stocks = Stock::with('product')->orderBy('id', 'asc');

            return datatables()->of($stocks)
                ->addIndexColumn()
                ->addColumn('product', function ($s) {
                    return '<span class="badge bg-secondary">
                            <i class="bx bx-package"></i> ' . e($s->product->name ?? '-') . '
                        </span>';
                })
                ->addColumn('sku', function ($s) {
                    return '<i class="bx bx-barcode me-1"></i> ' . e($s->product->sku ?? '-');
                })
                ->addColumn('saldo_awal', function ($s) use ($from) {
                    $saldo_awal = StockMovement::where('product_id', $s->product_id)
                        ->where('created_at', '<', $from)
                        ->sum('quantity');

                    return '<span class="text-primary"><i class="bx bx-arrow-from-bottom me-1"></i>'
                        . number_format($saldo_awal, 0, ',', '.') . '</span>';
                })
                ->addColumn('masuk', function ($s) use ($from, $to) {
                    $in = StockMovement::where('product_id', $s->product_id)
                        ->whereBetween('created_at', [$from, $to])
                        ->where('quantity', '>', 0)
                        ->sum('quantity');

                    return '<span class="text-success"><i class="bx bx-arrow-down-circle me-1"></i>'
                        . number_format($in, 0, ',', '.') . '</span>';
                })
                ->addColumn('keluar', function ($s) use ($from, $to) {
                    $out = StockMovement::where('product_id', $s->product_id)
                        ->whereBetween('created_at', [$from, $to])
                        ->where('quantity', '<', 0)
                        ->sum('quantity');

                    return '<span class="text-danger"><i class="bx bx-arrow-up-circle me-1"></i>'
                        . number_format(abs($out), 0, ',', '.') . '</span>';
                })
                ->addColumn('saldo_akhir', function ($s) use ($to) {
                    $saldo_akhir = StockMovement::where('product_id', $s->product_id)
                        ->where('created_at', '<=', $to)
                        ->sum('quantity');

                    return '<span class="fw-bold text-warning"><i class="bx bx-calculator me-1"></i>'
                        . number_format($saldo_akhir, 0, ',', '.') . '</span>';
                })
                ->addColumn('unit', function ($s) {
                    return '<i class="bx bx-cube me-1"></i>' . e($s->product->unit ?? '-');
                })
                ->rawColumns(['product', 'sku', 'saldo_awal', 'masuk', 'keluar', 'saldo_akhir', 'unit'])
                ->make(true);
        }
    }
}
