import Swal from "sweetalert2";
import "bootstrap/dist/js/bootstrap.bundle";
$(function () {
    var dt_basic_table = $(".datatables-basic"),
        dt_basic;

    if (dt_basic_table.length) {
        dt_basic = dt_basic_table.DataTable({
            ajax: "/products/data", // ambil dari backend Laravel
            columns: [
                { data: "" }, // Responsive control
                { data: "id" }, // Checkbox
                { data: "id" }, // Hidden
                { data: "name" }, // Product name
                { data: "sku" }, // SKU
                { data: "unit" }, // Unit
                { data: "cost_price" }, // Cost Price
                { data: "sell_price" }, // Sell Price
                { data: "stock" }, // Stock status via relation
                { data: "" }, // Actions
            ],
            columnDefs: [
                {
                    className: "control",
                    orderable: false,
                    searchable: false,
                    responsivePriority: 2,
                    targets: 0,
                    render: function () {
                        return "";
                    },
                },
                {
                    targets: 1,
                    orderable: false,
                    searchable: false,
                    responsivePriority: 3,
                    checkboxes: true,
                    render: function () {
                        return '<input type="checkbox" class="dt-checkboxes form-check-input">';
                    },
                    checkboxes: {
                        selectAllRender:
                            '<input type="checkbox" class="form-check-input">',
                    },
                },
                {
                    targets: 2,
                    searchable: false,
                    visible: false,
                },
                {
                    targets: 3,
                    render: function (data, type, full) {
                        // Optional: Avatar/initials for product
                        var $name = full["name"];
                        var $initials = $name.match(/\b\w/g) || [];
                        $initials = (
                            ($initials.shift() || "") + ($initials.pop() || "")
                        ).toUpperCase();
                        return "" + $name;
                    },
                },
                {
                    responsivePriority: 1,
                    targets: 4,
                },
                {
                    targets: 8, // Stock
                    render: function (data, type, full) {
                        var quantity = full["stock"]; // angka quantity dari server
                        var status =
                            quantity > 0
                                ? {
                                      title: "In Stock",
                                      class: "bg-label-success",
                                  }
                                : {
                                      title: "Out of Stock",
                                      class: "bg-label-danger",
                                  };
                        return (
                            '<span class="badge ' +
                            status.class +
                            '">' +
                            status.title +
                            " (" +
                            quantity +
                            ")</span>"
                        );
                    },
                },

                {
                    targets: -1, // Actions
                    orderable: false,
                    searchable: false,
                    render: function () {
                        return (
                            "" +
                            '<a href="javascript:;" class="btn btn-icon item-edit me-1"><i class="bx bx-edit bx-md"></i></a>' +
                            '<a href="javascript:;" class="btn btn-icon item-delete text-danger"><i class="bx bx-trash bx-md"></i></a>'
                        );
                    },
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
                    text: '<i class="bx bx-plus bx-sm me-sm-2"></i> <span class="d-none d-sm-inline-block">Add New Product</span>',
                    className: "create-new btn btn-primary",
                },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return "Details of " + data["name"];
                        },
                    }),
                    type: "column",
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            return col.title !== ""
                                ? '<tr data-dt-row="' +
                                      col.rowIndex +
                                      '" data-dt-column="' +
                                      col.columnIndex +
                                      '">' +
                                      "<td>" +
                                      col.title +
                                      ":</td><td>" +
                                      col.data +
                                      "</td></tr>"
                                : "";
                        }).join("");
                        return data
                            ? $('<table class="table"/><tbody />').append(data)
                            : false;
                    },
                },
            },
        });

        $("div.head-label").html(
            '<h5 class="card-title mb-0">Product DataTable with Buttons</h5>'
        );

        // Delete Record
        $(".datatables-basic tbody").on("click", ".delete-record", function () {
            dt_basic.row($(this).parents("tr")).remove().draw();
        });

        // Filter form control to default size
        setTimeout(() => {
            $(".dataTables_filter .form-control").removeClass(
                "form-control-sm"
            );
            $(".dataTables_length .form-select").removeClass("form-select-sm");
        }, 300);
    }

    $(document).ready(function () {
        // --- Setup CSRF token untuk semua Ajax Laravel ---
        $.ajaxSetup({
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
        });

        // --- Helper Toast Custom ---
        function showToast(message, type = "info") {
            let bgClass = "bg-primary";
            if (type === "success") bgClass = "bg-success";
            if (type === "error") bgClass = "bg-danger";
            if (type === "info") bgClass = "bg-info";

            const container = document.getElementById("toastContainer");

            const toastEl = document.createElement("div");
            toastEl.className = `bs-toast toast fade show ${bgClass}`;
            toastEl.role = "alert";
            toastEl.setAttribute("aria-live", "assertive");
            toastEl.setAttribute("aria-atomic", "true");

            toastEl.innerHTML = `
            <div class="toast-header">
                <i class="bx bx-bell me-2"></i>
                <div class="me-auto fw-medium">${
                    type.charAt(0).toUpperCase() + type.slice(1)
                }</div>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

            container.appendChild(toastEl);

            const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
            bsToast.show();

            toastEl.addEventListener("hidden.bs.toast", () => {
                toastEl.remove();
            });
        }

        // --- Tombol Add New Product ---
        $(".create-new").on("click", function () {
            $("#productForm")[0].reset();
            $("#productModal .modal-title").text("Tambah Produk Baru");
            $('#productModal input[name="product_id"]').val("");
            $("#productModal").modal("show");
        });

        $("#productCostPrice, #productSellPrice").on("keyup", function (e) {
            this.value = formatRupiah(this.value);
        });

        // --- Submit Form (Create / Update) ---
        $("#productForm").on("submit", function (e) {
            e.preventDefault();
            // Ambil semua data form
            let formData = $(this).serializeArray();

            // Bersihkan titik dari harga
            formData = formData.map((item) => {
                if (item.name === "cost_price" || item.name === "sell_price") {
                    item.value = item.value.replace(/\./g, ""); // jadi angka murni
                }
                return item;
            });

            let productId = $('#productModal input[name="product_id"]').val();
            let url = productId ? `/products/${productId}` : "/products";
            if (productId) formData.push({ name: "_method", value: "PUT" }); // Laravel PUT

            $.ajax({
                url: url,
                type: "POST",
                data: $.param(formData),
                success: function (res) {
                    if (res.success) {
                        $("#productModal").modal("hide");
                        dt_basic.ajax.reload();
                        showToast(res.message, "success"); // toast custom
                    }
                },
                error: function (err) {
                    console.error(err);
                    let msg = err.responseJSON?.message || "Terjadi kesalahan.";
                    showToast(msg, "error");
                },
            });
        });

        // --- Tombol Edit Product ---
        $(".datatables-basic tbody").on("click", ".item-edit", function () {
            let rowData = dt_basic.row($(this).parents("tr")).data();

            $("#productModal .modal-title").text("Edit Produk");
            $('#productModal input[name="product_id"]').val(rowData.id);
            $('#productModal input[name="name"]').val(rowData.product_name);
            $('#productModal input[name="sku"]').val(rowData.sku);
            $('#productModal input[name="unit"]').val(rowData.unit);

            // Format rupiah sebelum ditampilkan
            $('#productModal input[name="cost_price"]').val(
                formatRupiah(rowData.cost_price.toString())
            );
            $('#productModal input[name="sell_price"]').val(
                formatRupiah(rowData.sell_price.toString())
            );

            $('#productModal textarea[name="notes"]').val(rowData.notes || "");
            $("#productModal").modal("show");
        });

        // --- Tombol Delete Product ---
        $(".datatables-basic tbody").on("click", ".item-delete", function () {
            let rowData = dt_basic.row($(this).parents("tr")).data();

            Swal.fire({
                title: `Hapus "${rowData.product_name}"?`,
                text: "Data yang dihapus tidak dapat dikembalikan!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya, Hapus!",
                cancelButtonText: "Batal",
                reverseButtons: true,
                customClass: {
                    confirmButton: "btn btn-danger me-2",
                    cancelButton: "btn btn-secondary",
                },
                buttonsStyling: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `/products/${rowData.id}`,
                        type: "POST",
                        data: { _method: "DELETE" },
                        success: function (res) {
                            if (res.success) {
                                dt_basic.ajax.reload(); // reload datatable
                                showToast(res.message, "success"); // toast custom sukses
                            } else {
                                showToast(
                                    res.message || "Gagal menghapus data.",
                                    "error"
                                );
                            }
                        },
                        error: function (err) {
                            console.error(err);
                            let msg =
                                err.responseJSON?.message ||
                                "Terjadi kesalahan saat menghapus data.";
                            showToast(msg, "error"); // toast custom error
                        },
                    });
                }
            });
        });
    });
});

// Fungsi format rupiah
function formatRupiah(angka) {
    if (!angka) return "";
    let number_string = angka.replace(/[^,\d]/g, "").toString();
    let split = number_string.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }

    rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
    return rupiah;
}

// Event untuk input harga modal & harga jual
$("#productCostPrice, #productSellPrice").on("keyup", function (e) {
    this.value = formatRupiah(this.value);
});
