<!doctype html>
<html lang="en" class="light-style layout-navbar-fixed layout-menu-fixed layout-compact" dir="ltr"
    data-theme="theme-default" data-assets-path="../../be_view/assets/" data-template="vertical-menu-template"
    data-style="light">

    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        @yield('title')

        <link rel="icon" type="image/x-icon" href="../../be_view/assets/img/favicon/favicon.ico" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.cdnfonts.com/css/satoshi" rel="stylesheet">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @php
        $cssFiles = [
        // Fonts
        '../../be_view/assets/vendor/fonts/boxicons.css',
        '../../be_view/assets/vendor/fonts/fontawesome.css',
        '../../be_view/assets/vendor/fonts/flag-icons.css',

        // Core CSS
        '../../be_view/assets/vendor/css/rtl/core.css',
        '../../be_view/assets/vendor/css/rtl/theme-default.css',
        '../../be_view/assets/css/demo.css',

        // Vendor CSS
        '../../be_view/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css',
        '../../be_view/assets/vendor/libs/typeahead-js/typeahead.css',
        '../../be_view/assets/vendor/libs/apex-charts/apex-charts.css',
        '../../be_view/assets/vendor/libs/flatpickr/flatpickr.css',
        '../../be_view/assets/vendor/libs/toastr/toastr.css',
        '../../be_view/assets/vendor/libs/sweetalert2/sweetalert2.css',


        // Page CSS
        '../../be_view/assets/vendor/css/pages/card-analytics.css',

        // Datatables CSS
        '../../be_view/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
        '../../be_view/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
        '../../be_view/assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css',
        '../../be_view/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',

        // Form Validation
        '../../be_view/assets/vendor/libs/@form-validation/form-validation.css',

        // Row Group
        '../../be_view/assets/vendor/libs/datatables-rowgroup-bs5/rowgroup.bootstrap5.css',
        ];

        $headJs = [
        // Helpers & Config
        '../../be_view/assets/vendor/js/helpers.js',
        '../../be_view/assets/vendor/js/template-customizer.js',
        '../../be_view/assets/js/config.js',
        ];
        @endphp

        <!-- CSS -->
        @foreach ($cssFiles as $css)
        <link rel="stylesheet" href="{{ $css }}">
        @endforeach

        <!-- JS in HEAD (only helpers & config) -->
        @foreach ($headJs as $js)
        <script src="{{ $js }}"></script>
        @endforeach
    </head>

    <body>
        <div class="layout-wrapper layout-content-navbar">
            <div class="layout-container">
                @include('components.backend.sidebar')
                <div class="layout-page">
                    @include('components.backend.navbar')
                    <div class="content-wrapper">
                        @yield('content')
                        @include('components.backend.footer')
                        <div class="content-backdrop fade"></div>
                    </div>
                </div>
            </div>
            @include('components.backend.overlay')
            @include('components.backend.dragtarget')
            <div id="toastContainer" class="position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>
        </div>

        @php
        $bodyJs = [
        // Core
        '../../be_view/assets/vendor/libs/jquery/jquery.js',
        '../../be_view/assets/vendor/libs/popper/popper.js',
        '../../be_view/assets/vendor/js/bootstrap.js',
        '../../be_view/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js',
        '../../be_view/assets/vendor/libs/hammer/hammer.js',
        '../../be_view/assets/vendor/libs/i18n/i18n.js',
        '../../be_view/assets/vendor/libs/typeahead-js/typeahead.js',
        '../../be_view/assets/vendor/js/menu.js',

        // Vendors
        '../../be_view/assets/vendor/libs/apex-charts/apexcharts.js',
        '../../be_view/assets/vendor/libs/flatpickr/flatpickr.js',
        '../../be_view/assets/vendor/libs/toastr/toastr.js',
        '../../be_view/assets/vendor/libs/sweetalert2/sweetalert2.js',

        // Datatable
        '../../be_view/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',

        // Form Validation
        '../../be_view/assets/vendor/libs/@form-validation/popular.js',
        '../../be_view/assets/vendor/libs/@form-validation/bootstrap5.js',
        '../../be_view/assets/vendor/libs/@form-validation/auto-focus.js',

        // Main & Page
        '../../be_view/assets/js/main.js',
        '../../be_view/assets/js/app-ecommerce-dashboard.js',
        ];
        @endphp

        <!-- Load JS at bottom -->
        @foreach ($bodyJs as $js)
        <script src="{{ $js }}"></script>
        @endforeach


        @stack('scripts')
    </body>

</html>