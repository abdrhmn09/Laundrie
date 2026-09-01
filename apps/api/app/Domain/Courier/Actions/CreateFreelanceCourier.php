<?php

namespace App\Domain\Courier\Actions;

use App\Models\Courier;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CreateFreelanceCourier
{
    public function execute(User $user, array $data): Courier
    {
        if ($user->courierProfile()->exists()) {
            throw ValidationException::withMessages(['courier' => ['Anda sudah memiliki profil courier.']]);
        }

        // Freelance must have laundry_id NULL per Schema §4.6
        return Courier::create([
            'user_id'      => $user->id,
            'laundry_id'   => null,
            'courier_type' => 'freelance',
            'vehicle_type' => $data['vehicle_type'] ?? 'motor',
            'service_area' => $data['service_area'] ?? null,
            'payout_info'  => $data['payout_info'] ?? null,
            'status'       => 'PENDING',
        ]);
    }
}
