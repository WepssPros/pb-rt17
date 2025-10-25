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
                        <th>Nomor Invoice</th> <!-- invoice_no -->
                        <th>Tanggal</th> <!-- sale_date -->
                        <th>Customer</th> <!-- customer -->
                        <th>Total</th> <!-- total -->
                        <th>Terbayar</th> <!-- paid -->
                        <th>Jumlah Item</th> <!-- items_count -->
                        <th>Aksi</th> <!-- Actions (edit/delete) -->
                    </tr>
                </thead>
            </table>
        </div>
    </div>

    <hr class="my-12" />


</div>
<div class="modal fade" id="saleModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-simple modal-edit-sale">
        <div class="modal-content">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-6">
                    <h4 class="mb-2" id="saleModalTitle">Tambah Penjualan</h4>
                    <p>Formulir ini digunakan untuk menambahkan transaksi penjualan.</p>
                </div>

                <form id="saleForm" class="row g-3" method="POST" action="{{ route('sales.store') }}">
                    @csrf
                    <input type="hidden" name="sale_id" value="">

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="invoiceNo">No. Invoice</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-receipt'></i></span>
                            <input type="text" id="invoiceNo" name="invoice_no" class="form-control"
                                placeholder="No. Invoice">
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="saleDate">Tanggal Penjualan</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-calendar'></i></span>
                            <input type="date" id="saleDate" name="sale_date" class="form-control"
                                value="{{ date('Y-m-d') }}">
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="customerName">Pelanggan</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-user'></i></span>
                            <input type="text" id="customerName" name="customer" class="form-control"
                                placeholder="Nama Pelanggan">
                        </div>
                    </div>

                    <div class="col-12">
                        <label class="form-label">Daftar Produk</label>
                        <div id="saleItemsWrapper">
                            <!-- Baris produk akan muncul di sini -->
                        </div>
                        <button type="button" class="btn btn-sm btn-success" id="addSaleItem">
                            <i class='bx bx-plus'></i> Tambah Produk
                        </button>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="paidAmount">Dibayar</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="text" id="paidAmount" class="form-control" value="0">
                            <input type="hidden" id="paidAmountRaw" name="paid" value="0">
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="cashAccount">Akun Kas</label>
                        <select id="cashAccount" name="cash_account_id" class="form-select">
                            <option value="">Pilih Akun Kas</option>
                            @foreach($cashAccounts as $account)
                            <option value="{{ $account->id }}">{{ $account->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-12 text-end mt-2">
                        <strong>Total: </strong> Rp <span id="totalSale">0</span>
                    </div>

                    <div class="col-12 text-center mt-3">
                        <button type="submit" class="btn btn-primary me-3">Simpan Penjualan</button>
                        <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>


@endsection


@push('scripts')
<script>
    let rowId = 0;
   $("#addSaleItem").on("click", function () {
    rowId++;
    let newRow = `<div class="card mb-2 p-2 border" data-row="${rowId}">
        <div class="row g-2 align-items-end">
            <div class="col-md-4">
                <label>Produk</label>
                <select class="form-select productSelect" name="items[${rowId}][product_id]" required>
                    <option value="">Pilih Produk</option>
                    @foreach($products as $product)
                        <option value="{{ $product->id }}" data-price="{{ $product->sell_price }}">{{ $product->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label>Qty</label>
                <input type="number" class="form-control qtyInput" name="items[${rowId}][qty]" value="1" min="1" required>
            </div>
            <div class="col-md-2">
                <label>Harga Jual</label>
                <input type="text" class="form-control priceInput" readonly>
                <input type="hidden" class="priceRaw" name="items[${rowId}][sell_price]">
            </div>
            <div class="col-md-2">
                <label>Subtotal</label>
                <input type="text" class="form-control subtotalInput" readonly>
                <input type="hidden" class="subtotalRaw" name="items[${rowId}][line_total]">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger removeRow">Hapus</button>
            </div>
        </div>
    </div>`;
    $("#saleItemsWrapper").append(newRow);
});


</script>

@vite('resources/js/penjualan.js')


@endpush