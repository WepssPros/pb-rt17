<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
    <div class="app-brand demo">
        <a href="#" class="app-brand-link">
            <span class="app-brand-logo demo">
                <i class='bx bx-money-withdraw bx-lg'></i>
            </span>
            <span class="app-brand-text demo menu-text fw-bold ms-2">PBRT17 KAS</span>
        </a>

        <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto">
            <i class="bx bx-chevron-left bx-sm d-flex align-items-center justify-content-center"></i>
        </a>
    </div>

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
        <!-- Dashboard -->
        @can('akses dashboard')
        <li class="menu-item {{ request()->routeIs('dashboard') ? 'active' : '' }}">
            <a href="{{ route('dashboard') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-home"></i>
                <div class="text-truncate">Dashboard</div>
            </a>
        </li>
        @endcan

        <!-- Master Data -->
        @can('akses master data')

        @can('akses stok shuttlecock')
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Master Data</span></li>
        <li class="menu-item {{ request()->routeIs('products.*') ? 'active' : '' }}">
            <a href="{{ route('products.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-basket"></i>
                <div class="text-truncate">Stok Shuttlecock</div>
            </a>
        </li>
        @endcan
        @endcan

        <!-- Transaksi -->

        @can('akses penjualan')
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Transaksi</span></li>
        <li class="menu-item {{ request()->routeIs('penjualan.*') ? 'active' : '' }}">
            <a href="{{ route('penjualan.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-cart"></i>
                <div class="text-truncate">Penjualan</div>
            </a>
        </li>
        @endcan
        @can('akses pembelian')
        <li class="menu-item {{ request()->routeIs('pembelian.*') ? 'active' : '' }}">
            <a href="{{ route('pembelian.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-package"></i>
                <div class="text-truncate">Pembelian</div>
            </a>
        </li>
        @endcan

        <!-- Keuangan -->

        @can('akses kas transaksi')
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Keuangan & Proyek</span></li>
        <li class="menu-item {{ request()->routeIs('cash.*') ? 'active' : '' }}">
            <a href="{{ route('cash.accounts') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-wallet"></i>
                <div class="text-truncate">Kas & Transaksi</div>
            </a>
        </li>
        @endcan
        @can('akses jurnal umum')
        <li class="menu-item {{ request()->routeIs('journals.*') ? 'active' : '' }}">
            <a href="{{ route('journals.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-transfer-alt"></i>
                <div class="text-truncate">Jurnal Umum</div>
            </a>
        </li>
        @endcan

        <li class="menu-item {{ request()->routeIs('projects.*') ? 'active' : '' }}">
            <a href="{{ route('projects.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-target-lock"></i>
                <div class="text-truncate">Target Proyek Umum</div>
            </a>
        </li>
        <!-- Laporan -->
        @can('akses laporan stok')
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Laporan</span></li>
        <li class="menu-item {{ request()->routeIs('reports.*') ? 'active' : '' }}">
            <a href="{{ route('reports.stock') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-archive"></i>
                <div class="text-truncate">Rekap Stok</div>
            </a>
        </li>
        @endcan

        <!-- Pengaturan -->
        @can('akses manajemen user')
        <li class="menu-header small text-uppercase"><span class="menu-header-text">Pengaturan</span></li>
        <li class="menu-item {{ request()->routeIs('roles.*') ? 'active' : '' }}">
            <a href="{{ route('roles.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-user"></i>
                <div class="text-truncate">Manajemen User</div>
            </a>
        </li>
        @endcan
    </ul>
</aside>