<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\CashAccount;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Sale;
use Carbon\Carbon;

class PenjualanController extends Controller
{
    public function index()
    {
        $products = Product::all(); // ambil semua produk
        $cashAccounts = CashAccount::all(); // ambil semua akun kas

        return view('penjualan.index', compact('products', 'cashAccounts'));
    }

    public function data()
    {
        $sales = Sale::with('items');

        return datatables()->of($sales)
            ->addColumn('checkbox', fn($s) => '<input type="checkbox" class="dt-checkboxes form-check-input" value="' . $s->id . '">')
            ->addColumn('invoice_no', fn($s) => '<span class="badge bg-primary">' . $s->invoice_no . '</span>')
            ->addColumn('sale_date', function ($sale) {
                return Carbon::parse($sale->sale_date)->format('d-m-Y');
            })
            ->addColumn('customer', fn($s) => $s->customer)
            ->addColumn('total', fn($s) => '<span class="badge bg-primary">Rp ' . number_format($s->total, 0, ',', '.') . '</span>')
            ->addColumn('paid', fn($s) => '<span class="badge bg-success">Rp ' . number_format($s->paid, 0, ',', '.') . '</span>')
            ->addColumn('note', fn($s) => $s->note)
            ->addColumn('items_count', function ($s) {
                $lines = [];

                foreach ($s->items as $item) {
                    // Pilih ikon PNG sesuai unit
                    if ($item->unit === 'pcs') {
                        $icon = "<img src='../../be_view/assets/img/shuttlecock.png' alt='pcs' style='width:16px;height:16px color:white'>";
                    } elseif ($item->unit === 'tube') {
                        $icon = "<i class='bx bx-cube'></i>"; // ikon Boxicons untuk tube
                    } else {
                        $icon = "<img src='/icons/box.png' alt='box' style='width:16px;height:16px'>";
                    }

                    $lines[] = " Qty: " . $item->qty . " $icon";
                }

                return '<span class="badge bg-primary">' . implode(', ', $lines) . '</span>';
            })


            ->rawColumns(['checkbox', 'invoice_no', 'total', 'paid', 'items_count']) // jangan lupa rawColumns untuk HTML
            ->make(true);
    }
}
