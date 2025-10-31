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
        $users = User::doesntHave('roles')->get(); // user tanpa role

        return view('roles.index', compact('roles', 'permissions', 'users'));
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
