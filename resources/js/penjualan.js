import Swal from "sweetalert2";
import "bootstrap/dist/js/bootstrap.bundle";

$(function () {
    var dt_basic_table = $(".datatables-basic"),
        dt_basic;

    // --- DataTable Penjualan ---
    if (dt_basic_table.length) {
        dt_basic = dt_basic_table.DataTable({
            ajax: "/penjualan/data",
            columns: [
                { data: "" },
                { data: "id" },
                { data: "id" },
                { data: "invoice_no" },
                { data: "sale_date" },
                { data: "customer" },
                { data: "total" },
                { data: "paid" },
                { data: "items_count" },
                { data: "" },
            ],
            columnDefs: [
                {
                    className: "control",
                    orderable: false,
                    searchable: false,
                    responsivePriority: 2,
                    targets: 0,
                    render: () => "",
                },
                {
                    targets: 1,
                    orderable: false,
                    searchable: false,
                    responsivePriority: 3,
                    checkboxes: true,
                    render: () =>
                        '<input type="checkbox" class="dt-checkboxes form-check-input">',
                    checkboxes: {
                        selectAllRender:
                            '<input type="checkbox" class="form-check-input">',
                    },
                },
                { targets: 2, searchable: false, visible: false },
                { targets: 3, render: (data) => data },
                {
                    targets: -1,
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => `
                        <a href="javascript:;" class="btn btn-icon item-delete text-danger" data-id="${row.id}">
                            <i class="bx bx-trash bx-md"></i>
                        </a>`,
                },
            ],
            order: [[2, "desc"]],
            dom:
                '<"card-header flex-column flex-md-row pb-0"<"head-label text-center"><"dt-action-buttons text-end pt-6 pt-md-0"B>>' +
                '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end mt-n6 mt-md-0"f>>' +
                't<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            displayLength: 7,
            lengthMenu: [7, 10, 25, 50, 75, 100],
            language: {
                paginate: {
                    next: '<i class="bx bx-chevron-right bx-18px"></i>',
                    previous: '<i class="bx bx-chevron-left bx-18px"></i>',
                },
            },
            buttons: [
                {
                    text: '<i class="bx bx-plus bx-sm me-sm-2"></i> <span class="d-none d-sm-inline-block">Tambah Penjualan</span>',
                    className: "create-new-sale btn btn-primary",
                },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: (row) =>
                            "Detail Penjualan #" + row.data().invoice_no,
                    }),
                    type: "column",
                    renderer: (api, rowIdx, columns) => {
                        let data = $.map(columns, (col) =>
                            col.title !== ""
                                ? `<tr data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}"><td>${col.title}:</td><td>${col.data}</td></tr>`
                                : ""
                        ).join("");
                        return data
                            ? $('<table class="table"/><tbody />').append(data)
                            : false;
                    },
                },
            },
        });

        $("div.head-label").html(
            '<h5 class="card-title mb-0">Daftar Penjualan</h5>'
        );
    }

    // --- Setup CSRF ---
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    // --- Modal Tambah Penjualan ---
    $(document).on("click", ".create-new-sale", function () {
        $("#saleForm")[0].reset();
        $("#saleItemsWrapper").html(""); // sesuaikan dengan modal input baru
        $("#saleModalTitle").text("Tambah Penjualan Baru");
        $('#saleModal input[name="sale_id"]').val("");
        $("#saleModal").modal("show");
    });

    // --- Dinamis Tambah Produk ---

    // --- Pilih produk → otomatis harga & subtotal ---
    $(document).on("change", ".productSelect", function () {
        let selected = $(this).find("option:selected");
        let price = parseInt(selected.data("price")) || 0;
        let $row = $(this).closest("[data-row]");

        $row.find(".priceInput").val(formatRupiah(price.toString()));

        let qty = parseInt($row.find(".qtyInput").val()) || 1;
        $row.find(".subtotalInput").val(formatRupiah((qty * price).toString()));

        updateTotal();
    });

    // --- Ubah qty → update subtotal ---
    $(document).on("input", ".qtyInput", function () {
        let $row = $(this).closest("[data-row]");
        let qty = parseInt($(this).val()) || 1;
        let price =
            parseInt($row.find(".priceInput").val().replace(/\./g, "")) || 0;
        $row.find(".subtotalInput").val(formatRupiah((qty * price).toString()));
        updateTotal();
    });

    // --- Hapus baris produk ---
    $(document).on("click", ".removeRow", function () {
        $(this).closest("[data-row]").remove();
        updateTotal();
    });

    // --- Update total keseluruhan ---
    function updateTotal() {
        let total = 0;
        $(".subtotalInput").each(function () {
            let val = $(this).val().replace(/\./g, "");
            total += parseInt(val) || 0;
        });
        $("#totalSale").text(formatRupiah(total.toString()));
    }

    // --- Format Rupiah ---
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

    $("#paidAmount").on("keyup", function () {
        let val = $(this).val().replace(/\./g, ""); // hapus titik
        $("#paidAmountRaw").val(val); // kirim angka murni
        this.value = formatRupiah(val); // tetap tampil format rupiah
    });

    // --- Submit Form Penjualan ---
    $("#saleForm").on("submit", function (e) {
        e.preventDefault();
        let formData = $(this).serialize();

        $.ajax({
            url: $(this).attr("action"),
            type: "POST",
            data: formData,
            success: function (res) {
                $("#saleModal").modal("hide");
                dt_basic.ajax.reload();
                Swal.fire(
                    "Berhasil!",
                    "Transaksi penjualan berhasil disimpan.",
                    "success"
                );
            },
            error: function (err) {
                console.group("🧩 ERROR DETAIL PENJUALAN");
                console.error("Status:", err.status);
                console.error("Status Text:", err.statusText);
                console.error("Response Text:", err.responseText);
                console.error("Response JSON:", err.responseJSON);
                console.groupEnd();

                Swal.fire(
                    "Gagal!",
                    err.responseJSON?.message ||
                        "Terjadi kesalahan saat menyimpan penjualan.",
                    "error"
                );
            },
        });
    });

    // --- Hapus Penjualan ---
    $(document).on("click", ".item-delete", function () {
        let id = $(this).data("id");
        Swal.fire({
            title: `Hapus penjualan ini?`,
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/penjualan/${id}`,
                    type: "POST",
                    data: { _method: "DELETE" },
                    success: function () {
                        dt_basic.ajax.reload();
                        Swal.fire(
                            "Terhapus!",
                            "Penjualan berhasil dihapus.",
                            "success"
                        );
                    },
                    error: function () {
                        Swal.fire(
                            "Gagal!",
                            "Gagal menghapus penjualan.",
                            "error"
                        );
                    },
                });
            }
        });
    });
});
