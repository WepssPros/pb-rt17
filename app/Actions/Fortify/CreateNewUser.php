<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Jetstream\Jetstream;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
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
            'foto_rumah' => ['nullable', 'string'], // simpan nama file atau path
            'foto_profile' => ['nullable', 'string'], // simpan nama file atau path
            'terms' => Jetstream::hasTermsAndPrivacyPolicyFeature() ? ['accepted', 'required'] : '',
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'phone_number' => $input['phone_number'] ?? null,
            'perumahan' => $input['perumahan'] ?? null,
            'blok_rumah' => $input['blok_rumah'] ?? null,
            'no_rumah' => $input['no_rumah'] ?? null,
            'foto_rumah' => $input['foto_rumah'] ?? null,
            'foto_profile' => $input['foto_profile'] ?? null,
        ]);

        // Assign role "User PBRT"
        $user->assignRole('userpbrt');

        return $user;
    }
}
