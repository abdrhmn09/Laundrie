<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Models\Laundry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LaundryDiscoveryController extends \App\Http\Controllers\Controller
{
    // GET /api/v1/laundries — public discovery
    public function index(Request $request): JsonResponse
    {
        $query = Laundry::with(['services' => fn ($q) => $q->where('status', 'ACTIVE')->with(['prices' => fn ($qq) => $qq->whereNull('valid_until')])])
            ->where('status', 'ACTIVE');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'ilike', "%{$search}%")
                  ->orWhere('address_line', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('lat') && $request->filled('lng')) {
            $lat = (float) $request->input('lat');
            $lng = (float) $request->input('lng');
            // Simple haversine approximation — untuk MVP, urutkan by distance
            $query->selectRaw("*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) as distance", [$lat, $lng, $lat])
                ->orderBy('distance');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $laundries = $query->paginate($request->integer('per_page', 15));

        return response()->json($laundries);
    }

    // GET /api/v1/laundries/{id}
    public function show(int $id): JsonResponse
    {
        $laundry = Laundry::with(['services' => fn ($q) => $q->where('status', 'ACTIVE')->with(['prices' => fn ($qq) => $qq->whereNull('valid_until')])])
            ->where('status', 'ACTIVE')
            ->findOrFail($id);

        return response()->json(['laundry' => $laundry]);
    }
}
