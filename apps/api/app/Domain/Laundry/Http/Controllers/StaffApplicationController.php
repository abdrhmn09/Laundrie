<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Domain\Laundry\Resources\StaffApplicationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffApplicationController extends \App\Http\Controllers\Controller
{
    // GET /api/v1/me/staff-applications — own applications (Architecture §9.2.x)
    public function index(Request $request): JsonResponse
    {
        $apps = $request->user()->staffApplications()
            ->with(['opening', 'laundry'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return StaffApplicationResource::collection($apps)->response();
    }

    // POST /api/v1/staff-applications/{id}/withdraw
    public function withdraw(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $app = $user->staffApplications()->where('id', $id)->firstOrFail();

        if ($app->status !== 'PENDING') {
            return response()->json(['message' => 'Hanya lamaran PENDING yang dapat ditarik.'], 422);
        }

        $app->update(['status' => 'WITHDRAWN']);

        return response()->json([
            'message'     => 'Lamaran berhasil ditarik.',
            'application' => new StaffApplicationResource($app),
        ]);
    }
}
