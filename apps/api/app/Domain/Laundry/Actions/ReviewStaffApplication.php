<?php

namespace App\Domain\Laundry\Actions;

use App\Models\Staff;
use App\Models\StaffApplication;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewStaffApplication
{
    public function accept(User $manager, StaffApplication $app): StaffApplication
    {
        $this->assertManager($manager, $app);

        if ($app->status !== 'PENDING') {
            throw ValidationException::withMessages(['status' => ['Lamaran sudah diproses.']]);
        }

        return DB::transaction(function () use ($app, $manager) {
            $app->update([
                'status'      => 'ACCEPTED',
                'reviewed_at' => now(),
                'reviewed_by' => $manager->id,
            ]);

            // Create staff membership per PRD §10.2
            Staff::firstOrCreate(
                ['user_id' => $app->user_id, 'laundry_id' => $app->laundry_id],
                ['role' => 'STAFF', 'status' => 'ACTIVE']
            );

            // For staff_courier, courier profile will be created via Courier domain after vehicle data.
            // Here we just mark application accepted; frontend will prompt to complete courier onboarding.

            return $app->refresh();
        });
    }

    public function reject(User $manager, StaffApplication $app, ?string $reason = null): StaffApplication
    {
        $this->assertManager($manager, $app);
        if ($app->status !== 'PENDING') {
            throw ValidationException::withMessages(['status' => ['Lamaran sudah diproses.']]);
        }
        $app->update([
            'status'      => 'REJECTED',
            'reviewed_at' => now(),
            'reviewed_by' => $manager->id,
        ]);
        return $app;
    }

    private function assertManager(User $user, StaffApplication $app): void
    {
        $laundry = $app->laundry;
        if (! $laundry || $laundry->user_id !== $user->id) {
            throw ValidationException::withMessages(['laundry' => ['Hanya Manager laundry tersebut yang dapat memutuskan lamaran.']]);
        }
    }
}
