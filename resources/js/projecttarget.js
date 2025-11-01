import Swal from "sweetalert2";
import "bootstrap/dist/js/bootstrap.bundle";

$(function () {
    var dt_basic_table = $(".datatables-basic"),
        dt_basic;

    if (dt_basic_table.length) {
        dt_basic = dt_basic_table.DataTable({
            ajax: "/projects/data", // route dari controller ProjectTargetController@data
            columns: [
                { data: "" }, // Responsive control
                { data: "id" }, // Checkbox
                { data: "id" }, // Hidden
                { data: "name" }, // Nama proyek
                { data: "target_amount" }, // Target dana
                { data: "target_date" }, // Tanggal target
                { data: "cash_account.name" }, // Nama kas
                { data: "cash_account.balance" }, // Saldo kas
                { data: "achievement" }, // Pencapaian %
                { data: "status" }, // Status
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
                    targets: 4, // target_amount
                    render: function (data) {
                        return "Rp " + Number(data).toLocaleString("id-ID");
                    },
                },
                {
                    targets: 5, // target_date
                    render: function (data) {
                        if (!data) return "-";
                        const d = new Date(data);
                        return d.toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        });
                    },
                },
                {
                    targets: 7, // saldo kas
                    render: function (data) {
                        return "Rp " + Number(data).toLocaleString("id-ID");
                    },
                },

                {
                    targets: 8, // pencapaian
                    render: function (data, type, full) {
                        let color =
                            data >= 100
                                ? "bg-label-success"
                                : data >= 50
                                ? "bg-label-warning"
                                : "bg-label-danger";
                        return `<span class="badge ${color}">${data}%</span>`;
                    },
                },
                {
                    targets: 9, // status
                    render: function (data) {
                        let color =
                            data === "Tercapai" ? "bg-success" : "bg-secondary";
                        return `<span class="badge ${color}">${data}</span>`;
                    },
                },
                {
                    targets: -1, // Actions
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return `
                        <a href="javascript:;" class="btn btn-icon item-edit me-1" data-id="${row.id}">
                            <i class="bx bx-edit bx-md"></i>
                        </a>
                        <a href="javascript:;" class="btn btn-icon item-delete text-danger" data-id="${row.id}">
                            <i class="bx bx-trash bx-md"></i>
                        </a>`;
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
                    text: '<i class="bx bx-plus bx-sm me-sm-2"></i> <span class="d-none d-sm-inline-block">Tambah Target</span>',
                    className: "create-new btn btn-primary",
                },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return "Detail Proyek: " + data["name"];
                        },
                    }),
                    type: "column",
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            return col.title !== ""
                                ? `<tr data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}">
                                    <td>${col.title}:</td>
                                    <td>${col.data}</td>
                                  </tr>`
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
            '<h5 class="card-title mb-0">Daftar Target Pembangunan PB RT 17 Kasamba</h5>'
        );

        // Delete Record (frontend-only, tanpa server)
        $(".datatables-basic tbody").on("click", ".delete-record", function () {
            dt_basic.row($(this).parents("tr")).remove().draw();
        });

        // ubah ukuran filter form
        setTimeout(() => {
            $(".dataTables_filter .form-control").removeClass(
                "form-control-sm"
            );
            $(".dataTables_length .form-select").removeClass("form-select-sm");
        }, 300);
    }

    // ---------- AJAX CRUD ----------
    $(document).ready(function () {
        $.ajaxSetup({
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
        });

        // Toast helper
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
            <div class="toast-body">${message}</div>
        `;

            container.appendChild(toastEl);
            const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
            bsToast.show();

            toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
        }

        // --- Add New Target ---
        $(".create-new").on("click", function () {
            $("#projectTargetForm")[0].reset();
            $("#projectTargetModal .modal-title").text("Tambah Target Baru");
            $('#projectTargetForm input[name="project_target_id"]').val("");
            $("#projectTargetModal").modal("show");
        });

        // Format rupiah saat mengetik
        $("#targetAmount").on("keyup", function () {
            this.value = formatRupiah(this.value);
        });

        // --- Submit Form (Create/Update) ---
        $("#projectTargetForm").on("submit", function (e) {
            e.preventDefault();

            let formData = $(this).serializeArray();

            // Bersihkan titik dari nominal
            formData = formData.map((item) => {
                if (item.name === "target_amount") {
                    item.value = item.value.replace(/\./g, "");
                }
                return item;
            });

            let id = $(
                '#projectTargetForm input[name="project_target_id"]'
            ).val();
            let url = id ? `/projects/${id}` : `/projects`;
            let method = id ? "PATCH" : "POST";

            $.ajax({
                url: url,
                type: method,
                data: $.param(formData),
                success: function (res) {
                    if (res.success) {
                        $("#projectTargetModal").modal("hide");
                        dt_basic.ajax.reload();
                        showToast(res.message, "success");
                    }
                },
                error: function (err) {
                    console.error(err);
                    let msg = err.responseJSON?.message || "Terjadi kesalahan.";
                    showToast(msg, "error");
                },
            });
        });

        // --- Tombol Edit Target ---
        // --- Tombol Edit Target ---
        $(document).on("click", ".item-edit", function () {
            let id = $(this).data("id");
            let rowData = dt_basic
                .rows()
                .data()
                .toArray()
                .find((r) => r.id == id);
            if (!rowData) return;

            $("#projectTargetModal .modal-title").text("Edit Target Proyek");
            $('#projectTargetForm input[name="project_target_id"]').val(
                rowData.id
            );
            $('#projectTargetForm input[name="name"]').val(rowData.name);

            // Masukkan angka mentah, jangan formatRupiah
            $('#projectTargetForm input[name="target_amount"]').val(
                rowData.target_amount
            );

            $('#projectTargetForm input[name="target_date"]').val(
                rowData.target_date
            );
            $('#projectTargetForm select[name="cash_account_id"]').val(
                rowData.cash_account_id
            );

            $("#projectTargetModal").modal("show");
        });

        // --- Tombol Delete ---
        $(document).on("click", ".item-delete", function () {
            let id = $(this).data("id");
            let rowData = dt_basic
                .rows()
                .data()
                .toArray()
                .find((r) => r.id == id);
            if (!rowData) return;

            Swal.fire({
                title: `Hapus Target "${rowData.name}"?`,
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
                        url: `/projects/${rowData.id}`,
                        type: "DELETE",
                        success: function (res) {
                            if (res.success) {
                                dt_basic.ajax.reload();
                                showToast(res.message, "success");
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
                            showToast(msg, "error");
                        },
                    });
                }
            });
        });
    });
});

// fungsi format rupiah
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
