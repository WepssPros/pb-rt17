@extends('layouts.admin')

@section('title')
<title>Jurnal Umum - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

    <div class="mb-3">
        <a href="{{ route('dashboard') }}" class="btn btn-info">
            <i class="bx bx-arrow-back me-1"></i> Kembali
        </a>
    </div>

    <div class="card">
        <div class="card-datatable table-responsive">
            <table class="datatables-basic table border-top">
                <thead>
                    <tr>
                        <th></th> <!-- responsive -->
                        <th></th> <!-- checkbox -->
                        <th>Tanggal</th>
                        <th>Referensi</th>
                        <th>Keterangan</th>
                        <th>Total Debit</th>
                        <th>Total Kredit</th>
                        <th>Aksi</th>
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
            ajax: "{{ route('journals.data') }}", // sesuai dengan controller
            columns: [
                { data: "" }, // responsive
                { data: "id" }, // checkbox
                { data: "date", name: "date" },
                { data: "reference", name: "reference" },
                { data: "memo", name: "memo" },
                { data: "debit_total", name: "debit_total", className: "text-end" },
                { data: "credit_total", name: "credit_total", className: "text-end" },
                { data: "action", name: "action", orderable: false, searchable: false, className: "text-center" },
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
               
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function(row) {
                            return 'Detail Jurnal: ' + (row.data().reference ?? '');
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

        // judul di atas tabel
        $("div.head-label").html(
            '<h5 class="card-title mb-0" style="font-style: italic;">Daftar Jurnal Umum</h5>'
        );
    }
});
</script>
@endpush