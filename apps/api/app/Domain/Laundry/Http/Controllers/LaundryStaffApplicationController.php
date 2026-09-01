<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Domain\Laundry\Actions\ReviewStaffApplication;
use App\Domain\Laundry\Resources\StaffApplicationResource;
use App\Models\StaffApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LaundryStaffApplicationController extends \App\Http\Controllers\Controller
{
    private function assertManager(Request $request): \App\Models\Laundry
    {
        $laundry = $request->user()->ownedLaundry;
        if (! $laundry) {
            throw ValidationException::withMessages(['laundry' => ['Anda bukan Manager.']]);
        }
        return $laundry;
    }

    // GET /api/v1/laundry/staff-applications
    public function index(Request $request): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $apps = StaffApplication::with(['opening', 'applicant'])
            ->where('laundry_id', $laundry->id)
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));
        return StaffApplicationResource::collection($apps)->response();
    }

    // POST /api/v1/laundry/staff-applications/{id}/accept
    public function accept(Request $request, int $id, ReviewStaffApplication $action): JsonResponse
    {
        $app = StaffApplication::findOrFail($id);
        $result = $action->accept($request->user(), $app);
        return response()->json([
            'message'     => 'Lamaran diterima. Staff membership dibuat.',
            'application' => new StaffApplicationResource($result),
        ]);
    }

    // POST /api/v1/laundry/staff-applications/{id}/reject
    public function reject(Request $request, int $id, ReviewStaffApplication $action): JsonResponse
    {
        $app = StaffApplication::findOrFail($id);
        $result = $action->reject($request->user(), $app, $request->input('reason'));
        return response()->json([
            'message'     => 'Lamaran ditolak.',
            'application' => new StaffApplicationResource($result),
        ]);
    }
}
