$(function () {
    var dt_basic_table = $(".datatables-basic"),
        dt_basic;

    if (dt_basic_table.length) {
        dt_basic = dt_basic_table.DataTable({
            processing: true,
            serverSide: true,
            ajax: "/reports/stock/data", // sesuaikan route di web.php
            columns: [
                { data: "" }, // responsive control
                { data: "id" }, // hidden id
                { data: "id" },

                { data: "product", name: "product" }, // nama produk dengan icon
                { data: "sku", name: "sku" }, // kode/sku
                { data: "saldo_awal", name: "saldo_awal" },
                { data: "masuk", name: "masuk" },
                { data: "keluar", name: "keluar" },
                { data: "saldo_akhir", name: "saldo_akhir" },
                { data: "unit", name: "unit" }, // satuan
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
                    visible: false,
                    searchable: false,
                },
                {
                    targets: 2,
                    visible: false,
                },
            ],
            order: [[3, "asc"]],
            dom:
                '<"card-header flex-column flex-md-row pb-0"<"head-label text-center"><"dt-action-buttons text-end pt-6 pt-md-0"B>>' +
                '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end mt-n6 mt-md-0"f>>' +
                't<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            displayLength: 25,
            lengthMenu: [10, 25, 50, 100],
            language: {
                paginate: {
                    next: '<i class="bx bx-chevron-right bx-18px"></i>',
                    previous: '<i class="bx bx-chevron-left bx-18px"></i>',
                },
            },
            buttons: [
                {
                    text: '<i class="bx bx-receipt bx-sm me-sm-2"></i> <span class="d-none d-sm-inline-block">Export Stock</span>',
                    className: "btn btn-primary",
                    action: function () {
                        alert("Export/Print stock belum diimplementasikan");
                    },
                },
            ],
            buttons: [],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            return "Detail Stock: " + row.data().description;
                        },
                    }),
                    type: "column",
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            if (col.title !== "") {
                                return (
                                    '<tr data-dt-row="' +
                                    col.rowIndex +
                                    '" data-dt-column="' +
                                    col.columnIndex +
                                    '">' +
                                    "<td>" +
                                    col.title +
                                    ":</td> <td>" +
                                    col.data +
                                    "</td></tr>"
                                );
                            } else {
                                return "";
                            }
                        }).join("");
                        return data
                            ? $('<table class="table"/><tbody />').append(data)
                            : false;
                    },
                },
            },
        });

        $("div.head-label").html(
            '<h5 class="card-title mb-0"><i class="bx bx-archive me-1"></i> Rekap Stok</h5>'
        );
    }
});
