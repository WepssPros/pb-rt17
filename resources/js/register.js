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
    // Cleave.js phone mask
    // ---------------------
    const mobileInput = stepsForm.querySelector(".multi-steps-mobile");
    if (mobileInput) {
        new Cleave(mobileInput, {
            phone: true,
            phoneRegionCode: "ID",
        });
    }

    // ---------------------
    // Stepper Init
    // ---------------------
    const stepper = new Stepper(stepsValidation, { linear: true });

    // ---------------------
    // Form Validation
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
                    if (ele.tagName === "SELECT")
                        return ".col-sm-12, .col-sm-6";
                    return ".col-sm-6";
                },
                eleValidClass: "",
            }),
            autoFocus: new FormValidation.plugins.AutoFocus(),
            submitButton: new FormValidation.plugins.SubmitButton(),
        },
    });

    // ---------------------
    // Step Navigation
    // ---------------------
    stepsNext.forEach((btn) => {
        btn.addEventListener("click", () => {
            switch (stepper._currentIndex) {
                case 0:
                    accountValidation.validate().then((status) => {
                        if (status === "Valid") stepper.next();
                    });
                    break;
                case 1:
                    personalValidation.validate().then((status) => {
                        if (status === "Valid") stepper.next();
                    });
                    break;
                default:
                    stepper.next();
            }
        });
    });

    stepsPrev.forEach((btn) => {
        btn.addEventListener("click", () => stepper.previous());
    });

    Dropzone.autoDiscover = false;

    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

    const dropzones = [
        {
            selector: "#dropzone-fotorumah",
            inputId: "#foto_rumah",
            type: "fotorumah",
        },
        {
            selector: "#dropzone-fotoprofile",
            inputId: "#foto_profile",
            type: "fotoprofile",
        },
    ];

    dropzones.forEach(({ selector, inputId, type }) => {
        const el = document.querySelector(selector);
        if (!el) return;

        const dz = new Dropzone(el, {
            url: "#", // tidak dipakai
            autoProcessQueue: false, // kita handle manual
            maxFiles: 1,
            maxFilesize: 5,
            acceptedFiles: "image/*",
            addRemoveLinks: true,

            init: function () {
                this.on("addedfile", (file) => {
                    // Buat form data
                    const formData = new FormData();
                    formData.append("file", file);

                    console.log("🚀 Uploading via Axios:", type);

                    // Kirim ke server Laravel pakai Axios
                    axios
                        .post(`/api/tmp-upload/${type}`, formData, {
                            headers: {
                                "X-CSRF-TOKEN": csrfToken,
                                "Content-Type": "multipart/form-data",
                                Accept: "application/json",
                            },
                        })
                        .then((res) => {
                            console.log("✅ Server response:", res.data);

                            const { filename } = res.data;
                            if (filename) {
                                document.querySelector(inputId).value =
                                    filename;
                            } else {
                                alert("Response tidak sesuai dari server!");
                                this.removeFile(file);
                            }
                        })
                        .catch((err) => {
                            console.error(
                                "❌ Upload gagal:",
                                err.response || err
                            );
                            alert("Upload gagal, coba lagi!");
                            this.removeFile(file);
                        });
                });

                this.on("removedfile", function () {
                    document.querySelector(inputId).value = "";
                });
            },
        });
    });

    // Multi-step navigation tanpa mengubah CSS
    document.querySelectorAll(".btn-next").forEach((btn) => {
        btn.addEventListener("click", () => {
            const currentStep = btn.closest(".content");
            const nextStep = currentStep.nextElementSibling;
            if (nextStep) {
                currentStep.style.display = "none";
                nextStep.style.display = "block";
            }
        });
    });
    document.querySelectorAll(".btn-prev").forEach((btn) => {
        btn.addEventListener("click", () => {
            const currentStep = btn.closest(".content");
            const prevStep = currentStep.previousElementSibling;
            if (prevStep) {
                currentStep.style.display = "none";
                prevStep.style.display = "block";
            }
        });
    });

    // Initial: tampil step pertama
    document.querySelectorAll(".content").forEach((step, i) => {
        step.style.display = i === 0 ? "block" : "none";
    });

    // Submit: cek foto sudah diupload
    document
        .querySelector(".btn-submit")
        .addEventListener("click", function (e) {
            const fotoRumah = document.querySelector("#foto_rumah").value;
            const fotoProfile = document.querySelector("#foto_profile").value;
            if (!fotoRumah || !fotoProfile) {
                e.preventDefault();
                alert(
                    "Silakan upload foto rumah dan foto profile sebelum submit!"
                );
                return;
            }
        });
});
