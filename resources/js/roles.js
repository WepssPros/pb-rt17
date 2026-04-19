"use strict";

$(function () {
    // ====== Bootstrap Tooltip init (untuk avatar tooltip) ======
    if (window.bootstrap) {
        document
            .querySelectorAll('[data-bs-toggle="tooltip"]')
            .forEach((el) => {
                new bootstrap.Tooltip(el);
            });
    }

    // ====== DataTable ======
    const dtUserTable = $(".datatables-users");
    let dt_User = null;

    // Route base (sesuaikan kalau route kamu beda)
    const userViewBase = "/roles/user/"; // /roles/user/{id}

    // Status mapping aman (fallback)
    const statusObj = {
        1: { title: "Pending", class: "bg-label-warning" },
        2: { title: "Active", class: "bg-label-success" },
        3: { title: "Inactive", class: "bg-label-secondary" },
    };

    if (dtUserTable.length) {
        dt_User = dtUserTable.DataTable({
            processing: true,
            serverSide: true,
            ajax: { url: "/roles/datatable", type: "GET" },

            columns: [
                { data: "id" }, // 0 control
                { data: "id" }, // 1 checkbox
                { data: "full_name" }, // 2 user
                { data: "role" }, // 3 role
                { data: "foto_profile_url" }, // 4 foto profil
                { data: "foto_rumah_url" }, // 5 foto rumah
                { data: "status" }, // 6 status
                { data: "actions", orderable: false, searchable: false }, // 7 actions
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
                    checkboxes: {
                        selectAllRender:
                            '<input type="checkbox" class="form-check-input">',
                    },
                    render: () =>
                        '<input type="checkbox" class="dt-checkboxes form-check-input">',
                },
                {
                    // User (avatar + nama + email)
                    targets: 2,
                    responsivePriority: 4,
                    render: function (data, type, full) {
                        const name = full?.full_name ?? "-";
                        const email = full?.email ?? "-";
                        const img = full?.foto_profile_url;

                        let avatarHtml = "";
                        if (img) {
                            avatarHtml = `<img src="${img}" alt="Avatar" class="rounded-circle" style="width:32px;height:32px;object-fit:cover;">`;
                        } else {
                            const initialsArr = name.match(/\b\w/g) || [];
                            const initials = (
                                (initialsArr.shift() || "") +
                                (initialsArr.pop() || "")
                            ).toUpperCase();
                            avatarHtml = `<span class="avatar-initial rounded-circle bg-label-primary" style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;">${initials}</span>`;
                        }

                        const profileUrl = `${userViewBase}${full?.id}`;

                        return `
              <div class="d-flex justify-content-left align-items-center">
                <div class="avatar-wrapper">
                  <div class="avatar avatar-sm me-4">
                    ${avatarHtml}
                  </div>
                </div>
                <div class="d-flex flex-column">
                  <a href="${profileUrl}" class="text-heading text-truncate">
                    <span class="fw-medium">${name}</span>
                  </a>
                  <small>${email}</small>
                </div>
              </div>
            `;
                    },
                },
                {
                    // Role
                    targets: 3,
                    render: function (data, type, full) {
                        const role = full?.role ?? "-";
                        const roleBadgeObj = {
                            Subscriber:
                                '<i class="bx bx-crown text-primary me-2"></i>',
                            Author: '<i class="bx bx-edit text-warning me-2"></i>',
                            Maintainer:
                                '<i class="bx bx-user text-success me-2"></i>',
                            Editor: '<i class="bx bx-pie-chart-alt text-info me-2"></i>',
                            Admin: '<i class="bx bx-desktop text-danger me-2"></i>',
                        };
                        const icon =
                            roleBadgeObj[role] ||
                            '<i class="bx bx-user text-muted me-2"></i>';
                        return `<span class="text-truncate d-flex align-items-center text-heading">${icon}${role}</span>`;
                    },
                },
                {
                    // Foto Profil (preview modal)
                    targets: 4,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, full) {
                        const url = full?.foto_profile_url;
                        if (!url) return "-";
                        const title = `Foto Profil ${full?.full_name ?? ""}`;
                        return `
              <a href="javascript:;" class="js-img-preview" data-title="${title}" data-src="${url}">
                <img src="${url}" alt="${title}" class="rounded"
                     style="width:48px;height:48px;object-fit:cover;cursor:pointer;">
              </a>
            `;
                    },
                },
                {
                    // Foto Rumah (preview modal)
                    targets: 5,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, full) {
                        const url = full?.foto_rumah_url;
                        if (!url) return "-";
                        const title = `Foto Rumah ${full?.full_name ?? ""}`;
                        return `
              <a href="javascript:;" class="js-img-preview" data-title="${title}" data-src="${url}">
                <img src="${url}" alt="${title}" class="rounded"
                     style="width:64px;height:48px;object-fit:cover;cursor:pointer;">
              </a>
            `;
                    },
                },
                {
                    // Status (aman dengan fallback)
                    targets: 6,
                    render: function (data, type, full) {
                        const st = full?.status;
                        const mapped = statusObj[st] || {
                            title: "Unknown",
                            class: "bg-label-dark",
                        };
                        return `<span class="badge ${mapped.class} text-capitalized">${mapped.title}</span>`;
                    },
                },
                {
                    // Actions (FIX: link pakai id)
                    targets: 7,
                    title: "Actions",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, full) {
                        // Kalau backend sudah ngasih full.actions, pakai itu:
                        if (full?.actions) return full.actions;

                        const viewUrl = `${userViewBase}${full?.id}`;
                        const isOwner =
                            parseInt(full?.id) ===
                            parseInt(window.currentUserId);

                        // Hanya tampilkan tombol View/Detail jika ini adalah profil milik sendiri
                        const viewButton = isOwner
                            ? `
                <a href="${viewUrl}" class="btn btn-icon" title="View">
                  <i class="bx bx-show bx-md"></i>
                </a>`
                            : "";

                        const detailDropdownItem = isOwner
                            ? `<a href="${viewUrl}" class="dropdown-item">Detail</a>`
                            : "";

                        return `
              <div class="d-flex align-items-center">
                <a href="javascript:;" class="btn btn-icon delete-record" title="Delete">
                  <i class="bx bx-trash bx-md"></i>
                </a>
                ${viewButton}
                <a href="javascript:;" class="btn btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="bx bx-dots-vertical-rounded bx-md"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-end m-0">
                  ${detailDropdownItem}
                  <a href="javascript:;" class="dropdown-item">Suspend</a>
                </div>
              </div>
            `;
                    },
                },
            ],

            // lebih masuk akal order by name ASC
            order: [[2, "asc"]],

            dom:
                '<"row"' +
                '<"col-sm-12 col-md-4 col-lg-6" l>' +
                '<"col-sm-12 col-md-8 col-lg-6"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-md-end justify-content-center align-items-center flex-sm-nowrap flex-wrap flex-sm-row flex-column"<"me-4"f><"user_role w-px-200 me-sm-4 mb-6 mb-sm-0">>>' +
                ">t" +
                '<"row"' +
                '<"col-sm-12 col-md-6"i>' +
                '<"col-sm-12 col-md-6"p>' +
                ">",

            language: {
                sLengthMenu: "_MENU_",
                search: "",
                searchPlaceholder: "Search User",
                paginate: {
                    next: '<i class="bx bx-chevron-right bx-18px"></i>',
                    previous: '<i class="bx bx-chevron-left bx-18px"></i>',
                },
            },

            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            const data = row.data();
                            return "Details of " + (data?.full_name ?? "");
                        },
                    }),
                    type: "column",
                    renderer: function (api, rowIdx, columns) {
                        const data = $.map(columns, function (col) {
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

            initComplete: function () {
                // Filter Role only
                this.api()
                    .columns(3)
                    .every(function () {
                        const column = this;
                        const select = $(
                            '<select id="UserRole" class="form-select text-capitalize"><option value=""> Select Role </option></select>'
                        )
                            .appendTo(".user_role")
                            .on("change", function () {
                                const val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );
                                column
                                    .search(
                                        val ? "^" + val + "$" : "",
                                        true,
                                        false
                                    )
                                    .draw();
                            });

                        column
                            .data()
                            .unique()
                            .sort()
                            .each(function (d) {
                                if (d)
                                    select.append(
                                        `<option value="${d}" class="text-capitalize">${d}</option>`
                                    );
                            });
                    });
            },
        });

        // Delete record (frontend only)
        $(".datatables-users tbody").on("click", ".delete-record", function () {
            dt_User.row($(this).parents("tr")).remove().draw();
        });

        // Tweak controls
        setTimeout(() => {
            $(".dataTables_filter .form-control").removeClass(
                "form-control-sm"
            );
            $(".dataTables_length .form-select")
                .removeClass("form-select-sm")
                .addClass("mx-0");
            $(".dataTables_length").addClass("mb-0 mb-md-6");
        }, 300);
    }

    // ====== Image Preview Modal (delegated) ======
    $(document).on("click", ".js-img-preview", function () {
        const src = $(this).data("src");
        const title = $(this).data("title") || "Preview Gambar";
        $("#imagePreviewTitle").text(title);
        $("#imagePreviewImg").attr("src", src);

        const modalEl = document.getElementById("imagePreviewModal");
        if (modalEl && window.bootstrap) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    });

    // ====== Role modal title ======
    const roleTitle = document.querySelector(".role-title");
    const roleAddBtn = document.querySelector(".add-new-role");

    if (roleAddBtn && roleTitle) {
        roleAddBtn.addEventListener(
            "click",
            () => (roleTitle.textContent = "Add New Role")
        );
    }

    document.querySelectorAll(".role-edit-modal").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (roleTitle) roleTitle.textContent = "Edit Role";
        });
    });

    // ====== Select all (Add Role) ======
    const selectAllAdd = document.getElementById("selectAllAdd");
    if (selectAllAdd) {
        selectAllAdd.addEventListener("change", function () {
            document
                .querySelectorAll("#addRoleModal .permission-checkbox")
                .forEach((cb) => {
                    cb.checked = selectAllAdd.checked;
                });
        });
    }

    // ====== Edit role load permissions ======
    document.querySelectorAll(".role-edit-modal").forEach((btn) => {
        btn.addEventListener("click", function () {
            const roleId = this.dataset.roleId;
            const roleName = this.dataset.roleName;

            const modal = document.getElementById("editRoleModal");
            if (!modal) return;

            const form = modal.querySelector("#editRoleForm");
            form.action = `/roles/${roleId}`;

            modal.querySelector("#editModalRoleName").value = roleName;
            modal.querySelector("#editRoleId").value = roleId;

            // reset
            modal
                .querySelectorAll(".permission-checkbox")
                .forEach((chk) => (chk.checked = false));
            const selectAllEdit = modal.querySelector("#selectAllEdit");
            if (selectAllEdit) selectAllEdit.checked = false;

            fetch(`/roles/${roleId}/permissions`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            })
                .then((res) => res.json())
                .then((data) => {
                    const perms = data?.permissions || [];
                    perms.forEach((p) => {
                        const chk = modal.querySelector(
                            `input.permission-checkbox[value="${p}"]`
                        );
                        if (chk) chk.checked = true;
                    });

                    if (selectAllEdit) {
                        const allChecked = Array.from(
                            modal.querySelectorAll(".permission-checkbox")
                        ).every((c) => c.checked);
                        selectAllEdit.checked = allChecked;
                    }
                })
                .catch((err) => console.error("Gagal ambil permissions:", err));
        });
    });

    // ====== Select all (Edit Role) ======
    const selectAllEdit = document.getElementById("selectAllEdit");
    if (selectAllEdit) {
        selectAllEdit.addEventListener("change", function () {
            const modal = document.getElementById("editRoleModal");
            if (!modal) return;
            modal
                .querySelectorAll(".permission-checkbox")
                .forEach((cb) => (cb.checked = selectAllEdit.checked));
        });
    }

    // ====== Add user to role modal fill ======
    document.querySelectorAll(".add-user-to-role").forEach((btn) => {
        btn.addEventListener("click", function () {
            const roleId = this.dataset.roleId;
            const roleName = this.dataset.roleName;

            const inputRole = document.getElementById("addUserRoleId");
            if (inputRole) inputRole.value = roleId;

            const modalTitle = document.querySelector(
                "#addUserToRoleModal .modal-body h4"
            );
            if (modalTitle)
                modalTitle.textContent = `Tambah User ke Role: ${roleName}`;
        });
    });

    // ====== Add user to role submit (AJAX, robust) ======
    const addUserForm = document.getElementById("addUserToRoleForm");
    if (addUserForm) {
        addUserForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") ||
                addUserForm.querySelector('input[name="_token"]')?.value;

            fetch(addUserForm.action, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    ...(csrf ? { "X-CSRF-TOKEN": csrf } : {}),
                },
                body: new FormData(addUserForm),
            })
                .then(async (res) => {
                    // coba parse json; kalau bukan json, lempar error biar ketahuan
                    const contentType = res.headers.get("content-type") || "";
                    if (!contentType.includes("application/json")) {
                        const text = await res.text();
                        throw new Error(
                            "Response bukan JSON: " + text.slice(0, 150)
                        );
                    }
                    const data = await res.json();
                    if (!res.ok)
                        throw new Error(data?.message || "Request gagal");
                    return data;
                })
                .then((data) => {
                    if (data?.success) {
                        if (typeof toastr !== "undefined")
                            toastr.success(data.success);
                        else alert(data.success);

                        const modalEl =
                            document.getElementById("addUserToRoleModal");
                        if (modalEl && window.bootstrap) {
                            bootstrap.Modal.getOrCreateInstance(modalEl).hide();
                        }

                        addUserForm.reset();

                        // refresh datatable (lebih bagus daripada reload full page)
                        if (dt_User) dt_User.ajax.reload(null, false);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    if (typeof toastr !== "undefined")
                        toastr.error(
                            "Terjadi kesalahan saat menambahkan user."
                        );
                    else alert("Terjadi kesalahan saat menambahkan user.");
                });
        });
    }
});
