<?php

namespace App\Domain\Courier\Http\Controllers;

use App\Domain\Auth\Resources\UserResource;
use App\Domain\Courier\Actions\CreateFreelanceCourier;
use App\Domain\Courier\Actions\CreateLaundryStaffCourier;
use App\Domain\Courier\Http\Requests\CreateFreelanceCourierRequest;
use App\Domain\Courier\Resources\CourierResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileCourierController extends \App\Http\Controllers\Controller
{
    // POST /api/v1/profile/courier/freelance
    public function storeFreelance(CreateFreelanceCourierRequest $request, CreateFreelanceCourier $action): JsonResponse
    {
        $courier = $action->execute($request->user(), $request->validated());
        $request->user()->refresh();

        return response()->json([
            'message' => 'Pendaftaran Freelance Courier berhasil. Menunggu verifikasi (PENDING → VERIFIED).',
            'courier' => new CourierResource($courier),
            'user'    => new UserResource($request->user()),
        ], 201);
    }

    // POST /api/v1/profile/courier/staff
    public function storeStaff(Request $request, CreateLaundryStaffCourier $action): JsonResponse
    {
        $request->validate([
            'laundry_id'   => ['sometimes', 'integer', 'exists:laundries,id'],
            'vehicle_type' => ['sometimes', 'string', 'max:30'],
            'service_area' => ['nullable', 'array'],
        ]);

        $courier = $action->execute($request->user(), $request->only(['laundry_id', 'vehicle_type', 'service_area']));
        $request->user()->refresh();

        return response()->json([
            'message' => 'Profil Staff Courier berhasil dibuat. Courier laundry_staff terikat pada laundry tersebut.',
            'courier' => new CourierResource($courier),
            'user'    => new UserResource($request->user()),
        ], 201);
    }
}
