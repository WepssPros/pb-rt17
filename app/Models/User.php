<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
    use HasApiTokens;
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

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

    protected $appends = [
        'profile_photo_url',
        'foto_profile',
        'foto_rumah'
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function getFotoRumahUrlAttribute()
    {
        return $this->foto_rumah
            ? asset('storage/foto_rumah/' . $this->foto_rumah)
            : null;
    }

    public function getFotoProfileUrlAttribute()
    {
        return $this->foto_profile
            ? asset('storage/foto_profile/' . $this->foto_profile)
            : null;
    }   
}
