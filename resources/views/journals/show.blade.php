@extends('layouts.admin')

@section('title')
<title>Detail Jurnal Umum - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

    <div class="mb-3">
        <a href="{{ route('journals.index') }}" class="btn btn-info">
            <i class="bx bx-arrow-back me-1"></i> Kembali
        </a>
    </div>

    <div class="card mb-4">
        <div class="card-body">
            <h5 class="mb-3">Informasi Jurnal</h5>
            <div class="row">
                <div class="col-md-4">
                    <p><strong>Tanggal:</strong>
                        <span class="badge bg-primary">
                            <i class="bx bx-calendar me-1"></i> {{ date('d-m-Y', strtotime($journal->date)) }}
                        </span>
                    </p>
                </div>
                <div class="col-md-4">
                    <p><strong>Referensi:</strong>
                        @if($journal->reference_type)
                        <span class="badge bg-label-secondary text-dark px-2">
                            {{ $journal->reference_type }} #{{ $journal->reference_id }}
                        </span>
                        @else
                        <span class="text-muted">-</span>
                        @endif
                    </p>
                </div>
                <div class="col-md-4">
                    <p><strong>Keterangan:</strong> {{ $journal->memo ?? '-' }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-datatable table-responsive">
            <table class="datatables-basic table border-top w-100">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th>Akun</th>
                        <th>Catatan</th>
                        <th class="text-end">Debit</th>
                        <th class="text-end">Kredit</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    $(function () {
    var dt_basic_table = $(".datatables-basic");

    if (dt_basic_table.length) {
        var dt_basic = dt_basic_table.DataTable({
            processing: true,
            serverSide: true,
            ajax: "{{ route('journals.lines.data', $journal->id) }}",
            columns: [
                { data: "" }, // responsive
                { data: "id" }, // checkbox
                { data: "account", name: "account" },
                { data: "note", name: "note" },
                { data: "debit", name: "debit", className: "text-end" },
                { data: "credit", name: "credit", className: "text-end" },
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
            order: [[2, "asc"]],
           dom:
                '<"card-header flex-column flex-md-row pb-0"<"head-label text-center"><"dt-action-buttons text-end pt-6 pt-md-0"B>>' +
                '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end mt-n6 mt-md-0"f>>' +
                't<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            displayLength: 50,
            lengthMenu: [10, 25, 50, 100],
            language: {
                paginate: {
                    next: '<i class="bx bx-chevron-right bx-18px"></i>',
                    previous: '<i class="bx bx-chevron-left bx-18px"></i>'
                },
                lengthMenu: "Tampilkan _MENU_ baris per halaman",
                zeroRecords: "Tidak ada detail jurnal ditemukan",
                info: "Menampilkan _START_ - _END_ dari _TOTAL_ baris",
            },
             buttons: [
                
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
            '<h5 class="card-title mb-0" style="font-style: italic;">Detail Jurnal #{{ $journal->id }}</h5>'
        );
    }
});
</script>
@endpush