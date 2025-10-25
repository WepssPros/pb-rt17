<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
    <div class="app-brand demo">
        <a href="#" class="app-brand-link">
            <span class="app-brand-logo demo">
                <i class='bx bx-money-withdraw bx-lg'></i>
            </span>
            <span class="app-brand-text demo menu-text fw-bold ms-2">Cashflow</span>
        </a>

        <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto">
            <i class="bx bx-chevron-left bx-sm d-flex align-items-center justify-content-center"></i>
        </a>
    </div>

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
        <!-- Dashboard -->
        <li class="menu-item {{ request()->routeIs('dashboard') ? 'active' : '' }}">
            <a href="{{route('dashboard')}}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-home"></i>
                <div class="text-truncate">Dashboard</div>
            </a>
        </li>

        <!-- Master Data -->
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Master Data</span></li>
        <li class="menu-item {{ request()->routeIs('products.index') ? 'active' : '' }}">
            <a href="{{ route('products.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-basket"></i>
                <div class="text-truncate">Stok Shuttlecock</div>
            </a>
        </li>

        <!-- Transaksi -->
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Transaksi</span></li>
        <li class="menu-item {{ request()->routeIs('penjualan.index') ? 'active' : '' }}">
            <a href="{{route('penjualan.index')}}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-cart"></i>
                <div class="text-truncate">Penjualan</div>
            </a>
        </li>
        <li class="menu-item">
            <a href="#" class="menu-link">
                <i class="menu-icon tf-icons bx bx-package"></i>
                <div class="text-truncate">Pembelian</div>
            </a>
        </li>

        <!-- Keuangan -->
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Keuangan</span></li>
        <li class="menu-item">
            <a href="#" class="menu-link">
                <i class="menu-icon tf-icons bx bx-wallet"></i>
                <div class="text-truncate">Kas & Transaksi</div>
            </a>
        </li>
        <li class="menu-item">
            <a href="#" class="menu-link">
                <i class="menu-icon tf-icons bx bx-transfer-alt"></i>
                <div class="text-truncate">Jurnal Umum</div>
            </a>
        </li>

        <!-- Laporan -->
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Laporan</span></li>
        <li class="menu-item">
            <a href="#" class="menu-link">
                <i class="menu-icon tf-icons bx bx-bar-chart"></i>
                <div class="text-truncate">Laporan Keuangan</div>
            </a>
        </li>
        <li class="menu-item">
            <a href="#" class="menu-link">
                <i class="menu-icon tf-icons bx bx-archive"></i>
                <div class="text-truncate">Rekap Stok</div>
            </a>
        </li>

        <!-- Pengaturan -->
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Pengaturan</span></li>
        <li class="menu-item">
            <a href="#" class="menu-link">
                <i class="menu-icon tf-icons bx bx-user"></i>
                <div class="text-truncate">Manajemen User</div>
            </a>
        </li>
    </ul>
</aside>