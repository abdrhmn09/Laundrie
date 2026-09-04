<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Models\Courier;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LaundryCourierController extends \App\Http\Controllers\Controller
{
    private function assertManager(Request $request): \App\Models\Laundry
    {
        $laundry = $request->user()->ownedLaundry;
        if (! $laundry) {
            throw ValidationException::withMessages(['laundry' => ['Anda bukan Manager.']]);
        }
        return $laundry;
    }

    // POST /api/v1/laundry/staff/{staffId}/courier — aktifkan staff sebagai courier laundry_staff
    public function activateStaffCourier(Request $request, int $staffId): JsonResponse
    {
        $laundry = $this->assertManager($request);

        $request->validate([
            'vehicle_type' => ['sometimes', 'string', 'max:30'],
            'service_area' => ['sometimes', 'array'],
        ]);

        $staff = Staff::where('id', $staffId)->where('laundry_id', $laundry->id)->firstOrFail();
        $user = $staff->user;

        if (!$user) {
            return response()->json(['message' => 'User staff tidak ditemukan.'], 404);
        }

        if ($user->courierProfile()->exists()) {
            throw ValidationException::withMessages(['courier' => ['User sudah memiliki profil courier.']]);
        }

        $courier = Courier::create([
            'user_id' => $user->id,
            'laundry_id' => $laundry->id,
            'courier_type' => 'laundry_staff',
            'vehicle_type' => $request->input('vehicle_type', 'motor'),
            'service_area' => $request->input('service_area'),
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'message' => 'Staff berhasil diaktifkan sebagai Courier (laundry_staff).',
            'courier' => $courier,
        ], 201);
    }

    // DELETE /api/v1/laundry/couriers/{id} — nonaktifkan courier staff
    public function deactivate(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $courier = Courier::where('id', $id)->where('laundry_id', $laundry->id)->where('courier_type', 'laundry_staff')->firstOrFail();
        $courier->delete();

        return response()->json(['message' => 'Courier staff dinonaktifkan.']);
    }

    // GET /api/v1/laundry/couriers — list courier untuk laundry manager
    public function index(Request $request): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $couriers = Courier::with('user')
            ->where('laundry_id', $laundry->id)
            ->where('courier_type', 'laundry_staff')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($couriers);
    }
}
