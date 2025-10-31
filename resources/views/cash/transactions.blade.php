@extends('layouts.admin')
@section('title')
<title>Akun Kas Transkasi - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
    <div class="mb-3">
        <a href="{{ route('cash.accounts') }}" class="btn btn-info">
            <i class="bx bx-arrow-back me-1"></i> Kembali
        </a>
    </div>

    <div class="card">

        <div class="card-datatable table-responsive">
            <table class="datatables-basic table border-top">
                <thead>
                    <tr>
                        <th></th> <!-- kontrol responsive -->
                        <th></th> <!-- checkbox -->

                        <th>Tanggal</th>
                        <th>Debit/Kredit</th>
                        <th>Deskripsi</th>
                        <th>Nominal</th>
                        <th>Saldo Setelah</th>
                        <th>Referensi</th>

                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal Tambah Transaksi -->
<div class="modal fade" id="addTransactionModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-simple modal-add-transaction">
        <div class="modal-content">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-4">
                    <h4 class="mb-2">Tambah Transaksi</h4>
                    <p>Form ini digunakan untuk menambahkan transaksi baru untuk akun kas.</p>
                </div>

                <form id="transactionForm" class="row g-3" method="POST"
                    action="{{ route('cash.transactions.store') }}">
                    @csrf
                    <input type="hidden" name="cash_account_id" value="{{ $account->id }}">

                    <div class="col-12 col-md-6">
                        <label class="form-label">Tipe</label>
                        <select class="form-select" name="type" required>
                            <option value="in">Masuk</option>
                            <option value="out">Keluar</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label">Nominal</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="text" id="transactionAmount" class="form-control" required>
                            <input type="hidden" name="amount" id="transactionAmountRaw">
                        </div>
                    </div>

                    <div class="col-12">
                        <label class="form-label">Deskripsi</label>
                        <textarea class="form-control" name="description" rows="2"></textarea>
                    </div>

                    <div class="col-12">
                        <label class="form-label">Referensi (Opsional)</label>
                        <input type="text" class="form-control" name="reference_type" placeholder="Contoh: INV, PUR">
                        <input type="hidden" name="reference_id">
                    </div>

                    <div class="col-12 text-center mt-3">
                        <button type="submit" class="btn btn-primary me-2">Simpan</button>
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
    function formatRupiah(angka) {
    if (!angka) return "";
    let number_string = angka.toString().replace(/[^,\d]/g, "");
    let split = number_string.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) rupiah += (sisa ? "." : "") + ribuan.join(".");
    if (split[1] !== undefined) rupiah += "," + split[1];
    return rupiah;
}

$("#transactionAmount").on("keyup", function () {
    let val = $(this).val().replace(/\./g, "");
    $("#transactionAmountRaw").val(val);
    this.value = formatRupiah(val);
});

// Datatables
$(function () {
    var dt_basic_table = $(".datatables-basic"),
        dt_basic;

    if (dt_basic_table.length) {
        dt_basic = dt_basic_table.DataTable({
            processing: true,
            serverSide: true,
            ajax: "{{ route('cash.transactions', $account->id) }}",
            columns: [
                { data: "" }, // responsive
                { data: "id" }, // checkbox
            
                { data: "created_at", name: "created_at" },
                { data: "type_label", name: "type_label" },
                { data: "description", name: "description" },
                { data: "amount", name: "amount", className: "text-end" },
                { data: "saldo_after", name: "saldo_after", className: "text-end" },
                { data: "reference", name: "reference" },
           
            ],
            columnDefs: [
                {
                    className: "control",
                    orderable: false,
                    searchable: false,
                    responsivePriority: 1,
                    targets: 0,
                    render: () => "",
                },
                {
                    targets: 1,
                    orderable: false,
                    searchable: false,
                    responsivePriority: 2,
                    checkboxes: true,
                    render: () => '<input type="checkbox" class="dt-checkboxes form-check-input">',
                    checkboxes: { selectAllRender: '<input type="checkbox" class="form-check-input">' }
                },
               
                

               
            ],
            order: [[2, "desc"]],
            dom:
                '<"card-header flex-column flex-md-row pb-0"<"head-label text-center"><"dt-action-buttons text-end pt-6 pt-md-0"B>>' +
                '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end mt-n6 mt-md-0"f>>' +
                't<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            displayLength: 100,
            lengthMenu: [10, 25, 50, 100],
            language: {
                paginate: {
                    next: '<i class="bx bx-chevron-right bx-18px"></i>',
                    previous: '<i class="bx bx-chevron-left bx-18px"></i>'
                }
            },
            buttons: [
                {
                    text: '<i class="bx bx-plus bx-sm me-sm-2"></i> <span class="d-none d-sm-inline-block">Tambah Transaksi</span>',
                    className: 'create-new btn btn-primary',
                    action: function() {
                        $('#addTransactionModal').modal('show');
                    }
                }
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function(row) {
                            return 'Detail Transaksi: ' + row.data().description;
                        }
                    }),
                    type: 'column',
                    renderer: function(api, rowIdx, columns) {
                        var data = $.map(columns, function(col, i) {
                            if(col.title !== '') {
                                return '<tr data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">'+
                                       '<td>'+col.title+':</td> <td>'+col.data+'</td></tr>';
                            } else {
                                return '';
                            }
                        }).join('');
                        return data ? $('<table class="table"/><tbody />').append(data) : false;
                    }
                }
            }
        });

        $("div.head-label").html(
        '<h5 class="card-title mb-0" style="font-style: italic;">Daftar Transaksi: {{ $account->name }}</h5>'
        );
    }
});
</script>
@endpush