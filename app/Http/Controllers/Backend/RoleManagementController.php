<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;

class RoleManagementController extends Controller
{
    public function index()
    {
        $roles = Role::withCount('users')->get(); // ambil semua role + jumlah user
        $permissions = Permission::all(); // ambil semua permission
        $users = User::whereDoesntHave('roles', function ($q) {
            $q->where('guard_name', 'userpbrt');
        })->get();

        return view('roles.index', compact('roles', 'permissions', 'users'));
    }

    public function datatable(Request $request)
    {
        $query = User::with('roles'); // kalau pakai Spatie Roles; kalau nggak, hapus aja with('roles')

        // total sebelum filter
        $recordsTotal = $query->count();

        // global search (kolom name & email misalnya)
        if ($search = $request->input('search.value')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // total sesudah filter
        $recordsFiltered = $query->count();

        // order
        $orderColumnIndex = $request->input('order.0.column', 2); // default: kolom 2 (full_name)
        $orderDir         = $request->input('order.0.dir', 'asc');

        // mapping index kolom → kolom DB sebenar
        // sesuaikan dengan struktur kamu
        $columns = [
            0 => 'id',    // control (nggak kepake)
            1 => 'id',    // checkbox (nggak kepake)
            2 => 'name',  // full_name
            3 => 'id',    // role (kalau mau lebih advance bisa join)
            4 => 'id',    // current_plan
            5 => 'id',    // billing
            6 => 'id',    // status
        ];

        $orderColumn = $columns[$orderColumnIndex] ?? 'name';
        $query->orderBy($orderColumn, $orderDir);

        // paging
        $start  = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        if ($length > 0) {
            $query->skip($start)->take($length);
        }

        $users = $query->get();

        $data = $users->map(function ($user) {
            // mapping ke field yang dipakai di JS kamu
            $roleName = method_exists($user, 'roles') && $user->roles->count()
                ? $user->roles->first()->name
                : 'User';

            return [
                'id'           => $user->id,
                'full_name'    => $user->name,           // ganti sesuai kolom kamu
                'email'        => $user->email,          // biar bisa dipakai di render
                'avatar'       => $user->avatar ?? null, // kalau nggak ada, boleh null
                'role'         => $roleName,
                'current_plan' => $user->current_plan ?? 'Free',  // sesuaikan
                'billing'      => $user->billing ?? 'Monthly',    // sesuaikan
                'status'       => $user->status ?? 2,             // 1=Pending,2=Active,3=Inactive
                'actions'      => '', // kalau mau, bisa isi Blade partial tombol edit/delete
            ];
        });

        return response()->json([
            'draw'            => intval($request->input('draw')),
            'recordsTotal'    => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data'            => $data,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return back()->with('success', 'Role berhasil dibuat!');
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions);

        return back()->with('success', 'Role berhasil diperbarui!');
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return back()->with('success', 'Role berhasil dihapus!');
    }

    public function addUser(Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        $user = \App\Models\User::findOrFail($request->user_id);

        $user->assignRole($role->name);

        // Jika request AJAX, return JSON
        if ($request->ajax()) {
            return response()->json([
                'success' => 'User berhasil ditambahkan ke role ' . ucfirst($role->name)
            ]);
        }

        // Jika bukan AJAX, redirect biasa
        return back()->with('success', 'User berhasil ditambahkan ke role ' . ucfirst($role->name));
    }


    public function getPermissions(Role $role)
    {
        // Ambil semua permission yang dimiliki role
        $permissions = $role->permissions()->pluck('name'); // ['users.create', 'users.edit', ...]

        return response()->json([
            'permissions' => $permissions
        ]);
    }
}
