import axios from "axios";

("use strict");

$(function () {
    // =====================
    // Select2 Init
    // =====================
    $(".select2").each(function () {
        const $this = $(this);
        $this.wrap('<div class="position-relative"></div>');
        $this.select2({
            placeholder: "Pilih opsi",
            dropdownParent: $this.parent(),
            allowClear: true,
            width: "100%",
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const stepsValidation = document.querySelector("#multiStepsValidation");
    if (!stepsValidation) return;

    const stepsForm = stepsValidation.querySelector("#multiStepsForm");
    const stepAccount = stepsForm.querySelector("#accountDetailsValidation");
    const stepPersonal = stepsForm.querySelector("#personalInfoValidation");
    const stepInfo = stepsForm.querySelector("#infodetailValidation");

    const stepsNext = stepsForm.querySelectorAll(".btn-next");
    const stepsPrev = stepsForm.querySelectorAll(".btn-prev");
    const submitBtn = stepsForm.querySelector(".btn-submit");

    // ---------------------
    // Dependencies guard (biar ga error kalau library belum ke-load)
    // ---------------------
    if (typeof Stepper === "undefined") {
        console.error(
            "Stepper belum ter-load. Pastikan bs-stepper sudah include."
        );
        return;
    }
    if (typeof FormValidation === "undefined") {
        console.error("FormValidation belum ter-load.");
        return;
    }

    // ---------------------
    // Cleave.js phone mask
    // ---------------------
    const mobileInput = stepsForm.querySelector(".multi-steps-mobile");
    if (mobileInput && typeof Cleave !== "undefined") {
        new Cleave(mobileInput, { phone: true, phoneRegionCode: "ID" });
    }

    // ---------------------
    // Stepper Init
    // ---------------------
    const stepper = new Stepper(stepsValidation, {
        linear: true,
        animation: true,
    });

    // ---------------------
    // Form Validation - Step 1
    // ---------------------
    const accountValidation = FormValidation.formValidation(stepAccount, {
        fields: {
            username: {
                validators: {
                    notEmpty: { message: "Silakan masukkan username" },
                },
            },
            email: {
                validators: {
                    notEmpty: { message: "Silakan masukkan email" },
                    emailAddress: { message: "Email tidak valid" },
                },
            },
            password: {
                validators: {
                    notEmpty: { message: "Silakan masukkan password" },
                },
            },
            password_confirmation: {
                validators: {
                    notEmpty: { message: "Silakan konfirmasi password" },
                    identical: {
                        compare: () =>
                            stepAccount.querySelector('[name="password"]')
                                .value,
                        message: "Password dan konfirmasi tidak sama",
                    },
                },
            },
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap5: new FormValidation.plugins.Bootstrap5({
                rowSelector: (field, ele) =>
                    ele.closest(".input-group") ? ".input-group" : ".col-sm-6",
                eleValidClass: "",
            }),
            autoFocus: new FormValidation.plugins.AutoFocus(),
            submitButton: new FormValidation.plugins.SubmitButton(),
        },
    });

    // ---------------------
    // Form Validation - Step 2
    // ---------------------
    const personalValidation = FormValidation.formValidation(stepPersonal, {
        fields: {
            name: {
                validators: { notEmpty: { message: "Masukkan nama lengkap" } },
            },
            phone_number: {
                validators: { notEmpty: { message: "Masukkan nomor telepon" } },
            },
            perumahan: {
                validators: { notEmpty: { message: "Pilih perumahan" } },
            },
            blok_rumah: {
                validators: { notEmpty: { message: "Pilih blok rumah" } },
            },
            no_rumah: {
                validators: { notEmpty: { message: "Isi nomor rumah" } },
            },
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap5: new FormValidation.plugins.Bootstrap5({
                rowSelector: (field, ele) => {
                    if (ele.closest(".input-group")) return ".input-group";
                    // select2 masih dibungkus col-*, jadi aman pakai parent col
                    return ele.closest(".col-sm-12")
                        ? ".col-sm-12"
                        : ".col-sm-6";
                },
                eleValidClass: "",
            }),
            autoFocus: new FormValidation.plugins.AutoFocus(),
            submitButton: new FormValidation.plugins.SubmitButton(),
        },
    });

    // Revalidate select2 on change
    $("#perumahan").on("change", function () {
        personalValidation.revalidateField("perumahan");
    });
    $("#blok_rumah").on("change", function () {
        personalValidation.revalidateField("blok_rumah");
    });

    // ---------------------
    // Step Navigation (ONLY Stepper, jangan manual display)
    // ---------------------
    stepsNext.forEach((btn) => {
        btn.addEventListener("click", () => {
            const idx = stepper._currentIndex;

            if (idx === 0) {
                accountValidation.validate().then((status) => {
                    if (status === "Valid") stepper.next();
                });
                return;
            }

            if (idx === 1) {
                personalValidation.validate().then((status) => {
                    if (status === "Valid") stepper.next();
                });
                return;
            }

            stepper.next();
        });
    });

    // --- Photo Previews (REPLACING DROPZONE) ---
    function setupPreview(inputId, previewId) {
        const input = document.querySelector(inputId);
        const preview = document.querySelector(previewId);
        if (!input || !preview) return;

        input.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupPreview("#input-rumah", "#preview-rumah");
    setupPreview("#input-profile", "#preview-profile");

    stepsPrev.forEach((btn) => {
        btn.addEventListener("click", () => stepper.previous());
    });
});
