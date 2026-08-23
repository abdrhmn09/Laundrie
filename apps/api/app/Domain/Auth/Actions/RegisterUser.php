<?php

namespace App\Domain\Auth\Actions;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Auth\Enums\UserStatus;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegisterUser
{
    public function execute(array $data): User
    {
        $role = $data['role'] ?? UserRole::Customer->value;

        // Admin invitation code verification
        if (in_array($role, [UserRole::SuperAdmin->value, UserRole::OperationsAdmin->value, UserRole::FinanceAdmin->value], true)) {
            $code = trim($data['invitation_code'] ?? '');
            if (! in_array($code, ['LAUNDRIE-ADMIN-2026', 'LAUNDRIE-SECRET-2026'], true)) {
                throw ValidationException::withMessages([
                    'invitation_code' => ['Kode undangan internal admin tidak valid.'],
                ]);
            }
        }

        $onboardingDetails = null;
        if ($role === UserRole::Courier->value) {
            $onboardingDetails = [
                'vehicle_type' => $data['vehicle_type'] ?? null,
                'license_plate' => strtoupper($data['license_plate'] ?? ''),
                'sim_number' => $data['sim_number'] ?? null,
            ];
            $status = UserStatus::PendingVerification->value;
        } elseif (in_array($role, [UserRole::Manager->value, UserRole::Staff->value], true)) {
            $onboardingDetails = [
                'outlet_name' => $data['outlet_name'] ?? null,
                'outlet_address' => $data['outlet_address'] ?? null,
            ];
            $status = UserStatus::PendingVerification->value;
        } elseif (in_array($role, [UserRole::SuperAdmin->value, UserRole::OperationsAdmin->value, UserRole::FinanceAdmin->value], true)) {
            $onboardingDetails = [
                'invitation_code' => $data['invitation_code'] ?? null,
            ];
            $status = UserStatus::PendingVerification->value;
        } else {
            $status = UserStatus::EmailUnverified->value;
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => $role,
            'status' => $status,
            'onboarding_details' => $onboardingDetails,
            'remember_token' => Str::random(60),
        ]);

        if ($status === UserStatus::EmailUnverified->value) {
            event(new Registered($user));
        }

        return $user;
    }
}