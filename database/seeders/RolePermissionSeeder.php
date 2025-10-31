<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'akses dashboard',
            'akses master data',
            'akses stok shuttlecock',
            'akses penjualan',
            'akses pembelian',
            'akses kas transaksi',
            'akses jurnal umum',
            'akses laporan stok',
            'akses manajemen user',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Buat role bawaan
        $admin = Role::firstOrCreate(['name' => 'Administrator']);
        $bendahara = Role::firstOrCreate(['name' => 'Bendahara']);

        // Assign permission ke masing-masing role
        $admin->givePermissionTo(Permission::all());
        $bendahara->givePermissionTo([
            'akses kas transaksi',
            'akses jurnal umum',
            'akses laporan stok',
        ]);
    }
}
