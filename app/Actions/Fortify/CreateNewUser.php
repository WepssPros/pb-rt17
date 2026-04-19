<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Jetstream\Jetstream;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
            'phone_number' => ['nullable', 'string', 'max:20'],
            'perumahan' => ['nullable', 'string', 'max:255'],
            'blok_rumah' => ['nullable', 'string', 'max:10'],
            'no_rumah' => ['nullable', 'string', 'max:10'],
            'foto_rumah' => ['nullable', 'image', 'max:20480'], // 20MB
            'foto_profile' => ['nullable', 'image', 'max:20480'], // 20MB
            'terms' => Jetstream::hasTermsAndPrivacyPolicyFeature() ? ['accepted', 'required'] : '',
        ])->validate();

        $foto_rumah_path = null;
        if (isset($input['foto_rumah']) && $input['foto_rumah'] instanceof \Illuminate\Http\UploadedFile) {
            $foto_rumah_path = $input['foto_rumah']->hashName();
            $input['foto_rumah']->storeAs('foto_rumah', $foto_rumah_path, 'public');
        }

        $foto_profile_path = null;
        if (isset($input['foto_profile']) && $input['foto_profile'] instanceof \Illuminate\Http\UploadedFile) {
            $foto_profile_path = $input['foto_profile']->hashName();
            $input['foto_profile']->storeAs('foto_profile', $foto_profile_path, 'public');
        }

        $user = User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'phone_number' => $input['phone_number'] ?? null,
            'perumahan' => $input['perumahan'] ?? null,
            'blok_rumah' => $input['blok_rumah'] ?? null,
            'no_rumah' => $input['no_rumah'] ?? null,
            'foto_rumah' => $foto_rumah_path,
            'foto_profile' => $foto_profile_path,
        ]);

        $user->assignRole('userpbrt');

        return $user;
    }
}
