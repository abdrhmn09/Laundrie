<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Domain\Laundry\Actions\CreateLaundry;
use App\Domain\Laundry\Http\Requests\CreateLaundryRequest;
use App\Domain\Laundry\Resources\LaundryResource;
use App\Domain\Auth\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileLaundryController extends \App\Http\Controllers\Controller
{
    public function store(CreateLaundryRequest $request, CreateLaundry $action): JsonResponse
    {
        $user = $request->user();
        $laundry = $action->execute($user, $request->validated());

        // Refresh user capabilities after creation
        $user->refresh();

        return response()->json([
            'message' => 'Laundry berhasil dibuat. Anda otomatis menjadi Owner/Manager.',
            'laundry' => new LaundryResource($laundry),
            'user'    => new UserResource($user),
        ], 201);
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $laundry = $user->ownedLaundry;

        if (! $laundry) {
            return response()->json(['message' => 'Anda belum memiliki laundry.'], 404);
        }

        return response()->json([
            'laundry' => new LaundryResource($laundry),
        ]);
    }

    public function options(Request $request): JsonResponse
    {
        $user = $request->user()->load(['ownedLaundry', 'staffMemberships.laundry', 'courierProfile', 'adminUser']);

        // PRD §7.1 Capability Hub options
        $options = [
            'can_create_laundry'   => ! $user->isManager(),
            'can_join_as_staff'    => ! $user->isStaff(),
            'can_register_courier' => ! $user->isCourier(),
            'capabilities'         => (new UserResource($user))->toArray($request)['capabilities'] ?? [],
        ];

        return response()->json([
            'user'    => new UserResource($user),
            'options' => $options,
        ]);
    }
}
