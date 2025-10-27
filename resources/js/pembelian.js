import Swal from "sweetalert2";
import "bootstrap/dist/js/bootstrap.bundle";

$(function () {
    var dt_basic_table = $(".datatables-basic"),
        dt_basic;

    // --- DataTable Pembelian ---
    if (dt_basic_table.length) {
        dt_basic = dt_basic_table.DataTable({
            ajax: "/pembelian/data", // ✅ endpoint pembelian
            columns: [
                { data: "" },
                { data: "id" },
                { data: "id" },
                { data: "reference_no" },
                { data: "purchase_date" }, // ✅ dari purchase_date
                { data: "supplier" }, // ✅ supplier
                { data: "total" },
                { data: "paid" },
                { data: "items_count" },
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
                    text: '<i class="bx bx-plus bx-sm me-sm-2"></i> <span class="d-none d-sm-inline-block">Tambah Pembelian</span>',
                    className: "create-new-purchase btn btn-primary",
                },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: (row) =>
                            "Detail Pembelian #" + row.data().reference_no,
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
            '<h5 class="card-title mb-0">Daftar Pembelian</h5>'
        );
    }

    // --- Setup CSRF ---
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    // --- Modal Tambah Pembelian ---
    $(document).on("click", ".create-new-purchase", function () {
        $("#purchaseForm")[0].reset();
        $("#purchaseItemsWrapper").html("");
        $("#purchaseModalTitle").text("Tambah Pembelian Baru");
        $('#purchaseModal input[name="purchase_id"]').val("");
        $("#purchaseModal").modal("show");
    });

    // --- Dinamis Tambah Barang ---
    $(document).on("change", ".productSelect", function () {
        let selected = $(this).find("option:selected");
        let price = parseInt(selected.data("price")) || 0;
        let $row = $(this).closest("[data-row]");

        $row.find(".priceInput").val(formatRupiah(price.toString()));

        let qty = parseInt($row.find(".qtyInput").val()) || 1;
        $row.find(".subtotalInput").val(formatRupiah((qty * price).toString()));

        updateTotal();
    });

    $(document).on("input", ".qtyInput", function () {
        let $row = $(this).closest("[data-row]");
        let qty = parseInt($(this).val()) || 1;
        let price =
            parseInt($row.find(".priceInput").val().replace(/\./g, "")) || 0;
        $row.find(".subtotalInput").val(formatRupiah((qty * price).toString()));
        updateTotal();
    });

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
        $("#totalPurchase").text(formatRupiah(total.toString()));
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
        let val = $(this).val().replace(/\./g, "");
        $("#paidAmountRaw").val(val);
        this.value = formatRupiah(val);
    });

    // --- Submit Form Pembelian ---
    $("#purchaseForm").on("submit", function (e) {
        e.preventDefault();
        let formData = $(this).serialize();

        $.ajax({
            url: $(this).attr("action"),
            type: "POST",
            data: formData,
            success: function (res) {
                $("#purchaseModal").modal("hide");
                dt_basic.ajax.reload();
                Swal.fire(
                    "Berhasil!",
                    "Transaksi pembelian berhasil disimpan.",
                    "success"
                );
            },
            error: function (err) {
                console.group("🧩 ERROR DETAIL PEMBELIAN");
                console.error("Status:", err.status);
                console.error("Status Text:", err.statusText);
                console.error("Response Text:", err.responseText);
                console.error("Response JSON:", err.responseJSON);
                console.groupEnd();

                Swal.fire(
                    "Gagal!",
                    err.responseJSON?.message ||
                        "Terjadi kesalahan saat menyimpan pembelian.",
                    "error"
                );
            },
        });
    });

    // --- Hapus Pembelian ---
    $(document).on("click", ".item-delete", function () {
        let id = $(this).data("id");
        Swal.fire({
            title: `Hapus pembelian ini?`,
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/pembelian/${id}`,
                    type: "POST",
                    data: { _method: "DELETE" },
                    success: function () {
                        dt_basic.ajax.reload();
                        Swal.fire(
                            "Terhapus!",
                            "Pembelian berhasil dihapus.",
                            "success"
                        );
                    },
                    error: function () {
                        Swal.fire(
                            "Gagal!",
                            "Gagal menghapus pembelian.",
                            "error"
                        );
                    },
                });
            }
        });
    });
});

// --- Nomor Referensi Otomatis ---
document.addEventListener("DOMContentLoaded", function () {
    function generateReferenceNumber() {
        const now = new Date();
        const hari = String(now.getDate()).padStart(2, "0");
        const bulan = String(now.getMonth() + 1).padStart(2, "0");
        const tahun = now.getFullYear();
        const jam = String(now.getHours()).padStart(2, "0");
        const menit = String(now.getMinutes()).padStart(2, "0");
        const detik = String(now.getSeconds()).padStart(2, "0");
        const kode = "BUY"; // kode unik untuk pembelian
        return `REF-${hari}${bulan}${tahun}-${jam}${menit}${detik}-${kode}`;
    }

    const purchaseModal = document.getElementById("purchaseModal");
    purchaseModal.addEventListener("shown.bs.modal", function () {
        const referenceInput = document.getElementById("referenceNo");
        if (referenceInput) {
            const referenceNumber = generateReferenceNumber();
            referenceInput.value = referenceNumber; // ✅ nilai masuk ke input
            console.log("Nomor Referensi Otomatis:", referenceNumber);
        }
    });
});
