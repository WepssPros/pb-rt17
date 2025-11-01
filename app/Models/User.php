<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles, HasApiTokens, HasFactory, HasProfilePhoto, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone_number',
        'perumahan',
        'blok_rumah',
        'no_rumah',
        'foto_rumah',
        'foto_profile',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    // 🟢 Ganti yang di-append dengan accessor URL
    protected $appends = [
        'profile_photo_url',
        'foto_profile_url',
        'foto_rumah_url',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // 🟢 Accessor foto rumah
    public function getFotoRumahUrlAttribute()
    {
        return $this->foto_rumah
            ? asset('storage/foto_rumah/' . $this->foto_rumah)
            : asset('assets/img/default-rumah.png');
    }

    // 🟢 Accessor foto profil
    public function getFotoProfileUrlAttribute()
    {
        return $this->foto_profile
            ? asset('storage/foto_profile/' . $this->foto_profile)
            : asset('assets/img/default-avatar.png');
    }
}
