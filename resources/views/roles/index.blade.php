@extends('layouts.admin')

@section('title')
<title>User Management - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
    <h4 class="mb-1">Roles List</h4>

    <p class="mb-6">
        A role provides access to predefined menus and features so that depending on assigned role,
        an administrator can have access to what the user needs.
    </p>

    <!-- Role cards -->
    <div class="row g-6">

        {{-- LOOP CARD ROLE --}}
        @foreach ($roles as $role)
        <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="card h-100 shadow-sm">
                <div class="card-body d-flex flex-column justify-content-between">

                    {{-- Bagian atas: total user + avatar --}}
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="fw-normal mb-0 text-muted">
                            {{ $role->users_count ?? 0 }} Users
                        </h6>

                        {{-- Avatar Group --}}
                        @if ($role->users && $role->users->count() > 0)
                        <ul class="list-unstyled d-flex align-items-center avatar-group mb-0">
                            @foreach ($role->users->take(4) as $user)
                            <li data-bs-toggle="tooltip" data-bs-placement="top" title="{{ $user->name }}"
                                class="avatar pull-up">
                                <img class="rounded-circle"
                                    src="{{ $user->avatar_url ?? asset('be_view/assets/img/avatars/1.png') }}"
                                    alt="{{ $user->name }}" />
                            </li>
                            @endforeach
                        </ul>
                        @else
                        <small class="text-muted">No users</small>
                        @endif
                    </div>

                    {{-- Bagian bawah: nama role + actions --}}
                    <div class="d-flex justify-content-between align-items-end">
                        <div>
                            <h5 class="mb-2">{{ ucfirst($role->name) }}</h5>

                            {{-- Action Buttons --}}
                            <div class="d-flex gap-2">
                                {{-- Edit Permissions --}}
                                <button class="btn btn-sm btn-outline-primary role-edit-modal"
                                    data-role-id="{{ $role->id }}" data-role-name="{{ $role->name }}"
                                    data-bs-toggle="modal" data-bs-target="#editRoleModal">
                                    <i class="bx bx-cog me-1"></i> Edit Permissions
                                </button>

                                {{-- Tambah User --}}
                                <button class="btn btn-sm btn-outline-success add-user-to-role"
                                    data-role-id="{{ $role->id }}" data-role-name="{{ $role->name }}"
                                    data-bs-toggle="modal" data-bs-target="#addUserToRoleModal">
                                    <i class="bx bx-user-plus me-1"></i> Tambah User
                                </button>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
        @endforeach

        {{-- CARD ADD ROLE --}}
        <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="card h-100">
                <div class="row h-100">
                    <div class="col-sm-5">
                        <div class="d-flex align-items-end h-100 justify-content-center mt-sm-0 mt-4 ps-6">
                            <img src="{{ asset('be_view/assets/img/illustrations/lady-with-laptop-light.png') }}"
                                class="img-fluid" alt="Image" width="120"
                                data-app-light-img="illustrations/lady-with-laptop-light.png"
                                data-app-dark-img="illustrations/lady-with-laptop-dark.png" />
                        </div>
                    </div>
                    <div class="col-sm-7">
                        <div class="card-body text-sm-end text-center ps-sm-0">
                            <button data-bs-target="#addRoleModal" data-bs-toggle="modal"
                                class="btn btn-sm btn-primary mb-4 text-nowrap add-new-role">
                                Add New Role
                            </button>
                            <p class="mb-0">
                                Add new role, <br />
                                if it doesn't exist.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- TABLE USER ROLE --}}
        <div class="col-12">
            <h4 class="mt-6 mb-1">Total users with their roles</h4>
            <p class="mb-0">Find all of your company’s administrator accounts and their associated roles.</p>
        </div>

        <div class="col-12">
            <div class="card">
                <div class="card-datatable table-responsive">
                    <table class="datatables-users table border-top">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th>User</th>
                                <th>Role</th>
                                <th>Plan</th>
                                <th>Billing</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>

    </div>
    <!--/ Role cards -->


    <!-- Modal Tambah User ke Role -->
    <div class="modal fade" id="addUserToRoleModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-simple">
            <div class="modal-content">
                <div class="modal-body">
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div class="text-center mb-4">
                        <h4 class="mb-2">Tambah User ke Role</h4>
                        <p>Pilih user yang ingin diberi role ini</p>
                    </div>

                    <form id="addUserToRoleForm" method="POST" action="{{ route('roles.addUser') }}">
                        @csrf
                        <input type="hidden" name="role_id" id="addUserRoleId">

                        <div class="mb-3">
                            <label class="form-label">Pilih User</label>
                            <select name="user_id" id="user_id" class="form-select" required>
                                <option value="">-- Pilih User --</option>
                                @foreach($users as $user)
                                <option value="{{ $user->id }}">{{ $user->name }} ({{ $user->email }})</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="text-center">
                            <button type="submit" class="btn btn-primary">
                                <i class="bx bx-user-check me-1"></i> Simpan
                            </button>
                            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
                                <i class="bx bx-x me-1"></i> Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Role Modal -->
    <div class="modal fade" id="addRoleModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-simple modal-dialog-centered modal-add-new-role">
            <div class="modal-content">
                <div class="modal-body">
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div class="text-center mb-6">
                        <h4 class="role-title mb-2">Add New Role</h4>
                        <p>Set role permissions</p>
                    </div>

                    <form id="addRoleForm" class="row g-4" method="POST" action="{{ route('roles.store') }}">
                        @csrf
                        <input type="hidden" name="role_id" id="addRoleId">

                        <!-- Role Name -->
                        <div class="col-12">
                            <label class="form-label fw-semibold" for="addModalRoleName">Nama Role</label>
                            <input type="text" id="addModalRoleName" name="name" class="form-control"
                                placeholder="Contoh: Bendahara, Admin, Kasir" required />
                        </div>

                        <!-- Permissions -->
                        <div class="col-12">
                            <h5 class="mb-3 fw-bold text-primary">Hak Akses (Permissions)</h5>
                            <div class="table-responsive border rounded">
                                <table class="table table-flush-spacing mb-0 align-middle">
                                    <tbody>
                                        <!-- Global Select All -->
                                        <tr class="bg-light">
                                            <td class="fw-medium ps-4">
                                                Akses Penuh
                                                <i class="bx bx-info-circle ms-1" data-bs-toggle="tooltip"
                                                    title="Centang untuk memberi akses penuh ke semua menu"></i>
                                            </td>
                                            <td class="text-end pe-4">
                                                <div class="form-check d-inline-flex align-items-center mb-0">
                                                    <input class="form-check-input" type="checkbox" id="selectAllAdd">
                                                    <label class="form-check-label ms-2 fw-medium" for="selectAllAdd">
                                                        Pilih Semua
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Grouped Permissions -->
                                        @foreach ($permissions->groupBy(fn($p) => Str::before($p->name, '.')) as $group
                                        =>
                                        $groupPermissions)
                                        <tr>
                                            <td class="fw-semibold ps-4">{{ ucfirst($group) }}</td>
                                            <td class="text-end pe-4">
                                                <div class="d-flex justify-content-end flex-wrap gap-3">
                                                    @foreach ($groupPermissions as $perm)
                                                    <div class="form-check mb-0">
                                                        <input class="form-check-input permission-checkbox"
                                                            type="checkbox" id="add_perm_{{ $perm->id }}"
                                                            name="permissions[]" value="{{ $perm->name }}">
                                                        <label class="form-check-label text-capitalize"
                                                            for="add_perm_{{ $perm->id }}">
                                                            {{ Str::after($perm->name, '.') }}
                                                        </label>
                                                    </div>
                                                    @endforeach
                                                </div>
                                            </td>
                                        </tr>
                                        @endforeach

                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="col-12 text-center mt-4">
                            <button type="submit" class="btn btn-primary me-2">
                                <i class="bx bx-save me-1"></i> Simpan
                            </button>
                            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
                                <i class="bx bx-x me-1"></i> Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Role Modal -->
    <div class="modal fade" id="editRoleModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-simple modal-dialog-centered modal-edit-role">
            <div class="modal-content">
                <div class="modal-body">
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div class="text-center mb-4">
                        <h4 class="role-title mb-1">Edit Role</h4>
                        <p>Update role name and permissions</p>
                    </div>

                    <form id="editRoleForm" class="row g-4" method="POST">
                        @csrf
                        @method('PUT')
                        <input type="hidden" name="role_id" id="editRoleId">

                        <!-- Role Name -->
                        <div class="col-12">
                            <label class="form-label fw-semibold" for="editModalRoleName">Nama Role</label>
                            <input type="text" id="editModalRoleName" name="name" class="form-control"
                                placeholder="Nama role" required />
                        </div>

                        <!-- Permissions -->
                        <div class="col-12">
                            <h5 class="mb-3 fw-bold text-primary">Hak Akses (Permissions)</h5>
                            <div class="table-responsive border rounded">
                                <table class="table table-flush-spacing mb-0 align-middle">
                                    <tbody>
                                        <!-- Global Select All -->
                                        <tr class="bg-light">
                                            <td class="fw-medium ps-4">
                                                Akses Penuh
                                                <i class="bx bx-info-circle ms-1" data-bs-toggle="tooltip"
                                                    title="Centang untuk memberi akses penuh ke semua menu"></i>
                                            </td>
                                            <td class="text-end pe-4">
                                                <div class="form-check d-inline-flex align-items-center mb-0">
                                                    <input class="form-check-input" type="checkbox" id="selectAllEdit">
                                                    <label class="form-check-label ms-2 fw-medium" for="selectAllEdit">
                                                        Pilih Semua
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Loop Permissions -->
                                        @foreach ($permissions->groupBy(fn($p) => Str::before($p->name, '.')) as $group
                                        =>
                                        $groupPermissions)
                                        <tr>
                                            <td class="fw-semibold ps-4">{{ ucfirst($group) }}</td>
                                            <td class="text-end pe-4">
                                                <div class="d-flex justify-content-end flex-wrap gap-3">
                                                    @foreach ($groupPermissions as $perm)
                                                    <div class="form-check mb-0">
                                                        <input class="form-check-input permission-checkbox"
                                                            type="checkbox" id="edit_perm_{{ $perm->id }}"
                                                            name="permissions[]" value="{{ $perm->name }}">
                                                        <label class="form-check-label text-capitalize"
                                                            for="edit_perm_{{ $perm->id }}">
                                                            {{ Str::after($perm->name, '.') }}
                                                        </label>
                                                    </div>
                                                    @endforeach
                                                </div>
                                            </td>
                                        </tr>
                                        @endforeach

                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="col-12 text-center mt-4">
                            <button type="submit" class="btn btn-primary me-2">
                                <i class="bx bx-save me-1"></i> Simpan Perubahan
                            </button>
                            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
                                <i class="bx bx-x me-1"></i> Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>


@endsection

@push('scripts')
@vite('resources/js/roles.js')

{{-- Notifikasi toastr --}}
@if (session('success'))
<script>
    window.addEventListener('load', () => {
        toastr.success("{{ session('success') }}");
    });
</script>

@endif

@endpush