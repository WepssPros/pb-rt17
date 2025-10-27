@extends('layouts.admin')
@section('title')
<title>Pembelian Shuttlecock - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

    <div class="card">
        <div class="card-datatable table-responsive">
            <table class="datatables-basic table border-top">
                <thead>
                    <tr>
                        <th></th> <!-- Kontrol responsif -->
                        <th></th> <!-- Kotak centang -->
                        <th>ID</th>
                        <th>Nomor Referensi</th>
                        <th>Tanggal</th>
                        <th>Pemasok</th>
                        <th>Total</th>
                        <th>Dibayar</th>
                        <th>Jumlah Item</th>
                    </tr>
                </thead>
            </table>
        </div>
    </div>

    <hr class="my-12" />

</div>

{{-- Modal Pembelian --}}
<div class="modal fade" id="purchaseModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-simple modal-edit-purchase">
        <div class="modal-content">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-6">
                    <h4 class="mb-2" id="purchaseModalTitle">Tambah Pembelian</h4>
                    <p>Formulir ini digunakan untuk menambahkan transaksi pembelian.</p>
                </div>

                <form id="purchaseForm" class="row g-3" method="POST" action="{{ route('purchases.store') }}">
                    @csrf
                    <input type="hidden" name="purchase_id">

                    <!-- Nomor Referensi -->
                    <div class="col-12 col-md-6">
                        <label class="form-label" for="referenceNo">No. Referensi</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-receipt'></i></span>
                            <input type="text" id="referenceNo" name="reference_no" class="form-control" readonly>
                        </div>
                    </div>

                    <!-- Tanggal -->
                    <div class="col-12 col-md-6">
                        <label class="form-label" for="purchaseDate">Tanggal Pembelian</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-calendar'></i></span>
                            <input type="date" id="purchaseDate" name="purchase_date" class="form-control"
                                value="{{ date('Y-m-d') }}">
                        </div>
                    </div>

                    <!-- Supplier -->
                    <div class="col-12 col-md-6">
                        <label class="form-label" for="supplierName">Pemasok</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-user'></i></span>
                            <input type="text" id="supplierName" name="supplier" class="form-control"
                                placeholder="Nama Pemasok">
                        </div>
                    </div>

                    <!-- Item Barang -->
                    <div class="col-12">
                        <label class="form-label">Daftar Barang</label>
                        <div id="purchaseItemsWrapper"></div>
                        <button type="button" class="btn btn-sm btn-success mt-2" id="addPurchaseItem">
                            <i class='bx bx-plus'></i> Tambah Barang
                        </button>
                    </div>

                    <!-- Dibayar -->
                    <div class="col-12 col-md-6">
                        <label class="form-label" for="paidAmount">Dibayar</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="text" id="paidAmount" class="form-control" value="0">
                            <input type="hidden" id="paidAmountRaw" name="paid" value="0">
                        </div>
                    </div>

                    <!-- Akun Kas -->
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
                        <strong>Total: </strong> Rp <span id="totalPurchase">0</span>
                    </div>

                    <div class="col-12 text-center mt-3">
                        <button type="submit" class="btn btn-primary me-3">Simpan Pembelian</button>
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
    document.addEventListener("DOMContentLoaded", function () {
    const referenceInput = document.getElementById("referenceNo");
    if (referenceInput) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const ref = `REF-${pad(now.getDate())}${pad(now.getMonth()+1)}${now.getFullYear()}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        referenceInput.value = ref;
    }

    let rowId = 0;
    const wrapper = $("#purchaseItemsWrapper");

    $("#addPurchaseItem").on("click", function () {
        rowId++;
        const newRow = `
            <div class="card mb-2 p-2 border" data-row="${rowId}">
                <div class="row g-2 align-items-end">
                    <div class="col-md-4">
                        <label>Produk</label>
                        <select class="form-select productSelect" name="items[${rowId}][product_id]" required>
                            <option value="">Pilih Produk</option>
                            @foreach($products as $product)
                                <option value="{{ $product->id }}" data-price="{{ $product->cost_price }}" data-unit="{{ $product->unit }}">
                                    {{ $product->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label>Qty</label>
                        <input type="number" class="form-control qtyInput" name="items[${rowId}][qty]" value="1" min="1" required>
                    </div>
                    <div class="col-md-2">
                        <label>Harga Beli</label>
                        <input type="text" class="form-control priceInput" readonly>
                        <input type="hidden" class="priceRaw" name="items[${rowId}][cost_per_unit]">
                    </div>
                    <div class="col-md-2">
                        <label>Subtotal</label>
                        <input type="text" class="form-control subtotalInput" readonly>
                        <input type="hidden" class="subtotalRaw" name="items[${rowId}][line_total]">
                    </div>
                    <div class="col-md-2 text-center">
                        <a class="btn btn-icon text-danger removeRow"><i class="bx bx-trash bx-md"></i></a>
                    </div>
                </div>
            </div>
        `;
        wrapper.append(newRow);
    });

    // Update harga & subtotal otomatis
    wrapper.on("change", ".productSelect", function () {
        const row = $(this).closest(".card");
        const price = parseFloat($(this).find(":selected").data("price")) || 0;
        row.find(".priceInput").val(formatRupiah(price));
        row.find(".priceRaw").val(price);
        updateRowSubtotal(row);
    });

    wrapper.on("input", ".qtyInput", function () {
        const row = $(this).closest(".card");
        updateRowSubtotal(row);
    });

    wrapper.on("click", ".removeRow", function () {
        $(this).closest(".card").remove();
        updateTotal();
    });

    function updateRowSubtotal(row) {
        const qty = parseFloat(row.find(".qtyInput").val()) || 0;
        const price = parseFloat(row.find(".priceRaw").val()) || 0;
        const subtotal = qty * price;
        row.find(".subtotalInput").val(formatRupiah(subtotal));
        row.find(".subtotalRaw").val(subtotal);
        updateTotal();
    }

    function updateTotal() {
        let total = 0;
        $(".subtotalRaw").each(function () {
            total += parseFloat($(this).val()) || 0;
        });
        $("#totalPurchase").text(formatRupiah(total));
    }

    function formatRupiah(value) {
        return value.toLocaleString("id-ID");
    }
});
</script>


@vite('resources/js/pembelian.js')
@endpush