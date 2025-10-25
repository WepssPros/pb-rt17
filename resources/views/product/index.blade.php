@extends('layouts.admin')
@section('title')
    <title>Produk Shuttlecock - PB RT 17 KASAMBA</title>
@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

    <div class="card">
        <div class="card-datatable table-responsive">
            <table class="datatables-basic table border-top">
                <thead>
                    <tr>
                        <th></th> <!-- Kontrol responsif -->
                        <th></th> <!-- Kotak centang -->
                        <th>ID</th> <!-- ID tersembunyi -->
                        <th>Nama Produk</th> <!-- Nama produk -->
                        <th>SKU</th> <!-- Kode SKU -->
                        <th>Satuan</th> <!-- Unit -->
                        <th>Harga Pokok</th> <!-- Cost Price -->
                        <th>Harga Jual</th> <!-- Sell Price -->
                        <th>Stok</th> <!-- via relasi stock.qty -->
                        <th>Aksi</th> <!-- Actions -->
                    </tr>
                </thead>
            </table>
        </div>
    </div>

    <hr class="my-12" />


</div>

<div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-simple modal-edit-product">
        <div class="modal-content">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-6">
                    <h4 class="mb-2" id="productModalTitle">Tambah / Edit Produk</h4>
                    <p>Formulir ini digunakan untuk menambahkan atau memperbarui data produk.</p>
                </div>
                <form id="productForm" class="row g-3">
                    <input type="hidden" name="product_id" value="">

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="productName">Nama Produk</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bx bx-box"></i></span>
                            <input type="text" id="productName" name="name" class="form-control"
                                placeholder="Nama Produk" required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="productSKU">SKU</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bx bx-barcode"></i></span>
                            <input type="text" id="productSKU" name="sku" class="form-control" placeholder="SKU Produk"
                                required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="productUnit">Satuan</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bx bx-list-ul"></i></span>
                            <input type="text" id="productUnit" name="unit" class="form-control"
                                placeholder="Satuan Produk" required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="productCostPrice">Harga Modal</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="text" id="productCostPrice" name="cost_price" class="form-control"
                                placeholder="0" required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="productSellPrice">Harga Jual</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="text" id="productSellPrice" name="sell_price" class="form-control"
                                placeholder="0" required>
                        </div>
                    </div>

                    <div class="col-12">
                        <label class="form-label" for="productNotes">Catatan</label>
                        <textarea id="productNotes" name="notes" class="form-control"
                            placeholder="Catatan tambahan"></textarea>
                    </div>

                    <div class="col-12 text-center mt-3">
                        <button type="submit" class="btn btn-primary me-3">Simpan</button>
                        <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@endsection


@push('scripts')
@vite('resources/js/product.js')
@endpush