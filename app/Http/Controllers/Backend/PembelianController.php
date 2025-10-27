<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\CashAccount;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Purchase;
use Carbon\Carbon;

class PembelianController extends Controller
{
    public function index()
    {
        $products = Product::all(); // ambil semua produk
        $cashAccounts = CashAccount::all(); // ambil semua akun kas

        return view('pembelian.index', compact('products', 'cashAccounts'));
    }




    public function data()
    {
        $purchases = Purchase::with('items');

        return datatables()->of($purchases)
            ->addColumn('checkbox', fn($p) => '<input type="checkbox" class="dt-checkboxes form-check-input" value="' . $p->id . '">')

            ->addColumn('reference_no', fn($p) => '<span class="badge bg-primary">' . e($p->reference_no) . '</span>')

            ->addColumn('purchase_date', function ($p) {
                return Carbon::parse($p->purchase_date)->format('d-m-Y');
            })

            ->addColumn('supplier', fn($p) => e($p->supplier))

            ->addColumn('total', fn($p) => '<span class="badge bg-primary">Rp ' . number_format($p->total, 0, ',', '.') . '</span>')

            ->addColumn('paid', fn($p) => '<span class="badge bg-success">Rp ' . number_format($p->paid, 0, ',', '.') . '</span>')

            ->addColumn('note', fn($p) => e($p->note ?? '-'))

            ->addColumn('items_count', function ($p) {
                $lines = [];

                foreach ($p->items as $item) {
                    // Pilih ikon sesuai unit (sama logika kayak Sales)
                    if ($item->unit === 'pcs') {
                        $icon = "<img src='../../be_view/assets/img/shuttlecock.png' alt='pcs' style='width:16px;height:16px'>";
                    } elseif ($item->unit === 'tube') {
                        $icon = "<i class='bx bx-cube'></i>";
                    } else {
                        $icon = "<img src='/icons/box.png' alt='box' style='width:16px;height:16px'>";
                    }

                    $lines[] = " Qty: " . $item->qty . " $icon";
                }

                return '<span class="badge bg-info">' . implode(', ', $lines) . '</span>';
            })

            ->rawColumns(['checkbox', 'reference_no', 'total', 'paid', 'items_count'])
            ->make(true);
    }
}
