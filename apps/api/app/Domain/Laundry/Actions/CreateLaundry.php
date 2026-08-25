<?php

namespace App\Domain\Laundry\Actions;

use App\Models\Laundry;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateLaundry
{
    public function execute(User $user, array $data): Laundry
    {
        // PRD §8 + Schema §4.7: one user max 1 laundry, user_id unique
        if ($user->ownedLaundry()->exists()) {
            throw ValidationException::withMessages([
                'business_name' => ['Anda sudah memiliki laundry. Satu user hanya boleh memiliki satu laundry.'],
            ]);
        }

        return DB::transaction(function () use ($user, $data) {
            $laundry = Laundry::create([
                'user_id'         => $user->id,
                'business_name'   => $data['business_name'],
                'legal_name'      => $data['legal_name'] ?? null,
                'address_line'    => $data['address_line'],
                'latitude'        => $data['latitude'] ?? null,
                'longitude'       => $data['longitude'] ?? null,
                'operating_hours' => $data['operating_hours'] ?? null,
                'capacity_config' => $data['capacity_config'] ?? null,
                'contact_phone'   => $data['contact_phone'],
                'contact_email'   => $data['contact_email'] ?? $user->email,
                'status'          => 'PENDING',
            ]);

            // Ensure customer profile exists per Schema §4.2
            if (! $user->customer()->exists()) {
                $user->customer()->create([
                    'name'  => $user->name,
                    'phone' => $user->phone ?? $data['contact_phone'],
                    'email' => $user->email,
                ]);
            }

            return $laundry;
        });
    }
}
