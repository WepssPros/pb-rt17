'use strict';

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    let maskWrapper = document.querySelector('.numeral-mask-wrapper');

    for (let pin of maskWrapper.children) {
      pin.onkeyup = function (e) {
        // Cek jika kunci yang ditekan adalah angka (0-9)
        if (/^\d$/.test(e.key)) {
          // Pindah ke input berikutnya jika panjang input sudah sesuai
          if (pin.nextElementSibling) {
            if (this.value.length === parseInt(this.attributes['maxlength'].value)) {
              pin.nextElementSibling.focus();
            }
          }
        } else if (e.key === 'Backspace') {
          // Kembali ke input sebelumnya saat menghapus nilai
          if (pin.previousElementSibling) {
            pin.previousElementSibling.focus();
          }
        }
      };

      // Cegah perilaku default untuk tombol minus
      pin.onkeypress = function (e) {
        if (e.key === '-') {
          e.preventDefault();
        }
      };
    }

    const twoStepsForm = document.querySelector('#twoStepsForm');

    // Validasi Form
    if (twoStepsForm) {
      const fv = FormValidation.formValidation(twoStepsForm, {
        fields: {
          otp_code: { // Ubah nama field di sini
            validators: {
              notEmpty: {
                message: 'Please enter OTP'
              }
            }
          }
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.mb-6'
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
          autoFocus: new FormValidation.plugins.AutoFocus()
        }
      });

      const numeralMaskList = twoStepsForm.querySelectorAll('.numeral-mask');
      const keyupHandler = function () {
        let otpFlag = true,
          otpVal = '';
        
        numeralMaskList.forEach(numeralMaskEl => {
          if (numeralMaskEl.value === '') {
            otpFlag = false;
            twoStepsForm.querySelector('[name="otp_code"]').value = ''; // Perbaiki nama field di sini
          }
          otpVal += numeralMaskEl.value;
        });

        if (otpFlag) {
          twoStepsForm.querySelector('[name="otp_code"]').value = otpVal; // Perbaiki nama field di sini
        }
      };

      numeralMaskList.forEach(numeralMaskEle => {
        numeralMaskEle.addEventListener('keyup', keyupHandler);
      });
    }
  })();
});
