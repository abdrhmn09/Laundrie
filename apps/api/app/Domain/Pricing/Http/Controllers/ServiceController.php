<?php

namespace App\Domain\Pricing\Http\Controllers;

use App\Domain\Pricing\Http\Requests\CreateServiceRequest;
use App\Domain\Pricing\Http\Requests\UpdatePriceRequest;
use App\Domain\Pricing\Resources\ServiceResource;
use App\Models\Service;
use App\Models\ServicePrice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServiceController extends \App\Http\Controllers\Controller
{
    private function assertManager(Request $request): \App\Models\Laundry
    {
        $laundry = $request->user()->ownedLaundry;
        if (! $laundry) {
            throw ValidationException::withMessages(['laundry' => ['Hanya Manager yang dapat mengelola layanan.']]);
        }
        return $laundry;
    }

    // GET /api/v1/services — public or for laundry, list active services
    public function index(Request $request): JsonResponse
    {
        $query = Service::with(['laundry', 'prices' => fn ($q) => $q->whereNull('valid_until')]);

        if ($request->filled('laundry_id')) {
            $query->where('laundry_id', $request->integer('laundry_id'));
        } elseif ($request->user()?->ownedLaundry) {
            $query->where('laundry_id', $request->user()->ownedLaundry->id);
        }

        $query->where('status', 'ACTIVE');

        $services = $query->orderBy('name')->paginate($request->integer('per_page', 15));

        return ServiceResource::collection($services)->response();
    }

    // GET /api/v1/services/{id}
    public function show(int $id): JsonResponse
    {
        $service = Service::with(['laundry', 'prices' => fn ($q) => $q->orderByDesc('valid_from')])->findOrFail($id);
        return response()->json(['service' => new ServiceResource($service)]);
    }

    // POST /api/v1/laundry/services — manager only
    public function store(CreateServiceRequest $request): JsonResponse
    {
        $laundry = $this->assertManager($request);

        $data = $request->validated();
        $data['laundry_id'] = $laundry->id;
        $data['status'] = $data['status'] ?? 'ACTIVE';

        $service = DB::transaction(function () use ($data) {
            $service = Service::create($data);

            // Buat service_price awal sebagai sumber kebenaran (Schema S5)
            ServicePrice::create([
                'service_id' => $service->id,
                'base_price' => $data['base_price'],
                'price_per_unit' => $data['price_per_unit'] ?? null,
                'minimum_charge' => $data['minimum_charge'] ?? 0,
                'valid_from' => now(),
                'valid_until' => null,
            ]);

            return $service->load('laundry');
        });

        return response()->json([
            'message' => 'Layanan berhasil dibuat.',
            'service' => new ServiceResource($service),
        ], 201);
    }

    // PATCH /api/v1/laundry/services/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $service = Service::where('id', $id)->where('laundry_id', $laundry->id)->firstOrFail();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'service_type' => ['sometimes', 'string', 'max:50'],
            'pricing_model' => ['sometimes', 'in:flat,per_weight,per_item'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
            'estimated_duration' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $service->update($data);

        return response()->json([
            'message' => 'Layanan diperbarui.',
            'service' => new ServiceResource($service),
        ]);
    }

    // POST /api/v1/laundry/services/{id}/prices — ubah harga (buat service_price baru)
    public function updatePrice(UpdatePriceRequest $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $service = Service::where('id', $id)->where('laundry_id', $laundry->id)->firstOrFail();

        $data = $request->validated();

        DB::transaction(function () use ($service, $data) {
            // Tutup harga lama
            ServicePrice::where('service_id', $service->id)
                ->whereNull('valid_until')
                ->update(['valid_until' => now()]);

            // Buat harga baru
            ServicePrice::create([
                'service_id' => $service->id,
                'base_price' => $data['base_price'],
                'price_per_unit' => $data['price_per_unit'] ?? null,
                'minimum_charge' => $data['minimum_charge'] ?? 0,
                'valid_from' => now(),
                'valid_until' => null,
            ]);

            // Sync ke services cache
            $service->update([
                'base_price' => $data['base_price'],
                'price_per_unit' => $data['price_per_unit'] ?? null,
                'minimum_charge' => $data['minimum_charge'] ?? 0,
            ]);
        });

        return response()->json([
            'message' => 'Harga berhasil diperbarui. Riwayat harga tersimpan.',
            'service' => new ServiceResource($service->fresh()->load('laundry')),
        ]);
    }

    // GET /api/v1/laundry/services/{id}/prices — riwayat harga
    public function priceHistory(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $service = Service::where('id', $id)->where('laundry_id', $laundry->id)->firstOrFail();

        $prices = ServicePrice::where('service_id', $service->id)
            ->orderByDesc('valid_from')
            ->paginate($request->integer('per_page', 15));

        return response()->json($prices);
    }

    // DELETE /api/v1/laundry/services/{id} — nonaktifkan
    public function destroy(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $service = Service::where('id', $id)->where('laundry_id', $laundry->id)->firstOrFail();
        $service->update(['status' => 'INACTIVE']);

        return response()->json(['message' => 'Layanan dinonaktifkan.']);
    }
}
