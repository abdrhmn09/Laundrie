<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Domain\Laundry\Http\Requests\CreateStaffOpeningRequest;
use App\Domain\Laundry\Resources\StaffOpeningResource;
use App\Models\StaffOpening;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LaundryStaffOpeningController extends \App\Http\Controllers\Controller
{
    private function assertManager(Request $request): \App\Models\Laundry
    {
        $user = $request->user();
        $laundry = $user->ownedLaundry;
        if (! $laundry) {
            throw ValidationException::withMessages(['laundry' => ['Anda bukan Manager. Buat laundry terlebih dahulu.']]);
        }
        return $laundry;
    }

    // POST /api/v1/laundry/staff-openings
    public function store(CreateStaffOpeningRequest $request): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'OPEN';
        $opening = $laundry->openings()->create($data);
        $opening->refresh();
        return response()->json([
            'message' => 'Lowongan Staff berhasil dibuat.',
            'opening' => new StaffOpeningResource($opening),
        ], 201);
    }

    // PATCH /api/v1/laundry/staff-openings/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $opening = $laundry->openings()->findOrFail($id);
        $opening->update($request->validate([
            'title'       => ['sometimes', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'quota'       => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]));
        return response()->json([
            'message' => 'Lowongan diperbarui.',
            'opening' => new StaffOpeningResource($opening),
        ]);
    }

    // POST /api/v1/laundry/staff-openings/{id}/close
    public function close(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $opening = $laundry->openings()->findOrFail($id);
        $opening->update(['status' => 'CLOSED']);
        return response()->json([
            'message' => 'Lowongan ditutup.',
            'opening' => new StaffOpeningResource($opening),
        ]);
    }

    // GET /api/v1/laundry/staff-openings (optional for manager)
    public function index(Request $request): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $openings = $laundry->openings()->orderByDesc('created_at')->paginate($request->integer('per_page', 15));
        return StaffOpeningResource::collection($openings)->response();
    }
}
