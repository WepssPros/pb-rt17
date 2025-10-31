<!doctype html>

<html lang="en" class="light-style layout-wide customizer-hide" dir="ltr" data-theme="theme-default"
    data-assets-path="../../be_view/assets/" data-template="vertical-menu-template" data-style="light">

    <head>
        <meta charset="utf-8" />
        <meta name="viewport"
            content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

        <title>Registrasi User Kas Monitoring RT 17 Kasamba</title>

        <meta name="description" content="" />

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="../../be_view/assets/img/favicon/favicon.ico" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet" />

        <!-- Icons -->
        <link rel="stylesheet" href="../../be_view/assets/vendor/fonts/boxicons.css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/fonts/fontawesome.css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/fonts/flag-icons.css" />

        <!-- Core CSS -->
        <link rel="stylesheet" href="../../be_view/assets/vendor/css/rtl/core.css"
            class="template-customizer-core-css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/css/rtl/theme-default.css"
            class="template-customizer-theme-css" />
        <link rel="stylesheet" href="../../be_view/assets/css/demo.css" />

        <!-- Vendors CSS -->
        <link rel="stylesheet" href="../../be_view/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/libs/typeahead-js/typeahead.css" />
        <!-- Vendor -->

        <link rel="stylesheet" href="../../be_view/assets/vendor/libs/bs-stepper/bs-stepper.css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/libs/bootstrap-select/bootstrap-select.css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/libs/select2/select2.css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/libs/@form-validation/form-validation.css" />
        <link rel="stylesheet" href="../../be_view/assets/vendor/libs/dropzone/dropzone.css" />

        <!-- Page CSS -->

        <!-- Page -->
        <link rel="stylesheet" href="../../be_view/assets/vendor/css/pages/page-auth.css" />

        <!-- Helpers -->
        <script src="../../be_view/assets/vendor/js/helpers.js"></script>
        <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->
        <!--? Template customizer: To hide customizer set displayCustomizer value false in config.js.  -->
        <script src="../../be_view/assets/vendor/js/template-customizer.js"></script>
        <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->
        <script src="../../be_view/assets/js/config.js"></script>
        <style>
            /* Dropzone clean style */


            .dropzone .dz-button {
                border: none !important;
                background: transparent !important;
                font-size: 12px !important;
                /* ubah ukuran font */
                color: inherit;
                /* agar warna ikut teks sekitar */
                padding: 0;
                /* optional, agar tidak ada jarak ekstra */
            }

        </style>
    </head>

    <body>
        <!-- Content -->

        @yield('register-content')

        <script>
            // Check selected custom option
         window.Helpers.initCustomOptionCheck();
        </script>

        <!-- / Content -->

        <!-- Core JS -->
        <!-- build:js assets/vendor/js/core.js -->

        <script src="../../be_view/assets/vendor/libs/jquery/jquery.js"></script>
        <script src="../../be_view/assets/vendor/libs/popper/popper.js"></script>
        <script src="../../be_view/assets/vendor/js/bootstrap.js"></script>
        <script src="../../be_view/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>
        <script src="../../be_view/assets/vendor/libs/hammer/hammer.js"></script>
        <script src="../../be_view/assets/vendor/libs/i18n/i18n.js"></script>
        <script src="../../be_view/assets/vendor/libs/typeahead-js/typeahead.js"></script>
        <script src="../../be_view/assets/vendor/js/menu.js"></script>

        <!-- endbuild -->

        <!-- Vendors JS -->
        <script src="../../be_view/assets/vendor/libs/cleavejs/cleave.js"></script>
        <script src="../../be_view/assets/vendor/libs/cleavejs/cleave-phone.js"></script>
        <script src="../../be_view/assets/vendor/libs/bs-stepper/bs-stepper.js"></script>
        <script src="../../be_view/assets/vendor/libs/select2/select2.js"></script>
        <script src="../../be_view/assets/vendor/libs/@form-validation/popular.js"></script>
        <script src="../../be_view/assets/vendor/libs/@form-validation/bootstrap5.js"></script>
        <script src="../../be_view/assets/vendor/libs/@form-validation/auto-focus.js"></script>
        <script src="../../be_view/assets/vendor/libs/dropzone/dropzone.js"></script>
        <!-- Main JS -->
        <script src="../../be_view/assets/js/main.js"></script>

        <!-- Page JS -->
        @stack('scripts')


    </body>

</html>