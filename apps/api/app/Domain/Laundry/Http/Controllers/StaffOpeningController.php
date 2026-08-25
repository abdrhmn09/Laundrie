<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Domain\Laundry\Actions\ApplyStaff;
use App\Domain\Laundry\Http\Requests\ApplyStaffRequest;
use App\Domain\Laundry\Resources\StaffApplicationResource;
use App\Domain\Laundry\Resources\StaffOpeningResource;
use App\Models\StaffOpening;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffOpeningController extends \App\Http\Controllers\Controller
{
    // GET /api/v1/staff-openings — public/open listings (PRD §9.3)
    public function index(Request $request): JsonResponse
    {
        $openings = StaffOpening::with('laundry')
            ->where('status', 'OPEN')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return StaffOpeningResource::collection($openings)->response();
    }

    // GET /api/v1/staff-openings/{id}
    public function show(int $id): JsonResponse
    {
        $opening = StaffOpening::with('laundry')->findOrFail($id);
        return response()->json(['opening' => new StaffOpeningResource($opening)]);
    }

    // POST /api/v1/staff-openings/{openingId}/apply
    public function apply(ApplyStaffRequest $request, int $openingId, ApplyStaff $action): JsonResponse
    {
        $user = $request->user();
        $opening = StaffOpening::findOrFail($openingId);

        $app = $action->execute($user, $opening, $request->validated());
        $app->load(['opening', 'laundry']);

        return response()->json([
            'message'     => $request->input('application_type') === 'staff_courier'
                ? 'Lamaran Staff + Courier dikirim. Menunggu Manager menerima.'
                : 'Lamaran Staff dikirim. Menunggu Manager menerima.',
            'application' => new StaffApplicationResource($app),
        ], 201);
    }
}
