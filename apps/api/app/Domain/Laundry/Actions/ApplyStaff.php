<?php

namespace App\Domain\Laundry\Actions;

use App\Models\StaffApplication;
use App\Models\StaffOpening;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ApplyStaff
{
    public function execute(User $user, StaffOpening $opening, array $data): StaffApplication
    {
        // Rule §54: Staff only created after ACCEPTED, but check not already staff
        if ($user->staffMemberships()->where('laundry_id', $opening->laundry_id)->exists()) {
            throw ValidationException::withMessages([
                'opening' => ['Anda sudah menjadi Staff di laundry ini.'],
            ]);
        }

        if (! $opening->isOpen()) {
            throw ValidationException::withMessages([
                'opening' => ['Lowongan sudah ditutup.'],
            ]);
        }

        // Prevent duplicate pending application for same opening
        $exists = StaffApplication::where('staff_opening_id', $opening->id)
            ->where('user_id', $user->id)
            ->where('status', 'PENDING')
            ->exists();
        if ($exists) {
            throw ValidationException::withMessages([
                'opening' => ['Anda sudah memiliki lamaran PENDING untuk lowongan ini.'],
            ]);
        }

        return StaffApplication::create([
            'staff_opening_id' => $opening->id,
            'laundry_id'       => $opening->laundry_id,
            'user_id'          => $user->id,
            'application_type' => $data['application_type'],
            'message'          => $data['message'] ?? null,
            'status'           => 'PENDING',
        ]);
    }
}
