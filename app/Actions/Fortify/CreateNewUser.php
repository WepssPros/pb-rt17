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
            'foto_rumah' => ['nullable', 'string'],
            'foto_profile' => ['nullable', 'string'],
            'terms' => Jetstream::hasTermsAndPrivacyPolicyFeature() ? ['accepted', 'required'] : '',
        ])->validate();

        // Pindahkan file tmp ke folder final
        $foto_rumah = $this->moveTempFile($input['foto_rumah'] ?? null, 'foto_rumah');
        $foto_profile = $this->moveTempFile($input['foto_profile'] ?? null, 'foto_profile');

        $user = User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'phone_number' => $input['phone_number'] ?? null,
            'perumahan' => $input['perumahan'] ?? null,
            'blok_rumah' => $input['blok_rumah'] ?? null,
            'no_rumah' => $input['no_rumah'] ?? null,
            'foto_rumah' => $foto_rumah,
            'foto_profile' => $foto_profile,
        ]);

        $user->assignRole('userpbrt');

        return $user;
    }

    private function moveTempFile(?string $filename, string $type): ?string
    {
        if (!$filename) return null;

        $disk = 'public';
        $tmpPath = "tmp/{$type}/{$filename}";
        $finalFolder = $type; // foto_profile atau foto_rumah
        $finalPath = "{$finalFolder}/{$filename}";

        if (!Storage::disk($disk)->exists($tmpPath)) {
            return null; // file tidak ada
        }

        if (!Storage::disk($disk)->exists($finalFolder)) {
            Storage::disk($disk)->makeDirectory($finalFolder);
        }

        Storage::disk($disk)->move($tmpPath, $finalPath);

        return $filename;
    }
}
