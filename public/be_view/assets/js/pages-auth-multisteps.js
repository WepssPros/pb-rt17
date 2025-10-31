/**
 *  Page auth register multi-steps
 */

'use strict';

// Select2 (jquery)
$(function () {
  var select2 = $('.select2');

  // select2
  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>');
      $this.select2({
        placeholder: 'Masukan Provinsi',
        dropdownParent: $this.parent()
      });
    });
  }
});

// Multi Steps Validation
// --------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    const stepsValidation = document.querySelector('#multiStepsValidation');
    if (stepsValidation !== null) {
      const stepsValidationForm = stepsValidation.querySelector('#multiStepsForm');
      const stepsValidationFormStep1 = stepsValidationForm.querySelector('#accountDetailsValidation');
      const stepsValidationFormStep2 = stepsValidationForm.querySelector('#personalInfoValidation');
      const stepsValidationNext = [].slice.call(stepsValidationForm.querySelectorAll('.btn-next'));
      const stepsValidationPrev = [].slice.call(stepsValidationForm.querySelectorAll('.btn-prev'));

      // Initialize Cleave.js for input masking
      const multiStepsExDate = document.querySelector('.multi-steps-exp-date'),
        multiStepsCvv = document.querySelector('.multi-steps-cvv'),
        multiStepsMobile = document.querySelector('.multi-steps-mobile'),
        multiStepsPincode = document.querySelector('.multi-steps-pincode'),
        multiStepsCard = document.querySelector('.multi-steps-card');

      // Expiry Date Mask
      if (multiStepsExDate) {
        new Cleave(multiStepsExDate, {
          date: true,
          delimiter: '/',
          datePattern: ['m', 'y']
        });
      }

      // CVV
      if (multiStepsCvv) {
        new Cleave(multiStepsCvv, {
          numeral: true,
          numeralPositiveOnly: true
        });
      }

      // Mobile
      if (multiStepsMobile) {
        new Cleave(multiStepsMobile, {
          phone: true,
          phoneRegionCode: 'ID'
        });
      }

      // Pincode
      if (multiStepsPincode) {
        new Cleave(multiStepsPincode, {
          delimiter: '',
          numeral: true
        });
      }

      // Credit Card
      if (multiStepsCard) {
        new Cleave(multiStepsCard, {
          creditCard: true,
          onCreditCardTypeChanged: function (type) {
            if (type != '' && type != 'unknown') {
              document.querySelector('.card-type').innerHTML =
                '<img src="' + assetsPath + 'img/icons/payments/' + type + '-cc.png" height="20"/>';
            } else {
              document.querySelector('.card-type').innerHTML = '';
            }
          }
        });
      }

      let validationStepper = new Stepper(stepsValidation, {
        linear: true
      });

      // Account details validation
      const multiSteps1 = FormValidation.formValidation(stepsValidationFormStep1, {
        fields: {
          name: {
            validators: {
              notEmpty: {
                message: 'Silakan masukkan nama pengguna'
              },
              stringLength: {
                min: 6,
                max: 30,
                message: 'Panjang nama harus lebih dari 6 dan kurang dari 30 karakter'
              },
              regexp: {
                regexp: /^[a-zA-Z0-9 ]+$/,
                message: 'Nama hanya boleh terdiri atas abjad, angka, dan spasi'
              }
            }
          },
          email: {
            validators: {
              notEmpty: {
                message: 'Silakan masukan email pengguna'
              },
              emailAddress: {
                message: 'Bukan alamat email yang valid'
              }
            }
          },
          password: {
            validators: {
              notEmpty: {
                message: 'Silakan masukan password'
              }
            }
          },
          password_confirmation: {
            validators: {
              notEmpty: {
                message: 'Konfirmasi Kata Sandi diperlukan'
              },
              identical: {
                compare: function () {
                  return stepsValidationFormStep1.querySelector('[name="password"]').value;
                },
                message: 'Kata sandi dan konfirmasinya tidak sama'
              }
            }
          }
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.col-sm-6'
          }),
          autoFocus: new FormValidation.plugins.AutoFocus(),
          submitButton: new FormValidation.plugins.SubmitButton()
        },
        init: instance => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        }
      }).on('core.form.valid', function () {
        validationStepper.next();
      });

      // Personal info validation
      const multiSteps2 = FormValidation.formValidation(stepsValidationFormStep2, {
        fields: {
          first_name: {
            validators: {
              notEmpty: {
                message: 'Silakan masukkan nama depan'
              }
            }
          },
          last_name: {
            validators: {
              notEmpty: {
                message: 'Silakan masukkan nama belakang'
              }
            }
          },
          mobile_phone: {
            validators: {
              notEmpty: {
                message: 'Silakan masukkan nomor telepon Anda'
              }
            }
          },
          pin: {
            validators: {
              notEmpty: {
                message: 'Silakan masukkan kode Pos Anda'
              }
            }
          },
          kota: {
            validators: {
              notEmpty: {
                message: 'Silakan masukan kota Anda'
              }
            }
          },
          address: {
            validators: {
              notEmpty: {
                message: 'Masukan Alamat Anda'
              }
            }
          }
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: function (field, ele) {
              switch (field) {
                case 'first_name':
                  return '.col-sm-6';
                case 'address':
                  return '.col-md-12';
                default:
                  return '.row';
              }
            }
          }),
          autoFocus: new FormValidation.plugins.AutoFocus(),
          submitButton: new FormValidation.plugins.SubmitButton()
        }
      }).on('core.form.valid', function () {
        validationStepper.next();
      });

      // Next button click event
      stepsValidationNext.forEach(item => {
        item.addEventListener('click', event => {
          switch (validationStepper._currentIndex) {
            case 0:
              multiSteps1.validate();
              break;
            case 1:
              multiSteps2.validate();
              break;
          }
        });
      });

      // Previous button click event
      stepsValidationPrev.forEach(item => {
        item.addEventListener('click', event => {
          validationStepper.previous();
        });
      });

      // Submit button click event
      const submitButton = stepsValidationForm.querySelector('.btn-submit'); // Ganti dengan selector yang sesuai untuk tombol submit
      submitButton.addEventListener('click', function (event) {
        event.preventDefault(); // Mencegah pengiriman formulir default
        // Validasi terakhir
        multiSteps2.validate().then(status => {
          if (status === 'Valid') {
            // Jika semua validasi berhasil, kirimkan formulir
            stepsValidationForm.submit(); // Ganti ini dengan fungsi AJAX jika diperlukan
            // Anda bisa menambahkan logika untuk memproses data formulir di sini
          }
        });
      });

    }
  })();
});

/**
 * File Upload
 */

'use strict';

(function () {
  // previewTemplate: Updated Dropzone default previewTemplate
  // ! Don't change it unless you really know what you are doing
  const previewTemplate = `<div class="dz-preview dz-file-preview">
<div class="dz-details">
  <div class="dz-thumbnail">
    <img data-dz-thumbnail>
    <span class="dz-nopreview">No preview</span>
    <div class="dz-success-mark"></div>
    <div class="dz-error-mark"></div>
    <div class="dz-error-message"><span data-dz-errormessage></span></div>
    <div class="progress">
      <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
    </div>
  </div>
  <div class="dz-filename" data-dz-name></div>
  <div class="dz-size" data-dz-size></div>
</div>
</div>`;

  // ? Start your code from here

  // Basic Dropzone
  // --------------------------------------------------------------------
  const dropzoneBasic = document.querySelector('#dropzone-basic');
  if (dropzoneBasic) {
    const myDropzone = new Dropzone(dropzoneBasic, {
      previewTemplate: previewTemplate,
      parallelUploads: 1,
      maxFilesize: 5,
      addRemoveLinks: true,
      maxFiles: 1
    });
  }

  // Multiple Dropzone
  // --------------------------------------------------------------------
  const dropzoneMulti = document.querySelector('#dropzone-multi');
  if (dropzoneMulti) {
    const myDropzoneMulti = new Dropzone(dropzoneMulti, {
      previewTemplate: previewTemplate,
      parallelUploads: 1,
      maxFilesize: 5,
      addRemoveLinks: true
    });
  }
})();

