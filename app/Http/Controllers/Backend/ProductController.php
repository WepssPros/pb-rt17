<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return view('product.index'); // halaman datatable + modal
    }

    public function data()
    {
        $products = Product::with('stock');

        return datatables()->of($products)
            ->addColumn('checkbox', fn($p) => '<input type="checkbox" class="dt-checkboxes form-check-input" value="' . $p->id . '">')
            ->addColumn('product_name', function ($p) {

                return $p->name;
            })
            ->addColumn('sku', fn($p) => $p->sku)
            ->addColumn('unit', fn($p) => $p->unit)
            ->addColumn('cost_price', fn($p) => number_format($p->cost_price, 0, ',', '.'))
            ->addColumn('sell_price', fn($p) => number_format($p->sell_price, 0, ',', '.'))
            ->addColumn('stock', fn($p) => $p->stock?->quantity ?? 0)
            ->rawColumns(['checkbox', 'product_name'])
            ->make(true);
    }

    // Simpan data baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku',
            'unit' => 'required|string|max:20',
            'unit_content' => 'nullable|integer|min:1',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan',
            'data' => $product
        ]);
    }

    // Update data
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku,' . $product->id,
            'unit' => 'required|string|max:20',
            'unit_content' => 'nullable|integer|min:1',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diupdate',
            'data' => $product
        ]);
    }

    // Delete
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus'
        ]);
    }
}
