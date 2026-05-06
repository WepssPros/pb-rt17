<!doctype html>
<html lang="id" class="theme">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.cdnfonts.com/css/satoshi" rel="stylesheet">
    <script>
        (() => {
            try {
                const theme = localStorage.getItem('pbrt-theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.dataset.theme = theme;
                window.__PBRT_THEME__ = theme;
            } catch (error) {
                document.documentElement.classList.remove('dark');
                document.documentElement.dataset.theme = 'light';
                window.__PBRT_THEME__ = 'light';
            }
        })();
    </script>
    @yield('title')
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/admin/main.jsx'])
</head>

@php
    $profileUser = $user ?? null;
    $authUser = auth()->user();
    $routeName = request()->route()?->getName() ?? '';
    $currentPageKey = match (true) {
        str_starts_with($routeName, 'dashboard.') => 'dashboard',
        str_starts_with($routeName, 'products.') => 'products',
        str_starts_with($routeName, 'penjualan.') => 'penjualan',
        str_starts_with($routeName, 'pembelian.') => 'pembelian',
        $routeName === 'cash.accounts' => 'cash',
        $routeName === 'cash.transactions' => 'cash-transactions',
        str_starts_with($routeName, 'projects.') => 'projects',
        str_starts_with($routeName, 'reports.') => 'reports',
        $routeName === 'roles.index' => 'roles',
        $routeName === 'roles.users.show' => 'roles-user',
        $routeName === 'journals.index' => 'journals',
        $routeName === 'journals.show' => 'journals-show',
        default => 'fallback',
    };

    $menu = [
        [
            'label' => 'Overview',
            'icon' => 'dashboard',
            'items' => array_values(array_filter([
                $authUser?->can('akses dashboard') ? [
                    'label' => 'Dashboard',
                    'href' => route('dashboard.index'),
                    'active' => request()->routeIs('dashboard.*'),
                ] : null,
            ])),
        ],
        [
            'label' => 'Master Data',
            'icon' => 'master',
            'items' => array_values(array_filter([
                $authUser?->can('akses stok shuttlecock') ? [
                    'label' => 'Stok Shuttlecock',
                    'href' => route('products.index'),
                    'active' => request()->routeIs('products.*'),
                ] : null,
            ])),
        ],
        [
            'label' => 'Transaksi',
            'icon' => 'transaction',
            'items' => array_values(array_filter([
                $authUser?->can('akses penjualan') ? [
                    'label' => 'Penjualan',
                    'href' => route('penjualan.index'),
                    'active' => request()->routeIs('penjualan.*'),
                ] : null,
                $authUser?->can('akses pembelian') ? [
                    'label' => 'Pembelian',
                    'href' => route('pembelian.index'),
                    'active' => request()->routeIs('pembelian.*'),
                ] : null,
            ])),
        ],
        [
            'label' => 'Keuangan',
            'icon' => 'finance',
            'items' => array_values(array_filter([
                $authUser?->can('akses kas transaksi') ? [
                    'label' => 'Kas & Transaksi',
                    'href' => route('cash.accounts'),
                    'active' => request()->routeIs('cash.*'),
                ] : null,
                $authUser?->can('akses jurnal umum') ? [
                    'label' => 'Jurnal Umum',
                    'href' => route('journals.index'),
                    'active' => request()->routeIs('journals.*'),
                ] : null,
                $authUser?->can('akses target proyek') ? [
                    'label' => 'Target Proyek',
                    'href' => route('projects.index'),
                    'active' => request()->routeIs('projects.*'),
                ] : null,
            ])),
        ],
        [
            'label' => 'Laporan',
            'icon' => 'report',
            'items' => array_values(array_filter([
                $authUser?->can('akses laporan stok') ? [
                    'label' => 'Rekap Stok',
                    'href' => route('reports.stock'),
                    'active' => request()->routeIs('reports.*'),
                ] : null,
            ])),
        ],
        [
            'label' => 'Pengaturan',
            'icon' => 'settings',
            'items' => array_values(array_filter([
                $authUser?->can('akses manajemen user') ? [
                    'label' => 'Manajemen User',
                    'href' => route('roles.index'),
                    'active' => request()->routeIs('roles.*'),
                ] : null,
            ])),
        ],
    ];
    $menu = array_values(array_filter($menu, fn ($group) => count($group['items']) > 0));

    $pageData = match ($currentPageKey) {
        'dashboard' => [
            'totalSales' => $totalSales ?? 0,
            'rawTotalSales' => $rawTotalSales ?? 0,
            'totalPurchase' => $totalPurchase ?? 0,
            'profit' => $profit ?? 0,
            'totalTransactions' => $totalTransactions ?? 0,
            'salesPerMonth' => $salesPerMonth ?? [],
            'projectTargets' => $projectTargets ?? [],
            'currentCash' => $currentCash ?? 0,
            'growthIncome' => $growthIncome ?? 0,
            'growthExpense' => $growthExpense ?? 0,
            'growthProfit' => $growthProfit ?? 0,
            'routes' => [
                'events' => route('schedule.events'),
                'store' => route('schedule.store'),
                'base' => url('/schedule'),
            ],
        ],
        'products' => [
            'routes' => [
                'data' => route('products.data'),
            ],
            'childProducts' => \App\Models\Product::where('unit', 'pcs')->get(['id', 'name', 'sku']),
        ],
        'penjualan' => [
            'products' => collect($products ?? [])->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sell_price' => $product->sell_price,
                'cost_price' => $product->cost_price,
                'unit' => $product->unit,
            ])->values(),
            'cashAccounts' => collect($cashAccounts ?? [])->map(fn ($account) => [
                'id' => $account->id,
                'name' => $account->name,
            ])->values(),
            'routes' => [
                'data' => route('penjualan.data'),
                'store' => route('sales.store'),
            ],
        ],
        'pembelian' => [
            'products' => collect($products ?? [])->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sell_price' => $product->sell_price,
                'cost_price' => $product->cost_price,
                'unit' => $product->unit,
            ])->values(),
            'cashAccounts' => collect($cashAccounts ?? [])->map(fn ($account) => [
                'id' => $account->id,
                'name' => $account->name,
            ])->values(),
            'routes' => [
                'data' => route('pembelian.data'),
                'store' => route('purchases.store'),
            ],
        ],
        'cash' => [
            'routes' => [
                'data' => route('cash.accounts'),
                'store' => route('cash.accounts.store'),
            ],
        ],
        'cash-transactions' => [
            'account' => [
                'id' => $account->id ?? null,
                'name' => $account->name ?? '-',
            ],
            'routes' => [
                'data' => isset($account) ? route('cash.transactions', $account->id) : route('cash.accounts'),
                'store' => route('cash.transactions.store'),
            ],
        ],
        'projects' => [
            'cashAccounts' => \App\Models\CashAccount::get(['id', 'name', 'balance']),
            'routes' => [
                'data' => route('projects.data'),
            ],
        ],
        'reports' => [
            'from' => now()->startOfMonth()->format('Y-m-d'),
            'to' => now()->endOfMonth()->format('Y-m-d'),
            'routes' => [
                'data' => route('reports.stock.data'),
            ],
        ],
        'roles' => [
            'roles' => collect($roles ?? [])->map(fn ($role) => [
                'id' => $role->id,
                'name' => ucfirst($role->name),
                'users_count' => $role->users_count ?? $role->users?->count() ?? 0,
                'permissions_count' => $role->permissions_count ?? $role->permissions?->count() ?? 0,
                'users' => collect($role->users ?? [])->map(fn ($roleUser) => [
                    'id' => $roleUser->id,
                    'name' => $roleUser->name,
                    'foto_profile_url' => $roleUser->foto_profile_url,
                ])->values(),
            ])->values(),
            'permissions' => collect($permissions ?? [])->map(fn ($permission) => [
                'name' => $permission->name,
                'label' => str_replace('.', ' · ', $permission->name),
            ])->values(),
            'users' => collect($users ?? [])->map(fn ($roleUser) => [
                'id' => $roleUser->id,
                'name' => $roleUser->name,
                'email' => $roleUser->email,
            ])->values(),
            'routes' => [
                'datatable' => route('roles.datatable'),
                'addUser' => route('roles.addUser'),
            ],
        ],
        'roles-user' => [
            'user' => [
                'id' => $profileUser->id ?? null,
                'name' => $profileUser->name ?? '-',
                'email' => $profileUser->email ?? '-',
                'username' => $profileUser->username ?? '',
                'phone_number' => $profileUser->phone_number ?? '',
                'perumahan' => $profileUser->perumahan ?? '',
                'blok_rumah' => $profileUser->blok_rumah ?? '',
                'no_rumah' => $profileUser->no_rumah ?? '',
                'foto_profile_url' => $profileUser->foto_profile_url ?? null,
                'foto_rumah_url' => $profileUser->foto_rumah_url ?? null,
                'joined_at' => $profileUser?->created_at?->format('d M Y'),
                'status_label' => match ($profileUser->status ?? 2) {
                    1 => 'Pending',
                    2 => 'Active',
                    3 => 'Inactive',
                    default => 'Active',
                },
                'roles' => collect($roles ?? $profileUser?->roles ?? [])->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ])->values(),
            ],
            'routes' => [
                'updateProfile' => $profileUser ? route('users.updateProfile', $profileUser->id) : '#',
                'updatePhotoProfile' => $profileUser ? route('users.updatePhotoProfile', $profileUser->id) : '#',
                'updatePhotoHouse' => $profileUser ? route('users.updatePhotoHouse', $profileUser->id) : '#',
            ],
        ],
        'journals' => [
            'routes' => [
                'data' => route('journals.data'),
            ],
        ],
        'journals-show' => [
            'journal' => [
                'id' => $journal->id ?? null,
                'memo' => $journal->memo ?? null,
                'date_label' => isset($journal) ? date('d-m-Y', strtotime($journal->date)) : '-',
                'reference_label' => isset($journal) && $journal->reference_type
                    ? $journal->reference_type . ' #' . $journal->reference_id
                    : '-',
            ],
            'routes' => [
                'lines' => isset($journal) ? route('journals.lines.data', $journal->id) : '#',
            ],
        ],
        default => [],
    };

    $bootstrap = [
        'csrfToken' => csrf_token(),
        'logoutUrl' => route('logout'),
        'currentRoute' => $routeName,
        'pageKey' => $currentPageKey,
        'authUser' => [
            'id' => $authUser?->id,
            'name' => $authUser?->name,
            'email' => $authUser?->email,
            'avatar' => $authUser?->foto_profile_url ?: asset('be_view/assets/img/avatars/default.png'),
            'profileUrl' => $authUser ? route('roles.users.show', $authUser->id) : '#',
        ],
        'permissions' => $authUser?->getAllPermissions()->pluck('name')->values() ?? [],
        'flash' => [
            'success' => session('success'),
            'error' => session('error'),
        ],
        'initialTheme' => 'light',
        'menu' => $menu,
        'pageData' => $pageData,
    ];
@endphp

<body class="admin-shell min-h-screen bg-background text-foreground antialiased">
    <div id="admin-root"></div>
    <script>
        window.__ADMIN_BOOTSTRAP__ = {!! \Illuminate\Support\Js::from($bootstrap) !!};
    </script>
</body>

</html>
