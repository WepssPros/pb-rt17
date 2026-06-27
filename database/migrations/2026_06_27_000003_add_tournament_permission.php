<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $permission = Permission::firstOrCreate(['name' => 'akses tournament']);

        Role::where('name', 'Administrator')
            ->get()
            ->each(fn (Role $role) => $role->givePermissionTo($permission));
    }

    public function down(): void
    {
        Role::where('name', 'Administrator')
            ->get()
            ->each(fn (Role $role) => $role->revokePermissionTo('akses tournament'));
    }
};
