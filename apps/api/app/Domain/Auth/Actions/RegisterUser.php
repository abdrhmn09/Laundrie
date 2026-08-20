<?php

namespace App\Domain\Auth\Actions;

use App\Domain\Auth\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterUser
{
    public function execute(array $data): User
    {
        $role = $data['role'] ?? UserRole::Customer->value;

        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => $role,
            'status' => $role === UserRole::Admin->value
                ? 'pending_verification'
                : 'active',
            'remember_token' => Str::random(60),
        ]);
    }
}