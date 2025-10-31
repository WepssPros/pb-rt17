<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->after('name');
            $table->string('phone_number')->nullable()->after('username');
            $table->string('perumahan')->nullable()->after('phone_number');
            $table->string('blok_rumah')->nullable()->after('perumahan');
            $table->string('no_rumah')->nullable()->after('blok_rumah');
            $table->text('foto_rumah')->nullable()->after('no_rumah');
            $table->text('foto_profile')->nullable()->after('foto_rumah');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'phone_number',
                'perumahan',
                'blok_rumah',
                'no_rumah',
                'foto_rumah',
                'foto_profile'
            ]);
        });
    }
};
