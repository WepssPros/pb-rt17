<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    protected $service;
    public function __construct(TransactionService $service)
    {
        $this->service = $service;
    }

    public function createSale(Request $request)
    {
        $data = $request->validate([
            'invoice_no' => 'nullable|string',
            'sale_date' => 'nullable|date',
            'customer' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string',
            'items.*.sell_price' => 'nullable|numeric',
            'paid' => 'nullable|numeric',
            'cash_account_id' => 'required|integer',
        ]);

        $sale = $this->service->createSale($data);

        return redirect()->back()->with('success', 'Transaksi penjualan berhasil disimpan!');
    }

    public function createPurchase(Request $request)
    {
        $data = $request->validate([
            'reference_no' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'supplier' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string',
            'items.*.cost_per_unit' => 'required|numeric',
            'paid' => 'nullable|numeric',
            'cash_account_id' => 'nullable|integer',
        ]);

        $purchase = $this->service->createPurchase($data);

        return redirect()->back()->with('success', 'Transaksi pembelian berhasil disimpan!');
    }
}
